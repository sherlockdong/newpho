# Project audit and personalized study-plan proposal

Reviewed November 1, 2026. This is a source-code audit and implementation proposal; application behavior has not been changed. Existing local changes in `src/lib/useQuizDiagnostics.ts` and the untracked `src/utils/` directory were preserved and included in the review.

## What exists today

- Next.js App Router with Firebase Authentication and Firestore powering the active quiz and progress flows. A Supabase client exists, but no use of it was found in the active flow reviewed here.
- Topic pages contain curated study resources, quiz prompts, topic IDs, prerequisite maps, and repeated quiz UI.
- `useQuizDiagnostics` generates questions, grades answers locally, requests AI explanations, updates progress, and saves a history record.
- The current working-tree version of that hook saves node, track, difficulty, score, question-level answers, explanations, and elapsed time. This is a useful foundation for personalization; older records may contain much less.
- `src/app/study-plan/page.tsx` contains a fixed example plan. It does not read quiz history or generate a student-specific plan.
- `src/flow/analyzeProgress.ts` is an unreferenced progress-analysis helper; it is not connected to the study-plan page.

## Improvements that preserve educational content

| Priority | Finding and source | Proposed change |
| --- | --- | --- |
| First | Quiz submissions write `users/{uid}/analysisLogs` through `src/app/api/logs/route.ts`, while `src/app/quiz-history/page.tsx` and `src/app/user/page.tsx` read root-level `quizLogs`. Newly saved results therefore do not feed those screens through the current code. | Use the authenticated logs API as the common read path. Normalize historical shapes at the boundary. Inventory legacy records before migrating them; use stable source IDs so retries cannot duplicate history. |
| First | In `src/lib/useQuizDiagnostics.ts`, saving results and updating progress happen only after successful AI evaluation. An evaluation failure can prevent both writes despite answers already being graded. | Persist the completed attempt before requesting AI feedback. Store feedback status separately and permit retry. Use one stable attempt ID, and make attempt submission and progress application idempotent. |
| First | `src/app/api/generate/route.ts` does not verify a Firebase token or bound prompt size. `src/app/api/progress/route.ts` accepts prerequisite maps, unlock maps, and scores from the client. `src/app/api/logs/route.ts` accepts arbitrary log fields. | Authenticate generation; add per-user quotas and payload limits. Resolve curriculum rules on the server, validate allowed nodes and integer scores, and eventually grade against server-stored questions. Do not use client-controlled correctness as authoritative mastery evidence. |
| First | Fourteen URLs in the roadmap have no matching page; some refer to existing lessons under different names, while others have no corresponding lesson. | Repair URLs where the lesson exists. Keep unavailable nodes visible but non-navigable until there is a real destination. Derive roadmap and quiz configuration from one curriculum registry. |
| Next | The quiz hook defaults to three questions, while `src/lib/quizMastery.ts` requires at least five questions and 80% for mastery. | Keep short quizzes as useful checks, but explain eligibility before starting and offer a five-question mastery check. Do not silently lower the existing mastery threshold. |
| Next | The study-plan page does not unsubscribe its auth listener or use an auth-ready state. Other screens duplicate auth and timestamp logic. Quiz prerequisite loading lacks an error state. | Share auth state, distinguish initialization from signed-out state, clean up listeners, clear user-specific state on account changes, and handle failed prerequisite reads. Abort or invalidate requests on unmount/account changes. |
| Next | Header dropdowns use hover and non-focusable spans; roadmap navigation is attached to SVG group clicks. Lenis and motion have no reduced-motion handling in the reviewed code. | Add keyboard-operable dropdown buttons, focus behavior, accessible roadmap links or an equivalent lesson list, and reduced-motion support. Keep existing labels and lesson content. |
| Next | The logs API fetches all history. Dashboard and history currently fetch full client-side result sets and sort them. | Add cursor pagination for browsing and maintain compact per-topic aggregates for planning. Avoid reading or sending an entire lifetime of raw questions on every visit. |
| Later | Quiz pages repeat substantial UI and curriculum maps. Styles use a remote Google Fonts CSS import; the layout imports an empty CSS file as well as the actual global stylesheet. | Extract shared quiz presentation while preserving topic-specific text/resources. Consolidate the actual style entrypoint, review fonts and images, and move static lesson/resource presentation outside client-only interactive components where practical. Measure bundle/load changes rather than assuming a speedup. |
| Next | CI builds but does not run the quiz tests or lint. Current lint fails. | Resolve lint errors, then run type checking, quiz tests, lint, and build in CI. Add meaningful coverage for persistence failure, authorization, and plan selection. |

### Roadmap destinations with no matching page

- `/highschoolquiz/mechanics/linear-momentum` → existing lesson: `/highschoolquiz/mechanics/momentum`
- `/highschoolquiz/mechanics/work-energy` → existing lesson: `/highschoolquiz/mechanics/energy`
- `/highschoolquiz/mechanics/projectile-motion` → existing lesson: `/highschoolquiz/mechanics/projectile-and-satellite-motion`
- `/highschoolquiz/mechanics/orbital-mechanics` → existing lesson: `/highschoolquiz/mechanics/gravity`
- `/highschoolquiz/mechanics/oscillatory-motion`
- `/highschoolquiz/mechanics/fluid-mechanics`
- `/highschoolquiz/mechanics/special-topics`
- `/highschoolquiz/electricity-magnetism/electrostatics` → existing lesson under `/highschoolquiz/electricity/`
- `/highschoolquiz/electricity-magnetism/currentcircuits` → existing lesson under `/highschoolquiz/electricity/`
- `/highschoolquiz/electricity-magnetism/magnetism` → existing lesson under `/highschoolquiz/electricity/`
- `/highschoolquiz/electricity-magnetism/induction` → existing lesson under `/highschoolquiz/electricity/`
- `/highschoolquiz/electricity-magnetism/ac-circuits`
- `/highschoolquiz/electricity-magnetism/em-waves`
- `/highschoolquiz/electricity-magnetism/optics`

The suggested mappings are destinations to review, not permission to retitle or rewrite the lessons. Some advanced roadmap nodes are also absent from the quiz pages' prerequisite/unlock maps, reinforcing the need for a shared registry.

## Intended student experience

1. On the first visit, let a student select a goal (school physics, F=ma, Physics Bowl, or USAPhO), available minutes, study days, timezone, and an optional target date. Preferences remain editable; allow a quick start with explicit defaults.
2. With no history, offer a goal-appropriate diagnostic or an exploratory lesson. Show untested topics as unknown, not weak.
3. After one quiz, show a provisional plan based on that topic and the actual responses. Explain that there is not yet enough evidence to judge the student's overall physics level.
4. With existing history, build a plan immediately from usable past attempts. Show which results informed it and when the plan was last updated. Do not require the student to retake a quiz just to unlock planning.
5. Make the signed-in dashboard answer: “What should I study next, why, and for how long?” Show today's session, recent improvement, and the next review. Link directly to a relevant existing resource and focused quiz.
6. After a session, let the student mark completion, report difficulty, or reschedule. After a new quiz, revise future work while retaining completed sessions and history.
7. In history and on the roadmap, connect results to next actions: review a prerequisite, retry a weak concept, or attempt the next eligible lesson.

## Data and architecture

Use the existing Firebase stack for the first version; introducing another database is unnecessary for this feature.

### Canonical curriculum registry

Create a typed registry with a stable topic ID, track, current lesson URL, concept IDs, prerequisites, availability, and existing resource IDs/URLs. Names and curated resources can remain identical to the current pages. Scope identity by track: the same node label must not accidentally combine school-level and competition-level evidence.

Use this registry for the roadmap, quiz configuration, server-side prerequisite validation, and allowed plan destinations. AI output must refer to permitted IDs; the application resolves actual links. This prevents invented lessons or resources.

### Proposed records

| Record | Fields and purpose |
| --- | --- |
| `users/{uid}/preferences/study` | Goal/track, minutes per session, study days, timezone, optional target date, updated version. |
| `users/{uid}/analysisLogs/{attemptId}` | Keep the existing canonical collection for completed attempts. Store schema version, topic/track/node, question IDs and version, answers, server-derived score, timestamps, elapsed time, and evaluation status. |
| Question/evaluation metadata | Concept tags, assessed skill (conceptual reasoning, modeling, calculation), answer explanations, possible misconception tags, and evidence references. Distinguish generated/inferred annotations from validated labels. |
| `users/{uid}/topicProfiles/{topicKey}` | Derived question counts, recent accuracy by difficulty, attempt count, last practiced time, trend, evidence coverage, and next review. Keep the source attempt IDs/version so aggregates can be rebuilt. |
| `users/{uid}/studyPlans/{planId}` | Plan version, preference version, source history version, evidence summary, scheduled sessions, generation status, and timestamps. |
| Plan session | Stable session ID, topic/concept/resource IDs, local date, minute budget, objective, activity blocks, reason/evidence, completion criterion, and completion status. |

Read plans only for the authenticated user. The existing server routes already scope reads by verified UID; retain that pattern. Deployed Firestore rules were not available for inspection. Admin SDK requests bypass those rules, so server validation remains necessary ([Firebase documentation](https://firebase.google.com/docs/firestore/security/rules-query)).

### Reliable submission and planning flow

1. Generate a server-stored quiz with an attempt ID, answer key, topic/concept metadata, and version. Return the questions without the key.
2. Submit answers against that ID. Grade server-side and persist the attempt. Apply progress once using trusted curriculum configuration.
3. Request AI explanations as a separate, retryable step. Save pending/failed/complete state. The student retains the score and history if that service fails.
4. Update the derived topic profile and mark the current plan as needing refresh when relevant new evidence arrives.
5. Build or refresh a plan from normalized evidence and preferences. Generate on completion or an explicit refresh, not on every page render. Deduplicate concurrent requests and cache against evidence/preference versions.
6. Preserve the last usable plan if a refresh fails. Show its last-updated time and a retry action. A rules-based plan can still supply useful objectives, resources, and checkpoints without an AI response.

If generation/evaluation routinely exceeds the request budget, move enrichment to durable background processing. An unawaited task inside a serverless request is not a reliable persistence mechanism.

### Historical compatibility

- Normalize `topic`/`quizTopic`, date formats, and supported schema versions in one server module.
- Inspect root `quizLogs`, nested `analysisLogs`, and the older array format referenced by `src/firebase.ts`. The existing migration helper only addresses the array format and has no caller in the reviewed source.
- Migrate by stable source ID, retain original timestamps and provenance, and verify counts before any deletion. Do not run migration during page rendering.
- Use legacy score-only records for topic-level evidence when the topic and denominator are known. Do not invent missed concepts, explanations, or denominators.
- Treat unrecognized topics and missing totals as incomplete history. Keep them visible to the student without allowing them to distort mastery estimates.

## How to select useful study work

Start with transparent rules that can be tested independently of AI writing:

1. Separate evidence by track, topic/concept, and difficulty. Do not compare a high-school score directly with a USAPhO score.
2. Consider question counts as well as percentages. A perfect three-question check remains limited evidence; a single wrong answer does not establish a persistent misconception.
3. Prioritize unresolved prerequisite gaps, repeated errors across attempts, relevant weak concepts, and overdue review. Reserve some sessions for untested goal-relevant topics.
4. Use recent evidence more strongly when selecting current work, while retaining older evidence for trend and review. Make any weighting and minimum-evidence thresholds explicit and configurable.
5. Keep lesson unlock/mastery rules distinct from review recommendations. A previously mastered topic can be due for review without silently losing its unlocked state.
6. Use total elapsed time cautiously: an open browser tab is not a reliable measure of fluency. Per-question active time and confidence can be added later; neither should label a student as weak by itself.
7. Schedule within the student's actual time budget, in their timezone. Use configurable review intervals as a starting policy, then adjust to quiz evidence and reported difficulty; do not present those defaults as a validated learning model.
8. For possible misconceptions, attach the relevant wrong answer and show uncertainty. A tutor-style inference from a multiple-choice answer is not proof of the student's reasoning.

The model's role is to explain the evidence, write clear objectives, and tailor practice suggestions within a validated session structure. Topic priority, scheduling limits, valid resources, and completion criteria should remain application-controlled. Validate generated structure and references before saving it; retain a deterministic fallback.

### Example session structure

Illustrative only: for a student with repeated errors on force diagrams and 30 minutes available:

| Block | Time | Activity |
| --- | --- | --- |
| Recall | 5 min | Draw a force diagram from memory and distinguish net force from individual forces. |
| Targeted review | 8 min | Open the existing Newton's Second Law resource selected from the curriculum registry. |
| Practice | 12 min | Work through focused force-diagram questions, explaining the chosen system and acceleration direction. |
| Checkpoint | 5 min | Start a short concept check; schedule a longer mastery check separately if needed. |

The real plan should cite the student's relevant attempts, specify which concepts are being checked, state what successful completion looks like, and explain the next step if the student still struggles. Review intervals and follow-up checks should be scheduled explicitly. Completion of a reading task alone must not count as demonstrated mastery.

## Implementation order and acceptance criteria

### 1. Repair the existing learning loop

- History and profile show the same newly submitted attempt through the common API.
- An AI timeout still leaves a saved score and a retryable feedback state.
- A repeated submit/retry creates one attempt and applies progress once.
- Roadmap destinations resolve or clearly indicate unavailability.
- Authenticated generation, server-owned curriculum maps, and bounded input validation are in place.
- Preserve all current lesson prose and curated resources.

### 2. Deliver the first useful study plan

- Add editable preferences and a shared curriculum registry.
- Implement a server-side historical normalizer and evidence aggregator.
- Replace the placeholder page with a saved, structured seven-day plan, a clear first session, source evidence, and links to existing lessons/quizzes.
- Support zero-history, one-attempt, rich-history, and incomplete-legacy-history states explicitly.
- Connect the quiz result and dashboard to the plan. Keep completed sessions stable on refresh and regenerate only affected future work.
- Persist session completion and allow rescheduling within the weekly budget.
- Provide a rules-based fallback if optional AI enrichment fails.

### 3. Improve diagnosis and adaptation

- Add concept-tagged questions, error categories, confidence, and better timing signals.
- Add targeted follow-up quizzes, delayed review, and difficulty-aware progress trends.
- Evaluate whether generated diagnoses and recommended activities match the actual questions and existing curriculum.
- Measure plan usage, session completion, improvement on comparable follow-up quizzes, and later retention. Clicks and time on site alone are insufficient measures of learning.

### Required verification for implementation

Test cross-user access denial, retry deduplication, failed evaluation with successful attempt persistence, prerequisite validation, legacy normalization, limited-evidence labeling, track separation, preference budgets/timezones, invalid resource references, and preservation of completed sessions. Test the end-to-end path: quiz → saved history → plan → focused follow-up → revised future sessions. Check keyboard navigation, reduced motion, and mobile layout in the browser.

## Verification performed during this audit

- TypeScript: `npx tsc --noEmit --incremental false` passed.
- Quiz utilities: all 11 tests passed with `node --import tsx --test scripts/test-quiz-utils.ts`.
- `npm test` encountered a sandbox IPC restriction in the `tsx` launcher; invoking the same tests through Node's import hook succeeded.
- ESLint: 9 errors and 23 warnings. Errors include explicit `any` types and effect-state patterns; existing failures were not modified.
- Checked roadmap URL literals against local page files: 14 missing destinations.
- No live database reads, paid AI requests, migrations, production build, performance measurements, or browser visual checks were performed. Production rules and deployed behavior remain unverified.

Technical references: [Firestore pagination](https://firebase.google.com/docs/firestore/query-data/query-cursors) supports bounded history reads; [Next.js server/client component guidance](https://nextjs.org/docs/app/getting-started/server-and-client-components) supports reducing client-side scope while retaining interactive quizzes.

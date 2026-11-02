# Personalized study plans: first implementation

## Delivered

- `/study-plan` reads authenticated quiz history and saves a seven-day plan in `users/{uid}/studyPlans/current`.
- Preferences cover goal, minutes per session, study days, and timezone. Sessions include objectives, timed activities, actual missed-question evidence when available, existing resources, lesson/quiz links, and completion checkpoints.
- Plan selection separates competition tracks, prioritizes low recent topic accuracy, considers overdue review, and respects prerequisites. Unknown topics remain untested. One-attempt plans are provisional; short quizzes are insufficient for prerequisite mastery.
- New evidence or preferences refresh future sessions when the plan is opened. Completed sessions are retained. Planning uses deterministic rules, with no extra AI request or API cost.
- Quiz results persist before optional AI feedback. An attempt UUID prevents duplicates on retries; only feedback fields can change once the attempt exists. Account changes invalidate pending quiz UI operations.
- Dashboard and history use the same authenticated history reader. It supports canonical records, root-level legacy logs, and older user-document arrays without migrating or deleting data during reads. Reads are bounded to 200 records per format; root-level legacy selection is a bounded sample, not guaranteed to be the latest 200.
- Generation requires authentication, bounds prompt size, and allows 40 attempts per user per UTC day. Failed model requests consume a quota slot too.
- Progress rules come from the checked-in curriculum registry rather than client-supplied prerequisite maps. Scores are validated as integers but still originate in the existing client grading flow.
- Fixed existing mechanics node mismatches for energy, gravity, rotation, and projectile motion. Fixed eight roadmap URLs; six unavailable lessons remain visible without navigation. Existing historical progress flags were not guessed or rewritten because old IDs are ambiguous.
- Added links from quiz results and dashboard to planning, responsive header styles, keyboard-operable menus and roadmap nodes, and explicit styles for the new study-plan page.
- CI now runs behavioral tests and TypeScript before the build. The Node import hook avoids the prior test launcher's sandbox IPC issue.

## Validation

`npm test` covers plan eligibility, sparse/incomplete evidence, track separation, legacy topic matching, budgets and local dates around DST, completed-session preservation, valid lesson destinations, unauthenticated API rejection, and immutable attempt feedback enrichment. Type checking and targeted lint run against the changed core modules. Production compilation uses `npx next build --webpack`; the default Turbopack build stalled in this sandbox and was stopped.

A local browser check covered the signed-out study-plan page and navigation. Signed-in persistence, Firestore permissions, and paid model calls have not been exercised against a live account. No database migration or production deployment was performed.

## Remaining work

- Replace client-supplied answer keys/scores with server-stored quiz instances and authoritative grading. The current work improves persistence and controls but does not make existing self-reported mastery tamper-proof.
- Resolve remaining reused competition node IDs and audit their intended prerequisite graph before migrating historical progress.
- Add concept-tagged questions and calibrated diagnosis. Current planning is topic-level and cites actual missed questions without claiming to know the student's reasoning.
- Add session rescheduling, target dates, and more detailed trend views. Currently students can adjust study days/time and check off completed sessions.
- Add cursor-based history browsing and persistent topic aggregates to cover histories larger than the bounded read window.
- Address existing unrelated lint errors, reduced-motion behavior, and the legacy global Tailwind theme/spacing pipeline. New plan/navigation styles are explicit to avoid depending on missing theme variables.
- Run signed-in end-to-end tests with a designated test account before deploying.

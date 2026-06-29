'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
const EDITORS = [
  {
    id: "ED_01",
    name: "Sherlock Dong",
    tag: "Lead Editor",
    affiliation: "Rabun Gap Nacoochee School",
    description: "A physics enthusiast since 7th grade. Awarded first place in the Chinese National Physics Olympiad (CPhO).",
    color: "#10b981",
    bg: "rgba(16,185,129,0.05)",
    border: "rgba(16,185,129,0.2)"
  }
];

export default function InsightsPage() {
  return (
    <main className="page-wrapper min-h-screen px-4 pb-20 pt-12">
      <div className="max-w-[960px] mx-auto">

        {/* Header Section */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-3 py-1 mb-4 text-xs font-mono text-[#a78bfa] bg-[#a78bfa]/10 border border-[#a78bfa]/20 rounded-full"
          >
            SYS_// EDITORIAL
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-bold text-white font-heading tracking-tight mb-6"
          >
            Beyond the Textbook: <span className="text-[#a78bfa]">How to Actually Think like a Physics Olympian</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-zinc-400 text-lg max-w-2xl mx-auto leading-relaxed"
          >
            Academic competitions are very different from just physics at schools. <br />
            Link: <Link href="https://physicsoguide.blogspot.com/2026/06/beyond-textbook-how-to-actually-think.html" target="_blank">Read More </Link>
          </motion.p>
        </div>

        {/* Editors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {EDITORS.map((editor, index) => (
            <motion.div
              key={editor.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 + 0.3 }}
              className="relative p-6 rounded-xl border backdrop-blur-sm"
              style={{
                backgroundColor: editor.bg,
                borderColor: editor.border
              }}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">{editor.name}</h2>
                  <p className="text-sm font-mono" style={{ color: editor.color }}>
                    {editor.tag}
                  </p>
                </div>
                <div className="px-2 py-1 text-xs font-mono rounded bg-black/40 text-zinc-500 border border-zinc-800">
                  {editor.id}
                </div>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="h-[1px] flex-grow bg-zinc-800"></div>
                <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
                  {editor.affiliation}
                </span>
                <div className="h-[1px] flex-grow bg-zinc-800"></div>
              </div>

              <p className="text-zinc-300 text-sm leading-relaxed">
                {editor.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Article Content */}
        <article className="prose prose-invert prose-zinc max-w-none">
          <div className="text-zinc-300 leading-relaxed space-y-8 text-[17px]">
            <p>
              Academic competitions are very different from just physics at schools. At times, a college student may not know how to solve a relatively easy olympiad problem. It is a subject that requires a considerable amount of preparation, as well as intuition for physics.
            </p>

            <p>
              In high schools, regardless of the system, many college-level classes are provided, such as Advanced Placement Physics, or IB programs. During the preparation of these exams, teachers would present all important formulas, and teach them about the science behind it, and how to use it in the actual test, since a formula sheet is provided at the test. Knowing what each formula means and how to use them would significantly help a student secure a decent score in these exams. Nevertheless, Olympiad-level physics is very much different.
            </p>

            <p>
              During preparation for the Physics Olympiads, many students spend a lot of time doing past problems. There are many books on the market as well that target these students and provide them with a whole book of problems in the olympiad difficulty. This process is not designed to help them predict what could be on the actual test, or memorize how to solve each type of problem, but to build something in their brain, that they would instantly recognize the fundamental structure behind each problem, seeing through the surface and thus easily use the formulas that they have been using.
            </p>

            {/* Comparison Table */}
            <div className="my-12">
              <table className="w-full border-collapse border border-zinc-700 rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-zinc-900">
                    <th className="border border-zinc-700 px-6 py-4 text-left font-medium text-white">High School Physics (AP / IB)</th>
                    <th className="border border-zinc-700 px-6 py-4 text-left font-medium text-white">Olympiad Physics</th>
                  </tr>
                </thead>
                <tbody className="text-zinc-300">
                  <tr>
                    <td className="border border-zinc-700 px-6 py-4">Formula sheets are provided</td>
                    <td className="border border-zinc-700 px-6 py-4">You must deduce the tools from first principles</td>
                  </tr>
                  <tr>
                    <td className="border border-zinc-700 px-6 py-4">Focused on execution and curriculum</td>
                    <td className="border border-zinc-700 px-6 py-4">Focused on structural recognition and intuition</td>
                  </tr>
                  <tr>
                    <td className="border border-zinc-700 px-6 py-4">Predicting what is on the test</td>
                    <td className="border border-zinc-700 px-6 py-4">Training the brain to handle the unpredictable</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </article>

      </div>
    </main>
  );
}
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const Count = () => {
  return (
    <main className="page-wrapper min-h-[50vh] flex items-center justify-center px-6">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-[#0A0A18] border border-zinc-800 p-8 rounded-3xl shadow-2xl relative overflow-hidden group text-center md:text-left"
      >
        {/* Decorative corner tag matching the telemetry dashboard theme */}
        <div className="absolute top-0 right-0 bg-zinc-900 text-zinc-500 font-mono text-[10px] px-3 py-1 rounded-bl-lg tracking-widest uppercase">
          Core_//_Auth
        </div>

        <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#4f8ef7]/10 border border-[#4f8ef7]/20 text-[#4f8ef7]">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
          </svg>
        </div>

        <p className="text-zinc-300 text-base leading-relaxed mb-6 font-medium">
          The lead developer, initiator, and founder of this platform is{' '}
          <span className="text-white font-semibold">Sherlock Dong</span>.
        </p>

        <div className="h-px bg-zinc-800/60 w-full mb-6"></div>

        <div className="flex justify-center md:justify-start">
          <Link 
            href="https://sherlockdong.us" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-mono text-[#4f8ef7] hover:text-[#76a9ff] transition-colors group/link"
          >
            <span>Explore Developer Registry</span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth={2} 
              stroke="currentColor" 
              className="w-4 h-4 transform group-hover/link:translate-x-1 transition-transform"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </motion.div>
    </main>
  );
};

export default Count;
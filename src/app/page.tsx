'use client';

import React, { useState } from 'react';
import Generator from '@/components/Generator';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  const [active, setActive] = useState(false);

  return (
    <div className="flex-1 w-full flex flex-col">
      {/* Top Header Bar */}
      <header className="border-b border-neutral-800 bg-white/60 backdrop-blur-md sticky top-0 z-50 px-4 py-4 md:px-8 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-base md:text-lg font-mono font-bold tracking-widest text-neutral-900 uppercase">
            🌴 Frame in Goa
          </span>
        </div>
        <div>
          <span className="font-mono text-[9px] bg-neutral-900 text-white px-2 py-0.5 rounded tracking-widest uppercase font-bold">
            HHG / 2026
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 md:py-12 flex flex-col justify-center items-center">
        {!active ? (
          /* Landing Screen */
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center w-full my-auto">
            {/* Left Hero Text Column */}
            <div className="md:col-span-7 flex flex-col gap-6 text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-100 border border-orange-200 text-[#e04f2f] rounded font-mono text-[9px] font-bold uppercase tracking-widest w-fit">
                🔥 Hacker House Goa 2026
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-neutral-900 leading-none">
                FRAME YOUR <br className="hidden sm:inline" />
                <span className="text-[#FF5A36] uppercase">GOA BUILD</span>
              </h1>
              
              <p className="text-base sm:text-lg text-neutral-700 font-semibold tracking-wide">
                Turn your photo into a Hacker House Goa 2026 builder card.
              </p>
              
              <p className="font-mono text-xs text-neutral-600 uppercase tracking-widest font-bold">
                ⚡ Upload. Customize. Generate. Share.
              </p>

              <div className="flex flex-col gap-4 mt-2 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={() => setActive(true)}
                  className="px-6 py-3.5 bg-neutral-900 text-white font-mono text-xs font-bold uppercase tracking-widest rounded border border-neutral-800 shadow-[4px_4px_0px_0px_rgba(255,90,54,1)] hover:shadow-[2px_2px_0px_0px_rgba(255,90,54,1)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all flex items-center justify-center gap-2 cursor-pointer font-bold"
                >
                  Create My Frame
                  <ArrowRight className="w-4 h-4" />
                </button>
                
                <span className="font-mono text-[9px] text-neutral-500 uppercase tracking-widest text-center sm:text-left py-1 font-bold">
                  No signup • Takes a few seconds
                </span>
              </div>
            </div>

            {/* Right Card Preview Column */}
            <div className="md:col-span-5 flex justify-center w-full">
              <div className="relative w-full max-w-[320px] aspect-[2/3] bg-neutral-100 rounded border border-neutral-800 shadow-[8px_8px_0px_0px_rgba(18,18,18,1)] overflow-hidden transition-transform duration-300 hover:scale-[1.01] pointer-events-none">
                <img
                  src="/templates/classic/template.png"
                  alt="Hacker House Goa 2026 Card Example"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-neutral-900/5" />
              </div>
            </div>
          </div>
        ) : (
          /* Generator Screen */
          <div className="w-full flex flex-col gap-6">
            <button
              type="button"
              onClick={() => setActive(false)}
              className="font-mono text-[10px] text-neutral-600 hover:text-neutral-900 uppercase tracking-widest flex items-center gap-1.5 self-start mb-2 font-bold cursor-pointer"
            >
              ← Back to home
            </button>
            <Generator />
          </div>
        )}
      </main>

      {/* Page Footer */}
      <footer className="border-t border-neutral-200 bg-white/30 py-6 text-center font-mono text-[9px] text-neutral-500 uppercase tracking-widest font-bold">
        <p>Built for Hacker House Goa 2026 Shortlist</p>
      </footer>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { Monitor, Copy, Check, ArrowRight, X } from 'lucide-react';

interface DesktopOnlyNoticeProps {
  title?: string;
  subtitle?: string;
}

export default function DesktopOnlyNotice({
  title = 'Desktop Recommended',
  subtitle = 'This lab compiler and real-time monitoring portal is designed for desktop and laptop screens for full code editing, terminal I/O, and 60-PC matrix monitoring.',
}: DesktopOnlyNoticeProps) {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [dismissed, setDismissed] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => {
      // Screens below 1024px (tablets and phones)
      setIsMobile(window.innerWidth < 1024);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isMobile || dismissed) return null;

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-sm sm:max-w-md p-6 sm:p-7 rounded-2xl bg-white border border-slate-200 shadow-2xl text-slate-900 space-y-5 relative">
        
        {/* Close Button */}
        <button 
          onClick={() => setDismissed(true)}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          title="Dismiss notice"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Minimal Black & White Monitor Icon */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-900 shadow-sm shrink-0">
            <Monitor className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-[10px] font-semibold tracking-wide uppercase mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-900" />
              Desktop Experience
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">{title}</h2>
          </div>
        </div>

        {/* Clean Description */}
        <p className="text-xs leading-relaxed text-slate-600 font-normal">
          {subtitle}
        </p>

        {/* Minimal Feature Checklist in Light Black & White */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-700 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-slate-900" />
            <span>Monaco Code Editor &amp; Multi-tab Workspace</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-slate-900" />
            <span>Interactive STDIN Terminal &amp; Test Case Runner</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-slate-900" />
            <span>Real-time 60-PC Faculty Monitoring &amp; Anti-Cheat</span>
          </div>
        </div>

        {/* Actions in Crisp Black & White */}
        <div className="space-y-2 pt-1">
          <button
            onClick={handleCopyLink}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-semibold text-xs transition shadow-sm flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Link Copied to Clipboard!' : 'Copy Link to Open on Desktop'}
          </button>

          <button
            onClick={() => setDismissed(true)}
            className="w-full py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center justify-center gap-1.5"
          >
            <span>Continue on Mobile Anyway</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
}

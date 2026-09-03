'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Code2, Sun, Moon, Key, ShieldCheck, Maximize, Minimize } from 'lucide-react';
import { useIDE } from '@/context/IDEContext';

export default function TitleBar() {
  const { 
    theme, 
    toggleTheme, 
    viewMode, 
    setJoinSessionModalOpen,
    student,
    handleLeaveLabSession
  } = useIDE();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const isDark = theme === 'vs-dark';

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const togglePageFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <header className={`h-9 flex items-center justify-between px-3 text-xs border-b shrink-0 ${isDark ? 'bg-[#181818] border-[#2b2b2b] text-[#cccccc]' : 'bg-[#f8f8f8] border-[#e7e7e7] text-[#3b3b3b]'}`}>
      
      {/* Left: CodeLab IDE Brand */}
      <div className="flex items-center gap-2">
        <Link href="/" className="flex items-center gap-1.5 font-bold hover:opacity-85 transition">
          <div className="w-5 h-5 rounded bg-[#0078d4] flex items-center justify-center text-[10px] text-white shadow-sm">
            <Code2 className="w-3 h-3" />
          </div>
          <span className="font-semibold text-xs tracking-wide">CodeLab <span className="text-[#0078d4]">IDE</span></span>
        </Link>

        {viewMode === 'student_lab' && student && (
          <span className="ml-2 px-2.5 py-0.5 text-[10px] font-mono bg-emerald-500/20 text-emerald-400 rounded border border-emerald-500/30 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Session: {student.sessionCode} ({student.machineNumber})
          </span>
        )}
      </div>

      {/* Right Controls: Prominent Action Buttons, Fullscreen & Theme Switcher */}
      <div className="flex items-center gap-2">
        
        {/* If in Student Lab Mode */}
        {viewMode === 'student_lab' ? (
          <button
            onClick={handleLeaveLabSession}
            className="px-2.5 py-1 text-[11px] font-medium rounded border hover:bg-rose-500/20 text-rose-400 border-rose-500/40 transition"
          >
            Leave Lab Session
          </button>
        ) : (
          <>
            {/* Join Lab Session Button (Code + Password) */}
            <button
              onClick={() => setJoinSessionModalOpen(true)}
              className="px-3 py-1 text-[11px] rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition flex items-center gap-1.5 shadow"
            >
              <Key className="w-3.5 h-3.5" /> Join Lab Session
            </button>

            {/* Dedicated Teacher Portal Link */}
            <Link
              href="/teacher/login"
              className="px-3 py-1 text-[11px] rounded bg-[#0078d4] hover:bg-[#006cc1] text-white font-semibold transition flex items-center gap-1.5 shadow"
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Teacher Login
            </Link>
          </>
        )}

        {/* Page Fullscreen Toggle Button */}
        <button
          onClick={togglePageFullscreen}
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen (Full Page IDE)'}
          className={`p-1.5 rounded transition ${isDark ? 'hover:bg-[#2a2d2e] text-gray-300 hover:text-white' : 'hover:bg-[#e0e0e0] text-gray-700'}`}
        >
          {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
        </button>

        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          className={`p-1.5 rounded transition ${isDark ? 'hover:bg-[#2a2d2e] text-amber-400' : 'hover:bg-[#e0e0e0] text-[#0078d4]'}`}
        >
          {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>
      </div>
    </header>
  );
}

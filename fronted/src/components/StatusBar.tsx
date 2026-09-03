'use client';

import React from 'react';
import { Terminal as TerminalIcon } from 'lucide-react';
import { useIDE } from '@/context/IDEContext';

export default function StatusBar() {
  const { language, student, viewMode, setPanelOpen, setPanelTab } = useIDE();

  return (
    <footer className="h-6 bg-[#007acc] text-white flex items-center justify-between px-3 text-[11px] font-mono shrink-0 select-none">
      <div className="flex items-center gap-3">
        <span className="font-bold cursor-pointer hover:opacity-85">main*</span>
        <span className="cursor-pointer hover:opacity-85">✕ 0 ⚠ 0</span>
        {viewMode === 'student_lab' && student && (
          <span className="font-sans">⚡ Lab Seat: {student.machineNumber}</span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <span>Ln 14, Col 18</span>
        <span>Spaces: 4</span>
        <span>UTF-8</span>
        <span className="font-bold uppercase">{language} (GCC 13)</span>
        
        {/* Click to open/toggle terminal */}
        <button
          onClick={() => {
            setPanelOpen(true);
            setPanelTab('terminal');
          }}
          className="flex items-center gap-1.5 hover:bg-white/20 px-1.5 py-0.5 rounded transition cursor-pointer"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-300"></span>
          <span>Terminal Sandbox</span>
        </button>
      </div>
    </footer>
  );
}

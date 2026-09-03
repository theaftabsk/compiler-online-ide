'use client';

import React from 'react';
import { Files, FileText, Radio, PieChart, User } from 'lucide-react';
import { useIDE } from '@/context/IDEContext';

export default function ActivityBar() {
  const { 
    theme, 
    activeSidebar, 
    setActiveSidebar, 
    sidebarOpen, 
    setSidebarOpen, 
    viewMode, 
    setJoinSessionModalOpen 
  } = useIDE();

  const isDark = theme === 'vs-dark';

  return (
    <aside className={`w-11 flex flex-col items-center justify-between py-2 shrink-0 border-r ${isDark ? 'bg-[#181818] border-[#2b2b2b]' : 'bg-[#f3f3f3] border-[#e7e7e7]'}`}>
      <div className="flex flex-col items-center gap-2.5 w-full">
        <button
          onClick={() => { setActiveSidebar('explorer'); setSidebarOpen(true); }}
          title="Explorer"
          className={`p-2 rounded w-full flex justify-center transition relative ${activeSidebar === 'explorer' && sidebarOpen ? 'text-[#0078d4] border-l-2 border-[#0078d4]' : 'opacity-60 hover:opacity-100'}`}
        >
          <Files className="w-4 h-4" />
        </button>

        <button
          onClick={() => { setActiveSidebar('problem'); setSidebarOpen(true); }}
          title="Problem Description"
          className={`p-2 rounded w-full flex justify-center transition relative ${activeSidebar === 'problem' && sidebarOpen ? 'text-[#0078d4] border-l-2 border-[#0078d4]' : 'opacity-60 hover:opacity-100'}`}
        >
          <FileText className="w-4 h-4" />
        </button>

        {viewMode === 'student_lab' && (
          <>
            <button
              onClick={() => { setActiveSidebar('faculty'); setSidebarOpen(true); }}
              title="Live 60-PC Grid"
              className={`p-2 rounded w-full flex justify-center transition relative ${activeSidebar === 'faculty' && sidebarOpen ? 'text-[#0078d4] border-l-2 border-[#0078d4]' : 'opacity-60 hover:opacity-100'}`}
            >
              <Radio className="w-4 h-4 text-cyan-400" />
            </button>

            <button
              onClick={() => { setActiveSidebar('analytics'); setSidebarOpen(true); }}
              title="Performance Report"
              className={`p-2 rounded w-full flex justify-center transition relative ${activeSidebar === 'analytics' && sidebarOpen ? 'text-[#0078d4] border-l-2 border-[#0078d4]' : 'opacity-60 hover:opacity-100'}`}
            >
              <PieChart className="w-4 h-4 text-indigo-400" />
            </button>
          </>
        )}
      </div>

      <div className="flex flex-col items-center gap-2 w-full">
        <button
          onClick={() => setJoinSessionModalOpen(true)}
          title="Join Session / Student Info"
          className="p-2 opacity-60 hover:opacity-100 transition"
        >
          <User className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}

'use client';

import React from 'react';
import { IDEProvider, useIDE } from '@/context/IDEContext';
import TitleBar from '@/components/TitleBar';
import ActivityBar from '@/components/ActivityBar';
import Sidebar from '@/components/Sidebar';
import EditorArea from '@/components/EditorArea';
import BottomPanel from '@/components/BottomPanel';
import StatusBar from '@/components/StatusBar';
import TeacherPortal from '@/components/TeacherPortal';
import StudentJoinModal from '@/components/StudentJoinModal';
import CodeInspectorModal from '@/components/CodeInspectorModal';

function IDELayout() {
  const { 
    theme, 
    viewMode,
    inspectedAttendee, 
    setInspectedAttendee 
  } = useIDE();

  const isDark = theme === 'vs-dark';

  // If viewing Teacher Portal
  if (viewMode === 'teacher_dashboard') {
    return (
      <>
        <TeacherPortal />
        <StudentJoinModal />
      </>
    );
  }

  // Otherwise viewing Public Playground or Student Lab Session
  return (
    <main id="main-ide-workspace" role="main" className={`h-screen w-screen flex flex-col select-none overflow-hidden ${isDark ? 'bg-[#1e1e1e] text-[#cccccc]' : 'bg-[#ffffff] text-[#24292e]'}`}>
      
      {/* Hidden SEO Heading & Description for Search Crawlers */}
      <div className="sr-only">
        <h1>CodeLab Online IDE - Fast Online C, C++, Java & Python Compiler</h1>
        <p>
          Write, compile, and run C code online using real GCC 13.3 with interactive terminal input for scanf, cin, and Python input.
          Features cloud sandbox isolation, automated test case evaluation, and centralized digital laboratory monitoring for educational institutions.
        </p>
        <h2>Key Features</h2>
        <ul>
          <li>Interactive STDIN Terminal for scanf & cin</li>
          <li>Sub-50ms Ultra-Fast Compilation & Execution</li>
          <li>Full support for C (GCC 13), C++ (G++ 13), Java 21, and Python 3.12</li>
          <li>Machine-wise live monitoring for teachers and instructors</li>
          <li>Automated hidden test case evaluation and scoring</li>
        </ul>
      </div>

      {/* 1. Top Titlebar */}
      <header role="banner">
        <TitleBar />
      </header>

      {/* 2. Workspace Area */}
      <div className="flex-1 flex overflow-hidden">
        <ActivityBar />
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <EditorArea />
          <BottomPanel />
        </div>
      </div>

      {/* 3. Status Bar */}
      <StatusBar />

      {/* 4. Modals */}
      <StudentJoinModal />

      <CodeInspectorModal 
        attendee={inspectedAttendee}
        onClose={() => setInspectedAttendee(null)}
      />

    </main>
  );
}

export default function HomePage() {
  return (
    <IDEProvider>
      <IDELayout />
    </IDEProvider>
  );
}

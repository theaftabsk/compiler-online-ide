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
      
      {/* Hidden Rich SEO Heading & Structured Content for Search Crawlers */}
      <div className="sr-only">
        <h1>Kaspro Online Compiler - #1 Online C Compiler with scanf | by ITVEXO</h1>
        <p>
          Kaspro Online Compiler by ITVEXO is the world&apos;s fastest online C compiler, C++ IDE, and Python cloud sandbox.
          Write, compile, and execute C code online using real GCC 13.3 with real-time interactive terminal input for scanf, cin, and Python input.
          Features Linux sandbox security, sub-50ms execution, automated grading, and live student lab monitoring. An official product of ITVEXO.
        </p>
        <h2>Best Online C Compiler Features</h2>
        <ul>
          <li>Interactive STDIN Terminal for scanf &amp; cin input</li>
          <li>Sub-50ms Ultra-Fast Compilation &amp; Execution with GCC 13.3</li>
          <li>Full support for C, C++17, Java 21, and Python 3.12</li>
          <li>Built by ITVEXO for students, engineers, and educational institutions</li>
          <li>Live teacher monitoring and classroom session management</li>
          <li>Automated hidden test case evaluation and scoring</li>
        </ul>
        <article>
          <h3>How to Run C Code with scanf Online</h3>
          <p>
            Simply write your C code in the Kaspro editor, click Run, and when your program prompts with scanf(), type your input numbers or text directly into the interactive terminal and press Enter.
          </p>
        </article>
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

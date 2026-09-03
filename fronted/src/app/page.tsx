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
    <div className={`h-screen w-screen flex flex-col select-none overflow-hidden ${isDark ? 'bg-[#1e1e1e] text-[#cccccc]' : 'bg-[#ffffff] text-[#24292e]'}`}>
      
      {/* 1. Top Titlebar */}
      <TitleBar />

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

    </div>
  );
}

export default function HomePage() {
  return (
    <IDEProvider>
      <IDELayout />
    </IDEProvider>
  );
}

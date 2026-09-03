'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Key, ShieldCheck, ArrowLeft, Sun, Moon, Code2 } from 'lucide-react';
import { IDEProvider, useIDE } from '@/context/IDEContext';
import TitleBar from '@/components/TitleBar';
import ActivityBar from '@/components/ActivityBar';
import Sidebar from '@/components/Sidebar';
import EditorArea from '@/components/EditorArea';
import BottomPanel from '@/components/BottomPanel';
import StatusBar from '@/components/StatusBar';

function StudentSessionInner() {
  const params = useParams();
  const sessionCode = (params?.sessionCode as string) || 'LAB-2026';

  const { 
    theme, 
    sessionsList, 
    student, 
    handleStudentJoinSession 
  } = useIDE();

  const [enteredPass, setEnteredPass] = useState('8899');
  const [name, setName] = useState('Aftab Sk');
  const [roll, setRoll] = useState('538');
  const [pcNum, setPcNum] = useState('PC-14');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isDark = theme === 'vs-dark';

  // If student is not authenticated into this session yet, show Pin entry
  if (!student) {
    return (
      <div className={`min-h-screen w-screen flex flex-col justify-center items-center p-4 select-none ${isDark ? 'bg-[#181818] text-white' : 'bg-[#f8f8f8] text-gray-800'}`}>
        <div className={`w-full max-w-md p-8 rounded-xl border shadow-2xl space-y-6 ${isDark ? 'bg-[#1f1f1f] border-[#2b2b2b]' : 'bg-white border-gray-200'}`}>
          
          <div className="flex items-center gap-2 font-bold text-base">
            <div className="w-6 h-6 rounded bg-[#0078d4] flex items-center justify-center text-xs text-white">
              <Key className="w-3.5 h-3.5" />
            </div>
            <span>Enter Lab Session: {sessionCode}</span>
          </div>

          <p className="text-xs opacity-75 leading-relaxed">
            Enter your student details and the <strong>Session Password / PIN</strong> provided by your lab faculty to authenticate your computer.
          </p>

          {errorMsg && (
            <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
              {errorMsg}
            </div>
          )}

          <form 
            onSubmit={(e) => {
              e.preventDefault();
              const res = handleStudentJoinSession(sessionCode, enteredPass, name, roll, pcNum);
              if (!res.success) setErrorMsg(res.message);
            }} 
            className="space-y-4 text-xs"
          >
            <div>
              <label className="block font-semibold mb-1 opacity-80">Lab PIN / Password</label>
              <input
                type="password"
                value={enteredPass}
                onChange={(e) => setEnteredPass(e.target.value)}
                placeholder="••••"
                required
                className={`w-full p-2.5 rounded border font-mono focus:outline-none focus:border-[#0078d4] ${isDark ? 'bg-[#141414] border-[#333] text-white' : 'bg-white border-gray-300'}`}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1 opacity-80">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className={`w-full p-2.5 rounded border focus:outline-none focus:border-[#0078d4] ${isDark ? 'bg-[#141414] border-[#333] text-white' : 'bg-white border-gray-300'}`}
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 opacity-80">Roll Number</label>
                <input
                  type="text"
                  value={roll}
                  onChange={(e) => setRoll(e.target.value)}
                  required
                  className={`w-full p-2.5 rounded border font-mono focus:outline-none focus:border-[#0078d4] ${isDark ? 'bg-[#141414] border-[#333] text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1 opacity-80">PC / Seat Number</label>
              <input
                type="text"
                value={pcNum}
                onChange={(e) => setPcNum(e.target.value.toUpperCase())}
                placeholder="e.g. PC-14"
                required
                className={`w-full p-2.5 rounded border font-mono uppercase focus:outline-none focus:border-[#0078d4] ${isDark ? 'bg-[#141414] border-[#333] text-white' : 'bg-white border-gray-300'}`}
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#0078d4] hover:bg-[#006cc1] text-white font-bold rounded transition shadow flex items-center justify-center gap-2"
            >
              Authenticate & Start Practical Exam
            </button>
          </form>

          <div className="pt-2 text-center">
            <Link 
              href="/"
              className="text-xs text-[#0078d4] hover:underline flex items-center justify-center gap-1 mx-auto"
            >
              <ArrowLeft className="w-3 h-3" /> Back to Public Playground
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Once authenticated, render the VS Code Exam Workspace
  return (
    <div className={`h-screen w-screen flex flex-col select-none overflow-hidden ${isDark ? 'bg-[#1e1e1e] text-[#cccccc]' : 'bg-[#ffffff] text-[#24292e]'}`}>
      <TitleBar />
      <div className="flex-1 flex overflow-hidden">
        <ActivityBar />
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <EditorArea />
          <BottomPanel />
        </div>
      </div>
      <StatusBar />
    </div>
  );
}

export default function StudentSessionPage() {
  return (
    <IDEProvider>
      <StudentSessionInner />
    </IDEProvider>
  );
}

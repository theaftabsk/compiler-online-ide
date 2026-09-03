'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Hash, 
  Key, 
  Users, 
  Clock, 
  Copy, 
  Check, 
  ArrowLeft, 
  Sun, 
  Moon, 
  LogOut, 
  Code2, 
  Radio, 
  ExternalLink,
  PieChart
} from 'lucide-react';
import { IDEProvider, useIDE } from '@/context/IDEContext';
import CodeInspectorModal from '@/components/CodeInspectorModal';

function TeacherDashboardInner() {
  const router = useRouter();
  const { 
    theme, 
    toggleTheme, 
    sessionsList, 
    isTeacherLoggedIn, 
    handleTeacherLogout,
    teacherEmail,
    attendees,
    inspectedAttendee,
    setInspectedAttendee
  } = useIDE();

  const isDark = theme === 'vs-dark';
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);

  // If not logged in, redirect to dedicated login page
  useEffect(() => {
    if (!isTeacherLoggedIn) {
      router.push('/teacher/login');
    }
  }, [isTeacherLoggedIn, router]);

  if (!isTeacherLoggedIn) {
    return null;
  }

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className={`min-h-screen w-screen flex flex-col select-none overflow-x-hidden ${isDark ? 'bg-[#181818] text-[#cccccc]' : 'bg-[#f8f8f8] text-[#333333]'}`}>
      
      {/* Top Header */}
      <header className={`h-12 px-6 flex items-center justify-between border-b shrink-0 ${isDark ? 'bg-[#1f1f1f] border-[#2b2b2b]' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded bg-[#0078d4] flex items-center justify-center text-xs text-white font-bold">
            <Code2 className="w-3.5 h-3.5" />
          </div>
          <div>
            <h1 className="text-xs font-bold tracking-wide">Teacher / Faculty Control Center</h1>
            <div className="text-[10px] opacity-60">Faculty: {teacherEmail || 'faculty@university.edu'}</div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/"
            className="px-3 py-1 text-xs border rounded hover:bg-gray-700/20 transition flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3 h-3" /> Code Editor
          </Link>

          <Link
            href="/teacher/analytics"
            className="px-3 py-1 text-xs border rounded hover:bg-gray-700/20 transition flex items-center gap-1.5"
          >
            <PieChart className="w-3 h-3 text-indigo-400" /> Department Analytics
          </Link>

          <Link
            href="/teacher/create"
            className="px-3 py-1 text-xs bg-[#0078d4] hover:bg-[#006cc1] text-white font-semibold rounded transition flex items-center gap-1.5 shadow"
          >
            <Plus className="w-3.5 h-3.5" /> Create New Lab Session
          </Link>

          <button
            onClick={toggleTheme}
            className="p-1.5 rounded hover:bg-gray-700/20"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#0078d4]" />}
          </button>

          <button
            onClick={handleTeacherLogout}
            title="Sign Out"
            className="p-1.5 rounded hover:bg-rose-500/20 text-rose-400"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <div className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
        
        {/* Active Sessions Overview Cards */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider opacity-80">Active Lab Sessions</h2>
            <Link 
              href="/teacher/create"
              className="text-xs text-[#0078d4] hover:underline flex items-center gap-1 font-semibold"
            >
              <Plus className="w-3.5 h-3.5" /> New Session
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessionsList.map((session) => (
              <div 
                key={session.sessionCode}
                className={`p-5 rounded-xl border shadow-sm space-y-4 ${isDark ? 'bg-[#1f1f1f] border-[#2b2b2b]' : 'bg-white border-gray-200'}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-sm">{session.subjectName}</h3>
                    <div className="text-[11px] opacity-70 mt-0.5">{session.batchName} &bull; {session.department}</div>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    ACTIVE
                  </span>
                </div>

                {/* Session Credentials */}
                <div className={`p-3 rounded-lg border space-y-2 ${isDark ? 'bg-[#141414] border-[#2b2b2b]' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-semibold opacity-75 flex items-center gap-1">
                      <Hash className="w-3 h-3 text-[#0078d4]" /> Session Code:
                    </span>
                    <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-cyan-400">
                      <span>{session.sessionCode}</span>
                      <button 
                        onClick={() => handleCopy(session.sessionCode, `code-${session.sessionCode}`)}
                        className="p-0.5 hover:text-white"
                      >
                        {copiedCode === `code-${session.sessionCode}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-gray-400" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-semibold opacity-75 flex items-center gap-1">
                      <Key className="w-3 h-3 text-amber-400" /> Student PIN:
                    </span>
                    <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-amber-400">
                      <span>{session.sessionPassword}</span>
                      <button 
                        onClick={() => handleCopy(session.sessionPassword, `pass-${session.sessionCode}`)}
                        className="p-0.5 hover:text-white"
                      >
                        {copiedCode === `pass-${session.sessionCode}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-gray-400" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Enter Live 60-PC Matrix Button */}
                <Link
                  href={`/teacher/session/${session.sessionCode}`}
                  className="w-full py-2 bg-[#0078d4]/15 hover:bg-[#0078d4] text-[#0078d4] hover:text-white border border-[#0078d4]/40 font-bold rounded-lg text-xs transition flex items-center justify-center gap-1.5"
                >
                  <Radio className="w-3.5 h-3.5" /> Enter Live 60-Machine Matrix <ExternalLink className="w-3 h-3" />
                </Link>

                <div className="pt-2 border-t flex justify-between items-center text-[11px] opacity-75">
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> 60 Seats</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {session.timeLimitMinutes} Mins</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real-time 60-Machine Student Matrix Overview */}
        <div className={`p-6 rounded-xl border space-y-4 ${isDark ? 'bg-[#1f1f1f] border-[#2b2b2b]' : 'bg-white border-gray-200'}`}>
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-sm font-bold flex items-center gap-2">
                <Radio className="w-4 h-4 text-cyan-400" /> Live Connected Student Machines
              </h2>
              <div className="text-xs opacity-60 mt-0.5">
                Click on any student PC to view their live code typing and anti-cheat tab switch logs.
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#0078d4]"></span> Coding (28)</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#107c41]"></span> Submitted (10)</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-gray-500"></span> Empty (22)</span>
            </div>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-10 gap-2.5">
            {attendees.map((pc) => (
              <div
                key={pc.machineNumber}
                onClick={() => pc.status !== 'EMPTY' && setInspectedAttendee(pc)}
                className={`p-2 rounded border text-center cursor-pointer transition ${pc.status !== 'EMPTY' ? 'hover:scale-105 hover:border-[#0078d4]' : 'opacity-40 cursor-not-allowed'} ${isDark ? 'bg-[#141414] border-[#2b2b2b]' : 'bg-gray-50 border-gray-200'}`}
              >
                <div className="font-mono text-[11px] font-bold">{pc.machineNumber}</div>
                <div className="truncate text-[10px] opacity-75 mt-0.5">{pc.studentName}</div>
                <div className="mt-1 flex justify-center">
                  <span className={`w-2 h-2 rounded-full ${pc.status === 'CODING' ? 'bg-[#0078d4]' : (pc.status === 'SUBMITTED' ? 'bg-[#107c41]' : 'bg-gray-600')}`}></span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Code Inspector Modal */}
      <CodeInspectorModal 
        attendee={inspectedAttendee}
        onClose={() => setInspectedAttendee(null)}
      />

    </div>
  );
}

export default function TeacherDashboardPage() {
  return (
    <IDEProvider>
      <TeacherDashboardInner />
    </IDEProvider>
  );
}

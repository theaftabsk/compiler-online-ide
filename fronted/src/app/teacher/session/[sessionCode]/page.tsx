'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Radio, 
  Hash, 
  Key, 
  Users, 
  Clock, 
  CheckCircle2, 
  ShieldAlert, 
  Copy, 
  Check, 
  Sun, 
  Moon, 
  Code2, 
  Eye, 
  Download,
  AlertTriangle
} from 'lucide-react';
import { IDEProvider, useIDE } from '@/context/IDEContext';
import CodeInspectorModal from '@/components/CodeInspectorModal';

function TeacherSessionDetailInner() {
  const params = useParams();
  const sessionCode = (params?.sessionCode as string) || 'LAB-2026';
  
  const { 
    theme, 
    toggleTheme, 
    sessionsList, 
    attendees, 
    inspectedAttendee, 
    setInspectedAttendee 
  } = useIDE();

  const isDark = theme === 'vs-dark';
  const [copied, setCopied] = useState(false);

  // Find session data or fallback
  const session = sessionsList.find(s => s.sessionCode.toUpperCase() === sessionCode.toUpperCase()) || sessionsList[0];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const codingCount = attendees.filter(a => a.status === 'CODING').length;
  const submittedCount = attendees.filter(a => a.status === 'SUBMITTED').length;
  const offlineCount = attendees.filter(a => a.status === 'OFFLINE').length;
  const totalViolations = attendees.reduce((acc, curr) => acc + curr.tabSwitches, 0);

  return (
    <div className={`min-h-screen w-screen flex flex-col select-none overflow-x-hidden ${isDark ? 'bg-[#181818] text-[#cccccc]' : 'bg-[#f8f8f8] text-[#333333]'}`}>
      
      {/* Header */}
      <header className={`h-12 px-6 flex items-center justify-between border-b shrink-0 ${isDark ? 'bg-[#1f1f1f] border-[#2b2b2b]' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center gap-3">
          <Link href="/teacher" className="p-1 rounded hover:bg-gray-700/20 text-gray-400 hover:text-white transition">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#0078d4] flex items-center justify-center text-xs text-white">
              <Code2 className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-xs">{session?.subjectName} ({session?.sessionCode})</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="px-3 py-1 text-xs border rounded hover:bg-gray-700/20 flex items-center gap-1.5 transition"
          >
            <Download className="w-3 h-3" /> Export Lab Report
          </button>

          <button onClick={toggleTheme} className="p-1.5 rounded hover:bg-gray-700/20">
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#0078d4]" />}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
        
        {/* Top Summary & Credentials Banner */}
        <div className={`p-5 rounded-xl border shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 ${isDark ? 'bg-[#1f1f1f] border-[#2b2b2b]' : 'bg-white border-gray-200'}`}>
          
          <div className="space-y-1">
            <span className="text-[11px] font-bold opacity-60 uppercase">Session Info</span>
            <div className="font-bold text-sm">{session?.batchName}</div>
            <div className="text-xs opacity-75">{session?.department}</div>
          </div>

          <div className={`p-3 rounded-lg border flex justify-between items-center ${isDark ? 'bg-[#141414] border-[#2b2b2b]' : 'bg-gray-50 border-gray-200'}`}>
            <div>
              <span className="text-[10px] font-bold opacity-60 uppercase">Session Code</span>
              <div className="font-mono text-base font-bold text-cyan-400">{session?.sessionCode}</div>
            </div>
            <button 
              onClick={() => handleCopy(session?.sessionCode || '')}
              className="p-1 hover:text-white"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
            </button>
          </div>

          <div className={`p-3 rounded-lg border flex justify-between items-center ${isDark ? 'bg-[#141414] border-[#2b2b2b]' : 'bg-gray-50 border-gray-200'}`}>
            <div>
              <span className="text-[10px] font-bold opacity-60 uppercase">Lab PIN Password</span>
              <div className="font-mono text-base font-bold text-amber-400">{session?.sessionPassword}</div>
            </div>
            <button 
              onClick={() => handleCopy(session?.sessionPassword || '')}
              className="p-1 hover:text-white"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
            </button>
          </div>

          <div className={`p-3 rounded-lg border flex items-center justify-between ${isDark ? 'bg-[#141414] border-[#2b2b2b]' : 'bg-gray-50 border-gray-200'}`}>
            <div>
              <span className="text-[10px] font-bold opacity-60 uppercase">Anti-Cheat Audit</span>
              <div className={`text-base font-bold ${totalViolations > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {totalViolations} Tab Switches
              </div>
            </div>
            <ShieldAlert className={`w-5 h-5 ${totalViolations > 0 ? 'text-rose-400' : 'text-emerald-400'}`} />
          </div>

        </div>

        {/* Real-time 60-Machine Grid Matrix */}
        <div className={`p-6 rounded-xl border space-y-4 ${isDark ? 'bg-[#1f1f1f] border-[#2b2b2b]' : 'bg-white border-gray-200'}`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-sm font-bold flex items-center gap-2">
                <Radio className="w-4 h-4 text-cyan-400" /> Live Physical Lab Matrix (60 PCs)
              </h2>
              <div className="text-xs opacity-60 mt-0.5">
                Click on any student card to open live code inspector, test cases status & keystroke logs.
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#0078d4]"></span> Coding ({codingCount})</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#107c41]"></span> Submitted ({submittedCount})</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500"></span> Offline ({offlineCount})</span>
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-10 gap-2.5">
            {attendees.map((pc) => (
              <div
                key={pc.machineNumber}
                onClick={() => pc.status !== 'EMPTY' && setInspectedAttendee(pc)}
                className={`p-2.5 rounded-lg border text-center transition ${pc.status !== 'EMPTY' ? 'cursor-pointer hover:scale-105 hover:border-[#0078d4] hover:shadow-lg' : 'opacity-30 cursor-not-allowed'} ${isDark ? 'bg-[#141414] border-[#2b2b2b]' : 'bg-gray-50 border-gray-200'}`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-mono text-[11px] font-bold">{pc.machineNumber}</span>
                  <span className={`w-2 h-2 rounded-full ${pc.status === 'CODING' ? 'bg-[#0078d4]' : (pc.status === 'SUBMITTED' ? 'bg-[#107c41]' : (pc.status === 'OFFLINE' ? 'bg-rose-500' : 'bg-gray-600'))}`}></span>
                </div>

                <div className="truncate text-[10px] font-medium opacity-80 mt-1">{pc.studentName}</div>
                <div className="font-mono text-[9px] opacity-60">Roll: {pc.rollNumber}</div>

                {pc.tabSwitches > 0 && (
                  <div className="mt-1 text-[9px] font-bold text-rose-400 bg-rose-500/10 rounded py-0.5">
                    ⚠ {pc.tabSwitches} switches
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Assigned Question Preview */}
        <div className={`p-5 rounded-xl border space-y-2 ${isDark ? 'bg-[#1f1f1f] border-[#2b2b2b]' : 'bg-white border-gray-200'}`}>
          <h3 className="font-bold text-xs uppercase tracking-wider opacity-70">Assigned Practical Problem</h3>
          <div className="font-bold text-sm">{session?.questionTitle}</div>
          <p className="text-xs opacity-80 leading-relaxed font-mono whitespace-pre-wrap">{session?.questionDescription}</p>
        </div>

      </div>

      {/* Real-time Code Inspector Modal */}
      <CodeInspectorModal 
        attendee={inspectedAttendee}
        onClose={() => setInspectedAttendee(null)}
      />

    </div>
  );
}

export default function TeacherSessionDetailPage() {
  return (
    <IDEProvider>
      <TeacherSessionDetailInner />
    </IDEProvider>
  );
}

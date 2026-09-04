'use client';

import React, { useState, useEffect } from 'react';
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
  AlertTriangle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { useIDE } from '@/context/IDEContext';
import CodeInspectorModal from '@/components/CodeInspectorModal';
import { MachineAttendee } from '@/types';

export default function TeacherSessionDetailPage() {
  const params = useParams();
  const sessionCode = ((params?.sessionCode as string) || 'LAB-2026').toUpperCase();

  const [theme, setTheme] = useState<'vs-dark' | 'vs-light'>('vs-dark');
  const isDark = theme === 'vs-dark';

  const [session, setSession] = useState<any>(null);
  const [stats, setStats] = useState<any>({
    totalCapacity: 60,
    joinedStudents: 0,
    codingCount: 0,
    submittedCount: 0,
    offlineCount: 0,
    totalViolations: 0,
  });
  const [attendees, setAttendees] = useState<MachineAttendee[]>([]);
  const [inspectedAttendee, setInspectedAttendee] = useState<MachineAttendee | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);

  // Real Database API Fetch
  const fetchLiveGrid = async () => {
    try {
      const res = await fetch(`/api/sessions/${sessionCode}/grid`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          if (data.session) setSession(data.session);
          if (data.stats) setStats(data.stats);
          if (data.attendees) setAttendees(data.attendees);
        }
      }
    } catch (err) {
      console.error('Error fetching live session grid:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveGrid();
    const interval = setInterval(fetchLiveGrid, 2500); // Live poll every 2.5s for real-time monitoring
    return () => clearInterval(interval);
  }, [sessionCode]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'vs-dark' ? 'vs-light' : 'vs-dark'));
  };

  const handleCopyCode = () => {
    if (session?.sessionCode) {
      navigator.clipboard.writeText(session.sessionCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleCopyPass = () => {
    if (session?.sessionPassword) {
      navigator.clipboard.writeText(session.sessionPassword);
      setCopiedPass(true);
      setTimeout(() => setCopiedPass(false), 2000);
    }
  };

  if (isLoading && !session) {
    return (
      <div className={`min-h-screen w-screen flex flex-col items-center justify-center ${isDark ? 'bg-[#181818] text-white' : 'bg-gray-50 text-gray-800'}`}>
        <Loader2 className="w-8 h-8 animate-spin text-[#0078d4] mb-3" />
        <p className="text-xs opacity-70 font-mono">Fetching Live Session Data from PostgreSQL...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen w-screen flex flex-col select-none overflow-x-hidden ${isDark ? 'bg-[#12141a] text-[#e6edf3]' : 'bg-[#f6f8fa] text-[#1f2328]'}`}>
      
      {/* Top Header */}
      <header className={`h-14 px-6 flex items-center justify-between border-b shrink-0 ${isDark ? 'bg-[#1a1f29] border-[#293242]' : 'bg-white border-gray-200 shadow-sm'}`}>
        <div className="flex items-center gap-3">
          <Link href="/teacher" className="p-2 rounded-xl hover:bg-gray-700/20 text-gray-400 hover:text-white transition">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0078d4] to-[#00a2ff] flex items-center justify-center text-xs text-white font-bold shadow-md">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-xs sm:text-sm tracking-wide">{session?.subjectName || 'Lab Practical Session'}</span>
              <div className="text-[11px] opacity-60 font-mono">{sessionCode} • {session?.batchName || 'Batch 2026'}</div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchLiveGrid()}
            className="p-2 rounded-xl border border-gray-700/30 hover:bg-gray-700/10 text-xs flex items-center gap-1 transition"
            title="Refresh Live Data"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#0078d4]" />
            <span className="hidden md:inline text-[11px]">Live Sync</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 text-xs border rounded-xl hover:bg-gray-700/20 flex items-center gap-1.5 transition"
          >
            <Download className="w-3 h-3" /> Export Report
          </button>

          <button onClick={toggleTheme} className="p-2 rounded-xl hover:bg-gray-700/20">
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#0078d4]" />}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
        
        {/* Top Summary & Credentials Banner */}
        <div className={`p-5 rounded-2xl border shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 ${isDark ? 'bg-[#181d26] border-[#293242]' : 'bg-white border-gray-200'}`}>
          
          <div className="space-y-1">
            <span className="text-[10px] font-bold opacity-60 uppercase tracking-wider">Session Info</span>
            <div className="font-bold text-sm tracking-tight">{session?.batchName || 'Section J - Batch 2026'}</div>
            <div className="text-xs opacity-75 text-[#0078d4] font-medium">{session?.department || 'Computer Science & AI'}</div>
          </div>

          <div className={`p-3 rounded-xl border flex justify-between items-center ${isDark ? 'bg-[#12151c] border-[#293242]' : 'bg-gray-50 border-gray-200'}`}>
            <div>
              <span className="text-[10px] font-bold opacity-60 uppercase">Session Code</span>
              <div className="font-mono text-base font-bold text-cyan-400">{session?.sessionCode || sessionCode}</div>
            </div>
            <button 
              onClick={handleCopyCode}
              className="p-1.5 hover:text-white rounded-lg hover:bg-gray-700/20 transition"
              title="Copy Session Code"
            >
              {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
            </button>
          </div>

          <div className={`p-3 rounded-xl border flex justify-between items-center ${isDark ? 'bg-[#12151c] border-[#293242]' : 'bg-gray-50 border-gray-200'}`}>
            <div>
              <span className="text-[10px] font-bold opacity-60 uppercase">Lab PIN Password</span>
              <div className="font-mono text-base font-bold text-amber-400">{session?.sessionPassword || '8899'}</div>
            </div>
            <button 
              onClick={handleCopyPass}
              className="p-1.5 hover:text-white rounded-lg hover:bg-gray-700/20 transition"
              title="Copy Password"
            >
              {copiedPass ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
            </button>
          </div>

          <div className={`p-3 rounded-xl border flex items-center justify-between ${isDark ? 'bg-[#12151c] border-[#293242]' : 'bg-gray-50 border-gray-200'}`}>
            <div>
              <span className="text-[10px] font-bold opacity-60 uppercase">Anti-Cheat Audit</span>
              <div className={`text-base font-bold font-mono ${stats?.totalViolations > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {stats?.totalViolations || 0} Tab Switches
              </div>
            </div>
            <ShieldAlert className={`w-6 h-6 ${stats?.totalViolations > 0 ? 'text-rose-400' : 'text-emerald-400'}`} />
          </div>

        </div>

        {/* Real-time 60-Machine Grid Matrix */}
        <div className={`p-6 rounded-2xl border space-y-5 ${isDark ? 'bg-[#181d26] border-[#293242]' : 'bg-white border-gray-200 shadow-sm'}`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-sm font-bold flex items-center gap-2">
                <Radio className="w-4 h-4 text-cyan-400 animate-pulse" /> Live Physical Lab Matrix ({stats?.totalCapacity || 60} PCs)
              </h2>
              <div className="text-xs opacity-60 mt-0.5">
                Real-time workstation grid from PostgreSQL. Click any active workstation to inspect live code & keystroke logs.
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#0078d4] animate-pulse"></span> Coding ({stats?.codingCount || 0})</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#107c41]"></span> Submitted ({stats?.submittedCount || 0})</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Offline ({stats?.offlineCount || 0})</span>
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-10 gap-3">
            {attendees.map((pc) => {
              const isActive = pc.status !== 'EMPTY';
              const isCoding = pc.status === 'CODING';
              const isSubmitted = pc.status === 'SUBMITTED';
              const isOffline = pc.status === 'OFFLINE';

              return (
                <div
                  key={pc.machineNumber}
                  onClick={() => isActive && setInspectedAttendee(pc)}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    isActive 
                      ? 'cursor-pointer hover:scale-105 hover:border-[#0078d4] hover:shadow-xl hover:shadow-[#0078d4]/10' 
                      : 'opacity-40 cursor-default'
                  } ${
                    isDark 
                      ? (isActive ? 'bg-[#1c2331] border-[#323e54]' : 'bg-[#12151c] border-[#222938]') 
                      : (isActive ? 'bg-white border-blue-200 shadow-sm' : 'bg-gray-100 border-gray-200')
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-[11px] font-bold">{pc.machineNumber}</span>
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      isCoding ? 'bg-[#0078d4] animate-pulse shadow-sm shadow-[#0078d4]' : 
                      (isSubmitted ? 'bg-emerald-500' : 
                      (isOffline ? 'bg-rose-500' : 'bg-gray-600'))
                    }`}></span>
                  </div>

                  <div className="truncate text-[11px] font-semibold opacity-90 mt-1.5">{pc.studentName}</div>
                  <div className="font-mono text-[9px] opacity-60">Roll: {pc.rollNumber}</div>

                  {pc.tabSwitches > 0 && (
                    <div className="mt-1 text-[9px] font-bold text-rose-400 bg-rose-500/10 rounded py-0.5">
                      ⚠ {pc.tabSwitches} switches
                    </div>
                  )}

                  {isActive && (
                    <div className="mt-1 text-[9px] font-mono font-bold text-cyan-400">
                      Score: {pc.score}%
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Assigned Practical Problem */}
        <div className={`p-5 rounded-2xl border space-y-2 ${isDark ? 'bg-[#181d26] border-[#293242]' : 'bg-white border-gray-200'}`}>
          <h3 className="font-bold text-xs uppercase tracking-wider opacity-70">Assigned Practical Problem</h3>
          <div className="font-bold text-sm text-[#0078d4]">{session?.questionTitle || 'Check Even or Odd'}</div>
          <p className="text-xs opacity-80 leading-relaxed font-mono whitespace-pre-wrap">
            {session?.questionDescription || 'Write a program in C that takes an integer from standard input and determines whether it is Even or Odd.'}
          </p>
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

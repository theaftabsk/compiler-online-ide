'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Download, Sun, Moon, PieChart, Users, CheckCircle2, AlertTriangle, Code2, RefreshCw, Database } from 'lucide-react';
import { IDEProvider, useIDE } from '@/context/IDEContext';

interface AttendeeRow {
  machineNumber: string;
  studentName: string;
  rollNumber: string;
  section: string;
  status: string;
  language: string;
  score: number;
  passedCases: string;
  tabSwitches: number;
  isUser: boolean;
  code?: string;
  lastHeartbeat?: string;
}

function AnalyticsInner() {
  const { theme, toggleTheme, sessionsList, fetchSessions } = useIDE();
  const isDark = theme === 'vs-dark';

  const [selectedSessionCode, setSelectedSessionCode] = useState<string>('LAB-2026');
  const [gridAttendees, setGridAttendees] = useState<AttendeeRow[]>([]);
  const [sessionMeta, setSessionMeta] = useState<any>(null);
  const [statsData, setStatsData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Set default selected session once sessionsList is available
  useEffect(() => {
    if (sessionsList.length > 0 && !sessionsList.some((s: any) => s.sessionCode === selectedSessionCode)) {
      setSelectedSessionCode(sessionsList[0].sessionCode);
    }
  }, [sessionsList, selectedSessionCode]);

  const loadGridData = async (code: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/sessions/${code}/grid`, { cache: 'no-store' });
      const data = await res.json();
      if (data?.success) {
        setGridAttendees(data.attendees || []);
        setSessionMeta(data.session || null);
        setStatsData(data.stats || null);
      }
    } catch (err) {
      console.warn('Could not fetch grid analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedSessionCode) {
      loadGridData(selectedSessionCode);
    }
  }, [selectedSessionCode]);

  // Derived real metrics from live PostgreSQL data
  const totalCapacity = statsData?.totalCapacity || sessionMeta?.totalCapacity || 60;
  const activeAttendees = gridAttendees.filter((a: AttendeeRow) => a.status !== 'EMPTY');
  const codingCount = activeAttendees.filter((a: AttendeeRow) => a.status === 'CODING').length;
  const submittedList = activeAttendees.filter((a: AttendeeRow) => a.status === 'SUBMITTED');
  const submittedCount = submittedList.length;

  const attendanceRate = totalCapacity > 0 ? Math.round((activeAttendees.length / totalCapacity) * 100) : 0;
  
  // Real pass rate based on test cases/score >= 50
  const passRate = submittedCount > 0 
    ? Math.round((submittedList.filter((s: AttendeeRow) => s.score >= 50).length / submittedCount) * 100)
    : (activeAttendees.length > 0 ? 0 : 100);

  // Real integrity score: percentage of students with 0 tab switch violations
  const cleanIntegrityCount = activeAttendees.filter((a: AttendeeRow) => (a.tabSwitches || 0) === 0).length;
  const integrityScore = activeAttendees.length > 0 
    ? Math.round((cleanIntegrityCount / activeAttendees.length) * 100) 
    : 100;

  return (
    <div className={`min-h-screen w-screen flex flex-col select-none overflow-x-hidden ${isDark ? 'bg-[#181818] text-[#cccccc]' : 'bg-[#f8f8f8] text-[#333333]'}`}>
      
      {/* Header */}
      <header className={`h-12 px-6 flex items-center justify-between border-b shrink-0 ${isDark ? 'bg-[#1f1f1f] border-[#2b2b2b]' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center gap-3">
          <Link href="/teacher" className="p-1 rounded hover:bg-gray-700/20 text-gray-400 hover:text-white transition">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#0078d4] flex items-center justify-center text-xs text-white font-bold">
              <PieChart className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-xs">Departmental Practical Analytics & Evaluation Report</span>
            <span className="hidden md:inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
              <Database className="w-2.5 h-2.5" /> Live PostgreSQL Sync
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Session Selector */}
          <select
            value={selectedSessionCode}
            onChange={(e) => setSelectedSessionCode(e.target.value)}
            className={`text-xs px-2.5 py-1 rounded border font-mono font-semibold focus:outline-none focus:border-[#0078d4] ${isDark ? 'bg-[#141414] border-[#333] text-white' : 'bg-white border-gray-300'}`}
          >
            {sessionsList.map((s: any) => (
              <option key={s.sessionCode} value={s.sessionCode}>
                {s.sessionCode} &bull; {s.subjectName.slice(0, 24)}...
              </option>
            ))}
          </select>

          <button
            onClick={() => loadGridData(selectedSessionCode)}
            className="p-1.5 rounded hover:bg-gray-700/20 text-gray-400 hover:text-white transition"
            title="Refresh Live Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#0078d4]' : ''}`} />
          </button>

          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 bg-[#0078d4] hover:bg-[#006cc1] text-white font-semibold text-xs rounded flex items-center gap-1.5 transition shadow"
          >
            <Download className="w-3.5 h-3.5" /> Print / Export PDF
          </button>

          <button onClick={toggleTheme} className="p-1.5 rounded hover:bg-gray-700/20">
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#0078d4]" />}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 p-6 max-w-6xl w-full mx-auto space-y-6">
        
        {/* Session Meta Header */}
        {sessionMeta && (
          <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isDark ? 'bg-[#1f1f1f] border-[#2b2b2b]' : 'bg-white border-gray-200'}`}>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#0078d4]">{sessionMeta.sessionCode} &bull; {sessionMeta.subjectName}</div>
              <div className="text-xs opacity-75 mt-0.5">{sessionMeta.batchName} &bull; {sessionMeta.department} &bull; Faculty: {sessionMeta.facultyName || 'Faculty In-Charge'}</div>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className={`px-2.5 py-1 rounded font-bold text-[11px] ${sessionMeta.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-gray-500/20 text-gray-400'}`}>
                {sessionMeta.status}
              </span>
              <span className="font-mono opacity-80">PIN: <strong>{sessionMeta.sessionPassword}</strong></span>
            </div>
          </div>
        )}

        {/* Real KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`p-4 rounded-xl border shadow-sm ${isDark ? 'bg-[#1f1f1f] border-[#2b2b2b]' : 'bg-white border-gray-200'}`}>
            <span className="text-[11px] font-bold opacity-60 uppercase">Pass Rate</span>
            <div className="text-2xl font-bold text-emerald-400 mt-1">{passRate}%</div>
            <div className="text-[11px] opacity-70 mt-0.5">Automated test evaluation</div>
          </div>

          <div className={`p-4 rounded-xl border shadow-sm ${isDark ? 'bg-[#1f1f1f] border-[#2b2b2b]' : 'bg-white border-gray-200'}`}>
            <span className="text-[11px] font-bold opacity-60 uppercase">Attendance</span>
            <div className="text-2xl font-bold text-[#0078d4] mt-1">{activeAttendees.length} / {totalCapacity}</div>
            <div className="text-[11px] opacity-70 mt-0.5">{attendanceRate}% presence in Lab</div>
          </div>

          <div className={`p-4 rounded-xl border shadow-sm ${isDark ? 'bg-[#1f1f1f] border-[#2b2b2b]' : 'bg-white border-gray-200'}`}>
            <span className="text-[11px] font-bold opacity-60 uppercase">Submissions</span>
            <div className="text-2xl font-bold text-purple-400 mt-1">{submittedCount} Completed</div>
            <div className="text-[11px] opacity-70 mt-0.5">{codingCount} students coding</div>
          </div>

          <div className={`p-4 rounded-xl border shadow-sm ${isDark ? 'bg-[#1f1f1f] border-[#2b2b2b]' : 'bg-white border-gray-200'}`}>
            <span className="text-[11px] font-bold opacity-60 uppercase">Integrity Score</span>
            <div className="text-2xl font-bold text-cyan-400 mt-1">{integrityScore}%</div>
            <div className="text-[11px] opacity-70 mt-0.5">Tab-switch violation free</div>
          </div>
        </div>

        {/* Student Table */}
        <div className={`p-6 rounded-xl border shadow-sm space-y-4 ${isDark ? 'bg-[#1f1f1f] border-[#2b2b2b]' : 'bg-white border-gray-200'}`}>
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold flex items-center gap-2">
              <span>Practical Session Student Roll & Evaluation Matrix</span>
            </h2>
            <span className="text-xs font-mono opacity-70">
              Showing {activeAttendees.length} Connected Workstations
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className={`border-b text-[11px] uppercase tracking-wider font-semibold opacity-70 ${isDark ? 'border-[#333]' : 'border-gray-200'}`}>
                <tr>
                  <th className="py-2.5 px-3">Seat</th>
                  <th className="py-2.5 px-3">Student Name</th>
                  <th className="py-2.5 px-3">Roll No</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Test Cases</th>
                  <th className="py-2.5 px-3">Score</th>
                  <th className="py-2.5 px-3">Tab Switches</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/20 font-mono">
                {activeAttendees.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-xs opacity-60">
                      No student workstations currently connected to this session in PostgreSQL.
                    </td>
                  </tr>
                ) : (
                  activeAttendees.map((s: AttendeeRow) => (
                    <tr key={s.machineNumber} className={`hover:bg-gray-700/10 ${s.isUser ? 'font-bold text-cyan-400' : ''}`}>
                      <td className="py-2.5 px-3 font-bold">{s.machineNumber}</td>
                      <td className="py-2.5 px-3 font-sans font-medium">{s.studentName}</td>
                      <td className="py-2.5 px-3">{s.rollNumber}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${s.status === 'SUBMITTED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-[#0078d4]'}`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-emerald-400">{s.passedCases}</td>
                      <td className="py-2.5 px-3 font-bold">{s.score}/100</td>
                      <td className="py-2.5 px-3">
                        <span className={s.tabSwitches > 0 ? 'text-rose-400 font-bold' : 'opacity-60'}>
                          {s.tabSwitches}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <IDEProvider>
      <AnalyticsInner />
    </IDEProvider>
  );
}

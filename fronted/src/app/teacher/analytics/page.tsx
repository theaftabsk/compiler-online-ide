'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Download, Sun, Moon, PieChart, Users, CheckCircle2, AlertTriangle, Code2 } from 'lucide-react';
import { IDEProvider, useIDE } from '@/context/IDEContext';

function AnalyticsInner() {
  const { theme, toggleTheme, sessionsList, attendees } = useIDE();
  const isDark = theme === 'vs-dark';

  const totalAssigned = attendees.length || 60;
  const coding = attendees.filter(a => a.status === 'CODING').length;
  const submitted = attendees.filter(a => a.status === 'SUBMITTED').length;
  const attendanceRate = Math.round(((coding + submitted) / 48) * 100);
  const passRate = 92.5;

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
              <PieChart className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-xs">Departmental Practical Analytics & Evaluation Report</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 bg-[#0078d4] hover:bg-[#006cc1] text-white font-semibold text-xs rounded flex items-center gap-1.5 transition shadow"
          >
            <Download className="w-3.5 h-3.5" /> Print / Export Formal PDF
          </button>

          <button onClick={toggleTheme} className="p-1.5 rounded hover:bg-gray-700/20">
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#0078d4]" />}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 p-6 max-w-6xl w-full mx-auto space-y-6">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`p-4 rounded-xl border shadow-sm ${isDark ? 'bg-[#1f1f1f] border-[#2b2b2b]' : 'bg-white border-gray-200'}`}>
            <span className="text-[11px] font-bold opacity-60 uppercase">Pass Rate</span>
            <div className="text-2xl font-bold text-emerald-400 mt-1">{passRate}%</div>
            <div className="text-[11px] opacity-70 mt-0.5">Automated test evaluation</div>
          </div>

          <div className={`p-4 rounded-xl border shadow-sm ${isDark ? 'bg-[#1f1f1f] border-[#2b2b2b]' : 'bg-white border-gray-200'}`}>
            <span className="text-[11px] font-bold opacity-60 uppercase">Attendance</span>
            <div className="text-2xl font-bold text-[#0078d4] mt-1">{coding + submitted} / 48</div>
            <div className="text-[11px] opacity-70 mt-0.5">{attendanceRate}% presence in Lab</div>
          </div>

          <div className={`p-4 rounded-xl border shadow-sm ${isDark ? 'bg-[#1f1f1f] border-[#2b2b2b]' : 'bg-white border-gray-200'}`}>
            <span className="text-[11px] font-bold opacity-60 uppercase">Submissions</span>
            <div className="text-2xl font-bold text-purple-400 mt-1">{submitted} Completed</div>
            <div className="text-[11px] opacity-70 mt-0.5">Full test cases passed</div>
          </div>

          <div className={`p-4 rounded-xl border shadow-sm ${isDark ? 'bg-[#1f1f1f] border-[#2b2b2b]' : 'bg-white border-gray-200'}`}>
            <span className="text-[11px] font-bold opacity-60 uppercase">Integrity Score</span>
            <div className="text-2xl font-bold text-cyan-400 mt-1">98.4%</div>
            <div className="text-[11px] opacity-70 mt-0.5">Low tab-switch violations</div>
          </div>
        </div>

        {/* Student Table */}
        <div className={`p-6 rounded-xl border shadow-sm space-y-4 ${isDark ? 'bg-[#1f1f1f] border-[#2b2b2b]' : 'bg-white border-gray-200'}`}>
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold">Practical Session Student Roll & Evaluation Matrix</h2>
            <span className="text-xs font-mono opacity-70">Showing 42 Students</span>
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
                {attendees.filter(a => a.status !== 'EMPTY').map((s) => (
                  <tr key={s.machineNumber} className={`hover:bg-gray-700/10 ${s.isUser ? 'font-bold text-cyan-400' : ''}`}>
                    <td className="py-2.5 px-3">{s.machineNumber}</td>
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
                ))}
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

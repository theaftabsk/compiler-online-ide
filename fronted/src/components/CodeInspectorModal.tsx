'use client';

import React from 'react';
import { X, Code2, AlertTriangle, ShieldCheck, Zap, Copy, Check } from 'lucide-react';
import { MachineAttendee } from '@/types';
import { useIDE } from '@/context/IDEContext';

interface CodeInspectorModalProps {
  attendee: MachineAttendee | null;
  onClose: () => void;
}

export default function CodeInspectorModal({ attendee, onClose }: CodeInspectorModalProps) {
  const { theme } = useIDE();
  const isDark = theme === 'vs-dark';
  const [copied, setCopied] = React.useState(false);

  if (!attendee) return null;

  const handleCopyCode = () => {
    if (attendee.code) {
      navigator.clipboard.writeText(attendee.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 ${
        isDark ? 'bg-[#181818] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        
        {/* Modal Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          isDark ? 'bg-[#1f1f1f] border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-[#0078d4] font-mono font-bold text-white rounded-lg text-xs shadow-sm">
              {attendee.machineNumber}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {attendee.studentName}
                </h3>
                <span className={`text-xs font-mono px-2 py-0.5 rounded border ${
                  isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-700 font-semibold'
                }`}>
                  Roll: {attendee.rollNumber}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Socket.io Sync
                </span>
              </div>
              <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Section: {attendee.section || 'All Batches'} &bull; Real-time Keystroke Stream
              </span>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className={`p-1.5 rounded-lg transition ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-200'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          {/* Key Metrics Bar */}
          <div className={`flex flex-wrap items-center justify-between gap-3 text-xs p-3.5 rounded-xl border ${
            isDark ? 'bg-[#121212] border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center gap-2">
              <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Status:</span>
              <span className={`px-2 py-0.5 rounded font-bold font-mono text-[11px] ${
                attendee.status === 'CODING'
                  ? 'bg-blue-500/10 text-[#0078d4]'
                  : attendee.status === 'SUBMITTED'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-slate-500/10 text-slate-500'
              }`}>
                {attendee.status}
              </span>
            </div>

            <div>
              <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Anti-Cheat Integrity: </span>
              {attendee.tabSwitches > 0 ? (
                <span className="text-amber-600 dark:text-amber-400 font-bold font-mono inline-flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  {attendee.tabSwitches} Tab Switches
                </span>
              ) : (
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold font-mono inline-flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> 100% Focused (0 Violations)
                </span>
              )}
            </div>

            <div>
              <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Language: </span>
              <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold uppercase">{attendee.language || 'c'}</span>
            </div>

            <div>
              <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Score: </span>
              <span className="font-bold font-mono text-indigo-600 dark:text-indigo-400">{attendee.score || 0}% ({attendee.passedCases || '0/4'})</span>
            </div>
          </div>

          {/* Code Viewer */}
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <div className={`flex items-center gap-1.5 font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                <Code2 className="w-4 h-4 text-[#0078d4]" />
                <span>Live Student Code Buffer (Updating on Keystroke via WebSockets):</span>
              </div>
              <button
                onClick={handleCopyCode}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition border ${
                  isDark 
                    ? 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200' 
                    : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-700 shadow-sm'
                }`}
              >
                {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied' : 'Copy Code'}
              </button>
            </div>
            <pre className="bg-[#1e1e1e] p-5 rounded-xl text-xs font-mono text-slate-200 border border-slate-800 overflow-x-auto max-h-96 whitespace-pre-wrap leading-relaxed shadow-inner">
              {attendee.code || '// Student has not written any code yet...'}
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className={`px-6 py-3.5 border-t flex justify-between items-center ${
          isDark ? 'bg-[#1f1f1f] border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Keystrokes streamed instantly through <span className="font-mono text-[#0078d4] font-semibold">Socket.io Gateway</span>
          </span>
          <button 
            onClick={onClose}
            className="px-5 py-2 bg-[#0078d4] hover:bg-[#006cc1] text-white rounded-lg text-xs font-bold transition shadow-sm"
          >
            Done Inspecting
          </button>
        </div>
      </div>
    </div>
  );
}

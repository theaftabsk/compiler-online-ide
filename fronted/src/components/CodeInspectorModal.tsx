'use client';

import React from 'react';
import { X, Code2, AlertTriangle } from 'lucide-react';
import { MachineAttendee } from '@/types';

interface CodeInspectorModalProps {
  attendee: MachineAttendee | null;
  onClose: () => void;
}

export default function CodeInspectorModal({ attendee, onClose }: CodeInspectorModalProps) {
  if (!attendee) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-4xl max-h-[90vh] flex flex-col border border-slate-700 shadow-2xl">
        
        {/* Modal Header */}
        <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 bg-indigo-600 font-mono font-bold text-white rounded text-xs">
              {attendee.machineNumber}
            </span>
            <div>
              <h3 className="font-bold text-sm text-white">{attendee.studentName} (Roll: {attendee.rollNumber})</h3>
              <span className="text-[11px] text-slate-400">Live Code Inspection &bull; {attendee.section}</span>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 flex-1 overflow-y-auto space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Status:</span>
              <span className="font-bold text-emerald-400">{attendee.status}</span>
              {attendee.tabSwitches > 0 && (
                <span className="badge badge-danger flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> {attendee.tabSwitches} Tab Switches
                </span>
              )}
            </div>
            <div>
              <span className="text-slate-400">Language: </span>
              <span className="font-mono text-cyan-400 font-bold uppercase">{attendee.language}</span>
            </div>
            <div>
              <span className="text-slate-400">Score: </span>
              <span className="font-bold text-indigo-400">{attendee.score}% ({attendee.passedCases})</span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1.5">
              <Code2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Student Live Code Editor Buffer:</span>
            </div>
            <pre className="bg-slate-950 p-4 rounded-lg text-xs font-mono text-slate-200 border border-slate-800 overflow-x-auto max-h-80 whitespace-pre-wrap">
              {attendee.code}
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/90 flex justify-end gap-2">
          <button 
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

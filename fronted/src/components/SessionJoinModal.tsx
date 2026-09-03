'use client';

import React, { useState } from 'react';
import { X, Laptop, UserCheck } from 'lucide-react';
import { StudentSessionInfo } from '@/types';

interface SessionJoinModalProps {
  isOpen: boolean;
  currentStudent: StudentSessionInfo;
  onClose: () => void;
  onSave: (updated: Partial<StudentSessionInfo>) => void;
}

export default function SessionJoinModal({ isOpen, currentStudent, onClose, onSave }: SessionJoinModalProps) {
  const [sessionCode, setSessionCode] = useState(currentStudent.sessionCode);
  const [name, setName] = useState(currentStudent.name);
  const [rollNumber, setRollNumber] = useState(currentStudent.rollNumber);
  const [machineNumber, setMachineNumber] = useState(currentStudent.machineNumber);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      sessionCode,
      name,
      rollNumber,
      machineNumber,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-md p-6 border border-slate-700 shadow-2xl">
        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Laptop className="w-5 h-5 text-indigo-400" />
            <h3 className="font-display font-bold text-base text-white">Student Lab Seat Setup</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Session Code</label>
            <input 
              type="text" 
              value={sessionCode}
              onChange={(e) => setSessionCode(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono font-bold focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Student Full Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-medium focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">University Roll</label>
              <input 
                type="text" 
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-cyan-400 font-mono font-bold focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Computer Machine</label>
              <input 
                type="text" 
                value={machineNumber}
                onChange={(e) => setMachineNumber(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-amber-400 font-mono font-bold focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
            <button 
              type="button" 
              onClick={onClose}
              className="px-3 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition font-medium"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg shadow transition flex items-center gap-1.5"
            >
              <UserCheck className="w-4 h-4" /> Connect & Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

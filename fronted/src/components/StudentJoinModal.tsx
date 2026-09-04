'use client';

import React, { useState } from 'react';
import { Key, Hash, User, Monitor, AlertCircle, ArrowRight, X } from 'lucide-react';
import { useIDE } from '@/context/IDEContext';

export default function StudentJoinModal() {
  const { 
    theme, 
    joinSessionModalOpen, 
    setJoinSessionModalOpen, 
    handleStudentJoinSession 
  } = useIDE();

  const isDark = theme === 'vs-dark';

  const [sessionCode, setSessionCode] = useState('LAB-2026');
  const [sessionPass, setSessionPass] = useState('8899');
  const [studentName, setStudentName] = useState('Aftab Sk');
  const [rollNumber, setRollNumber] = useState('538');
  const [machineNumber, setMachineNumber] = useState('PC-14');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!joinSessionModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const res = await handleStudentJoinSession(
        sessionCode,
        sessionPass,
        studentName,
        rollNumber,
        machineNumber
      );

      if (!res.success) {
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to join session');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none animate-in fade-in">
      <div className={`w-full max-w-md p-6 rounded-xl border shadow-2xl space-y-5 ${isDark ? 'bg-[#1f1f1f] border-[#333] text-white' : 'bg-white border-gray-300 text-gray-800'}`}>
        
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-3">
          <div className="flex items-center gap-2 font-bold text-sm">
            <Key className="w-4 h-4 text-[#0078d4]" />
            <span>Join Secured Practical Lab Session</span>
          </div>
          <button 
            onClick={() => setJoinSessionModalOpen(false)}
            className="p-1 opacity-60 hover:opacity-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs opacity-75">
          Enter the <strong>Session Code & Password</strong> provided by your lab faculty to authenticate your computer seat.
        </p>

        {errorMsg && (
          <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1 opacity-80 flex items-center gap-1">
                <Hash className="w-3 h-3 text-[#0078d4]" /> Session Code
              </label>
              <input
                type="text"
                value={sessionCode}
                onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                placeholder="e.g. LAB-2026"
                required
                className={`w-full p-2 rounded border font-mono uppercase focus:outline-none focus:border-[#0078d4] ${isDark ? 'bg-[#141414] border-[#333]' : 'bg-white border-gray-300'}`}
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 opacity-80 flex items-center gap-1">
                <Key className="w-3 h-3 text-amber-400" /> Lab Password
              </label>
              <input
                type="password"
                value={sessionPass}
                onChange={(e) => setSessionPass(e.target.value)}
                placeholder="••••"
                required
                className={`w-full p-2 rounded border font-mono focus:outline-none focus:border-[#0078d4] ${isDark ? 'bg-[#141414] border-[#333]' : 'bg-white border-gray-300'}`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1 opacity-80 flex items-center gap-1">
                <User className="w-3 h-3 text-cyan-400" /> Student Name
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Your Full Name"
                required
                className={`w-full p-2 rounded border focus:outline-none focus:border-[#0078d4] ${isDark ? 'bg-[#141414] border-[#333]' : 'bg-white border-gray-300'}`}
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 opacity-80">Roll Number</label>
              <input
                type="text"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                placeholder="e.g. 538"
                required
                className={`w-full p-2 rounded border font-mono focus:outline-none focus:border-[#0078d4] ${isDark ? 'bg-[#141414] border-[#333]' : 'bg-white border-gray-300'}`}
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1 opacity-80 flex items-center gap-1">
              <Monitor className="w-3 h-3 text-emerald-400" /> Physical PC / Seat Number
            </label>
            <input
              type="text"
              value={machineNumber}
              onChange={(e) => setMachineNumber(e.target.value.toUpperCase())}
              placeholder="e.g. PC-14"
              required
              className={`w-full p-2 rounded border font-mono uppercase focus:outline-none focus:border-[#0078d4] ${isDark ? 'bg-[#141414] border-[#333]' : 'bg-white border-gray-300'}`}
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setJoinSessionModalOpen(false)}
              className="px-4 py-2 border rounded hover:bg-gray-700/20"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-[#0078d4] hover:bg-[#006cc1] disabled:opacity-50 text-white font-bold rounded flex items-center gap-1.5 shadow"
            >
              {isSubmitting ? 'Authenticating...' : 'Authenticate & Enter Lab'} <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

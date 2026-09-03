'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Code2, ArrowLeft, Sun, Moon, Lock, Mail, ShieldCheck, ArrowRight } from 'lucide-react';
import { IDEProvider, useIDE } from '@/context/IDEContext';

function TeacherLoginInner() {
  const router = useRouter();
  const { theme, toggleTheme, handleTeacherLogin } = useIDE();
  const isDark = theme === 'vs-dark';

  const [email, setEmail] = useState('faculty@university.edu');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const success = handleTeacherLogin(email, password);
    if (success) {
      router.push('/teacher');
    } else {
      setError('Invalid faculty credentials. Please check your email and password.');
    }
  };

  return (
    <div className={`min-h-screen w-screen flex flex-col justify-between p-6 select-none ${isDark ? 'bg-[#141414] text-[#cccccc]' : 'bg-[#f8f9fa] text-[#212529]'}`}>
      
      {/* Top Header */}
      <header className="flex justify-between items-center max-w-5xl w-full mx-auto">
        <Link href="/" className="flex items-center gap-2 font-bold text-sm hover:opacity-80 transition">
          <div className="w-6 h-6 rounded bg-[#0078d4] flex items-center justify-center text-[10px] text-white shadow">
            <Code2 className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold tracking-wide text-base">CodeLab <span className="text-[#0078d4]">IDE</span></span>
        </Link>

        <button 
          onClick={toggleTheme}
          className="p-2 rounded-lg border hover:bg-gray-700/20 transition text-xs flex items-center gap-2"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#0078d4]" />}
          <span className="text-xs font-semibold">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center py-8">
        <div className={`w-full max-w-md p-8 rounded-2xl border shadow-2xl space-y-6 ${isDark ? 'bg-[#1f1f1f] border-[#2b2b2b]' : 'bg-white border-gray-200'}`}>
          
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-[#0078d4]/10 border border-[#0078d4]/30 text-[#0078d4] flex items-center justify-center mx-auto mb-3 shadow-inner">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-bold">Faculty & Teacher Portal</h1>
            <p className="text-xs opacity-70 max-w-xs mx-auto">
              Sign in to manage practical sessions, auto-generate student PINs, and monitor connected lab machines.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold mb-1.5 opacity-80 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#0078d4]" /> Faculty Email ID
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="faculty@university.edu"
                required
                className={`w-full p-3 rounded-lg border text-xs font-mono focus:outline-none focus:border-[#0078d4] transition ${isDark ? 'bg-[#141414] border-[#333] text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              />
            </div>

            <div>
              <label className="block font-semibold mb-1.5 opacity-80 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" /> Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className={`w-full p-3 rounded-lg border text-xs font-mono focus:outline-none focus:border-[#0078d4] transition ${isDark ? 'bg-[#141414] border-[#333] text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#0078d4] hover:bg-[#006cc1] text-white font-bold rounded-lg text-xs transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              Sign In to Teacher Dashboard <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Prominent Back Link at the bottom */}
          <div className="pt-4 text-center border-t border-gray-700/20">
            <Link 
              href="/"
              className="text-xs font-semibold text-[#0078d4] hover:underline inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Public Online Compiler
            </Link>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs opacity-60">
        CodeLab Online IDE &bull; Multi-Tenant Academic Practical System
      </footer>

    </div>
  );
}

export default function TeacherLoginPage() {
  return (
    <IDEProvider>
      <TeacherLoginInner />
    </IDEProvider>
  );
}

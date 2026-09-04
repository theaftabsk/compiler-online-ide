'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Code2, 
  Sun, 
  Moon, 
  Lock, 
  Mail, 
  ShieldCheck, 
  ArrowRight, 
  User, 
  Building2, 
  GraduationCap, 
  Eye, 
  EyeOff, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  Zap
} from 'lucide-react';
import { useTeacherAuth } from '@/context/TeacherAuthContext';

export default function TeacherAuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-[#121212] text-white">
        <Loader2 className="w-8 h-8 animate-spin text-[#0078d4] mb-3" />
        <p className="text-xs opacity-70">Loading Faculty Authentication...</p>
      </div>
    }>
      <TeacherAuthContent />
    </Suspense>
  );
}

function TeacherAuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/teacher';

  const { login, register, isAuthenticated } = useTeacherAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [theme, setTheme] = useState<'vs-dark' | 'vs-light'>('vs-dark');
  const isDark = theme === 'vs-dark';

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form state
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regInstitution, setRegInstitution] = useState('');
  const [regDepartment, setRegDepartment] = useState('Computer Science & Engineering');
  const [regDesignation, setRegDesignation] = useState('Assistant Professor');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Status state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // If already authenticated, redirect
  React.useEffect(() => {
    if (isAuthenticated) {
      router.push(redirectUrl);
    }
  }, [isAuthenticated, router, redirectUrl]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'vs-dark' ? 'vs-light' : 'vs-dark'));
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setErrorMsg('Please fill in both email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await login(loginEmail.trim(), loginPassword);
      if (res.success) {
        setSuccessMsg('Authentication successful! Loading portal...');
        setTimeout(() => {
          router.push(redirectUrl);
        }, 600);
      } else {
        setErrorMsg(res.error || 'Authentication failed. Please verify your credentials.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to connect to authentication server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!regFullName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    if (regPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await register({
        fullName: regFullName.trim(),
        email: regEmail.trim(),
        password: regPassword,
        institutionName: regInstitution.trim() || 'University Partner',
        departmentName: regDepartment.trim() || 'Computer Science',
        designation: regDesignation.trim() || 'Faculty',
      });

      if (res.success) {
        setSuccessMsg('Faculty registration successful! Redirecting to Teacher Portal...');
        setTimeout(() => {
          router.push(redirectUrl);
        }, 800);
      } else {
        setErrorMsg(res.error || 'Registration failed. Email might already be taken.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to communicate with the server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoTeacher = () => {
    setLoginEmail('faculty@university.edu');
    setLoginPassword('admin123');
  };

  return (
    <div className={`min-h-screen w-screen flex flex-col justify-between p-4 md:p-8 select-none transition-colors duration-200 ${isDark ? 'bg-[#121212] text-[#cccccc]' : 'bg-[#f4f6f9] text-[#212529]'}`}>
      
      {/* Top Header */}
      <header className="flex justify-between items-center max-w-5xl w-full mx-auto pb-4">
        <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0078d4] to-[#00a2ff] flex items-center justify-center text-white shadow-lg shadow-[#0078d4]/20 group-hover:scale-105 transition-transform">
            <Code2 className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold tracking-tight text-base flex items-center gap-2">
              <span>Kaspro <span className="text-[#0078d4]">Compiler</span></span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#0078d4]/10 text-[#0078d4] border border-[#0078d4]/20">
                ITVEXO
              </span>
            </div>
            <p className="text-[11px] opacity-60 hidden sm:block">Centralized Digital Programming Laboratory</p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link 
            href="/" 
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-transparent hover:border-gray-700/30 hover:bg-gray-700/10 transition"
          >
            ← Open IDE
          </Link>
          <button 
            onClick={toggleTheme}
            className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 transition ${isDark ? 'border-[#333] hover:bg-[#222]' : 'border-gray-200 hover:bg-gray-100'}`}
            title="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#0078d4]" />}
          </button>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="flex-1 flex items-center justify-center py-6">
        <div className={`w-full max-w-lg p-6 sm:p-8 rounded-3xl border shadow-2xl backdrop-blur-md transition-all ${isDark ? 'bg-[#1a1a1a]/95 border-[#2e2e2e] shadow-black/40' : 'bg-white border-gray-200 shadow-xl'}`}>
          
          {/* Badge & Title */}
          <div className="text-center space-y-2 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-[#0078d4]/10 border border-[#0078d4]/30 text-[#0078d4] flex items-center justify-center mx-auto mb-3 shadow-inner">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Faculty & Teacher Portal</h1>
            <p className="text-xs opacity-70 max-w-sm mx-auto">
              Secure institutional access for computer science professors, lab examiners, and academic evaluators.
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className={`flex p-1 rounded-2xl border mb-6 ${isDark ? 'bg-[#141414] border-[#2b2b2b]' : 'bg-gray-100 border-gray-200'}`}>
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMsg(null); setSuccessMsg(null); }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                mode === 'login' 
                  ? (isDark ? 'bg-[#252525] text-white shadow' : 'bg-white text-gray-900 shadow') 
                  : 'opacity-60 hover:opacity-100'
              }`}
            >
              <Lock className="w-3.5 h-3.5" /> Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setErrorMsg(null); setSuccessMsg(null); }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                mode === 'register' 
                  ? (isDark ? 'bg-[#252525] text-white shadow' : 'bg-white text-gray-900 shadow') 
                  : 'opacity-60 hover:opacity-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Register Faculty
            </button>
          </div>

          {/* Feedback Messages */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium flex items-start gap-2.5 mb-4 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">{errorMsg}</div>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-center gap-2.5 mb-4 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <div className="flex-1">{successMsg}</div>
            </div>
          )}

          {/* MODE 1: LOGIN */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1.5 opacity-80 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#0078d4]" /> Official Faculty Email ID
                </label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="faculty@university.edu"
                  required
                  autoComplete="email"
                  className={`w-full p-3 rounded-xl border text-xs font-mono focus:outline-none focus:border-[#0078d4] transition ${isDark ? 'bg-[#141414] border-[#333] text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="font-semibold opacity-80 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-400" /> Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="text-[11px] opacity-60 hover:opacity-100 flex items-center gap-1"
                  >
                    {showLoginPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    {showLoginPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className={`w-full p-3 rounded-xl border text-xs font-mono focus:outline-none focus:border-[#0078d4] transition ${isDark ? 'bg-[#141414] border-[#333] text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-[11px] opacity-80">
                  <input type="checkbox" defaultChecked className="rounded text-[#0078d4]" />
                  Remember this device for 7 days
                </label>
                <button
                  type="button"
                  onClick={fillDemoTeacher}
                  className="text-[11px] text-[#0078d4] hover:underline flex items-center gap-1 font-semibold"
                >
                  <Zap className="w-3 h-3" /> Fill Demo Credentials
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#0078d4] to-[#005a9e] hover:from-[#006cbd] hover:to-[#004e8a] text-white font-bold text-xs tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-[#0078d4]/30 hover:scale-[1.01] active:scale-[0.99] transition duration-200 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Verifying Credentials...
                  </>
                ) : (
                  <>
                    Sign In to Portal <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* MODE 2: REGISTER */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold mb-1 opacity-80 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#0078d4]" /> Full Name & Title
                </label>
                <input
                  type="text"
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder="Prof. Aftab Sk"
                  required
                  className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#0078d4] transition ${isDark ? 'bg-[#141414] border-[#333] text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 opacity-80 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#0078d4]" /> Official Faculty Email ID
                </label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="aftab@university.edu"
                  required
                  className={`w-full p-2.5 rounded-xl border text-xs font-mono focus:outline-none focus:border-[#0078d4] transition ${isDark ? 'bg-[#141414] border-[#333] text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 opacity-80 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-indigo-400" /> College / University
                  </label>
                  <input
                    type="text"
                    value={regInstitution}
                    onChange={(e) => setRegInstitution(e.target.value)}
                    placeholder="Brainware University"
                    className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#0078d4] transition ${isDark ? 'bg-[#141414] border-[#333] text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 opacity-80 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-400" /> Department
                  </label>
                  <input
                    type="text"
                    value={regDepartment}
                    onChange={(e) => setRegDepartment(e.target.value)}
                    placeholder="Computer Science & AI"
                    className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#0078d4] transition ${isDark ? 'bg-[#141414] border-[#333] text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-semibold opacity-80 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-amber-400" /> Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="text-[10px] opacity-60 hover:opacity-100"
                    >
                      {showRegPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    required
                    className={`w-full p-2.5 rounded-xl border text-xs font-mono focus:outline-none focus:border-[#0078d4] transition ${isDark ? 'bg-[#141414] border-[#333] text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 opacity-80 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-400" /> Confirm Password
                  </label>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    required
                    className={`w-full p-2.5 rounded-xl border text-xs font-mono focus:outline-none focus:border-[#0078d4] transition ${isDark ? 'bg-[#141414] border-[#333] text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 hover:scale-[1.01] active:scale-[0.99] transition duration-200 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Registering Faculty...
                  </>
                ) : (
                  <>
                    Create Faculty Account <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Security Guarantee */}
          <div className="mt-6 pt-4 border-t border-dashed border-gray-700/30 text-center">
            <div className="flex items-center justify-center gap-2 text-[11px] opacity-60">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Bcrypt 256-bit Salted Hash • Protected by Kaspro Security Engine</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-[11px] opacity-50 py-2">
        Kaspro Online Compiler & Digital Lab Portal • Product of ITVEXO • All Rights Reserved © 2026
      </footer>
    </div>
  );
}

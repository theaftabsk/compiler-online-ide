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
  ArrowLeft,
  User,
  Building2,
  GraduationCap,
  Eye, 
  EyeOff, 
  Loader2, 
  AlertCircle,
  CheckCircle2,
  Radio,
  Cpu,
  MonitorCheck,
  Sparkles,
  Users
} from 'lucide-react';
import { useTeacherAuth } from '@/context/TeacherAuthContext';

export default function TeacherRegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-[#0d1117] text-white">
        <Loader2 className="w-8 h-8 animate-spin text-[#0078d4] mb-3" />
        <p className="text-xs opacity-70 font-mono">Loading Faculty Registration...</p>
      </div>
    }>
      <TeacherRegisterContent />
    </Suspense>
  );
}

function TeacherRegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/teacher';

  const { register, isAuthenticated } = useTeacherAuth();

  const [theme, setTheme] = useState<'vs-dark' | 'vs-light'>('vs-dark');
  const isDark = theme === 'vs-dark';

  // Registration Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [institution, setInstitution] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [designation, setDesignation] = useState('Assistant Professor');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (isAuthenticated) {
      router.push(redirectUrl);
    }
  }, [isAuthenticated, router, redirectUrl]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'vs-dark' ? 'vs-light' : 'vs-dark'));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await register({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        institutionName: institution.trim() || 'University Partner',
        departmentName: department.trim() || 'Computer Science',
        designation: designation.trim() || 'Faculty Member',
      });

      if (res.success) {
        setSuccessMsg('Faculty registration successful! Loading your portal...');
        setTimeout(() => {
          router.push(redirectUrl);
        }, 600);
      } else {
        setErrorMsg(res.error || 'Registration failed. Email address may already be registered.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to communicate with authentication server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen w-screen flex flex-col lg:flex-row select-none overflow-x-hidden ${isDark ? 'bg-[#0f1117] text-[#e6edf3]' : 'bg-[#f6f8fa] text-[#1f2328]'}`}>
      
      {/* LEFT SIDE: Premium Showcase Hero */}
      <div className="lg:w-5/12 relative bg-gradient-to-br from-[#0a0d14] via-[#0d1424] to-[#070b14] text-white p-8 lg:p-14 flex flex-col justify-between overflow-hidden border-b lg:border-b-0 lg:border-r border-[#1f293d]">
        
        {/* Glowing Background Radial Accents */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#0078d4]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Branding */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0078d4] to-[#00c6ff] flex items-center justify-center text-white shadow-xl shadow-[#0078d4]/25 group-hover:scale-105 transition-transform">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold tracking-tight text-lg flex items-center gap-2">
                <span>Kaspro <span className="text-[#00a2ff]">Compiler</span></span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#0078d4]/20 text-[#00a2ff] border border-[#0078d4]/30">
                  ITVEXO
                </span>
              </div>
              <p className="text-[11px] text-gray-400">Institutional Programming & Lab Platform</p>
            </div>
          </Link>
        </div>

        {/* Center Content */}
        <div className="relative z-10 my-8 lg:my-0 space-y-6 max-w-md">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Join 100+ Computer Science Departments</span>
          </div>

          <h2 className="text-3xl font-black tracking-tight leading-tight">
            Create your university lab in <span className="bg-gradient-to-r from-emerald-400 to-[#00a2ff] bg-clip-text text-transparent">under 60 seconds</span>.
          </h2>

          <p className="text-sm text-gray-400 leading-relaxed">
            Register your faculty account to host secure programming practicals, auto-grade students with hidden test cases, and monitor all machines in real time.
          </p>

          {/* Quick Perks */}
          <div className="space-y-3 pt-2 text-xs">
            <div className="flex items-start gap-3 text-gray-300">
              <div className="w-5 h-5 rounded-full bg-[#0078d4]/20 text-[#00a2ff] flex items-center justify-center shrink-0 mt-0.5">
                ✓
              </div>
              <span>Automated testcase grading with real-time pass/fail metrics.</span>
            </div>

            <div className="flex items-start gap-3 text-gray-300">
              <div className="w-5 h-5 rounded-full bg-[#0078d4]/20 text-[#00a2ff] flex items-center justify-center shrink-0 mt-0.5">
                ✓
              </div>
              <span>Anti-cheat monitoring with browser tab-switch counters.</span>
            </div>

            <div className="flex items-start gap-3 text-gray-300">
              <div className="w-5 h-5 rounded-full bg-[#0078d4]/20 text-[#00a2ff] flex items-center justify-center shrink-0 mt-0.5">
                ✓
              </div>
              <span>One-click lab session creation with auto-generated student PINs.</span>
            </div>
          </div>
        </div>

        {/* Bottom Social Proof */}
        <div className="relative z-10 pt-4 flex items-center justify-between border-t border-[#1f293d]/80 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <span>Used by B.Tech, BCA & MCA Labs</span>
          </div>
          <div className="font-mono text-[11px] opacity-75">
            NO CREDIT CARD REQUIRED
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Spacious Clean Register Form */}
      <div className="lg:w-7/12 flex flex-col justify-between p-6 sm:p-10 lg:p-14">
        
        {/* Top Controls */}
        <div className="flex items-center justify-between w-full max-w-xl mx-auto">
          <Link 
            href="/teacher/login" 
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition ${isDark ? 'border-[#2d333b] hover:bg-[#1f242c] text-gray-300' : 'border-gray-200 hover:bg-gray-100 text-gray-700'}`}
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
          </Link>

          <button 
            onClick={toggleTheme}
            className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 transition ${isDark ? 'border-[#2d333b] hover:bg-[#1f242c]' : 'border-gray-200 hover:bg-gray-100'}`}
            title="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#0078d4]" />}
          </button>
        </div>

        {/* Center Form Area */}
        <div className="w-full max-w-xl mx-auto my-auto py-6">
          
          <div className="space-y-1.5 mb-6">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Register New Faculty</h1>
            <p className="text-xs opacity-70">
              Create your institutional account to conduct university lab sessions and auto-grade assignments.
            </p>
          </div>

          {/* Feedback Alerts */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium flex items-start gap-2.5 mb-4 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{errorMsg}</div>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-center gap-2.5 mb-4 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <div className="flex-1">{successMsg}</div>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4 text-xs">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1.5 opacity-85 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#0078d4]" /> Full Name & Title
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Prof. Aftab Sk"
                  required
                  className={`w-full p-3 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-[#0078d4] transition ${
                    isDark 
                      ? 'bg-[#161b22] border-[#30363d] text-white focus:border-transparent' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-transparent shadow-sm'
                  }`}
                />
              </div>

              <div>
                <label className="block font-semibold mb-1.5 opacity-85 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#0078d4]" /> Official University Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="faculty@university.edu"
                  required
                  autoComplete="email"
                  className={`w-full p-3 rounded-xl border text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#0078d4] transition ${
                    isDark 
                      ? 'bg-[#161b22] border-[#30363d] text-white focus:border-transparent' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-transparent shadow-sm'
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1.5 opacity-85 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-indigo-400" /> College / University Name
                </label>
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="Brainware University"
                  className={`w-full p-3 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-[#0078d4] transition ${
                    isDark 
                      ? 'bg-[#161b22] border-[#30363d] text-white focus:border-transparent' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-transparent shadow-sm'
                  }`}
                />
              </div>

              <div>
                <label className="block font-semibold mb-1.5 opacity-85 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-400" /> Department
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Computer Science & Engineering"
                  className={`w-full p-3 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-[#0078d4] transition ${
                    isDark 
                      ? 'bg-[#161b22] border-[#30363d] text-white focus:border-transparent' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-transparent shadow-sm'
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="font-semibold opacity-85 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-400" /> Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] opacity-60 hover:opacity-100 flex items-center gap-1"
                  >
                    {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  required
                  className={`w-full p-3 rounded-xl border text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#0078d4] transition ${
                    isDark 
                      ? 'bg-[#161b22] border-[#30363d] text-white focus:border-transparent' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-transparent shadow-sm'
                  }`}
                />
              </div>

              <div>
                <label className="block font-semibold mb-1.5 opacity-85 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" /> Confirm Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  required
                  className={`w-full p-3 rounded-xl border text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#0078d4] transition ${
                    isDark 
                      ? 'bg-[#161b22] border-[#30363d] text-white focus:border-transparent' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-transparent shadow-sm'
                  }`}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-3 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 hover:scale-[1.01] active:scale-[0.99] transition duration-200 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Creating Faculty Account...
                </>
              ) : (
                <>
                  Complete Faculty Registration <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Switch to Login Page */}
          <div className="mt-6 pt-5 border-t border-gray-700/20 text-center space-y-2">
            <p className="text-xs opacity-75">
              Already registered as a faculty member?
            </p>
            <Link
              href="/teacher/login"
              className={`inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border text-xs font-bold transition ${
                isDark 
                  ? 'border-[#30363d] hover:bg-[#1c2128] text-[#58a6ff]' 
                  : 'border-gray-200 hover:bg-gray-100 text-[#0078d4]'
              }`}
            >
              Sign In to Existing Account <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] opacity-50">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Institutional Data Protection • PostgreSQL Cloud Storage</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-[11px] opacity-40 pt-4">
          Kaspro Online Compiler & Digital Lab Portal • Product of ITVEXO • © 2026
        </div>
      </div>
    </div>
  );
}

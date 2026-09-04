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
  Eye, 
  EyeOff, 
  Loader2, 
  AlertCircle,
  CheckCircle2,
  Zap,
  Radio,
  Cpu,
  MonitorCheck,
  Award
} from 'lucide-react';
import { useTeacherAuth } from '@/context/TeacherAuthContext';

export default function TeacherLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-[#0d1117] text-white">
        <Loader2 className="w-8 h-8 animate-spin text-[#0078d4] mb-3" />
        <p className="text-xs opacity-70 font-mono">Loading Faculty Portal...</p>
      </div>
    }>
      <TeacherLoginContent />
    </Suspense>
  );
}

function TeacherLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/teacher';

  const { login, isAuthenticated } = useTeacherAuth();

  const [theme, setTheme] = useState<'vs-dark' | 'vs-light'>('vs-dark');
  const isDark = theme === 'vs-dark';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await login(email.trim(), password);
      if (res.success) {
        setSuccessMsg('Welcome back! Launching your control panel...');
        setTimeout(() => {
          router.push(redirectUrl);
        }, 500);
      } else {
        setErrorMsg(res.error || 'Invalid email or password. Please verify your credentials.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to connect to authentication server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail('faculty@university.edu');
    setPassword('admin123');
  };

  return (
    <div className={`min-h-screen w-screen flex flex-col lg:flex-row select-none overflow-x-hidden ${isDark ? 'bg-[#0f1117] text-[#e6edf3]' : 'bg-[#f6f8fa] text-[#1f2328]'}`}>
      
      {/* LEFT SIDE: Premium Showcase Hero */}
      <div className="lg:w-1/2 relative bg-gradient-to-br from-[#0a0d14] via-[#0d1424] to-[#070b14] text-white p-8 lg:p-14 flex flex-col justify-between overflow-hidden border-b lg:border-b-0 lg:border-r border-[#1f293d]">
        
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

        {/* Center Hero Content */}
        <div className="relative z-10 my-10 lg:my-0 space-y-6 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0078d4]/10 border border-[#0078d4]/30 text-[#00a2ff] text-xs font-semibold">
            <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
            <span>Digital Classroom & Exam Controller</span>
          </div>

          <h2 className="text-3xl lg:text-4xl font-black tracking-tight leading-tight">
            Manage student labs with <span className="bg-gradient-to-r from-[#00a2ff] via-[#38bdf8] to-emerald-400 bg-clip-text text-transparent">real-time precision</span>.
          </h2>

          <p className="text-sm text-gray-400 leading-relaxed">
            Monitor connected computer lab machines, auto-generate unique session PINs, inspect live code streams, and auto-evaluate practical programs in 30 milliseconds.
          </p>

          {/* Feature Badges Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            <div className="p-4 rounded-2xl bg-[#141c2e]/70 border border-[#23314f] backdrop-blur-md space-y-1">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                <MonitorCheck className="w-4 h-4" /> Live Machine Grid
              </div>
              <p className="text-[11px] text-gray-400">Real-time status of 60+ workstations with tab-switch warnings.</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#141c2e]/70 border border-[#23314f] backdrop-blur-md space-y-1">
              <div className="flex items-center gap-2 text-[#00a2ff] text-xs font-bold">
                <Cpu className="w-4 h-4" /> Native GCC 13 Sandbox
              </div>
              <p className="text-[11px] text-gray-400">Sub-50ms code compilation with full scanf & cin stdin support.</p>
            </div>
          </div>
        </div>

        {/* Bottom Social Proof */}
        <div className="relative z-10 pt-4 flex items-center justify-between border-t border-[#1f293d]/80 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Enterprise University Standard</span>
          </div>
          <div className="flex gap-4 font-mono text-[11px] opacity-75">
            <span>99.9% UPTIME</span>
            <span>•</span>
            <span>34ms COMPILATION</span>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Clean, Focused Login Form */}
      <div className="lg:w-1/2 flex flex-col justify-between p-6 sm:p-10 lg:p-14">
        
        {/* Top Controls */}
        <div className="flex items-center justify-between w-full max-w-md mx-auto">
          <Link 
            href="/" 
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition ${isDark ? 'border-[#2d333b] hover:bg-[#1f242c] text-gray-300' : 'border-gray-200 hover:bg-gray-100 text-gray-700'}`}
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to IDE
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
        <div className="w-full max-w-md mx-auto my-auto py-8">
          
          <div className="space-y-2 mb-8">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Faculty Sign In</h1>
            <p className="text-xs opacity-70">
              Access your digital laboratory dashboard, student PINs, and automated test evaluations.
            </p>
          </div>

          {/* Feedback Alerts */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium flex items-start gap-2.5 mb-5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{errorMsg}</div>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-center gap-2.5 mb-5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <div className="flex-1">{successMsg}</div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold mb-1.5 opacity-85 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#0078d4]" /> Official Faculty Email ID
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="faculty@university.edu"
                required
                autoComplete="email"
                className={`w-full p-3.5 rounded-xl border text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#0078d4] transition ${
                  isDark 
                    ? 'bg-[#161b22] border-[#30363d] text-white focus:border-transparent' 
                    : 'bg-white border-gray-300 text-gray-900 focus:border-transparent shadow-sm'
                }`}
              />
            </div>

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
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className={`w-full p-3.5 rounded-xl border text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#0078d4] transition ${
                  isDark 
                    ? 'bg-[#161b22] border-[#30363d] text-white focus:border-transparent' 
                    : 'bg-white border-gray-300 text-gray-900 focus:border-transparent shadow-sm'
                }`}
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-[11px] opacity-75">
                <input type="checkbox" defaultChecked className="rounded text-[#0078d4] focus:ring-0" />
                Remember session
              </label>
              <button
                type="button"
                onClick={fillDemoCredentials}
                className="text-[11px] text-[#0078d4] hover:underline flex items-center gap-1 font-semibold"
              >
                <Zap className="w-3 h-3 text-amber-400" /> Fill Demo Credentials
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 mt-2 rounded-xl bg-gradient-to-r from-[#0078d4] to-[#005a9e] hover:from-[#006cbd] hover:to-[#004e8a] text-white font-bold text-xs tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-[#0078d4]/25 hover:scale-[1.01] active:scale-[0.99] transition duration-200 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Authenticating...
                </>
              ) : (
                <>
                  Sign In to Faculty Portal <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Switch to Separate Register Page */}
          <div className="mt-8 pt-6 border-t border-gray-700/20 text-center space-y-3">
            <p className="text-xs opacity-75">
              New faculty member or university lab examiner?
            </p>
            <Link
              href="/teacher/register"
              className={`inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border text-xs font-bold transition ${
                isDark 
                  ? 'border-[#30363d] hover:bg-[#1c2128] text-[#58a6ff]' 
                  : 'border-gray-200 hover:bg-gray-100 text-[#0078d4]'
              }`}
            >
              Create New Faculty Account <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] opacity-50">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>256-bit Encrypted Session • Powered by ITVEXO</span>
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

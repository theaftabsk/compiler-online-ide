'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Hash, 
  Key, 
  Users, 
  Clock, 
  Copy, 
  Check, 
  ArrowLeft, 
  Sun, 
  Moon, 
  LogOut, 
  Code2, 
  Radio, 
  ExternalLink,
  PieChart,
  Loader2,
  ShieldCheck,
  Power,
  Play,
  Pause,
  Trash2,
  Eye,
  AlertTriangle,
  RefreshCw,
  Search,
  Sparkles,
  Monitor,
  CheckCircle2,
  XCircle,
  FileText
} from 'lucide-react';
import { IDEProvider, useIDE } from '@/context/IDEContext';
import { useTeacherAuth } from '@/context/TeacherAuthContext';
import CodeInspectorModal from '@/components/CodeInspectorModal';

interface SessionAttendeeDetail {
  machineNumber: string;
  studentName: string;
  rollNumber: string;
  section?: string;
  status: string;
  language?: string;
  score: number;
  passedCases: string;
  tabSwitches: number;
  isUser: boolean;
  code: string;
  lastHeartbeat?: string;
}

interface SessionGridResponse {
  session: any;
  stats: {
    totalCapacity: number;
    joinedStudents: number;
    codingCount: number;
    submittedCount: number;
    offlineCount: number;
    totalViolations: number;
  };
  attendees: SessionAttendeeDetail[];
}

function TeacherDashboardInner() {
  const router = useRouter();
  const { teacher, isAuthenticated, isLoading, logout } = useTeacherAuth();
  const { 
    theme, 
    toggleTheme, 
    sessionsList, 
    handleTeacherLogout,
    inspectedAttendee,
    setInspectedAttendee,
    fetchSessions,
  } = useIDE();

  const isDark = theme === 'vs-dark';
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedSessionCode, setSelectedSessionCode] = useState<string | null>(null);
  const [sessionGridData, setSessionGridData] = useState<SessionGridResponse | null>(null);
  const [loadingGrid, setLoadingGrid] = useState<boolean>(false);
  const [statusUpdatingCode, setStatusUpdatingCode] = useState<string | null>(null);
  const [studentSearch, setStudentSearch] = useState<string>('');
  const [filterTab, setFilterTab] = useState<'all' | 'coding' | 'submitted' | 'violations'>('all');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // 1. Auto-fetch sessions list from PostgreSQL on mount and every 8 seconds
  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 8000);
    return () => clearInterval(interval);
  }, [fetchSessions]);

  // Set default selected session if none selected and sessions exist
  useEffect(() => {
    if (sessionsList.length > 0 && !selectedSessionCode) {
      setSelectedSessionCode(sessionsList[0].sessionCode);
    }
  }, [sessionsList, selectedSessionCode]);

  // 2. Fetch full real-time details & student attendees for the selected session
  const fetchSessionDetails = useCallback(async (code: string) => {
    if (!code) return;
    try {
      setLoadingGrid(true);
      const res = await fetch(`/api/sessions/${code}/grid`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setSessionGridData(data);
        }
      }
    } catch (err) {
      console.error('Failed to load session details:', err);
    } finally {
      setLoadingGrid(false);
      setIsRefreshing(false);
    }
  }, []);

  // Poll selected session grid every 5 seconds for live code typing & student join updates
  useEffect(() => {
    if (selectedSessionCode) {
      fetchSessionDetails(selectedSessionCode);
      const interval = setInterval(() => {
        fetchSessionDetails(selectedSessionCode);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedSessionCode, fetchSessionDetails]);

  // Authentication Guard
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/teacher/login?redirect=/teacher');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className={`min-h-screen w-screen flex flex-col items-center justify-center ${isDark ? 'bg-[#181818] text-white' : 'bg-gray-50 text-gray-800'}`}>
        <Loader2 className="w-8 h-8 animate-spin text-[#0078d4] mb-3" />
        <p className="text-xs opacity-70 font-mono">Loading PostgreSQL Lab Sessions...</p>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  // Clipboard helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Toggle Session ON / OFF (ACTIVE <-> PAUSED)
  const handleToggleStatus = async (session: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = session.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    try {
      setStatusUpdatingCode(session.sessionCode);
      const res = await fetch(`/api/sessions/${session.sessionCode}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        await fetchSessions();
        if (selectedSessionCode === session.sessionCode) {
          await fetchSessionDetails(session.sessionCode);
        }
      }
    } catch (err) {
      console.error('Failed to toggle session status:', err);
    } finally {
      setStatusUpdatingCode(null);
    }
  };

  // Delete Session
  const handleDeleteSession = async (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Are you sure you want to delete session ${code}? This will remove all student scores for this lab.`)) return;
    try {
      const res = await fetch(`/api/sessions/${code}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchSessions();
        if (selectedSessionCode === code) {
          setSelectedSessionCode(null);
          setSessionGridData(null);
        }
      }
    } catch (err) {
      console.error('Failed to delete session:', err);
    }
  };

  const onSignOut = () => {
    logout();
    handleTeacherLogout();
    router.push('/teacher/login');
  };

  // Active attendees for the selected session
  const realAttendees = (sessionGridData?.attendees || []).filter(a => a.status !== 'EMPTY');
  
  // Filtered attendees based on search and active tab
  const filteredAttendees = realAttendees.filter((a) => {
    const matchesSearch = 
      a.studentName.toLowerCase().includes(studentSearch.toLowerCase()) ||
      a.rollNumber.toLowerCase().includes(studentSearch.toLowerCase()) ||
      a.machineNumber.toLowerCase().includes(studentSearch.toLowerCase());

    if (!matchesSearch) return false;

    if (filterTab === 'coding') return a.status === 'CODING';
    if (filterTab === 'submitted') return a.status === 'SUBMITTED';
    if (filterTab === 'violations') return a.tabSwitches > 0;
    return true;
  });

  return (
    <div className={`min-h-screen w-screen flex flex-col select-none overflow-x-hidden ${isDark ? 'bg-[#121212] text-[#cccccc]' : 'bg-[#f4f6f8] text-[#24292e]'}`}>
      
      {/* 1. Top Navigation Bar */}
      <header className={`h-14 px-6 flex items-center justify-between border-b shrink-0 ${isDark ? 'bg-[#1a1a1a] border-[#292929]' : 'bg-white border-gray-200 shadow-sm'}`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#0078d4] to-[#00a2ff] flex items-center justify-center text-white font-bold shadow-md shadow-[#0078d4]/20">
            <Code2 className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-xs font-bold tracking-wide flex items-center gap-1.5 text-white">
              <span>Faculty Control Center &bull; Live Lab Command</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live DB
              </span>
            </h1>
            <div className="text-[11px] opacity-80 flex items-center gap-1.5 text-slate-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0078d4]" />
              <span className="text-slate-200">{teacher?.fullName || 'Faculty Member'}</span>
              <span className="opacity-40">&bull;</span>
              <span>{teacher?.departmentName || 'Computer Science'}</span>
              <span className="opacity-40">&bull;</span>
              <span>{teacher?.institutionName || 'Kaspro Partner'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setIsRefreshing(true);
              fetchSessions();
              if (selectedSessionCode) fetchSessionDetails(selectedSessionCode);
            }}
            title="Refresh database records"
            className="p-2 rounded-lg border border-slate-700/60 hover:bg-slate-800 text-slate-300 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#0078d4]' : ''}`} />
          </button>

          <Link
            href="/"
            className="px-3 py-1.5 text-xs border border-slate-700/60 rounded-lg hover:bg-slate-800 transition flex items-center gap-1.5 text-slate-300"
          >
            <ArrowLeft className="w-3 h-3" /> Code Editor
          </Link>

          <Link
            href="/teacher/analytics"
            className="px-3 py-1.5 text-xs border border-indigo-500/30 rounded-lg hover:bg-indigo-500/10 text-indigo-400 font-semibold transition flex items-center gap-1.5"
          >
            <PieChart className="w-3.5 h-3.5" /> Department Analytics
          </Link>

          <Link
            href="/teacher/create"
            className="px-3.5 py-1.5 text-xs bg-[#0078d4] hover:bg-[#006cc1] text-white font-bold rounded-lg transition flex items-center gap-1.5 shadow"
          >
            <Plus className="w-3.5 h-3.5" /> Create New Session
          </Link>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-slate-700/60 hover:bg-slate-800"
            title="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#0078d4]" />}
          </button>

          <button
            onClick={onSignOut}
            title="Sign Out"
            className="px-3 py-1.5 rounded-lg border border-rose-500/30 hover:bg-rose-500/10 text-rose-400 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* 2. Main Dashboard Content */}
      <div className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-[#0078d4]" />
              Practical Lab Sessions ({sessionsList.length})
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Click on any session card below to view all joined students, live code typing, and manage status (ON/OFF).
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {sessionsList.filter(s => s.status === 'ACTIVE').length} Active
            </span>
            <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
              {sessionsList.filter(s => s.status !== 'ACTIVE').length} Paused/Ended
            </span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 3. Real-Time Sessions Grid (Cards)                       */}
        {/* ======================================================== */}
        {sessionsList.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-slate-800 bg-[#171717] space-y-3">
            <Radio className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="font-bold text-white text-sm">No Lab Sessions Created Yet</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Create your first online practical lab session to distribute problem statements, monitor student PCs live, and auto-evaluate submissions.
            </p>
            <Link
              href="/teacher/create"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#0078d4] hover:bg-[#006cc1] text-white text-xs font-bold rounded-lg shadow transition"
            >
              <Plus className="w-4 h-4" /> Create First Session
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessionsList.map((session) => {
              const isSelected = selectedSessionCode === session.sessionCode;
              const isActive = session.status === 'ACTIVE';
              const isUpdating = statusUpdatingCode === session.sessionCode;
              const joinedCount = session.attendeeCount || (session.attendees ? session.attendees.length : 0);
              const capacity = session.totalCapacity || 60;

              return (
                <div 
                  key={session.sessionCode}
                  onClick={() => setSelectedSessionCode(session.sessionCode)}
                  className={`p-5 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between group shadow-sm ${
                    isSelected 
                      ? 'border-[#0078d4] bg-[#1a1f26] shadow-lg shadow-[#0078d4]/10 ring-2 ring-[#0078d4]/40' 
                      : isDark
                        ? 'bg-[#181818] border-[#292929] hover:border-slate-700 hover:bg-[#1c1c1c]'
                        : 'bg-white border-gray-200 hover:border-blue-400 hover:shadow-md'
                  }`}
                >
                  {/* Top Bar: Subject Name & Status Switch */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
                          {session.department}
                        </span>
                        <h3 className="font-bold text-sm text-white group-hover:text-[#0078d4] transition line-clamp-1">
                          {session.subjectName}
                        </h3>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {session.batchName || 'General Batch'} &bull; {session.labRoomName || 'Virtual Lab'}
                        </div>
                      </div>

                      {/* Status Badge + Toggle ON/OFF */}
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <button
                          onClick={(e) => handleToggleStatus(session, e)}
                          disabled={isUpdating}
                          title={`Click to turn session ${isActive ? 'OFF (Pause)' : 'ON (Resume)'}`}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono transition flex items-center gap-1.5 border shadow-sm ${
                            isActive 
                              ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40 hover:bg-emerald-900' 
                              : 'bg-amber-950/80 text-amber-400 border-amber-500/40 hover:bg-amber-900'
                          }`}
                        >
                          {isUpdating ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : isActive ? (
                            <>
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                              ACTIVE (ON)
                            </>
                          ) : (
                            <>
                              <Pause className="w-3 h-3" />
                              PAUSED (OFF)
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Joined Students Live Metric Bar */}
                    <div className="p-3 rounded-lg bg-black/30 border border-slate-800/80 space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                          <Users className="w-3.5 h-3.5 text-[#0078d4]" /> Joined Students:
                        </span>
                        <span className="font-mono font-bold text-white text-sm">
                          <span className={joinedCount > 0 ? 'text-emerald-400 font-extrabold' : 'text-slate-400'}>
                            {joinedCount}
                          </span>
                          <span className="text-slate-500 text-xs font-normal"> / {capacity} PCs</span>
                        </span>
                      </div>

                      {/* Capacity Progress Bar */}
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#0078d4] to-emerald-400 transition-all duration-300"
                          style={{ width: `${Math.min(100, Math.round((joinedCount / capacity) * 100))}%` }}
                        />
                      </div>
                    </div>

                    {/* Session Credentials (Code & Student PIN) */}
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      <div className="p-2 rounded bg-[#131313] border border-slate-800 flex items-center justify-between">
                        <div className="truncate">
                          <div className="text-[9px] text-slate-500 uppercase font-sans">Session Code</div>
                          <div className="font-bold text-cyan-400 truncate">{session.sessionCode}</div>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(session.sessionCode, `c-${session.sessionCode}`);
                          }}
                          className="p-1 hover:text-white text-slate-400 transition"
                        >
                          {copiedCode === `c-${session.sessionCode}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>

                      <div className="p-2 rounded bg-[#131313] border border-slate-800 flex items-center justify-between">
                        <div className="truncate">
                          <div className="text-[9px] text-slate-500 uppercase font-sans">Student PIN</div>
                          <div className="font-bold text-amber-400 truncate">{session.sessionPassword}</div>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(session.sessionPassword, `p-${session.sessionCode}`);
                          }}
                          className="p-1 hover:text-white text-slate-400 transition"
                        >
                          {copiedCode === `p-${session.sessionCode}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom Footer: Action Buttons */}
                  <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedSessionCode(session.sessionCode)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                        isSelected 
                          ? 'bg-[#0078d4] text-white shadow' 
                          : 'bg-slate-800/80 hover:bg-slate-800 text-slate-200'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      {isSelected ? 'Viewing Details' : 'View Joined Students'}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/teacher/session/${session.sessionCode}`}
                        onClick={(e) => e.stopPropagation()}
                        title="Open Full 60-PC Live Screen Matrix"
                        className="p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 transition flex items-center gap-1 text-xs font-semibold"
                      >
                        <Monitor className="w-3.5 h-3.5" /> Matrix
                      </Link>

                      <button
                        onClick={(e) => handleDeleteSession(session.sessionCode, e)}
                        title="Delete Session"
                        className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ======================================================== */}
        {/* 4. EXPANDED SELECTED SESSION DETAILS & JOINED STUDENTS    */}
        {/* ======================================================== */}
        {selectedSessionCode && sessionGridData && (
          <div className="mt-8 p-6 rounded-2xl border border-slate-800 bg-[#161616] shadow-xl space-y-6 animate-in fade-in duration-200">
            
            {/* Header for Selected Session */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded bg-[#0078d4]/20 border border-[#0078d4]/40 text-[#0078d4] font-mono text-xs font-bold">
                    {sessionGridData.session.sessionCode}
                  </span>
                  <h2 className="text-lg font-bold text-white">
                    {sessionGridData.session.subjectName}
                  </h2>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                    sessionGridData.session.status === 'ACTIVE' 
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40' 
                      : 'bg-amber-950 text-amber-400 border border-amber-500/40'
                  }`}>
                    {sessionGridData.session.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Problem: <strong className="text-slate-200">{sessionGridData.session.questionTitle}</strong> &bull; {sessionGridData.session.department}
                </p>
              </div>

              {/* Summary Badges */}
              <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
                <div className="px-3 py-1.5 rounded-lg bg-black/40 border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-500 font-sans">Total Joined</div>
                  <div className="font-bold text-emerald-400 text-sm">{realAttendees.length} Students</div>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-black/40 border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-500 font-sans">Actively Coding</div>
                  <div className="font-bold text-cyan-400 text-sm">
                    {realAttendees.filter(a => a.status === 'CODING').length}
                  </div>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-black/40 border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-500 font-sans">Submitted</div>
                  <div className="font-bold text-[#107c41] text-sm">
                    {realAttendees.filter(a => a.status === 'SUBMITTED').length}
                  </div>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-black/40 border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-500 font-sans">Tab Violations</div>
                  <div className={`font-bold text-sm ${sessionGridData.stats.totalViolations > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                    {sessionGridData.stats.totalViolations}
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1 p-1 rounded-lg bg-black/40 border border-slate-800 text-xs">
                <button
                  onClick={() => setFilterTab('all')}
                  className={`px-3 py-1 rounded font-medium transition ${filterTab === 'all' ? 'bg-[#0078d4] text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  All Joined ({realAttendees.length})
                </button>
                <button
                  onClick={() => setFilterTab('coding')}
                  className={`px-3 py-1 rounded font-medium transition ${filterTab === 'coding' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  Coding ({realAttendees.filter(a => a.status === 'CODING').length})
                </button>
                <button
                  onClick={() => setFilterTab('submitted')}
                  className={`px-3 py-1 rounded font-medium transition ${filterTab === 'submitted' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  Submitted ({realAttendees.filter(a => a.status === 'SUBMITTED').length})
                </button>
                <button
                  onClick={() => setFilterTab('violations')}
                  className={`px-3 py-1 rounded font-medium transition ${filterTab === 'violations' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  Violations ({realAttendees.filter(a => a.tabSwitches > 0).length})
                </button>
              </div>

              {/* Student Search */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Search student name / roll / PC..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-black/40 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#0078d4]"
                />
              </div>
            </div>

            {/* Students Table */}
            {loadingGrid ? (
              <div className="py-12 text-center text-slate-500 text-xs font-mono flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#0078d4]" />
                Refreshing real-time student grid from database...
              </div>
            ) : filteredAttendees.length === 0 ? (
              <div className="py-12 text-center rounded-xl border border-slate-800/60 bg-black/20 text-slate-400 text-xs space-y-2">
                <Users className="w-8 h-8 text-slate-600 mx-auto" />
                <div>
                  {realAttendees.length === 0 
                    ? 'No students have joined this session yet.' 
                    : 'No students match your filter criteria.'}
                </div>
                {realAttendees.length === 0 && (
                  <p className="text-[11px] text-slate-500">
                    Instruct students to visit kaspro.online, click &quot;Join Lab Session&quot;, and enter Code: <strong className="text-cyan-400">{sessionGridData.session.sessionCode}</strong> and PIN: <strong className="text-amber-400">{sessionGridData.session.sessionPassword}</strong>.
                  </p>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-black/30">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-[#1a1a1a] text-[10px] uppercase text-slate-400 font-mono border-b border-slate-800">
                    <tr>
                      <th className="p-3">Workstation</th>
                      <th className="p-3">Student Name</th>
                      <th className="p-3">Roll Number</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Test Cases</th>
                      <th className="p-3">Score</th>
                      <th className="p-3">Integrity (Tab Switches)</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans">
                    {filteredAttendees.map((student) => {
                      const isCoding = student.status === 'CODING';
                      const isSubmitted = student.status === 'SUBMITTED';

                      return (
                        <tr key={student.machineNumber} className="hover:bg-slate-800/30 transition">
                          <td className="p-3 font-mono font-bold text-white flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#0078d4]" />
                            {student.machineNumber}
                          </td>
                          <td className="p-3 font-bold text-slate-200">
                            {student.studentName}
                          </td>
                          <td className="p-3 font-mono text-slate-400">
                            {student.rollNumber}
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold inline-flex items-center gap-1 ${
                              isSubmitted 
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' 
                                : 'bg-cyan-950 text-cyan-400 border border-cyan-500/30'
                            }`}>
                              {isSubmitted ? <CheckCircle2 className="w-2.5 h-2.5" /> : <Code2 className="w-2.5 h-2.5" />}
                              {student.status}
                            </span>
                          </td>
                          <td className="p-3 font-mono font-semibold text-slate-300">
                            {student.passedCases || '0/4'}
                          </td>
                          <td className="p-3 font-mono font-bold text-white">
                            {student.score || 0} pts
                          </td>
                          <td className="p-3 font-mono">
                            {student.tabSwitches > 0 ? (
                              <span className="text-amber-400 font-bold flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 text-amber-400" />
                                {student.tabSwitches} switches
                              </span>
                            ) : (
                              <span className="text-emerald-400 flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3" /> Clean (0)
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => setInspectedAttendee(student as any)}
                              className="px-2.5 py-1 rounded bg-[#0078d4]/15 hover:bg-[#0078d4] text-[#0078d4] hover:text-white border border-[#0078d4]/40 font-bold text-[11px] transition flex items-center gap-1 ml-auto"
                            >
                              <Eye className="w-3 h-3" /> Inspect Code
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Quick Link to 60-Machine Live Screen View */}
            <div className="pt-2 flex justify-between items-center text-xs text-slate-400 border-t border-slate-800">
              <span>Auto-refreshing every 5 seconds from PostgreSQL &bull; Real-time sync</span>
              <Link
                href={`/teacher/session/${sessionGridData.session.sessionCode}`}
                className="text-[#0078d4] hover:underline flex items-center gap-1 font-bold"
              >
                Open Full Screen 60-PC Matrix <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

      </div>

      {/* Code Inspector Modal */}
      <CodeInspectorModal 
        attendee={inspectedAttendee}
        onClose={() => setInspectedAttendee(null)}
      />

    </div>
  );
}

export default function TeacherDashboardPage() {
  return (
    <IDEProvider>
      <TeacherDashboardInner />
    </IDEProvider>
  );
}

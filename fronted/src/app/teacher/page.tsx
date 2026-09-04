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
  Pause,
  Trash2,
  Eye,
  AlertTriangle,
  RefreshCw,
  Search,
  Monitor,
  CheckCircle2,
  Wifi,
  WifiOff,
  X,
  Zap,
  Bell
} from 'lucide-react';
import { IDEProvider, useIDE } from '@/context/IDEContext';
import { useTeacherAuth } from '@/context/TeacherAuthContext';
import CodeInspectorModal from '@/components/CodeInspectorModal';
import DesktopOnlyNotice from '@/components/DesktopOnlyNotice';
import { getLabSocket } from '@/utils/socket';

interface SessionAttendeeDetail {
  machineNumber: string;
  studentName: string;
  rollNumber: string;
  section?: string;
  status: string;
  onlineStatus?: string;
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
  const [socketConnected, setSocketConnected] = useState<boolean>(false);
  const [liveAlerts, setLiveAlerts] = useState<{
    id: string;
    type: string;
    rollNumber: string;
    studentName: string;
    machineNumber: string;
    count: number;
    message: string;
    timestamp: string;
  }[]>([]);

  // 1. Auto-fetch sessions list from PostgreSQL on mount and every 10 seconds as backup
  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 10000);
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

  // Poll selected session grid every 10 seconds as backup to Socket.io
  useEffect(() => {
    if (selectedSessionCode) {
      fetchSessionDetails(selectedSessionCode);
      const interval = setInterval(() => {
        fetchSessionDetails(selectedSessionCode);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [selectedSessionCode, fetchSessionDetails]);

  // Real-time Socket.io Listeners & Instant Synchronizations
  useEffect(() => {
    const socket = getLabSocket();
    if (!socket) return;

    if (socket.connected) {
      setSocketConnected(true);
    }

    const onConnect = () => setSocketConnected(true);
    const onDisconnect = () => setSocketConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    // Join faculty global channel & selected session room
    socket.emit('faculty:join', { sessionCode: selectedSessionCode || undefined });

    // 1. Real-time session created / status toggled / deleted
    const onSessionsListUpdated = () => {
      fetchSessions();
      if (selectedSessionCode) {
        fetchSessionDetails(selectedSessionCode);
      }
    };

    // 2. Real-time session status changed
    const onSessionStatusChanged = (payload: any) => {
      if (payload?.sessionCode && selectedSessionCode && payload.sessionCode === selectedSessionCode) {
        fetchSessionDetails(selectedSessionCode);
      }
      fetchSessions();
    };

    // 3. Instant whole grid refresh from backend
    const onGridRefresh = (data: any) => {
      if (!data) return;
      if (data.session && data.attendees) {
        setSessionGridData(data);
      } else if (Array.isArray(data)) {
        setSessionGridData((prev) => (prev ? { ...prev, attendees: data } : null));
      }
    };

    // 4. Instant student update (joined, heartbeat, score, status)
    const onStudentUpdated = (attendee: any) => {
      if (!attendee?.machineNumber) return;
      setSessionGridData((prev) => {
        if (!prev) return null;
        const targetMach = attendee.machineNumber.toUpperCase();
        const updatedAttendees = prev.attendees.map((a) => {
          if (a.machineNumber.toUpperCase() === targetMach) {
            return {
              ...a,
              studentName: attendee.studentName || a.studentName,
              rollNumber: attendee.rollNumber || a.rollNumber,
              status: attendee.codingStatus || attendee.status || a.status,
              onlineStatus: attendee.onlineStatus || a.onlineStatus || 'ONLINE',
              score: attendee.score !== undefined ? attendee.score : a.score,
              passedCases: attendee.passedCases || a.passedCases,
              tabSwitches: attendee.tabSwitchCount !== undefined ? attendee.tabSwitchCount : (attendee.tabSwitches ?? a.tabSwitches),
              code: attendee.currentCode || attendee.code || a.code,
              lastHeartbeat: attendee.lastHeartbeat || new Date().toISOString(),
            };
          }
          return a;
        });
        return { ...prev, attendees: updatedAttendees };
      });

      if (inspectedAttendee && inspectedAttendee.machineNumber.toUpperCase() === attendee.machineNumber.toUpperCase()) {
        setInspectedAttendee({
          ...inspectedAttendee,
          studentName: attendee.studentName || inspectedAttendee.studentName,
          rollNumber: attendee.rollNumber || inspectedAttendee.rollNumber,
          status: (attendee.codingStatus || attendee.status || inspectedAttendee.status) as any,
          score: attendee.score !== undefined ? attendee.score : inspectedAttendee.score,
          tabSwitches: attendee.tabSwitchCount !== undefined ? attendee.tabSwitchCount : (attendee.tabSwitches ?? inspectedAttendee.tabSwitches),
          code: attendee.currentCode || attendee.code || inspectedAttendee.code,
        });
      }
    };

    // 5. Instant student typing code stream (character by character)
    const onStudentCodeSync = (payload: { machineNumber: string; rollNumber?: string; code: string; language: string }) => {
      if (!payload?.machineNumber) return;
      const mach = payload.machineNumber.toUpperCase();

      setSessionGridData((prev) => {
        if (!prev) return null;
        const updatedAttendees = prev.attendees.map((a) => {
          if (a.machineNumber.toUpperCase() === mach) {
            return { ...a, code: payload.code, status: 'CODING' as const };
          }
          return a;
        });
        return { ...prev, attendees: updatedAttendees };
      });

      if (inspectedAttendee && inspectedAttendee.machineNumber.toUpperCase() === mach) {
        setInspectedAttendee({ ...inspectedAttendee, code: payload.code, status: 'CODING' });
      }
    };

    // 6. Instant Anti-Cheating Alert (Tab Switch or lost focus)
    const onStudentAlert = (alert: any) => {
      const alertItem = {
        id: `${alert.machineNumber}-${Date.now()}`,
        type: alert.type || 'TAB_SWITCH',
        rollNumber: alert.rollNumber || '---',
        studentName: alert.studentName || 'Student',
        machineNumber: alert.machineNumber || 'PC',
        count: alert.count || 1,
        message: alert.message || `Student on ${alert.machineNumber} switched tabs/lost focus!`,
        timestamp: new Date().toLocaleTimeString(),
      };
      setLiveAlerts((prev) => [alertItem, ...prev.slice(0, 5)]);
    };

    // 7. Instant Student Submission
    const onStudentSubmitted = () => {
      if (selectedSessionCode) {
        fetchSessionDetails(selectedSessionCode);
      }
    };

    socket.on('faculty:sessions_list_updated', onSessionsListUpdated);
    socket.on('session:status_changed', onSessionStatusChanged);
    socket.on('faculty:grid_refresh', onGridRefresh);
    socket.on('faculty:student_updated', onStudentUpdated);
    socket.on('faculty:student_code_sync', onStudentCodeSync);
    socket.on('faculty:student_alert', onStudentAlert);
    socket.on('faculty:student_submitted', onStudentSubmitted);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('faculty:sessions_list_updated', onSessionsListUpdated);
      socket.off('session:status_changed', onSessionStatusChanged);
      socket.off('faculty:grid_refresh', onGridRefresh);
      socket.off('faculty:student_updated', onStudentUpdated);
      socket.off('faculty:student_code_sync', onStudentCodeSync);
      socket.off('faculty:student_alert', onStudentAlert);
      socket.off('faculty:student_submitted', onStudentSubmitted);
      if (selectedSessionCode) {
        socket.emit('faculty:leave', { sessionCode: selectedSessionCode });
      }
    };
  }, [selectedSessionCode, fetchSessions, fetchSessionDetails, inspectedAttendee, setInspectedAttendee]);

  // Authentication Guard
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/teacher/login?redirect=/teacher');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className={`min-h-screen w-screen flex flex-col items-center justify-center ${isDark ? 'bg-[#181818] text-white' : 'bg-[#f8fafc] text-slate-800'}`}>
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

  // Toggle Session ON / OFF (ACTIVE <-> PAUSED) with instant Socket.io broadcast
  const handleToggleStatus = async (session: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = session.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    try {
      setStatusUpdatingCode(session.sessionCode);

      // Emit via Socket.io instantly
      const socket = getLabSocket();
      if (socket) {
        socket.emit('session:update_status', { sessionCode: session.sessionCode, status: newStatus });
      }

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
    <div className={`min-h-screen w-screen flex flex-col select-none overflow-x-hidden ${
      isDark ? 'bg-[#121212] text-slate-200' : 'bg-[#f8fafc] text-slate-800'
    }`}>
      
      {/* 1. Top Navigation Bar */}
      <header className={`h-14 px-6 flex items-center justify-between border-b shrink-0 ${
        isDark ? 'bg-[#1a1a1a] border-[#292929]' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#0078d4] to-[#00a2ff] flex items-center justify-center text-white font-bold shadow-md shadow-[#0078d4]/20">
            <Code2 className="w-4 h-4" />
          </div>
          <div>
            <h1 className={`text-xs font-bold tracking-wide flex items-center gap-1.5 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              <span>Faculty Control Center &bull; Live Lab Command</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live DB
              </span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold flex items-center gap-1 font-mono ${
                socketConnected 
                  ? 'bg-blue-500/10 text-[#0078d4] dark:text-sky-400 border-blue-500/20' 
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${socketConnected ? 'bg-sky-500 animate-ping' : 'bg-amber-500'}`} />
                {socketConnected ? '⚡ Socket.io Active' : 'Connecting Socket...'}
              </span>
            </h1>
            <div className={`text-[11px] flex items-center gap-1.5 font-medium ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}>
              <ShieldCheck className="w-3.5 h-3.5 text-[#0078d4]" />
              <span className={isDark ? 'text-slate-200' : 'text-slate-800 font-semibold'}>
                {teacher?.fullName || 'Faculty Member'}
              </span>
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
            className={`p-2 rounded-lg border transition ${
              isDark 
                ? 'border-slate-700/60 hover:bg-slate-800 text-slate-300' 
                : 'border-slate-300 hover:bg-slate-100 text-slate-700 bg-white shadow-sm'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#0078d4]' : ''}`} />
          </button>

          <Link
            href="/"
            className={`px-3 py-1.5 text-xs border rounded-lg transition flex items-center gap-1.5 font-medium ${
              isDark 
                ? 'border-slate-700/60 hover:bg-slate-800 text-slate-300' 
                : 'border-slate-300 hover:bg-slate-100 text-slate-700 bg-white shadow-sm'
            }`}
          >
            <ArrowLeft className="w-3 h-3" /> Code Editor
          </Link>

          <Link
            href="/teacher/analytics"
            className={`px-3 py-1.5 text-xs border rounded-lg font-semibold transition flex items-center gap-1.5 ${
              isDark 
                ? 'border-indigo-500/30 hover:bg-indigo-500/10 text-indigo-400' 
                : 'border-indigo-200 hover:bg-indigo-50 text-indigo-700 bg-indigo-50/50 shadow-sm'
            }`}
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
            className={`p-2 rounded-lg border transition ${
              isDark 
                ? 'border-slate-700/60 hover:bg-slate-800' 
                : 'border-slate-300 hover:bg-slate-100 bg-white shadow-sm'
            }`}
            title="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#0078d4]" />}
          </button>

          <button
            onClick={onSignOut}
            title="Sign Out"
            className="px-3 py-1.5 rounded-lg border border-rose-500/30 hover:bg-rose-500/10 text-rose-500 text-xs font-semibold flex items-center gap-1.5 transition bg-rose-50/30"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* 2. Main Dashboard Content */}
      <div className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">

        {/* Live Anti-Cheating Security Alerts from Socket.io */}
        {liveAlerts.length > 0 && (
          <div className="space-y-2 animate-in fade-in duration-200">
            {liveAlerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs shadow-sm"
              >
                <div className="flex items-center gap-2.5 font-mono">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                  </div>
                  <span>
                    <strong className="uppercase">[Live Anti-Cheat Alert]</strong> {alert.message} ({alert.count} tab violations) &bull; <span className="opacity-75">{alert.timestamp}</span>
                  </span>
                </div>
                <button
                  onClick={() => setLiveAlerts((prev) => prev.filter((a) => a.id !== alert.id))}
                  className="hover:opacity-100 opacity-60 p-1 transition"
                  title="Dismiss alert"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className={`text-base font-extrabold flex items-center gap-2 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              <Radio className="w-4 h-4 text-[#0078d4]" />
              Practical Lab Sessions ({sessionsList.length})
            </h2>
            <p className={`text-xs mt-0.5 ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}>
              Click on any session card below to view all joined students, live code typing, and manage status (ON/OFF).
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {sessionsList.filter((s: any) => s.status === 'ACTIVE').length} Active
            </span>
            <span className={`px-2.5 py-1 rounded-full border font-semibold ${
              isDark ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}>
              {sessionsList.filter((s: any) => s.status !== 'ACTIVE').length} Paused/Ended
            </span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 3. Real-Time Sessions Grid (Cards)                       */}
        {/* ======================================================== */}
        {sessionsList.length === 0 ? (
          <div className={`p-12 text-center rounded-2xl border border-dashed space-y-3 ${
            isDark ? 'border-slate-800 bg-[#171717]' : 'border-slate-300 bg-white shadow-sm'
          }`}>
            <Radio className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>No Lab Sessions Created Yet</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
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
            {sessionsList.map((session: any) => {
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
                      ? isDark 
                        ? 'border-[#0078d4] bg-[#1a1f26] shadow-lg shadow-[#0078d4]/10 ring-2 ring-[#0078d4]/40' 
                        : 'border-[#0078d4] bg-blue-50/40 shadow-md ring-2 ring-[#0078d4]/30'
                      : isDark
                        ? 'bg-[#181818] border-[#292929] hover:border-slate-700 hover:bg-[#1c1c1c]'
                        : 'bg-white border-slate-200 hover:border-blue-400 hover:shadow-md'
                  }`}
                >
                  {/* Top Bar: Subject Name & Status Switch */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                          isDark ? 'text-cyan-400' : 'text-[#0078d4]'
                        }`}>
                          {session.department}
                        </span>
                        <h3 className={`font-bold text-sm transition line-clamp-1 ${
                          isDark ? 'text-white group-hover:text-[#0078d4]' : 'text-slate-900 group-hover:text-[#0078d4]'
                        }`}>
                          {session.subjectName}
                        </h3>
                        <div className={`text-[11px] mt-0.5 ${
                          isDark ? 'text-slate-400' : 'text-slate-500'
                        }`}>
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
                              ? isDark 
                                ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40 hover:bg-emerald-900' 
                                : 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                              : isDark 
                                ? 'bg-amber-950/80 text-amber-400 border-amber-500/40 hover:bg-amber-900' 
                                : 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100'
                          }`}
                        >
                          {isUpdating ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : isActive ? (
                            <>
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
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
                    <div className={`p-3 rounded-lg border space-y-1.5 ${
                      isDark ? 'bg-black/30 border-slate-800/80' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <div className="flex justify-between items-center text-xs">
                        <span className={`flex items-center gap-1.5 font-medium ${
                          isDark ? 'text-slate-400' : 'text-slate-600'
                        }`}>
                          <Users className="w-3.5 h-3.5 text-[#0078d4]" /> Joined Students:
                        </span>
                        <span className="font-mono font-bold text-sm">
                          <span className={joinedCount > 0 ? 'text-emerald-600 dark:text-emerald-400 font-extrabold' : (isDark ? 'text-slate-400' : 'text-slate-600')}>
                            {joinedCount}
                          </span>
                          <span className={`text-xs font-normal ${isDark ? 'text-slate-500' : 'text-slate-400'}`}> / {capacity} PCs</span>
                        </span>
                      </div>

                      {/* Capacity Progress Bar */}
                      <div className={`w-full h-1.5 rounded-full overflow-hidden ${
                        isDark ? 'bg-slate-800' : 'bg-slate-200'
                      }`}>
                        <div 
                          className="h-full bg-gradient-to-r from-[#0078d4] to-emerald-500 transition-all duration-300"
                          style={{ width: `${Math.min(100, Math.round((joinedCount / capacity) * 100))}%` }}
                        />
                      </div>
                    </div>

                    {/* Session Credentials (Code & Student PIN) */}
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      <div className={`p-2 rounded border flex items-center justify-between ${
                        isDark ? 'bg-[#131313] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                      }`}>
                        <div className="truncate">
                          <div className={`text-[9px] uppercase font-sans font-medium ${
                            isDark ? 'text-slate-500' : 'text-slate-500'
                          }`}>Session Code</div>
                          <div className="font-bold text-[#0078d4] truncate">{session.sessionCode}</div>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(session.sessionCode, `c-${session.sessionCode}`);
                          }}
                          className={`p-1 transition ${
                            isDark ? 'hover:text-white text-slate-400' : 'hover:text-slate-900 text-slate-500'
                          }`}
                        >
                          {copiedCode === `c-${session.sessionCode}` ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>

                      <div className={`p-2 rounded border flex items-center justify-between ${
                        isDark ? 'bg-[#131313] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                      }`}>
                        <div className="truncate">
                          <div className={`text-[9px] uppercase font-sans font-medium ${
                            isDark ? 'text-slate-500' : 'text-slate-500'
                          }`}>Student PIN</div>
                          <div className="font-bold text-amber-600 dark:text-amber-400 truncate">{session.sessionPassword}</div>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(session.sessionPassword, `p-${session.sessionCode}`);
                          }}
                          className={`p-1 transition ${
                            isDark ? 'hover:text-white text-slate-400' : 'hover:text-slate-900 text-slate-500'
                          }`}
                        >
                          {copiedCode === `p-${session.sessionCode}` ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom Footer: Action Buttons */}
                  <div className={`pt-3 mt-3 border-t flex items-center justify-between gap-2 ${
                    isDark ? 'border-slate-800/80' : 'border-slate-200'
                  }`}>
                    <button
                      onClick={() => setSelectedSessionCode(session.sessionCode)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                        isSelected 
                          ? 'bg-[#0078d4] text-white shadow' 
                          : isDark
                            ? 'bg-slate-800/80 hover:bg-slate-800 text-slate-200'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
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
                        className={`p-1.5 rounded-lg border transition flex items-center gap-1 text-xs font-bold ${
                          isDark
                            ? 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
                            : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
                        }`}
                      >
                        <Monitor className="w-3.5 h-3.5" /> Matrix
                      </Link>

                      <button
                        onClick={(e) => handleDeleteSession(session.sessionCode, e)}
                        title="Delete Session"
                        className={`p-1.5 rounded-lg transition ${
                          isDark 
                            ? 'hover:bg-rose-500/20 text-slate-500 hover:text-rose-400' 
                            : 'hover:bg-rose-50 text-slate-400 hover:text-rose-600'
                        }`}
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
          <div className={`mt-8 p-6 rounded-2xl border shadow-xl space-y-6 animate-in fade-in duration-200 ${
            isDark ? 'bg-[#161616] border-slate-800' : 'bg-white border-slate-200 shadow-slate-200/50'
          }`}>
            
            {/* Header for Selected Session */}
            <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5 ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            }`}>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded bg-[#0078d4]/10 border border-[#0078d4]/30 text-[#0078d4] font-mono text-xs font-bold">
                    {sessionGridData.session.sessionCode}
                  </span>
                  <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {sessionGridData.session.subjectName}
                  </h2>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${
                    sessionGridData.session.status === 'ACTIVE' 
                      ? isDark 
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-500/40' 
                        : 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : isDark 
                        ? 'bg-amber-950 text-amber-400 border-amber-500/40' 
                        : 'bg-amber-50 text-amber-700 border-amber-300'
                  }`}>
                    {sessionGridData.session.status}
                  </span>
                </div>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Problem: <strong className={isDark ? 'text-slate-200' : 'text-slate-900'}>{sessionGridData.session.questionTitle}</strong> &bull; {sessionGridData.session.department}
                </p>
              </div>

              {/* Summary Badges */}
              <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
                <div className={`px-3.5 py-2 rounded-xl border text-center ${
                  isDark ? 'bg-black/40 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className={`text-[10px] font-sans ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Total Joined</div>
                  <div className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">{realAttendees.length} Students</div>
                </div>
                <div className={`px-3.5 py-2 rounded-xl border text-center ${
                  isDark ? 'bg-black/40 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className={`text-[10px] font-sans ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Actively Coding</div>
                  <div className="font-bold text-[#0078d4] text-sm">
                    {realAttendees.filter(a => a.status === 'CODING').length}
                  </div>
                </div>
                <div className={`px-3.5 py-2 rounded-xl border text-center ${
                  isDark ? 'bg-black/40 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className={`text-[10px] font-sans ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Submitted</div>
                  <div className="font-bold text-teal-600 dark:text-[#107c41] text-sm">
                    {realAttendees.filter(a => a.status === 'SUBMITTED').length}
                  </div>
                </div>
                <div className={`px-3.5 py-2 rounded-xl border text-center ${
                  isDark ? 'bg-black/40 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className={`text-[10px] font-sans ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Tab Violations</div>
                  <div className={`font-bold text-sm ${sessionGridData.stats.totalViolations > 0 ? 'text-amber-600 dark:text-amber-400' : (isDark ? 'text-slate-400' : 'text-slate-600')}`}>
                    {sessionGridData.stats.totalViolations}
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className={`flex items-center gap-1 p-1 rounded-lg border text-xs ${
                isDark ? 'bg-black/40 border-slate-800' : 'bg-slate-100 border-slate-200'
              }`}>
                <button
                  onClick={() => setFilterTab('all')}
                  className={`px-3 py-1 rounded font-medium transition ${
                    filterTab === 'all' 
                      ? 'bg-[#0078d4] text-white shadow' 
                      : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All Joined ({realAttendees.length})
                </button>
                <button
                  onClick={() => setFilterTab('coding')}
                  className={`px-3 py-1 rounded font-medium transition ${
                    filterTab === 'coding' 
                      ? 'bg-sky-600 text-white shadow' 
                      : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Coding ({realAttendees.filter(a => a.status === 'CODING').length})
                </button>
                <button
                  onClick={() => setFilterTab('submitted')}
                  className={`px-3 py-1 rounded font-medium transition ${
                    filterTab === 'submitted' 
                      ? 'bg-emerald-600 text-white shadow' 
                      : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Submitted ({realAttendees.filter(a => a.status === 'SUBMITTED').length})
                </button>
                <button
                  onClick={() => setFilterTab('violations')}
                  className={`px-3 py-1 rounded font-medium transition ${
                    filterTab === 'violations' 
                      ? 'bg-amber-600 text-white shadow' 
                      : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Violations ({realAttendees.filter(a => a.tabSwitches > 0).length})
                </button>
              </div>

              {/* Student Search */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Search student name / roll / PC..."
                  className={`w-full pl-9 pr-3 py-1.5 rounded-lg border text-xs focus:outline-none focus:border-[#0078d4] ${
                    isDark 
                      ? 'bg-black/40 border-slate-800 text-white placeholder:text-slate-500' 
                      : 'bg-white border-slate-300 text-slate-800 placeholder:text-slate-400 shadow-sm'
                  }`}
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
              <div className={`py-12 text-center rounded-xl border text-xs space-y-2 ${
                isDark ? 'border-slate-800/60 bg-black/20 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-600'
              }`}>
                <Users className="w-8 h-8 text-slate-400 mx-auto" />
                <div className="font-semibold">
                  {realAttendees.length === 0 
                    ? 'No students have joined this session yet.' 
                    : 'No students match your filter criteria.'}
                </div>
                {realAttendees.length === 0 && (
                  <p className="text-[11px] text-slate-500">
                    Instruct students to visit kaspro.online, click &quot;Join Lab Session&quot;, and enter Code: <strong className="text-[#0078d4]">{sessionGridData.session.sessionCode}</strong> and PIN: <strong className="text-amber-600 dark:text-amber-400">{sessionGridData.session.sessionPassword}</strong>.
                  </p>
                )}
              </div>
            ) : (
              <div className={`overflow-x-auto rounded-xl border shadow-sm ${
                isDark ? 'border-slate-800 bg-black/30' : 'border-slate-200 bg-white'
              }`}>
                <table className="w-full text-left text-xs">
                  <thead className={`text-[10px] uppercase font-mono border-b ${
                    isDark ? 'bg-[#1a1a1a] border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}>
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
                  <tbody className={`divide-y font-sans ${
                    isDark ? 'divide-slate-800/60 text-slate-300' : 'divide-slate-100 text-slate-700'
                  }`}>
                    {filteredAttendees.map((student) => {
                      const isCoding = student.status === 'CODING';
                      const isSubmitted = student.status === 'SUBMITTED';

                      return (
                        <tr key={student.machineNumber} className={`transition ${
                          isDark ? 'hover:bg-slate-800/30' : 'hover:bg-blue-50/40'
                        }`}>
                          <td className={`p-3 font-mono font-bold flex items-center gap-1.5 ${
                            isDark ? 'text-white' : 'text-slate-900'
                          }`}>
                            <span className="w-2 h-2 rounded-full bg-[#0078d4]" />
                            {student.machineNumber}
                          </td>
                          <td className={`p-3 font-bold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                            {student.studentName}
                          </td>
                          <td className={`p-3 font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {student.rollNumber}
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold inline-flex items-center gap-1 border ${
                              isSubmitted 
                                ? isDark 
                                  ? 'bg-emerald-950 text-emerald-400 border-emerald-500/30' 
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : isDark 
                                  ? 'bg-cyan-950 text-cyan-400 border-cyan-500/30' 
                                  : 'bg-sky-50 text-sky-700 border-sky-200'
                            }`}>
                              {isSubmitted ? <CheckCircle2 className="w-2.5 h-2.5" /> : <Code2 className="w-2.5 h-2.5" />}
                              {student.status}
                            </span>
                          </td>
                          <td className={`p-3 font-mono font-semibold ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
                            {student.passedCases || '0/4'}
                          </td>
                          <td className={`p-3 font-mono font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {student.score || 0} pts
                          </td>
                          <td className="p-3 font-mono">
                            {student.tabSwitches > 0 ? (
                              <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 text-amber-500" />
                                {student.tabSwitches} switches
                              </span>
                            ) : (
                              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3" /> Clean (0)
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => setInspectedAttendee(student as any)}
                              className={`px-2.5 py-1 rounded font-bold text-[11px] transition flex items-center gap-1 ml-auto border ${
                                isDark 
                                  ? 'bg-[#0078d4]/15 hover:bg-[#0078d4] text-[#0078d4] hover:text-white border-[#0078d4]/40' 
                                  : 'bg-blue-50 hover:bg-[#0078d4] text-[#0078d4] hover:text-white border-blue-200 shadow-sm'
                              }`}
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
            <div className={`pt-2 flex justify-between items-center text-xs border-t ${
              isDark ? 'text-slate-400 border-slate-800' : 'text-slate-500 border-slate-200'
            }`}>
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

      {/* Desktop Experience Required Prompt for Mobile / Tablet screens */}
      <DesktopOnlyNotice 
        title="Faculty Command Portal - Desktop Recommended"
        subtitle="For the best experience monitoring 60-PC lab matrices, real-time code streams, and anti-cheating violations, open this portal on a desktop or laptop computer."
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

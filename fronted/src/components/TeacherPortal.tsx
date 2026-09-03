'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  Key, 
  Hash, 
  Users, 
  Clock, 
  CheckCircle2, 
  Radio, 
  Copy, 
  Check, 
  Trash2, 
  Eye, 
  ShieldAlert, 
  Download, 
  BookOpen,
  ArrowLeft,
  Sun,
  Moon,
  LogOut,
  Code2
} from 'lucide-react';
import { useIDE, LabSessionData } from '@/context/IDEContext';
import CodeInspectorModal from '@/components/CodeInspectorModal';

export default function TeacherPortal() {
  const { 
    theme, 
    toggleTheme, 
    sessionsList, 
    handleCreateSession, 
    isTeacherLoggedIn, 
    handleTeacherLogin, 
    handleTeacherLogout,
    teacherEmail,
    attendees,
    inspectedAttendee,
    setInspectedAttendee,
    setViewMode
  } = useIDE();

  const isDark = theme === 'vs-dark';

  // Login form state
  const [teacherId, setTeacherId] = useState('faculty@university.edu');
  const [teacherPass, setTeacherPass] = useState('admin123');

  // Create session form state
  const [isCreating, setIsCreating] = useState(false);
  const [subjectName, setSubjectName] = useState('Programming in C / Data Structures');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [batchName, setBatchName] = useState('Section J - 2nd Year');
  const [questionTitle, setQuestionTitle] = useState('Check Positive, Negative, or Zero');
  const [questionDescription, setQuestionDescription] = useState('Write a program in C that reads an integer from standard input and prints Positive, Negative, or Zero.');
  const [timeLimit, setTimeLimit] = useState(90);
  const [testCases, setTestCases] = useState([
    { id: 'tc-1', inputData: '10', expectedOutput: 'Positive', isHidden: false },
    { id: 'tc-2', inputData: '-5', expectedOutput: 'Negative', isHidden: false },
    { id: 'tc-3', inputData: '0', expectedOutput: 'Zero', isHidden: false },
    { id: 'tc-4', inputData: '9999', expectedOutput: 'Positive', isHidden: true },
  ]);

  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleNewSessionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCreateSession({
      subjectName,
      department,
      batchName,
      teacherName: teacherEmail || 'Faculty In-Charge',
      questionTitle,
      questionDescription,
      testCases,
      timeLimitMinutes: Number(timeLimit),
      totalMachines: 60,
    });
    setIsCreating(false);
  };

  // If teacher not logged in, show Teacher Login Screen
  if (!isTeacherLoggedIn) {
    return (
      <div className={`min-h-screen w-screen flex flex-col justify-center items-center p-4 select-none ${isDark ? 'bg-[#181818] text-white' : 'bg-[#f8f8f8] text-gray-800'}`}>
        <div className={`w-full max-w-md p-8 rounded-xl border shadow-2xl space-y-6 ${isDark ? 'bg-[#1f1f1f] border-[#2b2b2b]' : 'bg-white border-gray-200'}`}>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 font-bold text-lg">
              <div className="w-6 h-6 rounded bg-[#0078d4] flex items-center justify-center text-xs text-white">
                <Code2 className="w-3.5 h-3.5" />
              </div>
              <span>Teacher / Faculty Portal</span>
            </div>
            <button onClick={toggleTheme} className="p-1 rounded opacity-70 hover:opacity-100">
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#0078d4]" />}
            </button>
          </div>

          <p className="text-xs opacity-75 leading-relaxed">
            Log in to create new practical lab sessions, auto-generate <strong>Session Codes & Passwords</strong>, and monitor live connected student machines in real-time.
          </p>

          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleTeacherLogin(teacherId, teacherPass);
            }} 
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-semibold mb-1 opacity-80">Faculty ID / Email</label>
              <input
                type="text"
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
                placeholder="e.g. faculty@university.edu"
                required
                className={`w-full p-2.5 rounded border text-xs font-mono focus:outline-none focus:border-[#0078d4] ${isDark ? 'bg-[#141414] border-[#333] text-white' : 'bg-white border-gray-300'}`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 opacity-80">Password</label>
              <input
                type="password"
                value={teacherPass}
                onChange={(e) => setTeacherPass(e.target.value)}
                placeholder="••••••••"
                required
                className={`w-full p-2.5 rounded border text-xs font-mono focus:outline-none focus:border-[#0078d4] ${isDark ? 'bg-[#141414] border-[#333] text-white' : 'bg-white border-gray-300'}`}
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#0078d4] hover:bg-[#006cc1] text-white font-bold rounded text-xs transition shadow flex items-center justify-center gap-2"
            >
              Sign In to Teacher Dashboard
            </button>
          </form>

          <div className="pt-2 text-center">
            <button 
              onClick={() => setViewMode('playground')}
              className="text-xs text-[#0078d4] hover:underline flex items-center justify-center gap-1 mx-auto"
            >
              <ArrowLeft className="w-3 h-3" /> Back to Public CodeLab IDE
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Teacher Dashboard when logged in
  return (
    <div className={`min-h-screen w-screen flex flex-col select-none overflow-x-hidden ${isDark ? 'bg-[#181818] text-[#cccccc]' : 'bg-[#f8f8f8] text-[#333333]'}`}>
      
      {/* Top Header */}
      <header className={`h-12 px-6 flex items-center justify-between border-b shrink-0 ${isDark ? 'bg-[#1f1f1f] border-[#2b2b2b]' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded bg-[#0078d4] flex items-center justify-center text-xs text-white">
            <Code2 className="w-3.5 h-3.5" />
          </div>
          <div>
            <h1 className="text-xs font-bold tracking-wide">Teacher / Faculty Control Panel</h1>
            <div className="text-[10px] opacity-60">Signed in as: {teacherEmail}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewMode('playground')}
            className="px-3 py-1 text-xs border rounded hover:bg-gray-700/20 transition flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3 h-3" /> Switch to Code Editor
          </button>

          <button
            onClick={() => setIsCreating(true)}
            className="px-3 py-1 text-xs bg-[#0078d4] hover:bg-[#006cc1] text-white font-semibold rounded transition flex items-center gap-1.5 shadow"
          >
            <Plus className="w-3.5 h-3.5" /> Create New Lab Session
          </button>

          <button
            onClick={toggleTheme}
            className="p-1.5 rounded hover:bg-gray-700/20"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#0078d4]" />}
          </button>

          <button
            onClick={handleTeacherLogout}
            title="Sign Out"
            className="p-1.5 rounded hover:bg-rose-500/20 text-rose-400"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <div className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
        
        {/* Active Sessions Overview Cards */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider mb-3 opacity-80">Generated Lab Sessions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessionsList.map((session) => (
              <div 
                key={session.sessionCode}
                className={`p-5 rounded-xl border shadow-sm space-y-4 ${isDark ? 'bg-[#1f1f1f] border-[#2b2b2b]' : 'bg-white border-gray-200'}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-sm">{session.subjectName}</h3>
                    <div className="text-[11px] opacity-70 mt-0.5">{session.batchName} &bull; {session.department}</div>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    ACTIVE
                  </span>
                </div>

                {/* Session Credentials (Code & Password) */}
                <div className={`p-3 rounded-lg border space-y-2 ${isDark ? 'bg-[#141414] border-[#2b2b2b]' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-semibold opacity-75 flex items-center gap-1">
                      <Hash className="w-3 h-3 text-[#0078d4]" /> Session Code:
                    </span>
                    <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-cyan-400">
                      <span>{session.sessionCode}</span>
                      <button 
                        onClick={() => handleCopy(session.sessionCode, `code-${session.sessionCode}`)}
                        className="p-0.5 hover:text-white"
                      >
                        {copiedCode === `code-${session.sessionCode}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-gray-400" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-semibold opacity-75 flex items-center gap-1">
                      <Key className="w-3 h-3 text-amber-400" /> Student Password:
                    </span>
                    <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-amber-400">
                      <span>{session.sessionPassword}</span>
                      <button 
                        onClick={() => handleCopy(session.sessionPassword, `pass-${session.sessionCode}`)}
                        className="p-0.5 hover:text-white"
                      >
                        {copiedCode === `pass-${session.sessionCode}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-gray-400" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Question Details */}
                <div className="text-xs space-y-1">
                  <div className="font-semibold opacity-85">Assigned Task:</div>
                  <div className="opacity-75 line-clamp-2">{session.questionTitle}</div>
                </div>

                <div className="pt-2 border-t flex justify-between items-center text-[11px] opacity-75">
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> 60 Seats</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {session.timeLimitMinutes} Mins</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real-time 60-Machine Student Matrix */}
        <div className={`p-6 rounded-xl border space-y-4 ${isDark ? 'bg-[#1f1f1f] border-[#2b2b2b]' : 'bg-white border-gray-200'}`}>
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-sm font-bold flex items-center gap-2">
                <Radio className="w-4 h-4 text-cyan-400" /> Live Connected Student Matrix (60 Machines)
              </h2>
              <div className="text-xs opacity-60 mt-0.5">
                Click on any machine to inspect real-time student code and anti-cheat logs.
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#0078d4]"></span> Coding (28)</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#107c41]"></span> Submitted (10)</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-gray-500"></span> Empty (22)</span>
            </div>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-10 gap-2.5">
            {attendees.map((pc) => (
              <div
                key={pc.machineNumber}
                onClick={() => pc.status !== 'EMPTY' && setInspectedAttendee(pc)}
                className={`p-2 rounded border text-center cursor-pointer transition ${pc.status !== 'EMPTY' ? 'hover:scale-105 hover:border-[#0078d4]' : 'opacity-40 cursor-not-allowed'} ${isDark ? 'bg-[#141414] border-[#2b2b2b]' : 'bg-gray-50 border-gray-200'}`}
              >
                <div className="font-mono text-[11px] font-bold">{pc.machineNumber}</div>
                <div className="truncate text-[10px] opacity-75 mt-0.5">{pc.studentName}</div>
                <div className="mt-1 flex justify-center">
                  <span className={`w-2 h-2 rounded-full ${pc.status === 'CODING' ? 'bg-[#0078d4]' : (pc.status === 'SUBMITTED' ? 'bg-[#107c41]' : 'bg-gray-600')}`}></span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Modal: Create New Lab Session */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
          <div className={`w-full max-w-lg p-6 rounded-xl border shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto ${isDark ? 'bg-[#1f1f1f] border-[#333] text-white' : 'bg-white border-gray-300 text-gray-800'}`}>
            
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#0078d4]" /> Create New Lab Practical Session
              </h3>
              <button onClick={() => setIsCreating(false)} className="opacity-60 hover:opacity-100">✕</button>
            </div>

            <form onSubmit={handleNewSessionSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 opacity-80">Subject / Course Name</label>
                <input
                  type="text"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  required
                  className={`w-full p-2 rounded border font-mono ${isDark ? 'bg-[#141414] border-[#333]' : 'bg-white border-gray-300'}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 opacity-80">Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    required
                    className={`w-full p-2 rounded border font-mono ${isDark ? 'bg-[#141414] border-[#333]' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 opacity-80">Batch / Section</label>
                  <input
                    type="text"
                    value={batchName}
                    onChange={(e) => setBatchName(e.target.value)}
                    required
                    className={`w-full p-2 rounded border font-mono ${isDark ? 'bg-[#141414] border-[#333]' : 'bg-white border-gray-300'}`}
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 opacity-80">Practical Problem Title</label>
                <input
                  type="text"
                  value={questionTitle}
                  onChange={(e) => setQuestionTitle(e.target.value)}
                  required
                  className={`w-full p-2 rounded border font-mono ${isDark ? 'bg-[#141414] border-[#333]' : 'bg-white border-gray-300'}`}
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 opacity-80">Problem Description</label>
                <textarea
                  value={questionDescription}
                  onChange={(e) => setQuestionDescription(e.target.value)}
                  rows={3}
                  required
                  className={`w-full p-2 rounded border font-mono resize-none ${isDark ? 'bg-[#141414] border-[#333]' : 'bg-white border-gray-300'}`}
                />
              </div>

              <div className="p-3 rounded border space-y-2 bg-[#0078d4]/10 border-[#0078d4]/30">
                <div className="font-bold text-[#0078d4]">Auto-Security:</div>
                <div className="text-[11px] opacity-80">
                  Submitting will automatically generate an encrypted <strong>Unique Session Code</strong> and <strong>PIN Password</strong> for this batch.
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-700/20"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0078d4] text-white font-bold rounded hover:bg-[#006cc1]"
                >
                  Generate Session & Credentials
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Code Inspector Modal for Live Student Code Inspection */}
      <CodeInspectorModal 
        attendee={inspectedAttendee}
        onClose={() => setInspectedAttendee(null)}
      />

    </div>
  );
}

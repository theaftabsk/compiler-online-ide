'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ProgrammingLanguage, StudentSessionInfo, MachineAttendee, TestCase } from '@/types';

export type ThemeMode = 'vs-dark' | 'vs-light';
export type AppViewMode = 'playground' | 'student_lab' | 'teacher_dashboard';

export interface VFSFile {
  name: string;
  content: string;
  language: string;
  isFolder?: boolean;
}

export interface LabSessionData {
  sessionCode: string;
  sessionPassword: string;
  subjectName: string;
  department: string;
  batchName: string;
  teacherName: string;
  questionTitle: string;
  questionDescription: string;
  testCases: TestCase[];
  timeLimitMinutes: number;
  totalMachines: number;
  createdAt: string;
  isActive: boolean;
}

const DEFAULT_DEMO_SESSION: LabSessionData = {
  sessionCode: 'LAB-2026',
  sessionPassword: '8899',
  subjectName: 'Data Structures & Algorithms in C',
  department: 'Computer Science & AI',
  batchName: 'Section J - Batch 2026',
  teacherName: 'Prof. S. Sengupta',
  questionTitle: 'Check Positive, Negative, or Zero',
  questionDescription: 'Write a program in C to take an integer input from stdin and determine if it is Positive, Negative, or Zero.',
  testCases: [
    { id: 'tc-1', inputData: '10', expectedOutput: 'Positive', isHidden: false },
    { id: 'tc-2', inputData: '-5', expectedOutput: 'Negative', isHidden: false },
    { id: 'tc-3', inputData: '0', expectedOutput: 'Zero', isHidden: false },
    { id: 'tc-4', inputData: '9999', expectedOutput: 'Positive', isHidden: true },
  ],
  timeLimitMinutes: 90,
  totalMachines: 60,
  createdAt: new Date().toISOString(),
  isActive: true,
};

const INITIAL_FILES: VFSFile[] = [
  {
    name: 'main.c',
    language: 'c',
    content: `#include <stdio.h>

int main()
{
    int num;
    
    printf("Enter a number: ");
    scanf("%d", &num);
    
    if (num > 0)
    {
        printf("The number is Positive\\n");
    }
    else if (num < 0)
    {
        printf("The number is Negative\\n");
    }
    else
    {
        printf("The number is Zero\\n");
    }
    
    return 0;
}`,
  },
  {
    name: 'problem.md',
    language: 'markdown',
    content: `# Practical Problem: Check Positive, Negative, or Zero

Write a program that takes an integer **N** from standard input and determines whether it is:
- **Positive** (if N > 0)
- **Negative** (if N < 0)
- **Zero** (if N == 0)

### Sample Verification:
- **Input:** \`10\` -> **Output:** \`The number is Positive\`
- **Input:** \`-5\` -> **Output:** \`The number is Negative\`
- **Input:** \`0\` -> **Output:** \`The number is Zero\`
`,
  },
  {
    name: 'input.txt',
    language: 'text',
    content: '10',
  }
];

interface IDEContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  viewMode: AppViewMode;
  setViewMode: (mode: AppViewMode) => void;
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  activeSidebar: 'explorer' | 'problem' | 'faculty' | 'analytics';
  setActiveSidebar: React.Dispatch<React.SetStateAction<'explorer' | 'problem' | 'faculty' | 'analytics'>>;
  
  // Virtual File System (Local, 0% Server Load)
  files: VFSFile[];
  openTabs: string[];
  activeFileTab: string;
  setActiveFileTab: (name: string) => void;
  createNewFile: (name: string) => void;
  createNewFolder: (name: string) => void;
  deleteFile: (name: string) => void;
  closeFileTab: (name: string, e?: React.MouseEvent) => void;
  openFileInEditor: (name: string) => void;
  updateFileContent: (name: string, content: string) => void;
  
  language: ProgrammingLanguage;
  setLanguage: (lang: ProgrammingLanguage) => void;
  code: string;
  setCode: (code: string) => void;
  
  panelOpen: boolean;
  setPanelOpen: React.Dispatch<React.SetStateAction<boolean>>;
  panelTab: 'terminal' | 'testcases' | 'input' | 'anticheat';
  setPanelTab: React.Dispatch<React.SetStateAction<'terminal' | 'testcases' | 'input' | 'anticheat'>>;
  customInput: string;
  setCustomInput: (val: string) => void;
  terminalLogs: string[];
  setTerminalLogs: React.Dispatch<React.SetStateAction<string[]>>;
  isRunning: boolean;
  testResults: any[];
  student: StudentSessionInfo | null;
  activeSession: LabSessionData | null;
  sessionsList: LabSessionData[];
  isTeacherLoggedIn: boolean;
  teacherEmail: string;
  loginModalOpen: boolean;
  setLoginModalOpen: (val: boolean) => void;
  createSessionModalOpen: boolean;
  setCreateSessionModalOpen: (val: boolean) => void;
  joinSessionModalOpen: boolean;
  setJoinSessionModalOpen: (val: boolean) => void;
  inspectedAttendee: MachineAttendee | null;
  setInspectedAttendee: (val: MachineAttendee | null) => void;
  attendees: MachineAttendee[];
  handleRunCode: () => void;
  handleRunTests: () => void;
  handleSubmitPractical: () => void;
  handleTeacherLogin: (id: string, pass: string) => boolean;
  handleTeacherLogout: () => void;
  handleCreateSession: (session: Omit<LabSessionData, 'sessionCode' | 'sessionPassword' | 'createdAt' | 'isActive'>) => LabSessionData;
  handleStudentJoinSession: (code: string, pass: string, name: string, roll: string, machine: string) => { success: boolean; message: string };
  handleLeaveLabSession: () => void;
}

const IDEContext = createContext<IDEContextType | undefined>(undefined);

export function IDEProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>('vs-dark');
  const [viewMode, setViewMode] = useState<AppViewMode>('playground');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [activeSidebar, setActiveSidebar] = useState<'explorer' | 'problem' | 'faculty' | 'analytics'>('explorer');
  
  // VFS state (Stored locally in localStorage)
  const [files, setFiles] = useState<VFSFile[]>(INITIAL_FILES);
  const [openTabs, setOpenTabs] = useState<string[]>(['main.c', 'problem.md']);
  const [activeFileTab, setActiveFileTab] = useState<string>('main.c');
  const [language, setLanguageState] = useState<ProgrammingLanguage>('c');

  const [panelOpen, setPanelOpen] = useState<boolean>(true);
  const [panelTab, setPanelTab] = useState<'terminal' | 'testcases' | 'input' | 'anticheat'>('terminal');
  const [customInput, setCustomInput] = useState<string>('10');
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    'CodeLab Online IDE [Version 2.0.4]',
    'Host: Cloud Docker Sandbox (GCC 13 / Clang Ready)',
    'user@codelab:~$ '
  ]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [testResults, setTestResults] = useState<any[]>([]);

  // Session & Auth State
  const [sessionsList, setSessionsList] = useState<LabSessionData[]>([DEFAULT_DEMO_SESSION]);
  const [activeSession, setActiveSession] = useState<LabSessionData | null>(null);
  const [student, setStudent] = useState<StudentSessionInfo | null>(null);
  const [isTeacherLoggedIn, setIsTeacherLoggedIn] = useState<boolean>(false);
  const [teacherEmail, setTeacherEmail] = useState<string>('');

  // Modals
  const [loginModalOpen, setLoginModalOpen] = useState<boolean>(false);
  const [createSessionModalOpen, setCreateSessionModalOpen] = useState<boolean>(false);
  const [joinSessionModalOpen, setJoinSessionModalOpen] = useState<boolean>(false);
  const [inspectedAttendee, setInspectedAttendee] = useState<MachineAttendee | null>(null);
  const [attendees, setAttendees] = useState<MachineAttendee[]>([]);

  // Current active file code
  const currentFile = files.find(f => f.name === activeFileTab);
  const code = currentFile ? currentFile.content : '';

  const setCode = (newContent: string) => {
    setFiles(prev => prev.map(f => f.name === activeFileTab ? { ...f, content: newContent } : f));
  };

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('codelab_theme') as ThemeMode;
      if (savedTheme) setTheme(savedTheme);
      const savedFiles = localStorage.getItem('codelab_vfs');
      if (savedFiles) setFiles(JSON.parse(savedFiles));
    } catch (_) {}
  }, []);

  // Save to localStorage (Zero server load)
  useEffect(() => {
    try {
      localStorage.setItem('codelab_theme', theme);
      localStorage.setItem('codelab_vfs', JSON.stringify(files));
    } catch (_) {}
  }, [theme, files]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'vs-light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
  }, [theme]);

  // VFS Handlers: Create new file
  const createNewFile = (name: string) => {
    const cleanName = name.trim();
    if (!cleanName || files.some(f => f.name === cleanName)) return;

    let lang = 'c';
    if (cleanName.endsWith('.cpp')) lang = 'cpp';
    else if (cleanName.endsWith('.java')) lang = 'java';
    else if (cleanName.endsWith('.py')) lang = 'python';
    else if (cleanName.endsWith('.md')) lang = 'markdown';
    else if (cleanName.endsWith('.txt')) lang = 'text';

    const newFile: VFSFile = {
      name: cleanName,
      language: lang,
      content: cleanName.endsWith('.c') ? '// New C source file\n#include <stdio.h>\n\nint main() {\n    printf("Hello from ' + cleanName + '\\n");\n    return 0;\n}\n' : ''
    };

    setFiles(prev => [...prev, newFile]);
    setOpenTabs(prev => [...prev.filter(t => t !== cleanName), cleanName]);
    setActiveFileTab(cleanName);
  };

  // Create new folder (virtual)
  const createNewFolder = (name: string) => {
    const cleanName = name.trim();
    if (!cleanName || files.some(f => f.name === cleanName)) return;
    const newFolder: VFSFile = {
      name: cleanName,
      language: 'folder',
      content: '',
      isFolder: true
    };
    setFiles(prev => [...prev, newFolder]);
  };

  // Delete file
  const deleteFile = (name: string) => {
    if (files.length <= 1) return;
    setFiles(prev => prev.filter(f => f.name !== name));
    setOpenTabs(prev => prev.filter(t => t !== name));
    if (activeFileTab === name) {
      const remaining = files.filter(f => f.name !== name && !f.isFolder);
      if (remaining.length > 0) {
        setActiveFileTab(remaining[0].name);
      }
    }
  };

  // Open file tab
  const openFileInEditor = (name: string) => {
    if (!openTabs.includes(name)) {
      setOpenTabs(prev => [...prev, name]);
    }
    setActiveFileTab(name);
  };

  // Close file tab (Kata button on tab)
  const closeFileTab = (name: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const updated = openTabs.filter(t => t !== name);
    setOpenTabs(updated);
    if (activeFileTab === name) {
      if (updated.length > 0) {
        setActiveFileTab(updated[updated.length - 1]);
      }
    }
  };

  const updateFileContent = (name: string, content: string) => {
    setFiles(prev => prev.map(f => f.name === name ? { ...f, content } : f));
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'vs-dark' ? 'vs-light' : 'vs-dark');
  };

  const setLanguage = (newLang: ProgrammingLanguage) => {
    setLanguageState(newLang);
    const fileExt = newLang === 'c' ? 'main.c' : (newLang === 'cpp' ? 'main.cpp' : (newLang === 'java' ? 'Main.java' : 'script.py'));
    if (!files.some(f => f.name === fileExt)) {
      createNewFile(fileExt);
    } else {
      openFileInEditor(fileExt);
    }
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setPanelOpen(true);
    setPanelTab('terminal');

    setTerminalLogs(prev => [
      ...prev,
      `user@codelab:~$ gcc -O2 ${activeFileTab} -o main && ./main`,
      `[Compiling and running inside sandbox...]`
    ]);

    try {
      const { executeCodeLive } = await import('@/utils/codeRunner');
      const result = await executeCodeLive(language, code, customInput);

      setTerminalLogs(prev => [
        ...prev,
        result.output || (result.error ? `Error: ${result.error}` : 'Process exited.'),
        `\n[Execution Succeeded: ${result.durationMs}ms with return code ${result.exitCode}]`,
        'user@codelab:~$ '
      ]);
    } catch (err: any) {
      setTerminalLogs(prev => [
        ...prev,
        `Runtime Error: ${err.message}`,
        'user@codelab:~$ '
      ]);
    } finally {
      setIsRunning(false);
    }
  };

  const handleRunTests = async () => {
    setIsRunning(true);
    setPanelOpen(true);
    setPanelTab('testcases');

    const cases = activeSession?.testCases || [
      { id: 'tc-1', inputData: '10', expectedOutput: 'Positive', isHidden: false },
      { id: 'tc-2', inputData: '-5', expectedOutput: 'Negative', isHidden: false },
      { id: 'tc-3', inputData: '0', expectedOutput: 'Zero', isHidden: false },
      { id: 'tc-4', inputData: '9999', expectedOutput: 'Positive', isHidden: true },
    ];

    try {
      const { executeCodeLive } = await import('@/utils/codeRunner');
      const evaluated = [];

      for (let i = 0; i < cases.length; i++) {
        const tc = cases[i];
        const res = await executeCodeLive(language, code, tc.inputData);
        const actualTrimmed = (res.output || '').trim();
        const expectedTrimmed = tc.expectedOutput.trim();
        const passed = actualTrimmed.includes(expectedTrimmed) || actualTrimmed === expectedTrimmed;

        evaluated.push({
          caseNumber: i + 1,
          passed,
          input: tc.inputData,
          expected: tc.expectedOutput,
          actual: actualTrimmed || '(No Output)',
          timeMs: res.durationMs,
          isHidden: tc.isHidden
        });
      }

      setTestResults(evaluated);
    } catch (_) {
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmitPractical = () => {
    handleRunTests();
    if (student) {
      setStudent(prev => prev ? { ...prev, submitted: true, score: 100 } : null);
    }
    
    try {
      const confetti = require('canvas-confetti');
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (_) {}
  };

  const handleTeacherLogin = (id: string, pass: string): boolean => {
    if (id.trim() && pass.trim()) {
      setIsTeacherLoggedIn(true);
      setTeacherEmail(id);
      setViewMode('teacher_dashboard');
      return true;
    }
    return false;
  };

  const handleTeacherLogout = () => {
    setIsTeacherLoggedIn(false);
    setTeacherEmail('');
    setViewMode('playground');
  };

  const handleCreateSession = (data: Omit<LabSessionData, 'sessionCode' | 'sessionPassword' | 'createdAt' | 'isActive'>): LabSessionData => {
    const randomCode = `LAB-${Math.floor(1000 + Math.random() * 9000)}`;
    const randomPass = `${Math.floor(1000 + Math.random() * 9000)}`;

    const newSession: LabSessionData = {
      ...data,
      sessionCode: randomCode,
      sessionPassword: randomPass,
      createdAt: new Date().toISOString(),
      isActive: true,
    };

    setSessionsList(prev => [newSession, ...prev]);
    setActiveSession(newSession);
    return newSession;
  };

  const handleStudentJoinSession = (
    codeStr: string,
    pass: string,
    name: string,
    roll: string,
    machine: string
  ): { success: boolean; message: string } => {
    const targetSession = sessionsList.find(
      s => s.sessionCode.toUpperCase() === codeStr.trim().toUpperCase() && s.sessionPassword === pass.trim()
    );

    if (!targetSession) {
      return { success: false, message: 'Invalid Session Code or Password. Please verify with your teacher.' };
    }

    const studentInfo: StudentSessionInfo = {
      name: name.trim() || 'Student',
      rollNumber: roll.trim() || '001',
      section: targetSession.batchName,
      machineNumber: machine.trim() || 'PC-01',
      sessionCode: targetSession.sessionCode,
      language: 'c',
      submitted: false,
      score: 0,
      tabSwitches: 0,
    };

    setActiveSession(targetSession);
    setStudent(studentInfo);
    setViewMode('student_lab');
    setJoinSessionModalOpen(false);
    return { success: true, message: 'Successfully joined lab session!' };
  };

  const handleLeaveLabSession = () => {
    setStudent(null);
    setActiveSession(null);
    setViewMode('playground');
  };

  return (
    <IDEContext.Provider
      value={{
        theme,
        toggleTheme,
        viewMode,
        setViewMode,
        sidebarOpen,
        setSidebarOpen,
        activeSidebar,
        setActiveSidebar,
        files,
        openTabs,
        activeFileTab,
        setActiveFileTab,
        createNewFile,
        createNewFolder,
        deleteFile,
        closeFileTab,
        openFileInEditor,
        updateFileContent,
        language,
        setLanguage,
        code,
        setCode,
        panelOpen,
        setPanelOpen,
        panelTab,
        setPanelTab,
        customInput,
        setCustomInput,
        terminalLogs,
        setTerminalLogs,
        isRunning,
        testResults,
        student,
        activeSession,
        sessionsList,
        isTeacherLoggedIn,
        teacherEmail,
        loginModalOpen,
        setLoginModalOpen,
        createSessionModalOpen,
        setCreateSessionModalOpen,
        joinSessionModalOpen,
        setJoinSessionModalOpen,
        inspectedAttendee,
        setInspectedAttendee,
        attendees,
        handleRunCode,
        handleRunTests,
        handleSubmitPractical,
        handleTeacherLogin,
        handleTeacherLogout,
        handleCreateSession,
        handleStudentJoinSession,
        handleLeaveLabSession,
      }}
    >
      {children}
    </IDEContext.Provider>
  );
}

export function useIDE() {
  const context = useContext(IDEContext);
  if (!context) throw new Error('useIDE must be used within an IDEProvider');
  return context;
}

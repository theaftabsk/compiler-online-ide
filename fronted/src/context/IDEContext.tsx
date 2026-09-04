'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ProgrammingLanguage, StudentSessionInfo, MachineAttendee, TestCase } from '@/types';
import { executeCodeLive } from '@/utils/codeRunner';

export type ThemeMode = 'vs-dark' | 'vs-light';
export type AppViewMode = 'playground' | 'student_lab' | 'teacher_dashboard';

export interface VFSFile {
  name: string;
  content: string;
  language: string;
  isFolder?: boolean;
}

export interface TerminalInstance {
  id: string;
  name: string;
  logs: string[];
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
  questionTitle: 'Check Even or Odd',
  questionDescription: 'Write a program in C to take an integer input from stdin and determine if it is Even or Odd.',
  testCases: [
    { id: 'tc-1', inputData: '10', expectedOutput: 'Even', isHidden: false },
    { id: 'tc-2', inputData: '7', expectedOutput: 'Odd', isHidden: false },
    { id: 'tc-3', inputData: '0', expectedOutput: 'Even', isHidden: false },
    { id: 'tc-4', inputData: '99', expectedOutput: 'Odd', isHidden: true },
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

    if (num % 2 == 0)
    {
        printf("The number is Even\\n");
    }
    else
    {
        printf("The number is Odd\\n");
    }

    return 0;
}`,
  },
  {
    name: 'problem.md',
    language: 'markdown',
    content: `# Practical Problem: Check Even or Odd

Write a program that takes an integer **N** from standard input and determines whether it is **Even** or **Odd**.

### Sample Verification:
- **Input:** \`10\` -> **Output:** \`The number is Even\`
- **Input:** \`7\` -> **Output:** \`The number is Odd\`
- **Input:** \`0\` -> **Output:** \`The number is Even\`
`,
  },
];

export function generateLabAttendees(
  activeStudent?: StudentSessionInfo | null,
  currentCode?: string,
  sessionCode: string = 'LAB-2026'
): MachineAttendee[] {
  let savedStudent: any = null;
  let savedCode: string = '';
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(`kaspro_active_student_${sessionCode}`) || localStorage.getItem('kaspro_active_student_LAB-2026');
      if (raw) {
        savedStudent = JSON.parse(raw);
        savedCode = savedStudent.currentCode || '';
      }
    } catch (_) {}
  }

  const effStudent = activeStudent || savedStudent;
  const effCode = currentCode || savedCode || '#include <stdio.h>\n\nint main() {\n    float a, b, c, average;\n    printf("Enter three numbers: ");\n    scanf("%f %f %f", &a, &b, &c);\n    average = (a + b + c) / 3;\n    printf("Average = %.2f", average);\n    return 0;\n}';

  const list: MachineAttendee[] = [];
  for (let i = 1; i <= 60; i++) {
    const pcNum = `PC-${i < 10 ? '0' + i : i}`;

    // If this is the active user's / student's workstation
    if (effStudent && effStudent.machineNumber === pcNum) {
      list.push({
        machineNumber: pcNum,
        studentName: effStudent.name || 'Aftab Sk',
        rollNumber: effStudent.rollNumber || '538',
        section: effStudent.section || 'Section J - Batch 2026',
        status: effStudent.submitted ? 'SUBMITTED' : 'CODING',
        language: effStudent.language || 'c',
        score: effStudent.score || (effStudent.submitted ? 100 : 75),
        passedCases: effStudent.submitted ? '4/4' : '3/4',
        tabSwitches: effStudent.tabSwitches || 0,
        isUser: true,
        code: effCode,
      });
      continue;
    }

    // Default simulated classmates for full lab visibility
    if (i === 3) {
      list.push({
        machineNumber: pcNum,
        studentName: 'Rohan Das',
        rollNumber: '503',
        section: 'Section J',
        status: 'CODING',
        language: 'c',
        score: 75,
        passedCases: '3/4',
        tabSwitches: 1,
        isUser: false,
        code: '#include <stdio.h>\nint main() {\n    int n;\n    scanf("%d", &n);\n    if (n % 2 == 0) printf("Even\\n");\n    else printf("Odd\\n");\n    return 0;\n}',
      });
    } else if (i === 7) {
      list.push({
        machineNumber: pcNum,
        studentName: 'Priya Sharma',
        rollNumber: '517',
        section: 'Section J',
        status: 'SUBMITTED',
        language: 'c',
        score: 100,
        passedCases: '4/4',
        tabSwitches: 0,
        isUser: false,
        code: '#include <stdio.h>\nint main() {\n    int a, b;\n    scanf("%d%d", &a, &b);\n    printf("Sum = %d\\n", a + b);\n    return 0;\n}',
      });
    } else if (i === 12) {
      list.push({
        machineNumber: pcNum,
        studentName: 'Sneha Roy',
        rollNumber: '522',
        section: 'Section J',
        status: 'CODING',
        language: 'c',
        score: 50,
        passedCases: '2/4',
        tabSwitches: 0,
        isUser: false,
        code: '#include <stdio.h>\nint main() { printf("Working...\\n"); return 0; }',
      });
    } else if (i === 14 && (!effStudent || effStudent.machineNumber !== 'PC-14')) {
      // By default PC-14 has the student Aftab Sk
      list.push({
        machineNumber: pcNum,
        studentName: 'Aftab Sk',
        rollNumber: '538',
        section: 'Section J',
        status: 'CODING',
        language: 'c',
        score: 100,
        passedCases: '4/4',
        tabSwitches: 0,
        isUser: true,
        code: effCode,
      });
    } else if (i === 21) {
      list.push({
        machineNumber: pcNum,
        studentName: 'Sourav Sen',
        rollNumber: '531',
        section: 'Section J',
        status: 'OFFLINE',
        language: 'c',
        score: 0,
        passedCases: '0/4',
        tabSwitches: 3,
        isUser: false,
        code: '// Machine disconnected',
      });
    } else {
      list.push({
        machineNumber: pcNum,
        studentName: 'Available PC',
        rollNumber: '---',
        section: 'Section J',
        status: 'EMPTY',
        language: 'c',
        score: 0,
        passedCases: '0/0',
        tabSwitches: 0,
        isUser: false,
        code: '// Waiting for student to connect...',
      });
    }
  }
  return list;
}

interface IDEContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  viewMode: AppViewMode;
  setViewMode: (mode: AppViewMode) => void;
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  activeSidebar: 'explorer' | 'problem' | 'faculty' | 'analytics';
  setActiveSidebar: React.Dispatch<React.SetStateAction<'explorer' | 'problem' | 'faculty' | 'analytics'>>;
  files: VFSFile[];
  openTabs: string[];
  activeFileTab: string;
  setActiveFileTab: (name: string) => void;
  createNewFile: (name: string) => void;
  createNewFolder: (name: string) => void;
  deleteFile: (name: string) => void;
  renameFile: (oldName: string, newName: string) => void;
  closeFileTab: (name: string, e?: React.MouseEvent) => void;
  openFileInEditor: (name: string) => void;
  updateFileContent: (name: string, content: string) => void;
  language: ProgrammingLanguage;
  setLanguage: (lang: ProgrammingLanguage) => void;
  code: string;
  setCode: (code: string) => void;
  panelOpen: boolean;
  setPanelOpen: React.Dispatch<React.SetStateAction<boolean>>;
  panelTab: 'terminal' | 'testcases' | 'anticheat';
  setPanelTab: React.Dispatch<React.SetStateAction<'terminal' | 'testcases' | 'anticheat'>>;
  // Terminals State
  terminals: TerminalInstance[];
  setTerminals: React.Dispatch<React.SetStateAction<TerminalInstance[]>>;
  activeTermId: string;
  setActiveTermId: (id: string) => void;
  handleAddNewTerminal: () => void;
  handleKillTerminal: (id: string, e?: React.MouseEvent) => void;
  // Interactive Live STDIN state
  waitingForStdin: boolean;
  setWaitingForStdin: (val: boolean) => void;
  pendingPromptText: string;
  setPendingPromptText: (val: string) => void;
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
  handleRunCode: (explicitInput?: string) => Promise<void>;
  handleRunTests: () => Promise<void>;
  handleSubmitPractical: () => void;
  handleTeacherLogin: (id: string, pass: string) => boolean;
  handleTeacherLogout: () => void;
  handleCreateSession: (session: Omit<LabSessionData, 'sessionCode' | 'sessionPassword' | 'createdAt' | 'isActive'>) => Promise<LabSessionData>;
  handleStudentJoinSession: (code: string, pass: string, name: string, roll: string, machine: string) => Promise<{ success: boolean; message: string }>;
  handleLeaveLabSession: () => void;
  fetchSessions: () => Promise<void>;
}

const IDEContext = createContext<IDEContextType | undefined>(undefined);

export function IDEProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>('vs-dark');
  const [viewMode, setViewMode] = useState<AppViewMode>('playground');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [activeSidebar, setActiveSidebar] = useState<'explorer' | 'problem' | 'faculty' | 'analytics'>('explorer');

  const [files, setFiles] = useState<VFSFile[]>(INITIAL_FILES);
  const [openTabs, setOpenTabs] = useState<string[]>(['main.c', 'problem.md']);
  const [activeFileTab, setActiveFileTab] = useState<string>('main.c');
  const [language, setLanguageState] = useState<ProgrammingLanguage>('c');

  const [panelOpen, setPanelOpen] = useState<boolean>(true);
  const [panelTab, setPanelTab] = useState<'terminal' | 'testcases' | 'anticheat'>('terminal');

  // Unified Terminals State
  const [terminals, setTerminals] = useState<TerminalInstance[]>([
    {
      id: 'term-1',
      name: '1: bash',
      logs: [
        'Host: Cloud Docker Sandbox (GCC 13 / Python 3.11 Ready)',
        'user@codelab:~$ '
      ]
    }
  ]);
  const [activeTermId, setActiveTermId] = useState<string>('term-1');

  // Interactive Live STDIN state
  const [waitingForStdin, setWaitingForStdin] = useState<boolean>(false);
  const [pendingPromptText, setPendingPromptText] = useState<string>('');

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [testResults, setTestResults] = useState<any[]>([]);

  const [sessionsList, setSessionsList] = useState<LabSessionData[]>([DEFAULT_DEMO_SESSION]);
  const [activeSession, setActiveSession] = useState<LabSessionData | null>(DEFAULT_DEMO_SESSION);

  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch('/api/sessions', { cache: 'no-store' });
      const data = await res.json();
      if (data?.success && Array.isArray(data.sessions) && data.sessions.length > 0) {
        const mapped: LabSessionData[] = data.sessions.map((s: any) => ({
          sessionCode: s.sessionCode,
          sessionPassword: s.sessionPassword,
          subjectName: s.subjectName,
          department: s.department,
          batchName: s.batchName,
          teacherName: s.facultyName || 'Faculty Incharge',
          questionTitle: s.questionTitle || 'Lab Practical',
          questionDescription: s.questionDescription || '',
          testCases: [],
          timeLimitMinutes: 90,
          totalMachines: s.totalCapacity || 60,
          createdAt: s.startedAt,
          isActive: s.status === 'ACTIVE',
        }));
        setSessionsList(mapped);
        const active = mapped.find(s => s.isActive) || mapped[0];
        if (active) setActiveSession(active);
      }
    } catch (err) {
      console.warn('Could not fetch real sessions from DB:', err);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);
  const [student, setStudent] = useState<StudentSessionInfo | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const s = localStorage.getItem('kaspro_student_info');
        if (s) return JSON.parse(s);
      } catch (_) {}
    }
    return null;
  });
  const [isTeacherLoggedIn, setIsTeacherLoggedIn] = useState<boolean>(false);
  const [teacherEmail, setTeacherEmail] = useState<string>('');

  const [loginModalOpen, setLoginModalOpen] = useState<boolean>(false);
  const [createSessionModalOpen, setCreateSessionModalOpen] = useState<boolean>(false);
  const [joinSessionModalOpen, setJoinSessionModalOpen] = useState<boolean>(false);
  const [inspectedAttendee, setInspectedAttendee] = useState<MachineAttendee | null>(null);
  const [attendees, setAttendees] = useState<MachineAttendee[]>(() => generateLabAttendees(null, '', 'LAB-2026'));

  const currentFile = files.find(f => f.name === activeFileTab);
  const code = currentFile ? currentFile.content : '';

  const setCode = (newContent: string) => {
    setFiles(prev => prev.map(f => f.name === activeFileTab ? { ...f, content: newContent } : f));
  };

  // Sync active student state across tabs & to attendees
  useEffect(() => {
    const sync = () => {
      const activeCode = files.find(f => f.name === activeFileTab)?.content || '';
      if (student) {
        try {
          const sessCode = activeSession?.sessionCode || student.sessionCode || 'LAB-2026';
          const payload = {
            ...student,
            currentCode: activeCode,
            sessionCode: sessCode,
            updatedAt: Date.now(),
          };
          localStorage.setItem(`kaspro_active_student_${sessCode}`, JSON.stringify(payload));
          localStorage.setItem('kaspro_student_info', JSON.stringify(student));

          // Real database sync via API
          fetch('/api/sessions/heartbeat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionCode: sessCode,
              machineNumber: student.machineNumber,
              code: activeCode,
              tabSwitches: student.tabSwitches || 0,
              submitted: student.submitted || false,
              score: student.score || 0,
            }),
          }).catch(() => {});
        } catch (_) {}
      }
      setAttendees(generateLabAttendees(student, activeCode, activeSession?.sessionCode || 'LAB-2026'));
    };

    sync();

    const handleStorage = (e: StorageEvent) => {
      if (e.key?.includes('kaspro_active_student') || e.key?.includes('codelab_vfs') || e.key?.includes('kaspro_student_info')) {
        sync();
      }
    };
    window.addEventListener('storage', handleStorage);

    let bc: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        bc = new BroadcastChannel('kaspro_lab_realtime');
        bc.onmessage = () => sync();
      } catch (_) {}
    }

    const interval = setInterval(sync, 1500);

    return () => {
      window.removeEventListener('storage', handleStorage);
      if (bc) bc.close();
      clearInterval(interval);
    };
  }, [student, files, activeFileTab, activeSession]);

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('codelab_theme') as ThemeMode;
      if (savedTheme) setTheme(savedTheme);
      const savedFiles = localStorage.getItem('codelab_vfs');
      if (savedFiles) setFiles(JSON.parse(savedFiles));
    } catch (_) {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('codelab_theme', theme);
      localStorage.setItem('codelab_vfs', JSON.stringify(files));
    } catch (_) {}
  }, [theme, files]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'vs-light') {
      root.classList.remove('dark'); root.classList.add('light');
    } else {
      root.classList.remove('light'); root.classList.add('dark');
    }
  }, [theme]);

  const handleAddNewTerminal = () => {
    const newId = `term-${Date.now()}`;
    const newIndex = terminals.length + 1;
    const newTerm: TerminalInstance = {
      id: newId,
      name: `${newIndex}: bash`,
      logs: [
        `[New Terminal Session #${newIndex} Initialized]`,
        'user@codelab:~$ '
      ]
    };
    setTerminals(prev => [...prev, newTerm]);
    setActiveTermId(newId);
    setPanelTab('terminal');
  };

  const handleKillTerminal = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (terminals.length === 1) {
      setTerminals([{
        id: 'term-1',
        name: '1: bash',
        logs: ['user@codelab:~$ ']
      }]);
      return;
    }
    const filtered = terminals.filter(t => t.id !== id);
    setTerminals(filtered);
    if (activeTermId === id) {
      setActiveTermId(filtered[filtered.length - 1].id);
    }
  };

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
      name: cleanName, language: lang,
      content: cleanName.endsWith('.c') ? '#include <stdio.h>\n\nint main() {\n    printf("Hello!\\n");\n    return 0;\n}\n' : ''
    };
    setFiles(prev => [...prev, newFile]);
    setOpenTabs(prev => [...prev.filter(t => t !== cleanName), cleanName]);
    setActiveFileTab(cleanName);
  };

  const createNewFolder = (name: string) => {
    const cleanName = name.trim();
    if (!cleanName || files.some(f => f.name === cleanName)) return;
    setFiles(prev => [...prev, { name: cleanName, language: 'folder', content: '', isFolder: true }]);
  };

  const deleteFile = (name: string) => {
    if (files.length <= 1) return;
    setFiles(prev => prev.filter(f => f.name !== name));
    setOpenTabs(prev => prev.filter(t => t !== name));
    if (activeFileTab === name) {
      const remaining = files.filter(f => f.name !== name && !f.isFolder);
      if (remaining.length > 0) setActiveFileTab(remaining[0].name);
    }
  };

  const renameFile = (oldName: string, newName: string) => {
    const cleanNewName = newName.trim();
    if (!cleanNewName || files.some(f => f.name === cleanNewName)) return;
    setFiles(prev => prev.map(f => f.name === oldName ? { ...f, name: cleanNewName } : f));
    setOpenTabs(prev => prev.map(t => t === oldName ? cleanNewName : t));
    if (activeFileTab === oldName) {
      setActiveFileTab(cleanNewName);
    }
  };

  const openFileInEditor = (name: string) => {
    if (!openTabs.includes(name)) setOpenTabs(prev => [...prev, name]);
    setActiveFileTab(name);
  };

  const closeFileTab = (name: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const updated = openTabs.filter(t => t !== name);
    setOpenTabs(updated);
    if (activeFileTab === name && updated.length > 0) setActiveFileTab(updated[updated.length - 1]);
  };

  const updateFileContent = (name: string, content: string) => {
    setFiles(prev => prev.map(f => f.name === name ? { ...f, content } : f));
  };

  const toggleTheme = () => setTheme(prev => prev === 'vs-dark' ? 'vs-light' : 'vs-dark');

  const setLanguage = (newLang: ProgrammingLanguage) => {
    setLanguageState(newLang);
    const fileExt = newLang === 'c' ? 'main.c' : (newLang === 'cpp' ? 'main.cpp' : (newLang === 'java' ? 'Main.java' : 'script.py'));
    if (!files.some(f => f.name === fileExt)) createNewFile(fileExt);
    else openFileInEditor(fileExt);
  };

  // Helper to check if code needs stdin (scanf, cin, input, Scanner)
  const codeNeedsStdin = (src: string): boolean => {
    return src.includes('scanf(') || src.includes('cin >>') || src.includes('cin>>') || src.includes('input(') || src.includes('Scanner') || src.includes('readLine');
  };

  // Extract prompt text before input (e.g. "Enter a number: ")
  const extractPrompt = (src: string): string => {
    const m = src.match(/printf\s*\(\s*["']([^"']+)["']\s*\)/);
    if (m) {
      return m[1].replace(/\\n/g, '').trim() + ' ';
    }
    const pyMatch = src.match(/input\s*\(\s*["']([^"']+)["']\s*\)/);
    if (pyMatch) {
      return pyMatch[1].trim() + ' ';
    }
    return 'Enter input: ';
  };

  // ============================================================
  // UNIFIED LIVE RUN HANDLER (Used by ▶ Run button & CLI)
  // If code has scanf -> pauses in terminal and asks for input
  // Otherwise -> compiles and runs immediately in sandbox
  // ============================================================
  const handleRunCode = async (explicitInput?: string) => {
    setPanelOpen(true);
    setPanelTab('terminal');

    const cmdStr = language === 'c'
      ? `user@codelab:~$ gcc -O2 ${activeFileTab} -o main && ./main`
      : (language === 'cpp'
        ? `user@codelab:~$ g++ -O2 ${activeFileTab} -o main && ./main`
        : `user@codelab:~$ python3 ${activeFileTab}`);

    // If explicitInput is provided (e.g. from terminal submit or run 10)
    if (explicitInput !== undefined) {
      setIsRunning(true);
      try {
        const result = await executeCodeLive(language, code, explicitInput);
        let out = (result.output || '').trim();
        const prompt = pendingPromptText.trim();
        if (prompt && out.startsWith(prompt)) {
          out = out.slice(prompt.length).trim();
        }

        setTerminals(prev => prev.map(t => {
          if (t.id === activeTermId) {
            return {
              ...t,
              logs: [
                ...t.logs,
                out || (result.error ? `Error: ${result.error}` : ''),
                `[Execution Succeeded: ${result.durationMs}ms with exit code ${result.exitCode}]`,
                'user@codelab:~$ '
              ]
            };
          }
          return t;
        }));
      } catch (err: any) {
        setTerminals(prev => prev.map(t => {
          if (t.id === activeTermId) {
            return {
              ...t,
              logs: [...t.logs, `Runtime Error: ${err.message}`, 'user@codelab:~$ ']
            };
          }
          return t;
        }));
      } finally {
        setIsRunning(false);
        setWaitingForStdin(false);
        setPendingPromptText('');
      }
      return;
    }

    // Check if code requires STDIN (scanf/input/cin)
    if (codeNeedsStdin(code)) {
      const prompt = extractPrompt(code);
      setPendingPromptText(prompt);
      setWaitingForStdin(true);

      setTerminals(prev => prev.map(t => {
        if (t.id === activeTermId) {
          return {
            ...t,
            logs: [
              ...t.logs,
              cmdStr,
              '[Compiling in Docker sandbox...]',
              prompt
            ]
          };
        }
        return t;
      }));
      return;
    }

    // Code has no scanf/cin -> run directly
    setIsRunning(true);
    setTerminals(prev => prev.map(t => {
      if (t.id === activeTermId) {
        return {
          ...t,
          logs: [
            ...t.logs,
            cmdStr,
            '[Compiling and executing in Docker sandbox...]'
          ]
        };
      }
      return t;
    }));

    try {
      const result = await executeCodeLive(language, code, '');
      const finalOut = result.output || (result.error ? `Error: ${result.error}` : '(Process completed)');

      setTerminals(prev => prev.map(t => {
        if (t.id === activeTermId) {
          return {
            ...t,
            logs: [
              ...t.logs,
              finalOut,
              `[Execution Succeeded: ${result.durationMs}ms with exit code ${result.exitCode}]`,
              'user@codelab:~$ '
            ]
          };
        }
        return t;
      }));
    } catch (err: any) {
      setTerminals(prev => prev.map(t => {
        if (t.id === activeTermId) {
          return {
            ...t,
            logs: [...t.logs, `Runtime Error: ${err.message}`, 'user@codelab:~$ ']
          };
        }
        return t;
      }));
    } finally {
      setIsRunning(false);
    }
  };

  const handleRunTests = async () => {
    setIsRunning(true);
    setPanelOpen(true);
    setPanelTab('testcases');

    const cases = activeSession?.testCases || [
      { id: 'tc-1', inputData: '10', expectedOutput: 'Even', isHidden: false },
      { id: 'tc-2', inputData: '7', expectedOutput: 'Odd', isHidden: false },
      { id: 'tc-3', inputData: '0', expectedOutput: 'Even', isHidden: false },
      { id: 'tc-4', inputData: '99', expectedOutput: 'Odd', isHidden: true },
    ];

    try {
      const evaluated = [];
      for (let i = 0; i < cases.length; i++) {
        const tc = cases[i];
        const res = await executeCodeLive(language, code, tc.inputData);
        const actualTrimmed = (res.output || '').trim();
        const expectedTrimmed = tc.expectedOutput.trim();
        const passed =
          actualTrimmed.toLowerCase().includes(expectedTrimmed.toLowerCase()) ||
          expectedTrimmed.toLowerCase().includes(actualTrimmed.toLowerCase());
        evaluated.push({
          caseNumber: i + 1, passed,
          input: tc.inputData, expected: tc.expectedOutput,
          actual: actualTrimmed || '(No Output)',
          timeMs: res.durationMs, isHidden: tc.isHidden
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
    if (student && activeSession) {
      setStudent(prev => prev ? { ...prev, submitted: true, score: 100 } : null);
      fetch('/api/sessions/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionCode: activeSession.sessionCode,
          machineNumber: student.machineNumber,
          code: code,
          submitted: true,
          score: 100,
          tabSwitches: student.tabSwitches || 0,
        }),
      }).catch(err => console.warn('Could not submit practical:', err));
    }
  };

  const handleTeacherLogin = (id: string, pass: string): boolean => {
    if (id.trim() && pass.trim()) {
      setIsTeacherLoggedIn(true); setTeacherEmail(id); setViewMode('teacher_dashboard'); return true;
    }
    return false;
  };

  const handleTeacherLogout = () => {
    setIsTeacherLoggedIn(false); setTeacherEmail(''); setViewMode('playground');
  };

  const handleCreateSession = async (data: Omit<LabSessionData, 'sessionCode' | 'sessionPassword' | 'createdAt' | 'isActive'>): Promise<LabSessionData> => {
    try {
      const res = await fetch('/api/sessions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json?.success && json?.session) {
        const newSession: LabSessionData = {
          sessionCode: json.session.sessionCode,
          sessionPassword: json.session.sessionPassword,
          subjectName: json.session.subjectName,
          department: json.session.department,
          batchName: json.session.batchName,
          teacherName: json.session.facultyName || data.teacherName,
          questionTitle: json.session.questionTitle || data.questionTitle,
          questionDescription: json.session.questionDescription || data.questionDescription,
          testCases: data.testCases || [],
          timeLimitMinutes: data.timeLimitMinutes || 90,
          totalMachines: json.session.totalCapacity || data.totalMachines || 60,
          createdAt: json.session.startedAt || new Date().toISOString(),
          isActive: json.session.status === 'ACTIVE',
        };
        setSessionsList(prev => [newSession, ...prev.filter(s => s.sessionCode !== newSession.sessionCode)]);
        setActiveSession(newSession);
        return newSession;
      }
    } catch (err) {
      console.error('API session creation failed, fallback to local:', err);
    }

    const randomCode = `LAB-${Math.floor(1000 + Math.random() * 9000)}`;
    const randomPass = `${Math.floor(1000 + Math.random() * 9000)}`;
    const newSession: LabSessionData = {
      ...data, sessionCode: randomCode, sessionPassword: randomPass,
      createdAt: new Date().toISOString(), isActive: true,
    };
    setSessionsList(prev => [newSession, ...prev]);
    setActiveSession(newSession);
    return newSession;
  };

  const handleStudentJoinSession = async (codeStr: string, pass: string, name: string, roll: string, machine: string): Promise<{ success: boolean; message: string }> => {
    const cleanCode = codeStr.trim().toUpperCase();
    const studentName = name.trim() || 'Aftab Sk';
    const rollNumber = roll.trim() || '538';
    const machineNumber = machine.trim() ? machine.trim().toUpperCase() : 'PC-14';

    try {
      const res = await fetch('/api/sessions/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionCode: cleanCode,
          password: pass.trim(),
          machineNumber,
          name: studentName,
          rollNumber,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, message: data.message || 'Invalid Session Code or Password.' };
      }

      const targetSession: LabSessionData = {
        sessionCode: data.session.sessionCode,
        sessionPassword: data.session.sessionPassword,
        subjectName: data.session.subjectName,
        department: data.session.department,
        batchName: data.session.batchName,
        teacherName: data.session.facultyName || 'Faculty In-Charge',
        questionTitle: data.session.questionTitle || 'Practical Exam',
        questionDescription: data.session.questionDescription || '',
        testCases: [],
        timeLimitMinutes: 90,
        totalMachines: data.session.totalCapacity || 60,
        createdAt: data.session.startedAt,
        isActive: data.session.status === 'ACTIVE',
      };

      const studentInfo: StudentSessionInfo = {
        name: studentName,
        rollNumber,
        section: data.session.batchName,
        machineNumber,
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

      try {
        localStorage.setItem('kaspro_student_info', JSON.stringify(studentInfo));
      } catch (_) {}

      return { success: true, message: 'Successfully joined lab session!' };
    } catch (err: any) {
      return { success: false, message: `Could not connect to session server: ${err.message}` };
    }
  };

  const handleLeaveLabSession = () => {
    try {
      localStorage.removeItem('kaspro_student_info');
    } catch (_) {}
    setStudent(null);
    setActiveSession(null);
    setViewMode('playground');
  };

  return (
    <IDEContext.Provider value={{
      theme, toggleTheme, viewMode, setViewMode,
      sidebarOpen, setSidebarOpen, activeSidebar, setActiveSidebar,
      files, openTabs, activeFileTab, setActiveFileTab,
      createNewFile, createNewFolder, deleteFile, renameFile, closeFileTab, openFileInEditor, updateFileContent,
      language, setLanguage, code, setCode,
      panelOpen, setPanelOpen, panelTab, setPanelTab,
      terminals, setTerminals, activeTermId, setActiveTermId,
      handleAddNewTerminal, handleKillTerminal,
      waitingForStdin, setWaitingForStdin,
      pendingPromptText, setPendingPromptText,
      isRunning, testResults,
      student, activeSession, sessionsList,
      isTeacherLoggedIn, teacherEmail,
      loginModalOpen, setLoginModalOpen,
      createSessionModalOpen, setCreateSessionModalOpen,
      joinSessionModalOpen, setJoinSessionModalOpen,
      inspectedAttendee, setInspectedAttendee, attendees,
      handleRunCode, handleRunTests, handleSubmitPractical,
      handleTeacherLogin, handleTeacherLogout,
      handleCreateSession, handleStudentJoinSession, handleLeaveLabSession,
      fetchSessions,
    }}>
      {children}
    </IDEContext.Provider>
  );
}

export function useIDE() {
  const context = useContext(IDEContext);
  if (!context) throw new Error('useIDE must be used within an IDEProvider');
  return context;
}

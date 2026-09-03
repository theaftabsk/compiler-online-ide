'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Trash2, 
  X, 
  Maximize2, 
  Minimize2, 
  ChevronDown,
  Terminal as TerminalIcon,
  Plus
} from 'lucide-react';
import { useIDE } from '@/context/IDEContext';

export default function BottomPanel() {
  const { 
    theme, 
    panelOpen, 
    setPanelOpen, 
    panelTab, 
    setPanelTab, 
    testResults, 
    viewMode, 
    student,
    activeSession,
    code,
    language,
    activeFileTab,
    terminals,
    setTerminals,
    activeTermId,
    setActiveTermId,
    handleAddNewTerminal,
    handleKillTerminal,
    handleRunCode,
    handleRunTests
  } = useIDE();

  const [panelHeight, setPanelHeight] = useState<number>(240);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showRightTerminalList, setShowRightTerminalList] = useState<boolean>(true);
  const [cliInput, setCliInput] = useState<string>('');
  
  // Interactive Live STDIN state (waiting for user to type input like in real VS Code)
  const [waitingForStdin, setWaitingForStdin] = useState<boolean>(false);
  const [pendingPromptText, setPendingPromptText] = useState<string>('');

  const terminalBottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!panelOpen) return null;
  const isDark = theme === 'vs-dark';

  const totalCases = activeSession?.testCases?.length || 4;
  const passedCases = testResults.filter(t => t.passed).length;
  const activeTerm = terminals.find(t => t.id === activeTermId) || terminals[0];

  useEffect(() => {
    terminalBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    inputRef.current?.focus();
  }, [activeTerm?.logs, waitingForStdin]);

  // Drag to resize
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isFullscreen) return;
    setIsDragging(true);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || isFullscreen) return;
    const newHeight = window.innerHeight - e.clientY - 24;
    if (newHeight >= 110 && newHeight <= window.innerHeight - 100) {
      setPanelHeight(newHeight);
    }
  }, [isDragging, isFullscreen]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Interactive CLI submit (Handles both normal commands and manual user STDIN input)
  const handleCliSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userInput = cliInput;
    setCliInput('');

    // CASE 1: The program was paused waiting for user's manual input (like VS Code scanf)
    if (waitingForStdin) {
      setWaitingForStdin(false);
      
      // Echo user's typed input into the log line
      const updatedLogs = [...(activeTerm?.logs || [])];
      if (updatedLogs.length > 0) {
        updatedLogs[updatedLogs.length - 1] = `${pendingPromptText}${userInput}`;
      }

      setTerminals(prev => prev.map(t => t.id === activeTermId ? { ...t, logs: updatedLogs } : t));

      // Execute code with user's manual input
      try {
        const { executeCodeLive } = await import('@/utils/codeRunner');
        const res = await executeCodeLive(language, code, userInput);
        
        let out = res.output || '';
        // Remove prompt prefix if already printed
        if (pendingPromptText && out.startsWith(pendingPromptText.trim())) {
          out = out.replace(pendingPromptText.trim(), '').trim();
        }

        setTerminals(prev => prev.map(t => {
          if (t.id === activeTermId) {
            return {
              ...t,
              logs: [
                ...t.logs,
                out || (res.error ? `Error: ${res.error}` : ''),
                `[Process completed in ${res.durationMs}ms with exit code 0]`,
                'user@codelab:~$ '
              ]
            };
          }
          return t;
        }));
      } catch (err: any) {
        setTerminals(prev => prev.map(t => t.id === activeTermId ? {
          ...t,
          logs: [...t.logs, `Runtime Error: ${err.message}`, 'user@codelab:~$ ']
        } : t));
      }
      return;
    }

    if (!userInput.trim()) return;

    const raw = userInput.trim();
    const parts = raw.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const arg = parts.slice(1).join(' ');

    const currentLogs = [...(activeTerm?.logs || []), `user@codelab:~$ ${raw}`];

    const updateLogs = (updated: string[]) => {
      setTerminals(prev => prev.map(t => t.id === activeTermId ? { ...t, logs: updated } : t));
    };

    if (cmd === 'clear' || cmd === 'cls') {
      updateLogs(['user@codelab:~$ ']);
      return;
    }

    if (cmd === 'ls' || cmd === 'dir') {
      currentLogs.push('main.c  problem.md  Makefile  main.out');
      currentLogs.push('user@codelab:~$ ');
      updateLogs(currentLogs);
      return;
    }

    if (cmd === 'pwd') {
      currentLogs.push('/workspace/codelab/src');
      currentLogs.push('user@codelab:~$ ');
      updateLogs(currentLogs);
      return;
    }

    if (cmd === 'whoami') {
      currentLogs.push(student ? `${student.name.toLowerCase().replace(/\s+/g, '_')} (${student.machineNumber})` : 'codelab-user');
      currentLogs.push('user@codelab:~$ ');
      updateLogs(currentLogs);
      return;
    }

    if (cmd === 'cat' && parts[1]) {
      currentLogs.push(code);
      currentLogs.push('user@codelab:~$ ');
      updateLogs(currentLogs);
      return;
    }

    // Run command triggered from terminal
    if (
      cmd === 'run' || 
      cmd === './main' || 
      cmd === './main.out' ||
      cmd.startsWith('gcc') || 
      cmd.startsWith('python')
    ) {
      if (arg) {
        // Direct argument supplied (e.g. run 7)
        runDirectlyWithInput(arg);
      } else {
        // Check if code has scanf / input
        startInteractiveRun();
      }
      return;
    }

    if (cmd === 'test') {
      handleRunTests();
      return;
    }

    if (cmd === 'help') {
      currentLogs.push(
        'Available Shell Commands:\n  • run                  : Run code interactively (prompt will ask for input)\n  • run <input>          : Run code with direct input\n  • gcc main.c -o main   : Compile C program\n  • python script.py     : Run Python script\n  • ls / dir             : List files\n  • clear / cls          : Clear terminal buffer'
      );
      currentLogs.push('user@codelab:~$ ');
      updateLogs(currentLogs);
      return;
    }

    currentLogs.push(`bash: ${raw}: command not found. Type "help" for valid commands.`);
    currentLogs.push('user@codelab:~$ ');
    updateLogs(currentLogs);
  };

  // Start Interactive Run (Pauses at scanf prompt like real VS Code)
  const startInteractiveRun = () => {
    const hasScanf = code.includes('scanf(') || code.includes('input(') || code.includes('cin >>');
    
    // Extract prompt before scanf if any (e.g. printf("Enter a number: ");)
    let promptText = '';
    const promptMatch = code.match(/printf\s*\(\s*["']([^"']+)["']\s*\)/);
    if (promptMatch && hasScanf) {
      promptText = promptMatch[1].replace(/\\n/g, '\n');
    }

    if (hasScanf) {
      // Pause in terminal waiting for user's manual keyboard input
      setPendingPromptText(promptText);
      setWaitingForStdin(true);

      setTerminals(prev => prev.map(t => {
        if (t.id === activeTermId) {
          return {
            ...t,
            logs: [
              ...t.logs,
              `user@codelab:~$ gcc -O2 ${activeFileTab} -o main && ./main`,
              promptText || 'Input: '
            ]
          };
        }
        return t;
      }));
    } else {
      // Direct run without input
      runDirectlyWithInput('');
    }
  };

  const runDirectlyWithInput = async (inputStr: string) => {
    setTerminals(prev => prev.map(t => {
      if (t.id === activeTermId) {
        return {
          ...t,
          logs: [
            ...t.logs,
            `user@codelab:~$ gcc -O2 ${activeFileTab} -o main && ./main`,
            '[Compiling and executing in Docker sandbox...]'
          ]
        };
      }
      return t;
    }));

    try {
      const { executeCodeLive } = await import('@/utils/codeRunner');
      const res = await executeCodeLive(language, code, inputStr);
      
      setTerminals(prev => prev.map(t => {
        if (t.id === activeTermId) {
          return {
            ...t,
            logs: [
              ...t.logs,
              res.output || (res.error ? `Error: ${res.error}` : '(Execution completed)'),
              `[Process completed in ${res.durationMs}ms with exit code ${res.exitCode}]`,
              'user@codelab:~$ '
            ]
          };
        }
        return t;
      }));
    } catch (err: any) {
      setTerminals(prev => prev.map(t => t.id === activeTermId ? {
        ...t,
        logs: [...t.logs, `Runtime Error: ${err.message}`, 'user@codelab:~$ ']
      } : t));
    }
  };

  const currentHeight = isFullscreen ? 'calc(100vh - 75px)' : `${panelHeight}px`;

  return (
    <div 
      style={{ height: currentHeight }}
      className={`flex flex-col border-t shrink-0 relative transition-[height] ${isDragging ? 'transition-none select-none' : 'duration-150'} ${isDark ? 'bg-[#181818] border-[#2b2b2b]' : 'bg-[#f8f8f8] border-[#e7e7e7]'}`}
    >
      
      {/* Dynamic Draggable Top Border Handle */}
      {!isFullscreen && (
        <div 
          onMouseDown={handleMouseDown}
          title="Drag up or down to resize terminal height"
          className="h-2 w-full bg-transparent hover:bg-[#0078d4] active:bg-[#0078d4] cursor-row-resize absolute -top-1 left-0 z-30 transition-colors flex items-center justify-center group"
        >
          <div className="w-10 h-1 rounded-full bg-gray-500/30 group-hover:bg-white transition-colors" />
        </div>
      )}

      {/* VS Code Terminal Header (TERMINAL + TEST CASES) */}
      <div className={`h-8 px-3 flex items-center justify-between border-b text-[11px] font-sans tracking-wide select-none shrink-0 ${isDark ? 'bg-[#181818] border-[#2b2b2b] text-[#969696]' : 'bg-[#f3f3f3] border-[#e7e7e7] text-[#616161]'}`}>
        
        {/* Left Tabs */}
        <div className="flex items-center gap-4 h-full">
          <button
            onClick={() => setPanelTab('terminal')}
            className={`h-full flex items-center gap-1.5 transition text-[11px] font-bold px-1 border-b-2 ${panelTab === 'terminal' ? 'text-[#0078d4] border-[#0078d4]' : 'text-gray-400 border-transparent hover:text-white'}`}
          >
            <TerminalIcon className="w-3.5 h-3.5" />
            <span>TERMINAL</span>
          </button>

          <button
            onClick={() => setPanelTab('testcases')}
            className={`h-full flex items-center gap-1.5 transition text-[11px] font-bold px-1 border-b-2 ${panelTab === 'testcases' ? 'text-[#0078d4] border-[#0078d4]' : 'text-gray-400 border-transparent hover:text-white'}`}
          >
            <span>TEST CASES ({passedCases}/{totalCases})</span>
          </button>

          {viewMode === 'student_lab' && student && (
            <button
              onClick={() => setPanelTab('anticheat')}
              className={`h-full flex items-center gap-1.5 transition text-[11px] font-bold px-1 border-b-2 ${panelTab === 'anticheat' ? 'text-[#0078d4] border-[#0078d4]' : 'text-gray-400 border-transparent hover:text-white'}`}
            >
              <span className={student.tabSwitches > 0 ? 'text-rose-400 font-bold' : ''}>
                ANTI-CHEAT ({student.tabSwitches})
              </span>
            </button>
          )}
        </div>

        {/* Right Action Icons (+ New Terminal, v Toggle, Clear, Maximize, Close) */}
        <div className="flex items-center gap-2">
          
          {/* + New Terminal */}
          <button
            onClick={handleAddNewTerminal}
            title="Create New Terminal Session (+)"
            className="p-1 rounded hover:bg-gray-700/30 text-gray-400 hover:text-white transition flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>

          {/* Toggle Terminal Selector List */}
          <button
            onClick={() => setShowRightTerminalList(!showRightTerminalList)}
            title="Show / Hide Terminal List"
            className={`p-1 rounded hover:bg-gray-700/30 transition ${showRightTerminalList ? 'text-[#0078d4]' : 'text-gray-400 hover:text-white'}`}
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {/* Clear Buffer */}
          <button 
            onClick={() => {
              setWaitingForStdin(false);
              setTerminals(prev => prev.map(t => t.id === activeTermId ? { ...t, logs: ['user@codelab:~$ '] } : t));
            }} 
            title="Clear Terminal Output"
            className="p-1 rounded hover:bg-gray-700/30 text-gray-400 hover:text-white transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {/* Maximize / Restore Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Restore Size' : 'Maximize Panel Size'}
            className="p-1 rounded hover:bg-gray-700/30 text-gray-400 hover:text-white transition"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {/* Close Panel */}
          <button 
            onClick={() => setPanelOpen(false)} 
            title="Close Panel"
            className="p-1 rounded hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 transition ml-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Terminal Body */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* TAB 1: TERMINAL BUFFER (Interactive Live Terminal with manual STDIN prompt) */}
        {panelTab === 'terminal' && (
          <div 
            onClick={() => inputRef.current?.focus()}
            className="flex-1 p-3 overflow-y-auto font-mono text-xs cursor-text space-y-1"
          >
            {activeTerm?.logs.map((log, i) => (
              <div key={i} className="whitespace-pre-wrap leading-relaxed">{log}</div>
            ))}

            {/* Interactive Live Input Prompt */}
            <form onSubmit={handleCliSubmit} className="flex items-center gap-1.5 pt-1">
              {waitingForStdin ? (
                // Waiting for user to type input value (e.g. 7 or 12)
                <span className="text-amber-400 font-bold animate-pulse">&gt;&gt;&gt;</span>
              ) : (
                <span className="text-[#0078d4] font-bold">user@codelab:~$</span>
              )}
              
              <input
                ref={inputRef}
                type="text"
                autoFocus
                value={cliInput}
                onChange={(e) => setCliInput(e.target.value)}
                placeholder={waitingForStdin ? "type your input number/text here and press Enter..." : "type command (e.g. run, ls, help)..."}
                className={`flex-1 bg-transparent focus:outline-none text-xs font-mono caret-[#0078d4] ${waitingForStdin ? 'text-amber-300 font-bold placeholder:text-amber-500/60' : (isDark ? 'text-white' : 'text-gray-900')}`}
              />
            </form>

            <div ref={terminalBottomRef} />
          </div>
        )}

        {/* TAB 2: TEST CASES */}
        {panelTab === 'testcases' && (
          <div className="flex-1 p-3 overflow-y-auto space-y-2">
            {testResults.length === 0 ? (
              <div className="opacity-70 text-center py-6 font-sans text-xs">
                Click <strong>"Tests"</strong> above to run automated test cases.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {testResults.map((r) => (
                  <div 
                    key={r.caseNumber}
                    className={`p-2.5 rounded-lg border flex items-center justify-between text-xs ${r.passed ? (isDark ? 'bg-[#0f2417] border-[#107c41]' : 'bg-[#e6f4ea] border-[#34a853]') : (isDark ? 'bg-[#2a1215] border-[#f14c4c]' : 'bg-[#fce8e6] border-[#ea4335]')}`}
                  >
                    <div>
                      <span className={`font-bold flex items-center gap-1.5 ${r.passed ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {r.passed ? '✓ PASSED' : '✗ FAILED'} &bull; Case #{r.caseNumber}
                      </span>
                      <div className="opacity-75 font-sans text-[11px] mt-1">
                        In: <code className="font-mono text-white">{r.input}</code> &rarr; Out: <code className="font-mono text-cyan-300">{r.actual}</code>
                      </div>
                    </div>
                    <span className="opacity-60 text-[10px]">{r.timeMs}ms</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ANTI-CHEAT AUDIT */}
        {panelTab === 'anticheat' && (
          <div className="space-y-2 font-sans text-xs p-3">
            <div className="font-bold mb-1">Session Integrity & Anti-Cheat Audit:</div>
            <div>&bull; Physical Computer: <span className="font-mono text-cyan-400 font-bold">{student?.machineNumber || 'PC-01'}</span></div>
            <div>&bull; Sandbox Isolation: <span className="text-emerald-400 font-bold">Active (Zero Network)</span></div>
            <div>&bull; Tab Switch Violations: <span className={(student?.tabSwitches || 0) > 0 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>{student?.tabSwitches || 0} times</span></div>
          </div>
        )}

        {/* Right Sidebar Terminal Instances */}
        {showRightTerminalList && panelTab === 'terminal' && (
          <div className={`w-40 border-l flex flex-col shrink-0 p-1.5 space-y-1 font-mono text-[11px] select-none ${isDark ? 'bg-[#181818] border-[#2b2b2b]' : 'bg-[#f3f3f3] border-[#e7e7e7]'}`}>
            
            <div className="text-[10px] font-bold opacity-50 px-2 py-0.5 uppercase">
              Terminals ({terminals.length})
            </div>

            <div className="space-y-0.5 flex-1 overflow-y-auto">
              {terminals.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setActiveTermId(t.id)}
                  className={`px-2 py-1 rounded cursor-pointer flex items-center justify-between group transition ${activeTermId === t.id ? (isDark ? 'bg-[#2a2d2e] text-white font-semibold' : 'bg-white text-[#0078d4] font-bold shadow-sm') : 'opacity-70 hover:opacity-100 hover:bg-gray-700/20'}`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-[10px] text-[#0078d4]">&gt;_</span>
                    <span className="truncate">{t.name}</span>
                  </div>

                  {terminals.length > 1 && (
                    <button
                      onClick={(e) => handleKillTerminal(t.id, e)}
                      title="Kill Terminal"
                      className="opacity-0 group-hover:opacity-100 hover:text-rose-400 p-0.5"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={handleAddNewTerminal}
              className="w-full py-1 px-2 border rounded border-dashed text-[10px] opacity-70 hover:opacity-100 hover:border-[#0078d4] flex items-center justify-center gap-1 transition"
            >
              <Plus className="w-3 h-3" /> New Terminal
            </button>
          </div>
        )}

      </div>

    </div>
  );
}

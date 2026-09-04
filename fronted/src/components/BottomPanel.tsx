'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Trash2, 
  X, 
  Maximize2, 
  Minimize2, 
  ChevronDown,
  Terminal as TerminalIcon,
  Plus,
  CheckCircle2,
  ShieldAlert
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
    student,
    activeSession,
    terminals,
    setTerminals,
    activeTermId,
    setActiveTermId,
    handleAddNewTerminal,
    handleKillTerminal,
    handleRunCode,
    waitingForStdin,
    setWaitingForStdin,
    pendingPromptText,
    isRunning
  } = useIDE();

  const [panelHeight, setPanelHeight] = useState<number>(240);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showRightTerminalList, setShowRightTerminalList] = useState<boolean>(true);
  const [cliInput, setCliInput] = useState<string>('');

  const terminalBottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

    // CASE 1: The program was waiting for user's manual input (VS Code scanf style)
    if (waitingForStdin) {
      // Echo user's typed input into the log line
      const updatedLogs = [...(activeTerm?.logs || [])];
      if (updatedLogs.length > 0) {
        updatedLogs[updatedLogs.length - 1] = `${pendingPromptText}${userInput}`;
      }
      setTerminals(prev => prev.map(t => t.id === activeTermId ? { ...t, logs: updatedLogs } : t));

      // Execute code with user's manual input
      await handleRunCode(userInput);
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

    if (cmd === 'help') {
      currentLogs.push('Available Commands:');
      currentLogs.push('  run [input]    - Compile and execute the active code file');
      currentLogs.push('  ls             - List project workspace files');
      currentLogs.push('  clear          - Clear terminal buffer');
      currentLogs.push('  whoami         - Print current sandbox user');
      currentLogs.push('user@codelab:~$ ');
      updateLogs(currentLogs);
      return;
    }

    if (cmd === 'whoami') {
      currentLogs.push(`user: ${student ? student.name : 'guest-student'} (Machine: ${student ? student.machineNumber : 'PC-01'})`);
      currentLogs.push('user@codelab:~$ ');
      updateLogs(currentLogs);
      return;
    }

    if (cmd === 'run') {
      // If user typed 'run 10' -> pass '10' directly
      // If user typed 'run' -> trigger interactive run
      if (arg) {
        await handleRunCode(arg);
      } else {
        await handleRunCode();
      }
      return;
    }

    // Default: bash unrecognized command
    currentLogs.push(`bash: ${cmd}: command not found. Type 'run' or 'help'`);
    currentLogs.push('user@codelab:~$ ');
    updateLogs(currentLogs);
  };

  const currentHeight = isFullscreen ? 'calc(100vh - 75px)' : `${panelHeight}px`;

  if (!panelOpen) return null;

  return (
    <div 
      style={{ height: currentHeight }}
      className={`flex flex-col border-t shrink-0 relative select-none ${isDragging ? 'transition-none' : 'transition-[height] duration-100'} ${isDark ? 'bg-[#181818] border-[#2b2b2b]' : 'bg-[#f3f3f3] border-[#e0e0e0]'}`}
    >
      {/* Drag Handle */}
      {!isFullscreen && (
        <div 
          onMouseDown={handleMouseDown}
          className="h-1.5 w-full cursor-row-resize absolute -top-0.5 left-0 z-20 hover:bg-[#0078d4] transition-colors"
        />
      )}

      {/* Terminal Top Bar */}
      <div className={`h-8 flex items-center justify-between px-3 border-b shrink-0 ${isDark ? 'bg-[#181818] border-[#2b2b2b]' : 'bg-[#f3f3f3] border-[#e0e0e0]'}`}>
        
        {/* Tabs */}
        <div className="flex items-center gap-1 h-full">
          <button
            onClick={() => setPanelTab('terminal')}
            className={`h-full px-3 text-[11px] font-bold border-b-2 transition flex items-center gap-1.5 ${panelTab === 'terminal' ? 'text-[#0078d4] border-[#0078d4]' : 'text-gray-400 border-transparent hover:text-gray-200'}`}
          >
            <TerminalIcon className="w-3 h-3" />
            TERMINAL
            {waitingForStdin && <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />}
          </button>

          <button
            onClick={() => setPanelTab('testcases')}
            className={`h-full px-3 text-[11px] font-bold border-b-2 transition flex items-center gap-1.5 ${panelTab === 'testcases' ? 'text-[#0078d4] border-[#0078d4]' : 'text-gray-400 border-transparent hover:text-gray-200'}`}
          >
            <CheckCircle2 className="w-3 h-3" />
            TEST CASES ({passedCases}/{totalCases})
          </button>

          {student && (
            <button
              onClick={() => setPanelTab('anticheat')}
              className={`h-full px-3 text-[11px] font-bold border-b-2 transition flex items-center gap-1.5 ${panelTab === 'anticheat' ? 'text-amber-400 border-amber-400' : 'text-gray-400 border-transparent hover:text-gray-200'}`}
            >
              <ShieldAlert className="w-3 h-3" />
              INTEGRITY
            </button>
          )}
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-1.5">
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
        
        {/* TAB 1: TERMINAL BUFFER */}
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
                // Waiting for user to type input (e.g. 10 or 7)
                <span className="text-amber-400 font-bold animate-pulse">&gt;&gt;</span>
              ) : (
                <span className="text-[#0078d4] font-bold">user@codelab:~$</span>
              )}
              
              <input
                ref={inputRef}
                type="text"
                autoFocus
                value={cliInput}
                onChange={(e) => setCliInput(e.target.value)}
                placeholder={waitingForStdin ? "type input (e.g. 10 or multiple: 80 90 75) and press Enter..." : "type command (e.g. run, ls, help)..."}
                className={`flex-1 bg-transparent focus:outline-none text-xs font-mono caret-[#0078d4] ${waitingForStdin ? 'text-amber-300 font-bold placeholder:text-amber-500/60' : (isDark ? 'text-white' : 'text-gray-900')}`}
              />

              {waitingForStdin && (
                <button
                  type="submit"
                  className="px-2 py-0.5 bg-[#0078d4] hover:bg-[#006cc1] text-white text-[11px] font-bold rounded transition"
                >
                  Enter ↵
                </button>
              )}
            </form>

            {waitingForStdin && (
              <div className="text-[10px] text-amber-400/80 pl-6 pb-1">
                💡 Hint: If your program asks for multiple inputs, type all values separated by spaces (e.g. <code className="bg-amber-500/20 px-1 rounded text-white">80 90 75 85 95</code> or <code className="bg-amber-500/20 px-1 rounded text-white">101 John 20</code>) and press Enter.
              </div>
            )}

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

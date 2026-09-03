'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Play, CheckCircle2, Send, ChevronRight, FileText, X, FileCode, Keyboard } from 'lucide-react';
import { useIDE } from '@/context/IDEContext';
import { ProgrammingLanguage } from '@/types';

const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

export default function EditorArea() {
  const { 
    theme, 
    files,
    openTabs,
    activeFileTab, 
    setActiveFileTab, 
    closeFileTab,
    language, 
    setLanguage, 
    code, 
    setCode, 
    customInput,
    setCustomInput,
    isRunning, 
    handleRunCode, 
    handleRunTests, 
    handleSubmitPractical, 
    viewMode,
    setPanelTab,
    setPanelOpen
  } = useIDE();

  const [showInputDrawer, setShowInputDrawer] = useState(false);
  const isDark = theme === 'vs-dark';

  const currentFile = files.find(f => f.name === activeFileTab);
  const currentLang = currentFile?.name.endsWith('.cpp') 
    ? 'cpp' 
    : (currentFile?.name.endsWith('.java') 
      ? 'java' 
      : (currentFile?.name.endsWith('.py') ? 'python' : 'c'));

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      
      {/* Editor Tab Bar */}
      <div className={`h-8 flex items-center justify-between border-b shrink-0 select-none ${isDark ? 'bg-[#181818] border-[#2b2b2b]' : 'bg-[#ececec] border-[#e7e7e7]'}`}>
        
        {/* Open Dynamic Tabs with Close Button (✕) */}
        <div className="flex items-center h-full overflow-x-auto">
          {openTabs.map((tabName) => {
            const isActive = activeFileTab === tabName;
            const isC = tabName.endsWith('.c');
            const isCpp = tabName.endsWith('.cpp');
            const isMd = tabName.endsWith('.md');

            return (
              <div 
                key={tabName}
                onClick={() => setActiveFileTab(tabName)}
                className={`h-full px-3 flex items-center gap-1.5 border-r text-xs font-mono cursor-pointer transition border-t-2 group ${isActive ? (isDark ? 'bg-[#1f1f1f] text-white border-t-[#0078d4] font-medium' : 'bg-[#ffffff] text-black border-t-[#0078d4] font-bold') : (isDark ? 'opacity-60 border-t-transparent hover:opacity-100 hover:bg-[#1f1f1f]' : 'opacity-60 border-t-transparent hover:opacity-100 hover:bg-[#ffffff]')}`}
              >
                {isC ? (
                  <span className="text-cyan-400 font-bold text-[10px]">C</span>
                ) : isCpp ? (
                  <span className="text-blue-400 font-bold text-[10px]">C++</span>
                ) : isMd ? (
                  <FileText className="w-3 h-3 text-blue-400" />
                ) : (
                  <FileCode className="w-3 h-3 text-gray-400" />
                )}
                <span>{tabName}</span>

                {/* Working Tab Close Button (✕) */}
                {openTabs.length > 1 && (
                  <button
                    onClick={(e) => closeFileTab(tabName, e)}
                    title="Close Tab"
                    className="p-0.5 rounded hover:bg-gray-700/40 text-gray-400 hover:text-white transition ml-1"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Buttons: Language, Quick Input (STDIN), Run, Tests, Submit */}
        <div className="flex items-center gap-1.5 px-3">
          
          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as ProgrammingLanguage)}
            aria-label="Language Selector"
            className={`text-xs font-mono rounded px-2 py-0.5 border focus:outline-none ${isDark ? 'bg-[#252526] text-gray-200 border-[#3c3c3c]' : 'bg-white text-gray-800 border-[#cecece]'}`}
          >
            <option value="c">C (GCC 13)</option>
            <option value="cpp">C++ (G++ 13)</option>
            <option value="java">Java (OpenJDK 21)</option>
            <option value="python">Python (3.11)</option>
          </select>

          {/* Quick Input (Stdin) Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowInputDrawer(!showInputDrawer)}
              title="Custom Standard Input (stdin) for scanf / input()"
              className={`px-2 py-0.5 rounded border text-xs flex items-center gap-1 font-mono transition ${customInput ? 'border-[#0078d4] text-[#0078d4] bg-[#0078d4]/10 font-bold' : (isDark ? 'border-gray-700 text-gray-300 hover:bg-gray-700/20' : 'border-gray-300 text-gray-700 hover:bg-gray-100')}`}
            >
              <Keyboard className="w-3 h-3 text-[#0078d4]" />
              <span>Input: {customInput || '(None)'}</span>
            </button>

            {/* Quick Input Popup Modal */}
            {showInputDrawer && (
              <div className={`absolute right-0 top-8 w-64 p-3 rounded-lg border shadow-xl z-50 space-y-2 text-xs select-none ${isDark ? 'bg-[#1f1f1f] border-[#3c3c3c] text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
                <div className="flex justify-between items-center font-bold">
                  <span>Standard Input (stdin):</span>
                  <button onClick={() => setShowInputDrawer(false)} className="opacity-60 hover:opacity-100">
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-[10px] opacity-70">
                  Value fed to <code className="text-[#0078d4]">scanf()</code> or <code className="text-[#0078d4]">input()</code>:
                </p>
                <textarea
                  autoFocus
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="e.g. 10 or 7 or Hello"
                  rows={2}
                  className={`w-full p-2 text-xs font-mono rounded border focus:outline-none focus:border-[#0078d4] ${isDark ? 'bg-[#141414] border-[#3c3c3c]' : 'bg-gray-50 border-gray-300'}`}
                />
                
                {/* Quick Presets */}
                <div className="flex items-center gap-1 text-[10px] font-mono">
                  <span className="opacity-60">Presets:</span>
                  <button onClick={() => setCustomInput('10')} className="px-1.5 py-0.5 rounded border hover:bg-[#0078d4] hover:text-white">10</button>
                  <button onClick={() => setCustomInput('7')} className="px-1.5 py-0.5 rounded border hover:bg-[#0078d4] hover:text-white">7</button>
                  <button onClick={() => setCustomInput('0')} className="px-1.5 py-0.5 rounded border hover:bg-[#0078d4] hover:text-white">0</button>
                  <button onClick={() => setCustomInput('-5')} className="px-1.5 py-0.5 rounded border hover:bg-[#0078d4] hover:text-white">-5</button>
                </div>

                <button
                  onClick={() => {
                    setShowInputDrawer(false);
                    handleRunCode();
                  }}
                  className="w-full py-1 bg-[#0078d4] hover:bg-[#006cc1] text-white font-bold rounded text-xs transition shadow flex items-center justify-center gap-1"
                >
                  <Play className="w-3 h-3 fill-white" /> Run with this Input
                </button>
              </div>
            )}
          </div>

          {/* Run Button */}
          <button
            onClick={handleRunCode}
            disabled={isRunning}
            className="px-2.5 py-0.5 rounded bg-[#0078d4] hover:bg-[#006cc1] text-white font-semibold text-xs flex items-center gap-1 shadow transition cursor-pointer"
          >
            <Play className="w-3 h-3 fill-white" /> Run
          </button>

          {/* Tests Button */}
          <button
            onClick={handleRunTests}
            disabled={isRunning}
            className="px-2.5 py-0.5 rounded bg-[#107c41] hover:bg-[#0e6e39] text-white font-semibold text-xs flex items-center gap-1 shadow transition cursor-pointer"
          >
            <CheckCircle2 className="w-3 h-3" /> Tests
          </button>

          {viewMode === 'student_lab' && (
            <button
              onClick={handleSubmitPractical}
              className="px-2.5 py-0.5 rounded bg-[#8957e5] hover:bg-[#7a48d8] text-white font-semibold text-xs flex items-center gap-1 shadow transition cursor-pointer"
            >
              <Send className="w-3 h-3" /> Submit
            </button>
          )}
        </div>
      </div>

      {/* Breadcrumb Path */}
      <div className={`h-5 px-3 flex items-center gap-1 text-[10px] font-mono border-b shrink-0 opacity-70 ${isDark ? 'bg-[#1f1f1f] border-[#2b2b2b]' : 'bg-[#fafafa] border-[#e7e7e7]'}`}>
        <span>workspace</span>
        <ChevronRight className="w-2.5 h-2.5" />
        <span className="font-bold">{activeFileTab}</span>
      </div>

      {/* Editor Content Area */}
      <div className="flex-1 w-full relative">
        {activeFileTab.endsWith('.md') ? (
          <div className="p-6 overflow-y-auto h-full space-y-4 max-w-3xl text-xs leading-relaxed font-sans">
            <h1 className="text-lg font-bold">Practical Problem Statement</h1>
            <p className="opacity-85 leading-relaxed">
              Write a program that takes an integer input from standard input and evaluates whether it is Even or Odd / Positive, Negative or Zero.
            </p>
          </div>
        ) : (
          <Editor
            height="100%"
            language={currentLang}
            value={code}
            onChange={(val) => setCode(val || '')}
            theme={isDark ? 'vs-dark' : 'vs'}
            options={{
              fontSize: 13,
              fontFamily: "var(--font-fira-code), monospace",
              minimap: { enabled: true },
              automaticLayout: true,
              scrollBeyondLastLine: false,
              bracketPairColorization: { enabled: true },
              padding: { top: 6, bottom: 6 },
            }}
          />
        )}
      </div>
    </div>
  );
}

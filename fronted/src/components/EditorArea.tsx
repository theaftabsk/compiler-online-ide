'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Play, CheckCircle2, Send, ChevronRight, FileText, X, FileCode } from 'lucide-react';
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
    isRunning, 
    handleRunCode, 
    handleRunTests, 
    handleSubmitPractical, 
    viewMode 
  } = useIDE();

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
                    title="Close Tab (Ctrl+W)"
                    className="p-0.5 rounded hover:bg-gray-700/40 text-gray-400 hover:text-white transition ml-1"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 px-3">
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

          <button
            onClick={handleRunCode}
            disabled={isRunning}
            className="px-2.5 py-0.5 rounded bg-[#0078d4] hover:bg-[#006cc1] text-white font-semibold text-xs flex items-center gap-1 shadow transition"
          >
            <Play className="w-3 h-3 fill-white" /> Run
          </button>

          <button
            onClick={handleRunTests}
            disabled={isRunning}
            className="px-2.5 py-0.5 rounded bg-[#107c41] hover:bg-[#0e6e39] text-white font-semibold text-xs flex items-center gap-1 shadow transition"
          >
            <CheckCircle2 className="w-3 h-3" /> Tests
          </button>

          {viewMode === 'student_lab' && (
            <button
              onClick={handleSubmitPractical}
              className="px-2.5 py-0.5 rounded bg-[#8957e5] hover:bg-[#7a48d8] text-white font-semibold text-xs flex items-center gap-1 shadow transition"
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
            <h1 className="text-lg font-bold">Practical Problem: Check Positive, Negative, or Zero</h1>
            <p className="opacity-85">
              Write a program in C that reads an integer from the standard input and outputs whether the number is <strong>Positive</strong>, <strong>Negative</strong>, or <strong>Zero</strong>.
            </p>
            <div className={`p-3 rounded border font-mono text-[11px] ${isDark ? 'bg-[#252526] border-[#333]' : 'bg-gray-100 border-gray-300'}`}>
              <div>Input: 10 &rarr; Output: The number is Positive</div>
              <div>Input: -5 &rarr; Output: The number is Negative</div>
              <div>Input: 0 &rarr; Output: The number is Zero</div>
            </div>
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

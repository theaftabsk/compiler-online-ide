'use client';

import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  FolderOpen, 
  Folder,
  FileText, 
  FileCode, 
  FilePlus, 
  FolderPlus, 
  Trash2,
  Code2
} from 'lucide-react';
import { useIDE } from '@/context/IDEContext';

export default function Sidebar() {
  const { 
    theme, 
    sidebarOpen, 
    setSidebarOpen, 
    activeSidebar, 
    files,
    activeFileTab, 
    openFileInEditor,
    createNewFile,
    createNewFolder,
    deleteFile,
    viewMode, 
    student, 
    activeSession,
    attendees, 
    setInspectedAttendee 
  } = useIDE();

  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFolderName, setNewFolderName] = useState('');

  if (!sidebarOpen) return null;
  const isDark = theme === 'vs-dark';

  const handleCreateFileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFileName.trim()) {
      createNewFile(newFileName.trim());
      setNewFileName('');
      setIsCreatingFile(false);
    }
  };

  const handleCreateFolderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      createNewFolder(newFolderName.trim());
      setNewFolderName('');
      setIsCreatingFolder(false);
    }
  };

  return (
    <div className={`w-60 flex flex-col shrink-0 border-r overflow-hidden ${isDark ? 'bg-[#1e1e1e] border-[#2b2b2b]' : 'bg-[#f8f8f8] border-[#e7e7e7]'}`}>
      
      {/* Header */}
      <div className={`h-8 px-3 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider border-b ${isDark ? 'bg-[#252526] border-[#2b2b2b] text-gray-400' : 'bg-[#f3f3f3] border-[#e7e7e7] text-gray-600'}`}>
        <span>
          {activeSidebar === 'explorer' && 'Explorer'}
          {activeSidebar === 'problem' && 'Problem Statement'}
          {activeSidebar === 'faculty' && 'Live Lab Grid'}
          {activeSidebar === 'analytics' && 'Analytics'}
        </span>
        <button onClick={() => setSidebarOpen(false)} className="opacity-60 hover:opacity-100">
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 text-xs">
        
        {/* TAB A: EXPLORER WITH REAL FILE/FOLDER ACTIONS */}
        {activeSidebar === 'explorer' && (
          <div className="space-y-3 font-mono text-[11px]">
            
            {/* Project Folder Title with New File / New Folder Buttons */}
            <div className="flex items-center justify-between text-gray-400 font-semibold mb-1 group">
              <div className="flex items-center gap-1.5 cursor-pointer">
                <ChevronDown className="w-3.5 h-3.5" />
                <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
                <span className="truncate">CODELAB-PROJECT</span>
              </div>

              {/* Action Buttons: New File, New Folder */}
              <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                <button
                  onClick={() => setIsCreatingFile(!isCreatingFile)}
                  title="New File (+📄)"
                  className="p-1 hover:bg-gray-700/30 hover:text-white rounded transition"
                >
                  <FilePlus className="w-3.5 h-3.5 text-[#0078d4]" />
                </button>

                <button
                  onClick={() => setIsCreatingFolder(!isCreatingFolder)}
                  title="New Folder (+📁)"
                  className="p-1 hover:bg-gray-700/30 hover:text-white rounded transition"
                >
                  <FolderPlus className="w-3.5 h-3.5 text-amber-400" />
                </button>
              </div>
            </div>

            {/* Input Prompt for Creating New File */}
            {isCreatingFile && (
              <form onSubmit={handleCreateFileSubmit} className="pl-4 pr-1 py-1">
                <input
                  type="text"
                  autoFocus
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  placeholder="filename.c / helper.h"
                  onBlur={() => !newFileName.trim() && setIsCreatingFile(false)}
                  className={`w-full p-1 rounded border text-[11px] font-mono focus:outline-none focus:border-[#0078d4] ${isDark ? 'bg-[#141414] border-[#3c3c3c] text-white' : 'bg-white border-gray-300'}`}
                />
              </form>
            )}

            {/* Input Prompt for Creating New Folder */}
            {isCreatingFolder && (
              <form onSubmit={handleCreateFolderSubmit} className="pl-4 pr-1 py-1">
                <input
                  type="text"
                  autoFocus
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="folder name..."
                  onBlur={() => !newFolderName.trim() && setIsCreatingFolder(false)}
                  className={`w-full p-1 rounded border text-[11px] font-mono focus:outline-none focus:border-[#0078d4] ${isDark ? 'bg-[#141414] border-[#3c3c3c] text-white' : 'bg-white border-gray-300'}`}
                />
              </form>
            )}

            {/* Dynamic File List with Hover Delete */}
            <div className="pl-4 space-y-0.5">
              {files.map((file) => {
                const isActive = activeFileTab === file.name;
                const isC = file.name.endsWith('.c');
                const isCpp = file.name.endsWith('.cpp');
                const isMd = file.name.endsWith('.md');
                const isTxt = file.name.endsWith('.txt');

                return (
                  <div 
                    key={file.name}
                    onClick={() => !file.isFolder && openFileInEditor(file.name)}
                    className={`flex items-center justify-between px-2 py-1 rounded cursor-pointer group transition ${isActive ? (isDark ? 'bg-[#37373d] text-white font-bold' : 'bg-[#e4e6f1] text-[#0078d4] font-bold shadow-sm') : 'opacity-70 hover:opacity-100 hover:bg-gray-700/20'}`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {file.isFolder ? (
                        <Folder className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      ) : isC ? (
                        <span className="text-cyan-400 font-bold text-[10px] shrink-0">C</span>
                      ) : isCpp ? (
                        <span className="text-blue-400 font-bold text-[10px] shrink-0">C++</span>
                      ) : isMd ? (
                        <FileText className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      ) : (
                        <FileCode className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      )}
                      <span className="truncate">{file.name}</span>
                    </div>

                    {/* Delete File Button on Hover */}
                    {file.name !== 'main.c' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteFile(file.name);
                        }}
                        title={`Delete ${file.name}`}
                        className="opacity-0 group-hover:opacity-100 hover:text-rose-400 p-0.5 transition"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {viewMode === 'student_lab' && student && (
              <div className={`p-2.5 rounded border mt-4 text-[11px] font-sans ${isDark ? 'bg-[#252526] border-[#333]' : 'bg-white border-gray-300'}`}>
                <div className="font-bold mb-1">Active Lab Session</div>
                <div className="opacity-80 space-y-0.5 text-[10px]">
                  <div>Session: <span className="font-mono text-cyan-400">{student.sessionCode}</span></div>
                  <div>Seat: <span className="text-amber-400 font-bold">{student.machineNumber}</span></div>
                  <div>Student: <span className="text-white font-medium">{student.name} ({student.rollNumber})</span></div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB B: PROBLEM STATEMENT */}
        {activeSidebar === 'problem' && (
          <div className="space-y-3 font-sans text-xs">
            <h3 className="font-bold text-sm">{activeSession?.questionTitle || 'Positive, Negative, or Zero'}</h3>
            <p className="opacity-80 leading-relaxed text-[11px]">
              {activeSession?.questionDescription || 'Read an integer from standard input and check whether it is Positive, Negative, or Zero.'}
            </p>
            
            <div className={`p-2 rounded border font-mono text-[10px] ${isDark ? 'bg-[#252526] border-[#333]' : 'bg-white border-gray-300'}`}>
              <div>Limits: 2.0s &bull; 128 MB &bull; Isolated</div>
            </div>
          </div>
        )}

        {/* TAB C: LIVE GRID */}
        {activeSidebar === 'faculty' && (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[10px] font-bold">
              <span>Connected Machines (60 PCs)</span>
              <span className="text-emerald-400">Live</span>
            </div>

            <div className="pc-grid">
              {attendees.slice(0, 24).map((pc) => (
                <div 
                  key={pc.machineNumber}
                  onClick={() => pc.status !== 'EMPTY' && setInspectedAttendee(pc)}
                  className={`pc-card ${pc.isUser ? 'ring-1 ring-[#0078d4]' : ''}`}
                >
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="font-mono text-[10px] font-bold">{pc.machineNumber}</span>
                    <span className={`status-dot ${pc.status === 'CODING' ? 'status-coding' : (pc.status === 'SUBMITTED' ? 'status-submitted' : 'status-offline')}`}></span>
                  </div>
                  <div className="truncate text-[9px] opacity-75">{pc.studentName}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB D: ANALYTICS */}
        {activeSidebar === 'analytics' && (
          <div className="space-y-3 font-sans text-xs">
            <div className="font-bold">Performance Summary</div>
            <div className={`p-2.5 rounded border ${isDark ? 'bg-[#252526] border-[#333]' : 'bg-white border-gray-300'}`}>
              <div className="text-[10px] opacity-60">Pass Rate</div>
              <div className="text-base font-bold text-cyan-400">92.4%</div>
            </div>
            <button 
              onClick={() => window.print()}
              className="w-full py-1 bg-[#0078d4] text-white rounded text-xs font-semibold shadow"
            >
              Print Report
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

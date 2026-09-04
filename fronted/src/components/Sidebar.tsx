'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
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
  Edit2,
  X,
  Search,
  Check,
  RotateCcw,
  Sparkles,
  Layers,
  HelpCircle
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
    renameFile,
    viewMode, 
    student, 
    activeSession,
    attendees, 
    setInspectedAttendee 
  } = useIDE();

  // 1. All hooks placed at the top (Strict React Hook Order)
  const [sidebarWidth, setSidebarWidth] = useState<number>(260);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isCreatingFile, setIsCreatingFile] = useState<boolean>(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState<boolean>(false);
  const [newFileName, setNewFileName] = useState<string>('');
  const [newFolderName, setNewFolderName] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [renamingFile, setRenamingFile] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState<string>('');
  const [isFolderExpanded, setIsFolderExpanded] = useState<boolean>(true);

  // Load saved sidebar width from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('kaspro_sidebar_width');
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= 160 && parsed <= 600) {
          setSidebarWidth(parsed);
        }
      }
    } catch {
      // ignore storage access errors
    }
  }, []);

  // Save width when drag stops
  useEffect(() => {
    if (!isDragging) {
      try {
        localStorage.setItem('kaspro_sidebar_width', sidebarWidth.toString());
      } catch {
        // ignore
      }
    }
  }, [isDragging, sidebarWidth]);

  // Drag resizing mouse handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    // Calculate new width relative to window left edge (after 48px activity bar)
    const newWidth = e.clientX - 48;
    if (newWidth >= 160 && newWidth <= 550) {
      setSidebarWidth(newWidth);
    }
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Handlers for file operations
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

  const handleStartRename = (fileName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRenamingFile(fileName);
    setRenameValue(fileName);
  };

  const handleRenameSubmit = (oldName: string, e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== oldName) {
      if (typeof renameFile === 'function') {
        renameFile(oldName, trimmed);
      }
    }
    setRenamingFile(null);
    setRenameValue('');
  };

  // Helper for file type icons
  const getFileBadge = (name: string) => {
    if (name.endsWith('.c')) {
      return (
        <span className="w-4 h-4 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 font-mono font-bold text-[9px] flex items-center justify-center shrink-0 shadow-sm">
          C
        </span>
      );
    }
    if (name.endsWith('.cpp') || name.endsWith('.cc')) {
      return (
        <span className="w-4 h-4 rounded bg-blue-950/80 border border-blue-500/40 text-blue-400 font-mono font-bold text-[8px] flex items-center justify-center shrink-0 shadow-sm">
          C++
        </span>
      );
    }
    if (name.endsWith('.py')) {
      return (
        <span className="w-4 h-4 rounded bg-amber-950/80 border border-amber-500/40 text-amber-400 font-mono font-bold text-[9px] flex items-center justify-center shrink-0 shadow-sm">
          Py
        </span>
      );
    }
    if (name.endsWith('.java')) {
      return (
        <span className="w-4 h-4 rounded bg-orange-950/80 border border-orange-500/40 text-orange-400 font-mono font-bold text-[8px] flex items-center justify-center shrink-0 shadow-sm">
          J
        </span>
      );
    }
    if (name.endsWith('.h') || name.endsWith('.hpp')) {
      return (
        <span className="w-4 h-4 rounded bg-purple-950/80 border border-purple-500/40 text-purple-400 font-mono font-bold text-[9px] flex items-center justify-center shrink-0 shadow-sm">
          H
        </span>
      );
    }
    if (name.endsWith('.md')) {
      return <FileText className="w-3.5 h-3.5 text-sky-400 shrink-0" />;
    }
    return <FileCode className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
  };

  // 2. Early return check placed after all hooks
  if (!sidebarOpen) return null;
  const isDark = theme === 'vs-dark';

  // Filter files if searching
  const filteredFiles = files.filter(f => 
    searchQuery ? f.name.toLowerCase().includes(searchQuery.toLowerCase()) : true
  );

  return (
    <aside 
      style={{ width: `${sidebarWidth}px` }}
      aria-label="Workspace Explorer"
      className={`flex flex-col shrink-0 relative select-none border-r z-10 transition-[width] duration-75 ${
        isDragging ? 'transition-none border-[#0078d4]' : ''
      } ${
        isDark 
          ? 'bg-[#181818] border-[#2b2b2b] text-[#cccccc]' 
          : 'bg-[#f3f3f3] border-[#e0e0e0] text-[#24292e]'
      }`}
    >
      {/* Dynamic Drag Handle on Right Border */}
      <div 
        onMouseDown={handleMouseDown}
        onDoubleClick={() => setSidebarWidth(260)}
        title="Drag to resize sidebar (Double click to reset 260px)"
        className={`w-1.5 h-full cursor-col-resize absolute -right-0.5 top-0 z-30 transition-colors group ${
          isDragging ? 'bg-[#0078d4] w-2' : 'hover:bg-[#0078d4]/70'
        }`}
      >
        <div className="absolute top-1/2 -translate-y-1/2 right-0 w-1 h-8 rounded-full bg-slate-600/40 group-hover:bg-[#0078d4] transition" />
      </div>

      {/* Top Header */}
      <div className={`h-9 px-3 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider border-b shrink-0 ${
        isDark ? 'bg-[#1f1f1f] border-[#2b2b2b] text-slate-300' : 'bg-[#e8e8e8] border-[#dcdcdc] text-slate-700'
      }`}>
        <div className="flex items-center gap-2 truncate">
          <Layers className="w-3.5 h-3.5 text-[#0078d4]" />
          <span className="truncate">
            {activeSidebar === 'explorer' && 'Explorer'}
            {activeSidebar === 'problem' && 'Problem'}
            {activeSidebar === 'faculty' && 'Lab Grid'}
            {activeSidebar === 'analytics' && 'Analytics'}
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-normal">
            {sidebarWidth}px
          </span>
        </div>

        <div className="flex items-center gap-1">
          {activeSidebar === 'explorer' && (
            <button
              onClick={() => setSidebarWidth(260)}
              title="Reset Sidebar Width (260px)"
              className="p-1 rounded hover:bg-slate-700/40 text-slate-400 hover:text-slate-200 transition"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          )}
          <button 
            onClick={() => setSidebarOpen(false)} 
            title="Collapse Sidebar"
            className="p-1 rounded hover:bg-slate-700/40 text-slate-400 hover:text-slate-200 transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 text-xs">
        
        {/* ======================================================== */}
        {/* TAB 1: EXPLORER (FULLY DYNAMIC & RESIZABLE)             */}
        {/* ======================================================== */}
        {activeSidebar === 'explorer' && (
          <div className="space-y-2 font-mono text-[11px]">
            
            {/* Quick File Search Input if width > 200 */}
            {sidebarWidth > 200 && (
              <div className="relative mb-2 px-1">
                <Search className="w-3 h-3 text-slate-500 absolute left-2.5 top-2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter files..."
                  className={`w-full pl-7 pr-5 py-1 text-[11px] rounded border focus:outline-none focus:border-[#0078d4] font-sans ${
                    isDark ? 'bg-[#141414] border-slate-800 text-slate-200 placeholder:text-slate-600' : 'bg-white border-slate-300 text-slate-800 placeholder:text-slate-400'
                  }`}
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2 text-slate-500 hover:text-slate-300"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}

            {/* Project Root Folder Bar */}
            <div className={`flex items-center justify-between p-1.5 rounded text-slate-300 font-semibold group ${
              isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-200/60'
            }`}>
              <div 
                onClick={() => setIsFolderExpanded(!isFolderExpanded)}
                className="flex items-center gap-1.5 cursor-pointer truncate flex-1"
                title="Toggle Folder"
              >
                {isFolderExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                )}
                <FolderOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate font-bold tracking-wider text-[#0078d4] text-[11px]">
                  KASPRO-WORKSPACE
                </span>
              </div>

              {/* Action Buttons: New File (+📄), New Folder (+📁) */}
              <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100">
                <button
                  onClick={() => {
                    setIsCreatingFile(!isCreatingFile);
                    setIsCreatingFolder(false);
                  }}
                  title="New File (+📄)"
                  className="p-1 rounded hover:bg-[#0078d4]/20 hover:text-[#0078d4] text-slate-400 transition"
                >
                  <FilePlus className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => {
                    setIsCreatingFolder(!isCreatingFolder);
                    setIsCreatingFile(false);
                  }}
                  title="New Folder (+📁)"
                  className="p-1 rounded hover:bg-amber-500/20 hover:text-amber-400 text-slate-400 transition"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Input Form for New File */}
            {isCreatingFile && (
              <form onSubmit={handleCreateFileSubmit} className="pl-5 pr-1 py-1 animate-in fade-in duration-100">
                <div className="flex items-center gap-1.5">
                  <span className="text-cyan-400 font-bold text-[10px]">+</span>
                  <input
                    type="text"
                    autoFocus
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    placeholder="filename.c / helper.h"
                    onKeyDown={(e) => e.key === 'Escape' && setIsCreatingFile(false)}
                    onBlur={() => !newFileName.trim() && setIsCreatingFile(false)}
                    className={`flex-1 px-2 py-0.5 rounded border text-[11px] font-mono focus:outline-none focus:border-[#0078d4] ${
                      isDark ? 'bg-[#121212] border-slate-700 text-white' : 'bg-white border-slate-300'
                    }`}
                  />
                </div>
              </form>
            )}

            {/* Input Form for New Folder */}
            {isCreatingFolder && (
              <form onSubmit={handleCreateFolderSubmit} className="pl-5 pr-1 py-1 animate-in fade-in duration-100">
                <div className="flex items-center gap-1.5">
                  <Folder className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <input
                    type="text"
                    autoFocus
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="folder_name"
                    onKeyDown={(e) => e.key === 'Escape' && setIsCreatingFolder(false)}
                    onBlur={() => !newFolderName.trim() && setIsCreatingFolder(false)}
                    className={`flex-1 px-2 py-0.5 rounded border text-[11px] font-mono focus:outline-none focus:border-[#0078d4] ${
                      isDark ? 'bg-[#121212] border-slate-700 text-white' : 'bg-white border-slate-300'
                    }`}
                  />
                </div>
              </form>
            )}

            {/* File List Tree */}
            {isFolderExpanded && (
              <div className="pl-3 border-l border-slate-800/80 ml-2 space-y-0.5">
                {filteredFiles.length === 0 ? (
                  <div className="py-2 text-center text-slate-500 text-[10px] italic">
                    {searchQuery ? 'No matching files found' : 'No files in workspace'}
                  </div>
                ) : (
                  filteredFiles.map((file) => {
                    const isActive = activeFileTab === file.name;
                    const isBeingRenamed = renamingFile === file.name;

                    if (isBeingRenamed) {
                      return (
                        <form 
                          key={file.name}
                          onSubmit={(e) => handleRenameSubmit(file.name, e)}
                          className="px-2 py-0.5 flex items-center gap-1"
                        >
                          {getFileBadge(file.name)}
                          <input
                            type="text"
                            autoFocus
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onBlur={() => setRenamingFile(null)}
                            onKeyDown={(e) => e.key === 'Escape' && setRenamingFile(null)}
                            className="flex-1 px-1.5 py-0.5 bg-[#121212] border border-[#0078d4] rounded text-[11px] text-white focus:outline-none font-mono"
                          />
                          <button type="submit" className="p-0.5 text-emerald-400 hover:text-emerald-300">
                            <Check className="w-3 h-3" />
                          </button>
                        </form>
                      );
                    }

                    return (
                      <div 
                        key={file.name}
                        onClick={() => !file.isFolder && openFileInEditor(file.name)}
                        className={`flex items-center justify-between px-2 py-1 rounded cursor-pointer group transition ${
                          isActive 
                            ? isDark 
                              ? 'bg-[#2a2d2e] text-white font-bold border-l-2 border-[#0078d4] shadow-sm' 
                              : 'bg-[#e4e6f1] text-[#0078d4] font-bold border-l-2 border-[#0078d4] shadow-sm' 
                            : isDark
                              ? 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate flex-1">
                          {file.isFolder ? (
                            <Folder className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          ) : (
                            getFileBadge(file.name)
                          )}
                          <span className="truncate text-[11px] font-mono">{file.name}</span>
                        </div>

                        {/* Action buttons on hover: Rename & Delete */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition shrink-0 ml-1">
                          {/* Rename File */}
                          <button
                            onClick={(e) => handleStartRename(file.name, e)}
                            title={`Rename ${file.name}`}
                            className="p-1 rounded hover:bg-slate-700/60 text-slate-400 hover:text-white transition"
                          >
                            <Edit2 className="w-2.5 h-2.5" />
                          </button>

                          {/* Delete File (Protected for main.c) */}
                          {file.name !== 'main.c' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteFile(file.name);
                              }}
                              title={`Delete ${file.name}`}
                              className="p-1 rounded hover:bg-rose-900/60 text-slate-400 hover:text-rose-400 transition"
                            >
                              <Trash2 className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Active Lab Session Card (For Student view) */}
            {viewMode === 'student_lab' && student && (
              <div className={`p-2.5 rounded-lg border mt-4 text-[11px] font-sans ${
                isDark ? 'bg-[#1c1c1c] border-slate-800' : 'bg-white border-slate-300'
              }`}>
                <div className="font-bold flex items-center justify-between mb-1.5">
                  <span className="text-white">Active Lab Session</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[9px] font-mono">LIVE</span>
                </div>
                <div className="space-y-1 text-[10px] text-slate-400">
                  <div className="flex justify-between">
                    <span>Session Code:</span>
                    <span className="font-mono text-cyan-400 font-bold">{student.sessionCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Assigned Seat:</span>
                    <span className="text-amber-400 font-bold font-mono">{student.machineNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Candidate:</span>
                    <span className="text-slate-200 truncate">{student.name} ({student.rollNumber})</span>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: PROBLEM STATEMENT                                 */}
        {/* ======================================================== */}
        {activeSidebar === 'problem' && (
          <div className="space-y-3 font-sans text-xs">
            <div className="p-3 bg-[#1e1e1e] rounded-lg border border-slate-800">
              <h3 className="font-bold text-sm text-white mb-2">
                {activeSession?.questionTitle || 'Positive, Negative, or Zero'}
              </h3>
              <p className="text-slate-300 leading-relaxed text-xs mb-3">
                {activeSession?.questionDescription || 'Read an integer from standard input and check whether it is Positive, Negative, or Zero.'}
              </p>
              
              <div className="p-2 rounded bg-black/40 border border-slate-800 font-mono text-[10px] text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>Time Limit:</span>
                  <span className="text-cyan-400">2.0s</span>
                </div>
                <div className="flex justify-between">
                  <span>Memory Limit:</span>
                  <span className="text-cyan-400">128 MB</span>
                </div>
                <div className="flex justify-between">
                  <span>Security Sandbox:</span>
                  <span className="text-emerald-400">Isolated Linux</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: FACULTY LIVE GRID                                 */}
        {/* ======================================================== */}
        {activeSidebar === 'faculty' && (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[10px] font-bold px-1">
              <span>Connected Machines</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {attendees.slice(0, 30).map((pc) => (
                <div 
                  key={pc.machineNumber}
                  onClick={() => pc.status !== 'EMPTY' && setInspectedAttendee(pc)}
                  className={`p-1.5 rounded border text-center cursor-pointer transition ${
                    pc.isUser 
                      ? 'border-[#0078d4] bg-[#0078d4]/10' 
                      : 'border-slate-800 bg-[#1e1e1e] hover:border-slate-700'
                  }`}
                >
                  <div className="font-mono text-[10px] font-bold text-white">{pc.machineNumber}</div>
                  <div className="text-[9px] truncate text-slate-400">{pc.studentName || 'Empty'}</div>
                  <div className={`text-[8px] font-bold mt-0.5 ${
                    pc.status === 'CODING' 
                      ? 'text-cyan-400' 
                      : pc.status === 'SUBMITTED' 
                        ? 'text-emerald-400' 
                        : 'text-slate-600'
                  }`}>
                    {pc.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: ANALYTICS                                         */}
        {/* ======================================================== */}
        {activeSidebar === 'analytics' && (
          <div className="space-y-3 font-sans text-xs">
            <div className="font-bold text-slate-200">Session Performance</div>
            <div className="p-3 rounded-lg bg-[#1e1e1e] border border-slate-800 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-xs">Pass Rate:</span>
                <span className="text-base font-bold text-emerald-400 font-mono">
                  {attendees.length > 0 
                    ? `${Math.round((attendees.filter(a => a.status === 'SUBMITTED').length / attendees.length) * 100)}%` 
                    : '100%'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-xs">Active Candidates:</span>
                <span className="font-mono text-cyan-400 font-bold">{attendees.length}</span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Subtle Bottom Footer info */}
      <div className={`h-6 px-3 flex items-center justify-between text-[10px] text-slate-500 border-t shrink-0 font-mono ${
        isDark ? 'bg-[#161616] border-[#2b2b2b]' : 'bg-[#eaeaea] border-[#dcdcdc]'
      }`}>
        <span>{filteredFiles.length} file{filteredFiles.length === 1 ? '' : 's'}</span>
        <span className="text-[9px]">UTF-8</span>
      </div>
    </aside>
  );
}

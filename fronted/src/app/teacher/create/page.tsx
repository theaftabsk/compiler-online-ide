'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, ArrowLeft, Hash, Key, Clock, ShieldCheck, Sun, Moon, Code2, Trash2 } from 'lucide-react';
import { IDEProvider, useIDE } from '@/context/IDEContext';

function CreateSessionInner() {
  const router = useRouter();
  const { theme, toggleTheme, handleCreateSession } = useIDE();
  const isDark = theme === 'vs-dark';

  const [subjectName, setSubjectName] = useState('Data Structures & Algorithms in C');
  const [department, setDepartment] = useState('Computer Science & AI');
  const [batchName, setBatchName] = useState('Section J - 2nd Year');
  const [teacherName, setTeacherName] = useState('Prof. S. Sengupta');
  const [questionTitle, setQuestionTitle] = useState('Check Positive, Negative, or Zero');
  const [questionDescription, setQuestionDescription] = useState('Write a program in C that reads an integer from standard input and prints Positive, Negative, or Zero.');
  const [timeLimit, setTimeLimit] = useState(90);
  const [testCases, setTestCases] = useState([
    { id: 'tc-1', inputData: '10', expectedOutput: 'Positive', isHidden: false },
    { id: 'tc-2', inputData: '-5', expectedOutput: 'Negative', isHidden: false },
    { id: 'tc-3', inputData: '0', expectedOutput: 'Zero', isHidden: false },
    { id: 'tc-4', inputData: '9999', expectedOutput: 'Positive', isHidden: true },
  ]);

  const [newInput, setNewInput] = useState('');
  const [newExpected, setNewExpected] = useState('');
  const [newHidden, setNewHidden] = useState(false);

  const addTestCase = () => {
    if (newInput.trim() && newExpected.trim()) {
      setTestCases(prev => [
        ...prev,
        {
          id: `tc-${Date.now()}`,
          inputData: newInput.trim(),
          expectedOutput: newExpected.trim(),
          isHidden: newHidden
        }
      ]);
      setNewInput('');
      setNewExpected('');
      setNewHidden(false);
    }
  };

  const removeTestCase = (id: string) => {
    setTestCases(prev => prev.filter(t => t.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const created = handleCreateSession({
      subjectName,
      department,
      batchName,
      teacherName,
      questionTitle,
      questionDescription,
      testCases,
      timeLimitMinutes: Number(timeLimit),
      totalMachines: 60,
    });

    router.push(`/teacher/session/${created.sessionCode}`);
  };

  return (
    <div className={`min-h-screen w-screen flex flex-col select-none overflow-x-hidden ${isDark ? 'bg-[#181818] text-[#cccccc]' : 'bg-[#f8f8f8] text-[#333333]'}`}>
      
      {/* Header */}
      <header className={`h-12 px-6 flex items-center justify-between border-b shrink-0 ${isDark ? 'bg-[#1f1f1f] border-[#2b2b2b]' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center gap-3">
          <Link href="/teacher" className="p-1 rounded hover:bg-gray-700/20 text-gray-400 hover:text-white transition">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#0078d4] flex items-center justify-center text-xs text-white">
              <Code2 className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-xs">Create New Lab Practical Session</span>
          </div>
        </div>

        <button onClick={toggleTheme} className="p-1.5 rounded hover:bg-gray-700/20">
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#0078d4]" />}
        </button>
      </header>

      {/* Form Area */}
      <div className="flex-1 p-6 max-w-4xl w-full mx-auto space-y-6">
        <form onSubmit={handleSubmit} className={`p-6 rounded-xl border shadow-sm space-y-6 ${isDark ? 'bg-[#1f1f1f] border-[#2b2b2b]' : 'bg-white border-gray-200'}`}>
          
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider mb-1">Session & Academic Details</h2>
            <p className="text-xs opacity-70">Fill in the details to generate an encrypted <strong>Session Code & Password</strong> for your students.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold mb-1 opacity-80">Subject / Course Name</label>
              <input
                type="text"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                required
                className={`w-full p-2.5 rounded border focus:outline-none focus:border-[#0078d4] ${isDark ? 'bg-[#141414] border-[#333] text-white' : 'bg-white border-gray-300'}`}
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 opacity-80">Batch / Section</label>
              <input
                type="text"
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
                required
                className={`w-full p-2.5 rounded border focus:outline-none focus:border-[#0078d4] ${isDark ? 'bg-[#141414] border-[#333] text-white' : 'bg-white border-gray-300'}`}
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 opacity-80">Department</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                required
                className={`w-full p-2.5 rounded border focus:outline-none focus:border-[#0078d4] ${isDark ? 'bg-[#141414] border-[#333] text-white' : 'bg-white border-gray-300'}`}
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 opacity-80">Exam Duration (Minutes)</label>
              <input
                type="number"
                value={timeLimit}
                onChange={(e) => setTimeLimit(Number(e.target.value))}
                min={10}
                max={300}
                required
                className={`w-full p-2.5 rounded border focus:outline-none focus:border-[#0078d4] ${isDark ? 'bg-[#141414] border-[#333] text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
          </div>

          <div className="pt-4 border-t space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-1">Practical Question & Constraints</h2>
            
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 opacity-80">Question Title</label>
                <input
                  type="text"
                  value={questionTitle}
                  onChange={(e) => setQuestionTitle(e.target.value)}
                  required
                  className={`w-full p-2.5 rounded border focus:outline-none focus:border-[#0078d4] ${isDark ? 'bg-[#141414] border-[#333] text-white' : 'bg-white border-gray-300'}`}
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 opacity-80">Problem Description & I/O Specifications</label>
                <textarea
                  value={questionDescription}
                  onChange={(e) => setQuestionDescription(e.target.value)}
                  rows={4}
                  required
                  className={`w-full p-2.5 rounded border font-mono resize-none focus:outline-none focus:border-[#0078d4] ${isDark ? 'bg-[#141414] border-[#333] text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
            </div>
          </div>

          {/* Test Cases Manager */}
          <div className="pt-4 border-t space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-bold uppercase tracking-wider">Automated Evaluation Test Cases ({testCases.length})</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {testCases.map((tc, idx) => (
                <div 
                  key={tc.id}
                  className={`p-3 rounded-lg border flex justify-between items-center font-mono ${isDark ? 'bg-[#141414] border-[#2b2b2b]' : 'bg-gray-50 border-gray-200'}`}
                >
                  <div>
                    <div className="font-bold flex items-center gap-2">
                      <span className="text-cyan-400">Case #{idx + 1}</span>
                      {tc.isHidden && <span className="px-1.5 py-0.5 text-[9px] bg-amber-500/20 text-amber-400 rounded">HIDDEN</span>}
                    </div>
                    <div className="opacity-80 text-[11px] mt-1">In: <code className="text-white">{tc.inputData}</code> &rarr; Out: <code className="text-emerald-400">{tc.expectedOutput}</code></div>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => removeTestCase(tc.id)} 
                    className="p-1 text-gray-400 hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add new test case */}
            <div className={`p-3 rounded-lg border grid grid-cols-1 sm:grid-cols-3 gap-2 items-center ${isDark ? 'bg-[#141414] border-[#333]' : 'bg-gray-50 border-gray-300'}`}>
              <input
                type="text"
                placeholder="Input data (stdin)"
                value={newInput}
                onChange={(e) => setNewInput(e.target.value)}
                className={`p-2 rounded border font-mono ${isDark ? 'bg-[#1e1e1e] border-[#333]' : 'bg-white border-gray-300'}`}
              />
              <input
                type="text"
                placeholder="Expected output"
                value={newExpected}
                onChange={(e) => setNewExpected(e.target.value)}
                className={`p-2 rounded border font-mono ${isDark ? 'bg-[#1e1e1e] border-[#333]' : 'bg-white border-gray-300'}`}
              />
              <div className="flex items-center gap-2 justify-between">
                <label className="flex items-center gap-1.5 cursor-pointer text-[11px]">
                  <input
                    type="checkbox"
                    checked={newHidden}
                    onChange={(e) => setNewHidden(e.target.checked)}
                  />
                  <span>Hidden Case</span>
                </label>
                <button
                  type="button"
                  onClick={addTestCase}
                  className="px-3 py-1.5 bg-[#0078d4] text-white rounded font-bold hover:bg-[#006cc1]"
                >
                  Add Case
                </button>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t flex justify-end gap-3">
            <Link href="/teacher" className="px-5 py-2.5 border rounded text-xs hover:bg-gray-700/20">
              Cancel
            </Link>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#0078d4] hover:bg-[#006cc1] text-white font-bold rounded text-xs shadow flex items-center gap-2"
            >
              <Key className="w-4 h-4" /> Generate Lab Session & PIN
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}

export default function CreateSessionPage() {
  return (
    <IDEProvider>
      <CreateSessionInner />
    </IDEProvider>
  );
}

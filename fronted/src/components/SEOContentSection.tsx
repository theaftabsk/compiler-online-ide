'use client';

import React, { useState } from 'react';
import { 
  Play, 
  Terminal, 
  Cpu, 
  Zap, 
  ShieldCheck, 
  BookOpen, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  ArrowUp, 
  Code2, 
  Sparkles,
  Layers,
  GraduationCap
} from 'lucide-react';
import { useIDE } from '@/context/IDEContext';

interface ExampleCode {
  title: string;
  category: string;
  description: string;
  code: string;
}

const C_EXAMPLES: ExampleCode[] = [
  {
    title: '1. Hello World (Standard Output)',
    category: 'Basics',
    description: 'The classic introductory program demonstrating printf and standard headers.',
    code: `#include <stdio.h>

int main() {
    printf("Hello, World! Welcome to Kaspro Online Compiler!\\n");
    return 0;
}`,
  },
  {
    title: '2. Interactive User Input (scanf)',
    category: 'I/O Operations',
    description: 'Demonstrates reading multiple numbers from user input using scanf in the interactive terminal.',
    code: `#include <stdio.h>

int main() {
    int num1, num2;
    printf("Enter two integers separated by space: ");
    scanf("%d %d", &num1, &num2);
    
    printf("Result: %d + %d = %d\\n", num1, num2, num1 + num2);
    return 0;
}`,
  },
  {
    title: '3. Factorial using Recursion',
    category: 'Functions & Recursion',
    description: 'Calculates the factorial of a user-supplied integer using recursive function calls.',
    code: `#include <stdio.h>

long long factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

int main() {
    int n;
    printf("Enter a positive integer: ");
    scanf("%d", &n);

    if (n < 0) {
        printf("Factorial of negative numbers does not exist.\\n");
    } else {
        printf("Factorial of %d = %lld\\n", n, factorial(n));
    }
    return 0;
}`,
  },
  {
    title: '4. Prime Number Checker',
    category: 'Control Flow',
    description: 'Determines whether an input number is prime with optimized square root limit checking.',
    code: `#include <stdio.h>
#include <stdbool.h>
#include <math.h>

bool isPrime(int n) {
    if (n <= 1) return false;
    for (int i = 2; i * i <= n; i++) {
        if (n % i == 0) return false;
    }
    return true;
}

int main() {
    int num;
    printf("Enter an integer: ");
    scanf("%d", &num);

    if (isPrime(num)) {
        printf("%d is a Prime Number.\\n", num);
    } else {
        printf("%d is NOT a Prime Number.\\n", num);
    }
    return 0;
}`,
  },
  {
    title: '5. Dynamic Memory Allocation (malloc & free)',
    category: 'Pointers & Memory',
    description: 'Allocates an integer array on the heap, fills it with values, and frees it cleanly.',
    code: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int n;
    printf("Enter number of elements: ");
    scanf("%d", &n);

    int *arr = (int *)malloc(n * sizeof(int));
    if (arr == NULL) {
        printf("Memory allocation failed!\\n");
        return 1;
    }

    for (int i = 0; i < n; i++) {
        arr[i] = (i + 1) * 10;
    }

    printf("Dynamic Array Elements: ");
    for (int i = 0; i < n; i++) {
        printf("%d ", arr[i]);
    }
    printf("\\n");

    free(arr);
    printf("Memory freed successfully!\\n");
    return 0;
}`,
  },
  {
    title: '6. Singly Linked List (Data Structures)',
    category: 'Data Structures',
    description: 'Implements a dynamic singly linked list with node creation, traversal, and display.',
    code: `#include <stdio.h>
#include <stdlib.h>

struct Node {
    int data;
    struct Node* next;
};

void printList(struct Node* n) {
    printf("Linked List: ");
    while (n != NULL) {
        printf("%d -> ", n->data);
        n = n->next;
    }
    printf("NULL\\n");
}

int main() {
    struct Node* head = (struct Node*)malloc(sizeof(struct Node));
    struct Node* second = (struct Node*)malloc(sizeof(struct Node));
    struct Node* third = (struct Node*)malloc(sizeof(struct Node));

    head->data = 100;
    head->next = second;

    second->data = 200;
    second->next = third;

    third->data = 300;
    third->next = NULL;

    printList(head);

    free(head);
    free(second);
    free(third);
    return 0;
}`,
  },
];

const FAQS = [
  {
    q: 'What is Kaspro Online Compiler?',
    a: 'Kaspro Online Compiler by ITVEXO is the world’s fastest online C compiler, C++ IDE, and coding playground. It compiles and executes C code natively using GNU GCC 13.3 on high-performance Linux cloud instances with sub-50 millisecond response times and interactive terminal I/O.',
  },
  {
    q: 'How do I run C code with scanf (user input) in Kaspro?',
    a: 'Simply write your code with standard scanf() statements and click the green ▶ Run button. When the program encounters scanf, the interactive terminal automatically pauses and prompts you for input. Type your numbers or strings and hit Enter to continue execution.',
  },
  {
    q: 'Which compiler version does Kaspro use?',
    a: 'Kaspro uses native GCC 13.3.0 with full support for modern C17 and C23 standards, optimized with -O2 compilation flags and strict sandbox security.',
  },
  {
    q: 'Is Kaspro Online Compiler free?',
    a: 'Yes, Kaspro is 100% free with unlimited runs, zero ads, no subscription fees, and no required registration for standard compilation.',
  },
  {
    q: 'How is Kaspro different from Programiz, OnlineGDB, or OneCompiler?',
    a: 'Kaspro provides a native, desktop-grade VS Code dark-mode interface with zero ads, real GCC 13.3 compilation in under 50ms (unlike slow browser emulators or queued workers), interactive terminal stdin, and integrated Virtual Classroom Laboratories for schools and universities.',
  },
  {
    q: 'Can instructors and universities use Kaspro for exams and lab tests?',
    a: 'Yes! Kaspro includes a dedicated Faculty Portal (/teacher) where professors can create real-time coding sessions with hidden test cases, monitor student screens live, detect tab switching, and auto-grade submissions.',
  },
];

export default function SEOContentSection() {
  const { setCode, setActiveFileTab } = useIDE();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const loadExample = (code: string) => {
    setCode(code);
    setActiveFileTab('main.c');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const copyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full bg-[#121212] text-[#e0e0e0] border-t border-[#262626] font-sans antialiased">
      {/* 1. Hero Summary & Quick Action */}
      <section className="max-w-6xl mx-auto px-4 py-12 lg:py-16">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0078d4]/10 border border-[#0078d4]/30 text-[#0078d4] text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Official GCC 13.3.0 Engine &bull; by ITVEXO
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Online C Compiler <span className="text-[#0078d4]">&amp; Cloud C IDE</span>
            </h1>
            <p className="text-base md:text-lg text-slate-300 leading-relaxed">
              Write, compile, and execute C programs online instantly with real GNU GCC 13.3.
              Enjoy interactive terminal support for <code className="px-1.5 py-0.5 bg-[#1f1f1f] text-cyan-400 rounded text-sm font-mono">scanf</code>, 
              instant sub-50ms execution speed, automated grading, and live student classroom monitoring.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={scrollToTop}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0078d4] hover:bg-[#006cc1] text-white text-sm font-bold rounded-lg shadow-lg hover:shadow-blue-500/20 transition"
              >
                <Play className="w-4 h-4 fill-current" />
                Start Coding in Editor
              </button>
              <a
                href="/teacher"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1e1e1e] hover:bg-[#282828] border border-slate-700 text-slate-200 text-sm font-semibold rounded-lg transition"
              >
                <GraduationCap className="w-4 h-4 text-emerald-400" />
                Teacher &amp; Lab Portal
              </a>
            </div>
          </div>

          <div className="w-full md:w-80 grid grid-cols-2 gap-3 shrink-0">
            <div className="p-4 bg-[#1a1a1a] rounded-xl border border-slate-800 text-center">
              <Zap className="w-6 h-6 text-amber-400 mx-auto mb-2" />
              <div className="text-2xl font-extrabold text-white font-mono">&lt; 30ms</div>
              <div className="text-xs text-slate-400">Execution Speed</div>
            </div>
            <div className="p-4 bg-[#1a1a1a] rounded-xl border border-slate-800 text-center">
              <Cpu className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
              <div className="text-2xl font-extrabold text-white font-mono">GCC 13.3</div>
              <div className="text-xs text-slate-400">GNU Compiler Collection</div>
            </div>
            <div className="p-4 bg-[#1a1a1a] rounded-xl border border-slate-800 text-center">
              <Terminal className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
              <div className="text-2xl font-extrabold text-white font-mono">Interactive</div>
              <div className="text-xs text-slate-400">STDIN scanf Support</div>
            </div>
            <div className="p-4 bg-[#1a1a1a] rounded-xl border border-slate-800 text-center">
              <ShieldCheck className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-extrabold text-white font-mono">100% Free</div>
              <div className="text-xs text-slate-400">Zero Ads &bull; No Signup</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Step by Step Guide: How to Run C Program Online */}
      <section className="border-t border-[#222222] bg-[#161616]/50 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-3">
            How to Compile &amp; Run C Code Online in 3 Simple Steps
          </h2>
          <p className="text-slate-400 text-center max-w-2xl mx-auto text-sm md:text-base mb-10">
            Kaspro eliminates complex local compiler installations like MinGW, Turbo C, or Code::Blocks.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-[#1a1a1a] rounded-xl border border-slate-800 relative">
              <div className="w-8 h-8 rounded-full bg-[#0078d4] text-white font-bold flex items-center justify-center text-sm mb-4">
                1
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Write or Paste C Code</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Use the full-featured Monaco code editor with syntax highlighting, auto-indentation, and smart brackets.
              </p>
            </div>

            <div className="p-6 bg-[#1a1a1a] rounded-xl border border-slate-800 relative">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm mb-4">
                2
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Click Run (or Ctrl + Enter)</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Our Linux cloud worker compiles your program natively with GCC 13.3 and streams the binary output.
              </p>
            </div>

            <div className="p-6 bg-[#1a1a1a] rounded-xl border border-slate-800 relative">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm mb-4">
                3
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Interact via Terminal</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                If your code calls <code className="text-cyan-400">scanf()</code>, type your input directly into the terminal and see results in real-time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Ready-to-Run Code Examples */}
      <section className="max-w-6xl mx-auto px-4 py-14">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-[#0078d4] text-xs font-bold uppercase tracking-wider mb-1">
              Code Library
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Popular C Program Examples &amp; Templates
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Click &quot;Load into Editor&quot; to practice any example immediately in the compiler.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {C_EXAMPLES.map((ex, idx) => (
            <div 
              key={idx} 
              className="bg-[#181818] rounded-xl border border-slate-800 flex flex-col justify-between overflow-hidden hover:border-[#0078d4]/50 transition group"
            >
              <div className="p-4 border-b border-slate-800/80 bg-[#1e1e1e]/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                    {ex.category}
                  </span>
                  <h3 className="text-sm font-bold text-white mt-1 group-hover:text-[#0078d4] transition">
                    {ex.title}
                  </h3>
                </div>
              </div>

              <div className="p-4 flex-1">
                <p className="text-xs text-slate-400 mb-3">{ex.description}</p>
                <div className="relative bg-[#0f0f0f] p-3 rounded-lg border border-slate-900 font-mono text-xs text-slate-300 overflow-x-auto max-h-48">
                  <pre>{ex.code}</pre>
                </div>
              </div>

              <div className="p-3 bg-[#151515] border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => copyCode(ex.code, idx)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded bg-slate-800/50 hover:bg-slate-800 transition flex items-center gap-1.5"
                >
                  {copiedIndex === idx ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy
                    </>
                  )}
                </button>
                <button
                  onClick={() => loadExample(ex.code)}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-[#0078d4] hover:bg-[#006cc1] rounded transition flex items-center gap-1.5 shadow-sm"
                >
                  <Play className="w-3 h-3 fill-current" />
                  Load into Editor
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Comparison Table: Why Kaspro vs Other Compilers */}
      <section className="border-t border-[#222222] bg-[#141414] py-14">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Why Kaspro is the #1 Online C Compiler
            </h2>
            <p className="text-slate-400 text-sm mt-2">
              Compare Kaspro’s native cloud performance against common online compiler alternatives.
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#181818]">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-[#1f1f1f] text-xs uppercase text-slate-400 font-mono border-b border-slate-800">
                <tr>
                  <th className="p-4">Feature</th>
                  <th className="p-4 text-[#0078d4] font-bold">Kaspro (ITVEXO)</th>
                  <th className="p-4">OnlineGDB</th>
                  <th className="p-4">Programiz</th>
                  <th className="p-4">OneCompiler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                <tr>
                  <td className="p-4 font-semibold text-white">GCC Compiler Version</td>
                  <td className="p-4 text-emerald-400 font-bold font-mono">GCC 13.3.0 (Native)</td>
                  <td className="p-4 font-mono">GCC 9/10</td>
                  <td className="p-4 font-mono">GCC 11</td>
                  <td className="p-4 font-mono">GCC 11</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-white">Execution Latency</td>
                  <td className="p-4 text-emerald-400 font-bold font-mono">&lt; 50ms</td>
                  <td className="p-4 font-mono">~350ms - 800ms</td>
                  <td className="p-4 font-mono">~400ms</td>
                  <td className="p-4 font-mono">~300ms</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-white">Interactive scanf Terminal</td>
                  <td className="p-4 text-emerald-400 font-bold">✓ Live STDIN Prompt</td>
                  <td className="p-4 text-slate-400">✓ Web Terminal</td>
                  <td className="p-4 text-amber-400">Pre-defined Input Box</td>
                  <td className="p-4 text-amber-400">Pre-defined STDIN</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-white">Classroom &amp; Lab Monitoring</td>
                  <td className="p-4 text-emerald-400 font-bold">✓ Live Grid &amp; Auto-Grader</td>
                  <td className="p-4 text-rose-400">✕ None</td>
                  <td className="p-4 text-rose-400">✕ None</td>
                  <td className="p-4 text-rose-400">✕ None</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-white">User Interface</td>
                  <td className="p-4 text-emerald-400 font-bold">VS Code Modern Dark IDE</td>
                  <td className="p-4 text-slate-400">Traditional Web UI</td>
                  <td className="p-4 text-slate-400">Standard Editor</td>
                  <td className="p-4 text-slate-400">Standard Editor</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-white">Advertising Experience</td>
                  <td className="p-4 text-emerald-400 font-bold">100% Zero Ads</td>
                  <td className="p-4 text-rose-400">Heavy Banner Ads</td>
                  <td className="p-4 text-rose-400">Sidebar Ads</td>
                  <td className="p-4 text-rose-400">Banner &amp; Video Ads</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 5. C Syntax Quick Reference & Cheat Sheet */}
      <section className="max-w-6xl mx-auto px-4 py-14">
        <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-3">
          C Language Quick Reference &amp; Syntax Cheat Sheet
        </h2>
        <p className="text-slate-400 text-center max-w-2xl mx-auto text-sm mb-10">
          Essential format specifiers, data types, and standard library headers for C programming.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#181818] p-5 rounded-xl border border-slate-800">
            <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-[#0078d4]" />
              Data Types &amp; Sizes (64-bit GCC)
            </h3>
            <ul className="space-y-2 text-xs font-mono text-slate-300">
              <li className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-cyan-400">char</span>
                <span>1 byte (-128 to 127)</span>
              </li>
              <li className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-cyan-400">int</span>
                <span>4 bytes (-2.1B to +2.1B)</span>
              </li>
              <li className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-cyan-400">float</span>
                <span>4 bytes (6 decimal digits)</span>
              </li>
              <li className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-cyan-400">double</span>
                <span>8 bytes (15 decimal digits)</span>
              </li>
              <li className="flex justify-between py-1">
                <span className="text-cyan-400">long long</span>
                <span>8 bytes (large integers)</span>
              </li>
            </ul>
          </div>

          <div className="bg-[#181818] p-5 rounded-xl border border-slate-800">
            <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              Format Specifiers (printf / scanf)
            </h3>
            <ul className="space-y-2 text-xs font-mono text-slate-300">
              <li className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-emerald-400">%d / %i</span>
                <span>Signed Decimal Integer</span>
              </li>
              <li className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-emerald-400">%f</span>
                <span>Float / Real Number</span>
              </li>
              <li className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-emerald-400">%c</span>
                <span>Single Character</span>
              </li>
              <li className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-emerald-400">%s</span>
                <span>String of Characters</span>
              </li>
              <li className="flex justify-between py-1">
                <span className="text-emerald-400">%p</span>
                <span>Pointer Address</span>
              </li>
            </ul>
          </div>

          <div className="bg-[#181818] p-5 rounded-xl border border-slate-800">
            <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              Standard Headers &amp; Functions
            </h3>
            <ul className="space-y-2 text-xs font-mono text-slate-300">
              <li className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-purple-400">&lt;stdio.h&gt;</span>
                <span>printf, scanf, fopen</span>
              </li>
              <li className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-purple-400">&lt;stdlib.h&gt;</span>
                <span>malloc, free, exit</span>
              </li>
              <li className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-purple-400">&lt;string.h&gt;</span>
                <span>strlen, strcpy, strcmp</span>
              </li>
              <li className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-purple-400">&lt;math.h&gt;</span>
                <span>sqrt, pow, abs, ceil</span>
              </li>
              <li className="flex justify-between py-1">
                <span className="text-purple-400">&lt;stdbool.h&gt;</span>
                <span>bool, true, false</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 6. FAQ Accordion */}
      <section className="border-t border-[#222222] bg-[#161616]/70 py-14">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-3">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-400 text-center text-sm mb-8">
            Everything you need to know about compiling and executing C code in Kaspro.
          </p>

          <div className="space-y-3">
            {FAQS.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div 
                  key={index} 
                  className="bg-[#1c1c1c] rounded-xl border border-slate-800 overflow-hidden transition"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between font-semibold text-white hover:text-[#0078d4] transition text-sm md:text-base"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 shrink-0 text-[#0078d4]" />
                    ) : (
                      <ChevronDown className="w-4 h-4 shrink-0 text-slate-400" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. Comprehensive Semantic Footer */}
      <footer className="border-t border-[#222222] bg-[#0e0e0e] py-10 text-xs text-slate-400">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#0078d4] flex items-center justify-center font-mono font-bold text-white text-sm shadow-md">
              K
            </div>
            <div>
              <div className="font-bold text-slate-200 text-sm">Kaspro Online Compiler</div>
              <div className="text-[11px] text-slate-500">An official ITVEXO product &bull; High Performance Cloud Devtools</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <button onClick={scrollToTop} className="hover:text-white transition flex items-center gap-1">
              <ArrowUp className="w-3.5 h-3.5" /> Back to Editor
            </button>
            <a href="/teacher" className="hover:text-white transition">Teacher Portal</a>
            <a href="/teacher/login" className="hover:text-white transition">Faculty Login</a>
            <a href="/sitemap.xml" className="hover:text-white transition">Sitemap</a>
            <a href="https://kaspro.online" className="hover:text-white transition">Kaspro Online</a>
          </div>

          <div>
            &copy; {new Date().getFullYear()} ITVEXO. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

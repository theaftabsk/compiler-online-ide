'use client';

import React from 'react';
import { IDEProvider, useIDE } from '@/context/IDEContext';
import TitleBar from '@/components/TitleBar';
import ActivityBar from '@/components/ActivityBar';
import Sidebar from '@/components/Sidebar';
import EditorArea from '@/components/EditorArea';
import BottomPanel from '@/components/BottomPanel';
import StatusBar from '@/components/StatusBar';
import TeacherPortal from '@/components/TeacherPortal';
import StudentJoinModal from '@/components/StudentJoinModal';
import CodeInspectorModal from '@/components/CodeInspectorModal';
import SEOContentSection from '@/components/SEOContentSection';

function IDELayout() {
  const { 
    theme, 
    viewMode,
    inspectedAttendee, 
    setInspectedAttendee 
  } = useIDE();

  const isDark = theme === 'vs-dark';

  // If viewing Teacher Portal
  if (viewMode === 'teacher_dashboard') {
    return (
      <>
        <TeacherPortal />
        <StudentJoinModal />
      </>
    );
  }

  // Otherwise viewing Public Playground or Student Lab Session
  return (
    <div className={`min-h-screen w-full flex flex-col overflow-x-hidden ${isDark ? 'bg-[#1e1e1e] text-[#cccccc]' : 'bg-[#ffffff] text-[#24292e]'}`}>
      <main id="main-ide-workspace" role="main" className="h-screen w-full flex flex-col shrink-0 select-none overflow-hidden relative">
      
      {/* Hidden Rich Comprehensive SEO Content & Structured Authority for Search Crawlers */}
      <div className="sr-only">
        <h1>Online C Compiler - Run C Code Online with GCC 13 | Kaspro by ITVEXO</h1>
        <p>
          Welcome to Kaspro Online Compiler, the world’s fastest and most reliable online C compiler and C++ IDE created by ITVEXO.
          Write, build, debug, and run your C programs in the cloud using official GCC 13.3 with real-time interactive terminal input for scanf, cin, and Python input.
          Experience instantaneous sub-50ms execution speed, zero lag, automated test grading, and live student classroom laboratory monitoring.
        </p>

        <section>
          <h2>Why Kaspro is the #1 Online C Compiler</h2>
          <p>
            Unlike traditional slow online compilers that queue executions or rely on simulated browser emulators, Kaspro by ITVEXO runs on dedicated high-performance Linux sandboxes with native GCC 13.3.0 compilation.
            Every execution takes less than 50 milliseconds, providing a seamless VS Code-like desktop programming experience directly in your web browser.
          </p>
          <ul>
            <li><strong>Interactive STDIN Terminal:</strong> Full support for <code>scanf(&quot;%d&quot;, &amp;n)</code>, <code>scanf(&quot; %[^\n]&quot;, str)</code>, <code>cin &gt;&gt;</code>, and <code>input()</code>.</li>
            <li><strong>Sub-50ms Ultra-Fast Execution:</strong> Instant compilation and output without loading screens or queue delays.</li>
            <li><strong>Real GCC 13.3 &amp; G++:</strong> Official GNU Compiler Collection with <code>-O2</code> optimizations.</li>
            <li><strong>Multi-Input Sequential Processing:</strong> Type multiple inputs separated by spaces or newlines without timeouts.</li>
            <li><strong>Digital Classroom Laboratory:</strong> Faculty and instructors can create virtual lab sessions, monitor students’ code machine-wise in real time, and auto-grade submissions.</li>
            <li><strong>Enterprise Sandbox Security:</strong> Strict resource limits with CPU, memory, and fork-bomb protection.</li>
          </ul>
        </section>

        <section>
          <h2>How to Run C Programs with User Input (scanf) Online</h2>
          <ol>
            <li><strong>Step 1:</strong> Write your C program in the editor. For example, a program to calculate the sum of two numbers or manage student records.</li>
            <li><strong>Step 2:</strong> Click the <strong>▶ Run</strong> button in the top right corner or press <code>Ctrl + Enter</code>.</li>
            <li><strong>Step 3:</strong> If your code contains <code>scanf()</code>, the interactive terminal automatically pauses and prompts you for input.</li>
            <li><strong>Step 4:</strong> Enter your values (e.g. <code>10 20</code> or <code>101 John 20</code>) into the terminal input field and press <code>Enter</code>.</li>
            <li><strong>Step 5:</strong> Your compiled program executes instantly and displays the real output in the terminal.</li>
          </ol>
        </section>

        <section>
          <h2>Popular C Programs Ready to Run in Kaspro Online Compiler</h2>
          <article>
            <h3>1. Hello World Program in C</h3>
            <pre><code>{`#include <stdio.h>
int main() {
    printf("Hello, World!\\n");
    return 0;
}`}</code></pre>
          </article>

          <article>
            <h3>2. User Input with scanf (Sum of Two Numbers)</h3>
            <pre><code>{`#include <stdio.h>
int main() {
    int a, b;
    printf("Enter two numbers: ");
    scanf("%d %d", &a, &b);
    printf("Sum = %d\\n", a + b);
    return 0;
}`}</code></pre>
          </article>

          <article>
            <h3>3. Student Management System Record</h3>
            <pre><code>{`#include <stdio.h>
struct Student {
    int id;
    char name[50];
    int marks[5];
};
int main() {
    struct Student s;
    printf("Enter ID: ");
    scanf("%d", &s.id);
    printf("Enter Name: ");
    scanf("%s", s.name);
    printf("Student: %d - %s\\n", s.id, s.name);
    return 0;
}`}</code></pre>
          </article>
        </section>

        <section>
          <h2>Frequently Asked Questions (FAQ)</h2>
          <dl>
            <dt>What makes Kaspro better than other online C compilers?</dt>
            <dd>Kaspro by ITVEXO compiles C code natively using GCC 13.3 in under 50ms, offers complete interactive scanf terminal piping, and provides a full VS Code dark-mode IDE with zero advertisements.</dd>

            <dt>Is Kaspro Online Compiler completely free?</dt>
            <dd>Yes, Kaspro Online Compiler is an ITVEXO initiative that is 100% free with unlimited runs for students, developers, and educational institutions.</dd>

            <dt>Can I use Kaspro on Mobile and Tablets?</dt>
            <dd>Yes! Kaspro is fully responsive and supports mobile touch controls, cloud sessions, and on-screen keyboards for coding on smartphones and iPads.</dd>

            <dt>Who developed Kaspro Online Compiler?</dt>
            <dd>Kaspro Online Compiler is designed and engineered by ITVEXO, a modern software technology laboratory specializing in developer tools and cloud infrastructure.</dd>
          </dl>
        </section>

        <footer>
          <p>© {new Date().getFullYear()} Kaspro Online Compiler. An ITVEXO Product. All rights reserved.</p>
        </footer>
      </div>

      {/* 1. Top Titlebar */}
      <header role="banner">
        <TitleBar />
      </header>

      {/* 2. Workspace Area */}
      <div className="flex-1 flex overflow-hidden">
        <ActivityBar />
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <EditorArea />
          <BottomPanel />
        </div>
      </div>

      {/* 3. Status Bar */}
      <StatusBar />

      {/* 4. Modals */}
      <StudentJoinModal />

      <CodeInspectorModal 
        attendee={inspectedAttendee}
        onClose={() => setInspectedAttendee(null)}
      />

    </main>

    {/* Visible Rich SEO Authority & Educational Hub for Google #1 Ranking */}
    <SEOContentSection />
  </div>
  );
}

export default function HomePage() {
  return (
    <IDEProvider>
      <IDELayout />
    </IDEProvider>
  );
}

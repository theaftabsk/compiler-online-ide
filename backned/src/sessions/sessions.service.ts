import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';

export interface TestCase {
  id: string;
  inputData: string;
  expectedOutput: string;
  isHidden?: boolean;
}

export interface LabQuestion {
  id: string;
  title: string;
  description: string;
  allowedLanguages: string[];
  starterCode: Record<string, string>;
  testCases: TestCase[];
}

export interface PracticalSession {
  id: string;
  institution: string;
  department: string;
  section: string;
  semester: string;
  subject: string;
  labRoom: string;
  facultyName: string;
  sessionCode: string;
  status: 'ACTIVE' | 'PAUSED' | 'ENDED';
  totalCapacity: number;
  createdAt: string;
  endedAt?: string;
  questions: LabQuestion[];
}

export interface SessionAttendee {
  rollNumber: string;
  name: string;
  section: string;
  machineNumber: string;
  onlineStatus: 'ONLINE' | 'IDLE' | 'OFFLINE';
  codingStatus: 'CODING' | 'SUBMITTED' | 'OFFLINE';
  language: string;
  score: number;
  passedCases: string;
  submitted: boolean;
  tabSwitches: number;
  lastHeartbeat: string;
  currentCode: string;
}

@Injectable()
export class SessionsService {
  private sessions = new Map<string, PracticalSession>();
  private attendees = new Map<string, Map<string, SessionAttendee>>();

  constructor() {
    this.seedDefaultBrainwareSession();
  }

  private seedDefaultBrainwareSession() {
    const DEFAULT_CODE = 'BW-AIML-J-26X91';

    const defaultSession: PracticalSession = {
      id: 'sess-bw-aiml-j-2026',
      institution: 'Brainware University',
      department: 'Artificial Intelligence & Machine Learning (AI & ML)',
      section: 'Section J',
      semester: '3rd Semester',
      subject: 'Programming in C',
      labRoom: 'Lab 204',
      facultyName: 'Dr. S. Mukherjee',
      sessionCode: DEFAULT_CODE,
      status: 'ACTIVE',
      totalCapacity: 60,
      createdAt: new Date().toISOString(),
      questions: [
        {
          id: 'q-101',
          title: 'Check Positive, Negative, or Zero',
          description: 'Write a program in C that takes an integer as input and checks whether the number is positive, negative, or zero.',
          allowedLanguages: ['c', 'cpp', 'java', 'python'],
          starterCode: {
            c: '#include <stdio.h>\n\nint main() {\n    int num;\n    scanf("%d", &num);\n    if (num > 0) printf("Positive\\n");\n    else if (num < 0) printf("Negative\\n");\n    else printf("Zero\\n");\n    return 0;\n}',
            python: 'num = int(input())\nif num > 0: print("Positive")\nelif num < 0: print("Negative")\nelse: print("Zero")',
          },
          testCases: [
            { id: 'tc-1', inputData: '10', expectedOutput: 'Positive', isHidden: false },
            { id: 'tc-2', inputData: '-5', expectedOutput: 'Negative', isHidden: false },
            { id: 'tc-3', inputData: '0', expectedOutput: 'Zero', isHidden: false },
          ],
        },
      ],
    };

    this.sessions.set(DEFAULT_CODE, defaultSession);

    // Seed Attendees
    const attendeesMap = new Map<string, SessionAttendee>();

    // Seed Aftab Sk (Roll 538, Section J, PC-14)
    attendeesMap.set('538', {
      rollNumber: '538',
      name: 'Aftab Sk',
      section: 'Section J',
      machineNumber: 'PC-14',
      onlineStatus: 'ONLINE',
      codingStatus: 'CODING',
      language: 'c',
      score: 100,
      passedCases: '3/3',
      submitted: true,
      tabSwitches: 0,
      lastHeartbeat: new Date().toISOString(),
      currentCode: defaultSession.questions[0].starterCode.c,
    });

    // Seed Simulated Classmates
    const sampleNames = [
      'Rohan Das', 'Priya Sharma', 'Sneha Roy', 'Sourav Sen', 'Ananya Paul',
      'Debanjan Bose', 'Rahul Gupta', 'Suman Roy', 'Tania Ghosh', 'Arpan Mondal',
      'Ritika Dey', 'Subham Banerjee', 'Pooja Dutta', 'Kunal Mukherjee', 'Sayan Das'
    ];

    for (let i = 1; i <= 35; i++) {
      const pcNum = `PC-${i < 10 ? '0' + i : i}`;
      if (pcNum === 'PC-14') continue;

      const roll = (500 + i).toString();
      const name = sampleNames[i % sampleNames.length] + ` (${roll})`;
      const isSub = i % 3 === 0;
      const isOnline = i % 8 !== 0;

      attendeesMap.set(roll, {
        rollNumber: roll,
        name: name,
        section: 'Section J',
        machineNumber: pcNum,
        onlineStatus: isOnline ? 'ONLINE' : 'OFFLINE',
        codingStatus: isSub ? 'SUBMITTED' : (isOnline ? 'CODING' : 'OFFLINE'),
        language: 'c',
        score: isSub ? 100 : (i % 2 === 0 ? 66 : 0),
        passedCases: isSub ? '3/3' : (i % 2 === 0 ? '2/3' : '0/3'),
        submitted: isSub,
        tabSwitches: i % 5 === 0 ? 2 : 0,
        lastHeartbeat: new Date().toISOString(),
        currentCode: `// ${name} working on ${pcNum}\n#include <stdio.h>\nint main() { return 0; }`,
      });
    }

    this.attendees.set(DEFAULT_CODE, attendeesMap);
  }

  createSession(payload: any) {
    const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    const deptCode = (payload.department || 'AIML').replace(/[^A-Z]/g, '').slice(0, 4) || 'AIML';
    const secCode = (payload.section || 'J').replace(/[^A-Z0-9]/g, '').slice(-1) || 'J';
    const sessionCode = `BW-${deptCode}-${secCode}-${randomSuffix}`;

    const newSession: PracticalSession = {
      id: 'sess-' + Date.now(),
      institution: payload.institution || 'Brainware University',
      department: payload.department || 'AI & ML',
      section: payload.section || 'Section J',
      semester: payload.semester || '3rd Semester',
      subject: payload.subject || 'Programming in C',
      labRoom: payload.labRoom || 'Lab 204',
      facultyName: payload.facultyName || 'Faculty',
      sessionCode,
      status: 'ACTIVE',
      totalCapacity: 60,
      createdAt: new Date().toISOString(),
      questions: payload.questions || [],
    };

    this.sessions.set(sessionCode, newSession);
    this.attendees.set(sessionCode, new Map());
    return newSession;
  }

  getSession(code: string): PracticalSession {
    const session = this.sessions.get(code);
    if (!session) throw new NotFoundException('Session code not found');
    return session;
  }

  joinSession(payload: { sessionCode: string; rollNumber: string; name: string; machineNumber: string; section?: string }) {
    const session = this.getSession(payload.sessionCode);
    if (session.status === 'ENDED') throw new ForbiddenException('Practical session has ended');

    let sessionAttendees = this.attendees.get(payload.sessionCode);
    if (!sessionAttendees) {
      sessionAttendees = new Map();
      this.attendees.set(payload.sessionCode, sessionAttendees);
    }

    const attendee: SessionAttendee = {
      rollNumber: payload.rollNumber || '538',
      name: payload.name || `Student ${payload.rollNumber}`,
      section: payload.section || session.section,
      machineNumber: payload.machineNumber || 'PC-01',
      onlineStatus: 'ONLINE',
      codingStatus: 'CODING',
      language: 'c',
      score: 0,
      passedCases: '0/3',
      submitted: false,
      tabSwitches: 0,
      lastHeartbeat: new Date().toISOString(),
      currentCode: session.questions[0]?.starterCode?.c || '',
    };

    sessionAttendees.set(payload.rollNumber, attendee);
    return { session, attendee };
  }

  getLiveGrid(code: string) {
    const session = this.getSession(code);
    const sessionAttendees = this.attendees.get(code) || new Map();
    const list = Array.from(sessionAttendees.values());

    return {
      session,
      stats: {
        totalCapacity: session.totalCapacity,
        joinedStudents: list.length,
        onlineCount: list.filter(a => a.onlineStatus === 'ONLINE').length,
        offlineCount: list.filter(a => a.onlineStatus === 'OFFLINE').length,
        codingCount: list.filter(a => a.codingStatus === 'CODING').length,
        submittedCount: list.filter(a => a.submitted).length,
      },
      attendees: list,
    };
  }

  endSession(code: string) {
    const session = this.getSession(code);
    session.status = 'ENDED';
    session.endedAt = new Date().toISOString();
    return session;
  }

  getAttendeesMap() {
    return this.attendees;
  }
}

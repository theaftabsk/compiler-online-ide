export type UserRole = 'STUDENT' | 'FACULTY' | 'HOD' | 'ADMIN';

export type ProgrammingLanguage = 'c' | 'cpp' | 'java' | 'python';

export type MachineStatus = 'CODING' | 'SUBMITTED' | 'IDLE' | 'OFFLINE' | 'EMPTY';

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
  allowedLanguages: ProgrammingLanguage[];
  timeLimitSec: number;
  memoryLimitMb: number;
  maxScore: number;
  testCases: TestCase[];
}

export interface StudentSessionInfo {
  name: string;
  rollNumber: string;
  section: string;
  machineNumber: string;
  sessionCode: string;
  language: ProgrammingLanguage;
  submitted: boolean;
  score: number;
  tabSwitches: number;
}

export interface MachineAttendee {
  machineNumber: string;
  studentName: string;
  rollNumber: string;
  section: string;
  status: MachineStatus;
  language: string;
  score: number;
  passedCases: string;
  tabSwitches: number;
  isUser: boolean;
  code: string;
}

export interface ExecutionResponse {
  success: boolean;
  verdict: string;
  output?: string;
  error?: string;
  score?: number;
  passedCount?: number;
  totalCount?: number;
  durationMs?: number;
  testResults?: {
    caseNumber: number;
    passed: boolean;
    verdict: string;
    input: string;
    expected: string;
    actual: string;
    executionTimeMs?: number;
    isHidden?: boolean;
  }[];
}

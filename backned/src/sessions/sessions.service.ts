import { Injectable, NotFoundException, ForbiddenException, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SessionsService implements OnModuleInit {
  private readonly logger = new Logger(SessionsService.name);

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedDefaultSession();
  }

  /**
   * Seed default LAB-2026 session into PostgreSQL if not exists
   */
  async seedDefaultSession() {
    try {
      const existing = await this.prisma.practicalSession.findUnique({
        where: { sessionCode: 'LAB-2026' },
      });

      if (!existing) {
        await this.prisma.practicalSession.create({
          data: {
            sessionCode: 'LAB-2026',
            sessionPassword: '8899',
            subjectName: 'Data Structures & Algorithms in C',
            department: 'Computer Science & AI',
            sectionName: 'Section J',
            batchName: 'Section J - Batch 2026',
            facultyName: 'Prof. Aftab Sk',
            labRoomName: 'Lab 204',
            totalCapacity: 60,
            questionTitle: 'Check Even or Odd',
            questionDescription: 'Write a program in C that takes an integer from standard input and determines whether it is Even or Odd.',
            status: 'ACTIVE',
          },
        });
        this.logger.log('Default LAB-2026 session seeded into PostgreSQL');
      }
    } catch (err: any) {
      this.logger.warn(`Could not seed default session: ${err.message}`);
    }
  }

  /**
   * Get all practical sessions from PostgreSQL
   */
  async getAllSessions() {
    const sessions = await this.prisma.practicalSession.findMany({
      orderBy: { startedAt: 'desc' },
      include: {
        attendees: {
          select: {
            id: true,
            machineNumber: true,
            studentName: true,
            rollNumber: true,
            codingStatus: true,
            onlineStatus: true,
            score: true,
            passedCases: true,
            tabSwitchCount: true,
          },
        },
      },
    });

    return sessions.map((s) => ({
      id: s.id,
      sessionCode: s.sessionCode,
      sessionPassword: s.sessionPassword,
      subjectName: s.subjectName,
      department: s.department,
      batchName: s.batchName,
      sectionName: s.sectionName,
      facultyName: s.facultyName,
      labRoomName: s.labRoomName,
      totalCapacity: s.totalCapacity,
      questionTitle: s.questionTitle,
      questionDescription: s.questionDescription,
      status: s.status,
      startedAt: s.startedAt,
      endedAt: s.endedAt,
      attendeeCount: s.attendees.length,
      codingCount: s.attendees.filter((a) => a.codingStatus === 'CODING').length,
      submittedCount: s.attendees.filter((a) => a.codingStatus === 'SUBMITTED').length,
      attendees: s.attendees,
    }));
  }

  /**
   * Create a practical session in PostgreSQL
   */
  async createSession(payload: any) {
    const randomCode = payload.sessionCode || `LAB-${Math.floor(1000 + Math.random() * 9000)}`;
    const randomPass = payload.sessionPassword || `${Math.floor(1000 + Math.random() * 9000)}`;

    const session = await this.prisma.practicalSession.create({
      data: {
        sessionCode: randomCode.toUpperCase(),
        sessionPassword: String(randomPass),
        subjectName: payload.subjectName || 'Programming Lab',
        department: payload.department || 'Computer Science & Engineering',
        sectionName: payload.sectionName || payload.batchName || 'Section A',
        batchName: payload.batchName || 'Batch 2026',
        facultyName: payload.facultyName || payload.teacherName || 'Faculty Incharge',
        labRoomName: payload.labRoomName || 'Lab 101',
        totalCapacity: Number(payload.totalCapacity || payload.totalMachines || 60),
        questionTitle: payload.questionTitle || 'Lab Practical Assignment',
        questionDescription: payload.questionDescription || 'Solve the given problem.',
        status: 'ACTIVE',
      },
    });

    return session;
  }

  /**
   * Get session by code from PostgreSQL
   */
  async getSession(code: string) {
    const normalizedCode = code.trim().toUpperCase();
    const session = await this.prisma.practicalSession.findUnique({
      where: { sessionCode: normalizedCode },
      include: {
        attendees: {
          orderBy: { machineNumber: 'asc' },
        },
      },
    });

    if (!session) {
      throw new NotFoundException(`Session ${normalizedCode} not found in database.`);
    }

    return session;
  }

  /**
   * Student joins a session - saves into PostgreSQL
   */
  async joinSession(payload: {
    sessionCode: string;
    machineNumber: string;
    name?: string;
    rollNumber?: string;
    section?: string;
    password?: string;
  }) {
    const normalizedCode = payload.sessionCode.trim().toUpperCase();
    const session = await this.prisma.practicalSession.findUnique({
      where: { sessionCode: normalizedCode },
    });

    if (!session) {
      throw new NotFoundException(`Session ${normalizedCode} not found.`);
    }

    if (session.status === 'ENDED') {
      throw new ForbiddenException('This practical lab session has ended.');
    }

    if (session.sessionPassword && payload.password) {
      if (session.sessionPassword.trim() !== payload.password.trim()) {
        throw new ForbiddenException('Invalid session PIN or password.');
      }
    }

    const machine = payload.machineNumber ? payload.machineNumber.toUpperCase() : 'PC-01';
    const studentName = payload.name && payload.name.trim() ? payload.name.trim() : 'Aftab Sk';
    const rollNumber = payload.rollNumber && payload.rollNumber.trim() ? payload.rollNumber.trim() : '538';

    // Upsert into PostgreSQL
    const attendee = await this.prisma.sessionAttendee.upsert({
      where: {
        sessionId_machineNumber: {
          sessionId: session.id,
          machineNumber: machine,
        },
      },
      update: {
        studentName,
        rollNumber,
        section: payload.section || session.batchName,
        codingStatus: 'CODING',
        onlineStatus: 'ONLINE',
        lastHeartbeat: new Date(),
      },
      create: {
        sessionId: session.id,
        machineNumber: machine,
        studentName,
        rollNumber,
        section: payload.section || session.batchName,
        codingStatus: 'CODING',
        onlineStatus: 'ONLINE',
        language: 'c',
        score: 0,
        passedCases: '0/4',
      },
    });

    this.logger.log(`Student ${studentName} (${rollNumber}) joined ${session.sessionCode} on ${machine}`);
    return { session, attendee };
  }

  /**
   * Sync student code & heartbeat in PostgreSQL
   */
  async syncCode(payload: {
    sessionCode: string;
    machineNumber: string;
    code?: string;
    tabSwitches?: number;
    submitted?: boolean;
    score?: number;
  }) {
    const normalizedCode = payload.sessionCode.trim().toUpperCase();
    const session = await this.prisma.practicalSession.findUnique({
      where: { sessionCode: normalizedCode },
    });

    if (!session) return null;

    const machine = payload.machineNumber.toUpperCase();

    try {
      const attendee = await this.prisma.sessionAttendee.upsert({
        where: {
          sessionId_machineNumber: {
            sessionId: session.id,
            machineNumber: machine,
          },
        },
        update: {
          ...(payload.code !== undefined ? { currentCode: payload.code } : {}),
          ...(payload.tabSwitches !== undefined ? { tabSwitchCount: payload.tabSwitches } : {}),
          ...(payload.submitted ? { codingStatus: 'SUBMITTED', score: payload.score || 100, passedCases: '4/4' } : {}),
          lastHeartbeat: new Date(),
          onlineStatus: 'ONLINE',
        },
        create: {
          sessionId: session.id,
          machineNumber: machine,
          studentName: 'Aftab Sk',
          rollNumber: '538',
          currentCode: payload.code || '',
          codingStatus: payload.submitted ? 'SUBMITTED' : 'CODING',
          onlineStatus: 'ONLINE',
          tabSwitchCount: payload.tabSwitches || 0,
          score: payload.score || 0,
        },
      });

      return attendee;
    } catch (err: any) {
      this.logger.warn(`Could not sync student code: ${err.message}`);
      return null;
    }
  }

  /**
   * Get full real-time 60 PC grid from PostgreSQL
   */
  async getLiveGrid(code: string) {
    const session = await this.getSession(code);
    const dbAttendees = await this.prisma.sessionAttendee.findMany({
      where: { sessionId: session.id },
    });

    const attendeeMap = new Map<string, any>();
    for (const a of dbAttendees) {
      attendeeMap.set(a.machineNumber.toUpperCase(), a);
    }

    const totalMachines = session.totalCapacity || 60;
    const grid: any[] = [];

    let codingCount = 0;
    let submittedCount = 0;
    let offlineCount = 0;
    let totalViolations = 0;

    for (let i = 1; i <= totalMachines; i++) {
      const pcNum = `PC-${i < 10 ? '0' + i : i}`;
      const found = attendeeMap.get(pcNum);

      if (found) {
        if (found.codingStatus === 'SUBMITTED') submittedCount++;
        else if (found.onlineStatus === 'OFFLINE') offlineCount++;
        else codingCount++;

        totalViolations += found.tabSwitchCount || 0;

        grid.push({
          machineNumber: pcNum,
          studentName: found.studentName,
          rollNumber: found.rollNumber,
          section: found.section || session.batchName,
          status: found.codingStatus || 'CODING',
          language: found.language || 'c',
          score: found.score || 0,
          passedCases: found.passedCases || '0/4',
          tabSwitches: found.tabSwitchCount || 0,
          isUser: true,
          code: found.currentCode || '// Student started coding...',
          lastHeartbeat: found.lastHeartbeat,
        });
      } else {
        grid.push({
          machineNumber: pcNum,
          studentName: 'Available PC',
          rollNumber: '---',
          section: session.batchName,
          status: 'EMPTY',
          language: 'c',
          score: 0,
          passedCases: '0/0',
          tabSwitches: 0,
          isUser: false,
          code: '// Workstation empty',
        });
      }
    }

    return {
      session: {
        id: session.id,
        sessionCode: session.sessionCode,
        sessionPassword: session.sessionPassword,
        subjectName: session.subjectName,
        department: session.department,
        batchName: session.batchName,
        facultyName: session.facultyName,
        labRoomName: session.labRoomName,
        questionTitle: session.questionTitle,
        questionDescription: session.questionDescription,
        status: session.status,
        totalCapacity: session.totalCapacity,
      },
      stats: {
        totalCapacity: totalMachines,
        joinedStudents: dbAttendees.length,
        codingCount,
        submittedCount,
        offlineCount,
        totalViolations,
      },
      attendees: grid,
    };
  }

  async updateSessionStatus(code: string, status: 'ACTIVE' | 'PAUSED' | 'ENDED') {
    const normalizedCode = code.trim().toUpperCase();
    return this.prisma.practicalSession.update({
      where: { sessionCode: normalizedCode },
      data: {
        status: status as any,
        endedAt: status === 'ENDED' ? new Date() : null,
      },
    });
  }

  async endSession(code: string) {
    return this.updateSessionStatus(code, 'ENDED');
  }

  async deleteSession(code: string) {
    const normalizedCode = code.trim().toUpperCase();
    return this.prisma.practicalSession.delete({
      where: { sessionCode: normalizedCode },
    });
  }
}

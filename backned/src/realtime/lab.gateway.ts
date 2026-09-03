import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { SessionsService } from '../sessions/sessions.service';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})
export class LabGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(LabGateway.name);

  constructor(private readonly sessionsService: SessionsService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected to Lab Gateway: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('student:join')
  handleStudentJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { sessionCode: string; rollNumber: string; name: string; machineNumber: string; section?: string },
  ) {
    const { sessionCode, rollNumber } = payload;
    client.join(sessionCode);

    const attendeesMap = this.sessionsService.getAttendeesMap().get(sessionCode);
    if (attendeesMap && rollNumber) {
      const student = attendeesMap.get(rollNumber);
      if (student) {
        student.onlineStatus = 'ONLINE';
        student.lastHeartbeat = new Date().toISOString();
        this.server.to(sessionCode).emit('faculty:student_updated', student);
        this.server.to(sessionCode).emit('faculty:grid_refresh', Array.from(attendeesMap.values()));
      }
    }
  }

  @SubscribeMessage('faculty:join')
  handleFacultyJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { sessionCode: string },
  ) {
    client.join(payload.sessionCode);
    const attendeesMap = this.sessionsService.getAttendeesMap().get(payload.sessionCode);
    if (attendeesMap) {
      client.emit('faculty:grid_refresh', Array.from(attendeesMap.values()));
    }
  }

  @SubscribeMessage('student:code_stream')
  handleCodeStream(
    @MessageBody() payload: { sessionCode: string; rollNumber: string; code: string; language: string },
  ) {
    const { sessionCode, rollNumber, code, language } = payload;
    const attendeesMap = this.sessionsService.getAttendeesMap().get(sessionCode);
    if (attendeesMap && attendeesMap.has(rollNumber)) {
      const student = attendeesMap.get(rollNumber)!;
      student.currentCode = code;
      student.language = language;
      student.codingStatus = 'CODING';

      // Stream to faculty inspecting this student
      this.server.to(sessionCode).emit('faculty:student_code_sync', { rollNumber, code, language });
    }
  }

  @SubscribeMessage('student:tab_switched')
  handleTabSwitch(
    @MessageBody() payload: { sessionCode: string; rollNumber: string },
  ) {
    const { sessionCode, rollNumber } = payload;
    const attendeesMap = this.sessionsService.getAttendeesMap().get(sessionCode);
    if (attendeesMap && attendeesMap.has(rollNumber)) {
      const student = attendeesMap.get(rollNumber)!;
      student.tabSwitches = (student.tabSwitches || 0) + 1;

      // Broadcast anti-cheating warning to faculty
      this.server.to(sessionCode).emit('faculty:student_alert', {
        type: 'TAB_SWITCH',
        rollNumber,
        studentName: student.name,
        machineNumber: student.machineNumber,
        count: student.tabSwitches,
        message: `Security Flag: Student ${student.name} (${student.machineNumber}) lost focus / switched tabs (${student.tabSwitches} times).`,
      });

      this.server.to(sessionCode).emit('faculty:student_updated', student);
    }
  }

  @SubscribeMessage('student:submitted')
  handleStudentSubmission(
    @MessageBody() payload: { sessionCode: string; rollNumber: string; score: number; passedCases: string },
  ) {
    const { sessionCode, rollNumber, score, passedCases } = payload;
    const attendeesMap = this.sessionsService.getAttendeesMap().get(sessionCode);
    if (attendeesMap && attendeesMap.has(rollNumber)) {
      const student = attendeesMap.get(rollNumber)!;
      student.submitted = true;
      student.codingStatus = 'SUBMITTED';
      student.score = score;
      student.passedCases = passedCases;

      this.server.to(sessionCode).emit('faculty:student_submitted', student);
      this.server.to(sessionCode).emit('faculty:grid_refresh', Array.from(attendeesMap.values()));
    }
  }
}

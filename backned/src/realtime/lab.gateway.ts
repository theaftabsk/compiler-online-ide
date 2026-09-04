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
  async handleStudentJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { sessionCode: string; rollNumber: string; name: string; machineNumber: string; section?: string },
  ) {
    const { sessionCode } = payload;
    client.join(sessionCode);

    try {
      const result = await this.sessionsService.joinSession(payload);
      this.server.to(sessionCode).emit('faculty:student_updated', result.attendee);
      const grid = await this.sessionsService.getLiveGrid(sessionCode);
      this.server.to(sessionCode).emit('faculty:grid_refresh', grid.attendees);
    } catch (err: any) {
      this.logger.warn(`Error in student:join: ${err.message}`);
    }
  }

  @SubscribeMessage('faculty:join')
  async handleFacultyJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { sessionCode: string },
  ) {
    client.join(payload.sessionCode);
    try {
      const grid = await this.sessionsService.getLiveGrid(payload.sessionCode);
      client.emit('faculty:grid_refresh', grid.attendees);
    } catch (err: any) {
      this.logger.warn(`Error in faculty:join: ${err.message}`);
    }
  }

  @SubscribeMessage('student:code_stream')
  async handleCodeStream(
    @MessageBody() payload: { sessionCode: string; rollNumber?: string; machineNumber: string; code: string; language: string },
  ) {
    const { sessionCode, machineNumber, code, language, rollNumber } = payload;
    try {
      await this.sessionsService.syncCode({
        sessionCode,
        machineNumber,
        code,
      });

      // Stream to faculty inspecting this student
      this.server.to(sessionCode).emit('faculty:student_code_sync', { rollNumber, machineNumber, code, language });
    } catch (err: any) {
      this.logger.warn(`Error in student:code_stream: ${err.message}`);
    }
  }

  @SubscribeMessage('student:tab_switched')
  async handleTabSwitch(
    @MessageBody() payload: { sessionCode: string; machineNumber: string; rollNumber?: string; studentName?: string; count?: number },
  ) {
    const { sessionCode, machineNumber, rollNumber, studentName, count } = payload;
    try {
      await this.sessionsService.syncCode({
        sessionCode,
        machineNumber,
        tabSwitches: count || 1,
      });

      // Broadcast anti-cheating warning to faculty
      this.server.to(sessionCode).emit('faculty:student_alert', {
        type: 'TAB_SWITCH',
        rollNumber: rollNumber || '538',
        studentName: studentName || 'Student',
        machineNumber,
        count: count || 1,
        message: `Security Flag: Student on ${machineNumber} lost focus / switched tabs.`,
      });
    } catch (err: any) {
      this.logger.warn(`Error in student:tab_switched: ${err.message}`);
    }
  }

  @SubscribeMessage('student:submitted')
  async handleStudentSubmission(
    @MessageBody() payload: { sessionCode: string; machineNumber: string; score: number; passedCases: string },
  ) {
    const { sessionCode, machineNumber, score } = payload;
    try {
      const attendee = await this.sessionsService.syncCode({
        sessionCode,
        machineNumber,
        submitted: true,
        score,
      });

      this.server.to(sessionCode).emit('faculty:student_submitted', attendee);
      const grid = await this.sessionsService.getLiveGrid(sessionCode);
      this.server.to(sessionCode).emit('faculty:grid_refresh', grid.attendees);
    } catch (err: any) {
      this.logger.warn(`Error in student:submitted: ${err.message}`);
    }
  }
}

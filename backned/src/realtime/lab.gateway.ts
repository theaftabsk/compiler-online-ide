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

  public static instance: LabGateway | null = null;
  private readonly logger = new Logger(LabGateway.name);

  constructor(private readonly sessionsService: SessionsService) {
    LabGateway.instance = this;
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected to Lab Gateway: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  broadcastToSession(sessionCode: string, event: string, data?: any) {
    if (this.server) {
      this.server.to(sessionCode).emit(event, data);
    }
  }

  broadcastGlobal(event: string, data?: any) {
    if (this.server) {
      this.server.emit(event, data);
    }
  }

  @SubscribeMessage('student:join')
  async handleStudentJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { sessionCode: string; rollNumber: string; name: string; machineNumber: string; section?: string },
  ) {
    const { sessionCode } = payload;
    const normalizedCode = sessionCode?.trim().toUpperCase();
    client.join(normalizedCode);

    try {
      const result = await this.sessionsService.joinSession(payload);
      this.server.to(normalizedCode).emit('faculty:student_updated', result.attendee);
      const grid = await this.sessionsService.getLiveGrid(normalizedCode);
      this.server.to(normalizedCode).emit('faculty:grid_refresh', grid);
      client.emit('student:joined_success', result);
    } catch (err: any) {
      this.logger.warn(`Error in student:join: ${err.message}`);
      client.emit('student:joined_error', { message: err.message });
    }
  }

  @SubscribeMessage('faculty:join')
  async handleFacultyJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { sessionCode?: string },
  ) {
    client.join('faculty_global');
    if (payload?.sessionCode) {
      const normalizedCode = payload.sessionCode.trim().toUpperCase();
      client.join(normalizedCode);
      try {
        const grid = await this.sessionsService.getLiveGrid(normalizedCode);
        client.emit('faculty:grid_refresh', grid);
      } catch (err: any) {
        this.logger.warn(`Error in faculty:join: ${err.message}`);
      }
    }
  }

  @SubscribeMessage('faculty:leave')
  handleFacultyLeave(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { sessionCode: string },
  ) {
    if (payload?.sessionCode) {
      client.leave(payload.sessionCode.trim().toUpperCase());
    }
  }

  @SubscribeMessage('student:code_stream')
  async handleCodeStream(
    @MessageBody() payload: { sessionCode: string; rollNumber?: string; machineNumber: string; code: string; language: string },
  ) {
    const { sessionCode, machineNumber, code, language, rollNumber } = payload;
    const normalizedCode = sessionCode?.trim().toUpperCase();
    try {
      await this.sessionsService.syncCode({
        sessionCode: normalizedCode,
        machineNumber,
        code,
      });

      // Stream to faculty inspecting this student in real time
      this.server.to(normalizedCode).emit('faculty:student_code_sync', { rollNumber, machineNumber, code, language });
      this.server.to(normalizedCode).emit('faculty:student_updated', {
        machineNumber,
        rollNumber,
        code,
        language,
        codingStatus: 'CODING',
        onlineStatus: 'ONLINE',
      });
    } catch (err: any) {
      this.logger.warn(`Error in student:code_stream: ${err.message}`);
    }
  }

  @SubscribeMessage('student:tab_switched')
  async handleTabSwitch(
    @MessageBody() payload: { sessionCode: string; machineNumber: string; rollNumber?: string; studentName?: string; count?: number },
  ) {
    const { sessionCode, machineNumber, rollNumber, studentName, count } = payload;
    const normalizedCode = sessionCode?.trim().toUpperCase();
    try {
      const attendee = await this.sessionsService.syncCode({
        sessionCode: normalizedCode,
        machineNumber,
        tabSwitches: count || 1,
      });

      // Broadcast anti-cheating warning to faculty in real-time
      const alertData = {
        type: 'TAB_SWITCH',
        rollNumber: rollNumber || attendee?.rollNumber || '---',
        studentName: studentName || attendee?.studentName || 'Student',
        machineNumber,
        count: attendee?.tabSwitchCount ?? count ?? 1,
        message: `Security Flag: Student ${studentName || rollNumber || machineNumber} switched tabs/lost focus!`,
        timestamp: new Date().toISOString(),
      };

      this.server.to(normalizedCode).emit('faculty:student_alert', alertData);
      this.server.to(normalizedCode).emit('faculty:student_updated', attendee);
      const grid = await this.sessionsService.getLiveGrid(normalizedCode);
      this.server.to(normalizedCode).emit('faculty:grid_refresh', grid);
    } catch (err: any) {
      this.logger.warn(`Error in student:tab_switched: ${err.message}`);
    }
  }

  @SubscribeMessage('student:submitted')
  async handleStudentSubmission(
    @MessageBody() payload: { sessionCode: string; machineNumber: string; score: number; passedCases?: string; code?: string },
  ) {
    const { sessionCode, machineNumber, score, passedCases, code } = payload;
    const normalizedCode = sessionCode?.trim().toUpperCase();
    try {
      const attendee = await this.sessionsService.syncCode({
        sessionCode: normalizedCode,
        machineNumber,
        submitted: true,
        score,
        code,
      });

      this.server.to(normalizedCode).emit('faculty:student_submitted', attendee);
      this.server.to(normalizedCode).emit('faculty:student_updated', attendee);
      const grid = await this.sessionsService.getLiveGrid(normalizedCode);
      this.server.to(normalizedCode).emit('faculty:grid_refresh', grid);
    } catch (err: any) {
      this.logger.warn(`Error in student:submitted: ${err.message}`);
    }
  }

  @SubscribeMessage('session:update_status')
  async handleUpdateStatus(
    @MessageBody() payload: { sessionCode: string; status: 'ACTIVE' | 'PAUSED' | 'ENDED' },
  ) {
    const { sessionCode, status } = payload;
    const normalizedCode = sessionCode?.trim().toUpperCase();
    try {
      const session = await this.sessionsService.updateSessionStatus(normalizedCode, status);
      this.server.to(normalizedCode).emit('session:status_changed', { sessionCode: normalizedCode, status, session });
      this.server.emit('faculty:sessions_list_updated', { sessionCode: normalizedCode, status });
    } catch (err: any) {
      this.logger.warn(`Error in session:update_status: ${err.message}`);
    }
  }
}

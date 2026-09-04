import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { SessionsService } from './sessions.service';

@Controller('api/sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get()
  async findAll() {
    const sessions = await this.sessionsService.getAllSessions();
    return { success: true, sessions };
  }

  @Get('list')
  async findAllExplicit() {
    const sessions = await this.sessionsService.getAllSessions();
    return { success: true, sessions };
  }

  @Post('create')
  async create(@Body() payload: any) {
    const session = await this.sessionsService.createSession(payload);
    return { success: true, session };
  }

  @Post('join')
  async join(@Body() payload: any) {
    const result = await this.sessionsService.joinSession(payload);
    return { success: true, ...result };
  }

  @Post('heartbeat')
  async syncCode(@Body() payload: any) {
    const result = await this.sessionsService.syncCode(payload);
    return { success: true, attendee: result };
  }

  @Get(':code/grid')
  async getGrid(@Param('code') code: string) {
    const gridData = await this.sessionsService.getLiveGrid(code);
    return { success: true, ...gridData };
  }

  @Post(':code/end')
  async end(@Param('code') code: string) {
    const session = await this.sessionsService.endSession(code);
    return { success: true, session };
  }

  @Delete(':code')
  async deleteSession(@Param('code') code: string) {
    await this.sessionsService.deleteSession(code);
    return { success: true, message: `Session ${code} deleted.` };
  }

  @Get(':code')
  async findOne(@Param('code') code: string) {
    const session = await this.sessionsService.getSession(code);
    return { success: true, session };
  }
}

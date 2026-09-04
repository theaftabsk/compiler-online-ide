import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { SessionsService } from './sessions.service';

@Controller('api/sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post('create')
  async create(@Body() payload: any) {
    const session = await this.sessionsService.createSession(payload);
    return { success: true, session };
  }

  @Get(':code')
  async findOne(@Param('code') code: string) {
    const session = await this.sessionsService.getSession(code);
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
}

import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { SessionsService } from './sessions.service';

@Controller('api/sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post('create')
  create(@Body() payload: any) {
    return { success: true, session: this.sessionsService.createSession(payload) };
  }

  @Get(':code')
  findOne(@Param('code') code: string) {
    return { success: true, session: this.sessionsService.getSession(code) };
  }

  @Post('join')
  join(@Body() payload: any) {
    const result = this.sessionsService.joinSession(payload);
    return { success: true, ...result };
  }

  @Get(':code/grid')
  getGrid(@Param('code') code: string) {
    return { success: true, ...this.sessionsService.getLiveGrid(code) };
  }

  @Post(':code/end')
  end(@Param('code') code: string) {
    return { success: true, session: this.sessionsService.endSession(code) };
  }
}

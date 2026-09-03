import { Controller, Post, Body } from '@nestjs/common';
import { ExecutionService, RunCodeDto } from './execution.service';

@Controller('api/code')
export class ExecutionController {
  constructor(private readonly executionService: ExecutionService) {}

  @Post('run')
  async runCode(@Body() dto: RunCodeDto) {
    return this.executionService.runCode(dto);
  }
}

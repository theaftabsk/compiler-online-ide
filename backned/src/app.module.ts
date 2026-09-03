import { Module } from '@nestjs/common';
import { SessionsModule } from './sessions/sessions.module';
import { ExecutionModule } from './execution/execution.module';
import { RealtimeModule } from './realtime/realtime.module';

@Module({
  imports: [SessionsModule, ExecutionModule, RealtimeModule],
})
export class AppModule {}

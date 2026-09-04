import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { SessionsModule } from './sessions/sessions.module';
import { ExecutionModule } from './execution/execution.module';
import { RealtimeModule } from './realtime/realtime.module';

@Module({
  imports: [PrismaModule, AuthModule, SessionsModule, ExecutionModule, RealtimeModule],
})
export class AppModule {}

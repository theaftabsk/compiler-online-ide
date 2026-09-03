import { Module } from '@nestjs/common';
import { LabGateway } from './lab.gateway';
import { SessionsModule } from '../sessions/sessions.module';

@Module({
  imports: [SessionsModule],
  providers: [LabGateway],
  exports: [LabGateway],
})
export class RealtimeModule {}

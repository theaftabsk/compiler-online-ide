import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend client
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  });

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const PORT = process.env.PORT || 5000;
  await app.listen(PORT);

  logger.log(`=======================================================`);
  logger.log(`🚀 Kaspro Online Compiler API (by ITVEXO) is RUNNING`);
  logger.log(`📡 Endpoints: https://api.kaspro.online / http://localhost:${PORT}`);
  logger.log(`🏛️ Product: ITVEXO | Ultra-Fast GCC 13 & Sandbox Engine`);
  logger.log(`=======================================================`);
}
bootstrap();

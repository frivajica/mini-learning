import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);
  const isProduction = configService.get<string>('NODE_ENV') === 'production';
  const port = configService.get<number>('PORT') || 3000;

  app.use(helmet());
  app.use(compression());

  const corsOrigins = configService.get<string>('CORS_ORIGINS')?.split(',').filter(Boolean);
  app.enableCors({
    origin: corsOrigins && corsOrigins.length > 0 ? corsOrigins : false,
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  if (!isProduction) {
    const config = new DocumentBuilder()
      .setTitle('NestJS Production API')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document);
  }

  await app.listen(port);
  logger.log(`Application running on port ${port}`);

  const shutdown = async (signal: string) => {
    logger.log(`Received ${signal}. Shutting down gracefully...`);
    
    await app.close();
    
    logger.log('Application closed');
    process.exit(0);
  };

  const forceExit = () => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  };

  process.on('SIGTERM', () => {
    shutdown('SIGTERM');
    setTimeout(forceExit, 10000);
  });
  
  process.on('SIGINT', () => {
    shutdown('SIGINT');
    setTimeout(forceExit, 10000);
  });
}

bootstrap();

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
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('port', 4000);
  const frontendUrl = configService.get<string>('frontendUrl', 'http://localhost:3000');

  // Security Headers
  app.use(helmet());

  // Performance Compression
  app.use(compression());

  // CORS
  app.enableCors({
    origin: [frontendUrl, 'http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id', 'x-api-key'],
  });

  // Global Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global Route Prefix
  app.setGlobalPrefix('api');

  // Swagger OpenAPI Docs
  const config = new DocumentBuilder()
    .setTitle('AI Study Spot Finder API')
    .setDescription(
      'Production-grade API for discovering, reviewing, and AI-matching study spots with noise, wifi, and outlet intelligence',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('spots', 'Study spot catalog, filtering, and details')
    .addTag('ai-concierge', 'AI Study Spot Concierge conversational matcher')
    .addTag('auth', 'JWT Authentication, session renewal, and password recovery')
    .addTag('users', 'User profiles and study preference customization')
    .addTag('reviews', 'Community reviews, noise ratings, and helpfulness upvotes')
    .addTag('saved-spots', 'User saved spots and custom study lists')
    .addTag('notifications', 'Notification preferences and communication sync')
    .addTag('health', 'Liveness and readiness probes')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'AI Study Spot Finder - API Documentation',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  app.enableShutdownHooks();

  await app.listen(port);
  logger.log(`🚀 AI Study Spot Finder Backend running on http://localhost:${port}/api`);
  logger.log(`📚 Swagger Documentation accessible at http://localhost:${port}/api/docs`);
}

bootstrap();

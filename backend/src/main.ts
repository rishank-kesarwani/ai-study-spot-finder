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
  const port = Number(process.env.PORT) || configService.get<number>('port', 4000);
  const frontendUrl = configService.get<string>('frontendUrl', 'http://localhost:3000');

  // Security Headers
  app.use(helmet());

  // Performance Compression
  app.use(compression());

  // Dynamic CORS Configuration
  const allowedOrigins: (string | RegExp)[] = [
    'http://localhost:3000',
    'http://localhost:3001',
  ];

  if (frontendUrl) {
    frontendUrl
      .split(',')
      .map((url) => url.trim())
      .filter(Boolean)
      .forEach((origin) => {
        if (!allowedOrigins.includes(origin)) {
          allowedOrigins.push(origin);
        }
      });
  }

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const isAllowed = allowedOrigins.some((allowed) => {
        if (typeof allowed === 'string') return allowed === origin;
        return allowed.test(origin);
      });
      if (isAllowed) {
        callback(null, true);
      } else {
        logger.warn(`Blocked CORS request from origin: ${origin}`);
        callback(null, false);
      }
    },
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

  // Global Route Prefix (excluding /health for direct platform probes)
  app.setGlobalPrefix('api', {
    exclude: ['health'],
  });

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

  await app.listen(port, '0.0.0.0');
  logger.log(`🚀 AI Study Spot Finder Backend running on port ${port} (0.0.0.0)`);
  logger.log(`📚 Swagger Documentation accessible at http://localhost:${port}/api/docs`);
}

bootstrap();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe, Logger } from '@nestjs/common';
import { normalizeApiPrefix, parseCorsOrigins } from './config/env.validation';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Single source of truth for the route prefix; the frontend's
  // NEXT_PUBLIC_API_URL must point at http://<host>:<port>/<API_PREFIX>.
  const apiPrefix = normalizeApiPrefix(process.env.API_PREFIX);
  if (apiPrefix) app.setGlobalPrefix(apiPrefix);

  const config = new DocumentBuilder()
    .setTitle('Trackr API')
    .setDescription('The Trackr API documentation')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  // CORS: allow the local frontend dev server (override with CORS_ORIGIN).
  const corsOrigin = parseCorsOrigins(process.env.CORS_ORIGIN);

  app.enableCors({
    origin: corsOrigin,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const prismaService = app.get(PrismaService);

  // Binds to loopback by default, so a developer machine never exposes the API
  // off-host. A container has its own network namespace and must publish on
  // every interface to be reachable at all, so images set HOST=0.0.0.0.
  const port = process.env.PORT ? Number(process.env.PORT) : 3001;
  const host = process.env.HOST?.trim() || '127.0.0.1';
  await app.listen(port, host);

  const displayHost = host === '0.0.0.0' ? 'localhost' : host;
  const base = `http://${displayHost}:${port}${apiPrefix ? `/${apiPrefix}` : ''}`;
  Logger.log(`Trackr API listening on ${base}`, 'Bootstrap');
  Logger.log(`Health check at ${base}/health`, 'Bootstrap');
  Logger.log(`Swagger UI at http://${displayHost}:${port}/docs`, 'Bootstrap');
}
bootstrap();

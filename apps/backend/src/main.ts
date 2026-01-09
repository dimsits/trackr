import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )

  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Trackr API')
    .setDescription('The Trackr API documentation')
    .setVersion('1.0')
    .addBearerAuth(
      {type: 'http', scheme: 'bearer', bearerFormat: 'JWT'},
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    }
  });

  const prismaService = app.get(PrismaService);

  await app.listen(3001);
}
bootstrap();

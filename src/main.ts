require('dotenv').config();
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('SPA Parking API')
    .setDescription('Tài liệu API cho hệ thống quản lý điểm gửi xe SPA')
    .setVersion('1.0')
    .addTag('Parking')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/docs', app, document);

  // CORS
  app.enableCors();

  // Validation pipe: strip unknown fields, transform types
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Response serializer (respects @Exclude / @Expose on DTOs)
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector)),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 SPA Parking API is running on: http://localhost:${port}/api/v1`);
}
bootstrap();

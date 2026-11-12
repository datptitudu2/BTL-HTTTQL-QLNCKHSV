import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { ProblemDetailsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security Headers Middleware
  app.use((_req: any, res: any, next: any) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
  });

  // Enable CORS with Origin Validation
  const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    ...(process.env.APP_URL ? [process.env.APP_URL] : []),
  ];
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  // Global Validation Pipe against Mass Assignment & Type Injection
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Global Filter RFC 7807 Problem Details
  app.useGlobalFilters(new ProblemDetailsFilter());

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('Hệ thống Quản lý Đề tài NCKH Sinh viên Học viện PTIT (SRMS API)')
    .setDescription(
      'Hệ thống API RESTful phục vụ toàn bộ 8 phân hệ DFD/BFD theo quy chuẩn QĐ 521/QĐ-HV và giao diện S-Link PTIT',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Port configuration: Defaults to 4000 to match Vite proxy
  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`[SRMS API] Server running at http://localhost:${port}`);
  console.log(`[SRMS API] Swagger API Docs available at http://localhost:${port}/api/docs`);
}
bootstrap();


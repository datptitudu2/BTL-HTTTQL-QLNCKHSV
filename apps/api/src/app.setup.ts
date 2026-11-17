import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ProblemDetailsFilter } from './common/filters/http-exception.filter';

/**
 * Shared NestJS app configuration used by both standalone server (main.ts)
 * and Vercel Serverless Function entrypoint (api/index.ts).
 */
export function configureApp(app: INestApplication): void {
  // Security Headers Middleware
  app.use((_req: any, res: any, next: any) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
  });

  // Enable CORS for local dev, APP_URL, comma-separated CORS_ORIGINS, and Vercel preview URLs
  const extraOrigins = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const allowedOrigins: (string | RegExp)[] = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    ...(process.env.APP_URL ? [process.env.APP_URL.trim()] : []),
    ...extraOrigins,
    /^https:\/\/.*\.vercel\.app$/,
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
}

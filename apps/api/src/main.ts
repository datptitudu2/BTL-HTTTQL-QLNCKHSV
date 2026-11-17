import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp } from './app.setup';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configureApp(app);

  // Port configuration: Defaults to 4000 to match Vite proxy
  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`[SRMS API] Server running at http://localhost:${port}`);
  console.log(`[SRMS API] Swagger API Docs available at http://localhost:${port}/api/docs`);
}
bootstrap();

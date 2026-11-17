import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';

let cachedServer: any = null;

async function getServer() {
  if (!cachedServer) {
    const app = await NestFactory.create(AppModule);
    configureApp(app);
    await app.init();
    cachedServer = app.getHttpAdapter().getInstance();
  }
  return cachedServer;
}

export default async function handler(req: any, res: any) {
  const server = await getServer();
  return server(req, res);
}

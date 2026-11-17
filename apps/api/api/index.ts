import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';

let cachedServerPromise: Promise<any> | null = null;

async function getServer() {
  if (!cachedServerPromise) {
    cachedServerPromise = (async () => {
      const app = await NestFactory.create(AppModule, { logger: ['error', 'warn'] });
      configureApp(app);
      await app.init();
      return app.getHttpAdapter().getInstance();
    })().catch((err) => {
      cachedServerPromise = null;
      throw err;
    });
  }
  return cachedServerPromise;
}

export default async function handler(req: any, res: any) {
  const origin = req.headers?.origin || '';
  if (
    origin &&
    (origin.endsWith('.vercel.app') ||
      origin.startsWith('http://localhost:') ||
      origin.startsWith('http://127.0.0.1:') ||
      origin === process.env.APP_URL)
  ) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
  }

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  const server = await getServer();
  return server(req, res);
}

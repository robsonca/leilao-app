import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://leilao-app-psi.vercel.app',
      /\.vercel\.app$/,
    ],
  });
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
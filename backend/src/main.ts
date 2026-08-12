import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Strategy, ExtractJwt } from 'passport-jwt';
import cookieParser from 'cookie-parser'

/**
  ## Issue with codespace environment
  When running the server in the codespace environment, it is important to bind the server to make ports public (5173 and 3000).
  Since codespaces makes them private and can't access due to cors
 
  ## Solution
  To solve this issue, I removed origin URL, methods and headers from the cors configuration in the main.ts file. 
  This allows the server to accept requests from any origin, which is necessary in the codespace environment where ports are private.
  Just for development purposes, I will keep the cors configuration as it is, but for production, it is recommended to specify the allowed origins, methods, and headers to enhance security.
  PD: Needed to rebuild the docker image to apply the changes in the main.ts file, since it is the entry point of the application.
*/

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser())
  app.enableCors({
  origin: (origin, callback) => {
    const allowed =
      !origin ||
      origin === 'http://localhost:5173' ||
      origin === 'http://127.0.0.1:5173' ||
      origin.endsWith('.app.github.dev') ||
      (process.env.NODE_ENV === 'production' && origin === 'https://nestjsreactdocker-project.onrender.com');
    callback(allowed ? null : new Error('No permitido por CORS'), allowed);
  },
  credentials: true,
});

  await app.listen(3000, '0.0.0.0');
}
bootstrap();

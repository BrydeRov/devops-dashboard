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
  console.log('============ CHECKING CORS ============')
  app.enableCors({
    origin: [
      'http://localhost:5173', // React development server
      // 'https://turbo-rotary-phone-9x9wxjq4p69h956v-3000.app.github.dev', // Codespaces URL for React (replace with your actual Codespaces URL)
      // 'https://turbo-rotary-phone-9x9wxjq4p69h956v-5173.app.github.dev', // Codespaces URL for React (replace with your actual Codespaces URL)
      // process.env.NODE_ENV == 'production' && 'https://nestjsreactdocker-project.onrender.com'
    ], // Allow all origins for development
    credentials: true, // Enable for JWT in cookies
  });

  await app.listen(3000, '0.0.0.0');
}
bootstrap();

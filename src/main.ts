import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import dotenv from 'dotenv'
import { ValidationPipe } from '@nestjs/common';
dotenv.config();


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //setting up cors
  app.enableCors({
    origin: true, // Allow all origins for testing
    credentials: true,
  })

  //global validation pipes
  app.useGlobalPipes(new ValidationPipe({
    whitelist:true,
    transform:true,
  }))

  //set common prefix
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3101;

  await app.listen(port ?? 3101);
  console.log(`Server listening on Port ${port}`);
}
bootstrap();

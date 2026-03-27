import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import dotenv from 'dotenv'
import { ValidationPipe } from '@nestjs/common';
dotenv.config();


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //setting up cors
  app.enableCors({
    origin: '*'
  })

  //global validation pipes
  app.useGlobalPipes(new ValidationPipe({
    whitelist:true,
    transform:true,
    forbidNonWhitelisted: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }))

  //set common prefix
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3101;

  await app.listen(port ?? 3101);
  console.log(`Server listening on Port ${port}`);
}
bootstrap();

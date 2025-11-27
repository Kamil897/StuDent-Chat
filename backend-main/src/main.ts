import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConsoleLogger, ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import * as cookieParser from 'cookie-parser';
import { AllExceptionsFilter } from './logger/error.handling';
import shopRouter from './shop/shop.router';

async function start() {
  try {
    const PORT = process.env.PORT || 7777;
    const app = await NestFactory.create(AppModule, {
      logger: new ConsoleLogger({
        colors: true,
        prefix: 'StudentChat',
      }),
    });

    app.use(cookieParser());
    app.use(express.json());
    app.use('/', shopRouter as any);
    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalFilters(new AllExceptionsFilter());

    app.enableCors({
      origin: [
        'http://localhost:5173',
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });

    const config = new DocumentBuilder()
      .setTitle('Student Chat')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: { defaultModelsExpandDepth: -1 },
    });

    await app.listen(PORT, () => {
      console.log(
        '\n\n + ====================================================================== +',
      );
      console.log(
        `| |                                                                          | |`,
      );
      console.log(
        `| | 🚀     Server is running at: http://localhost:7777                   🚀 | |`,
      );
      console.log(
        `| |                                                                          | |`,
      );
      console.log(
        `| | 📚 Swagger docs: http://localhost:7777/api/docs                      📚 | |`,
      );
      console.log(
        `| |                                                                          | |`,
      );
      console.log(
        ' + ======================================================================     +\n\n',
      );
    });
  } catch (error) {
    console.error('❌ Error starting server:', error);
  }
}

start();

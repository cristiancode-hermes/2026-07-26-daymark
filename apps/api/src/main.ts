import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.enableCors({
    origin: ['http://localhost:4200', 'https://daymark.proyectos.cristiancode.dev'],
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  const config = new DocumentBuilder()
    .setTitle('Daymark API')
    .setDescription('Daily Reflection & Mood Journal API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Daymark API running on http://localhost:${port}`);
  console.log(`Swagger docs at http://localhost:${port}/api/docs`);
}
bootstrap();

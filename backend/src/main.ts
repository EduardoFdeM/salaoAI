import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Configuração de views
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');

  // Configurar pasta pública
  app.useStaticAssets(join(__dirname, '..', 'public'));
  // Configurar pasta de uploads como estática
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/', // Acessar via /uploads/avatars/...
  });

  // Configuração global de pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('API de Agendamento para Cabeleireiros')
    .setDescription('API para o sistema de agendamento de cabeleireiros')
    .setVersion('1.0')
    .addTag('auth', 'Autenticação e autorização')
    .addTag('users', 'Gerenciamento de usuários')
    .addTag('salons', 'Gerenciamento de salões')
    .addTag('professionals', 'Gerenciamento de profissionais')
    .addTag('services', 'Gerenciamento de serviços')
    .addTag('appointments', 'Gerenciamento de agendamentos')
    .addTag('clients', 'Gerenciamento de clientes')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Configuração de CORS
  app.enableCors();

  await app.listen(process.env.PORT || 3333);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();

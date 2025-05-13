import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as fs from 'fs';

async function bootstrap() {
  // Log the environment for debugging
  console.log('Environment:', {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT || 3333,
    cwd: process.cwd(),
    dirContents: fs.readdirSync(process.cwd()),
  });

  // Check if uploads directory exists, create if not
  const uploadsDir = join(process.cwd(), 'uploads');
  const avatarsDir = join(uploadsDir, 'avatars');
  
  if (!fs.existsSync(uploadsDir)) {
    console.log('Creating uploads directory:', uploadsDir);
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  if (!fs.existsSync(avatarsDir)) {
    console.log('Creating avatars directory:', avatarsDir);
    fs.mkdirSync(avatarsDir, { recursive: true });
  }

  // Check if views directory exists for templates
  const viewsDir = join(process.cwd(), 'views');
  if (!fs.existsSync(viewsDir)) {
    console.log('Views directory not found, creating:', viewsDir);
    fs.mkdirSync(viewsDir, { recursive: true });
    
    // Create subdirectory for prisma-admin if needed
    const prismaAdminDir = join(viewsDir, 'prisma-admin');
    if (!fs.existsSync(prismaAdminDir)) {
      fs.mkdirSync(prismaAdminDir, { recursive: true });
    }
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Configuração de views
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');

  // Configurar pasta pública
  const publicDir = join(__dirname, '..', 'public');
  if (!fs.existsSync(publicDir)) {
    console.log('Creating public directory:', publicDir);
    fs.mkdirSync(publicDir, { recursive: true });
  }
  app.useStaticAssets(publicDir);
  
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
  app.enableCors({
    origin: [
      'https://salaoai.evergreenmkt.com.br', 
      'https://www.salaoai.evergreenmkt.com.br',
      process.env.FRONTEND_URL || '*'
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  const port = process.env.PORT || 3333;
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on port: ${port}`);
  console.log(`Documentation available at: http://localhost:${port}/api/docs`);
}
bootstrap();

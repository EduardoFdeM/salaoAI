// src/whatsapp/whatsapp.module.ts
import { Module } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { WhatsappController } from './whatsapp.controller';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [ConfigModule, HttpModule],
  controllers: [WhatsappController],
  providers: [WhatsappService, PrismaService],
  exports: [WhatsappService],
})
export class WhatsappModule {}
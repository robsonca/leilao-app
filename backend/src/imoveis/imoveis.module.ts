import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ImoveisController } from './imoveis.controller';
import { ImoveisService } from './imoveis.service';
import { ImovelSyncService } from './imoveis.sync.service';
import { PrismaService } from '../prisma.service';

@Module({
  imports: [MulterModule.register({ limits: { fileSize: 50 * 1024 * 1024 } })],
  controllers: [ImoveisController],
  providers: [ImoveisService, ImovelSyncService, PrismaService],
})
export class ImoveisModule {}

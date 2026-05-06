import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UploadedFile,
  UseInterceptors,
  Headers,
  UnauthorizedException,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImoveisService } from './imoveis.service';
import type { FilterImoveisDto } from './imoveis.service';
import { ImovelSyncService } from './imoveis.sync.service';

@Controller('imoveis')
export class ImoveisController {
  constructor(
    private readonly imoveisService: ImoveisService,
    private readonly syncService: ImovelSyncService,
  ) {}

  @Get()
  findAll(@Query() query: FilterImoveisDto) {
    return this.imoveisService.findAll(query);
  }

  @Get('kpis')
  getKpis(@Query() query: FilterImoveisDto) {
    return this.imoveisService.getKpis(query);
  }

  @Get('cidades')
  getCidades() {
    return this.imoveisService.getCidades();
  }

  @Get('insights')
  getInsights() {
    return this.imoveisService.getInsights();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.imoveisService.findOne(id);
  }

  @Post('sync')
  sync(@Headers('x-sync-secret') secret: string) {
    if (secret !== process.env.SYNC_SECRET) {
      throw new UnauthorizedException('Token inválido');
    }
    return this.syncService.syncFromStorage();
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadCsv(@UploadedFile() file: Express.Multer.File) {
    return this.syncService.syncFromUpload(file.buffer);
  }
}

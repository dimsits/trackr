import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { createR2Client } from './r2.client';

@Module({
  controllers: [FilesController],
  providers: [
    FilesService,
    { provide: 'R2_CLIENT', useFactory: createR2Client },
  ],
})
export class FilesModule {}

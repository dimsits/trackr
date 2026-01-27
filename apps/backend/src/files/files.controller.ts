import { Body, Controller, Delete, Get, Param, Post, UseGuards, HttpCode } from '@nestjs/common';
import { ApiHeader, ApiNoContentResponse, ApiOkResponse, ApiParam, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user/current-user.decorator';
import type { CurrentUserPayload } from '../auth/current-user/current-user.decorator';
import { FilesService } from './files.service';
import { CreateUploadUrlDto } from './dto/create-upload-url.dto';
import { RegisterFileDto } from './dto/register-file.dto';

@ApiTags('Files')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller()
export class FilesController {
  constructor(private readonly files: FilesService) {}

  @Post('files/upload-url')
  @ApiOkResponse({ description: 'Generate presigned PUT url for R2 upload' })
  createUploadUrl(@CurrentUser() user: CurrentUserPayload, @Body() dto: CreateUploadUrlDto) {
    return this.files.createUploadUrl(user.userId, dto);
  }

  @Post('applications/:id/files')
  @ApiParam({ name: 'id', description: 'applicationId' })
  @ApiOkResponse({ description: 'Register uploaded file metadata in DB' })
  register(@CurrentUser() user: CurrentUserPayload, @Param('id') applicationId: string, @Body() dto: RegisterFileDto) {
    return this.files.registerFile(user.userId, applicationId, dto);
  }

  @Get('files/:id/download-url')
  @ApiParam({ name: 'id', description: 'fileId' })
  @ApiOkResponse({ description: 'Generate presigned GET url for download' })
  downloadUrl(@CurrentUser() user: CurrentUserPayload, @Param('id') fileId: string) {
    return this.files.createDownloadUrl(user.userId, fileId);
  }

  // Optional but useful for UI
  @Get('applications/:id/files')
  @ApiParam({ name: 'id', description: 'applicationId' })
  list(@CurrentUser() user: CurrentUserPayload, @Param('id') applicationId: string) {
    return this.files.listForApplication(user.userId, applicationId);
  }

  @HttpCode(204)
  @Delete('files/:id')
  @ApiParam({ name: 'id', description: 'fileId' })
  @ApiNoContentResponse({ description: 'Soft delete file metadata' })
  async remove(@CurrentUser() user: CurrentUserPayload, @Param('id') fileId: string) {
    await this.files.deleteFile(user.userId, fileId);
    // optional: return nothing to match 204
  }


}

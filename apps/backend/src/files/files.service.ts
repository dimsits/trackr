import { Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WorkspaceAccessService } from '../workspace-access/workspace-access.service';
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

function safeFilename(name: string) {
  // keep simple; you can improve later
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120);
}

@Injectable()
export class FilesService {
  private readonly bucket = process.env.R2_BUCKET!;
  private readonly ttlSeconds = Number(process.env.R2_URL_TTL_SECONDS ?? '600');

  constructor(
    private readonly prisma: PrismaService,
    private readonly access: WorkspaceAccessService,
    @Inject('R2_CLIENT') private readonly r2: S3Client,
  ) {
    if (!this.bucket) throw new Error('R2_BUCKET is not set');
  }

  private async getApplicationOrThrow(applicationId: string) {
    const app = await this.prisma.application.findFirst({
      where: { id: applicationId, deletedAt: null },
      select: { id: true, workspaceId: true },
    });
    if (!app) throw new NotFoundException('Application not found');
    return app;
  }

  async createUploadUrl(userId: string, input: { applicationId: string; filename: string; contentType: string; size: number }) {
    const app = await this.getApplicationOrThrow(input.applicationId);
    await this.access.assertMember(userId, app.workspaceId);

    // storage key policy: tie key to workspace + application
    const key = `workspaces/${app.workspaceId}/applications/${app.id}/${uuidv4()}-${safeFilename(input.filename)}`;

    const url = await getSignedUrl(
      this.r2,
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        ContentType: input.contentType, // makes client send matching Content-Type (otherwise SignatureDoesNotMatch)
      }),
      { expiresIn: this.ttlSeconds },
    );

    return {
      uploadUrl: url,
      storageKey: key,
      bucket: this.bucket,
      expiresIn: this.ttlSeconds,
      requiredHeaders: { 'Content-Type': input.contentType },
    };
  }

  async registerFile(userId: string, applicationId: string, dto: { name: string; storageKey: string; mime: string; size: number }) {
    const app = await this.getApplicationOrThrow(applicationId);
    await this.access.assertMember(userId, app.workspaceId);

    // prevent registering arbitrary keys (basic abuse prevention)
    const expectedPrefix = `workspaces/${app.workspaceId}/applications/${app.id}/`;
    if (!dto.storageKey.startsWith(expectedPrefix)) {
      throw new BadRequestException('storageKey is not valid for this application');
    }

    return this.prisma.file.create({
      data: {
        workspaceId: app.workspaceId,
        applicationId: app.id,
        name: dto.name,
        storageKey: dto.storageKey,
        mime: dto.mime,
        size: dto.size,
      },
      select: {
        id: true,
        workspaceId: true,
        applicationId: true,
        name: true,
        storageKey: true,
        mime: true,
        size: true,
        createdAt: true,
      },
    });
  }

  async createDownloadUrl(userId: string, fileId: string) {
    const file = await this.prisma.file.findFirst({
      where: { id: fileId, deletedAt: null },
      select: {
        id: true,
        workspaceId: true,
        name: true,
        storageKey: true,
        mime: true,
      },
    });

    if (!file) throw new NotFoundException('File not found');

    await this.access.assertMember(userId, file.workspaceId);

    if (!file.storageKey) {
        throw new BadRequestException('File has no storageKey');
    }

    const url = await getSignedUrl(
      this.r2,
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: file.storageKey,
        ResponseContentType: file.mime ?? undefined,
        // optional: ResponseContentDisposition to force download
        // ResponseContentDisposition: `attachment; filename="${file.name}"`,
      }),
      { expiresIn: this.ttlSeconds },
    );

    return { downloadUrl: url, expiresIn: this.ttlSeconds };
  }

  async listForApplication(userId: string, applicationId: string) {
    const app = await this.getApplicationOrThrow(applicationId);
    await this.access.assertMember(userId, app.workspaceId);

    return this.prisma.file.findMany({
      where: { applicationId: app.id, deletedAt: null },
      select: {
        id: true,
        name: true,
        mime: true,
        size: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteFile(userId: string, fileId: string) {
    const file = await this.prisma.file.findFirst({
      where: { id: fileId, deletedAt: null },
      select: {id: true, workspaceId: true},
    });

    if (!file) throw new NotFoundException('File not found');

    await this.access.assertMember(userId, file.workspaceId);

    await this.prisma.file.update({
      where: { id: fileId },
      data: { deletedAt: new Date() },
    });

    return {ok: true};
  }
}

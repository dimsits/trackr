import { Logger } from '@nestjs/common';
import { S3Client } from '@aws-sdk/client-s3';
import { isR2Configured, missingR2Vars } from '../config/env.validation';

/** DI token for the (optional) Cloudflare R2 client. */
export const R2_CLIENT = 'R2_CLIENT';

/**
 * Builds the R2 client, or returns `null` when object storage is not configured.
 *
 * Returning `null` keeps the API bootable locally without credentials - only
 * the file upload/download endpoints degrade; every other feature works.
 */
export function createR2Client(): S3Client | null {
  if (!isR2Configured()) {
    Logger.warn(
      `File storage is disabled - missing ${missingR2Vars().join(', ')}. ` +
        'Upload/download endpoints will return 503; all other features work normally.',
      'R2',
    );
    return null;
  }

  const accountId = process.env.R2_ACCOUNT_ID!;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID!;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY!;

  return new S3Client({
    region: 'auto', // required by SDK; R2 ignores region
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

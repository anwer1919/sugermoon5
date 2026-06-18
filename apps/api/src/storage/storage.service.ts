import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { nanoid } from 'nanoid';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private s3: S3Client;
  private bucket: string;

  constructor(private config: ConfigService) {
    this.s3 = new S3Client({
      region: this.config.get('AWS_REGION', 'us-east-1'),
      credentials: {
        accessKeyId: this.config.get('AWS_ACCESS_KEY_ID')!,
        secretAccessKey: this.config.get('AWS_SECRET_ACCESS_KEY')!,
      },
    });
    this.bucket = this.config.get('AWS_S3_BUCKET', 'sugermoon-uploads');
  }

  async upload(file: Buffer, mimetype: string, folder = 'images'): Promise<string> {
    const ext = mimetype.split('/')[1] || 'jpg';
    const key = `${folder}/${nanoid()}.${ext}`;

    await this.s3.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file,
      ContentType: mimetype,
    }));

    this.logger.log(`Uploaded: ${key}`);
    return `https://${this.bucket}.s3.amazonaws.com/${key}`;
  }

  async delete(url: string): Promise<void> {
    const key = url.replace(`https://${this.bucket}.s3.amazonaws.com/`, '');
    await this.s3.send(new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    }));
    this.logger.log(`Deleted: ${key}`);
  }
}

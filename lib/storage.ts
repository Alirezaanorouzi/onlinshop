import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { assets } from "@/db/schema";
import { getDb } from "@/db/index";
import {
  getS3Config,
  isObjectStorageConfigured,
  isSqliteCatalog,
} from "@/lib/env";
import { publicUrlForLocalUpload } from "@/lib/public-upload-url";

function createS3Client() {
  const config = getS3Config();
  if (!isObjectStorageConfigured()) {
    throw new Error("S3 object storage is not configured");
  }

  return new S3Client({
    region: config.region,
    endpoint: config.endpoint,
    forcePathStyle: config.forcePathStyle,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
}

export function publicUrlForKey(objectKey: string) {
  const { publicBaseUrl, bucket, endpoint, forcePathStyle } = getS3Config();
  if (publicBaseUrl) {
    return `${publicBaseUrl.replace(/\/$/, "")}/${objectKey}`;
  }
  const base = endpoint.replace(/\/$/, "");
  if (forcePathStyle) {
    return `${base}/${bucket}/${objectKey}`;
  }
  return `${base}/${objectKey}`;
}

async function uploadToLocalDisk(file: {
  buffer: Buffer;
  mimeType: string;
  originalName: string;
  prefix?: string;
}) {
  const folder = file.prefix ?? "products";
  const ext = path.extname(file.originalName) || ".bin";
  const fileName = `${randomUUID()}${ext}`;
  const relativeDir = path.join("uploads", folder);
  const absoluteDir = path.join(process.cwd(), "public", relativeDir);
  fs.mkdirSync(absoluteDir, { recursive: true });
  const absoluteFile = path.join(absoluteDir, fileName);
  fs.writeFileSync(absoluteFile, file.buffer);

  const objectKey = `${relativeDir.replace(/\\/g, "/")}/${fileName}`;
  const publicUrl = publicUrlForLocalUpload(objectKey);

  if (isSqliteCatalog()) {
    const db = getDb();
    db.insert(assets)
      .values({
        objectKey,
        bucket: "local",
        mimeType: file.mimeType,
        sizeBytes: file.buffer.length,
        publicUrl,
      })
      .run();
  }

  return { objectKey, publicUrl };
}

export async function uploadObject(file: {
  buffer: Buffer;
  mimeType: string;
  originalName: string;
  prefix?: string;
}) {
  if (!isObjectStorageConfigured()) {
    return uploadToLocalDisk(file);
  }

  const config = getS3Config();
  const client = createS3Client();
  const ext = path.extname(file.originalName) || "";
  const objectKey = `${file.prefix ?? "uploads"}/${randomUUID()}${ext}`;

  await client.send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: objectKey,
      Body: file.buffer,
      ContentType: file.mimeType,
    }),
  );

  const publicUrl = publicUrlForKey(objectKey);
  const db = getDb();
  db.insert(assets)
    .values({
      objectKey,
      bucket: config.bucket,
      mimeType: file.mimeType,
      sizeBytes: file.buffer.length,
      publicUrl,
    })
    .run();

  return { objectKey, publicUrl };
}

export async function deleteObject(objectKey: string) {
  if (!isObjectStorageConfigured()) {
    const absoluteFile = path.join(process.cwd(), "public", objectKey);
    if (fs.existsSync(absoluteFile)) fs.unlinkSync(absoluteFile);
    return;
  }

  const config = getS3Config();
  const client = createS3Client();
  await client.send(
    new DeleteObjectCommand({
      Bucket: config.bucket,
      Key: objectKey,
    }),
  );
}

import {
  CreateBucketCommand,
  HeadBucketCommand,
  S3Client,
} from "@aws-sdk/client-s3";

const endpoint = process.env.S3_ENDPOINT?.trim() || "http://127.0.0.1:8333";
const bucket = process.env.S3_BUCKET?.trim() || "onlineshop";
const accessKeyId = process.env.S3_ACCESS_KEY?.trim() || "onlineshop";
const secretAccessKey =
  process.env.S3_SECRET_KEY?.trim() || "onlineshop-dev-secret";

const client = new S3Client({
  region: process.env.S3_REGION?.trim() || "us-east-1",
  endpoint,
  forcePathStyle: true,
  credentials: { accessKeyId, secretAccessKey },
});

async function main() {
  try {
    await client.send(new HeadBucketCommand({ Bucket: bucket }));
    console.log(`Bucket "${bucket}" already exists.`);
    return;
  } catch {
    // create
  }

  await client.send(new CreateBucketCommand({ Bucket: bucket }));
  console.log(`Created bucket "${bucket}" on ${endpoint}`);
}

main().catch((error) => {
  console.error(
    "Could not reach SeaweedFS. Run: npm run storage:up\n",
    error,
  );
  process.exit(1);
});

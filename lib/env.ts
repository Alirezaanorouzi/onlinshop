export type CatalogBackend = "json" | "sqlite";

export function getCatalogBackend(): CatalogBackend {
  const value = process.env.CATALOG_BACKEND?.trim().toLowerCase();
  if (value === "sqlite") return "sqlite";
  return "json";
}

/** SQLite is runtime-only on Liara: build uses JSON so `next build` does not need native bindings or a DB file. */
export function isSqliteCatalog(): boolean {
  if (getCatalogBackend() !== "sqlite") return false;
  if (process.env.NEXT_PHASE === "phase-production-build") return false;
  return true;
}

export function getSqlitePath(): string {
  return process.env.SQLITE_PATH?.trim() || "data/catalog.sqlite";
}

export function getS3Config() {
  return {
    endpoint: process.env.S3_ENDPOINT?.trim() || "",
    region: process.env.S3_REGION?.trim() || "us-east-1",
    bucket: process.env.S3_BUCKET?.trim() || "onlineshop",
    accessKeyId: process.env.S3_ACCESS_KEY?.trim() || "",
    secretAccessKey: process.env.S3_SECRET_KEY?.trim() || "",
    publicBaseUrl: process.env.S3_PUBLIC_BASE_URL?.trim() || "",
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE !== "false",
  };
}

export function isObjectStorageConfigured(): boolean {
  const s3 = getS3Config();
  return Boolean(s3.endpoint && s3.accessKeyId && s3.secretAccessKey);
}

export function getAdminToken(): string {
  return process.env.ADMIN_TOKEN?.trim() || "";
}

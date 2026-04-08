export function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name} environment variable.`);
  }
  return value;
}

export function getAppUrl() {
  const explicit = process.env.APP_URL?.trim();
  if (explicit) {
    return explicit.replace(/\/$/, "");
  }

  const productionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (productionUrl) {
    return `https://${productionUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")}`;
  }

  const previewUrl = process.env.VERCEL_URL?.trim();
  if (previewUrl) {
    return `https://${previewUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")}`;
  }

  return "http://localhost:3000";
}

export function getDataStoreMode() {
  return process.env.DATA_STORE?.trim().toLowerCase() || "mongo";
}

export function isVercelEnvironment() {
  return process.env.VERCEL === "1";
}

export function canUseLocalFallback() {
  return getDataStoreMode() === "local" && !isVercelEnvironment();
}

export function getUploadStorageMode() {
  const configured = process.env.UPLOAD_STORAGE?.trim().toLowerCase();
  if (configured === "cloudinary" || configured === "local") {
    return configured;
  }

  if (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  ) {
    return "cloudinary";
  }

  return "local";
}

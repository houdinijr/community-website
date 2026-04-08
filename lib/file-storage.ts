import { createHash } from "crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";

import { getUploadStorageMode, isVercelEnvironment, requireEnv } from "@/lib/env";

export type UploadedAsset = {
  url: string;
  fileName: string;
  contentType: string;
  storageId?: string;
};

function sanitizeFileName(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]/g, "-");
}

function getCloudinarySignature(params: Record<string, string>) {
  const apiSecret = requireEnv("CLOUDINARY_API_SECRET");
  const payload = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return createHash("sha1").update(`${payload}${apiSecret}`).digest("hex");
}

async function uploadToCloudinary(file: File, folder: string, publicId: string): Promise<UploadedAsset> {
  const cloudName = requireEnv("CLOUDINARY_CLOUD_NAME");
  const apiKey = requireEnv("CLOUDINARY_API_KEY");
  const timestamp = String(Math.floor(Date.now() / 1000));
  const params = { folder, public_id: publicId, timestamp };
  const signature = getCloudinarySignature(params);

  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);
  formData.append("public_id", publicId);
  formData.append("api_key", apiKey);
  formData.append("timestamp", timestamp);
  formData.append("signature", signature);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const payload = await response.text();
    throw new Error(`Cloud upload failed: ${payload}`);
  }

  const payload = await response.json();
  return {
    url: payload.secure_url,
    fileName: file.name || `${publicId}`,
    contentType: file.type || "application/octet-stream",
    storageId: payload.public_id,
  };
}

async function deleteFromCloudinary(storageId: string) {
  const cloudName = requireEnv("CLOUDINARY_CLOUD_NAME");
  const apiKey = requireEnv("CLOUDINARY_API_KEY");
  const timestamp = String(Math.floor(Date.now() / 1000));
  const params = { public_id: storageId, timestamp };
  const signature = getCloudinarySignature(params);

  const formData = new FormData();
  formData.append("public_id", storageId);
  formData.append("api_key", apiKey);
  formData.append("timestamp", timestamp);
  formData.append("signature", signature);

  await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
    method: "POST",
    body: formData,
  }).catch(() => undefined);
  await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/raw/destroy`, {
    method: "POST",
    body: formData,
  }).catch(() => undefined);
}

async function saveLocally(file: File, directory: string, storedFileName: string): Promise<UploadedAsset> {
  const bytes = Buffer.from(await file.arrayBuffer());
  const targetDirectory = path.join(process.cwd(), "public", "uploads", directory);
  await mkdir(targetDirectory, { recursive: true });
  await writeFile(path.join(targetDirectory, storedFileName), bytes);

  return {
    url: `/media/${directory}/${storedFileName}`,
    fileName: file.name || storedFileName,
    contentType: file.type || "application/octet-stream",
    storageId: storedFileName,
  };
}

export async function storeUploadedFile(input: {
  file: File;
  directory: "certificates" | "content";
  fileName: string;
  cloudFolder: string;
  cloudPublicId: string;
}) {
  const mode = getUploadStorageMode();

  if (mode === "cloudinary") {
    return uploadToCloudinary(input.file, input.cloudFolder, input.cloudPublicId);
  }

  if (isVercelEnvironment()) {
    throw new Error("Local file storage is not supported on Vercel. Configure Cloudinary environment variables for production uploads.");
  }

  return saveLocally(input.file, input.directory, sanitizeFileName(input.fileName));
}

export async function deleteUploadedFile(input: {
  directory: "certificates" | "content";
  storageId?: string;
  url?: string;
}) {
  if (!input.storageId && !input.url) {
    return;
  }

  const mode = getUploadStorageMode();
  if (mode === "cloudinary" && input.storageId) {
    await deleteFromCloudinary(input.storageId);
    return;
  }

  const fileName = input.storageId || input.url?.split("/").pop();
  if (!fileName) {
    return;
  }

  const filePath = path.join(process.cwd(), "public", "uploads", input.directory, path.basename(fileName));
  await unlink(filePath).catch(() => undefined);
}

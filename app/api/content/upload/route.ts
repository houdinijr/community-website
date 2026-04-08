import path from "path";

import { NextResponse } from "next/server";

import { getCurrentSession } from "@/lib/auth";
import { storeUploadedFile } from "@/lib/file-storage";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function getExtension(file: File) {
  const originalExtension = path.extname(file.name || "").toLowerCase();
  if (originalExtension) {
    return originalExtension;
  }

  switch (file.type) {
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    default:
      return ".jpg";
  }
}

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const uploadedFile = formData.get("file");

    if (!(uploadedFile instanceof File)) {
      return NextResponse.json({ error: "Image file is required." }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(uploadedFile.type)) {
      return NextResponse.json({ error: "Only JPG, PNG, and WEBP files are allowed." }, { status: 400 });
    }

    const upload = await storeUploadedFile({
      file: uploadedFile,
      directory: "content",
      fileName: `content-${Date.now()}${getExtension(uploadedFile)}`,
      cloudFolder: "cecau/content",
      cloudPublicId: `content-${Date.now()}`,
    });

    return NextResponse.json({ url: upload.url, storageId: upload.storageId });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to upload image." },
      { status: 500 },
    );
  }
}

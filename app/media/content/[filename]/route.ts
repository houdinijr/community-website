import { readFile } from "fs/promises";
import path from "path";

import { NextResponse } from "next/server";

const MIME_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

export async function GET(
  _request: Request,
  context: { params: Promise<{ filename: string }> },
) {
  const { filename } = await context.params;
  const safeName = path.basename(filename);
  const filePath = path.join(process.cwd(), "public", "uploads", "content", safeName);

  try {
    const fileBuffer = await readFile(filePath);
    const extension = path.extname(safeName).toLowerCase();
    const contentType = MIME_TYPES[extension] || "application/octet-stream";

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Disposition": `inline; filename="${safeName}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found." }, { status: 404 });
  }
}

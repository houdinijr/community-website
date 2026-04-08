import { readFile } from "fs/promises";
import path from "path";

import { PDFDocument } from "pdf-lib";
import { NextResponse } from "next/server";

import { getCertificateRecordById } from "@/lib/certificates";

function extractStoredFileName(url?: string) {
  if (!url) {
    return null;
  }

  const match = url.match(/\/(?:uploads|media)\/certificates\/([^/?#]+)/i);
  return match?.[1] || null;
}

function isRemoteUrl(url: string) {
  return /^https?:\/\//i.test(url);
}

async function getCertificateFileBytes(fileUrl: string) {
  if (isRemoteUrl(fileUrl)) {
    const response = await fetch(fileUrl, {
      cache: "no-store",
      headers: {
        Accept: "application/pdf,image/*,*/*",
      },
    });

    if (!response.ok) {
      throw new Error(`Remote certificate download failed with status ${response.status}.`);
    }

    const contentType = response.headers.get("content-type") || undefined;
    const bytes = Buffer.from(await response.arrayBuffer());
    return { bytes, contentType };
  }

  const storedFileName = extractStoredFileName(fileUrl);
  if (!storedFileName) {
    throw new Error("Certificate file path is invalid.");
  }

  const filePath = path.join(
    process.cwd(),
    "public",
    "uploads",
    "certificates",
    path.basename(storedFileName),
  );

  const bytes = await readFile(filePath);
  return { bytes, contentType: undefined };
}

function normalizeCertificateMimeType(preferred?: string, fallback?: string) {
  const mimeType = preferred || fallback || "";

  if (mimeType.includes("pdf")) {
    return "application/pdf";
  }

  if (mimeType.includes("png")) {
    return "image/png";
  }

  if (mimeType.includes("jpeg") || mimeType.includes("jpg")) {
    return "image/jpeg";
  }

  return mimeType;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const certificate = await getCertificateRecordById(id);

    if (!certificate?.certificateFileUrl) {
      return NextResponse.json({ error: "Certificate file not found." }, { status: 404 });
    }

    const { bytes, contentType } = await getCertificateFileBytes(certificate.certificateFileUrl);
    const mimeType = normalizeCertificateMimeType(
      certificate.certificateFileType,
      contentType,
    );
    const downloadName = `${certificate.certificateId}-${certificate.fullName.replace(/\s+/g, "-")}.pdf`;

    if (mimeType === "application/pdf") {
      return new NextResponse(bytes, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${downloadName}"`,
          "Cache-Control": "private, no-store",
        },
      });
    }

    const pdfDoc = await PDFDocument.create();
    const embeddedImage =
      mimeType === "image/png"
        ? await pdfDoc.embedPng(bytes)
        : await pdfDoc.embedJpg(bytes);

    const page = pdfDoc.addPage([embeddedImage.width, embeddedImage.height]);
    page.drawImage(embeddedImage, {
      x: 0,
      y: 0,
      width: embeddedImage.width,
      height: embeddedImage.height,
    });

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${downloadName}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to prepare certificate download." },
      { status: 500 },
    );
  }
}

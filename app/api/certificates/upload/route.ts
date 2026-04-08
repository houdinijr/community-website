import path from "path";

import { NextResponse } from "next/server";

import { getCurrentSession } from "@/lib/auth";
import {
  attachCertificateAssets,
  enrichCertificate,
  getCertificateRecordById,
} from "@/lib/certificates";
import { storeUploadedFile } from "@/lib/file-storage";
import { sendSiteNotification } from "@/lib/site-notifications";

const ALLOWED_CERTIFICATE_TYPES = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp"]);
const ALLOWED_PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function getExtension(file: File, fallback = ".jpg") {
  const originalExtension = path.extname(file.name || "").toLowerCase();
  if (originalExtension) {
    return originalExtension;
  }

  switch (file.type) {
    case "application/pdf":
      return ".pdf";
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    default:
      return fallback;
  }
}

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session) {
    await sendSiteNotification({
      subject: "Site alert: unauthorized certificate upload attempt",
      message: "Someone attempted to upload certificate assets without an active admin session.",
    });
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const certificateId = String(formData.get("certificateId") || "").trim();
    const uploadedCertificateFile = formData.get("file");
    const uploadedPhotoFile = formData.get("photo");

    const certificateFile = uploadedCertificateFile instanceof File ? uploadedCertificateFile : null;
    const photoFile = uploadedPhotoFile instanceof File ? uploadedPhotoFile : null;

    if (!certificateId || (!certificateFile && !photoFile)) {
      await sendSiteNotification({
        subject: "Site alert: certificate upload rejected",
        message: "Certificate upload was rejected because the certificate ID or asset files were missing.",
        metadata: { certificateId },
      });
      return NextResponse.json({ error: "Certificate ID and at least one upload are required." }, { status: 400 });
    }

    if (certificateFile && !ALLOWED_CERTIFICATE_TYPES.has(certificateFile.type)) {
      return NextResponse.json({ error: "Only PDF, JPG, PNG, and WEBP files are allowed for the certificate." }, { status: 400 });
    }

    if (photoFile && !ALLOWED_PHOTO_TYPES.has(photoFile.type)) {
      return NextResponse.json({ error: "Only JPG, PNG, and WEBP files are allowed for the person photo." }, { status: 400 });
    }

    const certificate = await getCertificateRecordById(certificateId);
    if (!certificate) {
      return NextResponse.json({ error: "Certificate not found." }, { status: 404 });
    }

    const certificateUpload = certificateFile
      ? await storeUploadedFile({
          file: certificateFile,
          directory: "certificates",
          fileName: `${certificateId}-certificate-${Date.now()}${getExtension(certificateFile, ".pdf")}`,
          cloudFolder: "cecau/certificates",
          cloudPublicId: `${certificateId}-certificate-${Date.now()}`,
        })
      : null;

    const photoUpload = photoFile
      ? await storeUploadedFile({
          file: photoFile,
          directory: "certificates",
          fileName: `${certificateId}-photo-${Date.now()}${getExtension(photoFile, ".jpg")}`,
          cloudFolder: "cecau/certificate-photos",
          cloudPublicId: `${certificateId}-photo-${Date.now()}`,
        })
      : null;

    const updated = await attachCertificateAssets({
      certificateId,
      ...(certificateUpload
        ? {
            certificateFileUrl: certificateUpload.url,
            certificateFileName: certificateUpload.fileName,
            certificateFileType: certificateUpload.contentType,
            certificateFileStorageId: certificateUpload.storageId,
          }
        : {}),
      ...(photoUpload
        ? {
            personPhotoUrl: photoUpload.url,
            personPhotoFileName: photoUpload.fileName,
            personPhotoFileType: photoUpload.contentType,
            personPhotoStorageId: photoUpload.storageId,
          }
        : {}),
    });

    return NextResponse.json({ certificate: updated ? enrichCertificate(updated) : null });
  } catch (error) {
    await sendSiteNotification({
      subject: "Site error: certificate upload failed",
      message: error instanceof Error ? error.message : "Unknown certificate upload error.",
    });
    return NextResponse.json({ error: "Unable to upload certificate assets." }, { status: 500 });
  }
}

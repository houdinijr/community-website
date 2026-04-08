import { NextResponse } from "next/server";

import { getCurrentSession } from "@/lib/auth";
import {
  buildCertificateRecord,
  createCertificate,
  createCertificateId,
  listCertificates,
} from "@/lib/certificates";
import { getAppUrl } from "@/lib/env";
import { generateQrCodeDataUrl } from "@/lib/qr";
import { sendSiteNotification } from "@/lib/site-notifications";

type CertificateInput = {
  fullName?: string;
  role?: string;
  idNumber?: string;
  studyYear?: string;
  college?: string;
  department?: string;
  date?: string;
};

function isValidIdNumber(value: string) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 200000 && parsed <= 300000;
}

export async function GET() {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const certificates = await listCertificates();
    return NextResponse.json({ certificates });
  } catch {
    return NextResponse.json({ error: "Unable to load certificates." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session) {
    await sendSiteNotification({
      subject: "Site alert: unauthorized certificate creation attempt",
      message: "Someone attempted to create a certificate without an active admin session.",
    });
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as CertificateInput;
    const fullName = body.fullName?.trim();
    const role = body.role?.trim();
    const idNumber = body.idNumber?.trim();
    const studyYear = body.studyYear?.trim();
    const college = body.college?.trim();
    const department = body.department?.trim();
    const date = body.date?.trim();

    if (!fullName || !role || !idNumber || !studyYear || !college || !department || !date) {
      await sendSiteNotification({
        subject: "Site alert: certificate creation rejected",
        message: "Certificate creation was rejected because required fields were missing.",
        metadata: { fullName, role, idNumber, studyYear, college, department, date },
      });
      return NextResponse.json({ error: "All certificate fields are required." }, { status: 400 });
    }

    const nameCount = fullName.split(/\s+/).filter(Boolean).length;
    if (nameCount < 2) {
      return NextResponse.json({ error: "Full name must contain at least first name and last name." }, { status: 400 });
    }

    if (!isValidIdNumber(idNumber)) {
      return NextResponse.json({ error: "ID Number must be a number between 200000 and 300000." }, { status: 400 });
    }

    const certificateId = createCertificateId();
    const certificateUrl = `${getAppUrl()}/certificate/${certificateId}`;
    const qrCodeDataUrl = await generateQrCodeDataUrl(certificateUrl);

    const certificate = buildCertificateRecord({
      certificateId,
      fullName,
      role,
      idNumber,
      studyYear,
      college,
      department,
      date,
      qrCodeDataUrl,
    });

    await createCertificate(certificate);

    await sendSiteNotification({
      subject: "Site info: certificate record created",
      message: "A secure certificate record was created successfully.",
      metadata: {
        certificateId,
        fullName: certificate.fullName,
        role: certificate.role,
        idNumber: certificate.idNumber,
        college: certificate.college,
        department: certificate.department,
        status: certificate.status,
      },
    });

    return NextResponse.json(
      {
        certificate: {
          ...certificate,
          hashStatus: "valid",
          isHashValid: true,
          publicStatusLabel: "Pending Upload",
        },
      },
      { status: 201 },
    );
  } catch (error) {
    await sendSiteNotification({
      subject: "Site error: certificate creation failed",
      message: error instanceof Error ? error.message : "Unknown certificate creation error.",
    });
    return NextResponse.json({ error: "Unable to create certificate." }, { status: 500 });
  }
}

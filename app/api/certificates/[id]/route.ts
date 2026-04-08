import { NextResponse } from "next/server";

import { getCurrentSession } from "@/lib/auth";
import { deleteCertificate } from "@/lib/certificates";
import { sendSiteNotification } from "@/lib/site-notifications";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  const certificateId = String(id || "").trim();

  if (!certificateId) {
    return NextResponse.json({ error: "Certificate ID is required." }, { status: 400 });
  }

  try {
    const deleted = await deleteCertificate(certificateId);

    if (!deleted) {
      return NextResponse.json({ error: "Certificate not found." }, { status: 404 });
    }

    await sendSiteNotification({
      subject: "Site info: certificate profile deleted",
      message: "An admin deleted a certificate profile and its uploaded assets.",
      metadata: { certificateId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    await sendSiteNotification({
      subject: "Site error: certificate delete failed",
      message: error instanceof Error ? error.message : "Unknown certificate delete error.",
      metadata: { certificateId },
    });

    return NextResponse.json({ error: "Unable to delete certificate." }, { status: 500 });
  }
}

import { NextResponse } from "next/server";

import { getCurrentSession } from "@/lib/auth";
import { getSiteContent, saveSiteContent } from "@/lib/site-content-store";

export async function GET() {
  try {
    const content = await getSiteContent();
    return NextResponse.json({ content });
  } catch {
    return NextResponse.json({ error: "Unable to load content." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const payload = await request.json();
    const content = await saveSiteContent(payload);
    return NextResponse.json({ content });
  } catch {
    return NextResponse.json({ error: "Unable to save content." }, { status: 500 });
  }
}

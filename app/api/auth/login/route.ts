import { NextResponse } from "next/server";

import {
  createSessionToken,
  ensureDefaultAdmin,
  findUserByEmail,
  setSessionCookie,
  verifyPassword,
} from "@/lib/auth";
import { sendSiteNotification } from "@/lib/site-notifications";

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let email = "";
    let password = "";

    if (contentType.includes("application/json")) {
      const body = await request.json();
      email = String(body.email || "").trim().toLowerCase();
      password = String(body.password || "");
    } else {
      const formData = await request.formData();
      email = String(formData.get("email") || "").trim().toLowerCase();
      password = String(formData.get("password") || "");
    }

    if (!email || !password) {
      await sendSiteNotification({
        subject: "Site alert: admin login rejected",
        message: "An admin login attempt was rejected because required credentials were missing.",
        metadata: { email },
      });
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    await ensureDefaultAdmin();
    const user = await findUserByEmail(email);

    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      await sendSiteNotification({
        subject: "Site alert: admin login failed",
        message: "An admin login attempt failed.",
        metadata: { email },
      });
      return NextResponse.json({ error: "Invalid login credentials." }, { status: 401 });
    }

    const token = await createSessionToken(user.email);
    await setSessionCookie(token);

    await sendSiteNotification({
      subject: "Site info: admin login successful",
      message: "An admin has successfully logged in.",
      metadata: { email: user.email },
    });

    if (contentType.includes("application/json")) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.redirect(new URL("/admin/dashboard", request.url), { status: 303 });
  } catch (error) {
    await sendSiteNotification({
      subject: "Site error: admin login route failed",
      message: error instanceof Error ? error.message : "Unknown admin login error.",
    });

    return NextResponse.json(
      { error: "Server configuration issue. Check environment settings and try again." },
      { status: 503 },
    );
  }
}

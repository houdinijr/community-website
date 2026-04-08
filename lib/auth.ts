import { cookies } from "next/headers";
import { createHash, randomBytes, scryptSync, timingSafeEqual } from "crypto";

import { getDatabase } from "@/lib/db";
import { canUseLocalFallback } from "@/lib/env";
import { findLocalUserByEmail, upsertLocalUser } from "@/lib/local-store";

const SESSION_COOKIE = "community_admin_session";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 12;

type SessionPayload = {
  email: string;
  exp: number;
};

export type StoredUser = {
  email: string;
  name: string;
  role: string;
  passwordHash: string;
  createdAt: Date | string;
  updatedAt: Date | string;
};

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("Missing SESSION_SECRET environment variable.");
  }
  return secret;
}

function toBase64Url(value: string) {
  return Buffer.from(value).toString("base64url");
}

function fromBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(value: string) {
  return createHash("sha256").update(`${value}.${getSecret()}`).digest("hex");
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) {
    return false;
  }

  const derived = scryptSync(password, salt, 64);
  const existing = Buffer.from(hash, "hex");

  return derived.length === existing.length && timingSafeEqual(derived, existing);
}

export async function createSessionToken(email: string) {
  const payload: SessionPayload = {
    email,
    exp: Date.now() + SESSION_DURATION_MS,
  };
  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signature = sign(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export async function verifySessionToken(token: string) {
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) {
    return null;
  }

  if (sign(encodedPayload) !== signature) {
    return null;
  }

  try {
    const payload = JSON.parse(fromBase64Url(encodedPayload)) as SessionPayload;
    if (payload.exp < Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(Date.now() + SESSION_DURATION_MS),
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }

  return verifySessionToken(token);
}

async function upsertMongoUser(user: StoredUser) {
  const db = await getDatabase();
  const users = db.collection<StoredUser>("users");
  await users.updateOne(
    { email: user.email },
    {
      $set: {
        name: user.name,
        role: user.role,
        passwordHash: user.passwordHash,
        updatedAt: user.updatedAt,
      },
      $setOnInsert: {
        createdAt: user.createdAt,
      },
    },
    { upsert: true },
  );
  return users.findOne({ email: user.email });
}

export async function findUserByEmail(email: string) {
  try {
    const db = await getDatabase();
    return db.collection<StoredUser>("users").findOne({ email });
  } catch (error) {
    if (!canUseLocalFallback()) {
      throw error;
    }

    return findLocalUserByEmail(email);
  }
}

export async function ensureDefaultAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    return null;
  }

  const passwordHash = await hashPassword(adminPassword);
  const now = new Date();
  const admin: StoredUser = {
    email: adminEmail,
    name: "Community Administrator",
    role: "Super Admin",
    passwordHash,
    createdAt: now,
    updatedAt: now,
  };

  try {
    const mongoUser = await upsertMongoUser(admin);
    if (mongoUser) {
      return mongoUser;
    }
  } catch (error) {
    if (!canUseLocalFallback()) {
      throw error;
    }
  }

  await upsertLocalUser({
    email: admin.email,
    name: admin.name,
    role: admin.role,
    passwordHash: admin.passwordHash,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  });

  return findLocalUserByEmail(admin.email);
}

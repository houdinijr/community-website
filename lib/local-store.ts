import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

import type { CertificateRecord } from "@/lib/certificates";
import type { SiteContent } from "@/data/site-content";

export type LocalUserRecord = {
  email: string;
  name: string;
  role: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
};

const DATA_DIR = path.join(process.cwd(), "data", "runtime");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const CERTIFICATES_FILE = path.join(DATA_DIR, "certificates.json");
const CONTENT_FILE = path.join(DATA_DIR, "content.json");

async function ensureDir() {
  await mkdir(DATA_DIR, { recursive: true });
}

async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const raw = await readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJsonFile<T>(filePath: string, value: T) {
  await ensureDir();
  await writeFile(filePath, JSON.stringify(value, null, 2), "utf8");
}

export async function getLocalUsers() {
  await ensureDir();
  return readJsonFile<LocalUserRecord[]>(USERS_FILE, []);
}

export async function findLocalUserByEmail(email: string) {
  const users = await getLocalUsers();
  return users.find((user) => user.email === email) || null;
}

export async function upsertLocalUser(user: LocalUserRecord) {
  const users = await getLocalUsers();
  const index = users.findIndex((entry) => entry.email === user.email);

  if (index >= 0) {
    users[index] = user;
  } else {
    users.push(user);
  }

  await writeJsonFile(USERS_FILE, users);
  return user;
}

export async function getLocalCertificates() {
  await ensureDir();
  return readJsonFile<CertificateRecord[]>(CERTIFICATES_FILE, []);
}

export async function findLocalCertificateById(certificateId: string) {
  const certificates = await getLocalCertificates();
  return certificates.find((certificate) => certificate.certificateId === certificateId) || null;
}

export async function insertLocalCertificate(certificate: CertificateRecord) {
  const certificates = await getLocalCertificates();
  certificates.unshift(certificate);
  await writeJsonFile(CERTIFICATES_FILE, certificates);
  return certificate;
}

export async function updateLocalCertificate(
  certificateId: string,
  updater: (certificate: CertificateRecord) => CertificateRecord,
) {
  const certificates = await getLocalCertificates();
  const index = certificates.findIndex((certificate) => certificate.certificateId === certificateId);

  if (index < 0) {
    return null;
  }

  certificates[index] = updater(certificates[index]);
  await writeJsonFile(CERTIFICATES_FILE, certificates);
  return certificates[index];
}

export async function deleteLocalCertificate(certificateId: string) {
  const certificates = await getLocalCertificates();
  const index = certificates.findIndex((certificate) => certificate.certificateId === certificateId);

  if (index < 0) {
    return null;
  }

  const [removed] = certificates.splice(index, 1);
  await writeJsonFile(CERTIFICATES_FILE, certificates);
  return removed;
}

export async function getLocalContent() {
  await ensureDir();
  return readJsonFile<SiteContent | null>(CONTENT_FILE, null);
}

export async function upsertLocalContent(content: SiteContent) {
  await writeJsonFile(CONTENT_FILE, content);
  return content;
}

import { createHash } from "crypto";

export type CertificateHashInput = {
  fullName: string;
  role: string;
  idNumber: string;
  studyYear: string;
  college: string;
  department: string;
  date: string;
};

function normalizeValue(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function buildNormalizedFullName(parts: {
  firstName: string;
  middleName?: string;
  lastName: string;
}) {
  return [parts.firstName, parts.middleName || "", parts.lastName]
    .map(normalizeValue)
    .filter(Boolean)
    .join(" ");
}

export function getCertificateHashSecret() {
  const secret = process.env.CERTIFICATE_HASH_SECRET;
  if (!secret) {
    throw new Error("Missing CERTIFICATE_HASH_SECRET environment variable.");
  }
  return secret;
}

export function generateCertificateHash(input: CertificateHashInput) {
  const payload = [
    normalizeValue(input.fullName),
    normalizeValue(input.role),
    normalizeValue(input.idNumber),
    normalizeValue(input.studyYear),
    normalizeValue(input.college),
    normalizeValue(input.department),
    normalizeValue(input.date),
    getCertificateHashSecret(),
  ].join("");

  return createHash("sha256").update(payload).digest("hex");
}

export function isCertificateHashValid(input: CertificateHashInput, storedHash: string) {
  return generateCertificateHash(input) === storedHash;
}

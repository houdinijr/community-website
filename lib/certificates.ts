import { getDatabase } from "@/lib/db";
import {
  buildNormalizedFullName,
  generateCertificateHash,
  isCertificateHashValid,
} from "@/lib/certificate-security";
import { canUseLocalFallback } from "@/lib/env";
import { deleteUploadedFile } from "@/lib/file-storage";
import {
  deleteLocalCertificate,
  findLocalCertificateById,
  getLocalCertificates,
  insertLocalCertificate,
  updateLocalCertificate,
} from "@/lib/local-store";

export type CertificateStatus = "pending_upload" | "active";
export type HashStatus = "valid" | "invalid";

export type CertificateRecord = {
  certificateId: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  fullName: string;
  searchTerms?: string[];
  role: string;
  idNumber: string;
  studyYear: string;
  college: string;
  department: string;
  date: string;
  status: CertificateStatus;
  hash: string;
  qrCodeDataUrl: string;
  certificateFileUrl?: string;
  certificateFileName?: string;
  certificateFileType?: string;
  certificateFileStorageId?: string;
  personPhotoUrl?: string;
  personPhotoFileName?: string;
  personPhotoFileType?: string;
  personPhotoStorageId?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
};

export type CertificateView = CertificateRecord & {
  firstName: string;
  middleName: string;
  lastName: string;
  fullName: string;
  searchTerms: string[];
  hashStatus: HashStatus;
  isHashValid: boolean;
  publicStatusLabel: "Valid" | "Pending Upload";
};

function toMediaUrl(url?: string) {
  if (!url) {
    return undefined;
  }

  const match = url.match(/\/(?:uploads|media)\/certificates\/([^/?#]+)/i);
  if (match?.[1]) {
    return `/media/certificates/${match[1]}`;
  }

  return url;
}

export function createCertificateId() {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `CCZ-${year}-${random}`;
}

export function parseNameParts(fullName: string) {
  const parts = fullName.trim().split(/\s+/).map((part) => part.trim()).filter(Boolean);

  if (parts.length < 2) {
    throw new Error("Full name must include at least first name and last name.");
  }

  return {
    firstName: parts[0],
    middleName: parts.length > 2 ? parts.slice(1, -1).join(" ") : "",
    lastName: parts[parts.length - 1],
  };
}

function buildSearchTerms(parts: { firstName: string; middleName?: string; lastName: string }, idNumber: string) {
  return [parts.firstName, parts.middleName || "", parts.lastName, idNumber]
    .join(" ")
    .split(/\s+/)
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

function normalizeCertificate(certificate: CertificateRecord) {
  const nameParts = certificate.firstName && certificate.lastName
    ? {
        firstName: certificate.firstName,
        middleName: certificate.middleName || "",
        lastName: certificate.lastName,
      }
    : parseNameParts(certificate.fullName);

  const fullName = buildNormalizedFullName(nameParts);
  const searchTerms = certificate.searchTerms?.length
    ? certificate.searchTerms.map((term) => term.toLowerCase())
    : buildSearchTerms(nameParts, certificate.idNumber);

  return {
    ...certificate,
    firstName: nameParts.firstName,
    middleName: nameParts.middleName || "",
    lastName: nameParts.lastName,
    fullName,
    searchTerms,
    certificateFileUrl: toMediaUrl(certificate.certificateFileUrl),
    personPhotoUrl: toMediaUrl(certificate.personPhotoUrl),
  };
}

export function enrichCertificate(certificate: CertificateRecord): CertificateView {
  const normalized = normalizeCertificate(certificate);
  const isHashValid = isCertificateHashValid(
    {
      fullName: normalized.fullName,
      role: normalized.role,
      idNumber: normalized.idNumber,
      studyYear: normalized.studyYear,
      college: normalized.college,
      department: normalized.department,
      date: normalized.date,
    },
    normalized.hash,
  );

  return {
    ...normalized,
    isHashValid,
    hashStatus: isHashValid ? "valid" : "invalid",
    publicStatusLabel: normalized.status === "active" ? "Valid" : "Pending Upload",
  };
}

async function getMongoCollection() {
  const db = await getDatabase();
  const collection = db.collection<CertificateRecord>("certificates");
  await collection.createIndex({ certificateId: 1 }, { unique: true });
  await collection.createIndex({ idNumber: 1 });
  await collection.createIndex({ createdAt: -1 });
  await collection.createIndex({ fullName: 1 });
  await collection.createIndex({ firstName: 1 });
  await collection.createIndex({ middleName: 1 });
  await collection.createIndex({ lastName: 1 });
  await collection.createIndex({ searchTerms: 1 });
  return collection;
}

export async function getCertificateById(certificateId: string) {
  try {
    const collection = await getMongoCollection();
    const certificate = await collection.findOne({ certificateId });
    return certificate ? enrichCertificate(certificate) : null;
  } catch (error) {
    if (!canUseLocalFallback()) {
      throw error;
    }

    const certificate = await findLocalCertificateById(certificateId);
    return certificate ? enrichCertificate(certificate) : null;
  }
}

export async function getCertificateRecordById(certificateId: string) {
  try {
    const collection = await getMongoCollection();
    return collection.findOne({ certificateId });
  } catch (error) {
    if (!canUseLocalFallback()) {
      throw error;
    }

    return findLocalCertificateById(certificateId);
  }
}

export async function listCertificates() {
  try {
    const collection = await getMongoCollection();
    const certificates = await collection.find({}).sort({ createdAt: -1 }).toArray();
    return certificates.map(enrichCertificate);
  } catch (error) {
    if (!canUseLocalFallback()) {
      throw error;
    }

    const certificates = await getLocalCertificates();
    return certificates.map(enrichCertificate).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  }
}

export async function searchCertificates(query: string) {
  const normalized = query.trim();
  if (!normalized) {
    return [];
  }

  const tokens = normalized.split(/\s+/).map((token) => token.trim().toLowerCase()).filter(Boolean);

  try {
    const collection = await getMongoCollection();
    const certificates = await collection
      .find({
        $or: [
          { certificateId: { $regex: normalized, $options: "i" } },
          { idNumber: { $regex: normalized, $options: "i" } },
          ...(tokens.length ? [{ searchTerms: { $all: tokens } }] : []),
        ],
      })
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();

    return certificates.map(enrichCertificate);
  } catch (error) {
    if (!canUseLocalFallback()) {
      throw error;
    }

    const certificates = await getLocalCertificates();
    return certificates
      .filter((certificate) => {
        const certIdMatch = certificate.certificateId.toLowerCase().includes(normalized.toLowerCase());
        const idNumberMatch = certificate.idNumber.toLowerCase().includes(normalized.toLowerCase());
        const terms = (certificate.searchTerms || []).map((term) => term.toLowerCase());
        const tokenMatch = tokens.every((token) => terms.includes(token));
        return certIdMatch || idNumberMatch || tokenMatch;
      })
      .map(enrichCertificate)
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
      .slice(0, 20);
  }
}

export async function createCertificate(certificate: CertificateRecord) {
  try {
    const collection = await getMongoCollection();
    await collection.insertOne(certificate);
    return certificate;
  } catch (error) {
    if (!canUseLocalFallback()) {
      throw error;
    }

    return insertLocalCertificate(certificate);
  }
}

export async function attachCertificateAssets(input: {
  certificateId: string;
  certificateFileUrl?: string;
  certificateFileName?: string;
  certificateFileType?: string;
  certificateFileStorageId?: string;
  personPhotoUrl?: string;
  personPhotoFileName?: string;
  personPhotoFileType?: string;
  personPhotoStorageId?: string;
}) {
  const existing = await getCertificateRecordById(input.certificateId);
  if (!existing) {
    return null;
  }

  const nextCertificateFileUrl = input.certificateFileUrl ?? existing.certificateFileUrl;
  const update = {
    ...(input.certificateFileUrl
      ? {
          certificateFileUrl: input.certificateFileUrl,
          certificateFileName: input.certificateFileName,
          certificateFileType: input.certificateFileType,
          certificateFileStorageId: input.certificateFileStorageId,
        }
      : {}),
    ...(input.personPhotoUrl
      ? {
          personPhotoUrl: input.personPhotoUrl,
          personPhotoFileName: input.personPhotoFileName,
          personPhotoFileType: input.personPhotoFileType,
          personPhotoStorageId: input.personPhotoStorageId,
        }
      : {}),
    status: nextCertificateFileUrl ? "active" as const : existing.status,
    updatedAt: new Date(),
  };

  try {
    const collection = await getMongoCollection();
    await collection.updateOne({ certificateId: input.certificateId }, { $set: update });
    return collection.findOne({ certificateId: input.certificateId });
  } catch (error) {
    if (!canUseLocalFallback()) {
      throw error;
    }

    return updateLocalCertificate(input.certificateId, (certificate) => ({ ...certificate, ...update }));
  }
}

export async function deleteCertificate(certificateId: string) {
  const existing = await getCertificateRecordById(certificateId);
  if (!existing) {
    return false;
  }

  try {
    const collection = await getMongoCollection();
    await collection.deleteOne({ certificateId });
  } catch (error) {
    if (!canUseLocalFallback()) {
      throw error;
    }

    await deleteLocalCertificate(certificateId);
  }

  await deleteUploadedFile({
    directory: "certificates",
    storageId: existing.certificateFileStorageId,
    url: existing.certificateFileUrl,
  });
  await deleteUploadedFile({
    directory: "certificates",
    storageId: existing.personPhotoStorageId,
    url: existing.personPhotoUrl,
  });
  return true;
}

export function buildCertificateRecord(input: {
  certificateId: string;
  fullName: string;
  role: string;
  idNumber: string;
  studyYear: string;
  college: string;
  department: string;
  date: string;
  qrCodeDataUrl: string;
}): CertificateRecord {
  const nameParts = parseNameParts(input.fullName);
  const fullName = buildNormalizedFullName(nameParts);
  const now = new Date();

  return {
    certificateId: input.certificateId,
    firstName: nameParts.firstName,
    middleName: nameParts.middleName,
    lastName: nameParts.lastName,
    fullName,
    searchTerms: buildSearchTerms(nameParts, input.idNumber),
    role: input.role,
    idNumber: input.idNumber,
    studyYear: input.studyYear,
    college: input.college,
    department: input.department,
    date: input.date,
    status: "pending_upload",
    hash: generateCertificateHash({
      fullName,
      role: input.role,
      idNumber: input.idNumber,
      studyYear: input.studyYear,
      college: input.college,
      department: input.department,
      date: input.date,
    }),
    qrCodeDataUrl: input.qrCodeDataUrl,
    createdAt: now,
    updatedAt: now,
  };
}

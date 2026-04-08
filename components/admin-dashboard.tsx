"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, ReactNode, useMemo, useState } from "react";

type Certificate = {
  certificateId: string;
  firstName: string;
  middleName: string;
  lastName: string;
  fullName: string;
  role: string;
  idNumber: string;
  studyYear: string;
  college: string;
  department: string;
  date: string;
  status: "pending_upload" | "active";
  hash: string;
  hashStatus: "valid" | "invalid";
  isHashValid: boolean;
  publicStatusLabel: "Valid" | "Pending Upload";
  qrCodeDataUrl: string;
  certificateFileUrl?: string;
  certificateFileName?: string;
  certificateFileType?: string;
  personPhotoUrl?: string;
  personPhotoFileName?: string;
  personPhotoFileType?: string;
};

type DashboardProps = {
  initialCertificates: Certificate[];
};

type UploadSelection = {
  certificateFile: File | null;
  personPhoto: File | null;
};

const initialForm = {
  fullName: "",
  role: "",
  idNumber: "",
  studyYear: "",
  college: "",
  department: "",
  date: "",
};

export function AdminDashboard({ initialCertificates }: DashboardProps) {
  const router = useRouter();
  const [certificates, setCertificates] = useState(initialCertificates);
  const [form, setForm] = useState(initialForm);
  const [selectedUploads, setSelectedUploads] = useState<Record<string, UploadSelection>>({});
  const [submitting, setSubmitting] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const latest = useMemo(() => certificates[0], [certificates]);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Unable to create certificate.");
      }

      setCertificates((current) => [payload.certificate, ...current]);
      setForm(initialForm);
      setSuccess(`Certificate ${payload.certificate.certificateId} created. Upload the final certificate and optional person photo to complete the public profile.`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Something went wrong while creating the certificate.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleAssetSelect(
    certificateId: string,
    field: keyof UploadSelection,
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0] || null;
    setSelectedUploads((current) => ({
      ...current,
      [certificateId]: {
        certificateFile: current[certificateId]?.certificateFile || null,
        personPhoto: current[certificateId]?.personPhoto || null,
        [field]: file,
      },
    }));
  }

  async function handleUpload(certificateId: string) {
    const upload = selectedUploads[certificateId];
    if (!upload?.certificateFile && !upload?.personPhoto) {
      setError("Choose the certificate file, the person photo, or both before uploading.");
      return;
    }

    setUploadingId(certificateId);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append("certificateId", certificateId);
      if (upload.certificateFile) {
        formData.append("file", upload.certificateFile);
      }
      if (upload.personPhoto) {
        formData.append("photo", upload.personPhoto);
      }

      const response = await fetch("/api/certificates/upload", {
        method: "POST",
        body: formData,
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Unable to upload the certificate assets.");
      }

      setCertificates((current) => current.map((certificate) => certificate.certificateId === certificateId ? payload.certificate : certificate));
      setSelectedUploads((current) => ({
        ...current,
        [certificateId]: { certificateFile: null, personPhoto: null },
      }));
      setSuccess(`Certificate ${certificateId} updated. Opening the public details page now.`);
      router.push(`/certificate/${certificateId}`);
      router.refresh();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Something went wrong while uploading the certificate assets.");
    } finally {
      setUploadingId(null);
    }
  }

  async function handleDelete(certificateId: string, fullName: string) {
    const confirmed = window.confirm(`Delete ${fullName} permanently? This will remove the profile and uploaded files from the server.`);
    if (!confirmed) {
      return;
    }

    setDeletingId(certificateId);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/certificates/${certificateId}`, {
        method: "DELETE",
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Unable to delete the certificate.");
      }

      setCertificates((current) => current.filter((certificate) => certificate.certificateId !== certificateId));
      setSelectedUploads((current) => {
        const next = { ...current };
        delete next[certificateId];
        return next;
      });
      setSuccess(`Certificate ${certificateId} was deleted completely from the server.`);
      router.refresh();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Something went wrong while deleting the certificate.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
      <section className="rounded-[2rem] bg-white p-6 shadow-soft sm:p-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-emerald">Certificate Office</p>
            <h2 className="mt-2 font-display text-2xl font-bold">Step 1: Create secure certificate record</h2>
          </div>
          <form action="/api/auth/logout" method="post">
            <button type="submit" className="rounded-full border border-brand-ink/10 px-4 py-2 text-sm font-semibold transition hover:bg-brand-ink hover:text-white">Log out</button>
          </form>
        </div>

        <form className="grid gap-4" onSubmit={handleCreate}>
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-brand-ink/80">Full name</span>
            <input required value={form.fullName} onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))} className="rounded-2xl border border-brand-ink/10 bg-brand-sand px-4 py-3 outline-none ring-0 transition focus:border-brand-emerald" placeholder="Example: Jean Mitonga Nkulu" />
            <span className="text-xs text-brand-ink/55">Enter at least first name and last name. A middle or post-name is optional.</span>
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-brand-ink/80">Role</span>
              <input required value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))} className="rounded-2xl border border-brand-ink/10 bg-brand-sand px-4 py-3 outline-none transition focus:border-brand-emerald" placeholder="Example: Parliament representative, Assembly leader, Community choir member" />
              <span className="text-xs text-brand-ink/55">Describe the service role the person held in the community, government, assembly, parliament, choir, or another community responsibility.</span>
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-brand-ink/80">Date of issue</span>
              <input required type="date" value={form.date} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} className="rounded-2xl border border-brand-ink/10 bg-brand-sand px-4 py-3 outline-none transition focus:border-brand-emerald" />
            </label>
          </div>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-brand-ink/80">ID Number</span>
            <input required inputMode="numeric" value={form.idNumber} onChange={(event) => setForm((current) => ({ ...current, idNumber: event.target.value }))} className="rounded-2xl border border-brand-ink/10 bg-brand-sand px-4 py-3 outline-none transition focus:border-brand-emerald" placeholder="Between 200000 and 300000" />
          </label>

          <div className="grid gap-4 md:grid-cols-3">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-brand-ink/80">Which year</span>
              <input required value={form.studyYear} onChange={(event) => setForm((current) => ({ ...current, studyYear: event.target.value }))} className="rounded-2xl border border-brand-ink/10 bg-brand-sand px-4 py-3 outline-none transition focus:border-brand-emerald" placeholder="Final Year" />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-brand-ink/80">College</span>
              <input required value={form.college} onChange={(event) => setForm((current) => ({ ...current, college: event.target.value }))} className="rounded-2xl border border-brand-ink/10 bg-brand-sand px-4 py-3 outline-none transition focus:border-brand-emerald" placeholder="College of Engineering" />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-brand-ink/80">Department</span>
              <input required value={form.department} onChange={(event) => setForm((current) => ({ ...current, department: event.target.value }))} className="rounded-2xl border border-brand-ink/10 bg-brand-sand px-4 py-3 outline-none transition focus:border-brand-emerald" placeholder="Computer Science" />
            </label>
          </div>

          <div className="rounded-[1.5rem] bg-brand-mist px-4 py-4 text-sm text-brand-ink/70">
            Generate the QR first, place it on the final certificate design, then come back for step 2 to upload the signed certificate file and the person photo for the public details page.
          </div>

          {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
          {success ? <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</p> : null}

          <button type="submit" disabled={submitting} className="rounded-full bg-brand-ink px-5 py-3 font-semibold text-white transition hover:bg-brand-emerald disabled:cursor-not-allowed disabled:opacity-70">
            {submitting ? "Generating secure record..." : "Generate QR and secure hash"}
          </button>
        </form>
      </section>

      <section className="grid gap-6">
        <div className="rounded-[2rem] bg-brand-ink p-6 text-white shadow-soft sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-gold">Latest QR Package</p>
              <p className="mt-2 text-sm text-white/70">Download the QR code immediately after secure record generation and place it on the final certificate before upload.</p>
            </div>
            {latest ? <a href={latest.qrCodeDataUrl} download={`${latest.certificateId}-qr.png`} className="inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-brand-ink transition hover:bg-brand-mist">Download QR code</a> : null}
          </div>
          {latest ? (
            <div className="mt-5 grid gap-5 sm:grid-cols-[1fr_160px] sm:items-center">
              <div className="space-y-2">
                <h3 className="font-display text-2xl font-bold">{latest.fullName}</h3>
                <p className="text-white/80">{latest.role}</p>
                <p className="text-sm text-white/70">ID Number: {latest.idNumber}</p>
                <p className="text-sm text-white/70">{latest.studyYear} • {latest.college}</p>
                <p className="text-sm text-white/70">{latest.department}</p>
                <p className="text-sm text-white/70">Certificate ID: {latest.certificateId}</p>
              </div>
              <div className="rounded-3xl bg-white p-3">
                <Image src={latest.qrCodeDataUrl} alt={`QR code for ${latest.certificateId}`} width={160} height={160} className="h-auto w-full" />
              </div>
            </div>
          ) : <p className="mt-4 text-white/75">No certificates created yet.</p>}
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-soft sm:p-8">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-xl font-bold">Certificates</h3>
            <span className="rounded-full bg-brand-mist px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand-emerald">{certificates.length} records</span>
          </div>
          <div className="space-y-4">
            {certificates.map((certificate) => {
              const selectedUpload = selectedUploads[certificate.certificateId] || { certificateFile: null, personPhoto: null };
              const isUploading = uploadingId === certificate.certificateId;
              const isDeleting = deletingId === certificate.certificateId;

              return (
                <div key={certificate.certificateId} className="rounded-3xl border border-brand-ink/10 px-4 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{certificate.fullName}</p>
                      <p className="text-sm text-brand-ink/65">{certificate.role}</p>
                      <p className="mt-1 text-sm text-brand-ink/65">ID Number: {certificate.idNumber}</p>
                      <p className="mt-1 text-sm text-brand-ink/65">{certificate.studyYear} • {certificate.college}</p>
                      <p className="mt-1 text-sm text-brand-ink/65">{certificate.department}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-brand-ink/45">{certificate.certificateId}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge tone={certificate.status === "active" ? "green" : "amber"}>{certificate.status}</Badge>
                      <Badge tone={certificate.hashStatus === "valid" ? "green" : "red"}>hash {certificate.hashStatus}</Badge>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3 text-sm">
                    <a href={certificate.qrCodeDataUrl} download={`${certificate.certificateId}-qr.png`} className="rounded-full bg-brand-ink px-4 py-2 font-semibold text-white transition hover:bg-brand-emerald">Download QR code</a>
                    <a href={`/certificate/${certificate.certificateId}`} target="_blank" rel="noreferrer" className="rounded-full border border-brand-ink/10 px-4 py-2 font-semibold text-brand-emerald">Public page</a>
                    {certificate.certificateFileUrl ? <a href={certificate.certificateFileUrl} target="_blank" rel="noreferrer" className="rounded-full border border-brand-ink/10 px-4 py-2 font-semibold text-brand-ink">View certificate</a> : null}
                    {certificate.personPhotoUrl ? <span className="rounded-full bg-emerald-50 px-4 py-2 font-semibold text-emerald-700">Photo ready</span> : null}
                    <button type="button" onClick={() => handleDelete(certificate.certificateId, certificate.fullName)} disabled={isDeleting} className="rounded-full border border-red-200 bg-red-50 px-4 py-2 font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-70">
                      {isDeleting ? "Deleting..." : "Delete profile"}
                    </button>
                  </div>

                  <div className="mt-4 grid gap-4 rounded-[1.5rem] bg-brand-sand/70 p-4">
                    <div className="grid gap-4 lg:grid-cols-2">
                      <label className="grid gap-2">
                        <span className="text-sm font-semibold text-brand-ink/80">Step 2A: Upload final certificate file</span>
                        <input type="file" accept=".pdf,image/png,image/jpeg,image/webp" onChange={(event) => handleAssetSelect(certificate.certificateId, "certificateFile", event)} className="rounded-2xl border border-brand-ink/10 bg-white px-4 py-3 text-sm" />
                        <span className="text-xs text-brand-ink/55">Upload the certificate after placing the QR code on the final design.</span>
                      </label>

                      <label className="grid gap-2">
                        <span className="text-sm font-semibold text-brand-ink/80">Step 2B: Upload person photo</span>
                        <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => handleAssetSelect(certificate.certificateId, "personPhoto", event)} className="rounded-2xl border border-brand-ink/10 bg-white px-4 py-3 text-sm" />
                        <span className="text-xs text-brand-ink/55">This photo is shown on the public details page above the certificate details, not on the certificate file itself.</span>
                      </label>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.25rem] border border-brand-ink/10 bg-white px-4 py-4">
                      <div className="text-sm text-brand-ink/65">
                        <p>{selectedUpload.certificateFile ? `Certificate file selected: ${selectedUpload.certificateFile.name}` : "No certificate file selected yet."}</p>
                        <p className="mt-1">{selectedUpload.personPhoto ? `Person photo selected: ${selectedUpload.personPhoto.name}` : "No person photo selected yet."}</p>
                      </div>
                      <button type="button" onClick={() => handleUpload(certificate.certificateId)} disabled={(!selectedUpload.certificateFile && !selectedUpload.personPhoto) || isUploading} className="rounded-full bg-brand-ink px-5 py-3 font-semibold text-white transition hover:bg-brand-emerald disabled:cursor-not-allowed disabled:opacity-70">
                        {isUploading ? "Uploading..." : certificate.certificateFileUrl ? "Update assets and open page" : "Upload assets and open page"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

function Badge({ children, tone }: { children: ReactNode; tone: "green" | "amber" | "red" }) {
  const classes = {
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
  };

  return <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${classes[tone]}`}>{children}</span>;
}

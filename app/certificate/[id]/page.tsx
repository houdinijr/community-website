import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getCertificateById } from "@/lib/certificates";

export default async function CertificatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const certificate = await getCertificateById(id);

  if (!certificate) {
    notFound();
  }

  const hasPreview = Boolean(certificate.certificateFileUrl);
  const isPdf = certificate.certificateFileType === "application/pdf";
  const isVerified = certificate.isHashValid;
  const initials = `${certificate.firstName?.[0] || ""}${certificate.lastName?.[0] || ""}`.toUpperCase() || "CC";
  const honorific = certificate.role.toLowerCase().includes("madam") || certificate.role.toLowerCase().includes("women") ? "Madame" : "Mr";
  const recognitionMessage = `Proudly to recognize you ${honorific} ${certificate.fullName} for devotion and service as ${certificate.role} for our Congolese community, forever in our hearts.`;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(28,117,188,0.14),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(220,20,60,0.1),transparent_28%),linear-gradient(180deg,#f5fbff_0%,#fcfdff_46%,#eef6ff_100%)] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] bg-white/85 px-5 py-4 shadow-soft backdrop-blur">
          <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-brand-ink/70">
            <span className="rounded-full bg-brand-yellow px-3 py-1 text-brand-blue">Certificate Profile</span>
            <span>{certificate.certificateId}</span>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/" className="rounded-full bg-brand-blue px-5 py-3 font-semibold text-white transition hover:bg-brand-red">Home</Link>
            <Link href="/verify" className="rounded-full border border-brand-ink/10 px-5 py-3 font-semibold text-brand-ink transition hover:bg-white">Verify Certificate</Link>
          </div>
        </div>

        <section className="overflow-hidden rounded-[2.5rem] border border-white/70 bg-white shadow-soft">
          <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[0.95fr_1.05fr] lg:p-10 xl:p-12">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-brand-mist px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-brand-blue">Certificate Verification Office</span>
                <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] ${isVerified ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" : "bg-red-50 text-red-700 ring-1 ring-red-200"}`}>
                  <span className={`h-2.5 w-2.5 rounded-full ${isVerified ? "bg-emerald-500" : "bg-red-500"}`} />
                  {isVerified ? "Verified Authentic Certificate" : "Warning: Certificate may be tampered"}
                </span>
              </div>

              <div className="overflow-hidden rounded-[2rem] border border-brand-ink/10 bg-brand-sand shadow-soft">
                {certificate.personPhotoUrl ? (
                  <Image src={certificate.personPhotoUrl} alt={`Portrait of ${certificate.fullName}`} width={520} height={620} className="h-[360px] w-full object-cover sm:h-[420px]" unoptimized />
                ) : (
                  <div className="flex h-[360px] w-full items-center justify-center bg-[linear-gradient(180deg,#efe3cb_0%,#f7f1e7_100%)] text-7xl font-bold text-brand-blue sm:h-[420px]">{initials}</div>
                )}
              </div>

              <div className="rounded-[2rem] border border-brand-ink/10 bg-brand-sand/55 p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-blue">Person details</p>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <DetailCard label="Full Name" value={certificate.fullName} strong />
                  <DetailCard label="Role of Service" value={certificate.role} />
                  <DetailCard label="Certificate ID" value={certificate.certificateId} />
                  <DetailCard label="ID Number" value={certificate.idNumber} />
                  <DetailCard label="Which Year" value={certificate.studyYear} />
                  <DetailCard label="College" value={certificate.college} />
                  <DetailCard label="Department" value={certificate.department} />
                  <DetailCard label="Date of Issue" value={certificate.date} />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-blue">Honoured Community Record</p>
                <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-brand-ink sm:text-5xl xl:text-6xl">{certificate.fullName}</h1>
                <p className="mt-4 max-w-3xl text-lg leading-8 text-brand-ink/75">{recognitionMessage}</p>
              </div>

              <div className="flex flex-wrap gap-3">
                <span className="rounded-full bg-brand-blue px-4 py-2 text-sm font-semibold text-white">Status: {certificate.publicStatusLabel}</span>
                <span className="rounded-full border border-brand-ink/10 px-4 py-2 text-sm font-semibold text-brand-ink">Certificate ID: {certificate.certificateId}</span>
                <span className="rounded-full border border-brand-yellow/30 bg-brand-yellow/20 px-4 py-2 text-sm font-semibold text-brand-blue">Hash: {certificate.hashStatus}</span>
              </div>

              <section className={`rounded-[2rem] border p-6 shadow-soft sm:p-8 ${isVerified ? "border-emerald-200 bg-emerald-50/75" : "border-red-200 bg-red-50/75"}`}>
                <p className={`text-sm font-semibold uppercase tracking-[0.22em] ${isVerified ? "text-emerald-700" : "text-red-700"}`}>Integrity check</p>
                <p className={`mt-3 text-sm leading-7 ${isVerified ? "text-emerald-900/90" : "text-red-900/90"}`}>
                  {isVerified ? "The stored person details, role, study information, and issue date match the secure anti-fraud signature created when this certificate was issued." : "The stored record no longer matches the secure anti-fraud signature. This certificate should be reviewed carefully before it is trusted."}
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link href="/verify" className="rounded-full bg-brand-blue px-5 py-3 font-semibold text-white transition hover:bg-brand-red">Search certificates</Link>
                  <Link href="/" className="rounded-full border border-brand-ink/10 px-5 py-3 font-semibold text-brand-ink transition hover:bg-brand-sand">Back to homepage</Link>
                  {certificate.certificateFileUrl ? (
                    <a href={`/download/certificate/${certificate.certificateId}`} className="rounded-full border border-brand-red/25 bg-brand-red px-5 py-3 font-semibold text-white transition hover:brightness-110">Download certificate</a>
                  ) : null}
                </div>
              </section>

              <section className="rounded-[2rem] border border-brand-ink/10 bg-white p-5 shadow-soft sm:p-6 lg:p-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="font-display text-3xl font-bold text-brand-ink">Official certificate preview</h2>
                    <p className="mt-2 text-brand-ink/70">The profile opens first with the person details. The certificate downloads only when you click the download button.</p>
                  </div>
                </div>

                {hasPreview ? (
                  <div className="mt-6 overflow-hidden rounded-[1.75rem] border border-brand-ink/10 bg-brand-sand/35 shadow-soft">
                    {isPdf ? (
                      <div className="flex min-h-[360px] flex-col items-center justify-center gap-5 bg-white px-6 py-10 text-center">
                        <div className="rounded-full bg-brand-mist px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-brand-blue">PDF certificate ready</div>
                        <p className="max-w-xl text-base leading-7 text-brand-ink/72">
                          This certificate is stored as a PDF. To avoid automatic downloads, the profile page opens first and the document will be downloaded only when you click the download button above.
                        </p>
                        <a href={certificate.certificateFileUrl} target="_blank" rel="noreferrer" className="rounded-full border border-brand-ink/10 px-5 py-3 font-semibold text-brand-ink transition hover:bg-brand-sand">Open PDF preview in new tab</a>
                      </div>
                    ) : (
                      <div className="relative min-h-[700px] bg-white">
                        <Image src={certificate.certificateFileUrl!} alt={`Certificate file for ${certificate.fullName}`} fill className="object-contain" unoptimized />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-6 rounded-[1.75rem] border border-dashed border-brand-ink/15 bg-brand-sand/45 px-5 py-8 text-brand-ink/65">The certificate file has not been uploaded yet. The final preview will appear here automatically once the certificate is uploaded.</div>
                )}
              </section>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function DetailCard({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="rounded-[1.25rem] border border-brand-ink/10 bg-white px-5 py-5">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-ink/55">{label}</p>
      <p className={`mt-3 text-lg text-brand-ink ${strong ? "font-bold" : "font-semibold"}`}>{value}</p>
    </div>
  );
}

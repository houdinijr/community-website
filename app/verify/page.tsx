import Link from "next/link";

import { SectionHeading } from "@/components/section-heading";
import { SiteShell } from "@/components/site-shell";
import { searchCertificates } from "@/lib/certificates";

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  const certificates = query ? await searchCertificates(query) : [];

  return (
    <SiteShell>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <SectionHeading
          eyebrow="Public Verification"
          title="Search by certificate ID, ID Number, or any name"
          description="Open the profile first, review the person details, and download the certificate only when you explicitly choose to do so."
        />

        <form className="mt-10 grid gap-4 rounded-[2rem] bg-white p-6 shadow-soft md:grid-cols-[1fr_auto] md:items-end">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-brand-ink/80">Search</span>
            <input
              name="q"
              defaultValue={query}
              placeholder="Examples: 245876, Jean, Jean Nkulu, CCZ-2026-AB12CD"
              className="rounded-2xl border border-brand-ink/10 bg-brand-sand px-4 py-3 outline-none transition focus:border-brand-blue"
            />
          </label>
          <button type="submit" className="rounded-full bg-brand-red px-6 py-3 font-semibold text-white transition hover:brightness-110">
            Search certificates
          </button>
        </form>

        {query ? (
          <div className="mt-10 space-y-4">
            {certificates.length ? (
              certificates.map((certificate) => (
                <article key={certificate.certificateId} className="rounded-[2rem] bg-white p-6 shadow-soft">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="font-display text-2xl font-bold text-brand-ink">{certificate.fullName}</h3>
                      <p className="mt-2 text-brand-ink/70">{certificate.role}</p>
                      <p className="mt-1 text-brand-ink/70">ID Number: {certificate.idNumber}</p>
                      <p className="mt-1 text-brand-ink/70">{certificate.studyYear} • {certificate.college}</p>
                      <p className="mt-1 text-brand-ink/70">{certificate.department}</p>
                      <p className="mt-2 text-sm uppercase tracking-[0.18em] text-brand-ink/45">{certificate.certificateId}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${certificate.status === "active" ? "bg-brand-yellow text-brand-blue" : "bg-amber-50 text-amber-700"}`}>
                        {certificate.publicStatusLabel}
                      </span>
                    </div>
                  </div>
                  <div className="mt-5">
                    <Link href={`/certificate/${certificate.certificateId}`} prefetch={false} className="rounded-full bg-brand-blue px-5 py-3 font-semibold text-white transition hover:bg-brand-red">
                      Open certificate page
                    </Link>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-[2rem] bg-white px-6 py-10 text-brand-ink/70 shadow-soft">
                No matching certificates were found for <strong>{query}</strong>.
              </div>
            )}
          </div>
        ) : (
          <div className="mt-10 rounded-[2rem] bg-white px-6 py-10 text-brand-ink/70 shadow-soft">
            Enter a certificate ID, ID Number, or any part of a person&apos;s name to begin verification.
          </div>
        )}
      </section>
    </SiteShell>
  );
}

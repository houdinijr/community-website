import Link from "next/link";

export default function CertificateNotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-sand px-4">
      <div className="max-w-lg rounded-[2rem] bg-white p-8 text-center shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-emerald">
          Not Found
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold text-brand-ink">
          Certificate record not found
        </h1>
        <p className="mt-4 text-brand-ink/70">
          The certificate ID may be incorrect or the record is no longer available.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-full bg-brand-ink px-5 py-3 font-semibold text-white"
        >
          Return home
        </Link>
      </div>
    </main>
  );
}

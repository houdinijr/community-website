import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentSession } from "@/lib/auth";

export default async function AdminLoginPage() {
  const session = await getCurrentSession();
  if (session) {
    redirect("/admin/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-sand px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] bg-white shadow-soft lg:grid-cols-[0.9fr_1.1fr]">
        <div className="bg-brand-ink p-8 text-white sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-gold">
            Admin Access
          </p>
          <h1 className="mt-4 font-display text-4xl font-bold">
            Manage certificates with confidence
          </h1>
          <p className="mt-4 max-w-md text-white/75">
            Sign in to issue community certificates, generate QR codes automatically, and keep
            verification records secure in MongoDB.
          </p>
          <div className="mt-10 space-y-3 text-sm text-white/75">
            <p>Public verification route: `/certificate/[id]`</p>
            <p>Auto-generated status: Valid</p>
            <p>Every record gets a unique certificate ID</p>
          </div>
        </div>

        <div className="p-8 sm:p-10">
          <h2 className="font-display text-3xl font-bold text-brand-ink">Sign in</h2>
          <p className="mt-3 text-brand-ink/70">
            Use the admin email and password configured in your environment variables.
          </p>

          <form action="/api/auth/login" method="post" className="mt-8 grid gap-4">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-brand-ink/80">Email</span>
              <input
                name="email"
                type="email"
                required
                className="rounded-2xl border border-brand-ink/10 bg-brand-sand px-4 py-3 outline-none transition focus:border-brand-emerald"
                placeholder="jordimusul19@gmail.com"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-brand-ink/80">Password</span>
              <input
                name="password"
                type="password"
                required
                className="rounded-2xl border border-brand-ink/10 bg-brand-sand px-4 py-3 outline-none transition focus:border-brand-emerald"
                placeholder="Your secure password"
              />
            </label>

            <button
              type="submit"
              className="rounded-full bg-brand-ink px-5 py-3 font-semibold text-white transition hover:bg-brand-emerald"
            >
              Continue to dashboard
            </button>
          </form>

          <Link href="/" className="mt-6 inline-flex text-sm font-semibold text-brand-emerald">
            Return to public website
          </Link>
        </div>
      </div>
    </main>
  );
}

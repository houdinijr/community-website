import { redirect } from "next/navigation";

import { AdminDashboard } from "@/components/admin-dashboard";
import { getCurrentSession } from "@/lib/auth";
import { listCertificates } from "@/lib/certificates";

export default async function AdminDashboardPage() {
  const session = await getCurrentSession();
  if (!session) {
    redirect("/admin/login");
  }

  const certificates = await listCertificates();

  return (
    <main className="min-h-screen bg-brand-sand px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-blue">
              Welcome back
            </p>
            <h1 className="mt-3 font-display text-4xl font-bold text-brand-ink">
              Community records dashboard
            </h1>
            <p className="mt-3 max-w-2xl text-brand-ink/70">
              Generate secure certificate records first, then upload the signed PDF or image to activate public verification.
            </p>
          </div>
          <a href="/admin/content" className="rounded-full bg-brand-blue px-5 py-3 font-semibold text-white transition hover:bg-brand-red">
            Manage website content
          </a>
        </div>
        <AdminDashboard initialCertificates={JSON.parse(JSON.stringify(certificates))} />
      </div>
    </main>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";

import { ContentDashboard } from "@/components/content-dashboard";
import { getCurrentSession } from "@/lib/auth";
import { getSiteContent } from "@/lib/site-content-store";

export default async function AdminContentPage() {
  const session = await getCurrentSession();
  if (!session) {
    redirect("/admin/login");
  }

  const content = await getSiteContent();

  return (
    <main className="min-h-screen bg-brand-sand px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-blue">Admin Content</p>
            <h1 className="mt-3 font-display text-4xl font-bold text-brand-ink">Public website content manager</h1>
            <p className="mt-3 max-w-2xl text-brand-ink/70">Update the homepage, leadership names, member photos, activities, and latest news without editing code.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/dashboard" className="rounded-full border border-brand-ink/10 px-5 py-3 font-semibold text-brand-ink transition hover:bg-white">Certificate dashboard</Link>
            <Link href="/" className="rounded-full bg-brand-blue px-5 py-3 font-semibold text-white transition hover:bg-brand-red">View public site</Link>
          </div>
        </div>
        <ContentDashboard initialContent={content} />
      </div>
    </main>
  );
}

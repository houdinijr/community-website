import Image from "next/image";

import { SectionHeading } from "@/components/section-heading";
import { SiteShell } from "@/components/site-shell";
import { getSiteContent } from "@/lib/site-content-store";

export const dynamic = "force-dynamic";

export default async function MembersPage() {
  const content = await getSiteContent();

  return (
    <SiteShell>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mb-10 overflow-hidden rounded-[2rem] bg-brand-blue px-6 py-6 text-white shadow-soft sm:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="overflow-hidden rounded-full border-2 border-white/20 bg-white shadow-soft">
              <Image src="/images/cecau-logo.png" alt="CECAU logo" width={88} height={88} className="h-[88px] w-[88px] object-cover" unoptimized />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-yellow">CECAU Leadership</p>
              <h2 className="mt-2 font-display text-3xl font-bold">{content.currentMandate}</h2>
              <p className="mt-3 max-w-3xl text-white/82">A community of service, leadership, and faith-driven growth for Congolese students in Zimbabwe.</p>
            </div>
          </div>
        </div>

        <SectionHeading
          eyebrow="Members"
          title="Leadership and service teams"
          description="The community is strengthened by leaders and teams committed to spiritual care, student support, communication, and shared progress."
        />

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {content.leaders.map((leader, index) => (
            <article key={leader.name} className="rounded-[2rem] bg-white p-6 shadow-soft">
              {leader.photoUrl ? (
                <div className="overflow-hidden rounded-[1.5rem] border border-brand-ink/10 bg-brand-cloud">
                  <Image src={leader.photoUrl} alt={leader.name} width={420} height={280} className="h-[220px] w-full object-cover" unoptimized />
                </div>
              ) : (
                <div className={`flex h-16 w-16 items-center justify-center rounded-[1.4rem] text-lg font-bold ${index === 1 ? "bg-brand-yellow text-brand-blue" : "bg-brand-mist text-brand-blue"}`}>
                  {leader.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}
                </div>
              )}
              <h3 className="mt-5 font-display text-2xl font-bold text-brand-ink">{leader.name}</h3>
              <p className="mt-2 text-sm font-semibold uppercase tracking-[0.18em] text-brand-red">{leader.role}</p>
              <p className="mt-4 text-base leading-7 text-brand-ink/70">{leader.bio}</p>
            </article>
          ))}
        </div>

        <div className="mt-14 rounded-[2rem] bg-brand-blue px-6 py-8 text-white shadow-soft sm:px-8">
          <div className="mb-6">
            <h3 className="font-display text-2xl font-bold">Ministers and vice ministers</h3>
            <p className="mt-2 text-white/80">Each ministry role includes space for the current office holder photo and can be updated from the content admin dashboard.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {content.cabinetMembers.map((member) => (
              <article key={`${member.role}-${member.name}`} className="rounded-[1.5rem] border border-white/10 bg-white/8 p-4 backdrop-blur">
                <div className="overflow-hidden rounded-[1.25rem] bg-white/10">
                  {member.photoUrl ? (
                    <Image src={member.photoUrl} alt={member.name} width={320} height={220} className="h-[190px] w-full object-cover" unoptimized />
                  ) : (
                    <div className="flex h-[190px] items-center justify-center bg-white/6 text-sm text-white/72">Photo space</div>
                  )}
                </div>
                <h4 className="mt-4 font-display text-xl font-bold text-white">{member.name}</h4>
                <p className="mt-2 text-sm font-semibold uppercase tracking-[0.16em] text-brand-yellow">{member.role}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

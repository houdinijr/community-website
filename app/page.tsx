import Image from "next/image";
import Link from "next/link";

import { SectionHeading } from "@/components/section-heading";
import { SiteShell } from "@/components/site-shell";
import { getSiteContent } from "@/lib/site-content-store";

export default async function HomePage() {
  const content = await getSiteContent();

  return (
    <SiteShell>
      <section className="bg-hero-grid text-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-18 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:px-8 lg:py-24 xl:gap-16">
          <div>
            <div className="flex items-center gap-4">
              <div className="overflow-hidden rounded-full border-2 border-white/20 bg-white/95 shadow-soft ring-4 ring-white/10">
                <Image src="/images/cecau-logo.png" alt="CECAU logo" width={102} height={102} className="h-[102px] w-[102px] object-cover" unoptimized />
              </div>
              <div className="space-y-2">
                <span className="inline-flex rounded-full bg-white/14 px-4 py-2 text-sm font-semibold uppercase tracking-[0.24em] text-brand-yellow ring-1 ring-white/20">CECAU</span>
                <p className="text-sm uppercase tracking-[0.24em] text-white/72">Communauté des Étudiants Congolais à Africa University</p>
              </div>
            </div>
            <h1 className="mt-6 max-w-4xl font-display text-5xl font-bold tracking-tight sm:text-6xl xl:text-7xl">{content.heroTitle}</h1>
            <p className="mt-6 max-w-2xl text-xl leading-9 text-white/88">{content.heroSubtitle}</p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/activities" className="rounded-full bg-brand-red px-6 py-3 font-semibold text-white transition hover:brightness-110">Explore Activities</Link>
              <Link href="/members" className="rounded-full border border-white/24 bg-white/10 px-6 py-3 font-semibold text-white transition hover:bg-white/18">Meet the Community</Link>
            </div>
          </div>

          <div className="grid gap-5 self-end">
            <div className="card-surface rounded-[2rem] border border-white/18 p-6 text-brand-ink shadow-soft">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-blue">Welcome</p>
              <p className="mt-4 text-lg leading-8 text-brand-ink/82">{content.welcomeText}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-[1.75rem] bg-white/10 px-5 py-5 backdrop-blur ring-1 ring-white/14"><p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-yellow">Unity</p><p className="mt-3 text-sm leading-6 text-white/84">A shared home for Congolese students and families building belonging in Zimbabwe.</p></div>
              <div className="rounded-[1.75rem] bg-white/10 px-5 py-5 backdrop-blur ring-1 ring-white/14"><p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-yellow">Leadership</p><p className="mt-3 text-sm leading-6 text-white/84">Growing leaders who can serve, inspire, and strengthen others in Christ.</p></div>
              <div className="rounded-[1.75rem] bg-white/10 px-5 py-5 backdrop-blur ring-1 ring-white/14"><p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-yellow">Progress</p><p className="mt-3 text-sm leading-6 text-white/84">Creating opportunities for academic, spiritual, and social advancement together.</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2rem] bg-white p-8 shadow-soft">
            <SectionHeading eyebrow="Mission" title="Rooted in Christ, growing together with purpose" description={content.missionStatement} />
          </div>
          <div className="grid gap-6">
            <div className="rounded-[2rem] bg-brand-blue p-7 text-white shadow-soft">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-yellow">But</p>
              <ul className="mt-5 space-y-4 text-base leading-7 text-white/88">{content.goals.map((goal) => <li key={goal} className="flex gap-3"><span className="mt-2 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-brand-yellow" /><span>{goal}</span></li>)}</ul>
            </div>
            <div className="rounded-[2rem] bg-white p-7 shadow-soft">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-red">Accomplishments</p>
              <ul className="mt-5 space-y-4 text-base leading-7 text-brand-ink/78">{content.accomplishments.map((item) => <li key={item} className="flex gap-3"><span className="mt-2 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-brand-red" /><span>{item}</span></li>)}</ul>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        <SectionHeading eyebrow="Community Activities" title="The moments that shape our shared story" description="From certificate ceremonies to cultural celebrations and community projects, our activities create practical impact and meaningful belonging." />
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {content.activities.map((activity) => (
            <article key={activity.title} className="overflow-hidden rounded-[2rem] bg-white shadow-soft">
              <div className="grid grid-cols-3 gap-2 bg-brand-cloud p-3">
                {activity.images.map((image, index) => (
                  <div key={`${activity.title}-${index}`} className="relative h-28 overflow-hidden rounded-[1.2rem] bg-brand-mist">
                    <img src={image} alt={`${activity.title} gallery ${index + 1}`} className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
              <div className="p-6">
                <span className="rounded-full bg-brand-yellow px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-blue">{activity.date}</span>
                <h3 className="mt-4 font-display text-2xl font-bold text-brand-ink">{activity.title}</h3>
                <p className="mt-3 text-base leading-7 text-brand-ink/72">{activity.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Latest News" title="Announcements that keep the community informed" description="Important updates, leadership news, and moments of recognition are highlighted here for the whole community." />
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {content.latestNews.map((item) => (
            <article key={item.title} className="rounded-[2rem] bg-white p-6 shadow-soft transition hover:-translate-y-1">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-red">{item.date}</p>
              <h3 className="mt-4 font-display text-2xl font-bold text-brand-ink">{item.title}</h3>
              <p className="mt-3 text-base leading-7 text-brand-ink/70">{item.summary}</p>
            </article>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}

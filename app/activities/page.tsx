import Image from "next/image";

import { SectionHeading } from "@/components/section-heading";
import { SiteShell } from "@/components/site-shell";
import { getSiteContent } from "@/lib/site-content-store";

export default async function ActivitiesPage() {
  const content = await getSiteContent();

  return (
    <SiteShell>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <SectionHeading
          eyebrow="Activities"
          title="Community life expressed through service, culture, and recognition"
          description="Each activity reflects our identity, our faith, and our commitment to building a strong Congolese community in Zimbabwe."
        />

        <div className="mt-10 space-y-8">
          {content.activities.map((activity) => (
            <article key={activity.title} className="overflow-hidden rounded-[2rem] bg-white shadow-soft">
              <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="grid grid-cols-1 gap-3 bg-brand-cloud p-4 sm:grid-cols-3">
                  {activity.images.map((image, index) => (
                    <div key={`${activity.title}-${index}`} className="relative h-48 overflow-hidden rounded-[1.5rem] bg-brand-mist sm:h-56">
                      <Image src={image} alt={`${activity.title} gallery ${index + 1}`} fill className="object-cover" unoptimized />
                    </div>
                  ))}
                </div>
                <div className="p-6 sm:p-8">
                  <span className="rounded-full bg-brand-yellow px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-blue">{activity.date}</span>
                  <h3 className="mt-4 font-display text-3xl font-bold text-brand-ink">{activity.title}</h3>
                  <p className="mt-4 text-base leading-8 text-brand-ink/72">{activity.description}</p>
                  <div className="mt-6 rounded-[1.5rem] bg-brand-cloud px-5 py-4 text-sm text-brand-ink/72">Gallery caption: {activity.date} - {activity.title}</div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}

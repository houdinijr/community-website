export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-2xl">
      <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-brand-emerald">
        {eyebrow}
      </p>
      <h2 className="font-display text-3xl font-bold tracking-tight text-brand-ink sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-7 text-brand-ink/75">{description}</p>
    </div>
  );
}

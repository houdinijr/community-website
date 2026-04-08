import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/activities", label: "Activities" },
  { href: "/members", label: "Members" },
  { href: "/verify", label: "Verify Certificate" },
  { href: "/admin/login", label: "Admin" },
];

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-brand-cloud text-brand-ink">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-brand-blue/95 text-white backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="overflow-hidden rounded-full border-2 border-white/20 bg-white shadow-soft">
              <Image
                src="/images/cecau-logo.png"
                alt="CECAU logo"
                width={54}
                height={54}
                className="h-[54px] w-[54px] object-cover"
                unoptimized
              />
            </div>
            <div className="leading-tight">
              <span className="block font-display text-lg font-bold tracking-[0.08em] sm:text-xl">CECAU</span>
              <span className="block text-xs font-medium uppercase tracking-[0.16em] text-white/75 sm:text-sm">
                Congolese Community in Zimbabwe
              </span>
            </div>
          </Link>
          <nav className="flex flex-wrap items-center gap-2 text-sm font-medium text-white/90">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-4 py-2 transition ${link.href === "/admin/login" ? "hover:bg-white/10" : "hover:bg-white/14"}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t border-brand-blue/10 bg-white/90">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-8 text-sm text-brand-ink/70 sm:px-6 lg:px-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="overflow-hidden rounded-full border border-brand-blue/10 bg-white shadow-soft">
              <Image
                src="/images/cecau-logo.png"
                alt="CECAU logo"
                width={48}
                height={48}
                className="h-12 w-12 object-cover"
                unoptimized
              />
            </div>
            <div>
              <p className="font-display text-base font-bold text-brand-blue">CECAU</p>
              <p>Building unity, leadership, and shared progress in Christ for Congolese students and families in Zimbabwe.</p>
            </div>
          </div>
          <Link href="/" className="font-semibold text-brand-blue transition hover:text-brand-red">Return to Home</Link>
        </div>
      </footer>
    </div>
  );
}

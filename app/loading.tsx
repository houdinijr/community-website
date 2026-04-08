export default function Loading() {
  return (
    <main className="min-h-[60vh] bg-slate-50 px-6 py-24">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-center gap-6 rounded-[2rem] border border-sky-100 bg-white/90 px-8 py-20 text-center shadow-[0_30px_80px_rgba(15,23,42,0.08)]">
        <div className="h-14 w-14 animate-spin rounded-full border-4 border-sky-100 border-t-sky-600" />
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-sky-700">
            CECAU Platform
          </p>
          <h1 className="text-2xl font-semibold text-slate-900">
            Loading community content...
          </h1>
          <p className="max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
            Please wait while we prepare the latest community updates, certificate records,
            and member information.
          </p>
        </div>
      </div>
    </main>
  );
}

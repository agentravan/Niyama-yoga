export function AuthCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:py-24">
      <div className="glass animate-fade-up rounded-[2rem] p-7 sm:p-9">
        <h1 className="font-display text-3xl font-semibold">{title}</h1>
        {subtitle && <p className="muted mt-2">{subtitle}</p>}
        <div className="mt-7">{children}</div>
      </div>
    </div>
  );
}

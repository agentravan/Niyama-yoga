import Link from "next/link";

export function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <rect width="64" height="64" rx="18" className="fill-sage-600 dark:fill-sage-500" />
      <path
        d="M32 14c-6 8-6 16 0 24 6-8 6-16 0-24Zm-14 12c0 9 6 15 14 16-1-8-6-14-14-16Zm28 0c-8 2-13 8-14 16 8-1 14-7 14-16ZM18 46h28"
        fill="none"
        className="stroke-sand-50 dark:stroke-sage-950"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="Niyama Yoga home">
      <LogoMark />
      <span className="font-display text-xl font-semibold tracking-tight">
        Niyama<span className="text-clay-500"> Yoga</span>
      </span>
    </Link>
  );
}

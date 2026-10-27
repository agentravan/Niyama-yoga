import { Clock, User } from "lucide-react";
import type { LiveClass } from "@/lib/types";

const fmt = (iso: string, opts: Intl.DateTimeFormatOptions) =>
  new Date(iso).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", ...opts });

export function isLiveNow(c: LiveClass) {
  const start = new Date(c.starts_at).getTime();
  const now = Date.now();
  return now >= start - 10 * 60_000 && now <= start + c.duration_minutes * 60_000;
}

export function ClassList({ classes, compact = false }: { classes: LiveClass[]; compact?: boolean }) {
  if (classes.length === 0) {
    return <p className="muted rounded-2xl border border-dashed border-sand-300 p-6 text-center text-sm dark:border-white/15">
      No classes scheduled yet — check back soon.
    </p>;
  }
  return (
    <ul className="space-y-3">
      {classes.map((c) => {
        const live = isLiveNow(c);
        return (
          <li key={c.id} className="flex items-center gap-4 rounded-2xl border border-sand-200/80 bg-white/40 p-3.5 dark:border-white/10 dark:bg-white/[0.03]">
            <div className="w-16 shrink-0 rounded-xl bg-sage-600/10 py-2 text-center">
              <p className="text-xs font-semibold text-sage-700 uppercase dark:text-sage-300">{fmt(c.starts_at, { weekday: "short" })}</p>
              <p className="font-display text-xl leading-tight font-semibold">{fmt(c.starts_at, { day: "numeric" })}</p>
            </div>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 font-semibold">
                <span className="truncate">{c.title}</span>
                {live && <span className="shrink-0 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white uppercase">Live</span>}
              </p>
              {!compact && c.description && <p className="muted mt-0.5 text-sm">{c.description}</p>}
              <p className="muted mt-1 flex flex-wrap gap-x-3 text-xs">
                <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{fmt(c.starts_at, { hour: "numeric", minute: "2-digit", hour12: true }).toUpperCase()} IST · {c.duration_minutes} min</span>
                <span className="inline-flex items-center gap-1"><User className="h-3 w-3" />{c.instructor}</span>
                <span className="capitalize">{c.level === "all" ? "All levels" : c.level}</span>
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

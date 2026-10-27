import type { Metadata } from "next";
import Link from "next/link";
import { Clock, CreditCard, Hourglass, MessageSquare, Trash2, UserCheck, Users, XCircle } from "lucide-react";
import { deleteLiveClass, setMemberStatus, simulateTrialExpiry } from "@/app/actions/admin";
import { requireAdmin } from "@/lib/auth";
import { supabaseConfigured } from "@/lib/config";
import { effectiveStatus } from "@/lib/lifecycle";
import { formatPrice, getPlan } from "@/lib/plans";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Feedback, LiveClass, MembershipStatus, Profile } from "@/lib/types";
import { AddClassForm, RunLifecycleButton } from "./AdminForms";

export const metadata: Metadata = { title: "Admin Portal" };

const STATUS: Record<MembershipStatus, { label: string; cls: string }> = {
  trial: { label: "Trial", cls: "bg-sage-500/15 text-sage-700 dark:text-sage-300" },
  trial_expired: { label: "Trial ended", cls: "bg-clay-500/15 text-clay-600 dark:text-clay-300" },
  pending_payment: { label: "Pending payment", cls: "bg-amber-500/15 text-amber-700 dark:text-amber-300" },
  active: { label: "Active", cls: "bg-emerald-600/15 text-emerald-700 dark:text-emerald-300" },
  declined: { label: "Declined", cls: "bg-red-500/15 text-red-700 dark:text-red-300" },
};

const dt = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" });

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  await requireAdmin();
  if (!supabaseConfigured) return <p className="p-10 text-center">Configure Supabase to use the admin portal.</p>;

  const { status: statusFilter, q } = await searchParams;
  const db = createAdminClient();
  const [{ data: profiles }, { data: feedback }, { data: classes }] = await Promise.all([
    db.from("profiles").select("*").order("created_at", { ascending: false }).limit(1000),
    db.from("feedback").select("*").order("created_at", { ascending: false }).limit(200),
    db.from("live_classes").select("*").gte("starts_at", new Date(Date.now() - 86_400_000).toISOString()).order("starts_at").limit(50),
  ]);

  const all = ((profiles ?? []) as Profile[]).map((p) => ({ ...p, status: effectiveStatus(p) }));
  const count = (s: MembershipStatus) => all.filter((p) => p.status === s).length;
  const activeRevenue = all
    .filter((p) => p.status === "active")
    .reduce((sum, p) => sum + (getPlan(p.selected_plan)?.price ?? 0), 0);
  const conversion = all.length ? Math.round((count("active") / all.length) * 100) : 0;

  const needle = q?.trim().toLowerCase();
  const members = all.filter(
    (p) =>
      (!statusFilter || p.status === statusFilter) &&
      (!needle || [p.full_name, p.email, p.phone].some((v) => v.toLowerCase().includes(needle))),
  );

  const stats = [
    { label: "Registered users", value: all.length, icon: Users },
    { label: "Active trials", value: count("trial"), icon: Clock },
    { label: "Trials ended", value: count("trial_expired"), icon: Hourglass },
    { label: "Pending payment", value: count("pending_payment"), icon: CreditCard },
    { label: "Active members", value: count("active"), icon: UserCheck },
    { label: "Declined", value: count("declined"), icon: XCircle },
    { label: "Feedback received", value: feedback?.length ?? 0, icon: MessageSquare },
    { label: `Active plan value · ${conversion}% conv.`, value: formatPrice(activeRevenue), icon: CreditCard },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-8 sm:px-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="section-eyebrow">Admin portal</p>
          <h1 className="font-display mt-2 text-3xl font-semibold sm:text-4xl">Studio overview</h1>
        </div>
        <RunLifecycleButton />
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="glass rounded-3xl p-5">
            <Icon className="h-5 w-5 text-clay-500" />
            <p className="font-display mt-3 text-2xl font-semibold sm:text-3xl">{value}</p>
            <p className="muted mt-0.5 text-xs">{label}</p>
          </div>
        ))}
      </div>

      {/* Members */}
      <section className="glass rounded-3xl p-5 sm:p-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <h2 className="font-display text-xl font-semibold">Customers ({members.length})</h2>
          <form className="flex flex-col gap-2 sm:flex-row">
            <input name="q" defaultValue={q} placeholder="Search name, email, phone" className="input !py-2 sm:w-64" />
            <select name="status" defaultValue={statusFilter ?? ""} className="input !py-2 sm:w-44">
              <option value="">All statuses</option>
              {Object.entries(STATUS).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
            <button className="btn-primary !py-2">Filter</button>
            {(q || statusFilter) && <Link href="/admin" className="btn-ghost !py-2">Clear</Link>}
          </form>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="muted text-xs uppercase">
              <tr className="border-b border-sage-900/10 dark:border-white/10">
                <th className="p-3">Customer</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Level</th>
                <th className="p-3">Plan</th>
                <th className="p-3">Status</th>
                <th className="p-3">Trial</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.length === 0 && (
                <tr>
                  <td colSpan={7} className="muted p-8 text-center">No customers yet.</td>
                </tr>
              )}
              {members.map((p) => (
                <tr key={p.id} className="border-b border-sage-900/5 align-top last:border-0 dark:border-white/5">
                  <td className="p-3">
                    <p className="font-semibold">{p.full_name}</p>
                    <a href={`mailto:${p.email}`} className="muted text-xs hover:underline">{p.email}</a>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <a href={`tel:${p.phone}`} className="hover:underline">{p.phone}</a>
                  </td>
                  <td className="p-3 capitalize">{p.experience_level}</td>
                  <td className="p-3 whitespace-nowrap">{getPlan(p.selected_plan)?.name}</td>
                  <td className="p-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${STATUS[p.status].cls}`}>
                      {STATUS[p.status].label}
                    </span>
                    {p.follow_up_sent_at && <p className="muted mt-1.5 text-[11px]">Follow-up sent {dt(p.follow_up_sent_at)}</p>}
                  </td>
                  <td className="muted p-3 text-xs whitespace-nowrap">
                    {dt(p.trial_started_at)}
                    <br />→ {dt(p.trial_ends_at)}
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-2">
                      <form action={setMemberStatus} className="flex gap-1.5">
                        <input type="hidden" name="id" value={p.id} />
                        <select name="status" defaultValue={p.status} className="input !w-auto !rounded-full !px-3 !py-1.5 text-xs">
                          {Object.entries(STATUS).map(([k, v]) => (
                            <option key={k} value={k}>{v.label}</option>
                          ))}
                        </select>
                        <button className="btn-secondary !px-3 !py-1.5 text-xs">Save</button>
                      </form>
                      {p.status === "trial" && (
                        <form action={simulateTrialExpiry}>
                          <input type="hidden" name="id" value={p.id} />
                          <button className="btn-ghost !px-3 !py-1.5 text-xs" title="End this trial now and send the follow-up email">
                            End trial now
                          </button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Feedback */}
        <section className="glass rounded-3xl p-5 sm:p-6">
          <h2 className="font-display text-xl font-semibold">Feedback log</h2>
          <ul className="mt-5 max-h-[560px] space-y-3 overflow-y-auto pr-1">
            {(feedback as Feedback[] | null)?.length ? (
              (feedback as Feedback[]).map((f) => (
                <li key={f.id} className="rounded-2xl border border-sand-200/80 bg-white/40 p-4 text-sm dark:border-white/10 dark:bg-white/[0.03]">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-semibold">{f.full_name ?? f.email}</p>
                    <p className="muted text-xs">{dt(f.created_at)}</p>
                  </div>
                  <p className="muted text-xs">{f.email} · {getPlan(f.plan)?.name ?? "—"}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {f.reasons.map((r) => (
                      <span key={r} className="rounded-full bg-clay-500/15 px-2.5 py-0.5 text-xs text-clay-600 dark:text-clay-300">{r}</span>
                    ))}
                  </div>
                  {f.suggestions && <p className="mt-2 leading-relaxed">“{f.suggestions}”</p>}
                </li>
              ))
            ) : (
              <li className="muted text-sm">No feedback yet.</li>
            )}
          </ul>
        </section>

        {/* Classes */}
        <section className="glass rounded-3xl p-5 sm:p-6">
          <h2 className="font-display text-xl font-semibold">Live class schedule</h2>
          <div className="mt-5">
            <AddClassForm />
          </div>
          <ul className="mt-6 space-y-2">
            {((classes ?? []) as LiveClass[]).map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-3 rounded-2xl border border-sand-200/80 px-4 py-3 text-sm dark:border-white/10">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{c.title}</p>
                  <p className="muted text-xs">{dt(c.starts_at)} IST · {c.duration_minutes} min · {c.instructor}</p>
                </div>
                <form action={deleteLiveClass}>
                  <input type="hidden" name="id" value={c.id} />
                  <button className="btn-ghost h-9 w-9 !p-0 text-red-600" aria-label={`Delete ${c.title}`}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

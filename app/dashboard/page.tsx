import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays, Check, Lock, MonitorPlay } from "lucide-react";
import { StatusBanner } from "@/components/StatusBanner";
import { ClassList } from "@/components/ClassList";
import { getProfile, getUser } from "@/lib/auth";
import { isAdminEmail } from "@/lib/config";
import { effectiveStatus, hasAccess } from "@/lib/lifecycle";
import { FEATURES, getPlan, planIncludes } from "@/lib/plans";
import { createClient } from "@/lib/supabase/server";
import type { LiveClass } from "@/lib/types";

export const metadata: Metadata = { title: "Dashboard" };

const STATUS_LABEL = {
  trial: "Free trial",
  trial_expired: "Trial ended",
  pending_payment: "Awaiting payment",
  active: "Active member",
  declined: "Not continuing",
} as const;

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ password?: string }> }) {
  const [user, profile, { password }] = await Promise.all([getUser(), getProfile(), searchParams]);
  const admin = isAdminEmail(user?.email);

  const supabase = await createClient();
  const { data: classes } = await supabase
    .from("live_classes")
    .select("*")
    .gte("starts_at", new Date(Date.now() - 2 * 3_600_000).toISOString())
    .order("starts_at")
    .limit(3);

  if (!profile) {
    return (
      <div className="glass rounded-3xl p-8 text-center">
        <h1 className="font-display text-2xl font-semibold">Welcome{admin ? ", Admin" : ""}!</h1>
        <p className="muted mt-2">
          {admin ? "You're signed in as the studio admin." : "Complete your details to start your 3-day free trial."}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {admin && (
            <Link href="/admin" className="btn-primary">
              Open admin portal
            </Link>
          )}
          <Link href={admin ? "/dashboard/live" : "/start"} className={admin ? "btn-secondary" : "btn-primary"}>
            {admin ? "Open live studio" : "Start free trial"}
          </Link>
        </div>
      </div>
    );
  }

  const plan = getPlan(profile.selected_plan)!;
  const status = effectiveStatus(profile);
  const access = hasAccess(profile);

  return (
    <div className="space-y-8">
      {password === "updated" && (
        <p className="rounded-2xl bg-sage-500/15 px-4 py-3 text-sm text-sage-800 dark:text-sage-200">Password updated successfully.</p>
      )}
      <div>
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">Namaste, {profile.full_name.split(" ")[0]}</h1>
        <p className="muted mt-1">Here&apos;s your practice at a glance.</p>
      </div>

      <StatusBanner profile={profile} />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="glass rounded-3xl p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display flex items-center gap-2 text-xl font-semibold">
              <CalendarDays className="h-5 w-5 text-clay-500" /> Upcoming live classes
            </h2>
            <Link href="/dashboard/live" className="text-sm font-semibold text-sage-700 hover:underline dark:text-sage-300">
              See all
            </Link>
          </div>
          <div className="mt-5">
            <ClassList classes={(classes ?? []) as LiveClass[]} compact />
          </div>
          <Link href="/dashboard/live" className={`mt-6 w-full ${access ? "btn-primary" : "btn-secondary"}`}>
            <MonitorPlay className="h-4 w-4" /> {access ? "Enter the live studio" : "Upgrade to join live classes"}
          </Link>
        </div>

        <div className="glass rounded-3xl p-6">
          <p className="muted text-xs font-semibold tracking-widest uppercase">Your plan</p>
          <p className="font-display mt-2 text-2xl font-semibold">{plan.name}</p>
          <span className="mt-2 inline-block rounded-full bg-sage-600/15 px-3 py-1 text-xs font-semibold text-sage-700 dark:text-sage-300">
            {STATUS_LABEL[status]}
          </span>
          <dl className="mt-5 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="muted">Experience</dt>
              <dd className="font-medium capitalize">{profile.experience_level}</dd>
            </div>
            {profile.membership_ends_at && (
              <div className="flex justify-between">
                <dt className="muted">Renews</dt>
                <dd className="font-medium">
                  {new Date(profile.membership_ends_at).toLocaleDateString("en-IN", { dateStyle: "medium", timeZone: "Asia/Kolkata" })}
                </dd>
              </div>
            )}
          </dl>
          <Link href="/dashboard/membership" className="btn-secondary mt-6 w-full">
            Manage membership <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="glass rounded-3xl p-6">
        <h2 className="font-display text-xl font-semibold">Your member perks</h2>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.filter((f) => f.key !== "trial").map((f) => {
            const unlocked = access && planIncludes(plan.id, f.key);
            return (
              <li
                key={f.key}
                className={`flex items-center gap-3 rounded-2xl border p-3 text-sm ${
                  unlocked ? "border-sage-500/30 bg-sage-500/10" : "border-sand-200 opacity-60 dark:border-white/10"
                }`}
              >
                {unlocked ? (
                  <Check className="h-4 w-4 shrink-0 text-sage-600 dark:text-sage-400" />
                ) : (
                  <Lock className="h-4 w-4 shrink-0" />
                )}
                {f.label}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

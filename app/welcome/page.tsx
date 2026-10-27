import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, CheckCircle2, MonitorPlay } from "lucide-react";
import { StatusBanner } from "@/components/StatusBanner";
import { getProfile } from "@/lib/auth";
import { getPlan } from "@/lib/plans";

export const metadata: Metadata = { title: "Welcome" };

export default async function WelcomePage() {
  const profile = await getProfile();
  if (!profile) redirect("/start");
  const plan = getPlan(profile.selected_plan);
  const ends = new Date(profile.trial_ends_at).toLocaleString("en-IN", { dateStyle: "full", timeStyle: "short", timeZone: "Asia/Kolkata" }) + " IST";

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6 sm:py-20">
      <div className="text-center">
        <span className="inline-flex h-16 w-16 animate-fade-up items-center justify-center rounded-full bg-sage-600 text-white shadow-xl shadow-sage-600/30">
          <CheckCircle2 className="h-8 w-8" />
        </span>
        <h1 className="font-display mt-6 text-3xl font-semibold sm:text-4xl">Namaste, {profile.full_name.split(" ")[0]} 🙏</h1>
        <p className="muted mt-3 text-lg">You&apos;re all set. Your mat — and your teacher — are ready.</p>
      </div>

      <div className="mt-10">
        <StatusBanner profile={profile} />
      </div>

      <div className="glass mt-6 rounded-3xl p-6 text-sm">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="muted">Selected plan</dt>
            <dd className="mt-0.5 font-semibold">{plan?.name}</dd>
          </div>
          <div>
            <dt className="muted">Trial ends</dt>
            <dd className="mt-0.5 font-semibold">{ends}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link href="/dashboard" className="btn-primary !px-7 !py-3.5">
          Go to my dashboard <ArrowRight className="h-4 w-4" />
        </Link>
        <Link href="/dashboard/live" className="btn-secondary !px-7 !py-3.5">
          <MonitorPlay className="h-4 w-4" /> Join a live class
        </Link>
      </div>
    </div>
  );
}

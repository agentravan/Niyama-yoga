import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { getProfile, getUser } from "@/lib/auth";
import { supabaseConfigured } from "@/lib/config";
import { isPlanId } from "@/lib/plans";
import { SetupNotice } from "@/components/SetupNotice";
import { SitePhoto } from "@/components/SitePhoto";
import { getPhoto } from "@/lib/photos";
import { StartForm } from "./StartForm";

export const metadata: Metadata = { title: "Start your free trial" };

export default async function StartPage({ searchParams }: { searchParams: Promise<{ plan?: string }> }) {
  const { plan } = await searchParams;
  const initialPlan = isPlanId(plan) ? plan : "3m";

  const user = await getUser();
  if (user && (await getProfile())) redirect(`/dashboard/membership?plan=${initialPlan}`);

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-5 lg:py-20">
      <div className="lg:col-span-2">
        <p className="section-eyebrow">3-day free trial</p>
        <h1 className="section-title mt-3">Begin your practice today</h1>
        <p className="muted mt-4 text-lg">Unlimited live classes for 3 days. Tell us a little about yourself and you&apos;re in.</p>
        <ul className="mt-8 space-y-4">
          {[
            "Instant access to your member dashboard",
            "Join every live class right in your browser",
            "Personal guidance for your experience level",
            "No card needed — decide after 3 days",
          ].map((t) => (
            <li key={t} className="flex gap-3">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-sage-600 dark:text-sage-400" /> {t}
            </li>
          ))}
        </ul>
        <p className="muted mt-8 flex items-center gap-2 text-sm">
          <ShieldCheck className="h-4 w-4" /> Your details are private and never shared.
        </p>
        {getPhoto("meditate") && (
          <div className="relative mt-8 hidden aspect-[3/2] overflow-hidden rounded-[2rem] shadow-xl shadow-sage-900/10 lg:block">
            <SitePhoto photo="meditate" sizes="400px" />
          </div>
        )}
      </div>
      <div className="glass rounded-[2rem] p-6 sm:p-8 lg:col-span-3">
        {supabaseConfigured ? <StartForm initialPlan={initialPlan} signedInEmail={user?.email} /> : <SetupNotice />}
      </div>
    </div>
  );
}

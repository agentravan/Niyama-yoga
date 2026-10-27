import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { StatusBanner } from "@/components/StatusBanner";
import { getProfile } from "@/lib/auth";
import { effectiveStatus } from "@/lib/lifecycle";
import { isPlanId } from "@/lib/plans";
import { MembershipActions } from "./MembershipActions";

export const metadata: Metadata = { title: "Membership" };

export default async function MembershipPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; plan?: string }>;
}) {
  const profile = await getProfile();
  if (!profile) redirect("/start");
  const { action, plan } = await searchParams;
  const status = effectiveStatus(profile);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">Membership</h1>
        <p className="muted mt-1">Choose how you&apos;d like to continue your practice.</p>
      </div>
      <StatusBanner profile={profile} />
      <MembershipActions
        currentPlan={profile.selected_plan}
        initialPlan={isPlanId(plan) ? plan : profile.selected_plan}
        openFeedback={action === "decline" && status !== "active"}
        canDecline={status !== "active" && status !== "declined"}
        isActive={status === "active"}
        paymentLink={process.env.NEXT_PUBLIC_PAYMENT_LINK || undefined}
      />
    </div>
  );
}

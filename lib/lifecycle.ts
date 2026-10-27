import { TRIAL_DAYS } from "@/lib/config";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail, trialEndedEmail } from "@/lib/email";
import type { MembershipStatus, Profile } from "@/lib/types";

/** Status as of right now — a trial whose end date passed counts as expired even before the cron runs. */
export function effectiveStatus(p: Pick<Profile, "membership_status" | "trial_ends_at">): MembershipStatus {
  if (p.membership_status === "trial" && new Date(p.trial_ends_at).getTime() <= Date.now()) return "trial_expired";
  return p.membership_status;
}

type AccessFields = Pick<Profile, "membership_status" | "trial_ends_at" | "membership_ends_at">;

export function membershipLapsed(p: AccessFields) {
  return p.membership_status === "active" && !!p.membership_ends_at && new Date(p.membership_ends_at).getTime() <= Date.now();
}

/** Can this member join live classes right now? */
export function hasAccess(p: AccessFields) {
  if (p.membership_status === "active") return !membershipLapsed(p);
  // Members who request an upgrade mid-trial keep access until the trial ends.
  const trialRunning = new Date(p.trial_ends_at).getTime() > Date.now();
  return trialRunning && (p.membership_status === "trial" || p.membership_status === "pending_payment");
}

export function trialTimeLeft(trialEndsAt: string) {
  const ms = Math.max(0, new Date(trialEndsAt).getTime() - Date.now());
  const hours = Math.floor(ms / 3_600_000);
  return { ms, days: Math.floor(hours / 24), hours: hours % 24 };
}

export function newTrialWindow(from = new Date()) {
  const ends = new Date(from.getTime() + TRIAL_DAYS * 24 * 3_600_000);
  return { trial_started_at: from.toISOString(), trial_ends_at: ends.toISOString() };
}

/**
 * Finds trials that have ended, marks them `trial_expired` and sends the
 * upgrade follow-up exactly once (guarded by follow_up_sent_at).
 */
export async function runTrialCheck() {
  const db = createAdminClient();
  const { data, error } = await db
    .from("profiles")
    .select("*")
    .in("membership_status", ["trial", "trial_expired"])
    .lte("trial_ends_at", new Date().toISOString())
    .is("follow_up_sent_at", null)
    .limit(500);

  if (error) throw error;

  const results: { email: string; emailed: boolean }[] = [];
  for (const p of (data ?? []) as Profile[]) {
    const sent = await sendEmail({ to: p.email, ...trialEndedEmail(p) });
    await db
      .from("profiles")
      // If the email fails, follow_up_sent_at stays null so the next run retries it.
      .update({ membership_status: "trial_expired", ...(sent.ok ? { follow_up_sent_at: new Date().toISOString() } : {}) })
      .eq("id", p.id);
    results.push({ email: p.email, emailed: sent.ok });
  }
  return { processed: results.length, results };
}

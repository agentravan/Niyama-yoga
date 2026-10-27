"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { newTrialWindow, runTrialCheck } from "@/lib/lifecycle";
import { getPlan } from "@/lib/plans";
import { createAdminClient } from "@/lib/supabase/admin";
import type { MembershipStatus } from "@/lib/types";
import type { FormState } from "@/app/actions/auth";

const STATUSES: MembershipStatus[] = ["trial", "trial_expired", "pending_payment", "active", "declined"];

export async function setMemberStatus(formData: FormData) {
  await requireAdmin();
  const id = z.string().uuid().parse(formData.get("id"));
  const status = z.enum(STATUSES as [MembershipStatus, ...MembershipStatus[]]).parse(formData.get("status"));
  const db = createAdminClient();

  let patch: Record<string, unknown> = { membership_status: status };
  if (status === "active") {
    const { data } = await db.from("profiles").select("selected_plan").eq("id", id).single();
    const months = getPlan(data?.selected_plan)?.months ?? 1;
    const start = new Date();
    const end = new Date(start);
    end.setMonth(end.getMonth() + months);
    patch = { ...patch, membership_started_at: start.toISOString(), membership_ends_at: end.toISOString() };
  }
  if (status === "trial") patch = { ...patch, ...newTrialWindow(), follow_up_sent_at: null };

  await db.from("profiles").update(patch).eq("id", id);
  revalidatePath("/admin");
}

/** Testing aid: end a member's trial now so the follow-up flow can be exercised immediately. */
export async function simulateTrialExpiry(formData: FormData) {
  await requireAdmin();
  const id = z.string().uuid().parse(formData.get("id"));
  const db = createAdminClient();
  await db
    .from("profiles")
    .update({ trial_ends_at: new Date(Date.now() - 60_000).toISOString(), membership_status: "trial", follow_up_sent_at: null })
    .eq("id", id);
  await runTrialCheck();
  revalidatePath("/admin");
}

export async function runLifecycleNow(): Promise<FormState> {
  await requireAdmin();
  try {
    const r = await runTrialCheck();
    revalidatePath("/admin");
    const emailed = r.results.filter((x) => x.emailed).length;
    return { success: `Processed ${r.processed} expired trial(s); ${emailed} follow-up email(s) sent.` };
  } catch (e) {
    return { error: `Lifecycle check failed: ${String(e)}` };
  }
}

const classSchema = z.object({
  title: z.string().trim().min(2).max(80),
  description: z.string().trim().max(300).optional(),
  instructor: z.string().trim().min(2).max(60),
  level: z.enum(["all", "beginner", "intermediate", "advanced"]),
  starts_at: z.string().min(1),
  tz_offset: z.coerce.number().int().min(-840).max(840),
  duration_minutes: z.coerce.number().int().min(10).max(240),
});

export async function addLiveClass(_: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = classSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { tz_offset, starts_at, ...rest } = parsed.data;

  // <input type="datetime-local"> has no zone; convert using the admin's browser offset.
  const local = new Date(`${starts_at}:00Z`);
  if (Number.isNaN(local.getTime())) return { error: "Invalid start time" };
  const utc = new Date(local.getTime() + tz_offset * 60_000);

  const db = createAdminClient();
  const { error } = await db.from("live_classes").insert({ ...rest, description: rest.description || null, starts_at: utc.toISOString() });
  if (error) return { error: error.message };
  revalidatePath("/admin");
  revalidatePath("/dashboard/live");
  return { success: "Class scheduled." };
}

export async function deleteLiveClass(formData: FormData) {
  await requireAdmin();
  const id = z.string().uuid().parse(formData.get("id"));
  await createAdminClient().from("live_classes").delete().eq("id", id);
  revalidatePath("/admin");
  revalidatePath("/dashboard/live");
}

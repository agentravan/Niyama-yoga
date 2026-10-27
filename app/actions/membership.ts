"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getProfile } from "@/lib/auth";
import { ADMIN_NOTIFY_EMAIL, feedbackEmail, sendEmail, upgradeRequestEmail } from "@/lib/email";
import { isPlanId } from "@/lib/plans";
import { createAdminClient } from "@/lib/supabase/admin";
import type { FormState } from "@/app/actions/auth";

export async function requestUpgrade(_: FormState, formData: FormData): Promise<FormState> {
  const profile = await getProfile();
  if (!profile) return { error: "Please log in again." };

  const plan = formData.get("plan");
  if (!isPlanId(plan)) return { error: "Choose a plan." };

  const db = createAdminClient();
  const { error } = await db
    .from("profiles")
    .update({ selected_plan: plan, ...(profile.membership_status === "active" ? {} : { membership_status: "pending_payment" }) })
    .eq("id", profile.id);
  if (error) return { error: "Couldn't save your request. Please try again." };

  await sendEmail({ to: ADMIN_NOTIFY_EMAIL, ...upgradeRequestEmail(profile, plan) });
  revalidatePath("/dashboard", "layout");
  return { success: "Upgrade requested! We've notified our team and will confirm your membership shortly." };
}

const feedbackSchema = z.object({
  reasons: z.array(z.string().max(80)).max(10),
  other_reason: z.string().trim().max(200).optional(),
  suggestions: z.string().trim().max(2000).optional(),
});

export async function submitFeedback(_: FormState, formData: FormData): Promise<FormState> {
  const profile = await getProfile();
  if (!profile) return { error: "Please log in again." };

  const parsed = feedbackSchema.safeParse({
    reasons: formData.getAll("reasons").map(String),
    other_reason: formData.get("other_reason") || undefined,
    suggestions: formData.get("suggestions") || undefined,
  });
  if (!parsed.success) return { error: "Please check your answers." };

  const reasons = [...parsed.data.reasons];
  if (parsed.data.other_reason) reasons.push(`Other: ${parsed.data.other_reason}`);
  if (reasons.length === 0) return { error: "Please tell us at least one reason." };

  const entry = {
    user_id: profile.id,
    full_name: profile.full_name,
    email: profile.email,
    plan: profile.selected_plan,
    reasons,
    suggestions: parsed.data.suggestions ?? null,
  };

  const db = createAdminClient();
  const { error } = await db.from("feedback").insert(entry);
  if (error) return { error: "Couldn't save your feedback. Please try again." };

  if (profile.membership_status !== "active") {
    await db.from("profiles").update({ membership_status: "declined" }).eq("id", profile.id);
  }
  await sendEmail({ to: ADMIN_NOTIFY_EMAIL, ...feedbackEmail(entry) });

  revalidatePath("/dashboard", "layout");
  return { success: "Thank you — your feedback helps us create a better practice for everyone. 🙏" };
}

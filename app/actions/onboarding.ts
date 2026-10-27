"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { getUser } from "@/lib/auth";
import { ADMIN_NOTIFY_EMAIL, newLeadEmail, sendEmail } from "@/lib/email";
import { newTrialWindow } from "@/lib/lifecycle";
import { isPlanId } from "@/lib/plans";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";
import type { FormState } from "@/app/actions/auth";

const base = z.object({
  full_name: z.string().trim().min(2, "Please enter your full name").max(80),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s-]{7,18}$/, "Enter a valid phone number"),
  experience_level: z.enum(["beginner", "intermediate", "advanced"], { message: "Choose your experience level" }),
  selected_plan: z.string().refine(isPlanId, "Choose a plan"),
});

const withAccount = base.extend({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
});

export async function startTrial(_: FormState, formData: FormData): Promise<FormState> {
  const result = await createTrial(formData);
  // Echo back what was typed (never the password) so a failed submit doesn't wipe the form.
  const keep = ["full_name", "email", "phone", "experience_level", "selected_plan"] as const;
  return { ...result, values: Object.fromEntries(keep.map((k) => [k, String(formData.get(k) ?? "")])) };
}

async function createTrial(formData: FormData): Promise<FormState> {
  // Honeypot: real users never see or fill this field.
  if (formData.get("company")) return { error: "Something went wrong. Please try again." };

  const raw = Object.fromEntries(formData);
  const db = createAdminClient();
  const existingUser = await getUser();

  let userId: string;
  let email: string;
  let fields: z.infer<typeof base>;

  if (existingUser) {
    // Signed-in user without a profile yet (e.g. created from the Supabase dashboard).
    const parsed = base.safeParse(raw);
    if (!parsed.success) return { error: parsed.error.issues[0].message };
    const { data: has } = await db.from("profiles").select("id").eq("id", existingUser.id).maybeSingle();
    if (has) redirect(`/dashboard/membership?plan=${parsed.data.selected_plan}`);
    userId = existingUser.id;
    email = existingUser.email!.toLowerCase();
    fields = parsed.data;
  } else {
    const parsed = withAccount.safeParse(raw);
    if (!parsed.success) return { error: parsed.error.issues[0].message };
    const { password, email: e, ...rest } = parsed.data;

    const { data, error } = await db.auth.admin.createUser({
      email: e,
      password,
      email_confirm: true,
      user_metadata: { full_name: rest.full_name },
    });
    if (error || !data.user) {
      const exists = /already|registered|exists/i.test(error?.message ?? "");
      return {
        error: exists
          ? "An account with this email already exists — please log in instead."
          : "We couldn't create your account. Please try again.",
      };
    }
    userId = data.user.id;
    email = e;
    fields = rest;

    const supabase = await createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: e, password });
    if (signInError) {
      await db.auth.admin.deleteUser(userId);
      return { error: "Account created but sign-in failed. Please try again." };
    }
  }

  const { data: profile, error: insertError } = await db
    .from("profiles")
    .insert({ id: userId, email, ...fields, membership_status: "trial", ...newTrialWindow() })
    .select()
    .single();

  if (insertError || !profile) {
    console.error("[onboarding] profile insert failed", insertError);
    if (!existingUser) {
      await db.auth.admin.deleteUser(userId);
      const supabase = await createClient();
      await supabase.auth.signOut();
    }
    return {
      error: /duplicate|unique/i.test(insertError?.message ?? "")
        ? "This email already has a trial — please log in."
        : "We couldn't start your trial. Please try again.",
    };
  }

  await sendEmail({ to: ADMIN_NOTIFY_EMAIL, ...newLeadEmail(profile as Profile) });

  redirect("/welcome");
}

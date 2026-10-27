"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { SITE_URL, isAdminEmail } from "@/lib/config";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error?: string; success?: string; values?: Record<string, string> } | undefined;

function safeNext(next: FormDataEntryValue | null) {
  const n = typeof next === "string" ? next : "";
  return n.startsWith("/") && !n.startsWith("//") ? n : null;
}

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});

export async function login(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email.toLowerCase(),
    password: parsed.data.password,
  });
  if (error) return { error: "Incorrect email or password." };

  const next = safeNext(formData.get("next"));
  redirect(next ?? (isAdminEmail(data.user.email) ? "/admin" : "/dashboard"));
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function requestPasswordReset(_: FormState, formData: FormData): Promise<FormState> {
  const email = z.string().trim().email().safeParse(formData.get("email"));
  if (!email.success) return { error: "Enter a valid email" };

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email.data.toLowerCase(), {
    redirectTo: `${SITE_URL}/auth/confirm?next=/reset-password`,
  });
  // Same response whether or not the account exists, to avoid leaking which emails are registered.
  return { success: "If an account exists for that email, a reset link is on its way." };
}

export async function updatePassword(_: FormState, formData: FormData): Promise<FormState> {
  const password = String(formData.get("password") ?? "");
  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  if (password !== formData.get("confirm")) return { error: "Passwords don't match." };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };
  redirect("/dashboard?password=updated");
}

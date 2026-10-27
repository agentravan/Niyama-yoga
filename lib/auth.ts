import { redirect } from "next/navigation";
import { cache } from "react";
import { isAdminEmail, supabaseConfigured } from "@/lib/config";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export const getUser = cache(async () => {
  if (!supabaseConfigured) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

export const getProfile = cache(async (): Promise<Profile | null> => {
  const user = await getUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  return (data as Profile | null) ?? null;
});

export async function requireUser() {
  const user = await getUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (!isAdminEmail(user.email)) redirect("/dashboard");
  return user;
}

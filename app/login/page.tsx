import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/AuthCard";
import { SetupNotice } from "@/components/SetupNotice";
import { getUser } from "@/lib/auth";
import { supabaseConfigured } from "@/lib/config";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if (await getUser()) redirect("/dashboard");
  const { next } = await searchParams;
  return (
    <AuthCard title="Welcome back" subtitle="Log in to join today's live classes.">
      {supabaseConfigured ? <LoginForm next={next} /> : <SetupNotice />}
    </AuthCard>
  );
}

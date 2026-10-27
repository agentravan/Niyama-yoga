"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login } from "@/app/actions/auth";
import { FormMessage, SubmitButton } from "@/components/SubmitButton";

export function LoginForm({ next }: { next?: string }) {
  const [state, action] = useActionState(login, undefined);
  return (
    <form action={action} className="space-y-5">
      {next && <input type="hidden" name="next" value={next} />}
      <div>
        <label htmlFor="email" className="label">Email</label>
        <input id="email" name="email" type="email" required autoComplete="email" className="input" />
      </div>
      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="label">Password</label>
          <Link href="/forgot-password" className="mb-1.5 text-xs font-medium text-sage-700 hover:underline dark:text-sage-300">
            Forgot password?
          </Link>
        </div>
        <input id="password" name="password" type="password" required autoComplete="current-password" className="input" />
      </div>
      <FormMessage state={state} />
      <SubmitButton pendingText="Signing in…">Log in</SubmitButton>
      <p className="muted text-center text-sm">
        New here?{" "}
        <Link href="/start?plan=3m" className="font-semibold text-sage-700 underline dark:text-sage-300">
          Start a 3-day free trial
        </Link>
      </p>
    </form>
  );
}

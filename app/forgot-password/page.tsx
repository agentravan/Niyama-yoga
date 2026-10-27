"use client";

import { useActionState } from "react";
import { requestPasswordReset } from "@/app/actions/auth";
import { AuthCard } from "@/components/AuthCard";
import { FormMessage, SubmitButton } from "@/components/SubmitButton";

export default function ForgotPasswordPage() {
  const [state, action] = useActionState(requestPasswordReset, undefined);
  return (
    <AuthCard title="Reset password" subtitle="We'll email you a secure link to set a new password.">
      <form action={action} className="space-y-5">
        <div>
          <label htmlFor="email" className="label">Email</label>
          <input id="email" name="email" type="email" required autoComplete="email" className="input" />
        </div>
        <FormMessage state={state} />
        <SubmitButton pendingText="Sending…">Send reset link</SubmitButton>
      </form>
    </AuthCard>
  );
}

"use client";

import { useActionState } from "react";
import { updatePassword } from "@/app/actions/auth";
import { AuthCard } from "@/components/AuthCard";
import { FormMessage, SubmitButton } from "@/components/SubmitButton";

export default function ResetPasswordPage() {
  const [state, action] = useActionState(updatePassword, undefined);
  return (
    <AuthCard title="Choose a new password">
      <form action={action} className="space-y-5">
        <div>
          <label htmlFor="password" className="label">New password</label>
          <input id="password" name="password" type="password" minLength={8} required autoComplete="new-password" className="input" />
        </div>
        <div>
          <label htmlFor="confirm" className="label">Confirm password</label>
          <input id="confirm" name="confirm" type="password" minLength={8} required autoComplete="new-password" className="input" />
        </div>
        <FormMessage state={state} />
        <SubmitButton pendingText="Saving…">Update password</SubmitButton>
      </form>
    </AuthCard>
  );
}

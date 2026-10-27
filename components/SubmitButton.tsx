"use client";

import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";

export function SubmitButton({
  children,
  className = "btn-primary w-full !py-3",
  pendingText,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { pendingText?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className} {...rest}>
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      {pending && pendingText ? pendingText : children}
    </button>
  );
}

export function FormMessage({ state }: { state?: { error?: string; success?: string } }) {
  if (!state?.error && !state?.success) return null;
  return (
    <p
      role={state.error ? "alert" : "status"}
      className={`rounded-xl px-4 py-3 text-sm ${
        state.error
          ? "bg-red-500/10 text-red-700 dark:text-red-300"
          : "bg-sage-500/15 text-sage-800 dark:text-sage-200"
      }`}
    >
      {state.error ?? state.success}
    </p>
  );
}

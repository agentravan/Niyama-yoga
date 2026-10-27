"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { startTrial } from "@/app/actions/onboarding";
import { FormMessage, SubmitButton } from "@/components/SubmitButton";
import { EXPERIENCE_LEVELS, PLANS, formatPrice, type PlanId } from "@/lib/plans";

export function StartForm({ initialPlan, signedInEmail }: { initialPlan: PlanId; signedInEmail?: string }) {
  const [state, action] = useActionState(startTrial, undefined);
  const [plan, setPlan] = useState<PlanId>(initialPlan);
  const v = state?.values ?? {};

  return (
    <form action={action} className="space-y-5">
      <fieldset>
        <legend className="label">Membership plan</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {PLANS.map((p) => (
            <label
              key={p.id}
              className={`cursor-pointer rounded-2xl border p-3 text-center transition ${
                plan === p.id
                  ? "border-sage-600 bg-sage-600/10 ring-2 ring-sage-600/30"
                  : "border-sand-200 hover:border-sage-400 dark:border-white/10"
              }`}
            >
              <input
                type="radio"
                name="selected_plan"
                value={p.id}
                checked={plan === p.id}
                onChange={() => setPlan(p.id)}
                className="sr-only"
              />
              <span className="block text-sm font-semibold">{p.name}</span>
              <span className="muted block text-xs">{formatPrice(p.perMonth)}/mo</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="full_name" className="label">Full name</label>
        <input id="full_name" name="full_name" key={`n${v.full_name}`} defaultValue={v.full_name} required autoComplete="name" className="input" placeholder="Your full name" />
      </div>

      {signedInEmail ? (
        <p className="muted text-sm">
          Signed in as <strong>{signedInEmail}</strong>
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="email" className="label">Email address</label>
            <input id="email" name="email" key={`e${v.email}`} defaultValue={v.email} type="email" required autoComplete="email" className="input" placeholder="you@example.com" />
          </div>
          <div>
            <label htmlFor="password" className="label">Create password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="input"
              placeholder="Min. 8 characters"
            />
          </div>
        </div>
      )}

      <div>
        <label htmlFor="phone" className="label">Phone number</label>
        <input id="phone" name="phone" key={`p${v.phone}`} defaultValue={v.phone} type="tel" required autoComplete="tel" className="input" placeholder="+91 98765 43210" />
      </div>

      <fieldset>
        <legend className="label">Yoga experience level</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {EXPERIENCE_LEVELS.map((lvl, i) => (
            <label
              key={lvl.id}
              className="cursor-pointer rounded-2xl border border-sand-200 p-3 transition hover:border-sage-400 has-[:checked]:border-sage-600 has-[:checked]:bg-sage-600/10 has-[:checked]:ring-2 has-[:checked]:ring-sage-600/30 dark:border-white/10"
            >
              <input type="radio" name="experience_level" value={lvl.id} key={`x${v.experience_level}`} defaultChecked={v.experience_level ? v.experience_level === lvl.id : i === 0} className="sr-only" />
              <span className="block text-sm font-semibold">{lvl.label}</span>
              <span className="muted block text-xs leading-snug">{lvl.hint}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Honeypot — hidden from humans */}
      <div aria-hidden className="absolute -left-[9999px]">
        <label>
          Company <input name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <FormMessage state={state} />

      <SubmitButton pendingText="Starting your trial…">Start my 3-day free trial</SubmitButton>
      <p className="muted text-center text-xs">
        No payment needed today. Already a member?{" "}
        <Link href="/login" className="font-semibold text-sage-700 underline dark:text-sage-300">
          Log in
        </Link>
      </p>
    </form>
  );
}

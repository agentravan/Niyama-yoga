"use client";

import { Check } from "lucide-react";
import { useActionState, useState } from "react";
import { requestUpgrade } from "@/app/actions/membership";
import { FeedbackModal } from "@/components/FeedbackModal";
import { FormMessage, SubmitButton } from "@/components/SubmitButton";
import { PLANS, formatPrice, type PlanId } from "@/lib/plans";

type Props = {
  currentPlan: PlanId;
  initialPlan: PlanId;
  openFeedback: boolean;
  canDecline: boolean;
  isActive: boolean;
  paymentLink?: string;
};

export function MembershipActions({ currentPlan, initialPlan, openFeedback, canDecline, isActive, paymentLink }: Props) {
  const [plan, setPlan] = useState<PlanId>(initialPlan);
  const [feedbackOpen, setFeedbackOpen] = useState(openFeedback);
  const [state, action] = useActionState(requestUpgrade, undefined);

  return (
    <>
      <form action={action} className="space-y-6" id="upgrade">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((p) => (
            <label
              key={p.id}
              className={`relative cursor-pointer rounded-3xl border p-5 transition ${
                plan === p.id
                  ? "border-sage-600 bg-sage-600/10 ring-2 ring-sage-600/30"
                  : "glass border-transparent hover:border-sage-400"
              }`}
            >
              <input type="radio" name="plan" value={p.id} checked={plan === p.id} onChange={() => setPlan(p.id)} className="sr-only" />
              {p.badge && (
                <span className="absolute top-4 right-4 rounded-full bg-clay-500 px-2 py-0.5 text-[10px] font-bold text-white">{p.badge}</span>
              )}
              <p className="font-display text-lg font-semibold">{p.name}</p>
              <p className="font-display mt-3 text-3xl font-semibold">{formatPrice(p.price)}</p>
              <p className="muted text-xs">
                {formatPrice(p.perMonth)}/mo · {p.months} month{p.months > 1 ? "s" : ""}
                {p.savingsPct ? ` · save ${p.savingsPct}%` : ""}
              </p>
              <ul className="mt-4 space-y-1.5 text-xs">
                {p.highlights.map((h) => (
                  <li key={h} className="flex gap-1.5">
                    <Check className="h-3.5 w-3.5 shrink-0 text-sage-600" /> {h}
                  </li>
                ))}
              </ul>
              {p.id === currentPlan && <p className="mt-3 text-xs font-semibold text-sage-700 dark:text-sage-300">Your chosen plan</p>}
            </label>
          ))}
        </div>

        <FormMessage state={state} />
        {state?.success && paymentLink && (
          <a href={paymentLink} target="_blank" rel="noopener noreferrer" className="btn-clay">
            Complete payment securely
          </a>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          <SubmitButton className="btn-primary !px-8 !py-3.5 text-base" pendingText="Sending request…">
            {isActive ? "Switch to this plan" : "Upgrade to this plan"}
          </SubmitButton>
          {canDecline && (
            <button type="button" onClick={() => setFeedbackOpen(true)} className="btn-secondary !px-8 !py-3.5 text-base">
              Decline / Not interested
            </button>
          )}
        </div>
      </form>

      <FeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </>
  );
}

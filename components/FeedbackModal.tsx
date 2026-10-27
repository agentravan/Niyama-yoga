"use client";

import { MessageSquareHeart, X } from "lucide-react";
import { useActionState, useEffect, useRef } from "react";
import { submitFeedback } from "@/app/actions/membership";
import { FormMessage, SubmitButton } from "@/components/SubmitButton";

const REASONS = [
  "Price is too high",
  "Class timings don't suit me",
  "Want different yoga styles",
  "Classes were too easy / too hard",
  "Prefer in-person classes",
  "Technical issues with video",
  "Not enough time right now",
  "Health or personal reasons",
];

export function FeedbackModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [state, action] = useActionState(submitFeedback, undefined);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(e) => e.target === dialogRef.current && onClose()}
      className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-[2rem] bg-sand-50 p-0 text-sage-950 shadow-2xl backdrop:bg-sage-950/60 backdrop:backdrop-blur-sm dark:bg-sage-900 dark:text-sand-100"
    >
      <div className="max-h-[85dvh] overflow-y-auto p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-clay-500/15 text-clay-500">
            <MessageSquareHeart className="h-6 w-6" />
          </span>
          <button onClick={onClose} className="btn-ghost h-9 w-9 !p-0" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        {state?.success ? (
          <div className="py-6 text-center">
            <h2 className="font-display text-2xl font-semibold">Thank you 🙏</h2>
            <p className="muted mt-2">{state.success}</p>
            <button onClick={onClose} className="btn-primary mt-6">Close</button>
          </div>
        ) : (
          <form action={action} className="mt-4 space-y-5">
            <div>
              <h2 className="font-display text-2xl font-semibold">Sorry to see you go</h2>
              <p className="muted mt-1 text-sm">Help us improve — it takes 30 seconds.</p>
            </div>

            <fieldset>
              <legend className="label">Why are you not continuing?</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {REASONS.map((r) => (
                  <label
                    key={r}
                    className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-sand-200 px-3 py-2.5 text-sm transition has-[:checked]:border-sage-600 has-[:checked]:bg-sage-600/10 dark:border-white/10"
                  >
                    <input type="checkbox" name="reasons" value={r} className="h-4 w-4 accent-sage-600" />
                    {r}
                  </label>
                ))}
              </div>
              <input name="other_reason" maxLength={200} className="input mt-2" placeholder="Other reason (optional)" />
            </fieldset>

            <div>
              <label htmlFor="suggestions" className="label">Any suggestions?</label>
              <textarea
                id="suggestions"
                name="suggestions"
                rows={3}
                maxLength={2000}
                className="input resize-none"
                placeholder="What would make Niyama Yoga right for you?"
              />
            </div>

            <FormMessage state={state} />
            <SubmitButton pendingText="Sending…">Submit feedback</SubmitButton>
          </form>
        )}
      </div>
    </dialog>
  );
}

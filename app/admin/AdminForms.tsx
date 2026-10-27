"use client";

import { RefreshCw } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import { addLiveClass, runLifecycleNow } from "@/app/actions/admin";
import { FormMessage, SubmitButton } from "@/components/SubmitButton";

export function RunLifecycleButton() {
  const [state, action] = useActionState(runLifecycleNow, undefined);
  return (
    <form action={action} className="flex flex-col items-start gap-2">
      <SubmitButton className="btn-secondary" pendingText="Checking…">
        <RefreshCw className="h-4 w-4" /> Run trial check now
      </SubmitButton>
      <FormMessage state={state} />
    </form>
  );
}

export function AddClassForm() {
  const [state, action] = useActionState(addLiveClass, undefined);
  const [offset, setOffset] = useState(0);
  useEffect(() => setOffset(new Date().getTimezoneOffset()), []);

  return (
    <form action={action} className="grid gap-3 sm:grid-cols-2">
      <input type="hidden" name="tz_offset" value={offset} />
      <input name="title" required placeholder="Class title" className="input sm:col-span-2" />
      <input name="description" placeholder="Short description (optional)" className="input sm:col-span-2" />
      <input name="instructor" required defaultValue="Chandra Pratap" placeholder="Instructor" className="input" />
      <select name="level" defaultValue="all" className="input">
        <option value="all">All levels</option>
        <option value="beginner">Beginner</option>
        <option value="intermediate">Intermediate</option>
        <option value="advanced">Advanced</option>
      </select>
      <input name="starts_at" type="datetime-local" required className="input" aria-label="Start time" />
      <input name="duration_minutes" type="number" min={10} max={240} defaultValue={60} className="input" aria-label="Duration (minutes)" />
      <div className="sm:col-span-2">
        <FormMessage state={state} />
      </div>
      <SubmitButton className="btn-primary sm:col-span-2" pendingText="Saving…">
        Schedule class
      </SubmitButton>
    </form>
  );
}

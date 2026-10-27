import Link from "next/link";
import { AlertCircle, Clock, Hourglass, PartyPopper, Sparkles } from "lucide-react";
import { effectiveStatus, membershipLapsed, trialTimeLeft } from "@/lib/lifecycle";
import { getPlan } from "@/lib/plans";
import type { Profile } from "@/lib/types";

export function StatusBanner({ profile }: { profile: Profile }) {
  const status = effectiveStatus(profile);
  const plan = getPlan(profile.selected_plan);

  if (membershipLapsed(profile)) {
    return (
      <Banner tone="clay" icon={<AlertCircle className="h-6 w-6" />} title="Your membership has ended">
        Renew to keep joining live classes.
        <Actions upgrade />
      </Banner>
    );
  }

  if (status === "trial") {
    const { days, hours } = trialTimeLeft(profile.trial_ends_at);
    return (
      <Banner tone="sage" icon={<PartyPopper className="h-6 w-6" />} title="Your 3-Day Free Trial Has Started!">
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-4 w-4" /> {days}d {hours}h left · enjoy unlimited live classes on the {plan?.name} plan.
        </span>
      </Banner>
    );
  }

  if (status === "trial_expired") {
    return (
      <Banner tone="clay" icon={<Hourglass className="h-6 w-6" />} title="Your free trial has ended">
        Continue your practice with the {plan?.name} plan, or tell us why it&apos;s not for you.
        <Actions upgrade decline />
      </Banner>
    );
  }

  if (status === "pending_payment") {
    return (
      <Banner tone="sand" icon={<Hourglass className="h-6 w-6" />} title="Upgrade requested — awaiting confirmation">
        Our team will confirm your {plan?.name} membership shortly.
        {process.env.NEXT_PUBLIC_PAYMENT_LINK && (
          <div className="mt-3">
            <a href={process.env.NEXT_PUBLIC_PAYMENT_LINK} target="_blank" rel="noopener noreferrer" className="btn-primary">
              Complete payment
            </a>
          </div>
        )}
      </Banner>
    );
  }

  if (status === "declined") {
    return (
      <Banner tone="sand" icon={<Sparkles className="h-6 w-6" />} title="We'd love to have you back">
        Thank you for your feedback. Whenever you&apos;re ready, your mat is waiting.
        <Actions upgrade />
      </Banner>
    );
  }

  return null;
}

function Actions({ upgrade, decline }: { upgrade?: boolean; decline?: boolean }) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {upgrade && (
        <Link href="/dashboard/membership?action=upgrade" className="btn-primary">
          Upgrade membership
        </Link>
      )}
      {decline && (
        <Link href="/dashboard/membership?action=decline" className="btn-secondary">
          Not interested
        </Link>
      )}
    </div>
  );
}

const tones = {
  sage: "bg-gradient-to-r from-sage-600 to-sage-500 text-white",
  clay: "bg-gradient-to-r from-clay-500 to-clay-400 text-white",
  sand: "glass",
};

function Banner({
  tone,
  icon,
  title,
  children,
}: {
  tone: keyof typeof tones;
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`animate-fade-up flex gap-4 rounded-3xl p-5 shadow-lg sm:p-6 ${tones[tone]}`} role="status">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20">{icon}</span>
      <div>
        <p className="font-display text-lg font-semibold sm:text-xl">{title}</p>
        <div className={`mt-1 text-sm ${tone === "sand" ? "muted" : "text-white/90"}`}>{children}</div>
      </div>
    </div>
  );
}

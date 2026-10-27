import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { PLANS, formatPrice } from "@/lib/plans";

export function PricingCards() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {PLANS.map((plan) => {
        const featured = plan.id === "3m";
        const vip = plan.id === "12m";
        return (
          <div
            key={plan.id}
            className={`relative flex flex-col rounded-3xl p-6 transition duration-300 hover:-translate-y-1 ${
              featured
                ? "bg-sage-700 text-sand-50 shadow-2xl shadow-sage-900/30 ring-2 ring-sage-500 dark:bg-sage-800"
                : "glass"
            }`}
          >
            {plan.badge && (
              <span
                className={`absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                  vip ? "bg-clay-500 text-white" : "bg-sand-100 text-sage-800"
                }`}
              >
                <Sparkles className="h-3 w-3" /> {plan.badge}
              </span>
            )}
            <h3 className="font-display text-xl font-semibold">{plan.name}</h3>
            <p className={`mt-1 text-sm ${featured ? "text-sand-100/80" : "muted"}`}>{plan.tagline}</p>

            <div className="mt-6 flex items-baseline gap-1">
              <span className="font-display text-4xl font-semibold">{formatPrice(plan.perMonth)}</span>
              <span className={`text-sm ${featured ? "text-sand-100/70" : "muted"}`}>/month</span>
            </div>
            <p className={`mt-1 text-sm ${featured ? "text-sand-100/80" : "muted"}`}>
              {plan.months === 1 ? "Billed monthly" : `${formatPrice(plan.price)} billed every ${plan.months} months`}
            </p>
            <p className="mt-2 h-6">
              {plan.savingsPct > 0 && (
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    featured ? "bg-sand-50/20 text-sand-50" : "bg-clay-500/15 text-clay-600 dark:text-clay-300"
                  }`}
                >
                  Save {plan.savingsPct}%
                </span>
              )}
            </p>

            <ul className="mt-5 flex-1 space-y-3 text-sm">
              {plan.highlights.map((h) => (
                <li key={h} className="flex gap-2.5">
                  <Check className={`mt-0.5 h-4 w-4 shrink-0 ${featured ? "text-sage-200" : "text-sage-600 dark:text-sage-400"}`} />
                  {h}
                </li>
              ))}
            </ul>

            <Link
              href={`/start?plan=${plan.id}`}
              className={`mt-7 ${featured ? "btn bg-sand-50 text-sage-800 hover:bg-white" : vip ? "btn-clay" : "btn-primary"}`}
            >
              Start 3-day free trial
            </Link>
            <p className={`mt-2 text-center text-xs ${featured ? "text-sand-100/60" : "muted"}`}>No card required</p>
          </div>
        );
      })}
    </div>
  );
}

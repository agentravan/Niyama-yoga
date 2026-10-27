export type PlanId = "1m" | "3m" | "6m" | "12m";

export type Plan = {
  id: PlanId;
  name: string;
  months: number;
  price: number;
  perMonth: number;
  savingsPct: number;
  badge?: string;
  tagline: string;
  highlights: string[];
};

export const CURRENCY = "₹";

// Pricing ladder: the 1-month plan anchors a high monthly rate (flexibility
// premium); each longer commitment lowers the effective monthly rate while
// raising upfront cash and lifetime value. Annual is the profit anchor.
export const PLANS: Plan[] = [
  {
    id: "1m",
    name: "Monthly",
    months: 1,
    price: 2499,
    perMonth: 2499,
    savingsPct: 0,
    tagline: "Try the rhythm, no long commitment.",
    highlights: ["Unlimited standard live classes", "Community circle access", "Weekly class schedule"],
  },
  {
    id: "3m",
    name: "Quarterly",
    months: 3,
    price: 5999,
    perMonth: 2000,
    savingsPct: 20,
    badge: "Most Popular",
    tagline: "Long enough to feel real change.",
    highlights: ["Everything in Monthly", "Monthly progress check-in", "Beginner foundations series"],
  },
  {
    id: "6m",
    name: "Half-Yearly",
    months: 6,
    price: 10499,
    perMonth: 1750,
    savingsPct: 30,
    tagline: "Build a practice that sticks.",
    highlights: ["Everything in Quarterly", "Recorded session library", "Priority seating in live classes"],
  },
  {
    id: "12m",
    name: "Annual VIP",
    months: 12,
    price: 17999,
    perMonth: 1500,
    savingsPct: 40,
    badge: "Best Value",
    tagline: "Full VIP access, best price per class.",
    highlights: ["Everything in Half-Yearly", "Personal posture-correction tips", "Nutrition & lifestyle guides"],
  },
];

export const PLAN_RANK: Record<PlanId, number> = { "1m": 1, "3m": 2, "6m": 3, "12m": 4 };

export function getPlan(id?: string | null): Plan | undefined {
  return PLANS.find((p) => p.id === id);
}

export function isPlanId(id: unknown): id is PlanId {
  return typeof id === "string" && id in PLAN_RANK;
}

export function formatPrice(n: number) {
  return `${CURRENCY}${n.toLocaleString("en-IN")}`;
}

/** Feature matrix for the comparison table. `minPlan` = cheapest plan that includes it. */
export const FEATURES: { key: string; label: string; minPlan: PlanId; note?: string }[] = [
  { key: "live", label: "Unlimited standard live classes", minPlan: "1m" },
  { key: "community", label: "Community circle & Q&A", minPlan: "1m" },
  { key: "trial", label: "3-day free trial", minPlan: "1m" },
  { key: "checkin", label: "Monthly progress check-in", minPlan: "3m" },
  { key: "foundations", label: "Beginner foundations series", minPlan: "3m" },
  { key: "recordings", label: "Recorded session library", minPlan: "6m" },
  { key: "priority", label: "Priority seating in live classes", minPlan: "6m" },
  { key: "posture", label: "Personalised posture-correction tips", minPlan: "12m" },
  { key: "nutrition", label: "Nutrition & lifestyle guides", minPlan: "12m" },
  { key: "vip", label: "VIP workshops & retreats discount", minPlan: "12m" },
];

export function planIncludes(planId: PlanId, featureKey: string) {
  const f = FEATURES.find((x) => x.key === featureKey);
  return !!f && PLAN_RANK[planId] >= PLAN_RANK[f.minPlan];
}

export const EXPERIENCE_LEVELS = [
  { id: "beginner", label: "Beginner", hint: "New to yoga or returning after a break" },
  { id: "intermediate", label: "Intermediate", hint: "Comfortable with sun salutations & basic flows" },
  { id: "advanced", label: "Advanced", hint: "Regular practice, inversions & arm balances" },
] as const;

export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number]["id"];

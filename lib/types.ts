import type { ExperienceLevel, PlanId } from "@/lib/plans";

export type MembershipStatus = "trial" | "trial_expired" | "pending_payment" | "active" | "declined";

export type Profile = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  experience_level: ExperienceLevel;
  selected_plan: PlanId;
  membership_status: MembershipStatus;
  trial_started_at: string;
  trial_ends_at: string;
  follow_up_sent_at: string | null;
  membership_started_at: string | null;
  membership_ends_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Feedback = {
  id: string;
  user_id: string | null;
  full_name: string | null;
  email: string;
  plan: string | null;
  reasons: string[];
  suggestions: string | null;
  created_at: string;
};

export type LiveClass = {
  id: string;
  title: string;
  description: string | null;
  instructor: string;
  level: "all" | "beginner" | "intermediate" | "advanced";
  starts_at: string;
  duration_minutes: number;
  room_name: string;
  created_at: string;
};

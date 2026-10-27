export const SITE_NAME = "Niyama Yoga";
export const TRIAL_DAYS = 3;

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

export const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "Chandrapratap.cp30@gmail.com").trim().toLowerCase();

export function isAdminEmail(email?: string | null) {
  return !!email && email.trim().toLowerCase() === ADMIN_EMAIL;
}

export const supabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

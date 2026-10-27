import { SITE_NAME, SITE_URL } from "@/lib/config";
import { formatPrice, getPlan } from "@/lib/plans";
import type { Profile } from "@/lib/types";

export const ADMIN_NOTIFY_EMAIL = process.env.ADMIN_NOTIFY_EMAIL || "Chandrapratap.cp30@gmail.com";

type SendArgs = { to: string; subject: string; html: string; replyTo?: string };

/** Sends via the Resend REST API. Never throws — email failure must not break signup. */
export async function sendEmail({ to, subject, html, replyTo }: SendArgs): Promise<{ ok: boolean; error?: string }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn(`[email] RESEND_API_KEY missing — skipped "${subject}" to ${to}`);
    return { ok: false, error: "RESEND_API_KEY not configured" };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || `${SITE_NAME} <onboarding@resend.dev>`,
        to: [to],
        subject,
        html,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    });
    if (!res.ok) {
      const error = await res.text();
      console.error(`[email] Resend error ${res.status}: ${error}`);
      return { ok: false, error };
    }
    return { ok: true };
  } catch (e) {
    console.error("[email] send failed", e);
    return { ok: false, error: String(e) };
  }
}

const esc = (v: unknown) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" }) + " IST";

function layout(title: string, body: string) {
  return `<!doctype html><html><body style="margin:0;background:#f4f1ea;font-family:Segoe UI,Helvetica,Arial,sans-serif;color:#1f2a24">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px">
    <div style="font-size:20px;font-weight:700;color:#3f6b4f;margin-bottom:16px">🌿 ${SITE_NAME}</div>
    <div style="background:#ffffff;border-radius:16px;padding:28px;border:1px solid #e6e0d4">
      <h1 style="font-size:20px;margin:0 0 16px">${title}</h1>${body}
    </div>
    <p style="font-size:12px;color:#8a8577;text-align:center;margin-top:20px">${SITE_NAME} · <a href="${SITE_URL}" style="color:#8a8577">${SITE_URL}</a></p>
  </div></body></html>`;
}

function table(rows: [string, unknown][]) {
  return `<table style="width:100%;border-collapse:collapse;font-size:14px">${rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px 0;color:#6b675d;width:40%;vertical-align:top">${esc(k)}</td><td style="padding:8px 0;font-weight:600">${esc(v)}</td></tr>`,
    )
    .join("")}</table>`;
}

const button = (href: string, label: string, color = "#3f6b4f") =>
  `<a href="${href}" style="display:inline-block;background:${color};color:#fff;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:600;margin:8px 8px 0 0">${label}</a>`;

function planLabel(id?: string | null) {
  const p = getPlan(id);
  return p ? `${p.name} (${p.months} mo · ${formatPrice(p.price)})` : (id ?? "—");
}

export function newLeadEmail(p: Profile, isReturning = false) {
  return {
    subject: `🧘 New ${isReturning ? "plan selection" : "free trial"}: ${p.full_name} — ${getPlan(p.selected_plan)?.name ?? p.selected_plan}`,
    html: layout(
      "New customer started a 3-day free trial",
      table([
        ["Full name", p.full_name],
        ["Email", p.email],
        ["Phone", p.phone],
        ["Experience", p.experience_level],
        ["Selected plan", planLabel(p.selected_plan)],
        ["Trial started", fmtDate(p.trial_started_at)],
        ["Trial ends", fmtDate(p.trial_ends_at)],
      ]) + `<p>${button(`${SITE_URL}/admin`, "Open admin portal")}</p>`,
    ),
    replyTo: p.email,
  };
}

export function trialEndedEmail(p: Profile) {
  const plan = getPlan(p.selected_plan);
  return {
    subject: `Your ${SITE_NAME} free trial has ended — continue your practice 🌿`,
    html: layout(
      `Namaste ${esc(p.full_name.split(" ")[0])}, your 3-day trial is complete`,
      `<p style="line-height:1.6">Thank you for practising with us. To keep joining live classes, activate your
      <strong>${esc(plan?.name ?? "membership")}</strong> plan${plan ? ` — ${formatPrice(plan.price)} for ${plan.months} month${plan.months > 1 ? "s" : ""} (${formatPrice(plan.perMonth)}/mo)` : ""}.</p>
      <p>${button(`${SITE_URL}/dashboard/membership?action=upgrade`, "Upgrade my membership")}
      ${button(`${SITE_URL}/dashboard/membership?action=decline`, "Not interested", "#a8a191")}</p>
      <p style="font-size:13px;color:#6b675d;line-height:1.6">Not continuing? Tap “Not interested” — a 30-second feedback form helps us improve.</p>`,
    ),
  };
}

export function feedbackEmail(f: { full_name?: string | null; email: string; plan?: string | null; reasons: string[]; suggestions?: string | null }) {
  return {
    subject: `💬 Trial feedback from ${f.full_name || f.email}`,
    html: layout(
      "A customer declined to continue",
      table([
        ["Name", f.full_name || "—"],
        ["Email", f.email],
        ["Plan chosen", planLabel(f.plan)],
        ["Reasons", f.reasons.join(", ") || "—"],
        ["Suggestions", f.suggestions || "—"],
        ["Submitted", fmtDate(new Date().toISOString())],
      ]),
    ),
    replyTo: f.email,
  };
}

export function upgradeRequestEmail(p: Profile, planId: string) {
  return {
    subject: `💰 Upgrade request: ${p.full_name} wants ${getPlan(planId)?.name ?? planId}`,
    html: layout(
      "A customer wants to activate a paid membership",
      table([
        ["Name", p.full_name],
        ["Email", p.email],
        ["Phone", p.phone],
        ["Plan", planLabel(planId)],
        ["Requested", fmtDate(new Date().toISOString())],
      ]) +
        `<p style="line-height:1.6">Confirm payment, then mark the member as <strong>Active</strong> in the admin portal.</p><p>${button(`${SITE_URL}/admin`, "Open admin portal")}</p>`,
    ),
    replyTo: p.email,
  };
}

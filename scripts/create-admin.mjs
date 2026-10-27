// Creates (or resets the password of) the admin account.
// Usage: npm run create-admin   (reads .env.local)
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = (process.env.ADMIN_EMAIL || "Chandrapratap.cp30@gmail.com").trim().toLowerCase();
const password = process.env.ADMIN_INITIAL_PASSWORD;

if (!url || !key) {
  console.error("✖ Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}
if (!password || password.length < 8) {
  console.error("✖ Set ADMIN_INITIAL_PASSWORD (min 8 characters) in .env.local");
  process.exit(1);
}

const db = createClient(url, key, { auth: { persistSession: false } });

const { data: list, error: listError } = await db.auth.admin.listUsers({ perPage: 1000 });
if (listError) throw listError;
const existing = list.users.find((u) => u.email?.toLowerCase() === email);

if (existing) {
  const { error } = await db.auth.admin.updateUserById(existing.id, { password, email_confirm: true });
  if (error) throw error;
  console.log(`✔ Admin ${email} already existed — password reset.`);
} else {
  const { error } = await db.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { role: "admin" } });
  if (error) throw error;
  console.log(`✔ Admin ${email} created.`);
}
console.log("→ Log in at /login. Change the password after first login (Forgot password → reset).");

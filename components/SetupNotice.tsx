export function SetupNotice() {
  return (
    <div className="rounded-2xl bg-clay-500/10 p-5 text-sm leading-relaxed">
      <p className="font-semibold">Almost there — connect Supabase</p>
      <p className="muted mt-1">
        Add <code>NEXT_PUBLIC_SUPABASE_URL</code>, <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> and{" "}
        <code>SUPABASE_SERVICE_ROLE_KEY</code> to your environment (see <code>README.md</code>) to enable sign-up and login.
      </p>
    </div>
  );
}

import { requireUser } from "@/lib/auth";
import { isAdminEmail } from "@/lib/config";
import { DashboardNav } from "./DashboardNav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <DashboardNav admin={isAdminEmail(user.email)} />
      <div className="mt-8">{children}</div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CreditCard, LayoutDashboard, MonitorPlay, Shield } from "lucide-react";

const tabs = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/live", label: "Live Classes", icon: MonitorPlay },
  { href: "/dashboard/membership", label: "Membership", icon: CreditCard },
];

export function DashboardNav({ admin }: { admin: boolean }) {
  const path = usePathname();
  const items = admin ? [...tabs, { href: "/admin", label: "Admin", icon: Shield }] : tabs;
  return (
    <nav className="glass flex gap-1 overflow-x-auto rounded-full p-1.5" aria-label="Dashboard">
      {items.map(({ href, label, icon: Icon }) => {
        const active = href === "/dashboard" ? path === href : path.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`btn shrink-0 !px-4 ${active ? "bg-sage-600 text-white dark:bg-sage-500 dark:text-sage-950" : "btn-ghost"}`}
          >
            <Icon className="h-4 w-4" /> {label}
          </Link>
        );
      })}
    </nav>
  );
}

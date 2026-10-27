import Link from "next/link";
import { Logo } from "@/components/Logo";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-sage-900/10 px-4 py-12 sm:px-6 dark:border-white/10">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="muted mt-4 max-w-sm text-sm leading-relaxed">
            Live, small-group yoga from the comfort of home. Breathe deeper, move freely and build a practice that lasts.
          </p>
        </div>
        <div className="text-sm">
          <p className="mb-3 font-semibold">Practice</p>
          <ul className="muted space-y-2">
            <li><Link href="/pricing" className="hover:text-sage-600">Memberships</Link></li>
            <li><Link href="/start?plan=3m" className="hover:text-sage-600">Free trial</Link></li>
            <li><Link href="/dashboard/live" className="hover:text-sage-600">Live classes</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="mb-3 font-semibold">Account</p>
          <ul className="muted space-y-2">
            <li><Link href="/login" className="hover:text-sage-600">Log in</Link></li>
            <li><Link href="/dashboard" className="hover:text-sage-600">Dashboard</Link></li>
            <li><a href="mailto:Chandrapratap.cp30@gmail.com" className="hover:text-sage-600">Contact</a></li>
          </ul>
        </div>
      </div>
      <p className="muted mx-auto mt-10 max-w-6xl text-xs">© {new Date().getFullYear()} Niyama Yoga. All rights reserved.</p>
    </footer>
  );
}

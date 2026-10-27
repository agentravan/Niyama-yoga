import Link from "next/link";
import { getUser } from "@/lib/auth";
import { isAdminEmail } from "@/lib/config";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MobileMenu } from "@/components/MobileMenu";
import { logout } from "@/app/actions/auth";

const links = [
  { href: "/#classes", label: "Classes" },
  { href: "/#how", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
];

export async function Navbar() {
  const user = await getUser();
  const admin = isAdminEmail(user?.email);

  return (
    <header className="sticky top-0 z-40 px-4 pt-3 sm:px-6">
      <nav className="glass mx-auto flex max-w-6xl items-center justify-between rounded-full py-2 pr-2 pl-4">
        <Logo />
        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="btn-ghost !px-3.5 !font-medium">
              {l.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          {user ? (
            <div className="hidden items-center gap-1.5 sm:flex">
              {admin && (
                <Link href="/admin" className="btn-ghost">
                  Admin
                </Link>
              )}
              <Link href="/dashboard" className="btn-primary">
                Dashboard
              </Link>
              <form action={logout}>
                <button className="btn-ghost">Log out</button>
              </form>
            </div>
          ) : (
            <div className="hidden items-center gap-1.5 sm:flex">
              <Link href="/login" className="btn-ghost">
                Log in
              </Link>
              <Link href="/start?plan=3m" className="btn-primary">
                Start free trial
              </Link>
            </div>
          )}
          <MobileMenu links={links} signedIn={!!user} admin={admin} logoutAction={logout} />
        </div>
      </nav>
    </header>
  );
}

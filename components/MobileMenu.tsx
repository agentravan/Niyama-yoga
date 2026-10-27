"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";

type Props = {
  links: { href: string; label: string }[];
  signedIn: boolean;
  admin: boolean;
  logoutAction: () => Promise<void>;
};

export function MobileMenu({ links, signedIn, admin, logoutAction }: Props) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <div className="md:hidden">
      <button onClick={() => setOpen((o) => !o)} className="btn-ghost h-10 w-10 !p-0" aria-label="Menu" aria-expanded={open}>
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
      {open && (
        <div className="glass animate-fade-up absolute inset-x-4 top-[4.5rem] flex flex-col gap-1 rounded-3xl p-3 sm:inset-x-6">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={close} className="btn-ghost !justify-start">
              {l.label}
            </Link>
          ))}
          <div className="my-1 h-px bg-sage-900/10 dark:bg-white/10" />
          {signedIn ? (
            <>
              {admin && (
                <Link href="/admin" onClick={close} className="btn-ghost !justify-start">
                  Admin portal
                </Link>
              )}
              <Link href="/dashboard" onClick={close} className="btn-primary">
                Dashboard
              </Link>
              <form action={logoutAction}>
                <button className="btn-ghost w-full">Log out</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" onClick={close} className="btn-secondary">
                Log in
              </Link>
              <Link href="/start?plan=3m" onClick={close} className="btn-primary">
                Start 3-day free trial
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}

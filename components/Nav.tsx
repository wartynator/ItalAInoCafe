"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const tabs = [
  { href: "/", label: "Feed" },
  { href: "/cafes", label: "Cafés" },
  { href: "/new", label: "Add" },
  { href: "/me", label: "Me" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <>
      {/* Top nav (desktop) */}
      <header className="hidden md:block border-b border-[var(--color-line)] bg-[var(--color-bg)]/80 backdrop-blur sticky top-0 z-30">
        <div className="mx-auto flex w-full max-w-[1100px] items-center justify-between px-5 py-4">
          <Link href="/" className="font-display text-xl tracking-tight">
            ItalAIno<span className="text-[var(--color-clay)]">.</span>café
          </Link>
          <nav className="flex items-center gap-1">
            {tabs.map((t) => {
              const active = t.href === "/" ? pathname === "/" : pathname.startsWith(t.href);
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  className={
                    "px-3 py-1.5 rounded-full text-sm transition-colors " +
                    (active
                      ? "bg-[var(--color-ink)] text-[var(--color-bg)]"
                      : "text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]")
                  }
                >
                  {t.label}
                </Link>
              );
            })}
            <AuthButton />
          </nav>
        </div>
      </header>

      {/* Mobile header (logo only) */}
      <header className="md:hidden flex items-center justify-between px-5 py-4 border-b border-[var(--color-line)]">
        <Link href="/" className="font-display text-lg tracking-tight">
          ItalAIno<span className="text-[var(--color-clay)]">.</span>café
        </Link>
        <AuthButton />
      </header>

      {/* Bottom nav (mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 border-t border-[var(--color-line)] bg-[var(--color-bg)]/95 backdrop-blur">
        <div className="grid grid-cols-4">
          {tabs.map((t) => {
            const active = t.href === "/" ? pathname === "/" : pathname.startsWith(t.href);
            return (
              <Link
                key={t.href}
                href={t.href}
                className={
                  "flex items-center justify-center py-4 text-sm " +
                  (active ? "text-[var(--color-ink)]" : "text-[var(--color-ink-soft)]")
                }
              >
                <span className={active ? "font-medium" : ""}>{t.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

function AuthButton() {
  const { signOut } = useAuthActions();
  const me = useQuery(api.users.me);
  return (
    <>
      <Authenticated>
        <button
          onClick={() => void signOut()}
          className="ml-2 text-sm text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
          title={me?.email ?? undefined}
        >
          Sign out
        </button>
      </Authenticated>
      <Unauthenticated>
        <Link
          href="/sign-in"
          className="ml-2 text-sm text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
        >
          Sign in
        </Link>
      </Unauthenticated>
    </>
  );
}

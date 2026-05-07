"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const tabs = [
  { href: "/", label: "Feed", desc: "Latest visits" },
  { href: "/cafes", label: "Cafés", desc: "Map & list" },
  { href: "/new", label: "New coffee", desc: "Tag a place you've been" },
  { href: "/me", label: "Me", desc: "Your profile" },
];

export function SideNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <header className="md:hidden sticky top-0 z-30 flex items-center justify-between border-b border-[var(--color-line)] bg-[color:var(--color-bg)]/95 px-5 py-3 backdrop-blur">
        <Link href="/" className="font-display text-lg tracking-tight">
          ItalAIno<span className="text-[var(--color-clay)]">·</span>caffè
        </Link>
        <button
          aria-label="Open menu"
          onClick={() => setOpen(true)}
          className="rounded-full border border-[var(--color-line)] px-3 py-1.5 text-sm"
        >
          Menu
        </button>
      </header>

      {open && (
        <button
          aria-label="Close menu"
          onClick={() => setOpen(false)}
          className="md:hidden fixed inset-0 z-40 bg-black/30"
        />
      )}

      <aside
        className={
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-[var(--color-line)] bg-[color:var(--color-surface)] transition-transform " +
          "md:translate-x-0 md:w-64 " +
          (open ? "translate-x-0" : "-translate-x-full")
        }
      >
        <div className="flex items-center justify-between px-6 py-6">
          <Link href="/" className="font-display text-xl tracking-tight">
            ItalAIno<span className="text-[var(--color-clay)]">·</span>caffè
          </Link>
          <button
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="md:hidden text-sm text-[var(--color-ink-soft)]"
          >
            Close
          </button>
        </div>

        <Authenticated>
          <nav className="flex-1 space-y-1 px-3">
            {tabs.map((t) => {
              const active =
                t.href === "/" ? pathname === "/" : pathname.startsWith(t.href);
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  className={
                    "block rounded-xl px-3 py-2.5 text-sm transition-colors " +
                    (active
                      ? "btn-primary"
                      : "text-[var(--color-ink)] hover:bg-[color:var(--color-bg)]")
                  }
                >
                  <div className="text-sm font-medium leading-tight">
                    {t.label}
                  </div>
                  <div
                    className={
                      "text-xs " +
                      (active
                        ? "text-[#f4ead0]/70"
                        : "text-[var(--color-ink-soft)]")
                    }
                  >
                    {t.desc}
                  </div>
                </Link>
              );
            })}
          </nav>
          <UserCard />
        </Authenticated>

        <Unauthenticated>
          <div className="flex-1 px-6">
            <p className="text-sm text-[var(--color-ink-soft)]">
              Sign in to log café visits and read your friends&apos; feed.
            </p>
          </div>
          <div className="px-6 py-6">
            <Link
              href="/sign-in"
              className="btn-primary block rounded-full px-4 py-2.5 text-center text-sm"
            >
              Sign in
            </Link>
          </div>
        </Unauthenticated>
      </aside>
    </>
  );
}

function UserCard() {
  const { signOut } = useAuthActions();
  const me = useQuery(api.users.me);
  const display = me?.name ?? me?.email ?? "You";
  const initial = (me?.name ?? me?.email ?? "?").trim().charAt(0).toUpperCase();
  return (
    <div className="border-t border-[var(--color-line)] px-4 py-4">
      <div className="flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-full bg-[var(--color-sage-soft)] text-sm font-medium">
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{display}</p>
          {me?.email && (
            <p className="truncate text-xs text-[var(--color-ink-soft)]">{me.email}</p>
          )}
        </div>
        <button
          onClick={() => void signOut()}
          className="text-xs text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

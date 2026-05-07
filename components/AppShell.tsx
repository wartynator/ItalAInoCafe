"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Authenticated } from "convex/react";
import { SideNav } from "./SideNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isSignIn = pathname === "/sign-in";
  const onNewPage = pathname === "/new" || pathname.startsWith("/visits/");

  if (isSignIn) {
    return (
      <main className="mx-auto w-full max-w-[1100px] px-5 pt-6 md:pt-10">
        {children}
      </main>
    );
  }

  return (
    <>
      <SideNav />
      <main className="md:pl-64">
        <div className="mx-auto w-full max-w-[900px] px-5 pt-6 pb-20 md:pt-10 md:pb-10">
          {children}
        </div>
      </main>
      <Authenticated>
        {!onNewPage && (
          <Link
            href="/new"
            aria-label="New coffee"
            className="btn-primary fixed bottom-5 right-5 z-30 grid h-14 w-14 place-items-center rounded-full text-2xl shadow-lg md:hidden"
          >
            +
          </Link>
        )}
      </Authenticated>
    </>
  );
}

"use client";

import { usePathname } from "next/navigation";
import { SideNav } from "./SideNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isSignIn = pathname === "/sign-in";

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
        <div className="mx-auto w-full max-w-[900px] px-5 pt-6 md:pt-10">
          {children}
        </div>
      </main>
    </>
  );
}

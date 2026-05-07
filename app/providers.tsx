"use client";

import { ReactNode, useMemo } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexAuthNextjsProvider } from "@convex-dev/auth/nextjs";

export function Providers({ children }: { children: ReactNode }) {
  const client = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!url) {
      // Surfaces a clearer error than Convex's default during first-time setup.
      throw new Error(
        "NEXT_PUBLIC_CONVEX_URL is not set. Run `npx convex dev` once and copy the URL to .env.local.",
      );
    }
    return new ConvexReactClient(url);
  }, []);

  return (
    <ConvexAuthNextjsProvider client={client}>{children}</ConvexAuthNextjsProvider>
  );
}

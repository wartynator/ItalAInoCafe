import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { Providers } from "./providers";
import { AppShell } from "@/components/AppShell";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ItalAIno Café — a quiet log of good coffee",
  description:
    "A small place to log cafés you've visited — environment, coffee, and location, with notes, photos, and a map.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ConvexAuthNextjsServerProvider>
      <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
        <body className="min-h-screen">
          <Providers>
            <AppShell>{children}</AppShell>
          </Providers>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}

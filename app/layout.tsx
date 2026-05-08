import type { Metadata, Viewport } from "next";
import { Inter, Fraunces } from "next/font/google";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { Providers } from "./providers";
import { AppShell } from "@/components/AppShell";
import { PWARegister } from "@/components/PWARegister";
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
  title: "ItalAIno · Caffè — il diario del buon caffè",
  description:
    "Un piccolo diario dei caffè visitati — atmosfera, caffè, posizione, con note, foto e una mappa.",
  applicationName: "ItalAIno · Caffè",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ItalAIno",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4ead0" },
    { media: "(prefers-color-scheme: dark)", color: "#2a160c" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ConvexAuthNextjsServerProvider>
      <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
        <body className="min-h-screen">
          <Providers>
            <AppShell>{children}</AppShell>
          </Providers>
          <PWARegister />
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}

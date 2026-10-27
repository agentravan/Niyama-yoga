import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import { Background } from "@/components/Background";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { themeInitScript } from "@/components/ThemeToggle";
import { SITE_URL } from "@/lib/config";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap" });

// Every page reads the auth cookie (navbar, guards), so never prerender.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Niyama Yoga — Live Online Yoga Classes", template: "%s · Niyama Yoga" },
  description:
    "Join live, small-group yoga classes from home. Start your 3-day free trial — Hatha, Vinyasa, Yin and meditation with expert guidance.",
  icons: { icon: "/icon.svg" },
  openGraph: { title: "Niyama Yoga", description: "Live online yoga classes. Start your 3-day free trial.", type: "website" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf8f3" },
    { media: "(prefers-color-scheme: dark)", color: "#0d1712" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-dvh font-sans">
        <Background />
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}

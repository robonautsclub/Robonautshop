import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { DEFAULT_OG_IMAGE } from "@/lib/seo/metadata";
import { getSiteUrl } from "@/lib/site-url";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Robonautsshop",
    template: "%s · Robonautsshop",
  },
  description:
    "Robotics parts, kits, and project guides for builders in Bangladesh.",
  metadataBase: new URL(getSiteUrl()),
  openGraph: {
    siteName: "Robonautsshop",
    type: "website",
    locale: "en_BD",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: { card: "summary" },
  icons: {
    icon: [{ url: "/logo.png", type: "image/png", sizes: "1024x1024" }],
    shortcut: "/logo.png",
    apple: [{ url: "/logo.png", type: "image/png", sizes: "1024x1024" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}

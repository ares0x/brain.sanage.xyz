import type { Metadata } from "next";
import { Noto_Sans_SC, Noto_Serif_SC, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { createMetadata } from "@/config/seo";
import { GoogleAnalytics } from "@/lib/analytics/google-analytics";
import { SiteNav } from "@/components/design/site-nav";
import { SiteFooter } from "@/components/design/site-footer";

const notoSans = Noto_Sans_SC({
  variable: "--font-sans",
  preload: false,
  weight: ["400", "500", "700"],
  display: "swap",
});

const notoSerif = Noto_Serif_SC({
  variable: "--font-serif",
  preload: false,
  weight: ["400", "700", "900"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = createMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      dir="ltr"
      className={`${notoSans.variable} ${notoSerif.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        <GoogleAnalytics />
        <meta name="theme-color" content="#FDF8F3" />
        <meta name="msapplication-TileColor" content="#FDF8F3" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <SiteNav />
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}

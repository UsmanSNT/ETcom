import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LanguageProvider } from "@/components/LanguageProvider";
import { SiteChrome } from "@/components/SiteChrome";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "ETCOMPANY",
    template: "%s | ETCOMPANY",
  },
  description: "ETCOMPANY — Smart Solution, Better Future",
  openGraph: {
    type: "website",
    siteName: "ETCOMPANY",
    title: "ETCOMPANY — Smart Solution, Better Future",
    description: "AI, platform and embedded technology solutions from ETCOMPANY.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ETCOMPANY — Smart Solution, Better Future",
    description: "AI, platform and embedded technology solutions from ETCOMPANY.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <LanguageProvider>
          <SiteChrome>{children}</SiteChrome>
        </LanguageProvider>
      </body>
    </html>
  );
}

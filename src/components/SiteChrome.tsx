"use client";

import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { MobileBottomNav } from "./MobileBottomNav";
import { VisitTracker } from "./VisitTracker";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <VisitTracker />
      <Header />
      <main style={{ paddingTop: 82 }}>{children}</main>
      <Footer />
      <MobileBottomNav />
    </>
  );
}

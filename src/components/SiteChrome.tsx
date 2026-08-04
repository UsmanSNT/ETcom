"use client";

import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { MobileBottomNav } from "./MobileBottomNav";
import { VisitTracker } from "./VisitTracker";
import styles from "./SiteChrome.module.css";

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
      <main className={styles.main}>{children}</main>
      <Footer />
      <MobileBottomNav />
    </>
  );
}

"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useLanguage } from "./LanguageProvider";

export function VisitTracker() {
  const pathname = usePathname();
  const { locale } = useLanguage();

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    fetch("/api/visits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname, locale }),
      keepalive: true,
    }).catch(() => {});
  }, [pathname, locale]);

  return null;
}

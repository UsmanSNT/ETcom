"use client";

import { useEffect, useState } from "react";

export function useSiteConfig() {
  const [config, setConfig] = useState<Record<string, string>>({});

  useEffect(() => {
    let active = true;
    fetch("/api/site-config", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : {}))
      .then((data) => {
        if (active) setConfig(data);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  return config;
}

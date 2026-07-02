"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import type {
  Location,
  Service,
  ServiceCategory,
  TenantConfig,
  TenantPublic,
} from "@/lib/supabase/types";
import { cssFontStack } from "@/lib/fonts";

interface TenantContextValue {
  tenant: TenantPublic;
  locations: Location[];
  categories: ServiceCategory[];
  services: Service[];
}

const TenantContext = createContext<TenantContextValue | null>(null);

interface ThemeProviderProps {
  tenant: TenantPublic;
  locations: Location[];
  categories: ServiceCategory[];
  services: Service[];
  children: ReactNode;
}

export function ThemeProvider({
  tenant,
  locations,
  categories,
  services,
  children,
}: ThemeProviderProps) {
  const value = useMemo(
    () => ({ tenant, locations, categories, services }),
    [tenant, locations, categories, services],
  );

  useEffect(() => {
    const cfg = (tenant.config ?? {}) as TenantConfig;
    const styles = cfg.styles ?? {};
    const root = document.documentElement;
    // These must live on :root — the Tailwind @theme tokens (e.g. --color-brand,
    // --font-display) reference var(--tenant-*) and are resolved at :root, so
    // setting them only on a nested wrapper would have no effect.
    if (styles.primary)
      root.style.setProperty("--tenant-primary", styles.primary);
    if (styles.secondary)
      root.style.setProperty("--tenant-accent", styles.secondary);
    if (styles.radius) root.style.setProperty("--tenant-radius", styles.radius);
    if (styles.fontDisplay)
      root.style.setProperty(
        "--tenant-font-display",
        cssFontStack(styles.fontDisplay),
      );
    if (styles.fontBody)
      root.style.setProperty(
        "--tenant-font-sans",
        cssFontStack(styles.fontBody),
      );
    return () => {
      root.style.removeProperty("--tenant-primary");
      root.style.removeProperty("--tenant-accent");
      root.style.removeProperty("--tenant-radius");
      root.style.removeProperty("--tenant-font-display");
      root.style.removeProperty("--tenant-font-sans");
    };
  }, [tenant.config]);

  return (
    <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
  );
}

export function useTenant(): TenantContextValue {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error("useTenant must be used inside ThemeProvider");
  return ctx;
}

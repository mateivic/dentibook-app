import { notFound } from "next/navigation";
import { getTenantBundlePublic } from "@/lib/tenant";
import { ThemeProvider } from "@/features/tenant-theme/theme-provider";
import { LanguageProvider } from "@/features/i18n/language-provider";
import { buildGoogleFontsHref, cssFontStack } from "@/lib/fonts";
import type { TenantConfig } from "@/lib/supabase/types";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ subdomain: string }>;
}

export default async function SubdomainLayout({
  children,
  params,
}: LayoutProps) {
  const { subdomain } = await params;
  const bundle = await getTenantBundlePublic(subdomain);
  if (!bundle) notFound();

  const cfg = (bundle.tenant.config ?? {}) as TenantConfig;
  const styleVars: Record<string, string> = {};
  const secondary = cfg.secondary ?? cfg.accent;
  if (cfg.primary) styleVars["--tenant-primary"] = cfg.primary;
  if (secondary) styleVars["--tenant-accent"] = secondary;
  if (cfg.radius) styleVars["--tenant-radius"] = cfg.radius;
  if (cfg.fontDisplay)
    styleVars["--tenant-font-display"] = cssFontStack(cfg.fontDisplay);
  if (cfg.fontBody)
    styleVars["--tenant-font-sans"] = cssFontStack(cfg.fontBody);

  const fontsHref = buildGoogleFontsHref(cfg.fontDisplay, cfg.fontBody);

  return (
    <div style={styleVars} className="flex min-h-screen flex-col">
      {fontsHref && (
        <>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="anonymous"
          />
          <link rel="stylesheet" href={fontsHref} precedence="high" />
        </>
      )}
      <ThemeProvider
        tenant={bundle.tenant}
        locations={bundle.locations}
        categories={bundle.categories}
        services={bundle.services}
      >
        <LanguageProvider tenantId={bundle.tenant.id} config={cfg}>
          {children}
        </LanguageProvider>
      </ThemeProvider>
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;
  const bundle = await getTenantBundlePublic(subdomain);
  return { title: bundle?.tenant.name ?? "Booking" };
}

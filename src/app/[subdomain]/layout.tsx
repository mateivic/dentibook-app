import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTenantBundlePublic } from "@/lib/tenant";
import { ThemeProvider } from "@/features/tenant-theme/theme-provider";
import { LanguageProvider } from "@/features/i18n/language-provider";
import { buildGoogleFontsHref, cssFontStack } from "@/lib/fonts";
import { getTenantLogoUrl } from "@/lib/supabase/storage";
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
  const styles = cfg.styles ?? {};
  const styleVars: Record<string, string> = {};
  if (styles.primary) styleVars["--tenant-primary"] = styles.primary;
  if (styles.secondary) styleVars["--tenant-accent"] = styles.secondary;
  if (styles.radius) styleVars["--tenant-radius"] = styles.radius;
  if (styles.fontDisplay)
    styleVars["--tenant-font-display"] = cssFontStack(styles.fontDisplay);
  if (styles.fontBody)
    styleVars["--tenant-font-sans"] = cssFontStack(styles.fontBody);

  const fontsHref = buildGoogleFontsHref(styles.fontDisplay, styles.fontBody);

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
}): Promise<Metadata> {
  const { subdomain } = await params;
  const bundle = await getTenantBundlePublic(subdomain);
  if (!bundle) return { title: "Booking" };

  const { tenant } = bundle;
  // Reuse the clinic's uploaded logo as the browser/tab icon. Falls back to
  // the apex favicon when a tenant has not uploaded a logo yet. The explicit
  // `icon` link overrides the browser's default /favicon.ico fetch.
  const logoUrl = getTenantLogoUrl(tenant.logo_path);

  return {
    title: tenant.name,
    icons: { icon: logoUrl ?? "/favicon.ico" },
  };
}

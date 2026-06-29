import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getTenantBundlePrivate } from "@/lib/tenant";
import { getAuthedAdmin } from "@/features/admin/lib/auth";
import { signOut } from "@/features/admin/auth/actions";
import { SignOutButton } from "@/features/admin/auth/sign-out-button";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ subdomain: string }>;
}

export default async function ProtectedAdminLayout({
  children,
  params,
}: LayoutProps) {
  const { subdomain } = await params;
  const bundle = await getTenantBundlePrivate(subdomain);

  if (!bundle) notFound();

  const admin = await getAuthedAdmin();
  if (!admin) redirect("/admin/login");

  if (admin.tenantId !== bundle.tenant.id) {
    notFound();
  }

  const totalLocations = bundle.locations.length;
  const connectedLocations = bundle.calendarIntegrations.filter((i) =>
    bundle.locations.some((l) => l.id === i.location_id),
  ).length;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm text-ink-muted">{bundle.tenant.name}</p>
            <h1 className="text-lg font-semibold">Admin</h1>
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/admin" className="text-ink-muted hover:text-ink">
              Reservations
            </Link>
            <Link
              href="/admin/services"
              className="text-ink-muted hover:text-ink"
            >
              Services
            </Link>
            <Link
              href="/admin/working-hours"
              className="text-ink-muted hover:text-ink"
            >
              Working hours
            </Link>
            <Link
              href="/admin/connect-google"
              className="text-ink-muted hover:text-ink"
            >
              Calendar{" "}
              <span className="ml-1 text-xs text-ink-muted">
                ({connectedLocations}/{totalLocations})
              </span>
            </Link>
            <Link href="/admin/settings" className="text-ink-muted hover:text-ink">
              Settings
            </Link>
            <SignOutButton signOutAction={signOut.bind(null, subdomain)} />
          </nav>
        </div>
      </header>
      <div className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
        {children}
      </div>
    </div>
  );
}

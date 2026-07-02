import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getTenantBundlePrivate } from "@/lib/tenant";

interface PageProps {
  params: Promise<{ subdomain: string }>;
  searchParams: Promise<{ google?: string; message?: string }>;
}

export default async function ConnectGooglePage({
  params,
  searchParams,
}: PageProps) {
  const { subdomain } = await params;
  const sp = await searchParams;

  const bundle = await getTenantBundlePrivate(subdomain);
  if (!bundle) notFound();

  const integrationByLocation = new Map(
    bundle.calendarIntegrations.map((i) => [i.location_id, i] as const),
  );

  return (
    <section>
      <h2 className="mb-6 text-xl font-semibold">Google Calendar</h2>

      {sp.google === "connected" && (
        <p className="mb-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Google calendar connected.
        </p>
      )}
      {sp.google === "disconnected" && (
        <p className="mb-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Google calendar disconnected.
        </p>
      )}
      {sp.google === "error" && (
        <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {sp.message ?? "Could not complete the request."}
        </p>
      )}

      <p className="mb-4 text-sm text-ink-muted">
        Each location can be linked to its own Google account. Bookings will be
        written to that account&apos;s primary calendar, so you don&apos;t have
        check in-app calendar every time.
      </p>

      {bundle.locations.length === 0 ? (
        <Card>
          <p className="text-sm text-ink-muted">No locations yet.</p>
        </Card>
      ) : (
        <ul className="space-y-3">
          {bundle.locations.map((location) => {
            const integration = integrationByLocation.get(location.id) ?? null;
            return (
              <li key={location.id}>
                <Card>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-medium">{location.name}</p>
                      {integration ? (
                        <p className="mt-1 text-sm text-emerald-700">
                          Connected —{" "}
                          {integration.google_email ?? "Google account"}
                        </p>
                      ) : (
                        <p className="mt-1 text-sm text-ink-muted">
                          Not connected
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <form action="/admin/connect-google/start" method="GET">
                        <input
                          type="hidden"
                          name="locationId"
                          value={location.id}
                        />
                        <Button
                          type="submit"
                          variant={integration ? "secondary" : "primary"}
                        >
                          {integration ? "Reconnect" : "Connect"}
                        </Button>
                      </form>
                      {integration && (
                        <form
                          action="/admin/connect-google/disconnect"
                          method="POST"
                        >
                          <input
                            type="hidden"
                            name="locationId"
                            value={location.id}
                          />
                          <Button type="submit" variant="destructive">
                            Disconnect
                          </Button>
                        </form>
                      )}
                    </div>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

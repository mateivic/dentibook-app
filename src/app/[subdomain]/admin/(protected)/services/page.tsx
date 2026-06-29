import { notFound } from "next/navigation";
import { getTenantBundlePublic } from "@/lib/tenant";
import { LocationFilter } from "@/features/admin/shared/location-filter";
import { resolveLocation } from "@/features/admin/shared/resolve-location";
import { ServicesEditor } from "@/features/admin/services/components/services-editor";

interface PageProps {
    params: Promise<{ subdomain: string }>;
    searchParams: Promise<{ location?: string }>;
}

export default async function ServicesPage({ params, searchParams }: PageProps) {
    const [{ subdomain }, { location: locationParam }] = await Promise.all([
        params,
        searchParams,
    ]);

    const bundle = await getTenantBundlePublic(subdomain);
    if (!bundle) notFound();

    const resolved = resolveLocation(bundle.locations, locationParam);

    return (
        <section className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-xl font-semibold">Services</h2>
                {bundle.locations.length > 0 && (
                    <LocationFilter locations={bundle.locations} />
                )}
            </div>

            {resolved.kind === "empty" && (
                <p className="text-ink-muted">
                    No locations configured. Add a location before managing services.
                </p>
            )}

            {resolved.kind === "one" && (
                <ServicesEditor
                    key={resolved.location.id}
                    locationId={resolved.location.id}
                    categories={bundle.categories.filter(
                        (c) => c.location_id === resolved.location.id,
                    )}
                    services={bundle.services.filter(
                        (s) => s.location_id === resolved.location.id,
                    )}
                    hasOtherLocations={bundle.locations.length > 1}
                />
            )}
        </section>
    );
}

import { notFound } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getTenantBundlePublic } from "@/lib/tenant";
import type { Location } from "@/lib/supabase/types";
import {
    ReservationsTable,
    type ReservationRow,
} from "@/features/admin/components/reservations-table";
import { LocationFilter } from "@/features/admin/shared/location-filter";
import { resolveLocation } from "@/features/admin/shared/resolve-location";

interface PageProps {
    params: Promise<{ subdomain: string }>;
    searchParams: Promise<{ location?: string }>;
}

export default async function AdminDashboard({ params, searchParams }: PageProps) {
    const [{ subdomain }, { location: locationParam }] = await Promise.all([
        params,
        searchParams,
    ]);

    const bundle = await getTenantBundlePublic(subdomain);
    if (!bundle) notFound();

    const resolved = resolveLocation(bundle.locations, locationParam, {
        allowAll: true,
    });

    const supabase = await getSupabaseServerClient();

    let query = supabase
        .from("reservations")
        .select(
            `
            id,
            start_time,
            status,
            location_id,
            clients!inner(first_name, last_name),
            locations!inner(name, timezone),
            reservation_services!inner(services!inner(name))
        `,
        )
        .gte("start_time", new Date().toISOString())
        .in("status", ["PENDING", "CONFIRMED"])
        .order("start_time", { ascending: true })
        .limit(50);

    if (resolved.kind === "one") {
        query = query.eq("location_id", resolved.location.id);
    }

    const { data, error } = await query;

    if (error) {
        return (
            <section className="space-y-6">
                <Header locations={bundle.locations} />
                <p className="text-red-700">Failed to load reservations: {error.message}</p>
            </section>
        );
    }

    const rows: ReservationRow[] = (data ?? []).map((r) => {
        const client = r.clients as unknown as { first_name: string; last_name: string };
        const location = r.locations as unknown as { name: string; timezone: string };
        const rs = r.reservation_services as unknown as Array<{ services: { name: string } }>;
        return {
            id: r.id as string,
            startTime: r.start_time as string,
            locationName: location.name,
            locationTimezone: location.timezone,
            clientName: `${client.first_name} ${client.last_name}`,
            serviceNames: rs.map((x) => x.services.name),
            status: r.status as ReservationRow["status"],
        };
    });

    return (
        <section className="space-y-6">
            <Header locations={bundle.locations} />
            <ReservationsTable rows={rows} />
        </section>
    );
}

function Header({ locations }: { locations: Location[] }) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-xl font-semibold">Upcoming reservations</h2>
            <LocationFilter locations={locations} includeAll />
        </div>
    );
}

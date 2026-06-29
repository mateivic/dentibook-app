import { notFound } from "next/navigation";
import { getTenantBundlePublic } from "@/lib/tenant";
import { SettingsForm } from "@/features/admin/settings/components/settings-form";

interface PageProps {
    params: Promise<{ subdomain: string }>;
}

export default async function SettingsPage({ params }: PageProps) {
    const { subdomain } = await params;

    const bundle = await getTenantBundlePublic(subdomain);
    if (!bundle) notFound();

    return (
        <section className="space-y-6">
            <h2 className="text-xl font-semibold">Settings</h2>
            <SettingsForm showPrices={bundle.tenant.config.showPrices ?? true} />
        </section>
    );
}

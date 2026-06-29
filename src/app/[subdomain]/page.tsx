import { BookingWizard } from "@/features/booking/components/booking-wizard";

// Tenant data is fetched by the parent [subdomain]/layout.tsx and provided
// to the wizard via the useTenant() Context. This page is just a host.
export default function BookingHome() {
    return <BookingWizard />;
}

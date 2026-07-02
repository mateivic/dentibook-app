import { Spinner } from "@/components/ui/spinner";

// Shown as the Suspense fallback while any protected admin page loads, so
// switching pages flashes the same spinner the booking wizard uses.
export default function Loading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Spinner className="size-12 border-[3px]" label="Loading" />
    </div>
  );
}

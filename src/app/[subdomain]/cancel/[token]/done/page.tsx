export default function CancelDone() {
    return (
        <main className="mx-auto w-full max-w-xl flex-1 px-6 py-12 text-center">
            <h1 className="text-2xl font-semibold">Reservation cancelled</h1>
            <p className="mt-3 text-ink-muted">
                Your reservation has been cancelled and the calendar event removed. A confirmation
                email is on its way.
            </p>
        </main>
    );
}

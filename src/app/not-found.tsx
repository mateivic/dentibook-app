export default function NotFound() {
    return (
        <main className="flex flex-1 items-center justify-center px-6 py-24">
            <div className="text-center">
                <p className="text-sm font-medium text-brand">404</p>
                <h1 className="mt-2 text-2xl font-semibold tracking-tight">Page not found</h1>
                <p className="mt-2 text-ink-muted">The clinic you’re looking for doesn’t exist.</p>
            </div>
        </main>
    );
}

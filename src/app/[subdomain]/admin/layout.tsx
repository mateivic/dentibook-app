// Pass-through. Login lives under /admin/login (public); auth-gated routes
// live under the (protected) route group with their own layout.
export default function AdminShell({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}

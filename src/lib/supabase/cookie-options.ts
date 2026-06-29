// Returns the cookie `Domain` attribute used for Supabase auth cookies, or
// undefined to fall back to host-only. Sharing the apex-wide scope across
// subdomains is what lets `/auth/callback` (apex) and `{sub}.{base}/admin`
// see the same session.
export function getAuthCookieDomain(): string | undefined {
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN;
  return baseDomain ? `.${baseDomain}` : undefined;
}

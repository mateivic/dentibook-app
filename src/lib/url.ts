// Build an absolute URL on `{subdomain}.{baseHost}` whose path+query come
// from `pathWithQuery`. Avoids the `u.pathname = "..."` pitfall, which
// percent-encodes "?" instead of treating it as the query separator.
//
// Used wherever we need a redirect to land via a full document request that
// passes back through the subdomain proxy rewrite (e.g. `/auth/callback`,
// post-login navigation).
export function buildSubdomainUrl(
  subdomain: string,
  pathWithQuery: string,
): string {
  const base = process.env.APP_BASE_URL ?? "http://localhost:3000";
  const baseUrl = new URL(base);
  baseUrl.hostname = `${subdomain}.${baseUrl.hostname}`;
  return new URL(pathWithQuery, baseUrl).toString();
}

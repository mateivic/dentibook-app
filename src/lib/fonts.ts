// Per-tenant fonts. Tenants configure Google Font family names in
// `tenants.config` (fontDisplay / fontBody); the subdomain layout loads them
// dynamically and points the --tenant-font-* CSS vars at them. When unset, the
// built-in next/font defaults (Geist + Cormorant Garamond) apply.

const DISPLAY_WEIGHTS = "wght@400;500;600;700";
const BODY_WEIGHTS = "wght@300;400;500;600";

function encodeFamily(name: string): string {
  return name.trim().replace(/\s+/g, "+");
}

// Quote multi-word family names so they're valid inside a CSS custom property.
export function cssFontStack(name: string): string {
  return /\s/.test(name.trim()) ? `"${name.trim()}"` : name.trim();
}

// Build a fonts.googleapis.com stylesheet href for the configured families,
// or null when no custom fonts are configured.
export function buildGoogleFontsHref(
  fontDisplay?: string,
  fontBody?: string,
): string | null {
  const families: string[] = [];
  if (fontDisplay) {
    families.push(`family=${encodeFamily(fontDisplay)}:${DISPLAY_WEIGHTS}`);
  }
  if (fontBody && fontBody.trim() !== fontDisplay?.trim()) {
    families.push(`family=${encodeFamily(fontBody)}:${BODY_WEIGHTS}`);
  }
  if (families.length === 0) return null;
  return `https://fonts.googleapis.com/css2?${families.join("&")}&display=swap`;
}

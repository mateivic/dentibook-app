export const LOCATION_IMAGES_BUCKET = "location-images";
export const TENANT_IMAGES_BUCKET = "tenant-images";

export function getStorageUrl(
  bucket: string,
  path: string | null,
): string | null {
  if (!path) return null;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base}/storage/v1/object/public/${bucket}/${path}`;
}

export function getLocationImageUrl(path: string | null): string | null {
  return getStorageUrl(LOCATION_IMAGES_BUCKET, path);
}

export function getTenantLogoUrl(path: string | null): string | null {
  return getStorageUrl(TENANT_IMAGES_BUCKET, path);
}

export function getTenantHeroUrl(path: string | null): string | null {
  return getStorageUrl(TENANT_IMAGES_BUCKET, path);
}

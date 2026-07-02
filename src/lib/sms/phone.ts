// Phone helpers for SMS. The booking form stores phone numbers loosely
// (VARCHAR), so before sending we normalize to E.164 and only send when the
// result is plausible — an invalid number is skipped, never sent.

// Clinics are Croatian; a bare national number (leading 0, e.g. "091 555 1234")
// is assumed to be +385.
const DEFAULT_COUNTRY_CODE = "385";

// Normalize a raw phone string to E.164 ("+<8-15 digits>"), or null if it does
// not look like a valid number.
//   "+385 91 555-1234" -> "+385915551234"
//   "00385915551234"   -> "+385915551234"
//   "0915551234"       -> "+385915551234"   (national -> default country)
export function toE164(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let s = raw.replace(/[\s\-().]/g, "");

  if (s.startsWith("+")) {
    s = "+" + s.slice(1).replace(/\D/g, "");
  } else if (s.startsWith("00")) {
    s = "+" + s.slice(2).replace(/\D/g, "");
  } else {
    const digits = s.replace(/\D/g, "");
    // Drop a single national trunk "0" before prepending the country code.
    const national = digits.replace(/^0/, "");
    if (!national) return null;
    s = `+${DEFAULT_COUNTRY_CODE}${national}`;
  }

  return /^\+\d{8,15}$/.test(s) ? s : null;
}

// Derive an alphanumeric SMS sender id from the tenant name: letters/digits only,
// max 11 chars (Brevo's alphanumeric-sender limit). Falls back to "SMS" if the
// name has no usable characters.
export function deriveSmsSender(tenantName: string): string {
  const cleaned = tenantName
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 11);
  return cleaned || "SMS";
}

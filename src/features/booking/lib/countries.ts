export interface PhoneCountry {
    iso: string;
    name: string;
    dial: string;
    flag: string;
}

export const DEFAULT_PHONE_COUNTRY = "HR";

// Curated list for a Croatian-market clinic: home country first, then
// neighbours, then common international codes. Flags are emoji (no assets);
// they render as flags on most platforms and as letters on Windows.
export const PHONE_COUNTRIES: PhoneCountry[] = [
    { iso: "HR", name: "Croatia", dial: "+385", flag: "🇭🇷" },
    { iso: "SI", name: "Slovenia", dial: "+386", flag: "🇸🇮" },
    { iso: "BA", name: "Bosnia and Herzegovina", dial: "+387", flag: "🇧🇦" },
    { iso: "RS", name: "Serbia", dial: "+381", flag: "🇷🇸" },
    { iso: "ME", name: "Montenegro", dial: "+382", flag: "🇲🇪" },
    { iso: "HU", name: "Hungary", dial: "+36", flag: "🇭🇺" },
    { iso: "AT", name: "Austria", dial: "+43", flag: "🇦🇹" },
    { iso: "IT", name: "Italy", dial: "+39", flag: "🇮🇹" },
    { iso: "DE", name: "Germany", dial: "+49", flag: "🇩🇪" },
    { iso: "CH", name: "Switzerland", dial: "+41", flag: "🇨🇭" },
    { iso: "FR", name: "France", dial: "+33", flag: "🇫🇷" },
    { iso: "NL", name: "Netherlands", dial: "+31", flag: "🇳🇱" },
    { iso: "ES", name: "Spain", dial: "+34", flag: "🇪🇸" },
    { iso: "PL", name: "Poland", dial: "+48", flag: "🇵🇱" },
    { iso: "SE", name: "Sweden", dial: "+46", flag: "🇸🇪" },
    { iso: "IE", name: "Ireland", dial: "+353", flag: "🇮🇪" },
    { iso: "GB", name: "United Kingdom", dial: "+44", flag: "🇬🇧" },
    { iso: "US", name: "United States", dial: "+1", flag: "🇺🇸" },
];

const BY_ISO = new Map(PHONE_COUNTRIES.map((c) => [c.iso, c] as const));

export function phoneCountry(iso: string): PhoneCountry {
    return BY_ISO.get(iso) ?? BY_ISO.get(DEFAULT_PHONE_COUNTRY)!;
}

export function dialCodeFor(iso: string): string {
    return phoneCountry(iso).dial;
}

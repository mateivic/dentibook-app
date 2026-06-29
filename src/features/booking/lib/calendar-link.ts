// Builds an "Add to Google Calendar" template link for confirmation emails.
// Pure and side-effect free.

export interface GoogleCalendarLinkInput {
    title: string;
    startIso: string;
    endIso: string;
    details?: string;
    location?: string | null;
}

// Google's TEMPLATE endpoint expects UTC timestamps as YYYYMMDDTHHMMSSZ.
function toCompactUtc(iso: string): string {
    return new Date(iso)
        .toISOString()
        .replace(/[-:]/g, "")
        .replace(/\.\d{3}Z$/, "Z");
}

export function buildGoogleCalendarUrl(input: GoogleCalendarLinkInput): string {
    const params = new URLSearchParams({
        action: "TEMPLATE",
        text: input.title,
        dates: `${toCompactUtc(input.startIso)}/${toCompactUtc(input.endIso)}`,
    });
    if (input.details) params.set("details", input.details);
    if (input.location) params.set("location", input.location);
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

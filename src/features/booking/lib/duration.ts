export function sumDurations(items: Array<{ duration_minutes: number }>): number {
    return items.reduce((sum, item) => sum + item.duration_minutes, 0);
}

export function formatDuration(minutes: number): string {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}

export function formatLocalDateTime(iso: string, timezone: string): string {
    return new Intl.DateTimeFormat('hr-HR', {
        timeZone: timezone,
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(iso));
}

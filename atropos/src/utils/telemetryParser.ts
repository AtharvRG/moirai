export interface TelemetryEvent {
    ts: string;
    type: string;
    title?: string;
    details?: string;
}

interface TelemetryData {
    meta: { date: string };
    events: TelemetryEvent[];
}

export const parseTelemetryToStory = (data: TelemetryData) => {
    if (!data.events || !Array.isArray(data.events)) return "<p>No events recorded.</p>";

    let html = `<p>Session recorded on <strong>${data.meta.date}</strong>.</p>`;
    html += `<p>Total activity tracked: <strong>${data.events.length}</strong> events.</p>`;
    html += `<br/><h3>Chronicle</h3>`;

    // Group events by type for a cleaner read
    const focusEvents = data.events.filter((e: TelemetryEvent) => e.type === 'focus_change');
    const screenshots = data.events.filter((e: TelemetryEvent) => e.type === 'screenshot');

    if (focusEvents.length > 0) {
        html += `<p>You shifted focus <strong>${focusEvents.length}</strong> times.</p>`;
        html += `<ul class="list-disc pl-5 mt-2 space-y-1 font-mono text-sm opacity-80">`;
        // Show last 5 focus changes
        focusEvents.slice(-5).forEach((evt: TelemetryEvent) => {
            const time = new Date(evt.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            html += `<li>${time} - ${evt.title || 'Unknown Window'}</li>`;
        });
        html += `</ul>`;
    }

    if (screenshots.length > 0) {
        html += `<br/><p><em>${screenshots.length}</em> visual evidence points were captured.</p>`;
    }

    return html;
};
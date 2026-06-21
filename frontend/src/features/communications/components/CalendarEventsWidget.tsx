import { useEffect, useState } from 'react';
import { Calendar } from 'lucide-react';
import { apiClient } from '../../../shared/api/apiClient';

interface CalendarEvent {
  id: string;
  summary: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
}

export default function CalendarEventsWidget() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data } = await apiClient.get('/communications/calendar/events');
        if (data.success && data.data) {
          setEvents(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch calendar events', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  if (loading) {
    return <div className="p-6 bg-card border border-border/50 rounded-2xl animate-pulse h-64"></div>;
  }

  return (
    <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-border/50 flex items-center gap-3">
        <div className="p-2 bg-[#4285F4]/10 rounded-xl">
          <Calendar className="w-5 h-5 text-[#4285F4]" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Upcoming Google Calendar Events</h3>
      </div>
      <div className="p-4 sm:p-6 space-y-4 max-h-[400px] overflow-y-auto">
        {events.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-4">No upcoming events or Google Calendar is not connected.</p>
        ) : (
          events.map((event) => (
            <div key={event.id} className="p-4 rounded-xl border border-border/50 bg-muted/10">
              <h4 className="font-medium text-foreground">{event.summary}</h4>
              <span className="text-xs text-muted-foreground mt-1 block">
                {event.start.dateTime 
                  ? new Date(event.start.dateTime).toLocaleString()
                  : new Date(event.start.date || '').toLocaleDateString()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}


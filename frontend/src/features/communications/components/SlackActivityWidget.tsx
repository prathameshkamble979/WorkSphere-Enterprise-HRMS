import { useEffect, useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { apiClient } from '../../../shared/api/apiClient';

interface SlackMessage {
  ts: string;
  text: string;
  user?: string;
  bot_id?: string;
}

export default function SlackActivityWidget() {
  const [messages, setMessages] = useState<SlackMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data } = await apiClient.get('/communications/slack/activity');
        if (data.success && data.data) {
          setMessages(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch Slack messages', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, []);

  if (loading) {
    return <div className="p-6 bg-card border border-border/50 rounded-2xl animate-pulse h-64"></div>;
  }

  return (
    <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-border/50 flex items-center gap-3">
        <div className="p-2 bg-[#E01E5A]/10 rounded-xl">
          <MessageSquare className="w-5 h-5 text-[#E01E5A]" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Recent Slack Announcements</h3>
      </div>
      <div className="p-4 sm:p-6 space-y-4 max-h-[400px] overflow-y-auto">
        {messages.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-4">No recent Slack activity or Slack is not connected.</p>
        ) : (
          messages.map((msg) => (
            <div key={msg.ts} className="p-4 rounded-xl border border-border/50 bg-muted/10">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-foreground">{msg.bot_id ? 'System Bot' : (msg.user || 'Unknown User')}</span>
                <span className="text-xs text-muted-foreground">{new Date(parseFloat(msg.ts) * 1000).toLocaleString()}</span>
              </div>
              <p className="text-sm text-foreground whitespace-pre-wrap">{msg.text}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}


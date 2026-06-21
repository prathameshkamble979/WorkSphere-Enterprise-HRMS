import { useState, useEffect } from 'react';
import { Send, Hash } from 'lucide-react';
import { apiClient } from '../../../shared/api/apiClient';

export default function BroadcastWidget() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [channels, setChannels] = useState<{ id: string; name: string }[]>([]);
  const [selectedChannel, setSelectedChannel] = useState('');
  const [isSlackConnected, setIsSlackConnected] = useState(false);

  useEffect(() => {
    const checkSlack = async () => {
      try {
        const { data } = await apiClient.get('/slack/channels');
        if (data.success) {
          setIsSlackConnected(true);
          setChannels(data.data);
          if (data.data.length > 0) setSelectedChannel(data.data[0].id);
        }
      } catch (error) {
        setIsSlackConnected(false);
      }
    };
    checkSlack();
  }, []);

  const handlePost = async () => {
    if (!message.trim() || !selectedChannel) return;
    try {
      setLoading(true);
      const { data } = await apiClient.post('/slack/message', {
        channelId: selectedChannel,
        message
      });
      if (data.success) {
        setMessage('');
        alert('Message broadcasted successfully!');
      }
    } catch (error) {
      alert('Failed to broadcast message');
    } finally {
      setLoading(false);
    }
  };

  if (!isSlackConnected) return null;

  return (
    <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-border/50 flex items-center gap-3">
        <div className="p-2 bg-purple-500/10 rounded-xl">
          <Send className="w-5 h-5 text-purple-500" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Broadcast to Slack</h3>
      </div>
      <div className="p-4 sm:p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Select Channel</label>
          <div className="relative">
            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-border/50 bg-background text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            >
              {channels.map((c) => (
                <option key={c.id} value={c.id}>#{c.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Announcement Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your broadcast announcement here..."
            className="w-full p-3 rounded-xl border border-border/50 bg-background text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all min-h-[100px] resize-none"
          />
        </div>
        <button
          onClick={handlePost}
          disabled={loading || !message.trim()}
          className="w-full py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? 'Broadcasting...' : (
            <>
              <Send className="w-4 h-4" />
              Broadcast Now
            </>
          )}
        </button>
      </div>
    </div>
  );
}


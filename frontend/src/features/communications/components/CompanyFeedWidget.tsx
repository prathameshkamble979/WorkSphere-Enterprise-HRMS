import { useEffect, useState } from 'react';
import { Megaphone, Bell } from 'lucide-react';
import { apiClient } from '../../../shared/api/apiClient';

interface FeedItem {
  _id: string;
  title: string;
  message: string;
  createdAt: string;
  type: string;
}

export default function CompanyFeedWidget() {
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const { data } = await apiClient.get('/communications/feed');
        if (data.success) {
          setFeed(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch feed', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeed();
  }, []);

  if (loading) {
    return <div className="p-6 bg-card border border-border/50 rounded-2xl animate-pulse h-64"></div>;
  }

  return (
    <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-border/50 flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-xl">
          <Megaphone className="w-5 h-5 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Company Feed & Announcements</h3>
      </div>
      <div className="p-4 sm:p-6 space-y-4 max-h-[500px] overflow-y-auto">
        {feed.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No recent announcements.</p>
        ) : (
          feed.map((item) => (
            <div key={item._id} className="p-4 rounded-xl border border-border/50 bg-muted/20 flex gap-4">
              <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg h-fit">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-medium text-foreground">{item.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">{item.message}</p>
                <span className="text-xs text-muted-foreground mt-2 block">{new Date(item.createdAt).toLocaleString()}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}


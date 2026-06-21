import CompanyFeedWidget from '../components/CompanyFeedWidget';
import SlackActivityWidget from '../components/SlackActivityWidget';
import CalendarEventsWidget from '../components/CalendarEventsWidget';
import BroadcastWidget from '../components/BroadcastWidget';
import { useAuth } from '../../../shared/context/AuthContext';
import { MessageCircle } from 'lucide-react';

export default function CommunicationCenter() {
  const { user } = useAuth();
  const isAdminOrHR = user?.role === 'Admin' || user?.role === 'HR';

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl">
            <MessageCircle className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Communication Center</h1>
            <p className="text-sm text-muted-foreground mt-1">Stay updated with company announcements and activity</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Internal Feed */}
        <div className="lg:col-span-2 space-y-6">
          <CompanyFeedWidget />
          <SlackActivityWidget />
        </div>

        {/* Right Column - Integrations & Broadcast */}
        <div className="space-y-6">
          {isAdminOrHR && <BroadcastWidget />}
          <CalendarEventsWidget />
        </div>
      </div>
    </div>
  );
}


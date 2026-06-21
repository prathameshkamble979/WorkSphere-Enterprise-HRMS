import { useState, useRef, useEffect } from 'react';
import { Settings as SettingsIcon, Bell, Shield, Paintbrush, Globe, Database, Save, Loader2, LogOut, FileText } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiClient } from '../../../shared/api/apiClient';
import { useAuth } from '../../../shared/context/AuthContext';
import { useSettings } from '../../../shared/context/SettingsContext';
import NotificationTemplates from '../components/NotificationTemplates';

export default function Settings() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';
  
  const [activeTab, setActiveTab] = useState(isAdmin ? 'general' : 'notifications');
  const [isExporting, setIsExporting] = useState(false);
  const [isWiping, setIsWiping] = useState(false);
  const { brandColor, setBrandColor, companyLogo, setCompanyLogo } = useSettings();
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [slackConnected, setSlackConnected] = useState(false);
  const [personalSlackConnected, setPersonalSlackConnected] = useState(false);
  const [isConnectingSlack, setIsConnectingSlack] = useState(false);
  const [showSlackModal, setShowSlackModal] = useState(false);
  const [isTestingSlack, setIsTestingSlack] = useState(false);
  const [isDisconnectingSlack, setIsDisconnectingSlack] = useState(false);
  const [slackTestStatus, setSlackTestStatus] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [activeSlackIntegration, setActiveSlackIntegration] = useState<'global' | 'personal'>('global');

  const [googleConnected, setGoogleConnected] = useState(false);
  const [personalGoogleConnected, setPersonalGoogleConnected] = useState(false);
  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [isTestingGoogle, setIsTestingGoogle] = useState(false);
  const [isDisconnectingGoogle, setIsDisconnectingGoogle] = useState(false);
  const [googleTestStatus, setGoogleTestStatus] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [activeGoogleIntegration, setActiveGoogleIntegration] = useState<'global' | 'personal'>('global');

  const hasHandledCode = useRef(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const location = useLocation();
  const navigate = useNavigate();

  const handleSlackCallback = async (code: string, type: 'global' | 'personal' = 'global') => {
    try {
      setIsConnectingSlack(true);
      const url = type === 'global' ? '/slack/callback' : '/slack/personal/callback';
      const { data } = await apiClient.post(url, { code });
      if (data.success) {
        if (type === 'global') setSlackConnected(true);
        else setPersonalSlackConnected(true);
        navigate('/settings', { replace: true });
      }
    } catch {
      alert('Failed to connect to Slack');
    } finally {
      setIsConnectingSlack(false);
    }
  };

  const handleGoogleCallback = async (code: string, type: 'global' | 'personal' = 'global') => {
    try {
      setIsConnectingGoogle(true);
      const url = type === 'global' ? '/google/callback' : '/google/personal/callback';
      const { data } = await apiClient.post(url, { code });
      if (data.success) {
        if (type === 'global') setGoogleConnected(true);
        else setPersonalGoogleConnected(true);
        navigate('/settings', { replace: true });
      }
    } catch {
      alert('Failed to connect to Google Workspace');
    } finally {
      setIsConnectingGoogle(false);
    }
  };

  useEffect(() => {
    // Fetch initial settings
    const fetchSettings = async () => {
      try {
        const { data } = await apiClient.get('/settings');
        if (data.success) {
          setEmailNotifications(data.data.user.emailNotifications);
          setPushNotifications(data.data.user.pushNotifications);
          setSlackConnected(data.data.global.slackConnected);
          setGoogleConnected(data.data.global.googleWorkspaceConnected);
          setPersonalSlackConnected(data.data.user.slackConnected);
          setPersonalGoogleConnected(data.data.user.googleConnected);
        }
      } catch (error) {
        console.error('Failed to fetch settings', error);
      }
    };
    fetchSettings();

    // Handle OAuth Callback
    const searchParams = new URLSearchParams(location.search);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    
    if (code && !hasHandledCode.current) {
      hasHandledCode.current = true;
      // Defer execution to prevent synchronous state updates during effect
      setTimeout(() => {
        if (state === 'google') {
          handleGoogleCallback(code, 'global');
        } else if (state === 'personal-google') {
          handleGoogleCallback(code, 'personal');
        } else if (state === 'personal-slack') {
          handleSlackCallback(code, 'personal');
        } else {
          handleSlackCallback(code, 'global');
        }
      }, 0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  const handleConnectSlack = async (type: 'global' | 'personal' = 'global') => {
    try {
      setIsConnectingSlack(true);
      const url = type === 'global' ? '/slack/url' : '/slack/personal/url';
      const { data } = await apiClient.get(url);
      if (data.success && data.data.url) {
        window.location.href = data.data.url;
      }
    } catch {
      alert('Failed to get Slack OAuth URL');
      setIsConnectingSlack(false);
    }
  };

  const handleConnectGoogle = async (type: 'global' | 'personal' = 'global') => {
    try {
      setIsConnectingGoogle(true);
      const url = type === 'global' ? '/google/url' : '/google/personal/url';
      const { data } = await apiClient.get(url);
      if (data.success && data.data.url) {
        window.location.href = data.data.url;
      }
    } catch {
      alert('Failed to get Google OAuth URL');
      setIsConnectingGoogle(false);
    }
  };

  const tabs = [
    ...(isAdmin ? [{ id: 'general', label: 'General', icon: SettingsIcon }] : []),
    ...(isAdmin ? [{ id: 'appearance', label: 'Appearance', icon: Paintbrush }] : []),
    { id: 'notifications', label: 'Notifications', icon: Bell },
    ...(isAdmin ? [{ id: 'security', label: 'Security', icon: Shield }] : []),
    { id: 'integrations', label: 'Integrations', icon: Globe },
    ...(isAdmin ? [{ id: 'templates', label: 'Templates', icon: FileText }] : []),
    ...(isAdmin ? [{ id: 'database', label: 'Data & Backup', icon: Database }] : []),
  ];

  const handleExportJSON = async () => {
    try {
      setIsExporting(true);
      const { data } = await apiClient.get('/database/export', { responseType: 'blob' });
      
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'worksphere-backup.json');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      alert('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const handleWipeDatabase = async () => {
    if (!window.confirm('DANGER: Are you absolutely sure you want to permanently delete all data in this workspace? This cannot be undone!')) return;
    if (!window.confirm('FINAL WARNING: Type OK to confirm (Just kidding, clicking OK is enough). Are you really sure?')) return;
    
    try {
      setIsWiping(true);
      await apiClient.delete('/database/wipe');
      alert('Database wiped successfully. You will be logged out.');
      window.location.href = '/login';
    } catch (error) {
      alert((error as any).response?.data?.error?.message || 'Failed to wipe database');
    } finally {
      setIsWiping(false);
    }
  };

  const brandColors = [
    { id: 'blue', value: '221.2 83.2% 53.3%', class: 'bg-blue-600', ring: 'ring-blue-600' },
    { id: 'purple', value: '271.5 81.3% 55.9%', class: 'bg-purple-600', ring: 'ring-purple-600' },
    { id: 'emerald', value: '142.1 70.6% 45.3%', class: 'bg-emerald-600', ring: 'ring-emerald-600' },
    { id: 'rose', value: '346.8 77.2% 49.8%', class: 'bg-rose-600', ring: 'ring-rose-600' },
    { id: 'amber', value: '37.7 92.1% 50.2%', class: 'bg-amber-500', ring: 'ring-amber-500' },
  ];

  const handleColorChange = (color: typeof brandColors[0]) => {
    setBrandColor(color.id);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCompanyLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleManageSlackClick = (type: 'global' | 'personal' = 'global') => {
    setActiveSlackIntegration(type);
    const isConnected = type === 'global' ? slackConnected : personalSlackConnected;
    if (isConnected) {
      setShowSlackModal(true);
    } else {
      handleConnectSlack(type);
    }
  };

  const handleTestSlackMessage = async () => {
    try {
      setSlackTestStatus(null);
      setIsTestingSlack(true);
      const url = activeSlackIntegration === 'global' ? '/slack/test' : '/slack/personal/test';
      const { data } = await apiClient.post(url);
      if (data.success) {
        setSlackTestStatus({ type: 'success', message: 'Test message sent successfully! Check your Slack channel.' });
      }
    } catch (error) {
      setSlackTestStatus({ type: 'error', message: (error as any).response?.data?.error?.message || 'Failed to send test message.' });
    } finally {
      setIsTestingSlack(false);
    }
  };

  const handleDisconnectSlack = async () => {
    if (!window.confirm(`Are you sure you want to disconnect ${activeSlackIntegration === 'global' ? 'the company' : 'your personal'} Slack?`)) return;
    try {
      setSlackTestStatus(null);
      setIsDisconnectingSlack(true);
      const url = activeSlackIntegration === 'global' ? '/slack/disconnect' : '/slack/personal/disconnect';
      const { data } = await apiClient.post(url);
      if (data.success) {
        if (activeSlackIntegration === 'global') setSlackConnected(false);
        else setPersonalSlackConnected(false);
        setShowSlackModal(false);
      }
    } catch {
      setSlackTestStatus({ type: 'error', message: 'Failed to disconnect Slack.' });
    } finally {
      setIsDisconnectingSlack(false);
    }
  };

  const handleManageGoogleClick = (type: 'global' | 'personal' = 'global') => {
    setActiveGoogleIntegration(type);
    const isConnected = type === 'global' ? googleConnected : personalGoogleConnected;
    if (isConnected) {
      setShowGoogleModal(true);
    } else {
      handleConnectGoogle(type);
    }
  };

  const handleTestGoogleMessage = async () => {
    try {
      setGoogleTestStatus(null);
      setIsTestingGoogle(true);
      const url = activeGoogleIntegration === 'global' ? '/google/test' : '/google/personal/test';
      const { data } = await apiClient.post(url);
      if (data.success) {
        setGoogleTestStatus({ type: 'success', message: 'Test event created successfully! Check your Google Calendar.' });
      }
    } catch (error) {
      setGoogleTestStatus({ type: 'error', message: (error as any).response?.data?.error?.message || 'Failed to create test calendar event.' });
    } finally {
      setIsTestingGoogle(false);
    }
  };

  const handleDisconnectGoogle = async () => {
    if (!window.confirm(`Are you sure you want to disconnect ${activeGoogleIntegration === 'global' ? 'the company' : 'your personal'} Google Workspace?`)) return;
    try {
      setGoogleTestStatus(null);
      setIsDisconnectingGoogle(true);
      const url = activeGoogleIntegration === 'global' ? '/google/disconnect' : '/google/personal/disconnect';
      const { data } = await apiClient.post(url);
      if (data.success) {
        if (activeGoogleIntegration === 'global') setGoogleConnected(false);
        else setPersonalGoogleConnected(false);
        setShowGoogleModal(false);
      }
    } catch {
      setGoogleTestStatus({ type: 'error', message: 'Failed to disconnect Google Workspace.' });
    } finally {
      setIsDisconnectingGoogle(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
      await apiClient.patch('/settings/user', {
        emailNotifications,
        pushNotifications
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      alert('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto w-full h-full flex flex-col">
      <div className="mb-8 shrink-0">
        <h1 className="text-3xl font-bold text-foreground">Global Settings</h1>
        <p className="text-muted-foreground mt-1">Configure your WorkSphere workspace preferences and defaults.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 flex-1 min-h-0">
        {/* Left Sidebar */}
        <div className="w-full md:w-64 shrink-0 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <tab.icon className={`h-5 w-5 ${activeTab === tab.id ? 'opacity-100' : 'opacity-70'}`} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right Content Area */}
        <div className="flex-1 bg-card rounded-2xl border shadow-sm p-8 overflow-y-auto">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-foreground border-b pb-4">General Configuration</h2>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-end mb-1">
                    <label className="block text-sm font-medium text-foreground">Company Name</label>
                    {!isAdmin && <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Admin Only</span>}
                  </div>
                  <input 
                    type="text" 
                    defaultValue="WorkSphere Technologies Inc." 
                    disabled={!isAdmin}
                    className={`w-full px-4 py-2 border rounded-lg text-sm transition-colors ${!isAdmin ? 'bg-muted cursor-not-allowed text-muted-foreground' : 'bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none'}`} 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Timezone</label>
                    <select className="w-full px-4 py-2 border rounded-lg bg-background text-sm">
                      <option>UTC-8 (Pacific Time)</option>
                      <option>UTC-5 (Eastern Time)</option>
                      <option>UTC+0 (GMT)</option>
                      <option selected>UTC+5:30 (India Standard Time)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Currency</label>
                    <select className="w-full px-4 py-2 border rounded-lg bg-background text-sm">
                      <option>USD ($)</option>
                      <option>EUR (€)</option>
                      <option>GBP (£)</option>
                      <option selected>INR (₹)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-foreground border-b pb-4">Brand & Appearance</h2>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">Brand Color</label>
                <div className="flex gap-4">
                  {brandColors.map((color) => (
                    <div 
                      key={color.id}
                      onClick={() => handleColorChange(color)}
                      className={`h-10 w-10 rounded-full ${color.class} cursor-pointer transition-all
                        ${brandColor === color.id ? `ring-2 ring-offset-2 ${color.ring} scale-110` : 'hover:scale-105'}
                      `}
                    ></div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-3">Company Logo</label>
                <div className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center bg-muted/30 relative">
                  {companyLogo ? (
                    <img src={companyLogo} alt="Company Logo" className="h-16 w-auto object-contain mb-4 rounded-lg" />
                  ) : (
                    <div className="h-16 w-16 bg-primary rounded-2xl flex items-center justify-center mb-4">
                      <span className="text-primary-foreground text-3xl font-bold">W</span>
                    </div>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleLogoUpload} 
                    accept="image/png, image/jpeg" 
                    className="hidden" 
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="text-sm text-primary font-medium hover:underline"
                  >
                    Upload new logo
                  </button>
                  <p className="text-xs text-muted-foreground mt-2">Recommended size: 256x256px (PNG/JPG)</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-foreground border-b pb-4">Notification Preferences</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-xl bg-background">
                  <div>
                    <h4 className="font-medium text-foreground">Email Notifications</h4>
                    <p className="text-sm text-muted-foreground">Receive daily summaries and critical alerts via email.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={emailNotifications}
                      onChange={(e) => setEmailNotifications(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-xl bg-background">
                  <div>
                    <h4 className="font-medium text-foreground">Push Notifications</h4>
                    <p className="text-sm text-muted-foreground">Real-time alerts for approvals and messages.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={pushNotifications}
                      onChange={(e) => setPushNotifications(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-foreground border-b pb-4">Security Settings</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-xl bg-background">
                  <div>
                    <h4 className="font-medium text-foreground">Two-Factor Authentication (2FA)</h4>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security to your organization's accounts.</p>
                  </div>
                  <button className="px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors">Enable 2FA</button>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-xl bg-background">
                  <div>
                    <h4 className="font-medium text-foreground">Session Timeout</h4>
                    <p className="text-sm text-muted-foreground">Automatically log out inactive users.</p>
                  </div>
                  <select className="px-3 py-1.5 border rounded-lg bg-background text-sm">
                    <option>15 minutes</option>
                    <option selected>30 minutes</option>
                    <option>1 hour</option>
                    <option>4 hours</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="space-y-10">
              {/* Personal Integrations Section */}
              <div className="space-y-6">
                <div className="border-b pb-4">
                  <h2 className="text-xl font-bold text-foreground">Personal Integrations</h2>
                  <p className="text-sm text-muted-foreground mt-1">Connect your personal accounts to receive direct notifications and sync your schedule.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 border rounded-xl bg-background flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-bold text-xl">G</div>
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${personalGoogleConnected ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                        {personalGoogleConnected ? 'Connected' : 'Not Connected'}
                      </span>
                    </div>
                    <h4 className="font-bold text-foreground">Personal Google Calendar</h4>
                    <p className="text-sm text-muted-foreground mt-1 mb-4 flex-1">Sync your approved leaves and 1:1s to your personal calendar.</p>
                    <button 
                      onClick={() => handleManageGoogleClick('personal')}
                      disabled={isConnectingGoogle}
                      className={`w-full py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2
                        ${personalGoogleConnected 
                          ? 'border border-border bg-background text-foreground hover:bg-muted' 
                          : 'bg-primary text-primary-foreground hover:bg-primary/90'} 
                        disabled:opacity-50`}
                    >
                      {isConnectingGoogle && <Loader2 className="w-4 h-4 animate-spin" />}
                      {personalGoogleConnected ? 'Manage' : 'Connect'}
                    </button>
                  </div>
                  
                  <div className="p-5 border rounded-xl bg-background flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div className="h-10 w-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center font-bold text-xl">#</div>
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${personalSlackConnected ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                        {personalSlackConnected ? 'Connected' : 'Not Connected'}
                      </span>
                    </div>
                    <h4 className="font-bold text-foreground">Personal Slack</h4>
                    <p className="text-sm text-muted-foreground mt-1 mb-4 flex-1">Receive direct messages for leave approvals and payroll updates.</p>
                    <button 
                      onClick={() => handleManageSlackClick('personal')}
                      disabled={isConnectingSlack}
                      className={`w-full py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2
                        ${personalSlackConnected 
                          ? 'border border-border bg-background text-foreground hover:bg-muted' 
                          : 'bg-primary text-primary-foreground hover:bg-primary/90'} 
                        disabled:opacity-50`}
                    >
                      {isConnectingSlack && <Loader2 className="w-4 h-4 animate-spin" />}
                      {personalSlackConnected ? 'Manage' : 'Connect'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Company Integrations Section (Admin Only) */}
              {isAdmin && (
                <div className="space-y-6">
                  <div className="border-b pb-4">
                    <div className="flex justify-between items-end">
                      <div>
                        <h2 className="text-xl font-bold text-foreground">Company Integrations</h2>
                        <p className="text-sm text-muted-foreground mt-1">Configure global API connections for the entire workspace.</p>
                      </div>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Admin Only</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 border rounded-xl bg-background flex flex-col opacity-90">
                      <div className="flex justify-between items-start mb-4">
                        <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-bold text-xl">G</div>
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${googleConnected ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                          {googleConnected ? 'Connected' : 'Not Connected'}
                        </span>
                      </div>
                      <h4 className="font-bold text-foreground">Workspace Google</h4>
                      <p className="text-sm text-muted-foreground mt-1 mb-4 flex-1">Enable company-wide Single Sign-On (SSO).</p>
                      <button 
                        onClick={() => handleManageGoogleClick('global')}
                        disabled={isConnectingGoogle}
                        className={`w-full py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2
                          ${googleConnected 
                            ? 'border border-border bg-background text-foreground hover:bg-muted' 
                            : 'bg-primary text-primary-foreground hover:bg-primary/90'} 
                          disabled:opacity-50`}
                      >
                        {isConnectingGoogle && <Loader2 className="w-4 h-4 animate-spin" />}
                        {googleConnected ? 'Manage Global' : 'Connect Global'}
                      </button>
                    </div>
                    
                    <div className="p-5 border rounded-xl bg-background flex flex-col opacity-90">
                      <div className="flex justify-between items-start mb-4">
                        <div className="h-10 w-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center font-bold text-xl">#</div>
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${slackConnected ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                          {slackConnected ? 'Connected' : 'Not Connected'}
                        </span>
                      </div>
                      <h4 className="font-bold text-foreground">Workspace Slack</h4>
                      <p className="text-sm text-muted-foreground mt-1 mb-4 flex-1">Push automated HR alerts to a global channel.</p>
                      <button 
                        onClick={() => handleManageSlackClick('global')}
                        disabled={isConnectingSlack}
                        className={`w-full py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2
                          ${slackConnected 
                            ? 'border border-border bg-background text-foreground hover:bg-muted' 
                            : 'bg-primary text-primary-foreground hover:bg-primary/90'} 
                          disabled:opacity-50`}
                      >
                        {isConnectingSlack && <Loader2 className="w-4 h-4 animate-spin" />}
                        {slackConnected ? 'Manage Global' : 'Connect Global'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Slack Manage Modal */}
          {showSlackModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md">
              <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 transform transition-all scale-100 opacity-100">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center font-bold text-xl">#</div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-4 mb-1">Company Slack</h3>
                  </div>
                  <button onClick={() => setShowSlackModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
                
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed pl-13">
                  Your workspace is securely connected. You can ping the channel with a test alert, or revoke access and disconnect.
                </p>

                {slackTestStatus && (
                  <div className={`mb-6 p-4 rounded-xl text-sm border ${
                    slackTestStatus.type === 'error' 
                      ? 'bg-red-50/50 border-red-200 text-red-700 dark:bg-red-500/10 dark:border-red-900/50 dark:text-red-400' 
                      : 'bg-green-50/50 border-green-200 text-green-700 dark:bg-green-500/10 dark:border-green-900/50 dark:text-green-400'
                  }`}>
                    {slackTestStatus.message}
                  </div>
                )}

                <div className="space-y-3">
                  <button 
                    onClick={handleTestSlackMessage}
                    disabled={isTestingSlack}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-all shadow-sm hover:shadow disabled:opacity-50"
                  >
                    {isTestingSlack && <Loader2 className="w-4 h-4 animate-spin" />}
                    Send Test Message
                  </button>

                  <button 
                    onClick={handleDisconnectSlack}
                    disabled={isDisconnectingSlack}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 border-2 border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 rounded-xl font-semibold hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors disabled:opacity-50"
                  >
                    {isDisconnectingSlack && <Loader2 className="w-4 h-4 animate-spin" />}
                    Disconnect Workspace
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Google Manage Modal */}
          {showGoogleModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md">
              <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 transform transition-all scale-100 opacity-100">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center font-bold text-xl">G</div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-4 mb-1">Company Google</h3>
                  </div>
                  <button onClick={() => setShowGoogleModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
                
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed pl-13">
                  Your Google Workspace is securely connected. We have offline calendar access to automatically sync events and meetings.
                </p>

                {googleTestStatus && (
                  <div className={`mb-6 p-4 rounded-xl text-sm border ${
                    googleTestStatus.type === 'error' 
                      ? 'bg-red-50/50 border-red-200 text-red-700 dark:bg-red-500/10 dark:border-red-900/50 dark:text-red-400' 
                      : 'bg-green-50/50 border-green-200 text-green-700 dark:bg-green-500/10 dark:border-green-900/50 dark:text-green-400'
                  }`}>
                    {googleTestStatus.message}
                  </div>
                )}

                <div className="space-y-3">
                  <button 
                    onClick={handleTestGoogleMessage}
                    disabled={isTestingGoogle}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-sm hover:shadow disabled:opacity-50"
                  >
                    {isTestingGoogle && <Loader2 className="w-4 h-4 animate-spin" />}
                    Send Test Calendar Invite
                  </button>

                  <button 
                    onClick={handleDisconnectGoogle}
                    disabled={isDisconnectingGoogle}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 border-2 border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 rounded-xl font-semibold hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors disabled:opacity-50"
                  >
                    {isDisconnectingGoogle && <Loader2 className="w-4 h-4 animate-spin" />}
                    Disconnect Workspace
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="bg-[var(--color-bg-primary)] rounded-xl shadow-sm border border-[var(--color-border)] p-6">
              <NotificationTemplates />
            </div>
          )}

          {activeTab === 'database' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-foreground border-b pb-4">Data & Backup Management</h2>
              
              <div className="space-y-4">
                <div className="p-5 border rounded-xl bg-background">
                  <h4 className="font-bold text-foreground mb-1">Export Organization Data</h4>
                  <p className="text-sm text-muted-foreground mb-4">Download a complete archive of all employee, payroll, and project data.</p>
                  <div className="flex gap-3">
                    <button className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-muted transition-colors flex items-center gap-2">
                      Export to CSV
                    </button>
                    <button 
                      onClick={handleExportJSON}
                      disabled={isExporting}
                      className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-muted transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      Export to JSON
                    </button>
                  </div>
                </div>
                
                <div className="p-5 border border-danger/20 bg-danger/5 rounded-xl">
                  <h4 className="font-bold text-danger mb-1">Danger Zone</h4>
                  <p className="text-sm text-danger/80 mb-4">Permanently delete all organization data. This action cannot be undone.</p>
                  <button 
                    onClick={handleWipeDatabase}
                    disabled={isWiping}
                    className="px-4 py-2 bg-danger text-white rounded-lg text-sm font-medium hover:bg-danger/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {isWiping ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Delete Workspace
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="mt-10 pt-6 border-t flex justify-end items-center gap-4">
            {saveSuccess && <span className="text-sm font-medium text-success fade-in">Settings saved successfully!</span>}
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-70 min-w-[140px] justify-center"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

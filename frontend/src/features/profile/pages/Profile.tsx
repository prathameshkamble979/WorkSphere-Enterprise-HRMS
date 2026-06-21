import { useState } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';
import { getImageUrl } from '../../../shared/utils/imageUrl';
import { Mail, Briefcase, Shield, Key, Save, Camera, Loader2 } from 'lucide-react';
import { apiClient } from '../../../shared/api/apiClient';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      // 1. Upload file
      const uploadRes = await apiClient.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (uploadRes.data.success) {
        const imageUrl = uploadRes.data.data.url;
        
        // 2. Update profile
        await apiClient.put('/auth/profile', { profilePicture: imageUrl });
        
        // 3. Update local context
        updateUser({ profilePicture: imageUrl });
      }
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert('Failed to upload profile picture. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your personal information and security.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Profile Card */}
        <div className="col-span-1">
          <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-primary/80 to-primary"></div>
            <div className="px-6 pb-6 relative flex flex-col items-center">
              <div className="h-24 w-24 rounded-full border-4 border-card bg-primary/10 flex items-center justify-center -mt-12 mb-4 bg-background shadow-md relative group overflow-hidden">
                {isUploading ? (
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                ) : user?.profilePicture ? (
                  <img src={getImageUrl(user.profilePicture)} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-4xl font-bold text-primary">{user?.name?.charAt(0) || 'U'}</span>
                )}
                
                {/* Overlay for uploading */}
                <label className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="h-6 w-6 mb-1" />
                  <span className="text-[10px] font-medium uppercase tracking-wider">Upload</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
                </label>
              </div>
              <h2 className="text-xl font-bold text-foreground">{user?.name || 'User Name'}</h2>
              <p className="text-muted-foreground text-sm font-medium">{user?.role || 'Staff'}</p>
              
              <div className="w-full mt-6 space-y-4">
                <div className="flex items-center gap-3 text-sm text-foreground">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{user?.email || 'email@example.com'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-foreground">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span>{user?.department || 'Operations'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-foreground">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span>Role: {user?.role}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Settings */}
        <div className="col-span-1 md:col-span-2 space-y-6">
          <div className="bg-card rounded-2xl border shadow-sm p-6">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2 mb-6">
              <Key className="h-5 w-5 text-primary" />
              Change Password
            </h3>
            
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert('Password update mock success!'); setCurrentPassword(''); setNewPassword(''); }}>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                  placeholder="Enter new password"
                />
              </div>
              
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors text-sm"
                >
                  <Save className="h-4 w-4" />
                  Update Password
                </button>
              </div>
            </form>
          </div>
          
          <div className="bg-card rounded-2xl border shadow-sm p-6">
            <h3 className="text-lg font-bold text-foreground mb-2">Account Activity</h3>
            <p className="text-sm text-muted-foreground mb-4">Your recent login sessions and activity logs.</p>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm py-2 border-b">
                <div>
                  <p className="font-medium text-foreground">Logged in via Web Portal</p>
                  <p className="text-muted-foreground text-xs">Windows 11 • Chrome Browser</p>
                </div>
                <span className="text-muted-foreground">Today, 14:02</span>
              </div>
              <div className="flex items-center justify-between text-sm py-2 border-b">
                <div>
                  <p className="font-medium text-foreground">Password Changed</p>
                  <p className="text-muted-foreground text-xs">System settings updated</p>
                </div>
                <span className="text-muted-foreground">3 days ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

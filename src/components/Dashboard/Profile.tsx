
import React, { useState, useEffect } from 'react';
import { User, Mail, Youtube, ExternalLink, Camera, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useFadeIn } from '@/lib/animations';
import { supabase } from '@/integrations/supabase/client';

const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    bio: '',
    youtube_channel_id: '',
    youtube_channel_name: '',
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(user?.profile?.avatar_url);
  const [uploading, setUploading] = useState(false);
  
  const headerAnimation = useFadeIn('up');
  const profileCardAnimation = useFadeIn('up', { delay: 100 });
  const channelCardAnimation = useFadeIn('up', { delay: 200 });
  const securityCardAnimation = useFadeIn('up', { delay: 300 });

  useEffect(() => {
    if (user?.profile) {
      setFormData({
        ...formData,
        full_name: user.profile.full_name || '',
        username: user.profile.username || '',
        youtube_channel_id: user.profile.youtube_channel_id || '',
        youtube_channel_name: user.profile.youtube_channel_name || '',
      });
      setAvatarUrl(user.profile.avatar_url);
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value
    });
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files.length) return;
    
    try {
      setUploading(true);
      
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      // Check if storage bucket exists, and create if not
      const { data: bucketExists } = await supabase.storage.getBucket('avatars');
      
      if (!bucketExists) {
        await supabase.storage.createBucket('avatars', {
          public: true
        });
      }
      
      // Upload file
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      // Update profile with new avatar
      await updateProfile({ avatar_url: data.publicUrl });
      
      setAvatarUrl(data.publicUrl);
      toast.success('Avatar updated successfully');
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast.error(error.message || 'Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // Validate passwords if changing
      if (formData.new_password) {
        if (formData.new_password !== formData.confirm_password) {
          toast.error('New passwords do not match');
          return;
        }
        
        if (formData.new_password.length < 8) {
          toast.error('Password must be at least 8 characters');
          return;
        }
        
        // Update password
        const { error: passwordError } = await supabase.auth.updateUser({
          password: formData.new_password
        });
        
        if (passwordError) throw passwordError;
        toast.success('Password updated successfully');
      }
      
      // Update profile
      await updateProfile({
        full_name: formData.full_name,
        username: formData.username,
        youtube_channel_id: formData.youtube_channel_id,
        youtube_channel_name: formData.youtube_channel_name,
      });
      
      // Clear password fields
      setFormData({
        ...formData,
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
      
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast.error(error.message || 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConnectYouTube = () => {
    // In a real implementation, this would use the YouTube API OAuth flow
    toast.info('YouTube integration coming soon');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        ref={headerAnimation.ref}
        style={headerAnimation.style}
      >
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground">
          Manage your account information and preferences
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Personal Information */}
        <Card 
          ref={profileCardAnimation.ref}
          style={profileCardAnimation.style}
        >
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 sm:items-center mb-6">
              <div className="relative">
                <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border border-border">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={formData.full_name} className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-10 w-10 text-primary" />
                  )}
                </div>
                <label 
                  htmlFor="avatar-upload" 
                  className={`absolute bottom-0 right-0 rounded-full w-8 h-8 p-0 flex items-center justify-center bg-secondary hover:bg-secondary/80 cursor-pointer transition-colors ${uploading ? 'pointer-events-none' : ''}`}
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                  <input 
                    id="avatar-upload" 
                    type="file" 
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={uploading}
                  />
                </label>
              </div>
              
              <div className="space-y-1">
                <h3 className="font-medium">{user?.profile?.full_name || user?.email}</h3>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <div className="text-xs inline-flex items-center px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium mt-1">
                  {user?.user_metadata?.role === 'creator' ? 'Content Creator' : 'Music Artist'}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input 
                  id="full_name" 
                  value={formData.full_name} 
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input 
                  id="username" 
                  value={formData.username} 
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea 
                id="bio" 
                placeholder="Tell us about yourself..."
                className="min-h-[100px]"
                value={formData.bio}
                onChange={handleInputChange}
              />
            </div>
          </CardContent>
        </Card>
        
        {/* YouTube Channel */}
        <Card 
          ref={channelCardAnimation.ref}
          style={channelCardAnimation.style}
        >
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>YouTube Channel</CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1"
              onClick={handleConnectYouTube}
              type="button"
            >
              <Youtube className="h-4 w-4" />
              Connect
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className={`p-4 bg-muted rounded-lg border border-border flex items-center justify-between ${user?.profile?.youtube_channel_id ? 'bg-primary/5' : ''}`}>
              <div className="flex items-center space-x-3">
                <div className={`h-10 w-10 rounded-full ${user?.profile?.youtube_channel_id ? 'bg-primary/10' : 'bg-destructive/10'} flex items-center justify-center`}>
                  <Youtube className={`h-5 w-5 ${user?.profile?.youtube_channel_id ? 'text-primary' : 'text-destructive'}`} />
                </div>
                <div>
                  <p className="font-medium">YouTube Channel</p>
                  <p className="text-sm text-muted-foreground">
                    {user?.profile?.youtube_channel_id 
                      ? `Connected to ${user.profile.youtube_channel_name}`
                      : 'Connect to track earnings and analytics'}
                  </p>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                {user?.profile?.youtube_channel_id ? 'Connected' : 'Not connected'}
              </div>
            </div>
            
            {user?.profile?.youtube_channel_id && (
              <div className="space-y-2">
                <Label htmlFor="youtube_channel_id">Channel ID</Label>
                <Input 
                  id="youtube_channel_id" 
                  value={formData.youtube_channel_id} 
                  onChange={handleInputChange}
                  placeholder="Your YouTube channel ID"
                />
              </div>
            )}
            
            <p className="text-sm text-muted-foreground">
              Connect your YouTube channel to automatically track videos using our licensed music.
            </p>
          </CardContent>
        </Card>
        
        {/* Security */}
        <Card 
          ref={securityCardAnimation.ref}
          style={securityCardAnimation.style}
        >
          <CardHeader>
            <CardTitle>Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current_password">Current Password</Label>
              <Input 
                id="current_password" 
                type="password" 
                value={formData.current_password}
                onChange={handleInputChange}
              />
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new_password">New Password</Label>
                <Input 
                  id="new_password" 
                  type="password"
                  value={formData.new_password}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirm_password">Confirm New Password</Label>
                <Input 
                  id="confirm_password" 
                  type="password"
                  value={formData.confirm_password}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Password must be at least 8 characters and include a letter, number, and special character.
            </p>
          </CardContent>
        </Card>
        
        {/* Save Button */}
        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Saving Changes...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Profile;

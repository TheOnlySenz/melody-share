
import React, { useState } from 'react';
import { User, Mail, Youtube, ExternalLink, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useFadeIn } from '@/lib/animations';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const headerAnimation = useFadeIn('up');
  const profileCardAnimation = useFadeIn('up', { delay: 100 });
  const channelCardAnimation = useFadeIn('up', { delay: 200 });
  const securityCardAnimation = useFadeIn('up', { delay: 300 });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success('Profile updated successfully');
      setIsLoading(false);
    }, 1000);
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
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-10 w-10 text-primary" />
                  )}
                </div>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-1">
                <h3 className="font-medium">{user?.name}</h3>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <div className="text-xs inline-flex items-center px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium mt-1">
                  {user?.role === 'creator' ? 'Content Creator' : 'Music Artist'}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" defaultValue={user?.name} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue={user?.email} />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea 
                id="bio" 
                placeholder="Tell us about yourself..."
                className="min-h-[100px]"
                defaultValue=""
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
            <Button variant="outline" size="sm" className="gap-1">
              <Youtube className="h-4 w-4" />
              Connect
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg border border-border flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
                  <Youtube className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="font-medium">YouTube Channel</p>
                  <p className="text-sm text-muted-foreground">Connect to track earnings and analytics</p>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">Not connected</div>
            </div>
            
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
              <Label htmlFor="current-password">Current Password</Label>
              <Input id="current-password" type="password" />
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" />
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Password must be at least 8 characters and include a letter, number, and special character.
            </p>
          </CardContent>
        </Card>
        
        {/* Save Button */}
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving Changes...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Profile;

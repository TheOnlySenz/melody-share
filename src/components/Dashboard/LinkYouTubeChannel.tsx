
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Youtube, ClipboardCopy, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

const LinkYouTubeChannel: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [channelUrl, setChannelUrl] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [verificationStep, setVerificationStep] = useState(false);

  // Generate a random verification code
  useEffect(() => {
    generateVerificationCode();
  }, []);

  const generateVerificationCode = () => {
    // Generate a random 6-digit code
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    setVerificationCode(newCode);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(verificationCode);
    setCopied(true);
    toast.success('Verification code copied to clipboard');
    
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerifyChannel = async () => {
    if (!channelUrl.trim()) {
      toast.error('Please enter a valid YouTube channel URL');
      return;
    }

    setIsVerifying(true);

    try {
      // Extract channel ID from URL (this is a simplified version)
      let channelId = '';
      
      if (channelUrl.includes('youtube.com/channel/')) {
        channelId = channelUrl.split('youtube.com/channel/')[1].split('?')[0];
      } else if (channelUrl.includes('youtube.com/c/')) {
        channelId = channelUrl.split('youtube.com/c/')[1].split('?')[0];
      } else if (channelUrl.includes('youtube.com/@')) {
        channelId = channelUrl.split('youtube.com/@')[1].split('?')[0];
      } else {
        throw new Error('Invalid YouTube channel URL format');
      }

      // In a real implementation, we would verify the channel exists
      // For demo purposes, we'll just simulate a successful verification
      
      // Proceed to verification step
      setVerificationStep(true);
      toast.success('Channel found! Please complete verification');
    } catch (error: any) {
      console.error('Error verifying channel:', error);
      toast.error(error.message || 'Failed to verify channel');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmitChannel = async () => {
    setIsSubmitting(true);

    try {
      // In a real implementation, we would verify that the code was added to the channel description
      // For demo purposes, we'll just simulate a successful verification

      // Extract channel name (this is a simplified version)
      let channelName = '';
      
      if (channelUrl.includes('youtube.com/channel/')) {
        channelName = channelUrl.split('youtube.com/channel/')[1].split('?')[0];
      } else if (channelUrl.includes('youtube.com/c/')) {
        channelName = channelUrl.split('youtube.com/c/')[1].split('?')[0];
      } else if (channelUrl.includes('youtube.com/@')) {
        channelName = channelUrl.split('youtube.com/@')[1].split('?')[0];
      }

      // Update user profile with YouTube channel info
      await updateProfile({
        youtube_channel_id: channelName,
        youtube_channel_name: channelName,
        youtube_channel_url: channelUrl
      });

      toast.success('YouTube channel linked successfully!');
      
      // Reset form
      setChannelUrl('');
      setVerificationStep(false);
      generateVerificationCode();
    } catch (error: any) {
      console.error('Error submitting channel:', error);
      toast.error(error.message || 'Failed to link channel');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-0 shadow-md w-full">
      <CardHeader className="bg-card/50 pb-8">
        <CardTitle className="text-2xl font-bold">Add Channel</CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {!verificationStep ? (
          <>
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-lg font-medium">1. Channel Details</p>
                <div className="flex space-x-2">
                  <Input
                    placeholder="YouTube Channel URL"
                    value={channelUrl}
                    onChange={(e) => setChannelUrl(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleVerifyChannel} 
                    disabled={isVerifying || !channelUrl.trim()}
                  >
                    {isVerifying ? 'Verifying...' : 'Verify'}
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-lg font-medium">1. Channel Details</p>
                <div className="flex items-center space-x-2 p-2 bg-primary/5 rounded">
                  <Youtube className="h-5 w-5 text-primary" />
                  <p className="text-sm font-medium truncate">{channelUrl}</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Verified
                  </span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <p className="text-lg font-medium">2. Verification</p>
                <div className="bg-muted/50 p-4 rounded-md">
                  <p className="text-sm mb-4">
                    On the YouTube website, go to View your channel &gt; Customize channel &gt; Scroll down to "Description" and enter the verification code &gt; Publish in the top right corner
                  </p>
                  
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="font-medium">Verification Code:</span>
                    <div className="relative flex items-center">
                      <code className="font-mono bg-background px-3 py-1 rounded border">{verificationCode}</code>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={copyToClipboard}
                        className="ml-1"
                      >
                        {copied ? <Check className="h-4 w-4" /> : <ClipboardCopy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Button 
              className="w-full"
              onClick={handleSubmitChannel}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'Submit Channel'}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default LinkYouTubeChannel;

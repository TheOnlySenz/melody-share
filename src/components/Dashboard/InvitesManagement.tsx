
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clipboard, Copy, Check, Users, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useFadeIn } from '@/lib/animations';
import { formatDistance } from 'date-fns';

interface InviteCode {
  id: string;
  code: string;
  is_used: boolean;
  used_by: string | null;
  created_at: string;
  expires_at: string | null;
  used_by_profile?: {
    full_name: string;
    username: string;
  } | null;
}

const InvitesManagement = () => {
  const { user, generateInviteCode, getInviteCodes } = useAuth();
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  
  const headerAnimation = useFadeIn('up');
  const listAnimation = useFadeIn('up', { delay: 100 });
  
  useEffect(() => {
    fetchInviteCodes();
  }, [user]);
  
  const fetchInviteCodes = async () => {
    setIsLoading(true);
    const codes = await getInviteCodes();
    setInviteCodes(codes);
    setIsLoading(false);
  };
  
  const handleGenerateCode = async () => {
    setIsGenerating(true);
    try {
      const code = await generateInviteCode();
      if (code) {
        await fetchInviteCodes();
      }
    } finally {
      setIsGenerating(false);
    }
  };
  
  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/auth?mode=register&invite=${code}`);
    setCopiedCode(code);
    toast.success('Invite link copied to clipboard');
    setTimeout(() => setCopiedCode(null), 2000);
  };
  
  const getInviteStatus = (inviteCode: InviteCode) => {
    if (inviteCode.is_used) {
      return {
        label: 'Used',
        variant: 'outline' as const,
        icon: Check
      };
    }
    
    if (inviteCode.expires_at && new Date(inviteCode.expires_at) < new Date()) {
      return {
        label: 'Expired',
        variant: 'destructive' as const,
        icon: AlertCircle
      };
    }
    
    return {
      label: 'Active',
      variant: 'default' as const,
      icon: Users
    };
  };
  
  const getRemainingTime = (expiresAt: string | null) => {
    if (!expiresAt) return 'Never expires';
    
    const expireDate = new Date(expiresAt);
    if (expireDate < new Date()) return 'Expired';
    
    return `Expires ${formatDistance(expireDate, new Date(), { addSuffix: true })}`;
  };
  
  return (
    <div className="space-y-6">
      <div 
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        ref={headerAnimation.ref}
        style={headerAnimation.style}
      >
        <div>
          <h2 className="text-2xl font-bold">Invite Management</h2>
          <p className="text-muted-foreground">
            Generate and manage your invite codes
          </p>
        </div>
        
        <Button 
          onClick={handleGenerateCode} 
          disabled={isGenerating || (user?.profile?.invites_available === 0)}
        >
          {isGenerating ? (
            <>Generating...</>
          ) : (
            <>
              <Clipboard className="mr-2 h-4 w-4" />
              Generate Invite Code
            </>
          )}
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Your Invite Codes</span>
            <Badge variant="outline" className="ml-2">
              {user?.profile?.invites_available ?? 0} invites available
            </Badge>
          </CardTitle>
          <CardDescription>
            Share these codes with friends to invite them to the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="text-muted-foreground mt-2">Loading invite codes...</p>
            </div>
          ) : inviteCodes.length === 0 ? (
            <div className="text-center py-8 border rounded-lg border-dashed">
              <Clipboard className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">You haven't generated any invite codes yet</p>
              <Button variant="outline" className="mt-4" onClick={handleGenerateCode}>
                Generate your first invite code
              </Button>
            </div>
          ) : (
            <div 
              className="space-y-4"
              ref={listAnimation.ref}
              style={listAnimation.style}
            >
              {inviteCodes.map((invite) => {
                const status = getInviteStatus(invite);
                const StatusIcon = status.icon;
                
                return (
                  <div 
                    key={invite.id} 
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <code className="font-mono bg-muted px-2 py-1 rounded text-sm">{invite.code}</code>
                        <Badge variant={status.variant}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {status.label}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground flex flex-col sm:flex-row sm:gap-3">
                        <span>Created {formatDistance(new Date(invite.created_at), new Date(), { addSuffix: true })}</span>
                        <span className="sm:before:content-['•'] sm:before:mx-1">{getRemainingTime(invite.expires_at)}</span>
                        {invite.is_used && invite.used_by_profile && (
                          <span className="sm:before:content-['•'] sm:before:mx-1">
                            Used by {invite.used_by_profile.full_name}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {!invite.is_used && !(invite.expires_at && new Date(invite.expires_at) < new Date()) && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2 sm:mt-0"
                        onClick={() => copyToClipboard(invite.code)}
                      >
                        {copiedCode === invite.code ? (
                          <>
                            <Check className="h-4 w-4 mr-1" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-1" />
                            Copy Link
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InvitesManagement;

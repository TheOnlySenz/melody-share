
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { formatDistance } from 'date-fns';
import { Copy, CheckCircle2, XCircle } from 'lucide-react';

const AdminInvites = () => {
  const [invites, setInvites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteCount, setInviteCount] = useState<number>(5);
  const [generatingInvites, setGeneratingInvites] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    fetchInvites();
  }, []);

  const fetchInvites = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('invite_codes')
        .select(`
          *,
          creator:profiles!created_by(full_name),
          user:profiles!used_by(full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvites(data || []);
    } catch (error) {
      console.error('Error fetching invites:', error);
      toast.error('Failed to load invites');
    } finally {
      setLoading(false);
    }
  };

  const generateInviteCodes = async () => {
    try {
      setGeneratingInvites(true);
      
      // Get the current admin user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const newInvites = [];
      
      for (let i = 0; i < inviteCount; i++) {
        const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        newInvites.push({
          code: randomCode,
          created_by: user.id,
          is_admin_generated: true,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        });
      }
      
      const { data, error } = await supabase
        .from('invite_codes')
        .insert(newInvites)
        .select();
      
      if (error) throw error;
      
      await fetchInvites();
      
      toast.success(`${inviteCount} invite codes generated successfully`);
    } catch (error) {
      console.error('Error generating invites:', error);
      toast.error('Failed to generate invite codes');
    } finally {
      setGeneratingInvites(false);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/invite/${code}`);
    setCopiedCode(code);
    toast.success('Invite link copied to clipboard');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getInviteStatus = (invite: any) => {
    if (invite.is_used) {
      return { label: 'Used', variant: 'outline' as const };
    }
    
    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
      return { label: 'Expired', variant: 'destructive' as const };
    }
    
    return { label: 'Active', variant: 'default' as const };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Invite Code Management</h2>
        <Button variant="outline" onClick={fetchInvites} disabled={loading}>
          Refresh
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4 border rounded-lg p-4">
          <h3 className="text-lg font-medium">Generate Admin Invite Codes</h3>
          <div className="space-y-2">
            <Label htmlFor="invite-count">Number of Invites</Label>
            <Input 
              id="invite-count"
              type="number" 
              min="1" 
              max="50" 
              value={inviteCount} 
              onChange={(e) => setInviteCount(parseInt(e.target.value) || 1)}
            />
          </div>
          <Button 
            onClick={generateInviteCodes} 
            disabled={generatingInvites}
            className="w-full"
          >
            {generatingInvites ? 'Generating...' : 'Generate Invite Codes'}
          </Button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Used By</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invites.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No invite codes found
                  </TableCell>
                </TableRow>
              ) : (
                invites.map((invite) => {
                  const status = getInviteStatus(invite);
                  return (
                    <TableRow key={invite.id}>
                      <TableCell>
                        <code className="bg-muted px-2 py-1 rounded text-sm">{invite.code}</code>
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {invite.creator ? (
                          <span>{invite.creator.full_name}</span>
                        ) : (
                          <span className="text-muted-foreground text-sm">System</span>
                        )}
                        {invite.is_admin_generated && (
                          <Badge variant="outline" className="ml-2">Admin</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {formatDistance(new Date(invite.created_at), new Date(), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        {invite.expires_at ? (
                          formatDistance(new Date(invite.expires_at), new Date(), { addSuffix: true })
                        ) : (
                          <span className="text-muted-foreground text-sm">Never</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {invite.user ? (
                          <span>{invite.user.full_name}</span>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {invite.is_used || (invite.expires_at && new Date(invite.expires_at) < new Date()) ? (
                          <Button variant="ghost" size="sm" disabled>
                            <XCircle className="h-4 w-4 mr-2" />
                            Unavailable
                          </Button>
                        ) : (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-primary"
                            onClick={() => copyToClipboard(invite.code)}
                          >
                            {copiedCode === invite.code ? (
                              <>
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Copied
                              </>
                            ) : (
                              <>
                                <Copy className="h-4 w-4 mr-2" />
                                Copy Link
                              </>
                            )}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default AdminInvites;

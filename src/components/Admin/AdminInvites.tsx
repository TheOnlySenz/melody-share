
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Plus, Clipboard, Copy, Check, Trash, Calendar } from 'lucide-react';
import { format, formatDistance, addDays } from 'date-fns';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface InviteCode {
  id: string;
  code: string;
  created_at: string;
  expires_at: string | null;
  created_by: string | null;
  is_used: boolean;
  used_by: string | null;
  is_admin_generated: boolean;
  creator_name?: string;
  user_name?: string;
}

const AdminInvites = () => {
  const [invites, setInvites] = useState<InviteCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [expireDays, setExpireDays] = useState("7");
  const [numCodes, setNumCodes] = useState(1);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    fetchInvites();
  }, []);

  const fetchInvites = async () => {
    setIsLoading(true);
    try {
      // Fetch all invite codes, including creator and user info
      const { data, error } = await supabase
        .from('invite_codes')
        .select(`
          *,
          creator:created_by (full_name),
          user:used_by (full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data to include creator and user names
      const transformedData = data.map(invite => ({
        ...invite,
        creator_name: invite.creator?.full_name || 'Admin',
        user_name: invite.user?.full_name || null
      }));

      setInvites(transformedData);
    } catch (error) {
      console.error('Error fetching invites:', error);
      toast.error('Failed to load invite codes');
    } finally {
      setIsLoading(false);
    }
  };

  const generateInviteCodes = async () => {
    setIsGenerating(true);
    try {
      const codes = [];
      const days = parseInt(expireDays);
      const expiryDate = days > 0 ? addDays(new Date(), days).toISOString() : null;
      
      for (let i = 0; i < numCodes; i++) {
        // Generate a random code
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        
        // Insert the code
        const { data, error } = await supabase
          .from('invite_codes')
          .insert({
            code,
            expires_at: expiryDate,
            is_admin_generated: true
          })
          .select('*')
          .single();
          
        if (error) throw error;
        codes.push(data);
      }
      
      // Update the invites list
      setInvites([...codes.map(code => ({
        ...code,
        creator_name: 'Admin',
        user_name: null
      })), ...invites]);
      
      toast.success(`Generated ${numCodes} invite code${numCodes > 1 ? 's' : ''} successfully`);
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Error generating invite codes:', error);
      toast.error('Failed to generate invite codes');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/invite/${code}`);
    setCopiedCode(code);
    toast.success('Invite link copied to clipboard');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const deleteInviteCode = async (id: string) => {
    try {
      const { error } = await supabase
        .from('invite_codes')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state
      setInvites(invites.filter(invite => invite.id !== id));
      toast.success('Invite code deleted successfully');
    } catch (error) {
      console.error('Error deleting invite code:', error);
      toast.error('Failed to delete invite code');
    }
  };

  const getInviteStatus = (invite: InviteCode) => {
    if (invite.is_used) {
      return {
        label: 'Used',
        variant: 'outline' as const,
        color: 'text-gray-500'
      };
    }
    
    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
      return {
        label: 'Expired',
        variant: 'destructive' as const,
        color: 'text-red-500'
      };
    }
    
    return {
      label: 'Active',
      variant: 'default' as const,
      color: 'text-green-500'
    };
  };

  if (isLoading) {
    return (
      <div className="w-full flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Invite Codes Management</h2>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Generate Invite Codes
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Invite Codes</CardTitle>
          <CardDescription>
            Manage invite codes created by admins and users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Used By</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invites.map((invite) => {
                const status = getInviteStatus(invite);
                
                return (
                  <TableRow key={invite.id}>
                    <TableCell className="font-mono">
                      {invite.code}
                    </TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {invite.is_admin_generated ? (
                        <Badge variant="secondary">Admin</Badge>
                      ) : invite.creator_name}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(invite.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {invite.expires_at 
                        ? format(new Date(invite.expires_at), 'MMM d, yyyy')
                        : 'Never'}
                    </TableCell>
                    <TableCell>
                      {invite.is_used && invite.user_name ? (
                        invite.user_name
                      ) : (
                        <span className="text-sm text-muted-foreground">Not used</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {!invite.is_used && !(invite.expires_at && new Date(invite.expires_at) < new Date()) && (
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => copyToClipboard(invite.code)}
                          >
                            {copiedCode === invite.code ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                        
                        <Button 
                          variant="destructive" 
                          size="icon" 
                          onClick={() => deleteInviteCode(invite.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Total: {invites.length} invite codes
          </div>
          <div className="text-sm text-muted-foreground">
            Active: {invites.filter(invite => 
              !invite.is_used && 
              (!invite.expires_at || new Date(invite.expires_at) >= new Date())
            ).length} codes
          </div>
        </CardFooter>
      </Card>
      
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Generate Invite Codes</DialogTitle>
            <DialogDescription>
              Create new invite codes for users to join the platform
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="num-codes" className="text-right">
                Number
              </Label>
              <Input
                id="num-codes"
                type="number"
                min={1}
                max={100}
                value={numCodes}
                onChange={(e) => setNumCodes(parseInt(e.target.value) || 1)}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="expire-days" className="text-right">
                Expiry
              </Label>
              <Select value={expireDays} onValueChange={setExpireDays}>
                <SelectTrigger id="expire-days" className="col-span-3">
                  <SelectValue placeholder="Select expiry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="14">14 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="0">Never expires</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={generateInviteCodes} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Clipboard className="mr-2 h-4 w-4" />
                  Generate
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminInvites;

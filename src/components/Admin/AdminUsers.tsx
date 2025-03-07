
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Edit, User, Shield, ShieldX } from 'lucide-react';
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

interface UserProfile {
  id: string;
  full_name: string;
  username: string;
  email: string;
  role: string;
  avatar_url: string | null;
  created_at: string;
  is_admin: boolean;
  invites_available: number;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editUser, setEditUser] = useState<UserProfile | null>(null);
  const [editRole, setEditRole] = useState<string>('');
  const [editInvites, setEditInvites] = useState<number>(0);
  const [editAdmin, setEditAdmin] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          username,
          avatar_url,
          role,
          created_at,
          is_admin,
          invites_available,
          auth_users:id (email)
        `)
        .returns<any[]>();

      if (error) throw error;

      // Transform the data to include email from the auth.users table
      const transformedProfiles = profiles.map(profile => ({
        ...profile,
        email: profile.auth_users?.email || 'No email found',
      }));

      setUsers(transformedProfiles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditUser = (user: UserProfile) => {
    setEditUser(user);
    setEditRole(user.role);
    setEditInvites(user.invites_available);
    setEditAdmin(!!user.is_admin);
  };

  const handleSaveUser = async () => {
    if (!editUser) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          role: editRole,
          invites_available: editInvites,
          is_admin: editAdmin
        })
        .eq('id', editUser.id);

      if (error) throw error;
      
      // Update local state
      setUsers(users.map(user => 
        user.id === editUser.id 
          ? { ...user, role: editRole, invites_available: editInvites, is_admin: editAdmin } 
          : user
      ));
      
      toast.success('User updated successfully');
      setEditUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleAdmin = async (userId: string, isCurrentlyAdmin: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_admin: !isCurrentlyAdmin
        })
        .eq('id', userId);

      if (error) throw error;
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, is_admin: !isCurrentlyAdmin } 
          : user
      ));
      
      toast.success(`User admin status ${!isCurrentlyAdmin ? 'granted' : 'revoked'}`);
    } catch (error) {
      console.error('Error toggling admin status:', error);
      toast.error('Failed to update admin status');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
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
      <h2 className="text-2xl font-bold">User Management</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            Manage user roles, admin status, and invite allocations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-center">Invites</TableHead>
                <TableHead className="text-center">Admin</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage src={user.avatar_url || ''} alt={user.full_name} />
                        <AvatarFallback>{getInitials(user.full_name)}</AvatarFallback>
                      </Avatar>
                      {user.full_name}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {user.email}
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'creator' ? 'default' : 'secondary'}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {user.invites_available}
                  </TableCell>
                  <TableCell className="text-center">
                    {user.is_admin ? (
                      <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                        Admin
                      </Badge>
                    ) : (
                      <Badge variant="outline">User</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="icon" onClick={() => handleEditUser(user)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant={user.is_admin ? "destructive" : "outline"} 
                        size="icon" 
                        onClick={() => handleToggleAdmin(user.id, !!user.is_admin)}
                      >
                        {user.is_admin ? <ShieldX className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user role, admin status, and invite allocations
            </DialogDescription>
          </DialogHeader>
          
          {editUser && (
            <div className="grid gap-4 py-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={editUser.avatar_url || ''} alt={editUser.full_name} />
                  <AvatarFallback>{getInitials(editUser.full_name)}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium">{editUser.full_name}</h4>
                  <p className="text-sm text-muted-foreground">{editUser.email}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">Role</Label>
                <Select value={editRole} onValueChange={setEditRole}>
                  <SelectTrigger id="role" className="col-span-3">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="creator">Creator</SelectItem>
                    <SelectItem value="artist">Artist</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="invites" className="text-right">Invites</Label>
                <Input
                  id="invites"
                  type="number"
                  value={editInvites}
                  onChange={(e) => setEditInvites(Number(e.target.value))}
                  min={0}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="admin-status" className="text-right">Admin</Label>
                <div className="col-span-3 flex items-center">
                  <Select value={editAdmin ? "true" : "false"} onValueChange={(value) => setEditAdmin(value === "true")}>
                    <SelectTrigger id="admin-status">
                      <SelectValue placeholder="Admin status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Admin</SelectItem>
                      <SelectItem value="false">User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)}>Cancel</Button>
            <Button onClick={handleSaveUser} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;

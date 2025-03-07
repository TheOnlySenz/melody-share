
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Users, Ticket, DollarSign, Activity } from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalCreators: number;
  totalArtists: number;
  totalInvites: number;
  activeInvites: number;
  usedInvites: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        // Get total users count
        const { count: totalUsers } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        // Get total creators count
        const { count: totalCreators } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'creator');

        // Get total artists count
        const { count: totalArtists } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'artist');

        // Get invites stats
        const { count: totalInvites } = await supabase
          .from('invite_codes')
          .select('*', { count: 'exact', head: true });

        const { count: activeInvites } = await supabase
          .from('invite_codes')
          .select('*', { count: 'exact', head: true })
          .eq('is_used', false)
          .gt('expires_at', new Date().toISOString());

        const { count: usedInvites } = await supabase
          .from('invite_codes')
          .select('*', { count: 'exact', head: true })
          .eq('is_used', true);

        setStats({
          totalUsers: totalUsers || 0,
          totalCreators: totalCreators || 0,
          totalArtists: totalArtists || 0,
          totalInvites: totalInvites || 0,
          activeInvites: activeInvites || 0,
          usedInvites: usedInvites || 0,
        });
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Platform Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.totalCreators || 0} Creators, {stats?.totalArtists || 0} Artists
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Invite Codes</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalInvites || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.activeInvites || 0} Active, {stats?.usedInvites || 0} Used
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Platform Activity</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Active</div>
            <p className="text-xs text-muted-foreground">
              All systems operational
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;

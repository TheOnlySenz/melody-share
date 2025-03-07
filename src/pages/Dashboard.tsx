
import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import MusicLibrary from '@/components/Dashboard/MusicLibrary';
import Analytics from '@/components/Dashboard/Analytics';
import Profile from '@/components/Dashboard/Profile';
import Payments from '@/components/Dashboard/Payments';
import Earnings from '@/components/Dashboard/Earnings';
import MyMusic from '@/components/Dashboard/MyMusic';
import Royalties from '@/components/Dashboard/Royalties';
import InvitesManagement from '@/components/Dashboard/InvitesManagement';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const Dashboard = () => {
  const { user, isLoading, activeRole } = useAuth();
  const navigate = useNavigate();
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (!data.session) {
          navigate('/auth', { replace: true });
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setIsCheckingSession(false);
      }
    };
    
    checkSession();
  }, [navigate]);

  // If auth is still loading or checking session, show a loading state
  if (isLoading || isCheckingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Creator dashboard routes
  if (activeRole === 'creator') {
    return (
      <DashboardLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard/music" replace />} />
          <Route path="/music" element={<MusicLibrary />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/earnings" element={<Earnings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/settings" element={<Profile />} />
          <Route path="/invites" element={<InvitesManagement />} />
          {/* Redirect artist routes to creator dashboard */}
          <Route path="/my-music" element={<Navigate to="/dashboard/music" replace />} />
          <Route path="/royalties" element={<Navigate to="/dashboard/earnings" replace />} />
          <Route path="/music-analytics" element={<Navigate to="/dashboard/analytics" replace />} />
        </Routes>
      </DashboardLayout>
    );
  }
  
  // Artist dashboard routes
  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard/my-music" replace />} />
        <Route path="/my-music" element={<MyMusic />} />
        <Route path="/royalties" element={<Royalties />} />
        <Route path="/music-analytics" element={<Analytics />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Profile />} />
        <Route path="/invites" element={<InvitesManagement />} />
        {/* Redirect creator routes to artist dashboard */}
        <Route path="/music" element={<Navigate to="/dashboard/my-music" replace />} />
        <Route path="/analytics" element={<Navigate to="/dashboard/music-analytics" replace />} />
        <Route path="/earnings" element={<Navigate to="/dashboard/royalties" replace />} />
      </Routes>
    </DashboardLayout>
  );
};

export default Dashboard;

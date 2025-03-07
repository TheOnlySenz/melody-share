
import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import MusicLibrary from '@/components/Dashboard/MusicLibrary';
import Analytics from '@/components/Dashboard/Analytics';
import Profile from '@/components/Dashboard/Profile';
import Payments from '@/components/Dashboard/Payments';
import Earnings from '@/components/Dashboard/Earnings';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const Dashboard = () => {
  const { user, isLoading } = useAuth();
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
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard/music" replace />} />
        <Route path="/music" element={<MusicLibrary />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/earnings" element={<Earnings />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/settings" element={<Profile />} />
      </Routes>
    </DashboardLayout>
  );
};

export default Dashboard;

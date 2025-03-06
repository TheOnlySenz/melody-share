
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import MusicLibrary from '@/components/Dashboard/MusicLibrary';
import Analytics from '@/components/Dashboard/Analytics';
import Profile from '@/components/Dashboard/Profile';
import { useAuth } from '@/context/AuthContext';

const Dashboard = () => {
  const { user, isLoading } = useAuth();

  // If auth is still loading, show a loading state
  if (isLoading) {
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
      </Routes>
    </DashboardLayout>
  );
};

export default Dashboard;

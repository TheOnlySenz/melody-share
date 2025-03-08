
import React, { useState, useEffect } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import AuthForm from '@/components/AuthForm';
import InviteRegistration from '@/components/InviteRegistration';
import { useAuth } from '@/context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Auth = () => {
  const { user, isLoading } = useAuth();
  const { code } = useParams<{ code?: string }>();
  const [activeTab, setActiveTab] = useState<string>(code ? 'register' : 'login');

  // If invite code is present, switch to registration tab
  useEffect(() => {
    if (code) {
      setActiveTab('register');
    }
  }, [code]);

  // If auth is still loading, show a loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // If already authenticated, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  // If invite code is present, show the invite registration
  if (code) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <InviteRegistration />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold">
            Welcome to ShortsRev
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to access exclusive music for your Shorts and start earning
          </p>
        </div>
        <AuthForm />
      </div>
    </div>
  );
};

export default Auth;

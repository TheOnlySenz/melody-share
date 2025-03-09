
import React, { useState, useEffect } from 'react';
import { Navigate, useParams, Link } from 'react-router-dom';
import AuthForm from '@/components/AuthForm';
import InviteRegistration from '@/components/InviteRegistration';
import DemoInviteCode from '@/components/DemoInviteCode';
import { useAuth } from '@/context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Shield, ArrowLeft } from 'lucide-react';

const Auth = () => {
  const { user, isLoading } = useAuth();
  const { code } = useParams<{ code?: string }>();
  const [activeTab, setActiveTab] = useState<string>(code ? 'register' : 'login');
  const [showDemo, setShowDemo] = useState<boolean>(false);

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
          <Link to="/auth" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to login
          </Link>
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-center mb-4">
                <Shield className="h-12 w-12 text-primary" />
              </div>
              <CardTitle className="text-xl text-center">Exclusive Access</CardTitle>
              <CardDescription className="text-center">
                You've been invited to join ShortsRev
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InviteRegistration />
            </CardContent>
          </Card>
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
          
          {/* Toggle for demo functionality */}
          <button 
            onClick={() => setShowDemo(!showDemo)} 
            className="mt-2 text-xs text-primary hover:underline"
          >
            {showDemo ? 'Hide demo options' : 'Need a demo invite?'}
          </button>
        </div>
        
        {showDemo && (
          <div className="mb-6">
            <DemoInviteCode />
          </div>
        )}
        
        <Card className="border-0 shadow-md">
          <CardContent className="pt-6">
            <AuthForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;

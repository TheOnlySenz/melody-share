import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface Profile {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  youtube_channel_id?: string;
  youtube_channel_name?: string;
  role: 'creator' | 'artist';
  has_dual_role?: boolean;
  secondary_role?: 'creator' | 'artist';
  invited_by?: string;
  invite_code?: string;
  invites_available: number;
  is_admin?: boolean;
}

interface InviteCode {
  id: string;
  code: string;
  created_by: string | null;
  is_used: boolean;
  used_by?: string | null;
  created_at: string;
  expires_at?: string | null;
  is_admin_generated?: boolean;
  used_by_profile?: {
    full_name: string;
    username: string;
  } | null;
}

interface UserWithProfile extends User {
  profile?: Profile;
  // Add these properties for compatibility with existing code
  name?: string;
  avatar?: string;
  role?: 'creator' | 'artist';
  email?: string;
}

interface AuthContextType {
  user: UserWithProfile | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  activeRole: 'creator' | 'artist';
  setActiveRole: (role: 'creator' | 'artist') => void;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: 'creator' | 'artist', inviteCode: string) => Promise<void>;
  logout: () => Promise<void>;
  getUserProfile: () => Promise<Profile | null>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  generateInviteCode: () => Promise<string | null>;
  getInviteCodes: () => Promise<InviteCode[]>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserWithProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeRole, setActiveRole] = useState<'creator' | 'artist'>('creator');

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      
      if (currentSession?.user) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentSession.user.id)
            .single();
          
          setUser({
            ...currentSession.user,
            profile: profile as Profile,
            name: profile?.full_name || currentSession.user.email?.split('@')[0],
            avatar: profile?.avatar_url,
            role: profile?.role as 'creator' | 'artist',
            email: currentSession.user.email
          });

          if (profile?.role) {
            setActiveRole(profile.role as 'creator' | 'artist');
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
          setUser({
            ...currentSession.user,
            name: currentSession.user.email?.split('@')[0],
            role: (currentSession.user.user_metadata?.role as 'creator' | 'artist') || 'creator',
            email: currentSession.user.email
          });
        }
      }
      
      setIsLoading(false);
    };

    initAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        
        if (currentSession?.user) {
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', currentSession.user.id)
              .single();
            
            setUser({
              ...currentSession.user,
              profile: profile as Profile,
              name: profile?.full_name || currentSession.user.email?.split('@')[0],
              avatar: profile?.avatar_url,
              role: profile?.role as 'creator' | 'artist',
              email: currentSession.user.email
            });

            if (profile?.role) {
              setActiveRole(profile.role as 'creator' | 'artist');
            }
          } catch (error) {
            console.error('Error fetching profile:', error);
            setUser({
              ...currentSession.user || null,
              name: currentSession.user.email?.split('@')[0],
              role: (currentSession.user.user_metadata?.role as 'creator' | 'artist') || 'creator',
              email: currentSession.user.email
            });
          }
        } else {
          setUser(null);
        }
        
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      toast.success('Successfully logged in');
    } catch (error) {
      const authError = error as AuthError;
      toast.error(authError.message || 'Failed to log in');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: 'creator' | 'artist', inviteCode: string) => {
    setIsLoading(true);
    try {
      const isValidCode = await supabase
        .from('invite_codes')
        .select('*')
        .eq('code', inviteCode)
        .eq('is_used', false)
        .single();
      
      if (!isValidCode.data || (isValidCode.data.expires_at && new Date(isValidCode.data.expires_at) < new Date())) {
        throw new Error('Invalid or expired invite code');
      }
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            role,
          },
        },
      });

      if (error) throw error;
      
      if (inviteCode && data.user) {
        const { data: inviteData, error: inviteError } = await supabase.rpc('use_invite_code', {
          code_to_use: inviteCode,
          user_id: data.user.id
        });
        
        if (inviteError) {
          console.error('Error applying invite code:', inviteError);
        }
      }
      
      toast.success('Registration successful! Please check your email for confirmation.');
    } catch (error) {
      const authError = error as AuthError;
      toast.error(authError.message || 'Failed to register');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast.success('Successfully logged out');
    } catch (error) {
      const authError = error as AuthError;
      toast.error(authError.message || 'Failed to log out');
    }
  };

  const getUserProfile = async (): Promise<Profile | null> => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data as Profile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  const updateProfile = async (profileData: Partial<Profile>) => {
    if (!user) {
      toast.error('You must be logged in to update your profile');
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id);
      
      if (error) throw error;
      
      if (user.profile) {
        const updatedProfile = {
          ...user.profile,
          ...profileData
        };
        
        setUser({
          ...user,
          profile: updatedProfile,
          name: updatedProfile.full_name,
          avatar: updatedProfile.avatar_url,
          role: updatedProfile.role
        });
      }
      
      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    }
  };

  const generateInviteCode = async (): Promise<string | null> => {
    if (!user) {
      toast.error('You must be logged in to generate invite codes');
      return null;
    }
    
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('invites_available')
        .eq('id', user.id)
        .single();
      
      if (profileError) throw profileError;
      
      if (!profile || profile.invites_available <= 0) {
        toast.error('You don\'t have any invites available');
        return null;
      }
      
      const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const { data, error } = await supabase
        .from('invite_codes')
        .insert({
          code: randomCode,
          created_by: user.id,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        })
        .select('code')
        .single();
      
      if (error) throw error;
      
      await supabase
        .from('profiles')
        .update({ invites_available: profile.invites_available - 1 })
        .eq('id', user.id);
      
      toast.success('Invite code generated successfully');
      return data.code;
    } catch (error: any) {
      console.error('Error generating invite code:', error);
      toast.error(error.message || 'Failed to generate invite code');
      return null;
    }
  };

  const getInviteCodes = async (): Promise<InviteCode[]> => {
    if (!user) return [];
    
    try {
      const { data, error } = await supabase
        .from('invite_codes')
        .select(`
          *,
          used_by_profile:profiles!used_by(full_name, username)
        `)
        .eq('created_by', user.id);
      
      if (error) throw error;
      
      return data as unknown as InviteCode[];
    } catch (error) {
      console.error('Error fetching invite codes:', error);
      return [];
    }
  };

  const resetPassword = async (email: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      toast.success('Password reset link sent to your email');
    } catch (error) {
      const authError = error as AuthError;
      toast.error(authError.message || 'Failed to send password reset link');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async (newPassword: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (error) throw error;
      
      toast.success('Password updated successfully');
    } catch (error) {
      const authError = error as AuthError;
      toast.error(authError.message || 'Failed to update password');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session,
      isAuthenticated: !!user, 
      isLoading, 
      activeRole,
      setActiveRole,
      login, 
      register, 
      logout,
      getUserProfile,
      updateProfile,
      generateInviteCode,
      getInviteCodes,
      resetPassword,
      updatePassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

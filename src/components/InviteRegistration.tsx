
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { validateInviteCode } from '@/integrations/supabase/client';
import { Shield, Mail, UserPlus, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// Define form validation schema
const registerSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
  role: z.enum(['creator', 'artist']),
  inviteCode: z.string().min(4, { message: 'Please enter a valid invite code' })
});

const InviteRegistration = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { register: registerUser, isLoading } = useAuth();
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteValid, setInviteValid] = useState<boolean | null>(null);
  const [inviteDetails, setInviteDetails] = useState<any>(null);

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'creator',
      inviteCode: code || ''
    }
  });

  // Validate invite code on component mount
  useEffect(() => {
    if (code) {
      validateInvite(code);
    }
  }, [code]);

  const validateInvite = async (inviteCode: string) => {
    try {
      setInviteLoading(true);
      
      // Check if invite code is valid
      const isValid = await validateInviteCode(inviteCode);
      setInviteValid(isValid);
      
      if (isValid) {
        // Get invite details
        const { data, error } = await supabase
          .from('invite_codes')
          .select(`
            *,
            creator:profiles!created_by(full_name)
          `)
          .eq('code', inviteCode)
          .single();
        
        if (error) throw error;
        setInviteDetails(data);
      }
    } catch (error) {
      console.error('Error validating invite:', error);
      setInviteValid(false);
    } finally {
      setInviteLoading(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof registerSchema>) => {
    try {
      await registerUser(
        values.name,
        values.email,
        values.password,
        values.role,
        values.inviteCode
      );
      
      toast.success('Registration successful! Please check your email for confirmation.');
      navigate('/auth', { replace: true });
    } catch (error: any) {
      toast.error(error.message || 'Failed to register. Please try again.');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center justify-center mb-4">
          <Shield className="h-12 w-12 text-primary" />
        </div>
        <CardTitle className="text-xl text-center">Join ShortsRev</CardTitle>
        <CardDescription className="text-center">
          Create your account using the invite code
        </CardDescription>
      </CardHeader>
      <CardContent>
        {inviteLoading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : inviteValid === false ? (
          <div className="bg-destructive/10 p-4 rounded-md flex items-center gap-2 text-sm">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <span>This invite code is invalid or has expired.</span>
          </div>
        ) : inviteValid && inviteDetails ? (
          <div className="bg-primary/10 p-4 rounded-md mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Check className="h-5 w-5 text-primary" />
              <span className="font-medium">Valid invite code</span>
            </div>
            {inviteDetails.creator && (
              <p className="text-sm text-muted-foreground">
                Invited by {inviteDetails.creator.full_name}
              </p>
            )}
          </div>
        ) : null}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your full name" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Enter your email" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Create a password" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>I am a</FormLabel>
                  <Tabs 
                    defaultValue={field.value} 
                    className="w-full" 
                    onValueChange={field.onChange}
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="creator">Creator</TabsTrigger>
                      <TabsTrigger value="artist">Artist</TabsTrigger>
                    </TabsList>
                  </Tabs>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="inviteCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Invite Code</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter invite code" 
                      {...field} 
                      onChange={(e) => {
                        field.onChange(e);
                        if (e.target.value.length >= 4) {
                          validateInvite(e.target.value);
                        }
                      }}
                      disabled={isLoading || !!code}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full" disabled={isLoading || inviteValid === false}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button variant="link" onClick={() => navigate('/auth')}>
          Already have an account? Sign in
        </Button>
      </CardFooter>
    </Card>
  );
};

export default InviteRegistration;

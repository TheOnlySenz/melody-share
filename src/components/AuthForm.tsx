
import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from '@/integrations/supabase/client';

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  role: z.enum(["creator", "artist"], { 
    required_error: "Please select a role" 
  }),
  inviteCode: z.string().min(6, { message: "Please enter a valid invite code" }),
});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

const AuthForm: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [inviteStatus, setInviteStatus] = useState<'checking' | 'valid' | 'invalid' | 'idle'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const mode = searchParams.get('mode') || 'login';
  const inviteParam = searchParams.get('invite') || '';
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "creator",
      inviteCode: inviteParam,
    },
  });

  // Check invite code validity
  const checkInviteCode = async (code: string) => {
    if (!code || code.length < 6) {
      setInviteStatus('idle');
      return;
    }
    
    setInviteStatus('checking');
    
    try {
      const { data, error } = await supabase
        .from('invite_codes')
        .select('*')
        .eq('code', code)
        .eq('is_used', false)
        .single();
      
      if (error) throw error;
      
      if (data && (!data.expires_at || new Date(data.expires_at) > new Date())) {
        setInviteStatus('valid');
        setErrorMessage(null);
      } else {
        setInviteStatus('invalid');
        setErrorMessage('This invite code is invalid or has expired');
      }
    } catch (error) {
      console.error('Error checking invite code:', error);
      setInviteStatus('invalid');
      setErrorMessage('This invite code is invalid or has already been used');
    }
  };

  React.useEffect(() => {
    if (inviteParam) {
      registerForm.setValue('inviteCode', inviteParam);
      checkInviteCode(inviteParam);
    }
  }, [inviteParam]);

  const handleLogin = async (values: LoginValues) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await login(values.email, values.password);
      toast.success('Successfully logged in');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      setErrorMessage(error.message || 'Failed to log in');
      toast.error('Login failed', {
        description: error.message || 'Please check your credentials and try again',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (values: RegisterValues) => {
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      // Validate invite code first
      const { data: inviteData, error: inviteError } = await supabase
        .from('invite_codes')
        .select('*')
        .eq('code', values.inviteCode)
        .eq('is_used', false)
        .single();
      
      if (inviteError || !inviteData) {
        throw new Error('Invalid or expired invite code');
      }
      
      if (inviteData.expires_at && new Date(inviteData.expires_at) < new Date()) {
        throw new Error('This invite code has expired');
      }
      
      // Register the user
      await register(values.name, values.email, values.password, values.role);
      
      // Get the newly registered user
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Use the invite code
        const { data: useInviteResult, error: useInviteError } = await supabase
          .rpc('use_invite_code', {
            code_to_use: values.inviteCode,
            user_id: session.user.id
          });
        
        if (useInviteError) {
          console.error('Error using invite code:', useInviteError);
        }
        
        toast.success('Registration successful!', {
          description: 'Your account has been created'
        });
        
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      setErrorMessage(error.message || 'Failed to register');
      toast.error('Registration failed', {
        description: error.message || 'Please check your information and try again',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (newMode: 'login' | 'register') => {
    const params = new URLSearchParams(searchParams);
    params.set('mode', newMode);
    setSearchParams(params);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="shadow-elevated border-border animate-scale-in">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </CardTitle>
          <CardDescription className="text-center">
            {mode === 'login' 
              ? 'Sign in to access your account' 
              : 'Join ShortsRev to start earning with your content'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {errorMessage && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
          
          {mode === 'login' ? (
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="your@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full mt-2" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>
            </Form>
          ) : (
            <Form {...registerForm}>
              <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                <FormField
                  control={registerForm.control}
                  name="inviteCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invite Code</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            placeholder="Enter your invite code" 
                            {...field} 
                            onChange={(e) => {
                              field.onChange(e);
                              checkInviteCode(e.target.value);
                            }}
                            className={inviteStatus === 'valid' ? 'pr-10 border-green-500' : 
                                      inviteStatus === 'invalid' ? 'pr-10 border-red-500' : ''}
                          />
                          {inviteStatus === 'checking' && (
                            <Loader2 className="h-4 w-4 absolute right-3 top-3 animate-spin text-muted-foreground" />
                          )}
                          {inviteStatus === 'valid' && (
                            <CheckCircle2 className="h-4 w-4 absolute right-3 top-3 text-green-500" />
                          )}
                          {inviteStatus === 'invalid' && (
                            <AlertCircle className="h-4 w-4 absolute right-3 top-3 text-red-500" />
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={registerForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="your@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>I am a</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="creator" id="creator" />
                            <FormLabel htmlFor="creator" className="font-normal cursor-pointer">
                              Content Creator (YouTube Shorts)
                            </FormLabel>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="artist" id="artist" />
                            <FormLabel htmlFor="artist" className="font-normal cursor-pointer">
                              Music Artist/Producer
                            </FormLabel>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full mt-2" 
                  disabled={isLoading || inviteStatus === 'invalid' || inviteStatus === 'checking'}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          {mode === 'login' ? (
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Button 
                variant="link" 
                className="p-0 h-auto text-primary" 
                onClick={() => switchMode('register')}
              >
                Sign up
              </Button>
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Button 
                variant="link" 
                className="p-0 h-auto text-primary" 
                onClick={() => switchMode('login')}
              >
                Sign in
              </Button>
            </p>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default AuthForm;

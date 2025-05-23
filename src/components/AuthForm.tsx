
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define interface for invite code to use throughout the component
interface InviteCode {
  id: string;
  code: string;
  created_by: string;
  is_used: boolean;
  used_by?: string;
  created_at: string;
  expires_at?: string;
  is_admin_generated: boolean;
}

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

const resetPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email" }),
});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;
type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

const AuthForm: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { code: inviteParamFromRoute } = useParams<{ code?: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [inviteStatus, setInviteStatus] = useState<'checking' | 'valid' | 'invalid' | 'idle'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const mode = searchParams.get('mode') || 'login';
  const inviteParam = searchParams.get('invite') || inviteParamFromRoute || '';
  const navigate = useNavigate();
  const { login, register, resetPassword } = useAuth();

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

  const resetForm = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
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
      // Use direct query instead of RPC for validation
      const { data, error } = await supabase
        .from('invite_codes')
        .select('*')
        .eq('code', code)
        .eq('is_used', false)
        .single();
      
      if (error || !data) {
        setInviteStatus('invalid');
        setErrorMessage('This invite code is invalid or has already been used');
        return;
      }
      
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        setInviteStatus('invalid');
        setErrorMessage('This invite code has expired');
      } else {
        setInviteStatus('valid');
        setErrorMessage(null);
      }
    } catch (error) {
      console.error('Error checking invite code:', error);
      setInviteStatus('invalid');
      setErrorMessage('This invite code is invalid or has already been used');
    }
  };

  useEffect(() => {
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
      const { data, error } = await supabase
        .from('invite_codes')
        .select('*')
        .eq('code', values.inviteCode)
        .eq('is_used', false)
        .single();
      
      if (error || !data) {
        throw new Error('Invalid or expired invite code');
      }
      
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        throw new Error('This invite code has expired');
      }
      
      // Register the user
      await register(values.name, values.email, values.password, values.role, values.inviteCode);
      
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

  const handleResetPassword = async (values: ResetPasswordValues) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await resetPassword(values.email);
      toast.success('Password reset link sent', {
        description: 'Please check your email to reset your password'
      });
      resetForm.reset();
    } catch (error: any) {
      console.error('Reset password error:', error);
      setErrorMessage(error.message || 'Failed to send reset password link');
      toast.error('Reset password failed', {
        description: error.message || 'Please check your email and try again',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (newMode: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('mode', newMode);
    setSearchParams(params);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Tabs defaultValue={mode} onValueChange={switchMode}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="register">Register</TabsTrigger>
          <TabsTrigger value="reset">Reset Password</TabsTrigger>
        </TabsList>

        {errorMessage && (
          <Alert variant="destructive" className="mt-4 mb-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">Sign In</CardTitle>
              <CardDescription className="text-center">
                Sign in to access your account
              </CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
            <CardFooter className="flex justify-center">
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
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="register">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">Create Account</CardTitle>
              <CardDescription className="text-center">
                Join ShortsRev to start earning with your content
              </CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
            <CardFooter className="flex justify-center">
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
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="reset">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">Reset Password</CardTitle>
              <CardDescription className="text-center">
                Enter your email to receive a password reset link
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...resetForm}>
                <form onSubmit={resetForm.handleSubmit(handleResetPassword)} className="space-y-4">
                  <FormField
                    control={resetForm.control}
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
                  <Button type="submit" className="w-full mt-2" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending reset link...
                      </>
                    ) : (
                      'Send Reset Link'
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex justify-center">
              <p className="text-sm text-muted-foreground">
                Remembered your password?{' '}
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-primary" 
                  onClick={() => switchMode('login')}
                >
                  Sign in
                </Button>
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AuthForm;

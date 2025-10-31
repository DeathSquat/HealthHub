import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Heart, Mail, Lock, UserPlus, LogIn } from 'lucide-react';
import { toast } from 'sonner';
// Import from the correct path where we have the working client
import { supabase } from '@/integrations/supabase/client';

const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    let mounted = true;
    
    const initializeAuth = async () => {
      try {
        // Check for existing session
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted && session) {
          navigate('/');
          return;
        }

        // Set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (mounted && session) {
            navigate('/');
          }
        });

        // Cleanup function
        return () => {
          mounted = false;
          subscription?.unsubscribe();
        };
      } catch (error) {
        console.error('Auth initialization error:', error);
      }
    };

    // Initialize auth
    initializeAuth();

    // Cleanup on unmount
    return () => {
      mounted = false;
    };
  }, [navigate]);

  // Simple connection test
  const testConnection = async () => {
    try {
      const { error } = await supabase.auth.getSession();
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Connection test failed:', error.message);
      throw new Error('Cannot connect to the server. Please check your internet connection.');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setLoading(true);
    try {
      // First test the connection
      const isConnected = await testConnection();
      if (!isConnected) {
        throw new Error('Cannot connect to the server. Please check your internet connection.');
      }

      // Simple sign up
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin + '/auth/callback',
          data: {
            full_name: email.split('@')[0]
          }
        }
      });

      if (error) {
        if (error.message.includes('already registered')) {
          throw new Error('This email is already registered. Please sign in instead.');
        }
        throw error;
      }

      if (data.user && !data.session) {
        toast.success('Check your email for the confirmation link!');
        setEmail('');
        setPassword('');
      } else if (data.user && data.session) {
        navigate('/');
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast.error(error.message || 'Failed to sign up. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setLoading(true);
    try {
      // First test the connection
      const isConnected = await testConnection();
      if (!isConnected) {
        throw new Error('Cannot connect to the server. Please check your internet connection.');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password');
        } else if (error.message.includes('Email not confirmed')) {
          toast.info('Please check your email for the confirmation link');
          return;
        }
        throw error;
      }

      if (data.user) {
        navigate('/');
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast.error(error.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Heart className="w-10 h-10 text-white" fill="currentColor" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">HealthHub</h1>
          <p className="text-white/90">Your personal health management system</p>
        </div>

        <Card className="bg-white/5 backdrop-blur-sm border border-white/10 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white">Welcome Back</CardTitle>
            <CardDescription className="text-white/70">
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-white/5 p-1 h-12">
                <TabsTrigger 
                  value="signin" 
                  className="data-[state=active]:bg-white/10 data-[state=active]:text-white rounded-lg py-2 transition-colors"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </TabsTrigger>
                <TabsTrigger 
                  value="signup" 
                  className="data-[state=active]:bg-white/10 data-[state=active]:text-white rounded-lg py-2 transition-colors"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Sign Up
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4 mr-2" />
                        Sign In
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                    <p className="text-xs text-muted-foreground">
                      Password must be at least 6 characters
                    </p>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Button 
            variant="ghost" 
            className="text-white hover:text-white/80"
            onClick={() => navigate('/')}
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Auth;

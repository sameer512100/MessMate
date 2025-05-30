
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/ThemeToggle';

export const Auth: React.FC = () => {
  const { user, login, signup, isLoading } = useAuth();
  const { toast } = useToast();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    role: 'student' as UserRole
  });
  
  // Signup form state
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student' as UserRole,
    collegeId: ''
  });

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(loginData.email, loginData.password, loginData.role);
      toast({
        title: "Welcome back!",
        description: "You have been successfully logged in.",
      });
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupData.password !== signupData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }

    if (signupData.role === 'student' && !signupData.collegeId) {
      toast({
        title: "College ID required",
        description: "Please enter your college ID.",
        variant: "destructive",
      });
      return;
    }

    try {
      await signup(
        signupData.name,
        signupData.email,
        signupData.password,
        signupData.role,
        signupData.collegeId
      );
      toast({
        title: "Account created!",
        description: "Your account has been successfully created.",
      });
    } catch (error) {
      toast({
        title: "Signup failed",
        description: "Unable to create account. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <Card className="w-full max-w-md animate-fade-in">
        <CardHeader className="space-y-1 text-center">
  <div className="flex justify-center mb-4">
    <div >
      {/* Replace '/logo.png' with your logo file path (place it in /public) */}
      <img src="/favicon.png" alt="MessMate Logo" className="w-13.5 h-13.5 object-contain" />
    </div>
  </div>
  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-teal-500 to-teal-500 bg-clip-text text-transparent">
    MessMate
  </CardTitle>
  <CardDescription>
    Track your college mess nutrition
  </CardDescription>
</CardHeader>
        
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4 mt-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-role">I am a</Label>
                  <RadioGroup
                    value={loginData.role}
                    onValueChange={(value) => setLoginData(prev => ({ ...prev, role: value as UserRole }))}
                    className="flex space-x-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="student" id="student-login" />
                      <Label htmlFor="student-login">Student</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="admin" id="admin-login" />
                      <Label htmlFor="admin-login">Admin</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="Enter your email"
                    value={loginData.email}
                    onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={loginData.password}
                      onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    'Login'
                  )}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4 mt-6">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-role">I am a</Label>
                  <RadioGroup
                    value={signupData.role}
                    onValueChange={(value) => setSignupData(prev => ({ ...prev, role: value as UserRole }))}
                    className="flex space-x-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="student" id="student-signup" />
                      <Label htmlFor="student-signup">Student</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="admin" id="admin-signup" />
                      <Label htmlFor="admin-signup">Admin</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Enter your full name"
                    value={signupData.name}
                    onChange={(e) => setSignupData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email"
                    value={signupData.email}
                    onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                
                {signupData.role === 'student' && (
                  <div className="space-y-2">
                    <Label htmlFor="signup-college-id">College ID</Label>
                    <Input
                      id="signup-college-id"
                      type="text"
                      placeholder="Enter your college ID"
                      value={signupData.collegeId}
                      onChange={(e) => setSignupData(prev => ({ ...prev, collegeId: e.target.value }))}
                      required
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      value={signupData.password}
                      onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="signup-confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={signupData.confirmPassword}
                      onChange={(e) => setSignupData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
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
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

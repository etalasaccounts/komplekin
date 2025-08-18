"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { CheckCircle, AlertCircle } from "lucide-react";
import { createClient } from '@/lib/supabase/client';
import { toast } from "sonner";

export function AuthVerify() {
  const [message, setMessage] = useState("Verifying your email...");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [email, setEmail] = useState("");
  const [userFullName, setUserFullName] = useState("");
  const [verificationComplete, setVerificationComplete] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const preFilledEmail = searchParams.get('email');
  const isVerified = searchParams.get('verified');

  useEffect(() => {
    const messageParam = searchParams.get("message");
    
    // If there's a message but no token, it's likely a reset password confirmation
    if (messageParam && !token) {
      // Don't show error toast, just show the message and redirect
      setMessage(messageParam);
      setVerifying(false);
      
      // After 3 seconds, redirect to auth page
      setTimeout(() => {
        router.push('/auth');
      }, 3000);
      return;
    }
    
    if (!token) {
      toast.error("Invalid verification link", {
        description: "Missing token - please check your invitation email.",
        duration: 5000,
      });
      router.push('/auth');
      return;
    }

    const supabase = createClient();

    // Define function inside useEffect to avoid dependency issues
    const verifyEmailToken = async () => {
      try {
        console.log('Verifying email token:', token);
        setVerifying(true);
        
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: token!,
          type: 'email'
        });

        console.log('Email verification result:', { data, error });

        if (error) {
          console.error('Email verification error:', error);
          
          if (error.message.includes('expired') || error.message.includes('invalid')) {
            setMessage("This verification link has expired or is invalid. Please request a new invitation.");
            toast.error("Verification Link Expired", {
              description: "The verification link has expired or is invalid. Please request a new invitation.",
              duration: 5000,
            });
          } else {
            setMessage(error.message || "Failed to verify email. Please try again or request a new invitation.");
            toast.error("Verification Failed", {
              description: error.message || "Failed to verify email. Please try again or request a new invitation.",
              duration: 5000,
            });
          }
          setVerifying(false);
          return;
        }

        if (data.user && data.user.email) {
          console.log('Email verified successfully for:', data.user.email);
          
          // UPDATE PROFILE is_email_verified to TRUE
          console.log('Updating profile is_email_verified to true for user:', data.user.id);
          try {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .update({ 
                is_email_verified: true,
                updated_at: new Date().toISOString()
              })
              .eq('id', data.user.id)
              .select();

            if (profileError) {
              console.error('Profile update error:', profileError);
              console.error('Profile error details:', JSON.stringify(profileError, null, 2));
              
              // Don't fail the verification process, just log the error
              toast.error("Warning: Profile update failed", {
                description: "Email verification succeeded but profile update failed. Please contact support.",
                duration: 5000,
              });
            } else {
              console.log('Profile updated successfully:', profileData);
              console.log('Profile data after email verification:', JSON.stringify(profileData, null, 2));
              toast.success("Profile Updated!", {
                description: "Email verification status updated in your profile.",
                duration: 2000,
              });
            }

            // Also update user_permissions.is_email_verified = true (login checks this field)
            try {
              const { data: permData, error: permError } = await supabase
                .from('user_permissions')
                .update({ is_email_verified: true })
                .eq('user_id', data.user.id)
                .select();

              if (permError) {
                console.error('User permissions update error:', permError);
              } else {
                console.log('User permissions updated successfully:', permData);
              }
            } catch (permEx) {
              console.error('User permissions update exception:', permEx);
            }
          } catch (profileUpdateError) {
            console.error('Profile update exception:', profileUpdateError);
            // Don't fail the verification process
          }
          
          setEmail(data.user.email);
          setUserFullName(data.user.user_metadata?.full_name || "");
          setVerificationComplete(true);
          setVerifying(false);
          
          toast.success("Email verified successfully!", {
            description: "Now please enter your temporary password to complete the login process.",
            duration: 5000,
          });
          
          // Sign out after profile update
          await supabase.auth.signOut();
        } else {
          throw new Error("Email verification succeeded but no user data received");
        }
      } catch (error: unknown) {
        console.error('Email verification failed:', error);
        const errorMessage = error instanceof Error ? error.message : "Unable to verify email. Please request a new invitation.";
        setMessage(errorMessage);
        toast.error("Verification Failed", {
          description: errorMessage,
          duration: 5000,
        });
        setVerifying(false);
      }
    };

    // Call the function
    verifyEmailToken();
  }, [token, router, searchParams]);

  useEffect(() => {
    if (preFilledEmail) {
      setEmail(preFilledEmail);
    }
    if (isVerified === 'true') {
      toast.success("Email verified!", {
        description: "Please enter your temporary password to continue.",
        duration: 1000,
      });
    }
  }, [preFilledEmail, isVerified]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password) {
      toast.error("Missing Password", {
        description: "Please enter your temporary password",
        duration: 3000,
      });
      return;
    }

    if (!email) {
      toast.error("Email Required", {
        description: "Email verification required first. Please try the verification link again.",
        duration: 3000,
      });
      return;
    }

    setLoading(true);

    try {
      console.log('Attempting to sign in with email:', email);
      
      const supabase = createClient();
      
      // Sign in with the temporary password
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      console.log('Sign in result:', { signInData, signInError });

      if (signInError) {
        console.error('Sign-in error:', signInError);
        
        let errorMessage = "Login failed. Please check your temporary password.";
        
        if (signInError.message.includes('Invalid login credentials')) {
          errorMessage = "Invalid temporary password. Please check the password sent to your email.";
        } else if (signInError.message.includes('Email not found')) {
          errorMessage = "Email not found. Please verify your email first or request a new invitation.";
        }
        
        throw new Error(errorMessage);
      }

      if (signInData.user && signInData.session) {
        console.log('Login successful for user:', signInData.user.id);
        
        // DOUBLE CHECK: Update profile again after successful login (just to be sure)
        console.log('Double-checking profile is_email_verified status for user:', signInData.user.id);
        try {
          const { data: finalProfileData, error: finalUpdateError } = await supabase
            .from('profiles')
            .update({ 
              is_email_verified: true,
              updated_at: new Date().toISOString()
            })
            .eq('id', signInData.user.id)
            .select();

          if (finalUpdateError) {
            console.error('Final profile update error:', finalUpdateError);
            console.error('Final profile error details:', JSON.stringify(finalUpdateError, null, 2));
          } else {
            console.log('Final profile update successful:', finalProfileData);
            console.log('Final profile data after login:', JSON.stringify(finalProfileData, null, 2));
          }

          // Ensure user_permissions is also flagged as verified
          try {
            const { data: finalPermData, error: finalPermError } = await supabase
              .from('user_permissions')
              .update({ is_email_verified: true })
              .eq('user_id', signInData.user.id)
              .select();

            if (finalPermError) {
              console.error('Final user_permissions update error:', finalPermError);
            } else {
              console.log('Final user_permissions update successful:', finalPermData);
            }
          } catch (finalPermEx) {
            console.error('Final user_permissions update exception:', finalPermEx);
          }
        } catch (finalError) {
          console.error('Final profile update exception:', finalError);
        }
        
        toast.success("Login Successful!", {
          description: "Please set your new password to continue.",
          duration: 3000,
        });

        // Redirect to reset password page to force password change
        const userRole = signInData.user.user_metadata?.role || 'user';
        const resetUrl = userRole === 'admin' ? '/admin/auth/reset-password?force_reset=true' : '/user/auth/reset-password?force_reset=true';
        router.push(resetUrl);
      } else {
        throw new Error("Login succeeded but no session created");
      }
    } catch (error: unknown) {
      console.error('Login error:', error);
      const errorMessage = error instanceof Error ? error.message : "Login failed";
      
      toast.error("Login Failed", {
        description: errorMessage,
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Reset password confirmation state (message without token)
  const messageParam = searchParams.get("message");
  if (messageParam && !token && !verifying) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-xl">Email Terkirim!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">{messageParam}</p>
            <p className="text-sm text-muted-foreground">
              Anda akan dialihkan ke halaman login dalam beberapa detik...
            </p>
            <Button asChild className="w-full">
              <Link href="/user/auth">
                Kembali ke Login
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading/Verifying state
  if (verifying) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
            <CardTitle className="text-xl">Verifying Email...</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">{message}</p>
            <p className="text-sm text-muted-foreground">
              Please wait while we verify your invitation link.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Verification failed state
  if (!verificationComplete) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-xl">Verification Failed</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">{message}</p>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">
                This verification link may have expired or been used already.
              </p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Please contact your administrator to resend the invitation.
              </p>
              <Button variant="outline" asChild className="w-full">
                <Link href="/user/auth">
                  Go to Login
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Password input state (after successful email verification)
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-xl">Complete Your Login</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-muted-foreground">
              Email verified successfully for:
            </p>
            <p className="font-medium text-lg">{email}</p>
            {userFullName && (
              <p className="text-sm text-muted-foreground">({userFullName})</p>
            )}
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-center space-y-2">
              <p className="text-sm text-green-700 font-medium">
                ✅ Your email has been verified!
              </p>
              <p className="text-sm text-green-600">
                Please enter your <strong>temporary password</strong> from the invitation email to complete setup.
              </p>
            </div>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="email">Verified Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                disabled
                className="bg-gray-100"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="password">Temporary Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter temporary password from email"
                required
                autoFocus
              />
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "Logging in..." : "Complete Login"}
            </Button>
          </form>
          
          <div className="text-center">
            <Button variant="ghost" asChild>
              <Link href="/user/auth">
                Back to Login
              </Link>
            </Button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-700">
              <strong>Need help?</strong> If you don&apos;t see the email with your temporary password, 
              check your spam folder or contact your administrator for a new invitation.
            </p>
          </div>
          
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              The temporary password was sent to your email along with the invitation.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

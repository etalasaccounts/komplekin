'use client'

import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { createClient } from "@/utils/supabase/client";

export function GoogleSignupButton() {
  async function signInWithGoogle() {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });
    if (error) {
      console.error(error);
    } else {
      window.location.href = data.url;
    }
  }

  return (
    <Button variant="outline" className="w-full" type="button" onClick={signInWithGoogle}>
      <FcGoogle className="mr-2" />
      Sign up with Google
    </Button>
  );
}

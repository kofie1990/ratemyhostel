"use client";

import { createClient } from "@/utils/supabase/client";
import { useState } from "react";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";

export function SocialAuthButtons() {
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);

  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/feed";

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      toast.error("Failed to get Google credentials");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: credentialResponse.credential,
      });

      if (error) throw error;
      
      // Successfully signed in.
      window.location.href = next;
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in with Google");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className={`w-full flex justify-center ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => toast.error("Google login failed")}
          theme="filled_black"
          shape="rectangular"
          text="continue_with"
          width="320"
        />
      </div>

      {/* Apple login button scaffolded but disabled as per plan */}
      {/* <button
        disabled
        className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl glass opacity-50 cursor-not-allowed font-medium border-border"
        title="Apple login coming soon"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
          <path d="M16.36 10.74c-.03-2.58 2.1-3.83 2.19-3.88-1.2-1.75-3.06-1.98-3.75-2-1.58-.16-3.09.93-3.89.93-.81 0-2.05-.91-3.37-.89-1.7.02-3.26.99-4.14 2.52-1.78 3.08-.45 7.63 1.28 10.13.85 1.23 1.84 2.61 3.17 2.56 1.28-.05 1.77-.83 3.32-.83 1.54 0 2 .83 3.34.81 1.37-.03 2.22-1.27 3.06-2.5.97-1.42 1.37-2.8 1.39-2.87-.03-.01-2.68-1.03-2.7-3.98M14.4 5.3c.7-.85 1.18-2.04 1.05-3.21-1.01.04-2.26.68-2.99 1.54-.65.76-1.22 1.98-1.07 3.11 1.12.09 2.3-.59 3.01-1.44"/>
        </svg>
        Continue with Apple
      </button> */}
    </div>
  );
}

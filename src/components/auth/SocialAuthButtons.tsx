"use client";

import { createClient } from "@/utils/supabase/client";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export function SocialAuthButtons() {
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      <button
        onClick={handleGoogleLogin}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl glass hover:bg-foreground/5 transition-colors font-medium border-border disabled:opacity-50"
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <svg viewBox="0 0 24 24" className="w-5 h-5">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
        )}
        Continue with Google
      </button>

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

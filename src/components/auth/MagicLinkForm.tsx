"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Mail, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export function MagicLinkForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const supabase = createClient();

  const handleMagicLinkSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        toast.error(error.message);
      } else {
        setIsSent(true);
        toast.success("Magic link sent! Check your inbox.");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSent) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center space-y-4 bg-green-500/10 rounded-[2rem] border border-green-500/20">
        <CheckCircle2 className="w-12 h-12 text-green-500" />
        <div>
          <h3 className="text-xl font-bold text-foreground">Check your email</h3>
          <p className="text-foreground/70 text-sm mt-2 max-w-xs mx-auto">
            We've sent a magic link to <span className="font-bold">{email}</span>. Click the link to instantly sign in.
          </p>
        </div>
        <button 
          onClick={() => setIsSent(false)}
          className="text-sm font-bold text-green-600 hover:underline mt-2"
        >
          Try another email
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <form onSubmit={handleMagicLinkSignIn} className="flex flex-col gap-3 relative">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-foreground/40">
            <Mail className="w-5 h-5" />
          </div>
          <input
            type="email"
            placeholder="student@university.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            className="w-full bg-foreground/5 border border-foreground/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/30 transition-all font-medium placeholder:text-foreground/40 disabled:opacity-50"
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading || !email}
          className="w-full flex items-center justify-center gap-2 bg-foreground text-background font-bold py-4 rounded-2xl hover:bg-foreground/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Sending Magic Link...</span>
            </>
          ) : (
            <>
              <span>Continue with Email</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>
      
      <div className="mt-4 p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-center">
        <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
          🎓 <span className="font-bold">Pro Tip:</span> Use your school email (.edu) to automatically become a <span className="font-bold underline decoration-blue-500/30 underline-offset-2">Verified Student</span> upon sign in.
        </p>
      </div>
    </div>
  );
}

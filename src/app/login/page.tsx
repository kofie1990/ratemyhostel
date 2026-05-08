import { SocialAuthButtons } from "@/components/auth/SocialAuthButtons";

export default function LoginPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="w-full max-w-md glass-card rounded-[2rem] p-8 md:p-12 relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-bold mb-2">Welcome Back.</h1>
          <p className="text-foreground/60">
            Sign in to rate rooms, leave reviews, and save your favourite hostels.
          </p>
        </div>

        <SocialAuthButtons />
        
        <p className="mt-8 text-center text-xs text-foreground/40 max-w-xs mx-auto">
          By continuing, you agree to RateMyHostel's Terms of Service and Privacy Policy. We use strict OAuth to maintain a verified community.
        </p>
      </div>
    </div>
  );
}

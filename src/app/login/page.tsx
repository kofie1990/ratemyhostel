import { Suspense } from "react";
import { SocialAuthButtons } from "@/components/auth/SocialAuthButtons";
import { MagicLinkForm } from "@/components/auth/MagicLinkForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string; next?: string }>;
}) {
  const resolvedParams = await searchParams;
  const reason = resolvedParams.reason;

  let title = "Welcome Back.";
  let description = "Sign in to rate rooms, leave reviews, and save your favourite hostels.";

  if (reason === "request_hostel") {
    title = "Login Required";
    description = "You need to log in before you can request a new hostel. Don't worry, logging in is super fast and simple—no passwords required!";
  } else if (reason === "rate_room") {
    title = "Login Required";
    description = "You need to log in to upload a room. It's super fast and simple!";
  } else if (reason === "rate_hostel") {
    title = "Login Required";
    description = "You need to log in to leave a hostel review. It's super fast and simple!";
  } else if (reason === "profile") {
    title = "Login Required";
    description = "Sign in to view and edit your profile. It's super fast and simple!";
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="w-full max-w-md glass-card rounded-[2rem] p-8 md:p-12 relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2">{title}</h1>
          <p className="text-foreground/60">{description}</p>
        </div>

        <Suspense fallback={<div className="h-24" />}>
          <MagicLinkForm />
        </Suspense>
        
        <div className="flex items-center gap-4 my-6">
          <div className="h-px bg-foreground/10 flex-1"></div>
          <span className="text-xs font-medium text-foreground/40 uppercase tracking-widest">or continue with</span>
          <div className="h-px bg-foreground/10 flex-1"></div>
        </div>

        <Suspense fallback={<div className="h-16" />}>
          <SocialAuthButtons />
        </Suspense>
        
        <p className="mt-8 text-center text-xs text-foreground/40 max-w-xs mx-auto">
          By continuing, you agree to RateMyHostel's Terms of Service and Privacy Policy. We use strict OAuth to maintain a verified community.
        </p>
      </div>
    </div>
  );
}

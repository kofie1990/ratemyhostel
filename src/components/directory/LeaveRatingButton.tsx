
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReviewWizard } from "./ReviewWizard";
import { Pencil } from "lucide-react";

interface LeaveRatingButtonProps {
  hostelId: string;
  hostelName: string;
  isLoggedIn: boolean;
  hasReviewed: boolean;
  className?: string;
}

export function LeaveRatingButton({ 
  hostelId, 
  hostelName, 
  isLoggedIn, 
  hasReviewed, 
  className = ""
}: LeaveRatingButtonProps) {
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  const pathname = usePathname();

  let buttonContent = null;

  if (!isLoggedIn) {
    buttonContent = (
      <Link href={`/login?reason=rate_hostel&next=${encodeURIComponent(pathname)}`} className={className}>
        <Pencil className="w-4 h-4" />
        Log In to Rate
      </Link>
    );
  } else if (hasReviewed && !isWizardOpen) {
    buttonContent = (
      <div className={`px-6 py-3 rounded-full bg-green-500/10 text-green-600 font-bold border border-green-500/20 whitespace-nowrap flex items-center justify-center gap-2 ${className.includes("text-sm") ? "text-sm md:text-base" : ""}`}>
        Review Published
      </div>
    );
  } else {
    buttonContent = (
      <button
        onClick={() => setIsWizardOpen(true)}
        className={className}
      >
        <Pencil className="w-4 h-4" />
        Leave Rating
      </button>
    );
  }

  return (
    <>
      {buttonContent}
      
      {isLoggedIn && (
        <ReviewWizard
          hostelId={hostelId}
          hostelName={hostelName}
          isOpen={isWizardOpen}
          onClose={() => setIsWizardOpen(false)}
        />
      )}
    </>
  );
}


"use client";

import { useState } from "react";
import { Star, BadgeCheck, User } from "lucide-react";
import Link from "next/link";
import { ReviewWizard } from "./ReviewWizard";

interface ReviewSectionProps {
  hostelId: string;
  hostelName: string;
  isLoggedIn: boolean;
  hasReviewed: boolean;
  reviews: any[];
}

export function ReviewSection({ hostelId, hostelName, isLoggedIn, hasReviewed, reviews }: ReviewSectionProps) {
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  return (
    <div className="flex flex-col gap-12 w-full max-w-3xl mx-auto">
      <ReviewWizard 
        hostelId={hostelId} 
        hostelName={hostelName} 
        isOpen={isWizardOpen} 
        onClose={() => setIsWizardOpen(false)} 
      />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-border pb-8">
        <div>
          <h3 className="text-4xl font-serif font-bold mb-2">Resident Reviews</h3>
          <p className="text-foreground/60 text-lg">Read verified experiences from actual students.</p>
        </div>
        
        {!isLoggedIn ? (
          <Link href="/login" className="px-8 py-4 rounded-full bg-foreground text-background font-bold hover:scale-105 active:scale-95 transition-all shadow-xl whitespace-nowrap">
            Log In to Review
          </Link>
        ) : hasReviewed ? (
          <div className="px-6 py-3 rounded-full bg-green-500/10 text-green-600 font-bold border border-green-500/20 whitespace-nowrap">
            Review Published
          </div>
        ) : (
          <button 
            onClick={() => setIsWizardOpen(true)}
            className="px-8 py-4 rounded-full bg-foreground text-background font-bold hover:scale-105 active:scale-95 transition-all shadow-xl whitespace-nowrap"
          >
            Rate Your Experience
          </button>
        )}
      </div>

      <div className="flex flex-col gap-6">
        {reviews.length === 0 ? (
          <div className="text-center py-24 glass-card rounded-[3rem] border border-border border-dashed">
            <h3 className="text-2xl font-serif font-bold mb-2">No reviews yet.</h3>
            <p className="text-foreground/60">Be the first to share your experience!</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {reviews.map((review) => {
              const isVerified = review.profiles?.is_verified_student === true;
              return (
                <div key={review.id} className="glass-card rounded-[2rem] p-8 border border-border transition-all hover:shadow-xl">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      {/* Anonymous avatar */}
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-inner ${isVerified ? 'bg-blue-500/10 text-blue-500' : 'bg-foreground/10 text-foreground/60'}`}>
                        {isVerified ? <BadgeCheck className="w-6 h-6" /> : <User className="w-6 h-6" />}
                      </div>
                      <div>
                        {/* Badge instead of name */}
                        {isVerified ? (
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-lg text-blue-500">Verified Student</span>
                            <BadgeCheck className="w-5 h-5 text-blue-500 fill-blue-500/20" />
                          </div>
                        ) : (
                          <p className="font-bold text-lg text-foreground/70">User</p>
                        )}
                        <div className="flex items-center gap-2 text-sm text-foreground/60 mt-1 font-medium">
                          {review.room_capacity && <span className="bg-foreground/5 px-3 py-1 rounded-full">{review.room_capacity} in a room</span>}
                          {review.floor && <span>• {review.floor}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="glass px-4 py-2 rounded-2xl flex items-center gap-2">
                      <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                      <span className="font-bold">{review.rating} / 5</span>
                    </div>
                  </div>
                  {review.comment && (
                    <p className="font-serif text-xl md:text-2xl text-foreground/90 leading-relaxed italic border-l-4 border-foreground/20 pl-6 my-6">
                      &ldquo;{review.comment}&rdquo;
                    </p>
                  )}
                  <div className="flex justify-between items-center text-sm text-foreground/40 mt-6 pt-6 border-t border-border/50">
                    <span className={`font-medium ${isVerified ? 'text-blue-500/60' : ''}`}>
                      {isVerified ? '✓ Verified Student Email' : 'Anonymous Resident'}
                    </span>
                    <span>{new Date(review.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

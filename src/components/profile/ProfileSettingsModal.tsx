"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, LogOut, Save, Loader2, User, GraduationCap, CheckCircle, Mail } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { sendStudentVerificationCode, verifyStudentCode } from "@/app/actions/verify-student";

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: {
    id: string;
    display_name: string | null;
    username?: string | null;
    is_public?: boolean;
    avatar_url?: string | null;
    is_verified_student?: boolean;
    student_email?: string | null;
  };
}

export function ProfileSettingsModal({ isOpen, onClose, currentProfile }: ProfileSettingsModalProps) {
  const [displayName, setDisplayName] = useState(currentProfile.display_name || "");
  const [username, setUsername] = useState(currentProfile.username || "");
  const [isPublic, setIsPublic] = useState(currentProfile.is_public || false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentProfile.avatar_url || null);
  
  const [studentEmail, setStudentEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [codeSent, setCodeSent] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Avatar must be less than 2MB");
        return;
      }
      setAvatarFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPublic && !username.trim()) {
      toast.error("A username is required for public profiles.");
      return;
    }
    if (username.trim() && !/^[a-zA-Z0-9_]+$/.test(username.trim())) {
      toast.error("Username can only contain letters, numbers, and underscores.");
      return;
    }

    setIsSaving(true);
    let avatarUrl = currentProfile.avatar_url;

    try {
      // 1. Upload Avatar if changed
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${currentProfile.id}-${Date.now()}.${fileExt}`;
        const filePath = `${currentProfile.id}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile, { upsert: true });
          
        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);
          
        avatarUrl = publicUrlData.publicUrl;
      }

      // 2. Update Profile
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ 
          display_name: displayName.trim(),
          username: username.trim() || null,
          is_public: isPublic,
          ...(avatarFile ? { avatar_url: avatarUrl } : {})
        })
        .eq("id", currentProfile.id);

      if (updateError) {
        if (updateError.code === '23505') { // Unique violation
          throw new Error("This username is already taken.");
        }
        throw updateError;
      }

      toast.success("Profile updated successfully!");
      router.refresh();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await supabase.auth.signOut();
    setIsLoggingOut(false);
    toast.success("Logged out successfully");
    router.push("/login");
    router.refresh();
  };

  const handleSendCode = async () => {
    if (!studentEmail || !studentEmail.includes(".edu")) {
      toast.error("Please enter a valid .edu student email address.");
      return;
    }
    
    setIsSendingCode(true);
    try {
      const res = await sendStudentVerificationCode(studentEmail);
      if (res.success) {
        setCodeSent(true);
        toast.success("Verification code sent! Check your inbox.");
      } else {
        toast.error(res.error || "Failed to send code.");
      }
    } catch (err: any) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error("Please enter a valid 6-digit code.");
      return;
    }
    
    setIsVerifyingCode(true);
    try {
      const res = await verifyStudentCode(studentEmail, verificationCode);
      if (res.success) {
        toast.success("Student email verified successfully!");
        router.refresh();
        onClose();
      } else {
        toast.error(res.error || "Failed to verify code.");
      }
    } catch (err: any) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsVerifyingCode(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md z-[101] glass-card rounded-[2rem] p-6 md:p-8 shadow-2xl border border-foreground/10"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold font-serif">Settings</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-foreground/5 text-foreground/60 hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col gap-6">
              {/* Avatar Upload */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-border group cursor-pointer">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-foreground/5 flex items-center justify-center text-foreground/40 font-bold text-2xl">
                      {displayName.charAt(0) || "U"}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-xs font-bold">Upload</span>
                  </div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
                <p className="text-xs text-foreground/50">Tap to change avatar (Max 2MB)</p>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-foreground/80 pl-1">Display Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-foreground/40">
                      <User className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Enter your display name"
                      className="w-full bg-foreground/5 border border-foreground/10 rounded-2xl py-3 pl-12 pr-4 outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/30 transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-foreground/80 pl-1">Username (Optional)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-foreground/40 font-bold">
                      @
                    </div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="your_username"
                      className="w-full bg-foreground/5 border border-foreground/10 rounded-2xl py-3 pl-10 pr-4 outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/30 transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between bg-foreground/5 p-4 rounded-2xl border border-foreground/10">
                  <div>
                    <h3 className="text-sm font-bold">Public Profile</h3>
                    <p className="text-xs text-foreground/60 mt-0.5 max-w-[200px]">
                      Allow others to see your profile and the rooms you've uploaded. Requires a username.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-foreground/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-foreground"></div>
                  </label>
                </div>

                {/* Student Verification Section */}
                <div className="flex flex-col gap-3 p-4 bg-foreground/5 rounded-2xl border border-foreground/10">
                  <div className="flex items-center gap-2 mb-1">
                    <GraduationCap className="w-5 h-5 text-blue-500" />
                    <h3 className="text-sm font-bold">Student Verification</h3>
                  </div>
                  
                  {currentProfile.is_verified_student ? (
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-500 bg-green-500/10 p-3 rounded-xl border border-green-500/20">
                      <CheckCircle className="w-5 h-5" />
                      <div>
                        <p className="text-sm font-bold">Verified Student</p>
                        {currentProfile.student_email && (
                          <p className="text-xs opacity-80">{currentProfile.student_email}</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <p className="text-xs text-foreground/60">
                        Verify your .edu email to get the Verified Student badge on your profile and reviews.
                      </p>
                      
                      {!codeSent ? (
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-foreground/40">
                              <Mail className="w-4 h-4" />
                            </div>
                            <input
                              type="email"
                              value={studentEmail}
                              onChange={(e) => setStudentEmail(e.target.value)}
                              placeholder="student@university.edu"
                              className="w-full bg-background border border-foreground/10 rounded-xl py-2 pl-9 pr-3 outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/30 transition-all text-sm font-medium"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={handleSendCode}
                            disabled={isSendingCode || !studentEmail}
                            className="bg-foreground text-background px-4 py-2 rounded-xl text-sm font-bold hover:bg-foreground/90 transition-all disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
                          >
                            {isSendingCode && <Loader2 className="w-3 h-3 animate-spin" />}
                            Send Code
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-foreground/60">Code sent to <span className="font-bold text-foreground">{studentEmail}</span></span>
                            <button type="button" onClick={() => setCodeSent(false)} className="text-blue-500 hover:underline">Change</button>
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              maxLength={6}
                              value={verificationCode}
                              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                              placeholder="123456"
                              className="w-full bg-background border border-foreground/10 rounded-xl py-2 px-3 outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/30 transition-all text-center tracking-widest font-bold font-mono"
                            />
                            <button
                              type="button"
                              onClick={handleVerifyCode}
                              disabled={isVerifyingCode || verificationCode.length !== 6}
                              className="bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-600 transition-all disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
                            >
                              {isVerifyingCode && <Loader2 className="w-3 h-3 animate-spin" />}
                              Verify
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-4 border-t border-foreground/10">
                <button
                  type="submit"
                  disabled={isSaving || (displayName.trim() === currentProfile.display_name && username.trim() === (currentProfile.username || "") && isPublic === (currentProfile.is_public || false) && !avatarFile)}
                  className="w-full flex items-center justify-center gap-2 bg-foreground text-background font-bold py-3.5 rounded-2xl hover:bg-foreground/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full flex items-center justify-center gap-2 bg-red-500/10 text-red-500 font-bold py-3.5 rounded-2xl hover:bg-red-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoggingOut ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Signing Out...</span>
                    </>
                  ) : (
                    <>
                      <LogOut className="w-5 h-5" />
                      <span>Sign Out</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

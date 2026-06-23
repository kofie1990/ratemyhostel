"use server";

import { createClient } from "@/utils/supabase/server";
import { Resend } from "resend";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendStudentVerificationCode(email: string) {
  try {
    const supabase = await createClient();
    
    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "You must be logged in to verify an email." };
    }

    // Validate email format
    if (!email || !email.includes(".edu")) {
      return { success: false, error: "Please enter a valid .edu student email address." };
    }

    // Generate a 6-digit code
    const code = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

    // We use the service role key to insert into student_verifications, or we can use the regular client if RLS permits.
    // Let's use the regular client, but RLS only allows them to select/delete. Wait, we need to allow insert if we use regular client.
    // Since we created the policy only for SELECT and DELETE, we should use the admin client.
    const { createClient: createAdminClient } = await import("@supabase/supabase-js");
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Remove any existing pending codes for this user
    await supabaseAdmin
      .from("student_verifications")
      .delete()
      .eq("user_id", user.id);

    // Insert new code
    const { error: insertError } = await supabaseAdmin
      .from("student_verifications")
      .insert({
        user_id: user.id,
        email,
        code,
        expires_at: expiresAt.toISOString(),
      });

    if (insertError) {
      console.error("DB Insert Error:", insertError);
      return { success: false, error: "Failed to create verification code." };
    }

    // Send the email via Resend
    const { error: resendError } = await resend.emails.send({
      from: "RateMyHostel <hello@mail.ratemyhostel.co>", // Using the user's Resend domain
      to: email,
      subject: "Verify your student email",
      html: `
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto;">
          <h2>Student Verification</h2>
          <p>Here is your 6-digit verification code to verify your student status on RateMyHostel:</p>
          <div style="background-color: #f4f4f5; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <strong style="font-size: 24px; letter-spacing: 4px;">${code}</strong>
          </div>
          <p>This code will expire in 15 minutes.</p>
          <p>If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    });

    if (resendError) {
      console.error("Resend Error:", resendError);
      return { success: false, error: "Failed to send verification email." };
    }

    return { success: true };
  } catch (error: any) {
    console.error("sendStudentVerificationCode error:", error);
    return { success: false, error: "An unexpected error occurred." };
  }
}

export async function verifyStudentCode(email: string, code: string) {
  try {
    const supabase = await createClient();
    
    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "You must be logged in to verify an email." };
    }

    const { createClient: createAdminClient } = await import("@supabase/supabase-js");
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch the code
    const { data: verification, error: fetchError } = await supabaseAdmin
      .from("student_verifications")
      .select("*")
      .eq("user_id", user.id)
      .eq("email", email)
      .single();

    if (fetchError || !verification) {
      return { success: false, error: "No pending verification found for this email." };
    }

    // Check expiration
    if (new Date(verification.expires_at) < new Date()) {
      await supabaseAdmin.from("student_verifications").delete().eq("id", verification.id);
      return { success: false, error: "Verification code has expired. Please request a new one." };
    }

    // Check code match
    if (verification.code !== code) {
      return { success: false, error: "Invalid verification code." };
    }

    // Code is valid! Update the user's profile
    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({
        is_verified_student: true,
        student_email: email,
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Profile update error:", updateError);
      return { success: false, error: "Failed to update profile." };
    }

    // Cleanup the used code
    await supabaseAdmin.from("student_verifications").delete().eq("id", verification.id);

    return { success: true };
  } catch (error: any) {
    console.error("verifyStudentCode error:", error);
    return { success: false, error: "An unexpected error occurred." };
  }
}

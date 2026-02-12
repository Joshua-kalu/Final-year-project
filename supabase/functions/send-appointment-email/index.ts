import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  type: "confirmation" | "cancellation" | "reminder";
  appointmentId: string;
}

interface EmailData {
  patientEmail: string;
  patientName: string;
  doctorName: string;
  department: string;
  dateTime: string;
}

const getEmailContent = (type: EmailRequest["type"], data: EmailData) => {
  const formattedDate = new Date(data.dateTime).toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  switch (type) {
    case "confirmation":
      return {
        subject: "Appointment Confirmed - MediBook",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #0ea5e9;">Appointment Confirmed!</h1>
            <p>Dear ${data.patientName},</p>
            <p>Your appointment has been successfully scheduled.</p>
            <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Doctor:</strong> ${data.doctorName}</p>
              <p><strong>Department:</strong> ${data.department}</p>
              <p><strong>Date & Time:</strong> ${formattedDate}</p>
            </div>
            <p>Please arrive 15 minutes before your scheduled time.</p>
            <p>Best regards,<br>MediBook Team</p>
          </div>
        `,
      };
    case "cancellation":
      return {
        subject: "Appointment Cancelled - MediBook",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #ef4444;">Appointment Cancelled</h1>
            <p>Dear ${data.patientName},</p>
            <p>Your appointment has been cancelled as requested.</p>
            <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Doctor:</strong> ${data.doctorName}</p>
              <p><strong>Department:</strong> ${data.department}</p>
              <p><strong>Original Date & Time:</strong> ${formattedDate}</p>
            </div>
            <p>If you'd like to reschedule, please visit our booking page.</p>
            <p>Best regards,<br>MediBook Team</p>
          </div>
        `,
      };
    case "reminder":
      return {
        subject: "Appointment Reminder - MediBook",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #0ea5e9;">Appointment Reminder</h1>
            <p>Dear ${data.patientName},</p>
            <p>This is a friendly reminder about your upcoming appointment.</p>
            <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Doctor:</strong> ${data.doctorName}</p>
              <p><strong>Department:</strong> ${data.department}</p>
              <p><strong>Date & Time:</strong> ${formattedDate}</p>
            </div>
            <p>Please arrive 15 minutes before your scheduled time.</p>
            <p>Best regards,<br>MediBook Team</p>
          </div>
        `,
      };
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify the JWT and get user
    const { data: userData, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !userData.user) {
      console.error("Auth error:", authError?.message);
      return new Response(
        JSON.stringify({ success: false, error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = userData.user.id;
    const userEmail = userData.user.email;

    // Parse request - only accept type and appointmentId
    const request: EmailRequest = await req.json();
    
    // Validate request type
    if (!["confirmation", "cancellation", "reminder"].includes(request.type)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid email type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!request.appointmentId) {
      return new Response(
        JSON.stringify({ success: false, error: "Appointment ID required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Email request received:", { type: request.type, appointmentId: request.appointmentId });

    // Fetch appointment and verify ownership
    const { data: appointment, error: appointmentError } = await supabaseAdmin
      .from("appointments")
      .select("patient_id, doctor_id, department, date_time")
      .eq("id", request.appointmentId)
      .single();

    if (appointmentError || !appointment) {
      console.error("Appointment not found:", request.appointmentId);
      return new Response(
        JSON.stringify({ success: false, error: "Appointment not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the authenticated user owns this appointment
    if (userId !== appointment.patient_id) {
      console.error("Unauthorized access attempt:", { userId, patientId: appointment.patient_id });
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized - not your appointment" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch patient profile for name
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("full_name")
      .eq("user_id", userId)
      .single();

    const patientName = profile?.full_name || userEmail || "Patient";
    const patientEmail = userEmail || "";

    // Fetch doctor details
    const { data: doctor } = await supabaseAdmin
      .from("doctors")
      .select("full_name")
      .eq("id", appointment.doctor_id)
      .single();

    const doctorName = doctor?.full_name || "Doctor";

    // Build email data from server-side sources
    const emailData: EmailData = {
      patientEmail,
      patientName,
      doctorName,
      department: appointment.department,
      dateTime: appointment.date_time,
    };

    const emailContent = getEmailContent(request.type, emailData);
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      // Log minimal info for development (no PII)
      console.log("Email notification skipped (no API key configured)");
      console.log("Type:", request.type);
      console.log("Appointment ID:", request.appointmentId);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Email logged (no API key configured)",
          logged: true 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send actual email via Resend
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "MediBook <onboarding@resend.dev>",
        to: [patientEmail],
        subject: emailContent.subject,
        html: emailContent.html,
      }),
    });

    const resendData = await resendResponse.json();
    
    if (!resendResponse.ok) {
      console.error("Resend API error:", { status: resendResponse.status });
      throw new Error(resendData.message || "Failed to send email");
    }

    console.log("Email sent successfully for appointment:", request.appointmentId);

    return new Response(
      JSON.stringify({ success: true, message: "Email sent", id: resendData.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Email function error:", error.message);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

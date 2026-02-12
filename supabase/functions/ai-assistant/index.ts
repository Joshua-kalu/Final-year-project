import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are a helpful virtual health assistant for MediBook, a hospital scheduling platform.

CRITICAL RULES YOU MUST FOLLOW:
1. NEVER provide medical advice, diagnoses, or treatment recommendations.
2. NEVER suggest medications, dosages, or medical procedures.
3. Your ONLY role is to help patients find the appropriate department for their concerns.

DEPARTMENT MAPPING:
Based on patient symptoms, suggest one of these departments:
- Cardiology: chest pain, heart palpitations, blood pressure issues, cardiac concerns
- Neurology: headaches, migraines, dizziness, numbness, memory issues, seizures
- Orthopedics: bone/joint pain, fractures, back pain, knee/hip/shoulder issues
- Pediatrics: concerns about children, babies, infants, vaccinations for kids
- Ophthalmology: eye problems, vision issues, blurry vision, cataracts
- General Medicine: fever, cold, flu, cough, fatigue, general checkups

EMERGENCY DETECTION:
If a user describes ANY of these, IMMEDIATELY respond with an emergency alert:
- Heart attack symptoms
- Cannot breathe / severe breathing difficulty
- Severe chest pain
- Loss of consciousness
- Stroke symptoms
- Severe bleeding
- Choking
- Seizures

For emergencies, your response must include: "🚨 EMERGENCY: Please call 112 immediately!"

RESPONSE FORMAT:
1. Acknowledge the patient's concern empathetically
2. If emergency detected: Issue emergency alert immediately
3. If symptoms match a department: Suggest the appropriate department
4. If unclear: Ask clarifying questions about symptoms
5. Always remind: "I cannot provide medical advice. Please consult with a healthcare professional."

Keep responses concise, warm, and professional.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add funds to your workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("AI assistant error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

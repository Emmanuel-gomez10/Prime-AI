import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const APPROVED_MODELS = new Set(["gpt-4o", "gpt-4o-mini", "gpt-4-turbo"]);
const MAX_INPUT_CHARACTERS = 20000;
const MAX_OUTPUT_TOKENS = 2500;
const RATE_LIMIT_PER_MINUTE = 10;
const MAX_HISTORY_MESSAGES = 30;
const MAX_ATTACHMENTS_COUNT = 5;

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  let reservationId: string | null = null;
  let supabaseAdmin: any = null;
  let targetModel = "gpt-4o-mini";

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing Authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY") || "";

    // 0. Strict Service Role Key Check (Safely fail if unconfigured)
    if (!supabaseServiceKey) {
      console.error("[CRITICAL GATEWAY CONFIG ERROR]: SUPABASE_SERVICE_ROLE_KEY is not configured.");
      return new Response(
        JSON.stringify({ error: "AI Gateway server configuration error." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!openaiApiKey) {
      console.error("[CRITICAL GATEWAY CONFIG ERROR]: OPENAI_API_KEY is not configured.");
      return new Response(
        JSON.stringify({ error: "AI provider service is currently unconfigured." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Authenticate user identity from Supabase JWT (never trust client user_id payload)
    const token = authHeader.replace("Bearer ", "");
    const supabaseAuthClient = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { user }, error: authErr } = await supabaseAuthClient.auth.getUser(token);

    if (authErr || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Invalid or expired authentication session." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = user.id;
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // 2. Parse request payload
    const body = await req.json();
    const { featureName, systemInstruction, userPrompt, attachments, history, requestedModel } = body;

    // 3. User Account Status Check (Suspended verification)
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("status, is_admin, role")
      .eq("id", userId)
      .maybeSingle();

    if (profile?.status === "suspended") {
      return new Response(
        JSON.stringify({ error: "Your student account is suspended. Please contact support." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Emergency AI Provider Shutdown Check (ai_provider_enabled)
    const { data: settingsData } = await supabaseAdmin
      .from("system_settings")
      .select("key, value");

    const settingsMap: Record<string, any> = {};
    if (settingsData) {
      for (const s of settingsData) {
        settingsMap[s.key] = s.value;
      }
    }

    if (settingsMap.ai_provider_enabled === false || settingsMap.ai_provider_enabled === "false") {
      return new Response(
        JSON.stringify({ error: "Prime AI is currently undergoing safety maintenance. Non-AI features remain fully functional." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 5. Complete Input Size Protection (System instruction + history + prompt + attachments + base64)
    if (attachments && Array.isArray(attachments) && attachments.length > MAX_ATTACHMENTS_COUNT) {
      return new Response(
        JSON.stringify({ error: `Exceeded maximum attachment limit (${MAX_ATTACHMENTS_COUNT} files).` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (history && Array.isArray(history) && history.length > MAX_HISTORY_MESSAGES) {
      return new Response(
        JSON.stringify({ error: `Conversation history exceeds maximum message limit (${MAX_HISTORY_MESSAGES} messages).` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let totalInputLength = (systemInstruction || "").length + (userPrompt || "").length;

    if (history && Array.isArray(history)) {
      for (const msg of history) {
        totalInputLength += (msg.content || "").length;
      }
    }

    if (attachments && Array.isArray(attachments)) {
      for (const att of attachments) {
        totalInputLength += (att.name || "").length;
        totalInputLength += (att.content || "").length;
        if (att.base64) {
          totalInputLength += att.base64.length;
        }
      }
    }

    if (totalInputLength > MAX_INPUT_CHARACTERS) {
      return new Response(
        JSON.stringify({ error: `Request size exceeds maximum limit of ${MAX_INPUT_CHARACTERS} characters.` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 6. Plan Resolution & ATOMIC USAGE RESERVATION
    const normFeature = (featureName || "ai_tutor").toLowerCase().trim().replace(/[\s-]+/g, "_");
    const { data: subData } = await supabaseAdmin
      .from("subscriptions")
      .select("plan")
      .eq("user_id", userId)
      .maybeSingle();

    const plan = subData?.plan === "premium" ? "premium" : "free";
    const planLimit = normFeature === "ai_tutor" ? (plan === "premium" ? 300 : 30) : (plan === "premium" ? 50 : 3);

    // Execute atomic reservation RPC (locks & reserves slot before OpenAI call)
    const { data: rpcRes, error: rpcErr } = await supabaseAdmin.rpc("check_and_increment_ai_usage", {
      p_user_id: userId,
      p_feature_name: normFeature,
      p_plan_limit: planLimit,
      p_rate_limit_per_min: RATE_LIMIT_PER_MINUTE,
    });

    if (rpcErr || !rpcRes) {
      console.error("Atomic usage RPC error:", rpcErr);
      return new Response(
        JSON.stringify({ error: "Failed to authorize usage limits. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!rpcRes.allowed) {
      return new Response(
        JSON.stringify({ error: rpcRes.message || "Usage limit or rate limit exceeded." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    reservationId = rpcRes.reservation_id || null;

    // 7. Model Allowlist Validation
    targetModel = requestedModel || settingsMap.primary_model || "gpt-4o-mini";
    if (!APPROVED_MODELS.has(targetModel)) {
      targetModel = "gpt-4o-mini";
    }

    // 8. Build OpenAI Messages
    const messages: any[] = [];
    if (systemInstruction) {
      messages.push({ role: "system", content: systemInstruction });
    }
    if (history && Array.isArray(history)) {
      for (const h of history) {
        messages.push({ role: h.role === "model" ? "assistant" : "user", content: h.content });
      }
    }

    const userParts: any[] = [];
    if (attachments && Array.isArray(attachments)) {
      for (const att of attachments) {
        if (att.type === "image" && att.base64) {
          userParts.push({ type: "image_url", image_url: { url: att.base64 } });
        } else {
          userParts.push({ type: "text", text: `[ATTACHED DOCUMENT (${att.name})]:\n${att.content}\n--- END ATTACHMENT ---` });
        }
      }
    }
    if (userPrompt) {
      userParts.push({ type: "text", text: userPrompt });
    }
    if (userParts.length > 0) {
      messages.push({ role: "user", content: userParts });
    }

    // 9. Send request to OpenAI API
    const openAIResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: targetModel,
        messages,
        max_tokens: MAX_OUTPUT_TOKENS,
        temperature: 0.7,
        stream: true,
      }),
    });

    if (!openAIResponse.ok) {
      const errText = await openAIResponse.text();
      console.error("OpenAI API error:", errText);

      // Reconcile failed reservation
      if (reservationId && supabaseAdmin) {
        await supabaseAdmin.rpc("finalize_ai_usage_reservation", {
          p_reservation_id: reservationId,
          p_model_used: targetModel,
          p_success: false,
        });
      }

      return new Response(
        JSON.stringify({ error: "AI provider service error. Please try again." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 10. Wrap response stream with finalization listener
    const rawBody = openAIResponse.body;
    if (!rawBody) {
      throw new Error("No response body received from provider.");
    }

    const transformStream = new TransformStream({
      async transform(chunk, controller) {
        controller.enqueue(chunk);
      },
      async flush() {
        // Stream completed successfully - finalize reservation as completed
        if (reservationId && supabaseAdmin) {
          await supabaseAdmin.rpc("finalize_ai_usage_reservation", {
            p_reservation_id: reservationId,
            p_model_used: targetModel,
            p_success: true,
          });
        }
      }
    });

    return new Response(rawBody.pipeThrough(transformStream), {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });

  } catch (err: any) {
    console.error("Edge function execution error:", err);

    // Reconcile failed reservation if caught in exception handler
    if (reservationId && supabaseAdmin) {
      try {
        await supabaseAdmin.rpc("finalize_ai_usage_reservation", {
          p_reservation_id: reservationId,
          p_model_used: targetModel,
          p_success: false,
        });
      } catch (fErr) {
        console.error("Failed to finalize usage reservation on error:", fErr);
      }
    }

    return new Response(
      JSON.stringify({ error: "AI service temporarily unavailable. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

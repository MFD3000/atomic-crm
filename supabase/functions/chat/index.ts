import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import type { MessageParam } from "npm:@anthropic-ai/sdk@0.52.0/resources/messages.mjs";
import { supabaseAdmin } from "../_shared/supabaseAdmin.ts";
import { corsHeaders, createErrorResponse } from "../_shared/utils.ts";
import { runAgent } from "./agent.ts";
import type { AgentContext, ExecutedAction } from "./tools/types.ts";

interface ChatRequest {
  message: string;
  conversationHistory?: MessageParam[];
  boardId?: number;
}

interface ChatResponse {
  message: string;
  executedActions: ExecutedAction[];
  conversationHistory: MessageParam[];
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // Only allow POST
  if (req.method !== "POST") {
    return createErrorResponse(405, "Method Not Allowed");
  }

  // Authenticate user
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return createErrorResponse(401, "Missing Authorization header");
  }

  const localClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: authHeader } } },
  );

  const { data: userData } = await localClient.auth.getUser();
  if (!userData?.user) {
    return createErrorResponse(401, "Unauthorized");
  }

  // Get sales record for current user
  const { data: salesRecord } = await supabaseAdmin
    .from("sales")
    .select("id")
    .eq("user_id", userData.user.id)
    .single();

  if (!salesRecord) {
    return createErrorResponse(401, "User not found in sales table");
  }

  // Parse request body
  let body: ChatRequest;
  try {
    body = await req.json();
  } catch {
    return createErrorResponse(400, "Invalid JSON body");
  }

  if (!body.message || typeof body.message !== "string") {
    return createErrorResponse(400, "Message is required");
  }

  // Initialize agent context
  const ctx: AgentContext = {
    salesId: salesRecord.id,
    boardId: body.boardId,
    createdCompanies: new Map(),
    createdContacts: new Map(),
  };

  // Run the agent
  try {
    const result = await runAgent(
      body.message,
      body.conversationHistory || [],
      ctx,
    );

    // Build updated conversation history
    const updatedHistory: MessageParam[] = [
      ...(body.conversationHistory || []),
      { role: "user", content: body.message },
      { role: "assistant", content: result.message },
    ];

    const response: ChatResponse = {
      message: result.message,
      executedActions: result.executedActions,
      conversationHistory: updatedHistory,
    };

    return new Response(JSON.stringify(response), {
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error("Agent error:", error);
    return createErrorResponse(
      500,
      error instanceof Error ? error.message : "Internal Server Error",
    );
  }
});

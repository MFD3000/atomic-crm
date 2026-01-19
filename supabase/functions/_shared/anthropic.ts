import Anthropic from "npm:@anthropic-ai/sdk@0.52.0";

// Create Anthropic client for use in edge functions
export const anthropic = new Anthropic({
  apiKey: Deno.env.get("ANTHROPIC_API_KEY") ?? "",
});

export const MODEL_ID = "claude-3-5-haiku-20241022";

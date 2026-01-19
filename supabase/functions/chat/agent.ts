import type {
  MessageParam,
  ContentBlock,
  ToolUseBlock,
  TextBlock,
} from "npm:@anthropic-ai/sdk@0.52.0/resources/messages.mjs";
import { anthropic, MODEL_ID } from "../_shared/anthropic.ts";
import {
  AGENT_TOOLS,
  SYSTEM_PROMPT,
  searchOrCreateCompany,
  searchOrCreateContact,
  createDeal,
  createTask,
  createNote,
  type AgentContext,
  type ExecutedAction,
  type SearchOrCreateCompanyInput,
  type SearchOrCreateContactInput,
  type CreateDealInput,
  type CreateTaskInput,
  type CreateNoteInput,
} from "./tools/index.ts";

const MAX_ITERATIONS = 10;

interface AgentResult {
  message: string;
  executedActions: ExecutedAction[];
}

// Execute a single tool call
async function executeTool(
  toolName: string,
  toolInput: Record<string, unknown>,
  ctx: AgentContext,
): Promise<{ result: unknown; action: ExecutedAction }> {
  const actionId = crypto.randomUUID();
  let action: ExecutedAction;

  try {
    switch (toolName) {
      case "search_or_create_company": {
        const result = await searchOrCreateCompany(
          toolInput as SearchOrCreateCompanyInput,
          ctx,
        );
        action = {
          id: actionId,
          type: result.created ? "create_company" : "update_company",
          description: result.created
            ? `Created company "${result.name}"`
            : `Found existing company "${result.name}"`,
          success: true,
          result: {
            recordId: result.id,
            recordType: "company",
            name: result.name,
          },
        };
        return { result, action };
      }

      case "search_or_create_contact": {
        const result = await searchOrCreateContact(
          toolInput as SearchOrCreateContactInput,
          ctx,
        );
        action = {
          id: actionId,
          type: result.created ? "create_contact" : "update_contact",
          description: result.created
            ? `Created contact "${result.first_name} ${result.last_name}"`
            : `Found existing contact "${result.first_name} ${result.last_name}"`,
          success: true,
          result: {
            recordId: result.id,
            recordType: "contact",
            name: `${result.first_name} ${result.last_name}`,
          },
        };
        return { result, action };
      }

      case "create_deal": {
        const result = await createDeal(toolInput as CreateDealInput, ctx);
        action = {
          id: actionId,
          type: "create_deal",
          description: `Created deal "${result.name}" for $${result.amount.toLocaleString()}`,
          success: true,
          result: {
            recordId: result.id,
            recordType: "deal",
            name: result.name,
          },
        };
        return { result, action };
      }

      case "create_task": {
        const result = await createTask(toolInput as CreateTaskInput, ctx);
        action = {
          id: actionId,
          type: "create_task",
          description: `Created task "${result.text}" due ${result.due_date}`,
          success: true,
          result: {
            recordId: result.id,
            recordType: "task",
            name: result.text,
          },
        };
        return { result, action };
      }

      case "create_note": {
        const result = await createNote(toolInput as CreateNoteInput, ctx);
        action = {
          id: actionId,
          type: "create_note",
          description: `Created note: "${result.text.slice(0, 50)}${result.text.length > 50 ? "..." : ""}"`,
          success: true,
          result: {
            recordId: result.id,
            recordType: "note",
            name: result.text.slice(0, 50),
          },
        };
        return { result, action };
      }

      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  } catch (error) {
    action = {
      id: actionId,
      type: "create_company", // Default type for error case
      description: `Failed to execute ${toolName}`,
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
    return {
      result: { error: action.error },
      action,
    };
  }
}

// Run the agent loop
export async function runAgent(
  userMessage: string,
  conversationHistory: MessageParam[],
  ctx: AgentContext,
): Promise<AgentResult> {
  const messages: MessageParam[] = [
    ...conversationHistory,
    { role: "user", content: userMessage },
  ];

  const executedActions: ExecutedAction[] = [];
  let finalMessage = "";

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const response = await anthropic.messages.create({
      model: MODEL_ID,
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      tools: AGENT_TOOLS,
      messages,
    });

    // Check if we're done (no tool use)
    if (response.stop_reason === "end_turn") {
      // Extract text from response
      const textBlocks = response.content.filter(
        (block): block is TextBlock => block.type === "text",
      );
      finalMessage = textBlocks.map((b) => b.text).join("\n");
      break;
    }

    // Process tool calls
    const toolUseBlocks = response.content.filter(
      (block): block is ToolUseBlock => block.type === "tool_use",
    );

    if (toolUseBlocks.length === 0) {
      // No tools and not end_turn - extract any text and finish
      const textBlocks = response.content.filter(
        (block): block is TextBlock => block.type === "text",
      );
      finalMessage = textBlocks.map((b) => b.text).join("\n");
      break;
    }

    // Add assistant message with tool calls to history
    messages.push({
      role: "assistant",
      content: response.content as ContentBlock[],
    });

    // Execute each tool and collect results
    const toolResults: {
      type: "tool_result";
      tool_use_id: string;
      content: string;
    }[] = [];

    for (const toolUse of toolUseBlocks) {
      const { result, action } = await executeTool(
        toolUse.name,
        toolUse.input as Record<string, unknown>,
        ctx,
      );
      executedActions.push(action);
      toolResults.push({
        type: "tool_result",
        tool_use_id: toolUse.id,
        content: JSON.stringify(result),
      });
    }

    // Add tool results to history
    messages.push({
      role: "user",
      content: toolResults,
    });
  }

  return {
    message: finalMessage,
    executedActions,
  };
}

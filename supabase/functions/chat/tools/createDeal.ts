import { supabaseAdmin } from "../../_shared/supabaseAdmin.ts";
import type { CreateDealInput, DealResult, AgentContext } from "./types.ts";

export async function createDeal(
  input: CreateDealInput,
  ctx: AgentContext,
): Promise<DealResult> {
  const {
    name,
    company_id,
    contact_ids,
    amount,
    stage,
    description,
    category,
    expected_closing_date,
  } = input;

  // Get the current board and its first stage
  let boardId = ctx.boardId;
  let defaultStage = stage;

  if (!boardId) {
    // Find the default board
    const { data: defaultBoard } = await supabaseAdmin
      .from("boards")
      .select("id")
      .eq("is_default", true)
      .single();

    boardId = defaultBoard?.id;

    // Fallback to first board
    if (!boardId) {
      const { data: firstBoard } = await supabaseAdmin
        .from("boards")
        .select("id")
        .order("position", { ascending: true })
        .limit(1)
        .single();

      boardId = firstBoard?.id;
    }
  }

  // Get first stage if not specified
  if (!defaultStage && boardId) {
    const { data: firstStage } = await supabaseAdmin
      .from("board_stages")
      .select("value")
      .eq("board_id", boardId)
      .order("position", { ascending: true })
      .limit(1)
      .single();

    defaultStage = firstStage?.value || "opportunity";
  }

  // Get the highest index in this stage for ordering
  const { data: lastDeal } = await supabaseAdmin
    .from("deals")
    .select("index")
    .eq("board_id", boardId)
    .eq("stage", defaultStage)
    .order("index", { ascending: false })
    .limit(1)
    .single();

  const newIndex = (lastDeal?.index ?? -1) + 1;

  const now = new Date().toISOString();
  const dealData: Record<string, unknown> = {
    name,
    company_id: company_id || null,
    contact_ids: contact_ids || [],
    amount,
    stage: defaultStage,
    board_id: boardId,
    index: newIndex,
    description: description || null,
    category: category || null,
    expected_closing_date: expected_closing_date || null,
    sales_id: ctx.salesId,
    created_at: now,
    updated_at: now,
  };

  const { data: newDeal, error: createError } = await supabaseAdmin
    .from("deals")
    .insert(dealData)
    .select("id, name, amount, stage")
    .single();

  if (createError || !newDeal) {
    throw new Error(`Failed to create deal: ${createError?.message}`);
  }

  return {
    id: newDeal.id,
    name: newDeal.name,
    amount: newDeal.amount,
    stage: newDeal.stage,
  };
}

import { supabaseAdmin } from "../../_shared/supabaseAdmin.ts";
import type { CreateTaskInput, TaskResult, AgentContext } from "./types.ts";

export async function createTask(
  input: CreateTaskInput,
  ctx: AgentContext,
): Promise<TaskResult> {
  const { contact_id, type, text, due_date } = input;

  const taskData = {
    contact_id,
    type,
    text,
    due_date,
    sales_id: ctx.salesId,
    done_date: null,
  };

  const { data: newTask, error: createError } = await supabaseAdmin
    .from("tasks")
    .insert(taskData)
    .select("id, text, due_date")
    .single();

  if (createError || !newTask) {
    throw new Error(`Failed to create task: ${createError?.message}`);
  }

  // Update contact's last_seen
  await supabaseAdmin
    .from("contacts")
    .update({ last_seen: new Date().toISOString() })
    .eq("id", contact_id);

  return {
    id: newTask.id,
    text: newTask.text,
    due_date: newTask.due_date,
  };
}

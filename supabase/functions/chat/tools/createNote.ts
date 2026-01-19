import { supabaseAdmin } from "../../_shared/supabaseAdmin.ts";
import type { CreateNoteInput, NoteResult, AgentContext } from "./types.ts";

export async function createNote(
  input: CreateNoteInput,
  ctx: AgentContext,
): Promise<NoteResult> {
  const { contact_id, deal_id, text, status } = input;

  if (!contact_id && !deal_id) {
    throw new Error("Either contact_id or deal_id must be provided");
  }

  const now = new Date().toISOString();

  // Create contact note or deal note based on what's provided
  if (contact_id) {
    const noteData = {
      contact_id,
      text,
      date: now,
      status: status || null,
      sales_id: ctx.salesId,
    };

    const { data: newNote, error: createError } = await supabaseAdmin
      .from("contactNotes")
      .insert(noteData)
      .select("id, text, contact_id")
      .single();

    if (createError || !newNote) {
      throw new Error(`Failed to create contact note: ${createError?.message}`);
    }

    // Update contact's last_seen
    await supabaseAdmin
      .from("contacts")
      .update({ last_seen: now })
      .eq("id", contact_id);

    return {
      id: newNote.id,
      text: newNote.text,
      contact_id: newNote.contact_id,
    };
  }

  // Deal note
  const noteData = {
    deal_id,
    text,
    date: now,
    sales_id: ctx.salesId,
  };

  const { data: newNote, error: createError } = await supabaseAdmin
    .from("dealNotes")
    .insert(noteData)
    .select("id, text, deal_id")
    .single();

  if (createError || !newNote) {
    throw new Error(`Failed to create deal note: ${createError?.message}`);
  }

  return {
    id: newNote.id,
    text: newNote.text,
    deal_id: newNote.deal_id,
  };
}

import { supabaseAdmin } from "../../_shared/supabaseAdmin.ts";
import type {
  SearchOrCreateContactInput,
  ContactResult,
  AgentContext,
} from "./types.ts";

export async function searchOrCreateContact(
  input: SearchOrCreateContactInput,
  ctx: AgentContext,
): Promise<ContactResult> {
  const {
    first_name,
    last_name,
    company_id,
    company_name,
    email,
    phone,
    title,
    patient_type,
    referring_doctor,
  } = input;

  const fullName = `${first_name} ${last_name}`.toLowerCase();

  // Check if we already created this contact in this session
  const sessionContactId = ctx.createdContacts.get(fullName);
  if (sessionContactId) {
    return {
      id: sessionContactId,
      first_name,
      last_name,
      company_id: company_id,
      created: false,
    };
  }

  // Resolve company_id from company_name if needed
  let resolvedCompanyId = company_id;
  if (!resolvedCompanyId && company_name) {
    // Check session cache first
    resolvedCompanyId = ctx.createdCompanies.get(company_name.toLowerCase());

    // Search database if not in cache
    if (!resolvedCompanyId) {
      const { data: companies } = await supabaseAdmin
        .from("companies")
        .select("id")
        .ilike("name", `%${company_name}%`)
        .limit(1);

      if (companies && companies.length > 0) {
        resolvedCompanyId = companies[0].id;
      }
    }
  }

  // Search for existing contact by email (if provided)
  if (email) {
    const { data: emailMatches } = await supabaseAdmin
      .from("contacts")
      .select("id, first_name, last_name, company_id")
      .contains("email_jsonb", JSON.stringify([{ email }]))
      .limit(1);

    if (emailMatches && emailMatches.length > 0) {
      const match = emailMatches[0];
      ctx.createdContacts.set(fullName, match.id);
      return {
        id: match.id,
        first_name: match.first_name,
        last_name: match.last_name,
        company_id: match.company_id,
        created: false,
      };
    }
  }

  // Search for existing contact by name
  const { data: nameMatches } = await supabaseAdmin
    .from("contacts")
    .select("id, first_name, last_name, company_id")
    .ilike("first_name", first_name)
    .ilike("last_name", last_name)
    .limit(5);

  if (nameMatches && nameMatches.length > 0) {
    // If we have a company_id, try to find match with same company
    if (resolvedCompanyId) {
      const companyMatch = nameMatches.find(
        (c) => c.company_id === resolvedCompanyId,
      );
      if (companyMatch) {
        ctx.createdContacts.set(fullName, companyMatch.id);
        return {
          id: companyMatch.id,
          first_name: companyMatch.first_name,
          last_name: companyMatch.last_name,
          company_id: companyMatch.company_id,
          created: false,
        };
      }
    }

    // Use first name match
    const firstMatch = nameMatches[0];
    ctx.createdContacts.set(fullName, firstMatch.id);
    return {
      id: firstMatch.id,
      first_name: firstMatch.first_name,
      last_name: firstMatch.last_name,
      company_id: firstMatch.company_id,
      created: false,
    };
  }

  // Create new contact
  const now = new Date().toISOString();
  const contactData: Record<string, unknown> = {
    first_name,
    last_name,
    company_id: resolvedCompanyId || null,
    title: title || null,
    email_jsonb: email ? [{ email, type: "Work" }] : [],
    phone_jsonb: phone ? [{ number: phone, type: "Work" }] : [],
    sales_id: ctx.salesId,
    first_seen: now,
    last_seen: now,
    tags: [],
    patient_type: patient_type || null,
    referring_doctor: referring_doctor || null,
  };

  const { data: newContact, error: createError } = await supabaseAdmin
    .from("contacts")
    .insert(contactData)
    .select("id, first_name, last_name, company_id")
    .single();

  if (createError || !newContact) {
    throw new Error(`Failed to create contact: ${createError?.message}`);
  }

  ctx.createdContacts.set(fullName, newContact.id);

  return {
    id: newContact.id,
    first_name: newContact.first_name,
    last_name: newContact.last_name,
    company_id: newContact.company_id,
    created: true,
  };
}

import { supabaseAdmin } from "../../_shared/supabaseAdmin.ts";
import type {
  SearchOrCreateCompanyInput,
  CompanyResult,
  AgentContext,
} from "./types.ts";

export async function searchOrCreateCompany(
  input: SearchOrCreateCompanyInput,
  ctx: AgentContext,
): Promise<CompanyResult> {
  const { name, website, phone, address, sector, business_type } = input;

  // Check if we already created this company in this session
  const sessionCompanyId = ctx.createdCompanies.get(name.toLowerCase());
  if (sessionCompanyId) {
    return {
      id: sessionCompanyId,
      name,
      created: false,
    };
  }

  // Search for existing company by name (case-insensitive)
  const { data: existingCompanies, error: searchError } = await supabaseAdmin
    .from("companies")
    .select("id, name")
    .ilike("name", `%${name}%`)
    .limit(5);

  if (searchError) {
    throw new Error(`Failed to search companies: ${searchError.message}`);
  }

  // Check for exact or close match
  if (existingCompanies && existingCompanies.length > 0) {
    // Prefer exact match
    const exactMatch = existingCompanies.find(
      (c) => c.name.toLowerCase() === name.toLowerCase(),
    );
    if (exactMatch) {
      ctx.createdCompanies.set(name.toLowerCase(), exactMatch.id);
      return {
        id: exactMatch.id,
        name: exactMatch.name,
        created: false,
      };
    }

    // Use first close match
    const firstMatch = existingCompanies[0];
    ctx.createdCompanies.set(name.toLowerCase(), firstMatch.id);
    return {
      id: firstMatch.id,
      name: firstMatch.name,
      created: false,
    };
  }

  // Create new company
  const { data: newCompany, error: createError } = await supabaseAdmin
    .from("companies")
    .insert({
      name,
      website: website || null,
      phone_number: phone || null,
      address: address || null,
      sector: sector || null,
      business_type: business_type || null,
      sales_id: ctx.salesId,
      created_at: new Date().toISOString(),
    })
    .select("id, name")
    .single();

  if (createError || !newCompany) {
    throw new Error(`Failed to create company: ${createError?.message}`);
  }

  ctx.createdCompanies.set(name.toLowerCase(), newCompany.id);

  return {
    id: newCompany.id,
    name: newCompany.name,
    created: true,
  };
}

import type { Tool } from "npm:@anthropic-ai/sdk@0.52.0/resources/messages.mjs";

export const AGENT_TOOLS: Tool[] = [
  {
    name: "search_or_create_company",
    description: `Search for an existing company by name or create a new one if not found.
Use this FIRST when the user mentions a company/organization to ensure we don't create duplicates.
Returns the company ID for use in subsequent operations (creating contacts, deals).
If a company with a similar name exists, it will be returned instead of creating a duplicate.`,
    input_schema: {
      type: "object" as const,
      properties: {
        name: {
          type: "string",
          description: "Company name (e.g., 'Midwest Orthotics', 'Acme Corp')",
        },
        website: {
          type: "string",
          description: "Company website URL (optional)",
        },
        phone: {
          type: "string",
          description: "Company phone number (optional)",
        },
        address: {
          type: "string",
          description: "Company address (optional)",
        },
        sector: {
          type: "string",
          description: "Industry sector (optional)",
        },
        business_type: {
          type: "string",
          enum: ["franchisee", "patient", "doctor", "supplier", "other"],
          description:
            "Type of business relationship for US Prosthetix (optional)",
        },
      },
      required: ["name"],
    },
  },
  {
    name: "search_or_create_contact",
    description: `Search for an existing contact by name/email or create a new one if not found.
Use this after finding/creating a company to add or find the person mentioned.
If a contact with the same email exists, it will be returned instead of creating a duplicate.
You can provide either company_id (if known) or company_name (which will look up the company).`,
    input_schema: {
      type: "object" as const,
      properties: {
        first_name: {
          type: "string",
          description: "Contact's first name",
        },
        last_name: {
          type: "string",
          description: "Contact's last name",
        },
        company_id: {
          type: "number",
          description:
            "Company ID to associate with (use result from search_or_create_company)",
        },
        company_name: {
          type: "string",
          description:
            "Company name (alternative to company_id - will look up the company)",
        },
        email: {
          type: "string",
          description: "Contact's email address (optional)",
        },
        phone: {
          type: "string",
          description: "Contact's phone number (optional)",
        },
        title: {
          type: "string",
          description:
            "Contact's job title (optional, e.g., 'Clinic Director', 'CEO')",
        },
        patient_type: {
          type: "string",
          enum: ["prosthetics", "orthotics", "both"],
          description: "For patient contacts, their care type (optional)",
        },
        referring_doctor: {
          type: "string",
          description: "Referring doctor name for patient contacts (optional)",
        },
      },
      required: ["first_name", "last_name"],
    },
  },
  {
    name: "create_deal",
    description: `Create a new deal/opportunity in the CRM pipeline.
Use this when the user mentions a potential deal, opportunity, or sales value.
The deal will be created in the current board's first stage by default.`,
    input_schema: {
      type: "object" as const,
      properties: {
        name: {
          type: "string",
          description:
            "Deal name/title (e.g., 'Midwest Orthotics - Franchise Opportunity')",
        },
        company_id: {
          type: "number",
          description:
            "Company ID for this deal (use result from search_or_create_company)",
        },
        contact_ids: {
          type: "array",
          items: { type: "number" },
          description: "Array of contact IDs associated with this deal",
        },
        amount: {
          type: "number",
          description: "Deal value in dollars (e.g., 75000 for $75k)",
        },
        stage: {
          type: "string",
          description: "Pipeline stage (optional - defaults to first stage)",
        },
        description: {
          type: "string",
          description: "Deal description or notes (optional)",
        },
        category: {
          type: "string",
          description: "Deal category (optional)",
        },
        expected_closing_date: {
          type: "string",
          description: "Expected close date in ISO format (optional)",
        },
      },
      required: ["name", "amount"],
    },
  },
  {
    name: "create_task",
    description: `Create a follow-up task for a contact.
Use this when the user mentions needing to follow up, call, email, or take action regarding a contact.
Common task types: 'Follow-up call', 'Send email', 'Schedule meeting', 'Send proposal'.`,
    input_schema: {
      type: "object" as const,
      properties: {
        contact_id: {
          type: "number",
          description:
            "Contact ID this task is for (use result from search_or_create_contact)",
        },
        type: {
          type: "string",
          description:
            "Task type (e.g., 'Follow-up call', 'Send email', 'Schedule meeting')",
        },
        text: {
          type: "string",
          description: "Task description/details",
        },
        due_date: {
          type: "string",
          description:
            "Due date in ISO format (e.g., '2024-01-15'). Parse relative dates like 'next week' or 'tomorrow' to actual dates.",
        },
      },
      required: ["contact_id", "type", "text", "due_date"],
    },
  },
  {
    name: "create_note",
    description: `Create a note attached to a contact or deal.
Use this to log meeting notes, conversation summaries, or important information about interactions.
Notes are timestamped and attributed to the current user.`,
    input_schema: {
      type: "object" as const,
      properties: {
        contact_id: {
          type: "number",
          description:
            "Contact ID to attach note to (optional if deal_id provided)",
        },
        deal_id: {
          type: "number",
          description:
            "Deal ID to attach note to (optional if contact_id provided)",
        },
        text: {
          type: "string",
          description:
            "Note content - can include meeting summaries, key points discussed, etc.",
        },
        status: {
          type: "string",
          description:
            "Note status/type (optional, e.g., 'cold', 'warm', 'hot' for lead status)",
        },
      },
      required: ["text"],
    },
  },
];

export const SYSTEM_PROMPT = `You are a CRM assistant for US Prosthetix, a prosthetics and orthotics company. Your role is to help sales representatives quickly enter data from their meetings and conversations into the CRM.

When the user describes a meeting, conversation, or interaction:
1. FIRST search for existing companies before creating new ones (use search_or_create_company)
2. THEN search for or create contacts (use search_or_create_contact)
3. Create deals if a sales opportunity is mentioned (use create_deal)
4. Create follow-up tasks for any mentioned next steps (use create_task)
5. Create notes to capture meeting details (use create_note)

Important guidelines:
- Always search before creating to avoid duplicates
- Use the company_id from search_or_create_company when creating contacts and deals
- Use the contact_id from search_or_create_contact when creating tasks and notes
- Parse relative dates like "next week", "tomorrow", "in 3 days" into actual ISO dates based on today's date
- For amounts, convert shorthand like "$75k" to 75000
- Extract job titles, contact info, and business details from natural language

When you successfully complete actions, summarize what was created/found in a friendly, conversational way.

If the user's message doesn't seem to require CRM actions (e.g., they're asking a question or just chatting), respond helpfully without using tools.

Today's date is: ${new Date().toISOString().split("T")[0]}`;

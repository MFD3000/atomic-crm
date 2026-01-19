// Tool input types

export interface SearchOrCreateCompanyInput {
  name: string;
  website?: string;
  phone?: string;
  address?: string;
  sector?: string;
  business_type?: "franchisee" | "patient" | "doctor" | "supplier" | "other";
}

export interface SearchOrCreateContactInput {
  first_name: string;
  last_name: string;
  company_id?: number;
  company_name?: string; // For convenience - agent can reference by name
  email?: string;
  phone?: string;
  title?: string;
  patient_type?: "prosthetics" | "orthotics" | "both";
  referring_doctor?: string;
}

export interface CreateDealInput {
  name: string;
  company_id?: number;
  contact_ids?: number[];
  amount: number;
  stage?: string;
  description?: string;
  category?: string;
  expected_closing_date?: string;
}

export interface CreateTaskInput {
  contact_id: number;
  type: string;
  text: string;
  due_date: string;
}

export interface CreateNoteInput {
  contact_id?: number;
  deal_id?: number;
  text: string;
  status?: string;
}

// Tool result types

export interface CompanyResult {
  id: number;
  name: string;
  created: boolean; // true if newly created, false if found existing
}

export interface ContactResult {
  id: number;
  first_name: string;
  last_name: string;
  company_id?: number;
  created: boolean;
}

export interface DealResult {
  id: number;
  name: string;
  amount: number;
  stage: string;
}

export interface TaskResult {
  id: number;
  text: string;
  due_date: string;
}

export interface NoteResult {
  id: number;
  text: string;
  contact_id?: number;
  deal_id?: number;
}

// Planned action types for preview-first mode

export type PlannedActionType =
  | "create_company"
  | "create_contact"
  | "create_deal"
  | "create_task"
  | "create_note"
  | "update_company"
  | "update_contact"
  | "link_contact_to_company";

export interface PlannedAction {
  id: string;
  type: PlannedActionType;
  description: string;
  data: Record<string, unknown>;
  // If this action references another planned action (e.g., contact -> company)
  dependsOn?: string;
}

export interface ExecutedAction {
  id: string;
  type: PlannedActionType;
  description: string;
  success: boolean;
  result?: {
    recordId: number;
    recordType: "company" | "contact" | "deal" | "task" | "note";
    name?: string;
  };
  error?: string;
}

// Message types

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  plannedActions?: PlannedAction[];
  executedActions?: ExecutedAction[];
  timestamp: string;
}

// Agent context passed through tool execution

export interface AgentContext {
  salesId: number;
  boardId?: number;
  // Track created records in this session for linking
  createdCompanies: Map<string, number>; // name -> id
  createdContacts: Map<string, number>; // "first last" -> id
}

# CRM Chat Agent Skill

This skill helps you understand and maintain the CRM Chat Agent feature, which allows users to create CRM data through natural language conversations.

## Architecture Overview

```
Frontend (React)                    Backend (Supabase Edge Function)
┌─────────────────────┐            ┌────────────────────────────────┐
│ ChatProvider        │            │ chat/index.ts                  │
│  - State management │◄──────────►│  - Auth & request handling     │
│  - API calls        │            │                                │
│                     │            │ chat/agent.ts                  │
│ ChatPanel           │            │  - Claude agent loop           │
│  - Sheet UI         │            │  - Tool execution              │
│  - Messages         │            │                                │
│  - Input            │            │ chat/tools/                    │
│  - Actions          │            │  - definitions.ts (schemas)    │
└─────────────────────┘            │  - searchCompany.ts            │
                                   │  - searchContact.ts            │
                                   │  - createDeal.ts               │
                                   │  - createTask.ts               │
                                   │  - createNote.ts               │
                                   └────────────────────────────────┘
```

## Key Files

### Backend (Edge Function)

| File | Purpose |
|------|---------|
| `supabase/functions/_shared/anthropic.ts` | Anthropic SDK client setup |
| `supabase/functions/chat/index.ts` | Edge function entry point, handles auth |
| `supabase/functions/chat/agent.ts` | Agent loop, tool execution |
| `supabase/functions/chat/tools/types.ts` | TypeScript interfaces for tools |
| `supabase/functions/chat/tools/definitions.ts` | Claude tool schemas, system prompt |
| `supabase/functions/chat/tools/searchCompany.ts` | Search/create company logic |
| `supabase/functions/chat/tools/searchContact.ts` | Search/create contact logic |
| `supabase/functions/chat/tools/createDeal.ts` | Create deal logic |
| `supabase/functions/chat/tools/createTask.ts` | Create task logic |
| `supabase/functions/chat/tools/createNote.ts` | Create note logic |

### Frontend (React)

| File | Purpose |
|------|---------|
| `src/components/atomic-crm/chat/ChatProvider.tsx` | React context, API integration |
| `src/components/atomic-crm/chat/ChatPanel.tsx` | Slide-out panel UI |
| `src/components/atomic-crm/chat/ChatMessages.tsx` | Message list component |
| `src/components/atomic-crm/chat/ChatMessage.tsx` | Individual message component |
| `src/components/atomic-crm/chat/ChatInput.tsx` | Text input with send button |
| `src/components/atomic-crm/chat/ExecutedAction.tsx` | Action result cards |
| `src/components/atomic-crm/types.ts` | Chat-related TypeScript types |

## How to Add a New Tool

### 1. Add TypeScript Types

In `supabase/functions/chat/tools/types.ts`:

```typescript
// Input type
export interface MyNewToolInput {
  required_field: string;
  optional_field?: number;
}

// Result type
export interface MyNewToolResult {
  id: number;
  name: string;
}
```

### 2. Add Tool Definition

In `supabase/functions/chat/tools/definitions.ts`:

```typescript
{
  name: "my_new_tool",
  description: `Description of what this tool does...`,
  input_schema: {
    type: "object" as const,
    properties: {
      required_field: {
        type: "string",
        description: "What this field is for",
      },
      optional_field: {
        type: "number",
        description: "Optional field description",
      },
    },
    required: ["required_field"],
  },
}
```

### 3. Implement Tool Logic

Create `supabase/functions/chat/tools/myNewTool.ts`:

```typescript
import { supabaseAdmin } from "../../_shared/supabaseAdmin.ts";
import type { MyNewToolInput, MyNewToolResult, AgentContext } from "./types.ts";

export async function myNewTool(
  input: MyNewToolInput,
  ctx: AgentContext
): Promise<MyNewToolResult> {
  const { required_field, optional_field } = input;

  // Implement your logic here
  const { data, error } = await supabaseAdmin
    .from("your_table")
    .insert({ /* ... */ })
    .select()
    .single();

  if (error) throw new Error(`Failed: ${error.message}`);

  return { id: data.id, name: data.name };
}
```

### 4. Export from Index

In `supabase/functions/chat/tools/index.ts`:

```typescript
export { myNewTool } from "./myNewTool.ts";
```

### 5. Add to Agent Switch

In `supabase/functions/chat/agent.ts`, add a case to `executeTool()`:

```typescript
case "my_new_tool": {
  const result = await myNewTool(toolInput as MyNewToolInput, ctx);
  action = {
    id: actionId,
    type: "create_xxx", // or appropriate type
    description: `Created thing "${result.name}"`,
    success: true,
    result: {
      recordId: result.id,
      recordType: "xxx",
      name: result.name,
    },
  };
  return { result, action };
}
```

### 6. Update Frontend Types (if needed)

In `src/components/atomic-crm/types.ts`, add the action type if it's new:

```typescript
export type ChatActionType =
  | "create_company"
  | "create_contact"
  // ... existing types
  | "create_xxx"; // Add new type
```

### 7. Update Query Invalidation (if needed)

In `src/components/atomic-crm/chat/ChatProvider.tsx`, add cache invalidation:

```typescript
if (recordTypes.has("xxx")) {
  queryClient.invalidateQueries({ queryKey: ["xxx"] });
}
```

## Common Modifications

### Change Confirmation Flow to Preview-First

The current implementation executes actions immediately. To add a preview step:

1. Add a `mode: "plan" | "execute"` parameter to the request
2. In `agent.ts`, add a planning mode that returns planned actions without executing
3. Store planned actions in frontend state
4. Show preview UI with confirm/edit buttons
5. On confirm, send `mode: "execute"` with the planned actions

### Add Voice Input

1. Install `@anthropic-ai/sdk` voice capabilities or use Web Speech API
2. Add a microphone button to `ChatInput.tsx`
3. Transcribe audio to text
4. Send transcribed text through existing flow

### Change System Prompt

Edit `SYSTEM_PROMPT` in `supabase/functions/chat/tools/definitions.ts` to change the agent's behavior, personality, or instructions.

## Testing

### Deploy Edge Function Locally

```bash
npx supabase functions serve chat --env-file .env.development
```

### Test with curl

```bash
curl -X POST http://localhost:54321/functions/v1/chat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Met John from Acme, potential $50k deal"}'
```

### Environment Variables

Required in Supabase:
- `ANTHROPIC_API_KEY` - Your Anthropic API key

Set via:
```bash
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
```

## Troubleshooting

### "User not found in sales table"
The authenticated user must have a corresponding record in the `sales` table.

### Tool execution fails
Check Supabase function logs for detailed error messages:
```bash
npx supabase functions logs chat
```

### Messages not appearing
Verify the edge function is returning the expected response structure with `message` and `executedActions` fields.

### Actions not invalidating cache
Ensure the `recordType` matches a case in the `ChatProvider.tsx` query invalidation logic.

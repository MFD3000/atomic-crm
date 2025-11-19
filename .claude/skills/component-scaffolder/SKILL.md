---
name: component-scaffolder
description: Scaffold new React Admin CRUD resources for Atomic CRM following established patterns. Use when creating new entities like Products, Projects, or any new business objects that need List/Create/Edit/Show components.
---

# Component Scaffolder

This skill helps you scaffold complete CRUD (Create, Read, Update, Delete) resource components for Atomic CRM following the established patterns used in contacts, companies, and deals.

## Instructions

When the user asks to create a new resource or entity:

1. **Ask clarifying questions:**
   - What is the resource name? (singular and plural forms)
   - What fields should it have?
   - Should it reference other resources (contacts, companies, sales)?
   - Does it need special features? (file uploads, activity log, custom views)

2. **Create the directory structure:**
   ```
   src/components/atomic-crm/{resource-plural}/
   ├── index.ts
   ├── {Resource}List.tsx
   ├── {Resource}Create.tsx
   ├── {Resource}Edit.tsx
   ├── {Resource}Show.tsx (optional)
   ├── {Resource}Inputs.tsx
   ├── {Resource}Empty.tsx (optional)
   └── {Resource}ListFilter.tsx (optional)
   ```

3. **Generate components using the templates below**

4. **Add TypeScript types** to `src/components/atomic-crm/types.ts`

5. **Register the resource** in `src/components/atomic-crm/root/CRM.tsx`:
   ```tsx
   import {resourcePlural} from "../{resource-plural}";

   // Inside <Admin>:
   <Resource name="{resourcePlural}" {...{resourcePlural}} />
   ```

6. **Remind the user** to create database tables/migrations if needed

## Component Templates

### 1. index.ts

```typescript
import { {Resource}List } from "./{Resource}List";
import { {Resource}Create } from "./{Resource}Create";
import { {Resource}Edit } from "./{Resource}Edit";
import { {Resource}Show } from "./{Resource}Show";
import type { {Resource} } from "../types";

export default {
  list: {Resource}List,
  create: {Resource}Create,
  edit: {Resource}Edit,
  show: {Resource}Show,
  recordRepresentation: (record: {Resource}) => record?.name || record?.title || `{Resource} #${record?.id}`,
};
```

### 2. {Resource}List.tsx

```typescript
import { useGetIdentity, useListContext } from "ra-core";
import { CreateButton } from "@/components/admin/create-button";
import { ExportButton } from "@/components/admin/export-button";
import { List } from "@/components/admin/list";
import { ListPagination } from "@/components/admin/list-pagination";
import { SortButton } from "@/components/admin/sort-button";
import { DataTable } from "@/components/admin/data-table";
import { TextField } from "@/components/admin/text-field";
import { DateField } from "@/components/admin/date-field";

import { TopToolbar } from "../layout/TopToolbar";
import { {Resource}Empty } from "./{Resource}Empty";

export const {Resource}List = () => {
  const { identity } = useGetIdentity();
  if (!identity) return null;

  return (
    <List
      title={false}
      perPage={25}
      sort={{ field: "created_at", order: "DESC" }}
      actions={<{Resource}ListActions />}
      pagination={<ListPagination rowsPerPageOptions={[10, 25, 50, 100]} />}
    >
      <{Resource}ListLayout />
    </List>
  );
};

const {Resource}ListLayout = () => {
  const { data, isPending, filterValues } = useListContext();
  const hasFilters = filterValues && Object.keys(filterValues).length > 0;

  if (isPending) return null;
  if (!data?.length && !hasFilters) return <{Resource}Empty />;

  return (
    <DataTable>
      <TextField source="name" />
      <DateField source="created_at" />
      {/* Add more fields as needed */}
    </DataTable>
  );
};

const {Resource}ListActions = () => {
  return (
    <TopToolbar>
      <SortButton fields={["name", "created_at"]} />
      <ExportButton />
      <CreateButton label="New {Resource}" />
    </TopToolbar>
  );
};
```

### 3. {Resource}Create.tsx

```typescript
import { CreateBase, Form, useGetIdentity } from "ra-core";
import { Card, CardContent } from "@/components/ui/card";
import { CancelButton } from "@/components/admin/cancel-button";
import { SaveButton } from "@/components/admin/form";
import { FormToolbar } from "@/components/admin/simple-form";

import { {Resource}Inputs } from "./{Resource}Inputs";

export const {Resource}Create = () => {
  const { identity } = useGetIdentity();

  return (
    <CreateBase
      redirect="show"
      transform={(values) => {
        // Add any data transformations here
        return values;
      }}
    >
      <div className="mt-2 flex lg:mr-72">
        <div className="flex-1">
          <Form defaultValues={{ sales_id: identity?.id }}>
            <Card>
              <CardContent>
                <{Resource}Inputs />
                <FormToolbar>
                  <div className="flex flex-row gap-2 justify-end">
                    <CancelButton />
                    <SaveButton label="Create {Resource}" />
                  </div>
                </FormToolbar>
              </CardContent>
            </Card>
          </Form>
        </div>
      </div>
    </CreateBase>
  );
};
```

### 4. {Resource}Edit.tsx

```typescript
import { EditBase, Form } from "ra-core";
import { Card, CardContent } from "@/components/ui/card";

import { {Resource}Inputs } from "./{Resource}Inputs";
import { FormToolbar } from "../layout/FormToolbar";

export const {Resource}Edit = () => (
  <EditBase
    actions={false}
    redirect="show"
    transform={(values) => {
      // Add any data transformations here
      return values;
    }}
  >
    <div className="mt-2 flex gap-8">
      <Form className="flex flex-1 flex-col gap-4 pb-2">
        <Card>
          <CardContent>
            <{Resource}Inputs />
            <FormToolbar />
          </CardContent>
        </Card>
      </Form>
    </div>
  </EditBase>
);
```

### 5. {Resource}Inputs.tsx

```typescript
import { required } from "ra-core";
import { TextInput } from "@/components/admin/text-input";
import { ReferenceInput } from "@/components/admin/reference-input";
import { SelectInput } from "@/components/admin/select-input";
import { DateInput } from "@/components/admin/date-input";
import { BooleanInput } from "@/components/admin/boolean-input";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";

import type { Sale } from "../types";

export const {Resource}Inputs = () => {
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col gap-4 p-1">
      <div className={`flex gap-6 ${isMobile ? "flex-col" : "flex-row"}`}>
        <div className="flex flex-col gap-10 flex-1">
          <BasicInputs />
        </div>
        <Separator orientation={isMobile ? "horizontal" : "vertical"} />
        <div className="flex flex-col gap-8 flex-1">
          <AdditionalInputs />
        </div>
      </div>
    </div>
  );
};

const BasicInputs = () => {
  return (
    <div className="flex flex-col gap-4">
      <h6 className="text-lg font-semibold">Basic Information</h6>
      <TextInput
        source="name"
        validate={required()}
        helperText={false}
        placeholder="{Resource} name"
      />
      <TextInput
        source="description"
        multiline
        helperText={false}
        placeholder="Description"
      />
    </div>
  );
};

const AdditionalInputs = () => {
  return (
    <div className="flex flex-col gap-4">
      <h6 className="text-lg font-semibold">Additional Information</h6>
      <ReferenceInput
        source="sales_id"
        reference="sales"
        filter={{ "disabled@neq": true }}
      >
        <SelectInput
          label="Account manager"
          helperText={false}
          optionText={(choice: Sale) => `${choice.first_name} ${choice.last_name}`}
        />
      </ReferenceInput>
      {/* Add more fields as needed */}
    </div>
  );
};
```

### 6. {Resource}Empty.tsx

```typescript
import { CreateButton } from "@/components/admin/create-button";

export const {Resource}Empty = () => (
  <div className="flex flex-col items-center justify-center h-96 gap-4">
    <p className="text-muted-foreground">No {resourcePlural} yet</p>
    <CreateButton label="Create first {resource}" />
  </div>
);
```

### 7. {Resource}Show.tsx (Optional)

```typescript
import { useShowContext } from "ra-core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Show } from "@/components/admin/show";
import { TextField } from "@/components/admin/text-field";
import { DateField } from "@/components/admin/date-field";
import { ReferenceField } from "@/components/admin/reference-field";

import type { {Resource} } from "../types";

export const {Resource}Show = () => {
  const { record } = useShowContext<{Resource}>();

  if (!record) return null;

  return (
    <Show actions={false}>
      <div className="mt-2 flex gap-8">
        <div className="flex flex-1 flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>{record.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <TextField source="description" />
              <DateField source="created_at" />
              <ReferenceField source="sales_id" reference="sales">
                <TextField source="first_name" />
              </ReferenceField>
            </CardContent>
          </Card>
        </div>
      </div>
    </Show>
  );
};
```

## TypeScript Type Template

Add to `src/components/atomic-crm/types.ts`:

```typescript
export type {Resource} = {
  id: string;
  name: string;
  description?: string;
  sales_id: string;
  created_at: string;
  updated_at?: string;
  // Add resource-specific fields
} & RaRecord;
```

## Key Patterns to Follow

### 1. Mobile Responsiveness
Always use `useIsMobile()` hook and conditional flex direction:
```typescript
const isMobile = useIsMobile();
<div className={`flex gap-6 ${isMobile ? "flex-col" : "flex-row"}`}>
```

### 2. Form Validation
Import and use validators from `ra-core`:
```typescript
import { required, email } from "ra-core";
<TextInput source="email" validate={[required(), email()]} />
```

### 3. Reference Inputs
Use `ReferenceInput` with `SelectInput` for foreign keys:
```typescript
<ReferenceInput source="sales_id" reference="sales">
  <SelectInput optionText={(choice: Sale) => `${choice.first_name} ${choice.last_name}`} />
</ReferenceInput>
```

### 4. Helper Text
Always set `helperText={false}` unless you have specific helper text:
```typescript
<TextInput source="name" helperText={false} />
```

### 5. Configuration Context
Use `useConfigurationContext()` for domain-specific choices:
```typescript
const { companySectors, taskTypes } = useConfigurationContext();
```

### 6. Identity Context
Get current user with `useGetIdentity()`:
```typescript
const { identity } = useGetIdentity();
if (!identity) return null;
```

### 7. Transform Data
Use `transform` prop on CreateBase/EditBase for data modifications:
```typescript
<CreateBase
  transform={(values) => {
    // Modify values before save
    return values;
  }}
>
```

## Common Input Components

- `TextInput` - Text fields
- `SelectInput` - Dropdowns
- `ReferenceInput` - Foreign key relationships
- `BooleanInput` - Checkboxes
- `DateInput` - Date pickers
- `DateTimeInput` - Date + time pickers
- `RadioButtonGroupInput` - Radio buttons
- `ArrayInput` + `SimpleFormIterator` - Array fields
- `AutocompleteInput` - Searchable dropdowns
- `FileInput` - File uploads

## Common Field Components (for Show/List)

- `TextField` - Display text
- `DateField` - Display dates
- `ReferenceField` - Display related records
- `EmailField` - Email links
- `UrlField` - URL links
- `NumberField` - Numbers
- `BooleanField` - Checkboxes (read-only)
- `FileField` - File downloads

## Best Practices

1. **Keep components focused** - Separate Inputs, List, Create, Edit, Show
2. **Use semantic grouping** - Group related fields with headings
3. **Follow naming conventions** - PascalCase for components, camelCase for files
4. **Add empty states** - Create {Resource}Empty component for better UX
5. **Mobile first** - Always consider mobile layout with `useIsMobile()`
6. **Validate inputs** - Use `required()`, `email()`, custom validators
7. **Set sales_id default** - Use `identity?.id` as default for account manager
8. **Use Separator** - Visual separation between form sections
9. **Consistent styling** - Use Tailwind classes, Card components
10. **Type everything** - Import and use TypeScript types

## Example Usage

**User**: "Create a new Projects resource with name, description, status, and due date"

**Claude should**:
1. Ask about additional requirements (relationships, special features)
2. Create directory `src/components/atomic-crm/projects/`
3. Generate all component files using templates above
4. Add `Project` type to types.ts
5. Update CRM.tsx to register the resource
6. Remind user about database migration needs

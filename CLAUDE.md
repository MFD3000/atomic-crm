# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Atomic CRM is a full-featured CRM built with React, Shadcn Admin Kit, and Supabase. The frontend is a Single-Page Application using React Router, TanStack Query, React Hook Form, Shadcn UI, Radix UI, and Tailwind CSS. The backend leverages Supabase (PostgreSQL database, REST API, authentication, storage, and edge functions).

## Common Commands

### Development
```bash
make install          # Install dependencies (includes npm install and local Supabase setup)
make start            # Start full stack (Supabase + Vite dev server on http://localhost:5173)
make start-app        # Start frontend only (npm run dev)
make start-supabase   # Start Supabase locally
make start-demo       # Start in demo mode with fake data
```

### Testing and Quality
```bash
make test             # Run tests with Vitest
npm test              # Alternative way to run tests
make lint             # Run ESLint and Prettier checks
npm run lint:check    # ESLint check only
npm run lint:apply    # ESLint auto-fix
npm run prettier:check # Prettier check only
npm run prettier:apply # Prettier auto-format
```

### Build
```bash
make build            # Build production app (tsc + vite build)
make build-demo       # Build in demo mode
```

### Database
```bash
make supabase-migrate-database  # Apply migrations
make supabase-reset-database    # Reset and clear database
make stop-supabase              # Stop local Supabase
```

### Registry
```bash
make registry-gen     # Generate Shadcn registry (runs automatically on pre-commit)
make registry-build   # Build Shadcn registry
```

## Architecture

### Directory Structure

```
src/
├── components/
│   ├── admin/           # Shadcn Admin Kit components (mutable dependency)
│   │                    # Building blocks for SPA (data fetching, forms, auth, i18n, etc.)
│   ├── ui/              # Shadcn UI components (mutable dependency)
│   └── atomic-crm/      # Main CRM code (~15K LOC)
│       ├── activity/    # Activity log components
│       ├── companies/   # Company CRUD
│       ├── contacts/    # Contact CRUD
│       ├── deals/       # Deal pipeline (Kanban board)
│       ├── dashboard/   # Dashboard page
│       ├── layout/      # App layout
│       ├── login/       # Auth pages
│       ├── providers/   # Data and auth providers
│       │   ├── supabase/     # Production Supabase provider
│       │   ├── fakerest/     # Development fake data provider
│       │   └── commons/      # Shared utilities (avatars, activity logs)
│       ├── root/        # CRM component and configuration
│       ├── sales/       # Sales/user management
│       ├── settings/    # Settings page
│       ├── calendar/    # Calendar/events feature
│       └── types.ts     # TypeScript types
supabase/
├── functions/           # Edge functions (user management, email processing)
├── migrations/          # SQL migrations (init, triggers, views, policies)
└── config.toml          # Supabase configuration
```

### Key Concepts

**Entry Point**: `src/App.tsx` renders the `<CRM>` component from `src/components/atomic-crm/root/CRM.tsx`. Configure domain-specific data (gender options, deal stages, task types, etc.) by passing props to `<CRM>`.

**Mutable Dependencies**: `src/components/admin/` (Shadcn Admin Kit) and `src/components/ui/` (Shadcn UI) are directly integrated into the codebase for customization. Modify these files as needed rather than treating them as immutable node_modules.

**Data Providers**: Switch between Supabase (production) and FakeRest (development) providers. The Supabase provider uses `ra-supabase-core` and includes lifecycle callbacks for avatar generation, file uploads, and full-text search. See `src/components/atomic-crm/providers/supabase/dataProvider.ts`.

**Resources**: The app manages these resources via `ra-core`: `deals`, `contacts`, `companies`, `contactNotes`, `dealNotes`, `tasks`, `sales`, `tags`, `events`, `boards`, `board_stages`, `board_templates`.

**Database Views**: Used to reduce HTTP overhead and simplify frontend code. For example, `contacts_summary` view provides contact list data with aggregated task counts. Views are defined in `supabase/migrations/20240730075029_init_db.sql` and emulated in the FakeRest provider.

**Database Triggers**: Supabase `auth.users` table is synced with the `sales` table via triggers (see `supabase/migrations/20240730075425_init_triggers.sql`).

**Edge Functions**: Located in `supabase/functions/`. The `users` function handles user creation/updates (Supabase has no public user management endpoint). The `postmark` function processes inbound emails.

**Full-Text Search**: Implemented in the data provider using lifecycle callbacks. Searches across multiple columns with `@ilike` filters. For email/phone, uses `_fts` columns. See `applyFullTextSearch` in `dataProvider.ts`.

**File Uploads**: Files (avatars, attachments) are uploaded to Supabase Storage's `attachments` bucket. The `uploadToBucket` function handles blob URLs and generates public URLs.

**Authentication**: Supabase Auth with Google, Azure, Keycloak, and Auth0 support. Custom pages: `StartPage`, `SignupPage`, `SetPasswordPage`, `ForgotPasswordPage`.

## Environment Variables

Local development uses `.env.development` with these required variables:
- `VITE_SUPABASE_URL` - Supabase API URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `VITE_IS_DEMO` - Enable demo mode (uses FakeRest provider)
- `VITE_INBOUND_EMAIL` - Email address for capturing communications
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for edge functions
- `DATABASE_URL` - Postgres connection string

## Testing

- Tests use Vitest
- Test files: `*.test.ts` or `*.test.tsx` anywhere in `src/`
- Run single test: `npm test -- path/to/file.test.ts`
- Some provider components have unit tests (e.g., `getContactAvatar.spec.ts`, `supabaseAdapter.spec.ts`)

## Pre-commit Hook

The `.husky/pre-commit` hook runs `make registry-gen` to regenerate `registry.json` for Shadcn component registry. If `registry.json` is missing changes, update `scripts/generate-registry.mjs`.

## Customization

**Domain Configuration**: Pass props to `<CRM>` in `src/App.tsx`:
- `contactGender`, `companySectors`, `dealCategories`, `dealPipelineStatuses`, `dealStages`, `noteStatuses`, `taskTypes`
- `title`, `darkModeLogo`, `lightModeLogo`
- `dataProvider`, `authProvider`
- `disableTelemetry`

**Component Overrides**: Modify files in `src/components/admin/` and `src/components/ui/` directly, or override components in `src/components/atomic-crm/`.

**Update Shadcn Admin Kit**: Run `npx shadcn@latest add -o https://marmelab.com/shadcn-admin-kit/r/admin.json`

## Database Migrations

Create migrations with Supabase CLI. Migrations live in `supabase/migrations/`. Key migrations:
- `20240730075029_init_db.sql` - Initial schema with views
- `20240730075425_init_triggers.sql` - User sync triggers
- `20240808141826_init_state_configure.sql` - State configuration
- `20250109152531_email_jsonb.sql` - Email JSONB support
- `20250113132531_phone_jsonb.sql` - Phone JSONB support
- `20251119000000_us_prosthetix_fields.sql` - US Prosthetix custom fields (business_type, patient_type, etc.)
- `20251121000000_configurable_boards.sql` - Configurable Kanban boards system
- `20251122010000_create_events_table.sql` - Calendar events

## Access Control

RLS policies defined in migrations. The `canAccess` helper in `src/components/atomic-crm/providers/commons/canAccess.ts` checks permissions. Administrators have full access; regular sales users see only their own records.

## Key Files

- `src/App.tsx` - App entry point
- `src/components/atomic-crm/root/CRM.tsx` - Root CRM component
- `src/components/atomic-crm/root/ConfigurationContext.tsx` - Global configuration context
- `src/components/atomic-crm/providers/supabase/dataProvider.ts` - Supabase data provider
- `src/components/atomic-crm/providers/fakerest/dataProvider.ts` - Fake REST data provider
- `src/components/atomic-crm/types.ts` - TypeScript type definitions
- `vite.config.ts` - Vite configuration with Tailwind CSS v4

## Notes

- Node 22 LTS required
- Docker required for local Supabase
- Vite uses path alias `@/` for `src/`
- TypeScript strict mode enabled
- Prettier and ESLint configured with pre-commit checks
- Registry JSON auto-generated for Shadcn component sharing

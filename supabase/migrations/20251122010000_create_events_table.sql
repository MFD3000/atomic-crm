-- US Prosthetix CRM - Calendar Events Migration
-- This migration adds calendar functionality with events table

-- ============================================================================
-- EVENTS TABLE
-- ============================================================================
-- Unified calendar source for tasks, milestones, meetings, and appointments
CREATE TABLE IF NOT EXISTS public.events (
    id bigserial PRIMARY KEY,

    -- Event details
    title text NOT NULL,
    description text,
    event_type text NOT NULL CHECK (event_type IN ('task', 'milestone', 'meeting', 'appointment', 'deadline')),

    -- Date/time fields
    start_datetime timestamp with time zone NOT NULL,
    end_datetime timestamp with time zone,
    all_day boolean DEFAULT false NOT NULL,

    -- Location and status
    location text,
    status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled')),

    -- Optional links to existing entities
    task_id bigint REFERENCES public.tasks(id) ON DELETE CASCADE,
    deal_id bigint REFERENCES public.deals(id) ON DELETE CASCADE,
    contact_id bigint REFERENCES public.contacts(id) ON DELETE SET NULL,
    company_id bigint REFERENCES public.companies(id) ON DELETE SET NULL,
    sales_id bigint NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,

    -- Metadata
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by bigint REFERENCES public.sales(id)
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX events_start_datetime_idx ON public.events (start_datetime);
CREATE INDEX events_end_datetime_idx ON public.events (end_datetime);
CREATE INDEX events_task_id_idx ON public.events (task_id);
CREATE INDEX events_deal_id_idx ON public.events (deal_id);
CREATE INDEX events_contact_id_idx ON public.events (contact_id);
CREATE INDEX events_company_id_idx ON public.events (company_id);
CREATE INDEX events_sales_id_idx ON public.events (sales_id);
CREATE INDEX events_status_idx ON public.events (status);
CREATE INDEX events_event_type_idx ON public.events (event_type);

-- Composite index for common calendar queries
CREATE INDEX events_sales_date_idx ON public.events (sales_id, start_datetime DESC);

-- ============================================================================
-- ADD DEAL_ID TO TASKS TABLE
-- ============================================================================
-- Allow tasks to link to deals (e.g., "Call franchisee about Deal #5")
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS deal_id bigint REFERENCES public.deals(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS tasks_deal_id_idx ON public.tasks (deal_id);

-- ============================================================================
-- RLS POLICIES FOR EVENTS
-- ============================================================================
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Events are viewable by authenticated users
CREATE POLICY "Events are viewable by owners and administrators"
    ON public.events FOR SELECT
    TO authenticated
    USING (
        -- Administrators can see all events
        EXISTS (
            SELECT 1 FROM public.sales s
            WHERE s.user_id = auth.uid()
            AND s.administrator = true
        )
        OR
        -- Sales users can see their own events
        EXISTS (
            SELECT 1 FROM public.sales s
            WHERE s.user_id = auth.uid()
            AND s.id = sales_id
        )
    );

-- Events are creatable by authenticated users
CREATE POLICY "Events are creatable by authenticated users"
    ON public.events FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.sales s
            WHERE s.user_id = auth.uid()
            AND s.id = sales_id
        )
    );

-- Events are updatable by owners and administrators
CREATE POLICY "Events are updatable by owners and administrators"
    ON public.events FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.sales s
            WHERE s.user_id = auth.uid()
            AND s.administrator = true
        )
        OR
        EXISTS (
            SELECT 1 FROM public.sales s
            WHERE s.user_id = auth.uid()
            AND s.id = sales_id
        )
    );

-- Events are deletable by owners and administrators
CREATE POLICY "Events are deletable by owners and administrators"
    ON public.events FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.sales s
            WHERE s.user_id = auth.uid()
            AND s.administrator = true
        )
        OR
        EXISTS (
            SELECT 1 FROM public.sales s
            WHERE s.user_id = auth.uid()
            AND s.id = sales_id
        )
    );

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger to update events.updated_at on modification
CREATE OR REPLACE FUNCTION update_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER events_updated_at_trigger
    BEFORE UPDATE ON public.events
    FOR EACH ROW
    EXECUTE FUNCTION update_events_updated_at();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.events IS 'Calendar events for tasks, milestones, meetings, and appointments';
COMMENT ON COLUMN public.events.event_type IS 'Type of event: task, milestone, meeting, appointment, deadline';
COMMENT ON COLUMN public.events.start_datetime IS 'Event start date and time (required)';
COMMENT ON COLUMN public.events.end_datetime IS 'Event end date and time (optional, null for all-day or single-point events)';
COMMENT ON COLUMN public.events.all_day IS 'Whether this is an all-day event (no specific time)';
COMMENT ON COLUMN public.events.task_id IS 'Optional link to task (CASCADE delete if task is removed)';
COMMENT ON COLUMN public.events.deal_id IS 'Optional link to deal (CASCADE delete if deal is removed)';
COMMENT ON COLUMN public.events.status IS 'Event status: scheduled, confirmed, completed, cancelled';

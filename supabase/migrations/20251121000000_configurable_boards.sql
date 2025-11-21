-- US Prosthetix CRM - Configurable Boards Migration
-- This migration adds support for user-configurable deal boards with custom stages

-- ============================================================================
-- BOARDS TABLE
-- ============================================================================
-- Stores board definitions (collections of stage configurations)
CREATE TABLE IF NOT EXISTS public.boards (
    id bigserial PRIMARY KEY,
    name text NOT NULL,
    description text,
    is_default boolean DEFAULT false,
    position smallint NOT NULL DEFAULT 0,
    created_by bigint REFERENCES public.sales(id),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Only one board can be default
CREATE UNIQUE INDEX boards_single_default_idx ON public.boards (is_default) WHERE is_default = true;

-- Index for ordering boards
CREATE INDEX boards_position_idx ON public.boards (position);

-- Enable RLS
ALTER TABLE public.boards ENABLE ROW LEVEL SECURITY;

-- RLS Policies for boards
CREATE POLICY "Boards are viewable by authenticated users"
    ON public.boards FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Boards are editable by administrators"
    ON public.boards FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.sales
            WHERE sales.user_id = auth.uid()
            AND sales.administrator = true
        )
    );

-- ============================================================================
-- BOARD STAGES TABLE
-- ============================================================================
-- Stores individual stage configurations for each board
CREATE TABLE IF NOT EXISTS public.board_stages (
    id bigserial PRIMARY KEY,
    board_id bigint NOT NULL REFERENCES public.boards(id) ON DELETE CASCADE,
    value text NOT NULL, -- URL-safe identifier (e.g., "inquiry")
    label text NOT NULL, -- Display name (e.g., "Inquiry")
    color text, -- Hex color code for visual differentiation
    position smallint NOT NULL DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT board_stages_unique_value UNIQUE(board_id, value),
    CONSTRAINT board_stages_unique_position UNIQUE(board_id, position)
);

-- Indexes for performance
CREATE INDEX board_stages_board_id_idx ON public.board_stages (board_id);
CREATE INDEX board_stages_position_idx ON public.board_stages (board_id, position);

-- Enable RLS
ALTER TABLE public.board_stages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for board_stages
CREATE POLICY "Board stages are viewable by authenticated users"
    ON public.board_stages FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Board stages are editable by administrators"
    ON public.board_stages FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.sales
            WHERE sales.user_id = auth.uid()
            AND sales.administrator = true
        )
    );

-- ============================================================================
-- BOARD TEMPLATES TABLE
-- ============================================================================
-- Stores predefined board templates for quick setup
CREATE TABLE IF NOT EXISTS public.board_templates (
    id bigserial PRIMARY KEY,
    name text NOT NULL,
    description text,
    stages_json jsonb NOT NULL, -- Array of stage definitions
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.board_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for board_templates (read-only for all users)
CREATE POLICY "Board templates are viewable by authenticated users"
    ON public.board_templates FOR SELECT
    TO authenticated
    USING (true);

-- ============================================================================
-- RECREATE DEALS TABLE WITH BOARD_ID
-- ============================================================================
-- Drop existing deals table (data doesn't need to be preserved)
DROP TABLE IF EXISTS public.deals CASCADE;

-- Recreate deals table with board_id
CREATE TABLE public.deals (
    id bigserial PRIMARY KEY,
    name text NOT NULL,
    company_id bigint REFERENCES public.companies(id) ON DELETE SET NULL,
    contact_ids bigint[] DEFAULT '{}',
    category text,
    stage text NOT NULL,
    board_id bigint NOT NULL REFERENCES public.boards(id) ON DELETE RESTRICT,
    description text,
    amount bigint DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    archived_at timestamp with time zone,
    expected_closing_date timestamp with time zone,
    sales_id bigint REFERENCES public.sales(id) ON DELETE SET NULL,
    index smallint DEFAULT 0,
    CONSTRAINT deals_board_stage_fk FOREIGN KEY (board_id, stage)
        REFERENCES public.board_stages(board_id, value) ON DELETE RESTRICT
);

-- Indexes for performance
CREATE INDEX deals_board_id_idx ON public.deals (board_id);
CREATE INDEX deals_stage_idx ON public.deals (stage);
CREATE INDEX deals_sales_id_idx ON public.deals (sales_id);
CREATE INDEX deals_company_id_idx ON public.deals (company_id);
CREATE INDEX deals_archived_at_idx ON public.deals (archived_at) WHERE archived_at IS NULL;

-- Enable RLS
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for deals
CREATE POLICY "Deals are viewable by authenticated users"
    ON public.deals FOR SELECT
    TO authenticated
    USING (
        -- Administrators can see all deals
        EXISTS (
            SELECT 1 FROM public.sales s
            WHERE s.user_id = auth.uid()
            AND s.administrator = true
        )
        OR
        -- Sales users can see their own deals
        EXISTS (
            SELECT 1 FROM public.sales s
            WHERE s.user_id = auth.uid()
            AND s.id = sales_id
        )
    );

CREATE POLICY "Deals are creatable by authenticated users"
    ON public.deals FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.sales s
            WHERE s.user_id = auth.uid()
            AND s.id = sales_id
        )
    );

CREATE POLICY "Deals are updatable by owners and administrators"
    ON public.deals FOR UPDATE
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

CREATE POLICY "Deals are deletable by owners and administrators"
    ON public.deals FOR DELETE
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
-- SEED DEFAULT BOARD
-- ============================================================================
-- Create default US Prosthetix Pipeline board
INSERT INTO public.boards (name, description, is_default, position)
VALUES ('US Prosthetix Pipeline', 'Standard prosthetics/orthotics workflow', true, 1);

-- Seed stages for default board
INSERT INTO public.board_stages (board_id, value, label, color, position)
VALUES
    (1, 'inquiry', 'Inquiry', '#3b82f6', 1),
    (1, 'assessment', 'Assessment', '#8b5cf6', 2),
    (1, 'fitting', 'Fitting', '#06b6d4', 3),
    (1, 'fabrication', 'Fabrication', '#10b981', 4),
    (1, 'delivery', 'Delivery', '#f59e0b', 5),
    (1, 'follow-up', 'Follow-up', '#ec4899', 6),
    (1, 'won', 'Won', '#22c55e', 7),
    (1, 'lost', 'Lost', '#ef4444', 8);

-- ============================================================================
-- SEED BOARD TEMPLATES
-- ============================================================================

-- Template 1: Simple Pipeline
INSERT INTO public.board_templates (name, description, stages_json)
VALUES (
    'Simple Pipeline',
    'Basic 3-stage pipeline for straightforward sales processes',
    '[
        {"value": "open", "label": "Open", "color": "#3b82f6", "position": 1},
        {"value": "in_progress", "label": "In Progress", "color": "#f59e0b", "position": 2},
        {"value": "closed", "label": "Closed", "color": "#22c55e", "position": 3}
    ]'::jsonb
);

-- Template 2: Franchisee Onboarding
INSERT INTO public.board_templates (name, description, stages_json)
VALUES (
    'Franchisee Onboarding',
    'Complete franchisee acquisition and onboarding workflow',
    '[
        {"value": "lead", "label": "Lead", "color": "#6366f1", "position": 1},
        {"value": "discovery", "label": "Discovery Call", "color": "#8b5cf6", "position": 2},
        {"value": "proposal", "label": "Proposal Sent", "color": "#06b6d4", "position": 3},
        {"value": "contract", "label": "Contract Review", "color": "#10b981", "position": 4},
        {"value": "onboarding", "label": "Onboarding", "color": "#f59e0b", "position": 5},
        {"value": "active", "label": "Active Franchisee", "color": "#22c55e", "position": 6},
        {"value": "lost", "label": "Lost", "color": "#ef4444", "position": 7}
    ]'::jsonb
);

-- Template 3: 51 Oakwood Prospects
INSERT INTO public.board_templates (name, description, stages_json)
VALUES (
    '51 Oakwood Prospects',
    'Billing services pipeline for 51 Oakwood prospect tracking',
    '[
        {"value": "identified", "label": "Identified", "color": "#6366f1", "position": 1},
        {"value": "contacted", "label": "Initial Contact", "color": "#8b5cf6", "position": 2},
        {"value": "qualified", "label": "Qualified", "color": "#06b6d4", "position": 3},
        {"value": "proposal", "label": "Proposal", "color": "#10b981", "position": 4},
        {"value": "contracted", "label": "Contracted", "color": "#f59e0b", "position": 5},
        {"value": "billing_active", "label": "Billing Active", "color": "#22c55e", "position": 6},
        {"value": "lost", "label": "Lost", "color": "#ef4444", "position": 7}
    ]'::jsonb
);

-- ============================================================================
-- BOARD ANALYTICS VIEW
-- ============================================================================
-- Materialized view for board conversion metrics and analytics
CREATE MATERIALIZED VIEW public.deals_board_analytics AS
WITH stage_deals AS (
    SELECT
        d.board_id,
        d.stage,
        bs.label as stage_label,
        bs.position as stage_position,
        COUNT(*) as deal_count,
        SUM(d.amount) as total_amount,
        AVG(d.amount) as avg_amount,
        COUNT(CASE WHEN d.archived_at IS NULL THEN 1 END) as active_count,
        COUNT(CASE WHEN d.stage = 'won' THEN 1 END) as won_count
    FROM public.deals d
    JOIN public.board_stages bs ON d.board_id = bs.board_id AND d.stage = bs.value
    GROUP BY d.board_id, d.stage, bs.label, bs.position
),
board_totals AS (
    SELECT
        board_id,
        SUM(deal_count) as total_deals,
        SUM(total_amount) as total_revenue,
        SUM(won_count) as total_won
    FROM stage_deals
    GROUP BY board_id
)
SELECT
    ROW_NUMBER() OVER (ORDER BY sd.board_id, sd.stage_position) as id,
    sd.board_id,
    b.name as board_name,
    sd.stage,
    sd.stage_label,
    sd.stage_position,
    sd.deal_count,
    sd.active_count,
    sd.total_amount,
    sd.avg_amount,
    sd.won_count,
    bt.total_deals,
    bt.total_revenue,
    bt.total_won,
    CASE
        WHEN bt.total_deals > 0
        THEN ROUND((sd.deal_count::numeric / bt.total_deals::numeric) * 100, 2)
        ELSE 0
    END as stage_percentage,
    CASE
        WHEN bt.total_deals > 0
        THEN ROUND((sd.won_count::numeric / bt.total_deals::numeric) * 100, 2)
        ELSE 0
    END as win_rate_from_stage
FROM stage_deals sd
JOIN boards b ON sd.board_id = b.id
JOIN board_totals bt ON sd.board_id = bt.board_id
ORDER BY sd.board_id, sd.stage_position;

-- Create unique index on materialized view (required for concurrent refresh)
CREATE UNIQUE INDEX deals_board_analytics_board_stage_idx ON public.deals_board_analytics (board_id, stage);
CREATE INDEX deals_board_analytics_board_id_idx ON public.deals_board_analytics (board_id);

-- Grant select on materialized view
ALTER MATERIALIZED VIEW public.deals_board_analytics OWNER TO postgres;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger to update deals.updated_at on modification
CREATE OR REPLACE FUNCTION update_deals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER deals_updated_at_trigger
    BEFORE UPDATE ON public.deals
    FOR EACH ROW
    EXECUTE FUNCTION update_deals_updated_at();

-- Trigger to update boards.updated_at on modification
CREATE OR REPLACE FUNCTION update_boards_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER boards_updated_at_trigger
    BEFORE UPDATE ON public.boards
    FOR EACH ROW
    EXECUTE FUNCTION update_boards_updated_at();

-- Trigger to refresh analytics view when deals change
CREATE OR REPLACE FUNCTION refresh_deals_board_analytics()
RETURNS TRIGGER AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.deals_board_analytics;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER refresh_analytics_on_deal_change
    AFTER INSERT OR UPDATE OR DELETE ON public.deals
    FOR EACH STATEMENT
    EXECUTE FUNCTION refresh_deals_board_analytics();

-- ============================================================================
-- RECREATE DROPPED VIEWS
-- ============================================================================
-- The companies_summary view was dropped when we recreated the deals table with CASCADE
-- We need to recreate it to avoid errors in the companies list

CREATE VIEW public.companies_summary
    WITH (security_invoker=on)
    AS
SELECT
    c.*,
    COUNT(DISTINCT d.id) AS nb_deals,
    COUNT(DISTINCT co.id) AS nb_contacts
FROM
    public.companies c
LEFT JOIN
    public.deals d ON c.id = d.company_id
LEFT JOIN
    public.contacts co ON c.id = co.company_id
GROUP BY
    c.id;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.boards IS 'Board configurations for organizing deals with custom stages';
COMMENT ON TABLE public.board_stages IS 'Stage definitions for each board (columns in Kanban view)';
COMMENT ON TABLE public.board_templates IS 'Predefined board templates for quick setup';
COMMENT ON TABLE public.deals IS 'Sales opportunities with board assignment';
COMMENT ON MATERIALIZED VIEW public.deals_board_analytics IS 'Aggregated analytics for board performance and conversion metrics';
COMMENT ON VIEW public.companies_summary IS 'Companies with aggregated deal and contact counts';

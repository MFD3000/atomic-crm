-- Allow any user to create boards and board stages
-- This migration updates RLS policies to enable collaborative board creation

-- ============================================================================
-- DROP OLD RESTRICTIVE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Boards are editable by administrators" ON public.boards;
DROP POLICY IF EXISTS "Board stages are editable by administrators" ON public.board_stages;

-- ============================================================================
-- BOARDS POLICIES - Allow creation by all users
-- ============================================================================

-- Any authenticated user can create a board
CREATE POLICY "Boards are creatable by authenticated users"
    ON public.boards FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.sales
            WHERE sales.user_id = auth.uid()
        )
    );

-- Boards can be updated by administrators or the creator
CREATE POLICY "Boards are updatable by administrators or creator"
    ON public.boards FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.sales
            WHERE sales.user_id = auth.uid()
            AND (sales.administrator = true OR sales.id = created_by)
        )
    );

-- Boards can be deleted by administrators or the creator
CREATE POLICY "Boards are deletable by administrators or creator"
    ON public.boards FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.sales
            WHERE sales.user_id = auth.uid()
            AND (sales.administrator = true OR sales.id = created_by)
        )
    );

-- ============================================================================
-- BOARD STAGES POLICIES - Allow management alongside board creation
-- ============================================================================

-- Any authenticated user can create board stages
CREATE POLICY "Board stages are creatable by authenticated users"
    ON public.board_stages FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.sales
            WHERE sales.user_id = auth.uid()
        )
    );

-- Board stages can be updated by administrators or the board creator
CREATE POLICY "Board stages are updatable by administrators or board creator"
    ON public.board_stages FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.sales s
            JOIN public.boards b ON b.id = board_id
            WHERE s.user_id = auth.uid()
            AND (s.administrator = true OR b.created_by = s.id)
        )
    );

-- Board stages can be deleted by administrators or the board creator
CREATE POLICY "Board stages are deletable by administrators or board creator"
    ON public.board_stages FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.sales s
            JOIN public.boards b ON b.id = board_id
            WHERE s.user_id = auth.uid()
            AND (s.administrator = true OR b.created_by = s.id)
        )
    );

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON POLICY "Boards are creatable by authenticated users" ON public.boards IS
    'Allow any authenticated user to create boards for collaborative workflow management';

COMMENT ON POLICY "Boards are updatable by administrators or creator" ON public.boards IS
    'Board creators and administrators can update board details';

COMMENT ON POLICY "Boards are deletable by administrators or creator" ON public.boards IS
    'Board creators and administrators can delete boards';

COMMENT ON POLICY "Board stages are creatable by authenticated users" ON public.board_stages IS
    'Allow any authenticated user to create stages when creating boards';

COMMENT ON POLICY "Board stages are updatable by administrators or board creator" ON public.board_stages IS
    'Board creators and administrators can update stages';

COMMENT ON POLICY "Board stages are deletable by administrators or board creator" ON public.board_stages IS
    'Board creators and administrators can delete stages';

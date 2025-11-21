-- ============================================================================
-- US Prosthetix CRM - Seed Data
-- ============================================================================
-- This seed script creates initial data for development
-- Run automatically after migrations during `supabase db reset`

-- ============================================================================
-- USER: Dan Capri (Administrator)
-- ============================================================================
-- Create auth user (password: Tobydog1!)
-- The handle_new_user() trigger will automatically create the sales record
INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change
)
VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'danieljcapri@gmail.com',
    crypt('Tobydog1!', gen_salt('bf')), -- Password: Tobydog1!
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"first_name":"Dan","last_name":"Capri"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
);

-- Get the sales_id for Dan (will be id=1 since he's the first user and becomes admin)
-- The trigger already created the sales record

-- ============================================================================
-- COMPANY: US Prosthetix
-- ============================================================================
INSERT INTO public.companies (
    name,
    logo,
    sector,
    size,
    website,
    linkedin_url,
    address,
    city,
    "stateAbbr",
    zipcode,
    phone_number,
    created_at
)
VALUES (
    'US Prosthetix',
    '{"src":"https://via.placeholder.com/150?text=USP"}', -- Logo as JSONB
    'Healthcare',
    50, -- Company size
    'https://usprosthetix.com',
    'https://linkedin.com/company/usprosthetix',
    '123 Medical Plaza',
    'Phoenix',
    'AZ',
    '85001',
    '+16025551234', -- Phone as text
    NOW()
);

-- ============================================================================
-- CONTACT: Preston Newbold (Founder at US Prosthetix)
-- ============================================================================
INSERT INTO public.contacts (
    first_name,
    last_name,
    gender,
    title,
    company_id,
    email_jsonb,
    phone_jsonb,
    background,
    avatar,
    first_seen,
    last_seen,
    has_newsletter,
    status,
    tags
)
VALUES (
    'Preston',
    'Newbold',
    'male',
    'Founder',
    1, -- US Prosthetix company_id
    '[{"email":"preston@usprosthetix.com","type":"Work"}]'::jsonb,
    '[{"number":"+16025559999","type":"Mobile"}]'::jsonb,
    'Founder of US Prosthetix, leading prosthetics and orthotics provider',
    '{"src":"https://i.pravatar.cc/150?u=prestonnewbold"}'::jsonb,
    NOW(),
    NOW(),
    true,
    'hot',
    ARRAY[]::bigint[] -- Empty tags array (tags are stored as IDs)
);

-- ============================================================================
-- SAMPLE DEAL: Initial Consultation
-- ============================================================================
INSERT INTO public.deals (
    name,
    company_id,
    contact_ids,
    category,
    stage,
    board_id,
    description,
    amount,
    expected_closing_date,
    sales_id,
    index,
    created_at,
    updated_at
)
VALUES (
    'Initial Consultation - Lower Limb Prosthetic',
    1, -- US Prosthetix
    ARRAY[1], -- Preston Newbold
    'Prosthetics',
    'inquiry', -- First stage of default board
    1, -- US Prosthetix Pipeline board
    'Initial consultation for custom lower limb prosthetic device. Patient requires transfemoral prosthesis.',
    1500000, -- $15,000.00 (stored in cents)
    NOW() + INTERVAL '30 days',
    1, -- Dan Capri (sales_id)
    0,
    NOW(),
    NOW()
);

-- ============================================================================
-- SAMPLE NOTE: Deal Note
-- ============================================================================
INSERT INTO public."dealNotes" (
    deal_id,
    text,
    type,
    sales_id,
    date
)
VALUES (
    1, -- Initial Consultation deal
    'Spoke with Preston about patient needs. Scheduling fitting appointment for next week.',
    'Email', -- Type of note
    1, -- Dan Capri
    NOW()
);

-- ============================================================================
-- SAMPLE TASK: Follow-up
-- ============================================================================
INSERT INTO public.tasks (
    contact_id,
    type,
    text,
    due_date,
    sales_id
)
VALUES (
    1, -- Preston Newbold
    'Call',
    'Follow up on initial consultation and confirm fitting appointment',
    NOW() + INTERVAL '3 days',
    1 -- Dan Capri
);

-- ============================================================================
-- Refresh materialized view to show analytics
-- ============================================================================
REFRESH MATERIALIZED VIEW public.deals_board_analytics;

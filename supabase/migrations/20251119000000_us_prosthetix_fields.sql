-- US Prosthetix Specific Fields Migration
-- Adds business type tracking, patient types, and 51 Oakwood billing integration

-- Drop views that depend on companies and contacts tables
DROP VIEW IF EXISTS companies_summary;
DROP VIEW IF EXISTS contacts_summary;

-- Create ENUM types for business classification
CREATE TYPE business_type AS ENUM ('franchisee', 'patient', 'doctor', 'supplier', 'other');
CREATE TYPE patient_type AS ENUM ('prosthetics', 'orthotics', 'both');

-- Add business type fields to companies table
ALTER TABLE companies ADD COLUMN business_type business_type DEFAULT 'other';
ALTER TABLE companies ADD COLUMN is_oakwood_prospect BOOLEAN DEFAULT false;
ALTER TABLE companies ADD COLUMN oakwood_billing_code TEXT;

-- Add patient type fields to contacts table
ALTER TABLE contacts ADD COLUMN patient_type patient_type;
ALTER TABLE contacts ADD COLUMN referring_doctor TEXT;

-- Create indexes for filtering
CREATE INDEX idx_companies_business_type ON companies(business_type);
CREATE INDEX idx_companies_oakwood_prospect ON companies(is_oakwood_prospect) WHERE is_oakwood_prospect = true;
CREATE INDEX idx_contacts_patient_type ON contacts(patient_type);

-- Recreate companies_summary view with new fields
CREATE VIEW companies_summary
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

-- Recreate contacts_summary view with new fields
CREATE VIEW contacts_summary
  WITH (security_invoker=on)
AS
SELECT
  co.*,
  c.name AS company_name,
  COUNT(DISTINCT t.id) AS nb_tasks
FROM
  public.contacts co
LEFT JOIN
  public.tasks t ON co.id = t.contact_id
LEFT JOIN
  public.companies c ON co.company_id = c.id
GROUP BY
  co.id, c.name;

-- Add comments for documentation
COMMENT ON COLUMN companies.business_type IS 'Type of business entity: franchisee, patient, doctor, supplier, or other';
COMMENT ON COLUMN companies.is_oakwood_prospect IS 'Whether this company is a 51 Oakwood billing prospect';
COMMENT ON COLUMN companies.oakwood_billing_code IS 'Billing code for 51 Oakwood integration';
COMMENT ON COLUMN contacts.patient_type IS 'Type of patient: prosthetics, orthotics, or both';
COMMENT ON COLUMN contacts.referring_doctor IS 'Name of referring doctor for patient contacts';

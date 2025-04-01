-- Drop the foreign key constraint from analysis_results table
ALTER TABLE analysis_results DROP CONSTRAINT IF EXISTS analysis_results_document_id_fkey;

-- Make document_id nullable
ALTER TABLE analysis_results ALTER COLUMN document_id DROP NOT NULL;

-- Comment out the following line if you want to completely remove the column
-- ALTER TABLE analysis_results DROP COLUMN document_id; 
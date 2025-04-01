-- Add a new column to the analysis_results table to link to work_documents
ALTER TABLE analysis_results
ADD COLUMN work_document_id UUID REFERENCES work_documents(id);

-- Create an index for performance
CREATE INDEX idx_analysis_results_work_document_id 
ON analysis_results(work_document_id);

-- Update the RLS policies to include the new column
CREATE POLICY "Users can select analysis results linked to their work documents" 
ON analysis_results
FOR SELECT
USING (
  auth.uid() = user_id OR 
  auth.uid() IN (
    SELECT user_id FROM work_documents 
    WHERE id = analysis_results.work_document_id
  )
); 
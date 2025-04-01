-- Fix for the analysis_results table structure
-- Run this in your Supabase SQL editor

-- First check analysis_results table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'analysis_results';

-- Add missing columns to analysis_results table
ALTER TABLE analysis_results ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'work_auto';
ALTER TABLE analysis_results ADD COLUMN IF NOT EXISTS source_label TEXT DEFAULT 'Analysis from Work Auto';
ALTER TABLE analysis_results ADD COLUMN IF NOT EXISTS document_id UUID REFERENCES work_documents(id);
ALTER TABLE analysis_results ADD COLUMN IF NOT EXISTS analysis_type TEXT;
ALTER TABLE analysis_results ADD COLUMN IF NOT EXISTS analysis_data JSONB;
ALTER TABLE analysis_results ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE analysis_results ADD COLUMN IF NOT EXISTS error_message TEXT;
ALTER TABLE analysis_results ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW());
ALTER TABLE analysis_results ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW());

-- Make sure RLS is enabled
ALTER TABLE analysis_results ENABLE ROW LEVEL SECURITY;

-- Clean up existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own analysis results" ON analysis_results;
DROP POLICY IF EXISTS "Users can insert their own analysis results" ON analysis_results;
DROP POLICY IF EXISTS "Users can update their own analysis results" ON analysis_results;
DROP POLICY IF EXISTS "Users can delete their own analysis results" ON analysis_results;

-- Create proper policies
CREATE POLICY "Users can view their own analysis results"
  ON analysis_results FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analysis results"
  ON analysis_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analysis results"
  ON analysis_results FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analysis results"
  ON analysis_results FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_analysis_results_user_id ON analysis_results(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_results_document_id ON analysis_results(document_id);
CREATE INDEX IF NOT EXISTS idx_analysis_results_source ON analysis_results(source);

-- Finally, check all policies on the analysis_results table
SELECT * FROM pg_policies WHERE tablename = 'analysis_results'; 
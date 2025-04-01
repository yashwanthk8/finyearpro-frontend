-- Fix for the work_documents table structure
-- Run this in your Supabase SQL editor

-- First check work_documents table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'work_documents';

-- Add missing columns to work_documents table
ALTER TABLE work_documents ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'work_auto';
ALTER TABLE work_documents ADD COLUMN IF NOT EXISTS source_label TEXT DEFAULT 'Uploaded from Work Auto';
ALTER TABLE work_documents ADD COLUMN IF NOT EXISTS file_type TEXT;
ALTER TABLE work_documents ADD COLUMN IF NOT EXISTS file_extension TEXT;
ALTER TABLE work_documents ADD COLUMN IF NOT EXISTS file_size BIGINT;
ALTER TABLE work_documents ADD COLUMN IF NOT EXISTS file_url TEXT;
ALTER TABLE work_documents ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE work_documents ADD COLUMN IF NOT EXISTS has_analysis BOOLEAN DEFAULT false;

-- Make sure RLS is enabled
ALTER TABLE work_documents ENABLE ROW LEVEL SECURITY;

-- Clean up existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own work documents" ON work_documents;
DROP POLICY IF EXISTS "Users can insert their own work documents" ON work_documents;
DROP POLICY IF EXISTS "Users can update their own work documents" ON work_documents;
DROP POLICY IF EXISTS "Users can delete their own work documents" ON work_documents;

-- Create proper policies
CREATE POLICY "Users can view their own work documents"
  ON work_documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own work documents"
  ON work_documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own work documents"
  ON work_documents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own work documents"
  ON work_documents FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_work_documents_user_id ON work_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_work_documents_source ON work_documents(source);

-- Finally, check all policies on the work_documents table
SELECT * FROM pg_policies WHERE tablename = 'work_documents'; 
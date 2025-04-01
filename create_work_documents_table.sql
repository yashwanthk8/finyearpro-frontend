-- Create the work_documents table
CREATE TABLE IF NOT EXISTS work_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS (Row Level Security) policies
ALTER TABLE work_documents ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to only see their own documents
CREATE POLICY "Users can only view their own work documents"
  ON work_documents
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own documents
CREATE POLICY "Users can insert their own work documents"
  ON work_documents
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own documents
CREATE POLICY "Users can update their own work documents"
  ON work_documents
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own documents
CREATE POLICY "Users can delete their own work documents"
  ON work_documents
  FOR DELETE
  USING (auth.uid() = user_id);

-- Enable Realtime for this table
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;

ALTER PUBLICATION supabase_realtime ADD TABLE work_documents; 
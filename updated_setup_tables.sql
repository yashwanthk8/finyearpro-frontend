-- Create documents table if it doesn't exist with all fields our code is using
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT,
  filename TEXT,
  file_type TEXT,
  file_size BIGINT,
  file_extension TEXT,
  file_url TEXT,
  description TEXT,
  source TEXT DEFAULT 'auto_form',
  source_label TEXT DEFAULT 'Uploaded from Auto Form',
  has_analysis BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create work_documents table if it doesn't exist, without has_analysis field
CREATE TABLE IF NOT EXISTS work_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  source TEXT DEFAULT 'work_auto',
  source_label TEXT DEFAULT 'Uploaded from Work Auto',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  file_type TEXT
);

-- Create analysis_results table if it doesn't exist
CREATE TABLE IF NOT EXISTS analysis_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  work_document_id UUID REFERENCES work_documents(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  chart_config JSONB,
  statistics JSONB,
  insights JSONB,
  source TEXT DEFAULT 'work_auto',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up Row Level Security
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_results ENABLE ROW LEVEL SECURITY;

-- Create policies for documents
DROP POLICY IF EXISTS "Users can view their own documents" ON documents;
CREATE POLICY "Users can view their own documents"
  ON documents FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own documents" ON documents;  
CREATE POLICY "Users can insert their own documents"
  ON documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policies for work_documents
DROP POLICY IF EXISTS "Users can view their own work documents" ON work_documents;
CREATE POLICY "Users can view their own work documents"
  ON work_documents FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own work documents" ON work_documents;
CREATE POLICY "Users can insert their own work documents"
  ON work_documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policies for analysis_results
DROP POLICY IF EXISTS "Users can view their own analyses" ON analysis_results;
CREATE POLICY "Users can view their own analyses"
  ON analysis_results FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own analyses" ON analysis_results;
CREATE POLICY "Users can insert their own analyses"
  ON analysis_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add additional policies for update and delete if needed
CREATE POLICY "Users can update their own documents"
  ON documents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents"
  ON documents FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own work documents"
  ON work_documents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own work documents"
  ON work_documents FOR DELETE
  USING (auth.uid() = user_id);

-- Enable realtime for all tables (commented out in case you don't have permission)
-- BEGIN;
--   ALTER PUBLICATION supabase_realtime ADD TABLE documents;
--   ALTER PUBLICATION supabase_realtime ADD TABLE work_documents;
--   ALTER PUBLICATION supabase_realtime ADD TABLE analysis_results;
-- COMMIT;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_work_documents_user_id ON work_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_results_user_id ON analysis_results(user_id); 
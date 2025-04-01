-- Create documents table if it doesn't exist
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT,
  filename TEXT,
  file_type TEXT,
  file_size BIGINT,
  file_extension TEXT,
  description TEXT,
  source TEXT DEFAULT 'auto_form',
  source_label TEXT DEFAULT 'Uploaded from Auto Form',
  has_analysis BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create work_documents table if it doesn't exist
CREATE TABLE IF NOT EXISTS work_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  source TEXT DEFAULT 'work_auto',
  source_label TEXT DEFAULT 'Uploaded from Work Auto',
  has_analysis BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
CREATE POLICY IF NOT EXISTS "Users can view their own documents"
  ON documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert their own documents"
  ON documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policies for work_documents
CREATE POLICY IF NOT EXISTS "Users can view their own work documents"
  ON work_documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert their own work documents"
  ON work_documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policies for analysis_results
CREATE POLICY IF NOT EXISTS "Users can view their own analyses"
  ON analysis_results FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert their own analyses"
  ON analysis_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Enable realtime for all tables
BEGIN;
  ALTER PUBLICATION supabase_realtime ADD TABLE documents;
  ALTER PUBLICATION supabase_realtime ADD TABLE work_documents;
  ALTER PUBLICATION supabase_realtime ADD TABLE analysis_results;
COMMIT; 
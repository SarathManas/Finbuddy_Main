
-- Add RLS policies for AI processing tables (with proper handling of existing policies)
ALTER TABLE ai_processing_queue ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies to ensure they're correct
DROP POLICY IF EXISTS "Users can view their document processing queue" ON ai_processing_queue;
DROP POLICY IF EXISTS "System can manage processing queue" ON ai_processing_queue;

CREATE POLICY "Users can view their document processing queue"
ON ai_processing_queue FOR SELECT
USING (
  document_id IN (
    SELECT id FROM documents WHERE user_id = auth.uid()
  )
);

CREATE POLICY "System can manage processing queue"
ON ai_processing_queue FOR ALL
USING (true)
WITH CHECK (true);

ALTER TABLE ai_financial_insights ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies to ensure they're correct
DROP POLICY IF EXISTS "Users can view their own insights" ON ai_financial_insights;
DROP POLICY IF EXISTS "Users can update their own insights" ON ai_financial_insights;

CREATE POLICY "Users can view their own insights"
ON ai_financial_insights FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own insights"
ON ai_financial_insights FOR UPDATE
USING (user_id = auth.uid());

-- Enable realtime for AI processing updates
ALTER TABLE ai_processing_queue REPLICA IDENTITY FULL;
ALTER TABLE documents REPLICA IDENTITY FULL;
ALTER TABLE ai_financial_insights REPLICA IDENTITY FULL;

-- Add tables to realtime publication (only if not already added)
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE ai_processing_queue;
  EXCEPTION WHEN duplicate_object THEN
    -- Table already in publication, skip
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE documents;
  EXCEPTION WHEN duplicate_object THEN
    -- Table already in publication, skip
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE ai_financial_insights;
  EXCEPTION WHEN duplicate_object THEN
    -- Table already in publication, skip
  END;
END
$$;

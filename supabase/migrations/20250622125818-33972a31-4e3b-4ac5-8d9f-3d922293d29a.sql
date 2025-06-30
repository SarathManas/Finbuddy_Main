
-- Add AI processing fields to documents table
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS ai_processing_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS ai_confidence_score NUMERIC,
ADD COLUMN IF NOT EXISTS ai_suggestions JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS auto_filled_fields JSONB DEFAULT '{}';

-- Create AI processing queue table
CREATE TABLE IF NOT EXISTS ai_processing_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  processing_type TEXT NOT NULL, -- 'ocr', 'data_extraction', 'categorization'
  status TEXT DEFAULT 'queued', -- 'queued', 'processing', 'completed', 'failed'
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  result JSONB
);

-- Create index for efficient queue processing
CREATE INDEX IF NOT EXISTS idx_ai_processing_queue_status_priority 
ON ai_processing_queue(status, priority DESC, created_at);

-- Create AI insights table for financial analysis
CREATE TABLE IF NOT EXISTS ai_financial_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  insight_type TEXT NOT NULL, -- 'expense_pattern', 'revenue_trend', 'cash_flow_prediction'
  title TEXT NOT NULL,
  description TEXT,
  confidence_score NUMERIC,
  data JSONB,
  action_items TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_dismissed BOOLEAN DEFAULT FALSE
);

-- Enable RLS on new tables
ALTER TABLE ai_processing_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_financial_insights ENABLE ROW LEVEL SECURITY;

-- RLS policies for ai_processing_queue (admin/system access only)
CREATE POLICY "System can manage AI processing queue" ON ai_processing_queue
  FOR ALL USING (true);

-- RLS policies for ai_financial_insights
CREATE POLICY "Users can view their own insights" ON ai_financial_insights
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own insights" ON ai_financial_insights
  FOR UPDATE USING (auth.uid() = user_id);

-- Add trigger to automatically queue documents for AI processing
CREATE OR REPLACE FUNCTION queue_document_for_ai_processing()
RETURNS TRIGGER AS $$
BEGIN
  -- Queue for OCR and data extraction
  INSERT INTO ai_processing_queue (document_id, processing_type, priority)
  VALUES 
    (NEW.id, 'ocr', 1),
    (NEW.id, 'data_extraction', 2),
    (NEW.id, 'categorization', 3);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_queue_ai_processing
  AFTER INSERT ON documents
  FOR EACH ROW EXECUTE FUNCTION queue_document_for_ai_processing();

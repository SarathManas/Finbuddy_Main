
-- Check if the documents bucket exists and create it only if it doesn't
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'documents') THEN
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES (
          'documents',
          'documents',
          false,
          52428800, -- 50MB limit
          ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/plain', 'text/csv']
        );
    END IF;
END $$;

-- Create RLS policies for the documents bucket (only if they don't exist)
DO $$
BEGIN
    -- Check and create upload policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Users can upload their own documents'
    ) THEN
        CREATE POLICY "Users can upload their own documents" ON storage.objects
          FOR INSERT WITH CHECK (
            bucket_id = 'documents' AND 
            auth.uid() IS NOT NULL AND
            (storage.foldername(name))[1] = auth.uid()::text
          );
    END IF;

    -- Check and create view policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Users can view their own documents'
    ) THEN
        CREATE POLICY "Users can view their own documents" ON storage.objects
          FOR SELECT USING (
            bucket_id = 'documents' AND 
            auth.uid() IS NOT NULL AND
            (storage.foldername(name))[1] = auth.uid()::text
          );
    END IF;

    -- Check and create update policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Users can update their own documents'
    ) THEN
        CREATE POLICY "Users can update their own documents" ON storage.objects
          FOR UPDATE USING (
            bucket_id = 'documents' AND 
            auth.uid() IS NOT NULL AND
            (storage.foldername(name))[1] = auth.uid()::text
          );
    END IF;

    -- Check and create delete policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Users can delete their own documents'
    ) THEN
        CREATE POLICY "Users can delete their own documents" ON storage.objects
          FOR DELETE USING (
            bucket_id = 'documents' AND 
            auth.uid() IS NOT NULL AND
            (storage.foldername(name))[1] = auth.uid()::text
          );
    END IF;
END $$;

-- Add full-text search capabilities to documents table
ALTER TABLE documents ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create function to update search vector
CREATE OR REPLACE FUNCTION update_documents_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', 
    COALESCE(NEW.file_name, '') || ' ' ||
    COALESCE(array_to_string(NEW.tags, ' '), '') || ' ' ||
    COALESCE(NEW.extracted_data->>'ocr_text', '') || ' ' ||
    COALESCE(NEW.ai_suggestions->>'vendor_name', '') || ' ' ||
    COALESCE(NEW.ai_suggestions->>'merchant_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update search vector
DROP TRIGGER IF EXISTS trigger_update_documents_search_vector ON documents;
CREATE TRIGGER trigger_update_documents_search_vector
  BEFORE INSERT OR UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_documents_search_vector();

-- Create index for full-text search
CREATE INDEX IF NOT EXISTS idx_documents_search_vector ON documents USING gin(search_vector);

-- Update existing documents with search vectors
UPDATE documents SET search_vector = to_tsvector('english', 
  COALESCE(file_name, '') || ' ' ||
  COALESCE(array_to_string(tags, ' '), '') || ' ' ||
  COALESCE(extracted_data->>'ocr_text', '') || ' ' ||
  COALESCE(ai_suggestions->>'vendor_name', '') || ' ' ||
  COALESCE(ai_suggestions->>'merchant_name', '')
) WHERE search_vector IS NULL;

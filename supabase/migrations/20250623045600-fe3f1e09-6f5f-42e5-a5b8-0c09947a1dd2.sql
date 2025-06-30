
-- Complete cleanup of all document-related infrastructure (Safe version)

-- Drop document-related tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS public.document_comments CASCADE;
DROP TABLE IF EXISTS public.document_versions CASCADE;
DROP TABLE IF EXISTS public.ai_processing_queue CASCADE;
DROP TABLE IF EXISTS public.ai_financial_insights CASCADE;
DROP TABLE IF EXISTS public.documents CASCADE;

-- Drop custom document types if they exist
DROP TYPE IF EXISTS public.document_status CASCADE;
DROP TYPE IF EXISTS public.document_type CASCADE;

-- Drop document-related functions if they exist
DROP FUNCTION IF EXISTS public.queue_document_for_ai_processing() CASCADE;
DROP FUNCTION IF EXISTS public.update_documents_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.update_documents_search_vector() CASCADE;

-- Clean up storage bucket and all its policies (only if bucket exists)
DO $$
BEGIN
  -- Delete objects if bucket exists
  IF EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'documents') THEN
    DELETE FROM storage.objects WHERE bucket_id = 'documents';
    DELETE FROM storage.buckets WHERE id = 'documents';
  END IF;
END
$$;

-- Drop storage policies if they exist (these won't fail if policies don't exist)
DROP POLICY IF EXISTS "Users can upload their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own documents" ON storage.objects;

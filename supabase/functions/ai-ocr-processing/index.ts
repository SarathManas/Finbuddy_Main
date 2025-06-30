
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('=== OCR PROCESSING START ===');

    const body = await req.json().catch(() => ({}));
    const { documentId } = body;

    let queueQuery = supabase
      .from('ai_processing_queue')
      .select('*, documents(*)')
      .eq('processing_type', 'ocr')
      .eq('status', 'queued')
      .order('priority', { ascending: true })
      .order('created_at', { ascending: true });

    // If specific document ID provided, filter by it
    if (documentId) {
      queueQuery = queueQuery.eq('document_id', documentId);
    }

    const { data: queueItem, error: queueError } = await queueQuery.limit(1).single();

    if (queueError || !queueItem) {
      console.log('No OCR jobs in queue for:', documentId || 'any document');
      return new Response(JSON.stringify({ 
        message: 'No jobs to process',
        documentId: documentId || null
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Processing OCR for document:', queueItem.document_id);

    // Update status to processing
    await supabase
      .from('ai_processing_queue')
      .update({ 
        status: 'processing', 
        started_at: new Date().toISOString() 
      })
      .eq('id', queueItem.id);

    try {
      // Check if document has already been converted
      const existingContent = queueItem.documents.extracted_data?.converted_content;
      
      if (existingContent) {
        console.log('Using existing converted content');
        // Use the converted content
        const extractedText = extractTextFromConvertedContent(existingContent);
        
        // Update queue item with result
        await supabase
          .from('ai_processing_queue')
          .update({ 
            status: 'completed',
            completed_at: new Date().toISOString(),
            result: { extracted_text: extractedText, source: 'converted_content' }
          })
          .eq('id', queueItem.id);

        // Update document with OCR result
        const { error: docUpdateError } = await supabase
          .from('documents')
          .update({
            extracted_data: { 
              ...queueItem.documents.extracted_data,
              ocr_text: extractedText 
            },
            ai_processing_status: 'processing'
          })
          .eq('id', queueItem.document_id);

        if (docUpdateError) {
          console.error('Error updating document:', docUpdateError);
        }

        return new Response(JSON.stringify({ 
          success: true, 
          document_id: queueItem.document_id,
          extracted_text_length: extractedText.length,
          queue_item_id: queueItem.id,
          source: 'converted_content'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // If not converted yet, try the document converter first
      console.log('Converting document using new converter...');
      
      try {
        const converterResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/ai-document-converter`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ documentId: queueItem.document_id })
        });

        if (converterResponse.ok) {
          const converterResult = await converterResponse.json();
          console.log('Document converted successfully:', converterResult);

          // Get the updated document with converted content
          const { data: updatedDoc } = await supabase
            .from('documents')
            .select('extracted_data')
            .eq('id', queueItem.document_id)
            .single();

          if (updatedDoc?.extracted_data?.converted_content) {
            const extractedText = extractTextFromConvertedContent(updatedDoc.extracted_data.converted_content);
            
            // Update queue item with result
            await supabase
              .from('ai_processing_queue')
              .update({ 
                status: 'completed',
                completed_at: new Date().toISOString(),
                result: { extracted_text: extractedText, source: 'converter' }
              })
              .eq('id', queueItem.id);

            // Update document with OCR result
            await supabase
              .from('documents')
              .update({
                extracted_data: { 
                  ...updatedDoc.extracted_data,
                  ocr_text: extractedText 
                },
                ai_processing_status: 'processing'
              })
              .eq('id', queueItem.document_id);

            return new Response(JSON.stringify({ 
              success: true, 
              document_id: queueItem.document_id,
              extracted_text_length: extractedText.length,
              queue_item_id: queueItem.id,
              source: 'converter'
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
        }
      } catch (converterError) {
        console.warn('Document converter failed, falling back to legacy OCR:', converterError);
      }

      // Fallback to legacy OCR for images only
      const fileType = queueItem.documents.file_type?.toLowerCase() || '';
      
      if (!fileType.includes('image')) {
        throw new Error(`File type ${fileType} not supported by legacy OCR. Document converter failed.`);
      }

      // Get signed URL for the document
      const { data: urlData } = await supabase.storage
        .from('documents')
        .createSignedUrl(queueItem.documents.storage_path, 3600);

      if (!urlData?.signedUrl) {
        throw new Error('Could not get document URL');
      }

      console.log('Using legacy OCR for image file');

      // Use OpenAI Vision API for OCR (images only)
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'You are an OCR expert. Extract all text from the image accurately, maintaining formatting where possible. Return only the extracted text without any additional commentary.'
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Please extract all text from this document image.'
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: urlData.signedUrl
                  }
                }
              ]
            }
          ],
          max_tokens: 4000
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const extractedText = data.choices[0]?.message?.content || '';

      console.log('Legacy OCR extraction completed, text length:', extractedText.length);

      // Update queue item with result
      await supabase
        .from('ai_processing_queue')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString(),
          result: { extracted_text: extractedText, source: 'legacy_ocr' }
        })
        .eq('id', queueItem.id);

      // Update document with OCR result
      const { error: docUpdateError } = await supabase
        .from('documents')
        .update({
          extracted_data: { ocr_text: extractedText },
          ai_processing_status: 'processing'
        })
        .eq('id', queueItem.document_id);

      if (docUpdateError) {
        console.error('Error updating document:', docUpdateError);
      }

      console.log(`OCR completed successfully for document ${queueItem.document_id}`);

      return new Response(JSON.stringify({ 
        success: true, 
        document_id: queueItem.document_id,
        extracted_text_length: extractedText.length,
        queue_item_id: queueItem.id,
        source: 'legacy_ocr'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (processingError) {
      console.error('OCR processing failed:', processingError);
      
      // Mark as failed
      await supabase
        .from('ai_processing_queue')
        .update({ 
          status: 'failed',
          completed_at: new Date().toISOString(),
          error_message: processingError.message
        })
        .eq('id', queueItem.id);

      throw processingError;
    }

  } catch (error) {
    console.error('OCR processing error:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function extractTextFromConvertedContent(convertedContent: any): string {
  if (!convertedContent) return '';
  
  // Extract text from the converted content structure
  let extractedText = convertedContent.content || '';
  
  // If there's structured data, extract text from it too
  if (convertedContent.structured_data?.text_blocks) {
    const additionalText = convertedContent.structured_data.text_blocks
      .map((block: any) => block.content)
      .join('\n');
    extractedText = extractedText + '\n' + additionalText;
  }
  
  // If there are tables, convert them to text
  if (convertedContent.structured_data?.tables) {
    const tableText = convertedContent.structured_data.tables
      .map((table: any) => {
        const headerRow = table.headers.join(' | ');
        const dataRows = table.rows.map((row: string[]) => row.join(' | ')).join('\n');
        return `${table.title || 'Table'}:\n${headerRow}\n${dataRows}`;
      })
      .join('\n\n');
    extractedText = extractedText + '\n\n' + tableText;
  }
  
  return extractedText.trim();
}

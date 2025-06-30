
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

    console.log('=== AI DOCUMENT PROCESSING BATCH START ===');
    
    const body = await req.json().catch(() => ({}));
    const { documentId } = body;
    
    if (documentId) {
      console.log('Processing specific document:', documentId);
    } else {
      console.log('Processing all queued documents');
    }

    const results = {
      conversion: { processed: 0, errors: [] as string[] },
      ocr: { processed: 0, errors: [] as string[] },
      extraction: { processed: 0, errors: [] as string[] },
      categorization: { processed: 0, errors: [] as string[] }
    };

    // Step 1: Convert document first (new step)
    try {
      console.log('Step 1: Converting document...');
      const conversionResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/ai-document-converter`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ documentId })
      });

      if (conversionResponse.ok) {
        const conversionResult = await conversionResponse.json();
        results.conversion = { processed: 1, errors: [] };
        console.log('Document conversion completed:', conversionResult);
      } else {
        const errorText = await conversionResponse.text();
        results.conversion.errors.push(`HTTP ${conversionResponse.status}: ${errorText}`);
        console.warn('Document conversion failed, will proceed with legacy processing:', errorText);
      }
    } catch (error) {
      results.conversion.errors.push(error.message);
      console.warn('Document conversion error, will proceed with legacy processing:', error);
    }

    // Step 2: Process OCR jobs (updated to use converted content)
    try {
      console.log('Step 2: Processing OCR...');
      const ocrResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/ai-ocr-processing`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ documentId })
      });

      if (ocrResponse.ok) {
        const ocrResult = await ocrResponse.json();
        results.ocr = { processed: 1, errors: [] };
        console.log('OCR processing completed:', ocrResult);
      } else {
        const errorText = await ocrResponse.text();
        results.ocr.errors.push(`HTTP ${ocrResponse.status}: ${errorText}`);
        console.error('OCR processing failed:', errorText);
      }
    } catch (error) {
      results.ocr.errors.push(error.message);
      console.error('OCR processing error:', error);
    }

    // Step 3: Process data extraction jobs (enhanced)
    try {
      console.log('Step 3: Processing data extraction...');
      const extractionResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/ai-data-extraction`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ documentId })
      });

      if (extractionResponse.ok) {
        const extractionResult = await extractionResponse.json();
        results.extraction = { processed: 1, errors: [] };
        console.log('Data extraction completed:', extractionResult);
      } else {
        const errorText = await extractionResponse.text();
        results.extraction.errors.push(`HTTP ${extractionResponse.status}: ${errorText}`);
        console.error('Data extraction failed:', errorText);
      }
    } catch (error) {
      results.extraction.errors.push(error.message);
      console.error('Data extraction error:', error);
    }

    // Step 4: Process categorization jobs
    try {
      console.log('Step 4: Processing categorization...');
      const categorizationResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/ai-categorization`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ documentId })
      });

      if (categorizationResponse.ok) {
        const categorizationResult = await categorizationResponse.json();
        results.categorization = { processed: 1, errors: [] };
        console.log('Categorization completed:', categorizationResult);
      } else {
        const errorText = await categorizationResponse.text();
        results.categorization.errors.push(`HTTP ${categorizationResponse.status}: ${errorText}`);
        console.error('Categorization failed:', errorText);
      }
    } catch (error) {
      results.categorization.errors.push(error.message);
      console.error('Categorization error:', error);
    }

    // Check if we need to mark any documents as completed
    if (documentId) {
      try {
        // Check if all processing for this document is complete
        const { data: remainingTasks } = await supabase
          .from('ai_processing_queue')
          .select('*')
          .eq('document_id', documentId)
          .in('status', ['queued', 'processing']);

        if (!remainingTasks || remainingTasks.length === 0) {
          console.log('All processing complete for document, updating status...');
          
          // Determine final status based on results
          const hasErrors = Object.values(results).some(result => result.errors.length > 0);
          const finalStatus = hasErrors ? 'completed_with_errors' : 'completed';
          
          // Update document status to completed
          const { error: updateError } = await supabase
            .from('documents')
            .update({ 
              ai_processing_status: finalStatus,
              processed_at: new Date().toISOString(),
              processing_summary: {
                conversion: results.conversion,
                ocr: results.ocr,
                extraction: results.extraction,
                categorization: results.categorization,
                completed_at: new Date().toISOString()
              }
            })
            .eq('id', documentId);

          if (updateError) {
            console.error('Error updating document status:', updateError);
          } else {
            console.log('Document status updated to:', finalStatus);
          }
        }
      } catch (error) {
        console.error('Error checking document completion status:', error);
      }
    }

    console.log('=== AI PROCESSING BATCH COMPLETED ===');
    console.log('Results summary:', results);

    return new Response(JSON.stringify({
      success: true,
      results,
      timestamp: new Date().toISOString(),
      documentId: documentId || 'all'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Batch processing error:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

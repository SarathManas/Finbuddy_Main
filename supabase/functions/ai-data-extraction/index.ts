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

    console.log('=== DATA EXTRACTION START ===');

    const body = await req.json().catch(() => ({}));
    const { documentId } = body;

    let queueQuery = supabase
      .from('ai_processing_queue')
      .select('*, documents(*)')
      .eq('processing_type', 'data_extraction')
      .eq('status', 'queued')
      .order('priority', { ascending: true })
      .order('created_at', { ascending: true });

    if (documentId) {
      queueQuery = queueQuery.eq('document_id', documentId);
    }

    const { data: queueItem, error: queueError } = await queueQuery.limit(1).single();

    if (queueError || !queueItem) {
      console.log('No data extraction jobs in queue for:', documentId || 'any document');
      return new Response(JSON.stringify({ 
        message: 'No jobs to process',
        documentId: documentId || null
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Processing data extraction for document:', queueItem.document_id);

    // Update status to processing
    await supabase
      .from('ai_processing_queue')
      .update({ 
        status: 'processing', 
        started_at: new Date().toISOString() 
      })
      .eq('id', queueItem.id);

    try {
      // Get the document content (converted or OCR text)
      const extractedData = queueItem.documents.extracted_data || {};
      const convertedContent = extractedData.converted_content;
      const ocrText = extractedData.ocr_text || '';
      
      if (!convertedContent && !ocrText) {
        throw new Error('No content available for data extraction. OCR processing may be incomplete.');
      }

      let contentForAnalysis: string;
      let contentMetadata: any = {};

      if (convertedContent) {
        console.log('Using converted content for data extraction');
        contentForAnalysis = prepareConvertedContentForAnalysis(convertedContent);
        contentMetadata = convertedContent.metadata || {};
      } else {
        console.log('Using OCR text for data extraction');
        contentForAnalysis = ocrText;
        contentMetadata = { file_name: queueItem.documents.file_name };
      }

      // Enhanced data extraction prompt based on file type
      const extractionPrompt = buildExtractionPrompt(contentMetadata.file_type || queueItem.documents.file_type, contentMetadata.file_name);

      // Use OpenAI to extract structured data
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: extractionPrompt
            },
            {
              role: 'user',
              content: `Extract structured data from this document:\n\nFile: ${contentMetadata.file_name}\nType: ${contentMetadata.file_type || queueItem.documents.file_type}\n\nContent:\n${contentForAnalysis}`
            }
          ],
          max_tokens: 2000
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const extractedDataText = data.choices[0]?.message?.content || '{}';

      // Parse the extracted data
      let structuredData;
      try {
        structuredData = JSON.parse(extractedDataText);
      } catch (parseError) {
        console.warn('Failed to parse extracted data as JSON:', extractedDataText);
        structuredData = { 
          raw_extraction: extractedDataText,
          extraction_method: convertedContent ? 'converted_content' : 'ocr_text'
        };
      }

      // Calculate confidence score based on the completeness of extracted data
      const confidenceScore = calculateConfidenceScore(structuredData, contentMetadata.file_type);

      console.log('Data extraction completed, confidence:', confidenceScore);

      // Update queue item with result
      await supabase
        .from('ai_processing_queue')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString(),
          result: { 
            extracted_data: structuredData, 
            confidence_score: confidenceScore,
            extraction_method: convertedContent ? 'converted_content' : 'ocr_text'
          }
        })
        .eq('id', queueItem.id);

      // Update document with extracted data
      const currentExtractedData = queueItem.documents.extracted_data || {};
      await supabase
        .from('documents')
        .update({
          extracted_data: { 
            ...currentExtractedData, 
            structured_data: structuredData,
            extraction_confidence: confidenceScore,
            extraction_timestamp: new Date().toISOString()
          },
          ai_confidence_score: confidenceScore,
          ai_suggestions: structuredData
        })
        .eq('id', queueItem.document_id);

      console.log(`Data extraction completed for document ${queueItem.document_id}`);

      return new Response(JSON.stringify({ 
        success: true, 
        document_id: queueItem.document_id,
        extracted_data: structuredData,
        confidence_score: confidenceScore,
        extraction_method: convertedContent ? 'converted_content' : 'ocr_text'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (processingError) {
      console.error('Data extraction processing failed:', processingError);
      
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
    console.error('Data extraction error:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function prepareConvertedContentForAnalysis(convertedContent: any): string {
  let analysisText = convertedContent.content || '';
  
  // Add structured data information
  if (convertedContent.structured_data) {
    if (convertedContent.structured_data.tables) {
      analysisText += '\n\nTABLES:\n';
      convertedContent.structured_data.tables.forEach((table: any, index: number) => {
        analysisText += `\nTable ${index + 1}: ${table.title || 'Untitled'}\n`;
        analysisText += `Headers: ${table.headers.join(' | ')}\n`;
        table.rows.slice(0, 5).forEach((row: string[]) => {
          analysisText += `${row.join(' | ')}\n`;
        });
        if (table.rows.length > 5) {
          analysisText += `... and ${table.rows.length - 5} more rows\n`;
        }
      });
    }
    
    if (convertedContent.structured_data.text_blocks) {
      analysisText += '\n\nTEXT BLOCKS:\n';
      convertedContent.structured_data.text_blocks.forEach((block: any, index: number) => {
        analysisText += `\n${block.type.toUpperCase()} ${index + 1}:\n${block.content}\n`;
      });
    }
  }
  
  return analysisText.substring(0, 8000); // Limit to prevent token overflow
}

function buildExtractionPrompt(fileType: string, fileName: string): string {
  const basePrompt = `You are a financial document data extraction expert. Extract key information and return it as a JSON object.`;
  
  const fileTypeLower = (fileType || '').toLowerCase();
  
  if (fileTypeLower.includes('pdf') || fileTypeLower.includes('image')) {
    return `${basePrompt}

For invoices/receipts, extract:
- vendor_name, merchant_name, supplier_name
- invoice_number, receipt_number, transaction_id
- date, due_date, transaction_date
- total_amount, subtotal, tax_amount
- currency
- line_items (array of {description, quantity, unit_price, total})
- payment_method
- billing_address, shipping_address

For bank statements, extract:
- account_number, account_holder
- statement_period (start_date, end_date)
- opening_balance, closing_balance
- transactions (array of {date, description, amount, type, balance})

For receipts/expenses, extract:
- merchant_name, vendor_name
- date, time
- total_amount, tax_amount
- category (food, travel, office, etc.)
- payment_method
- location, address

Return only valid JSON without markdown formatting.`;
  }
  
  if (fileTypeLower.includes('csv') || fileTypeLower.includes('excel') || fileTypeLower.includes('spreadsheet')) {
    return `${basePrompt}

For spreadsheet/CSV data, extract:
- data_type (financial_records, transactions, inventory, etc.)
- total_rows, total_columns
- date_range (if applicable)
- key_metrics (totals, averages, counts)
- column_headers
- sample_data (first few rows)
- summary_statistics

If it's financial data, also extract:
- currency
- total_amount, total_income, total_expenses
- categories present
- date_format used

Return only valid JSON without markdown formatting.`;
  }
  
  return `${basePrompt}

Extract relevant information based on the document type:
- document_type
- key_fields (important data found)
- summary
- dates mentioned
- amounts/numbers
- names/entities
- categories

Return only valid JSON without markdown formatting.`;
}

function calculateConfidenceScore(data: any, fileType?: string): number {
  if (!data || typeof data !== 'object') return 0.1;
  
  const keys = Object.keys(data);
  if (keys.length === 0) return 0.1;
  
  let score = 0.3; // Base score for having any data
  
  // File type specific scoring
  const fileTypeLower = (fileType || '').toLowerCase();
  
  if (fileTypeLower.includes('csv') || fileTypeLower.includes('excel')) {
    // Higher confidence for structured data
    if (data.column_headers && data.total_rows) score += 0.4;
    if (data.key_metrics) score += 0.2;
    if (data.summary_statistics) score += 0.1;
  } else {
    // Standard document scoring
    const importantFields = ['total_amount', 'vendor_name', 'merchant_name', 'date', 'invoice_number'];
    const foundFields = importantFields.filter(field => data[field] || data[field.replace('_', '')]);
    score += (foundFields.length / importantFields.length) * 0.4;
    
    // Bonus for having line items or transactions
    if (data.line_items?.length > 0 || data.transactions?.length > 0) {
      score += 0.2;
    }
    
    // Bonus for having addresses or structured data
    if (data.billing_address || data.shipping_address || data.location) {
      score += 0.1;
    }
  }
  
  return Math.min(score, 1.0);
}

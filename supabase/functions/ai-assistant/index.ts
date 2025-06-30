
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProcessingTask {
  id: string;
  document_id: string;
  processing_type: string;
  status: string;
  document?: {
    id: string;
    file_name: string;
    file_type: string;
    storage_path: string;
    extracted_data: any;
    user_id: string;
  };
}

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

    console.log('=== AI ASSISTANT PROCESSING START ===');

    const body = await req.json().catch(() => ({}));
    const { documentId, taskType } = body;

    // Get the next queued task with enhanced query
    let queueQuery = supabase
      .from('ai_processing_queue')
      .select(`
        *,
        documents (
          id,
          file_name,
          file_type,
          storage_path,
          extracted_data,
          user_id
        )
      `)
      .eq('status', 'queued')
      .order('priority', { ascending: true })
      .order('created_at', { ascending: true });

    if (documentId) {
      queueQuery = queueQuery.eq('document_id', documentId);
    }

    if (taskType) {
      queueQuery = queueQuery.eq('processing_type', taskType);
    }

    const { data: queueItem, error: queueError } = await queueQuery.limit(1).single();

    if (queueError || !queueItem) {
      console.log('No tasks in queue for:', { documentId, taskType });
      return new Response(JSON.stringify({ 
        message: 'No tasks to process',
        documentId: documentId || null,
        taskType: taskType || null
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Always fetch fresh document data to ensure we have the latest updates
    console.log('Fetching fresh document data for processing...');
    const { data: freshDocument, error: docError } = await supabase
      .from('documents')
      .select('id, file_name, file_type, storage_path, extracted_data, user_id')
      .eq('id', queueItem.document_id)
      .single();

    if (docError || !freshDocument) {
      console.error('Failed to fetch fresh document data:', docError);
      throw new Error(`Failed to fetch document data: ${docError?.message || 'Document not found'}`);
    }

    queueItem.document = freshDocument;
    console.log(`Processing ${queueItem.processing_type} for document:`, queueItem.document_id);
    console.log('Document extracted_data keys:', Object.keys(queueItem.document.extracted_data || {}));

    // Update status to processing
    await supabase
      .from('ai_processing_queue')
      .update({ 
        status: 'processing', 
        started_at: new Date().toISOString() 
      })
      .eq('id', queueItem.id);

    try {
      let result;
      
      switch (queueItem.processing_type) {
        case 'ocr':
          result = await processOCR(queueItem, supabase, openAIApiKey);
          break;
        case 'data_extraction':
          result = await processDataExtraction(queueItem, supabase, openAIApiKey);
          break;
        case 'categorization':
          result = await processCategorization(queueItem, supabase, openAIApiKey);
          break;
        default:
          throw new Error(`Unknown processing type: ${queueItem.processing_type}`);
      }

      // Update queue item with result
      await supabase
        .from('ai_processing_queue')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString(),
          result: result
        })
        .eq('id', queueItem.id);

      console.log(`${queueItem.processing_type} completed successfully for document ${queueItem.document_id}`);

      return new Response(JSON.stringify({ 
        success: true, 
        document_id: queueItem.document_id,
        processing_type: queueItem.processing_type,
        result: result
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (processingError) {
      console.error(`${queueItem.processing_type} processing failed:`, processingError);
      
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
    console.error('AI Assistant processing error:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function processOCR(queueItem: ProcessingTask, supabase: any, apiKey: string) {
  console.log('=== STARTING OCR PROCESSING ===');
  
  if (!queueItem.document) {
    throw new Error('Document data is missing');
  }
  
  // Check if document has already been converted
  const existingContent = queueItem.document.extracted_data?.converted_content;
  
  if (existingContent) {
    console.log('Using existing converted content for OCR');
    const extractedText = extractTextFromConvertedContent(existingContent);
    console.log('Extracted text length from converted content:', extractedText.length);
    
    if (extractedText && extractedText.length > 0) {
      // Update document with OCR result
      const updateData = { 
        ...queueItem.document.extracted_data,
        ocr_text: extractedText 
      };
      
      console.log('Updating document with OCR text...');
      const { error: updateError } = await supabase
        .from('documents')
        .update({
          extracted_data: updateData,
          ai_processing_status: 'processing'
        })
        .eq('id', queueItem.document_id);

      if (updateError) {
        console.error('Failed to update document with OCR text:', updateError);
        throw updateError;
      }

      console.log('OCR completed successfully using converted content');
      return { extracted_text: extractedText, source: 'converted_content' };
    }
  }

  // Try document converter first if no existing content
  try {
    console.log('Attempting document conversion...');
    const converterResponse = await supabase.functions.invoke('ai-document-converter', {
      body: { documentId: queueItem.document_id }
    });

    if (converterResponse.data?.success) {
      // Get the updated document with converted content
      console.log('Document converted successfully, fetching updated data...');
      const { data: updatedDoc, error: fetchError } = await supabase
        .from('documents')
        .select('extracted_data')
        .eq('id', queueItem.document_id)
        .single();

      if (fetchError) {
        console.error('Failed to fetch updated document:', fetchError);
        throw fetchError;
      }

      if (updatedDoc?.extracted_data?.converted_content) {
        const extractedText = extractTextFromConvertedContent(updatedDoc.extracted_data.converted_content);
        console.log('Extracted text length from new conversion:', extractedText.length);
        
        if (extractedText && extractedText.length > 0) {
          const updateData = { 
            ...updatedDoc.extracted_data,
            ocr_text: extractedText 
          };
          
          console.log('Updating document with OCR text from conversion...');
          const { error: updateError } = await supabase
            .from('documents')
            .update({
              extracted_data: updateData,
              ai_processing_status: 'processing'
            })
            .eq('id', queueItem.document_id);

          if (updateError) {
            console.error('Failed to update document with OCR text:', updateError);
            throw updateError;
          }

          console.log('OCR completed successfully using document converter');
          return { extracted_text: extractedText, source: 'converter' };
        }
      }
    }
  } catch (converterError) {
    console.warn('Document converter failed, falling back to legacy OCR:', converterError);
  }

  // Fallback to legacy OCR for images
  const fileType = queueItem.document.file_type?.toLowerCase() || '';
  
  if (!fileType.includes('image')) {
    throw new Error(`File type ${fileType} not supported by legacy OCR. Document converter failed.`);
  }

  console.log('Using legacy OCR for image file...');
  
  // Get signed URL for the document
  const { data: urlData } = await supabase.storage
    .from('documents')
    .createSignedUrl(queueItem.document.storage_path, 3600);

  if (!urlData?.signedUrl) {
    throw new Error('Could not get document URL');
  }

  // Use OpenAI Vision API for OCR
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
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
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const extractedText = data.choices[0]?.message?.content || '';
  console.log('Legacy OCR extracted text length:', extractedText.length);

  // Update document with OCR result
  const updateData = { 
    ...(queueItem.document.extracted_data || {}),
    ocr_text: extractedText 
  };
  
  console.log('Updating document with legacy OCR text...');
  const { error: updateError } = await supabase
    .from('documents')
    .update({
      extracted_data: updateData,
      ai_processing_status: 'processing'
    })
    .eq('id', queueItem.document_id);

  if (updateError) {
    console.error('Failed to update document with OCR text:', updateError);
    throw updateError;
  }

  console.log('OCR completed successfully using legacy OCR');
  return { extracted_text: extractedText, source: 'legacy_ocr' };
}

async function processDataExtraction(queueItem: ProcessingTask, supabase: any, apiKey: string) {
  console.log('=== STARTING DATA EXTRACTION ===');
  
  if (!queueItem.document) {
    throw new Error('Document data is missing');
  }
  
  // Since we have fresh document data, check what's available
  const extractedData = queueItem.document.extracted_data || {};
  const convertedContent = extractedData.converted_content;
  const ocrText = extractedData.ocr_text || '';
  
  console.log('Data extraction content check:', {
    hasConvertedContent: !!convertedContent,
    hasOcrText: !!ocrText,
    ocrTextLength: ocrText.length,
    extractedDataKeys: Object.keys(extractedData)
  });
  
  // If no content is available, wait a moment and refetch the document
  if (!convertedContent && (!ocrText || ocrText.length === 0)) {
    console.log('No content found, waiting and refetching document...');
    
    // Wait a moment for database propagation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Refetch the document to get the latest data
    const { data: refreshedDoc, error: refreshError } = await supabase
      .from('documents')
      .select('extracted_data')
      .eq('id', queueItem.document_id)
      .single();
    
    if (refreshError) {
      console.error('Failed to refresh document:', refreshError);
      throw new Error('Failed to refresh document data');
    }
    
    const refreshedExtractedData = refreshedDoc.extracted_data || {};
    const refreshedOcrText = refreshedExtractedData.ocr_text || '';
    const refreshedConvertedContent = refreshedExtractedData.converted_content;
    
    console.log('After refresh - content check:', {
      hasConvertedContent: !!refreshedConvertedContent,
      hasOcrText: !!refreshedOcrText,
      ocrTextLength: refreshedOcrText.length,
      extractedDataKeys: Object.keys(refreshedExtractedData)
    });
    
    if (!refreshedConvertedContent && (!refreshedOcrText || refreshedOcrText.length === 0)) {
      throw new Error('No content available for data extraction. OCR must be completed first.');
    }
    
    // Update our working data
    queueItem.document.extracted_data = refreshedExtractedData;
  }

  // Use the refreshed or original data
  const finalExtractedData = queueItem.document.extracted_data;
  const finalConvertedContent = finalExtractedData.converted_content;
  const finalOcrText = finalExtractedData.ocr_text || '';

  let contentForAnalysis: string;
  let contentMetadata: any = {};

  if (finalConvertedContent) {
    console.log('Using converted content for data extraction');
    contentForAnalysis = prepareConvertedContentForAnalysis(finalConvertedContent);
    contentMetadata = finalConvertedContent.metadata || {};
  } else {
    console.log('Using OCR text for data extraction');
    contentForAnalysis = finalOcrText;
    contentMetadata = { file_name: queueItem.document.file_name };
  }

  if (!contentForAnalysis || contentForAnalysis.trim().length === 0) {
    throw new Error('No meaningful content found for data extraction');
  }

  console.log('Content for analysis length:', contentForAnalysis.length);

  const extractionPrompt = buildExtractionPrompt(
    contentMetadata.file_type || queueItem.document.file_type, 
    contentMetadata.file_name || queueItem.document.file_name
  );

  // Use OpenAI to extract structured data
  console.log('Calling OpenAI for data extraction...');
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
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
          content: `Extract structured data from this document:\n\nFile: ${contentMetadata.file_name || queueItem.document.file_name}\nType: ${contentMetadata.file_type || queueItem.document.file_type}\n\nContent:\n${contentForAnalysis.substring(0, 8000)}`
        }
      ],
      max_tokens: 2000
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const extractedDataText = data.choices[0]?.message?.content || '{}';

  let structuredData;
  try {
    structuredData = JSON.parse(extractedDataText);
  } catch (parseError) {
    console.warn('Failed to parse extraction as JSON, using raw text');
    structuredData = { 
      raw_extraction: extractedDataText,
      extraction_method: finalConvertedContent ? 'converted_content' : 'ocr_text'
    };
  }

  const confidenceScore = calculateConfidenceScore(structuredData, contentMetadata.file_type);

  // Update document with extracted data
  const currentExtractedData = queueItem.document.extracted_data || {};
  const updateData = { 
    ...currentExtractedData, 
    structured_data: structuredData,
    extraction_confidence: confidenceScore,
    extraction_timestamp: new Date().toISOString()
  };
  
  console.log('Updating document with extracted structured data...');
  const { error: updateError } = await supabase
    .from('documents')
    .update({
      extracted_data: updateData,
      ai_confidence_score: confidenceScore,
      ai_suggestions: structuredData
    })
    .eq('id', queueItem.document_id);

  if (updateError) {
    console.error('Failed to update document with extracted data:', updateError);
    throw updateError;
  }

  console.log('Data extraction completed successfully');
  return { 
    extracted_data: structuredData, 
    confidence_score: confidenceScore,
    extraction_method: finalConvertedContent ? 'converted_content' : 'ocr_text'
  };
}

async function processCategorization(queueItem: ProcessingTask, supabase: any, apiKey: string) {
  console.log('=== STARTING CATEGORIZATION ===');
  
  if (!queueItem.document) {
    throw new Error('Document data is missing');
  }
  
  // Get fresh document data for categorization
  const { data: freshDoc, error: fetchError } = await supabase
    .from('documents')
    .select('extracted_data')
    .eq('id', queueItem.document_id)
    .single();
  
  if (fetchError) {
    console.error('Failed to fetch fresh document for categorization:', fetchError);
    throw fetchError;
  }
  
  const extractedData = freshDoc.extracted_data || {};
  const ocrText = extractedData.ocr_text || '';
  const structuredData = extractedData.structured_data || {};

  console.log('Categorization input check:', {
    hasOcrText: !!ocrText,
    ocrTextLength: ocrText.length,
    hasStructuredData: !!structuredData && Object.keys(structuredData).length > 0,
    structuredDataKeys: Object.keys(structuredData)
  });

  // Use OpenAI to categorize the document
  console.log('Calling OpenAI for categorization...');
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a financial document categorization expert. Analyze the document and provide:

1. Document type classification (must be one of: invoice, receipt, bank_statement, tax_document, contract, financial_report, expense_report, other)
2. Document category (expense, revenue, asset, liability, etc.)
3. Suggested tags for organization
4. Auto-filled fields for common form fields
5. Financial insights and recommendations

Return a JSON object with this structure:
{
  "document_type": "one of: invoice, receipt, bank_statement, tax_document, contract, financial_report, expense_report, other",
  "category": "string", 
  "tags": ["tag1", "tag2"],
  "auto_filled_fields": {
    "field_name": "value"
  },
  "insights": {
    "summary": "brief summary",
    "recommendations": ["recommendation1", "recommendation2"],
    "flags": ["warning1", "warning2"]
  },
  "confidence": 0.95
}

IMPORTANT: document_type must be exactly one of the allowed values: invoice, receipt, bank_statement, tax_document, contract, financial_report, expense_report, other`
        },
        {
          role: 'user',
          content: `Analyze this financial document:

OCR Text: ${ocrText.substring(0, 2000)}

Structured Data: ${JSON.stringify(structuredData, null, 2).substring(0, 2000)}

File Name: ${queueItem.document.file_name}`
        }
      ],
      max_tokens: 1500
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const analysisText = data.choices[0]?.message?.content || '{}';

  let analysis;
  try {
    analysis = JSON.parse(analysisText);
  } catch (parseError) {
    console.warn('Failed to parse categorization as JSON');
    analysis = { 
      document_type: 'other',
      category: 'uncategorized',
      tags: [],
      auto_filled_fields: {},
      insights: { summary: analysisText },
      confidence: 0.5
    };
  }

  // Ensure document_type is valid
  const validDocumentTypes = ['invoice', 'receipt', 'bank_statement', 'tax_document', 'contract', 'financial_report', 'expense_report', 'other'];
  if (!validDocumentTypes.includes(analysis.document_type)) {
    console.warn(`Invalid document_type: ${analysis.document_type}, defaulting to 'other'`);
    analysis.document_type = 'other';
  }

  // Update document with categorization
  console.log('Updating document with categorization...');
  const { error: updateError } = await supabase
    .from('documents')
    .update({
      document_type: analysis.document_type,
      tags: analysis.tags || [],
      auto_filled_fields: analysis.auto_filled_fields || {},
      ai_processing_status: 'completed',
      processed_at: new Date().toISOString()
    })
    .eq('id', queueItem.document_id);

  if (updateError) {
    console.error('Failed to update document with categorization:', updateError);
    throw updateError;
  }

  // Generate financial insights if applicable
  if (analysis.insights && Object.keys(analysis.insights).length > 0) {
    try {
      await supabase
        .from('ai_financial_insights')
        .insert({
          user_id: queueItem.document.user_id,
          insight_type: 'document_analysis',
          title: `Analysis: ${queueItem.document.file_name}`,
          description: analysis.insights.summary,
          confidence_score: analysis.confidence || 0.8,
          data: {
            document_id: queueItem.document_id,
            analysis: analysis
          },
          action_items: analysis.insights.recommendations || []
        });
    } catch (insightError) {
      console.warn('Failed to create financial insight:', insightError);
      // Don't fail the whole process for this
    }
  }

  console.log('Categorization completed successfully');
  return analysis;
}

// Helper functions
function extractTextFromConvertedContent(convertedContent: any): string {
  if (!convertedContent) return '';
  
  let extractedText = convertedContent.content || '';
  
  if (convertedContent.structured_data?.text_blocks) {
    const additionalText = convertedContent.structured_data.text_blocks
      .map((block: any) => block.content)
      .join('\n');
    extractedText = extractedText + '\n' + additionalText;
  }
  
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

function prepareConvertedContentForAnalysis(convertedContent: any): string {
  let analysisText = convertedContent.content || '';
  
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
  
  return analysisText.substring(0, 8000);
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
  
  let score = 0.3;
  
  const fileTypeLower = (fileType || '').toLowerCase();
  
  if (fileTypeLower.includes('csv') || fileTypeLower.includes('excel')) {
    if (data.column_headers && data.total_rows) score += 0.4;
    if (data.key_metrics) score += 0.2;
    if (data.summary_statistics) score += 0.1;
  } else {
    const importantFields = ['total_amount', 'vendor_name', 'merchant_name', 'date', 'invoice_number'];
    const foundFields = importantFields.filter(field => data[field] || data[field.replace('_', '')]);
    score += (foundFields.length / importantFields.length) * 0.4;
    
    if (data.line_items?.length > 0 || data.transactions?.length > 0) {
      score += 0.2;
    }
    
    if (data.billing_address || data.shipping_address || data.location) {
      score += 0.1;
    }
  }
  
  return Math.min(score, 1.0);
}

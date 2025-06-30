
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

    // Get the next queued categorization job
    const { data: queueItem, error: queueError } = await supabase
      .from('ai_processing_queue')
      .select('*, documents(*)')
      .eq('processing_type', 'categorization')
      .eq('status', 'queued')
      .order('priority', { ascending: true })
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (queueError || !queueItem) {
      console.log('No categorization jobs in queue');
      return new Response(JSON.stringify({ message: 'No jobs to process' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Update status to processing
    await supabase
      .from('ai_processing_queue')
      .update({ 
        status: 'processing', 
        started_at: new Date().toISOString() 
      })
      .eq('id', queueItem.id);

    // Get the extracted data from previous steps
    const extractedData = queueItem.documents.extracted_data || {};
    const ocrText = extractedData.ocr_text || '';
    const structuredData = extractedData.structured_data || {};

    // Use OpenAI to categorize the document and generate insights
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
            content: `You are a financial document categorization expert. Analyze the document and provide:

1. Document type classification (invoice, receipt, bank_statement, tax_document, contract, etc.)
2. Document category (expense, revenue, asset, liability, etc.)
3. Suggested tags for organization
4. Auto-filled fields for common form fields
5. Financial insights and recommendations

Return a JSON object with this structure:
{
  "document_type": "string",
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
}`
          },
          {
            role: 'user',
            content: `Analyze this financial document:

OCR Text: ${ocrText}

Structured Data: ${JSON.stringify(structuredData, null, 2)}

File Name: ${queueItem.documents.file_name}`
          }
        ],
        max_tokens: 1500
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const analysisText = data.choices[0]?.message?.content || '{}';

    // Parse the analysis
    let analysis;
    try {
      analysis = JSON.parse(analysisText);
    } catch (parseError) {
      console.warn('Failed to parse analysis as JSON:', analysisText);
      analysis = { 
        document_type: 'other',
        category: 'uncategorized',
        tags: [],
        auto_filled_fields: {},
        insights: { summary: analysisText },
        confidence: 0.5
      };
    }

    // Update queue item with result
    await supabase
      .from('ai_processing_queue')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString(),
        result: analysis
      })
      .eq('id', queueItem.id);

    // Update document with categorization and final status
    await supabase
      .from('documents')
      .update({
        document_type: analysis.document_type || 'other',
        tags: analysis.tags || [],
        auto_filled_fields: analysis.auto_filled_fields || {},
        ai_processing_status: 'completed',
        processed_at: new Date().toISOString()
      })
      .eq('id', queueItem.document_id);

    // Generate financial insights if applicable
    if (analysis.insights && Object.keys(analysis.insights).length > 0) {
      await supabase
        .from('ai_financial_insights')
        .insert({
          user_id: queueItem.documents.user_id,
          insight_type: 'document_analysis',
          title: `Analysis: ${queueItem.documents.file_name}`,
          description: analysis.insights.summary,
          confidence_score: analysis.confidence || 0.8,
          data: {
            document_id: queueItem.document_id,
            analysis: analysis
          },
          action_items: analysis.insights.recommendations || []
        });
    }

    console.log(`Categorization completed for document ${queueItem.document_id}`);

    return new Response(JSON.stringify({ 
      success: true, 
      document_id: queueItem.document_id,
      analysis: analysis
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Categorization error:', error);
    
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

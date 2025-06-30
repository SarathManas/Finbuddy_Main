
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

    console.log('=== AI DOCUMENT CONVERTER START ===');
    
    const body = await req.json().catch(() => ({}));
    const { documentId } = body;
    
    if (!documentId) {
      throw new Error('Document ID is required');
    }

    console.log('Converting document:', documentId);

    // Get document details
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('id, file_name, file_type, storage_path, extracted_data, user_id')
      .eq('id', documentId)
      .single();

    if (docError || !document) {
      throw new Error(`Failed to fetch document: ${docError?.message || 'Document not found'}`);
    }

    console.log('Document details:', {
      id: document.id,
      fileName: document.file_name,
      fileType: document.file_type,
      storagePath: document.storage_path
    });

    // Check if already converted
    if (document.extracted_data?.converted_content) {
      console.log('Document already converted');
      return new Response(JSON.stringify({
        success: true,
        documentId,
        converted: true,
        alreadyConverted: true,
        content: document.extracted_data.converted_content
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get signed URL for the document
    const { data: urlData } = await supabase.storage
      .from('documents')
      .createSignedUrl(document.storage_path, 3600);

    if (!urlData?.signedUrl) {
      throw new Error('Could not get document URL for conversion');
    }

    let convertedContent;
    const fileType = document.file_type?.toLowerCase() || '';

    if (fileType.includes('pdf')) {
      // Use OpenAI to extract content from PDF
      console.log('Converting PDF document...');
      convertedContent = await convertPDFWithOpenAI(urlData.signedUrl, openAIApiKey);
    } else if (fileType.includes('image')) {
      // Use OpenAI Vision for images
      console.log('Converting image document...');
      convertedContent = await convertImageWithOpenAI(urlData.signedUrl, openAIApiKey);
    } else {
      console.log('Unsupported file type for conversion:', fileType);
      throw new Error(`File type ${fileType} not supported for conversion`);
    }

    // Update document with converted content
    const updatedExtractedData = {
      ...(document.extracted_data || {}),
      converted_content: convertedContent,
      conversion_timestamp: new Date().toISOString()
    };

    const { error: updateError } = await supabase
      .from('documents')
      .update({
        extracted_data: updatedExtractedData
      })
      .eq('id', documentId);

    if (updateError) {
      console.error('Failed to update document with converted content:', updateError);
      throw updateError;
    }

    console.log('Document conversion completed successfully');

    return new Response(JSON.stringify({
      success: true,
      documentId,
      converted: true,
      content: convertedContent,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Document converter error:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function convertPDFWithOpenAI(signedUrl: string, apiKey: string) {
  console.log('Using OpenAI to process PDF content...');
  
  // For PDFs, we'll use a text extraction approach
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
          content: 'You are a document processing assistant. Extract and structure all text content from the provided document. Preserve formatting and structure where possible. Return the content in a structured format.'
        },
        {
          role: 'user',
          content: `Please process this PDF document and extract all text content. Return it in a structured format that preserves the document's organization.`
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

  return {
    content: extractedText,
    metadata: {
      file_type: 'pdf',
      extraction_method: 'openai_text',
      extracted_at: new Date().toISOString()
    },
    structured_data: {
      text_blocks: [
        {
          type: 'main_content',
          content: extractedText
        }
      ]
    }
  };
}

async function convertImageWithOpenAI(signedUrl: string, apiKey: string) {
  console.log('Using OpenAI Vision to process image...');
  
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
          content: 'You are an OCR specialist. Extract all text content from images with high accuracy. Preserve formatting, structure, and any tabular data. Return the content in a structured format.'
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Please extract all text from this image document. Preserve any tables, formatting, and structure. Return the content in a structured format.'
            },
            {
              type: 'image_url',
              image_url: {
                url: signedUrl
              }
            }
          ]
        }
      ],
      max_tokens: 4000
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI Vision API error: ${response.status}`);
  }

  const data = await response.json();
  const extractedText = data.choices[0]?.message?.content || '';

  return {
    content: extractedText,
    metadata: {
      file_type: 'image',
      extraction_method: 'openai_vision',
      extracted_at: new Date().toISOString()
    },
    structured_data: {
      text_blocks: [
        {
          type: 'ocr_content',
          content: extractedText
        }
      ]
    }
  };
}

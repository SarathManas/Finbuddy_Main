
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ASSISTANT_ID = 'asst_9BCr1khSSpGLuDXfWmnNwBPMD';

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

    console.log('=== AI ASSISTANT MANAGER START ===');
    console.log('OpenAI API Key present:', !!openAIApiKey);
    console.log('API Key length:', openAIApiKey ? openAIApiKey.length : 0);
    
    const body = await req.json().catch(() => ({}));
    const { action, documentId, assistantId } = body;
    
    if (action === 'process_document' && documentId) {
      console.log('Processing document with Assistant:', documentId, 'using assistant:', assistantId || ASSISTANT_ID);
      
      // Verify assistant exists before processing
      await verifyAssistantExists(assistantId || ASSISTANT_ID, openAIApiKey);
      
      const result = await processDocumentWithAssistant(
        documentId, 
        assistantId || ASSISTANT_ID, 
        supabase, 
        openAIApiKey
      );
      
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      error: 'Invalid action or missing parameters',
      supportedActions: ['process_document']
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('AI Assistant Manager error:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function verifyAssistantExists(assistantId: string, apiKey: string) {
  console.log('Verifying assistant exists:', assistantId);
  
  try {
    const response = await fetch(`https://api.openai.com/v1/assistants/${assistantId}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'OpenAI-Beta': 'assistants=v2'
      }
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Assistant verification failed:', response.status, errorData);
      throw new Error(`Assistant ${assistantId} not found or inaccessible: ${response.status}`);
    }

    const assistantData = await response.json();
    console.log('Assistant verified successfully:', assistantData.name || assistantId);
    return assistantData;
  } catch (error) {
    console.error('Error verifying assistant:', error);
    throw new Error(`Failed to verify assistant: ${error.message}`);
  }
}

async function processDocumentWithAssistant(
  documentId: string, 
  assistantId: string, 
  supabase: any, 
  apiKey: string
) {
  console.log(`Processing document with Assistant: ${documentId} using assistant: ${assistantId}`);
  
  // Get document details
  const { data: document, error: docError } = await supabase
    .from('documents')
    .select('*')
    .eq('id', documentId)
    .single();

  if (docError || !document) {
    throw new Error(`Failed to fetch document: ${docError?.message || 'Document not found'}`);
  }

  console.log('Document details:', {
    id: document.id,
    name: document.file_name,
    type: document.file_type,
    size: document.file_size
  });

  // Update status to processing with timestamp
  await supabase
    .from('documents')
    .update({
      ai_processing_status: 'processing',
      processed_at: null,
      extracted_data: {
        ...(document.extracted_data || {}),
        processing_started: new Date().toISOString()
      }
    })
    .eq('id', documentId);

  const results = {
    ocr: { success: false, error: null, result: null },
    data_extraction: { success: false, error: null, result: null },
    categorization: { success: false, error: null, result: null }
  };

  // Try each processing step with enhanced error handling
  const processingSteps = ['ocr', 'data_extraction', 'categorization'];
  
  for (const step of processingSteps) {
    try {
      console.log(`Starting processing step: ${step}`);
      const stepResult = await runAssistantStep(document, step, assistantId, apiKey, supabase);
      results[step] = { success: true, result: stepResult, error: null };
      console.log(`Step ${step} completed successfully`);
      
      // Wait between steps to allow for processing
      if (step !== 'categorization') {
        console.log(`Waiting 3 seconds before next step...`);
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    } catch (error) {
      console.error(`Step ${step} failed:`, error);
      results[step] = { success: false, error: error.message, result: null };
      
      // Don't fail completely on first step failure, continue with other steps
      console.log(`Continuing with remaining steps despite ${step} failure`);
    }
  }

  // Determine final status based on results
  const successfulSteps = Object.values(results).filter(r => r.success).length;
  const totalSteps = Object.keys(results).length;
  
  let finalStatus: string;
  if (successfulSteps === 0) {
    finalStatus = 'failed';
  } else if (successfulSteps === totalSteps) {
    finalStatus = 'completed';
  } else {
    finalStatus = 'completed_with_errors';
  }

  console.log(`Document processing completed with status: ${finalStatus} (${successfulSteps}/${totalSteps} steps successful)`);

  // Update document with final status and results
  await supabase
    .from('documents')
    .update({
      ai_processing_status: finalStatus,
      processed_at: new Date().toISOString(),
      extracted_data: {
        ...(document.extracted_data || {}),
        assistant_results: {
          processing_summary: results,
          completed_at: new Date().toISOString(),
          assistant_id: assistantId,
          success_rate: successfulSteps / totalSteps
        }
      }
    })
    .eq('id', documentId);

  return {
    success: true,
    document_id: documentId,
    status: finalStatus,
    results,
    assistant_id: assistantId,
    success_rate: successfulSteps / totalSteps
  };
}

async function runAssistantStep(
  document: any, 
  step: string, 
  assistantId: string, 
  apiKey: string, 
  supabase: any
) {
  console.log(`Running assistant step: ${step} for document: ${document.id}`);
  
  try {
    // Create a thread for this processing step
    console.log('Creating thread...');
    const threadResponse = await fetch('https://api.openai.com/v1/threads', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      },
      body: JSON.stringify({})
    });

    if (!threadResponse.ok) {
      const errorText = await threadResponse.text();
      console.error('Thread creation failed:', threadResponse.status, errorText);
      throw new Error(`Failed to create thread: ${threadResponse.status} - ${errorText}`);
    }

    const thread = await threadResponse.json();
    console.log(`Created thread: ${thread.id}`);

    // Prepare the message content based on the step
    const messageContent = await prepareStepMessage(document, step, supabase);
    console.log(`Message content prepared for ${step}, length: ${messageContent.length}`);
    
    // Add message to thread
    console.log('Adding message to thread...');
    const messageResponse = await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      },
      body: JSON.stringify({
        role: 'user',
        content: messageContent
      })
    });

    if (!messageResponse.ok) {
      const errorText = await messageResponse.text();
      console.error('Message creation failed:', messageResponse.status, errorText);
      throw new Error(`Failed to add message to thread: ${messageResponse.status} - ${errorText}`);
    }

    console.log('Message added successfully');

    // Run the assistant with detailed instructions
    console.log('Starting assistant run...');
    const runResponse = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      },
      body: JSON.stringify({
        assistant_id: assistantId,
        instructions: getStepInstructions(step),
        max_prompt_tokens: 4000,
        max_completion_tokens: 2000
      })
    });

    if (!runResponse.ok) {
      const errorText = await runResponse.text();
      console.error('Run creation failed:', runResponse.status, errorText);
      throw new Error(`Failed to start run for step ${step}: ${runResponse.status} - ${errorText}`);
    }

    const run = await runResponse.json();
    console.log(`Started run: ${run.id} for step: ${step}`);

    // Wait for completion with proper polling and timeout
    let runStatus = run;
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max with 5 second intervals
    
    while (runStatus.status === 'in_progress' || runStatus.status === 'queued') {
      if (attempts >= maxAttempts) {
        console.error(`Assistant run timed out for step ${step} after ${attempts} attempts`);
        throw new Error(`Assistant run timed out for step ${step}`);
      }
      
      console.log(`Waiting for completion... (attempt ${attempts + 1}/${maxAttempts})`);
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      
      const statusResponse = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs/${run.id}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'OpenAI-Beta': 'assistants=v2'
        }
      });
      
      if (!statusResponse.ok) {
        const errorText = await statusResponse.text();
        console.error('Status check failed:', statusResponse.status, errorText);
        throw new Error(`Failed to check run status: ${statusResponse.status}`);
      }
      
      runStatus = await statusResponse.json();
      attempts++;
      console.log(`Run status for ${step}: ${runStatus.status} (attempt ${attempts})`);
    }

    if (runStatus.status !== 'completed') {
      console.error(`Assistant run failed with status: ${runStatus.status}`);
      if (runStatus.last_error) {
        console.error('Last error:', runStatus.last_error);
      }
      throw new Error(`Assistant run failed with status: ${runStatus.status}`);
    }

    // Get the assistant's response
    console.log('Retrieving messages...');
    const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'OpenAI-Beta': 'assistants=v2'
      }
    });

    if (!messagesResponse.ok) {
      const errorText = await messagesResponse.text();
      console.error('Messages retrieval failed:', messagesResponse.status, errorText);
      throw new Error(`Failed to get messages: ${messagesResponse.status}`);
    }

    const messages = await messagesResponse.json();
    const assistantMessage = messages.data.find((msg: any) => msg.role === 'assistant');
    
    if (!assistantMessage) {
      throw new Error('No assistant response found');
    }

    const result = assistantMessage.content[0]?.text?.value || '';
    console.log(`Assistant response for ${step}:`, result.substring(0, 200) + '...');

    // Process and store the result based on the step
    await processStepResult(document, step, result, supabase);

    return {
      step,
      result: result.substring(0, 1000), // Limit result size
      thread_id: thread.id,
      run_id: run.id,
      completed_at: new Date().toISOString()
    };
  } catch (error) {
    console.error(`Error in runAssistantStep for ${step}:`, error);
    throw error;
  }
}

async function prepareStepMessage(document: any, step: string, supabase: any): Promise<string> {
  let content = `Document: ${document.file_name}\nFile Type: ${document.file_type}\nFile Size: ${document.file_size} bytes\n\n`;
  
  // Get signed URL for the document if it's an image and we're doing OCR
  if (step === 'ocr' && document.file_type?.includes('image')) {
    try {
      const { data: urlData } = await supabase.storage
        .from('documents')
        .createSignedUrl(document.storage_path, 3600);
      
      if (urlData?.signedUrl) {
        content += `Document URL: ${urlData.signedUrl}\n\n`;
      }
    } catch (error) {
      console.error('Failed to get signed URL:', error);
    }
  }
  
  // Add existing data for later steps
  const extractedData = document.extracted_data || {};
  
  if (step === 'data_extraction' && extractedData.ocr_text) {
    content += `OCR Text:\n${extractedData.ocr_text}\n\n`;
  }
  
  if (step === 'categorization') {
    if (extractedData.ocr_text) {
      content += `OCR Text:\n${extractedData.ocr_text}\n\n`;
    }
    if (extractedData.structured_data) {
      content += `Structured Data:\n${JSON.stringify(extractedData.structured_data, null, 2)}\n\n`;
    }
  }
  
  content += `Please perform ${step} on this document.`;
  
  return content;
}

function getStepInstructions(step: string): string {
  switch (step) {
    case 'ocr':
      return 'Extract all text from the provided document. Focus on accuracy and preserving formatting. Return only the extracted text content.';
    case 'data_extraction':
      return 'Extract structured data from the document text. Return a JSON object with key-value pairs for important financial information like amounts, dates, vendor names, etc. Focus on financial and business-relevant data.';
    case 'categorization':
      return 'Categorize this document and provide insights. Return a JSON object with document_type, suggested tags array, and financial insights. Determine if this is an invoice, receipt, contract, etc.';
    default:
      return `Perform ${step} analysis on the provided document and return the results in a structured format.`;
  }
}

async function processStepResult(document: any, step: string, result: string, supabase: any) {
  const currentData = document.extracted_data || {};
  let updateData = { ...currentData };

  switch (step) {
    case 'ocr':
      updateData.ocr_text = result;
      break;
    case 'data_extraction':
      try {
        const structuredData = JSON.parse(result);
        updateData.structured_data = structuredData;
      } catch (parseError) {
        console.log('Failed to parse data extraction result as JSON, storing as raw text');
        updateData.structured_data = { raw_extraction: result };
      }
      break;
    case 'categorization':
      try {
        const categoryData = JSON.parse(result);
        updateData.categorization = categoryData;
        
        // Update document fields if provided
        if (categoryData.document_type) {
          await supabase
            .from('documents')
            .update({ document_type: categoryData.document_type })
            .eq('id', document.id);
        }
        
        if (categoryData.tags && Array.isArray(categoryData.tags)) {
          await supabase
            .from('documents')
            .update({ tags: categoryData.tags })
            .eq('id', document.id);
        }
      } catch (parseError) {
        console.log('Failed to parse categorization result as JSON, storing as raw text');
        updateData.categorization = { raw_analysis: result };
      }
      break;
  }

  // Update the document with the new data
  await supabase
    .from('documents')
    .update({ extracted_data: updateData })
    .eq('id', document.id);
}

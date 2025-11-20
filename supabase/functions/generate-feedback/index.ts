import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // Extract and verify JWT
    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(jwt);
    
    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('User authenticated:', user.id);

    // Verify user has lecturer role
    const { data: roleData, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'lecturer')
      .maybeSingle();

    if (roleError || !roleData) {
      console.error('Role verification failed:', roleError);
      return new Response(
        JSON.stringify({ error: 'Forbidden: Only lecturers can generate feedback' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { submissionContent, assignmentTitle, submissionId } = await req.json();
    
    // Input validation
    if (!submissionContent) {
      return new Response(
        JSON.stringify({ error: 'No submission content provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (submissionContent.length > 50000) {
      return new Response(
        JSON.stringify({ error: 'Content too large. Maximum 50,000 characters allowed.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (assignmentTitle && assignmentTitle.length > 500) {
      return new Response(
        JSON.stringify({ error: 'Assignment title too long. Maximum 500 characters allowed.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify lecturer owns the course for this submission (if submissionId provided)
    if (submissionId) {
      const { data: submission, error: submissionError } = await supabaseClient
        .from('submissions')
        .select(`
          id,
          assignment:assignments(
            id,
            course:courses(
              lecturer_id
            )
          )
        `)
        .eq('id', submissionId)
        .maybeSingle();

      if (submissionError || !submission) {
        console.error('Submission fetch error:', submissionError);
        return new Response(
          JSON.stringify({ error: 'Submission not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const assignment = submission.assignment as any;
      const course = Array.isArray(assignment) ? assignment[0]?.course : assignment?.course;
      const lecturerId = Array.isArray(course) ? course[0]?.lecturer_id : course?.lecturer_id;

      if (lecturerId !== user.id) {
        console.error('Lecturer mismatch:', { lecturerId, userId: user.id });
        return new Response(
          JSON.stringify({ error: 'Forbidden: You can only generate feedback for your own courses' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Generating AI feedback for assignment:', assignmentTitle, 'by user:', user.id);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are an experienced university lecturer providing constructive feedback on student submissions. Analyze the content thoroughly and provide balanced feedback that highlights strengths and areas for improvement.'
          },
          {
            role: 'user',
            content: `Assignment: ${assignmentTitle || 'Academic Submission'}

Student Submission:
${submissionContent}

Please provide detailed feedback covering:
1. Strengths of the submission
2. Areas that need improvement
3. Specific suggestions for enhancement
4. Overall assessment

Keep the feedback professional, constructive, and encouraging.`
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const generatedFeedback = data.choices[0].message.content;

    console.log('AI feedback generated successfully');

    return new Response(
      JSON.stringify({ feedback: generatedFeedback }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-feedback function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate feedback';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

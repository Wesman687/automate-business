// Mock AI planning endpoint - replace with actual AI integration later
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Force dynamic rendering to prevent build-time execution
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Initialize OpenAI client only when needed
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const { prompt } = await request.json();
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a professional project manager and AI assistant. Create detailed, actionable project plans with specific milestones and deliverables. 

Your response should be in JSON format with the following structure:
{
  "milestones": [
    {
      "name": "Milestone name",
      "description": "Detailed description of what needs to be accomplished",
      "due_date": "YYYY-MM-DD",
      "completed": false
    }
  ],
  "deliverables": [
    {
      "name": "Deliverable name", 
      "description": "What will be delivered",
      "delivered": false,
      "date": "YYYY-MM-DD"
    }
  ]
}

Make sure milestones are logical steps in the project timeline and deliverables are concrete outputs. Use realistic timeframes based on project complexity.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const responseText = completion.choices[0].message.content;
    
    try {
      // Try to parse as JSON
      const planData = JSON.parse(responseText || '{}');
      return NextResponse.json(planData);
    } catch (parseError) {
      // If JSON parsing fails, return a structured error
      console.error('Failed to parse AI response as JSON:', parseError);
      return NextResponse.json({
        error: 'AI response was not in expected format',
        rawResponse: responseText
      }, { status: 500 });
    }

  } catch (error) {
    console.error('AI Generate Plan API Error:', error);
    
    // Return more specific error messages
    if (error instanceof Error) {
      return NextResponse.json({ 
        error: 'Failed to generate AI plan',
        details: error.message 
      }, { status: 500 });
    }
    
    return NextResponse.json({ error: 'Failed to generate AI plan' }, { status: 500 });
  }
}

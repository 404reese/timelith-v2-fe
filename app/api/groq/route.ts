// pages/api/groq.js or app/api/groq/route.js (depending on your Next.js version)

import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { scoreExplanation } = await request.json();
    
    // Your Groq API key should be stored in environment variables
    const apiKey = process.env.GROQ_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Groq API key is not configured' },
        { status: 500 }
      );
    }
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama3-70b-8192', // Or whichever model you're using
        messages: [
          {
            role: 'system',
            content: 'You are an expert in analyzing timetable data and providing insights. Format your response in Markdown with proper headings, bullet points, and organized sections.'
          },
          {
            role: 'user',
            content: `Analyze this timetable score explanation and provide a detailed breakdown, insights, and recommendations in proper Markdown format with headings, bullet points, and good organization:\n\n${scoreExplanation}`
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get response from Groq API');
    }
    
    const data = await response.json();
    const analysis = data.choices[0]?.message?.content || '';
    
    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error.message || 'An unknown error occurred' },
      { status: 500 }
    );
  }
}
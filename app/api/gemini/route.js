// app/api/gemini/route.js (For App Router)
// OR pages/api/gemini.js (For Pages Router)

import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request) {
  try {
    const { scoreExplanation } = await request.json();
    
    // Your Gemini API key should be stored in environment variables
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key is not configured' },
        { status: 500 }
      );
    }
    
    // Initialize the Gemini API client
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `
      Analyze this timetable score explanation and provide a detailed breakdown, insights, and recommendations. 
      Format your response in Markdown with proper headings, bullet points, and organized sections.
      
      Timetable Score Explanation:
      ${scoreExplanation}
      
      Make sure to include:
      1. A summary of the main points
      2. Evaluation of the scheduling quality
      3. Identification of potential issues
      4. Specific improvement recommendations
      5. Any notable insights
      
      Respond in well-formatted Markdown.
    `;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysis = response.text();
    
    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error.message || 'An unknown error occurred' },
      { status: 500 }
    );
  }
}
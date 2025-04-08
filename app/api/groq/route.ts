import Groq from "groq-sdk";
import { NextResponse } from 'next/server';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || ''
});

export async function POST(request: Request) {
  try {
    const { scoreExplanation } = await request.json();
    
    if (!scoreExplanation) {
      return NextResponse.json(
        { error: "scoreExplanation is required" },
        { status: 400 }
      );
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an expert in analyzing university timetable schedules. Provide detailed insights about the scheduling quality and potential improvements."
        },
        {
          role: "user",
          content: `Analyze this timetable score explanation: ${scoreExplanation}`
        }
      ],
      model: "mixtral-8x7b-32768",
      temperature: 0.7,
      max_tokens: 1000
    });

    const analysis = completion.choices[0]?.message?.content;
    
    if (!analysis) {
      throw new Error("No analysis content received");
    }

    return NextResponse.json({ analysis });
  } catch (error: any) {
    console.error("Groq API error:", error.message);
    return NextResponse.json(
      { 
        error: "Failed to analyze data",
        details: error.message 
      },
      { status: 500 }
    );
  }
}
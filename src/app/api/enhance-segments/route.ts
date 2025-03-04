// src/app/api/enhance-segments/route.ts
import { NextResponse } from 'next/server';

// Set maximum duration to 60 seconds
export const maxDuration = 60;

// Use Edge runtime for better performance with long-running requests
export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const { industry, segments } = await request.json();
    
    if (!segments || typeof segments !== 'string') {
      return NextResponse.json({ error: 'Invalid segments data' }, { status: 400 });
    }
    
    // Updated prompt to match the PDF style and your requirements
    const prompt = `
    You are a market research expert specializing in high-ticket fractional CFO services. Below is a list of promising segments in the ${industry} industry:
    
    ${segments.substring(0, 5000)} // Limit input size to avoid request issues
    
    Provide an enhanced analysis in English only, starting with the title "Deep Dive: Best ${industry} Segments for High-Ticket Fractional CFO Services". Do not include introductory sentences like "Okay, here's an analysis...". For each segment, use the following format with numbered headings:
    
    A. **Why This Segment?** - Explain in 2-3 sentences why this segment needs fractional CFO services (e.g., complex financial needs, growth demands).
    B. **High-Ticket Justification** - List 3-4 specific financial challenges or tasks in bullet points that justify premium CFO services (e.g., financial modeling, investor reporting).
    C. **How Lucrative Is This Market?** - Assess market size, growth trends, or profitability potential in 2-3 sentences.
    D. **Marketing Angles** - Provide 2-3 compelling marketing messages in bullet points tailored to this segment’s needs.
    
    Keep each section concise and actionable. Structure the response with the title followed by segment headings (e.g., "1. Real Estate Development Firms") and numbered subsections.
    `;
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://segment-finder.vercel.app',
        'X-Title': 'B2B Segment Finder',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-001', // Using a smaller model
        messages: [{ role: 'user', content: prompt }],
        stream: false,
        max_tokens: 5000, // Adjust if needed
        temperature: 0.7,
      }),
    });
    
    // Get response details for better debugging
    const responseText = await response.text();
    
    if (!response.ok) {
      console.error('OpenRouter error response:', responseText);
      return NextResponse.json({ 
        error: `OpenRouter API error: ${response.status}`,
        details: responseText
      }, { status: 500 });
    }
    
    try {
      const data = JSON.parse(responseText);
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        return NextResponse.json({ 
          error: 'Invalid response format from OpenRouter',
          details: responseText 
        }, { status: 500 });
      }
      
      return NextResponse.json({ 
        result: data.choices[0].message.content 
      });
    } catch (parseError) {
      return NextResponse.json({ 
        error: 'Error parsing API response',
        details: responseText
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error enhancing segments:', error);
    return NextResponse.json({ 
      error: 'Failed to enhance segments',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
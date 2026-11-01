import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

/**
 * Generate or optimize social media post using Gemini
 */
export async function generateContent(prompt: string, tone = 'engaging'): Promise<string> {
  if (!ai) {
    return `[Mock AI Response - No GEMINI_API_KEY]: ${prompt} (Tone: ${tone})`;
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `You are a social media copywriter. Tone: ${tone}. Write a post for:\n${prompt}`,
  });

  return response.text?.trim() || '';
}


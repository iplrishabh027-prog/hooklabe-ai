
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { ReelIdea, GenerationConfig } from "../types";

export async function* generateReelIdeasStream(config: GenerationConfig): AsyncGenerator<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemPrompt = `[SYSTEM PROMPT]
You are Hooklabe AI, a world-class short-form video content strategist and viral hook engineer. 
Your goal is to engineer scripts that maximize watch time and scroll-stopping potential using specific psychological triggers.

Rules:
- Strictly no emojis in the script text.
- Sentences must be punchy, short, and conversational.
- The hook must occupy the first 3 seconds of value.
- Output MUST be valid JSON according to the schema.
- Content must be ELITE level (Pro-grade quality) regardless of the plan.`;

  const planPrompt = `[QUALITY PROTOCOL]
Apply ELITE psychological triggers. Use advanced marketing frameworks like AIDA (Attention, Interest, Desire, Action). 
Provide deep strategic analysis including neuromarketing insights. 
Every script must be engineered for maximum virality and retention.`;

  // Explicit instruction for Hook Style compliance
  const hookStyleInstruction = config.hookStyle === 'Auto' 
    ? "Since Hook Style is 'Auto', you MUST provide a diverse variety of viral hook styles for each script (e.g., mix Shocking, Curious, Emotional, Listicle, Challenge). For EACH script, you must define the 'style' field based on the specific psychological trigger you chose for that script."
    : `STRICT REQUIREMENT: EVERY SINGLE script generated MUST use the '${config.hookStyle}' psychological hook style. 
       - If '${config.hookStyle}' is 'Curious', create information gaps and cliffhangers.
       - If '${config.hookStyle}' is 'Shocking', create bold pattern interrupts and surprising claims.
       - If '${config.hookStyle}' is 'Emotional', create deep empathy or relatable human feelings.
       IMPORTANT: You MUST set the 'style' field in the JSON for EVERY script to be exactly: "${config.hookStyle}". No exceptions.`;

  const userInputPrompt = `[BASE USER INPUT PROMPT]
Niche: ${config.niche}
Topic: ${config.audienceType || 'General growth in this niche'}
Platform: ${config.platform}
Tone: ${config.tone}
Language: ${config.language}
Script Duration: ${config.duration}
Hook Style Requested: ${config.hookStyle}

${hookStyleInstruction}

Generate ${config.count} well-structured, high-performance script(s).`;

  const fullPrompt = `${systemPrompt}\n\n${planPrompt}\n\n${userInputPrompt}`;

  const stream = await ai.models.generateContentStream({
    model: 'gemini-3-flash-preview',
    contents: fullPrompt,
    config: {
      temperature: 0.8,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          scripts: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                style: { 
                  type: Type.STRING, 
                  description: "The name of the hook style used. If a specific style was requested (e.g. Curious, Shocking, Emotional), this MUST match that style exactly for all generated scripts." 
                },
                duration: { type: Type.STRING, description: "Video Duration e.g. 15s" },
                hook: { type: Type.STRING, description: "Scroll-stopping first line" },
                mainScript: { type: Type.STRING, description: "Final ready-to-use voiceover text (No emojis)" },
                onScreenText: { type: Type.STRING, description: "Text overlay for the screen" },
                cta: { type: Type.STRING, description: "The final closing line/call to action" },
                strategicAnalysis: { type: Type.STRING, description: "Deep psychological explanation of why this specific script is engineered to go viral." }
              },
              required: ["style", "duration", "hook", "mainScript", "onScreenText", "cta", "strategicAnalysis"]
            }
          },
          error: {
            type: Type.STRING,
            description: "Error message if the request is unsafe."
          }
        },
        required: ["scripts"]
      }
    }
  });

  for await (const chunk of stream) {
    if (chunk.text) {
      yield chunk.text;
    }
  }
}


import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { ReelIdea, GenerationConfig } from "../types";

export async function* generateReelIdeasStream(config: GenerationConfig): AsyncGenerator<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const isAuto = config.hookStyle === 'Auto';
  
  const hookInstruction = isAuto 
    ? "Distribute DIFFERENT emotional styles across the scripts: Curiosity, Shocking, Emotional, Motivational, Relatable."
    : `ALL generated scripts must strictly follow the ${config.hookStyle} style.`;

  const prompt = `You are a world-class short-form video script editor and viral content strategist.

Your task is to generate ${config.count} POWERFUL, SCROLL-STOPPING short-form video scripts for ${config.platform} in ${config.language}.

INPUT CONTEXT:
- Niche: ${config.niche}
- Target Audience: ${config.audienceType}
- Video Tone: ${config.tone}
- Target Duration: ${config.duration}
- Hook Instruction: ${hookInstruction}

GLOBAL ENHANCEMENT RULES:
- Write as if speaking directly to ONE person ("you" language).
- Use short, punchy sentences. Every line must earn its place.
- Avoid generic motivation or overused phrases.
- Remove robotic or AI-sounding language.
- Make the script sound confident, natural, and camera-ready.
- NO emojis. NO hashtags. NO explanations.

PACING STRUCTURE (Scale strict timing to fit ${config.duration}):
1. HOOK (First 0-3s): Must stop the scroll instantly. (Map to 'hook' field)
2. INTRO: Set the stage quickly.
3. PROBLEM: Build subtle emotional tension.
4. ACTION: Deliver the core value or story beat.
5. EMOTION/MESSAGE: Connect on a deeper level.
6. CLOSING: A save-worthy or reflection-based closing line. (Map to 'cta' field)

OUTPUT FORMAT:
Return a JSON object containing the scripts.
- 'style': The specific emotion/angle used.
- 'duration': The video duration.
- 'hook': The 0-3s scroll stopper.
- 'mainScript': The body of the script (Intro -> Problem -> Action -> Emotion). Do NOT include the hook or closing line here.
- 'onScreenText': Minimal bold text overlay.
- 'cta': The save-worthy closing line.
`;

  const stream = await ai.models.generateContentStream({
    model: 'gemini-3-flash-preview',
    contents: prompt,
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
                style: { type: Type.STRING, description: "The specific emotion/style used" },
                duration: { type: Type.STRING, description: "Video Duration e.g. 15s" },
                hook: { type: Type.STRING, description: "Scroll-stopping hook (0-3s)" },
                mainScript: { type: Type.STRING, description: "Full voiceover script (Intro -> Problem -> Action -> Emotion)" },
                onScreenText: { type: Type.STRING, description: "Minimal bold text overlay" },
                cta: { type: Type.STRING, description: "Save-worthy closing line" }
              },
              required: ["style", "duration", "hook", "mainScript", "onScreenText", "cta"]
            }
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

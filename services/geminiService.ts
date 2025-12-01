import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ModerationResult } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Schema for the moderation response
const moderationSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    isSafe: {
      type: Type.BOOLEAN,
      description: "True if the message is safe, polite, and free of profanity, hate speech, or explicit content. False otherwise.",
    },
    cleanedText: {
      type: Type.STRING,
      description: "The original text if safe, or a censored/rewritten version if unsafe (e.g., using asterisks or milder language).",
    },
    reason: {
      type: Type.STRING,
      description: "A short reason why it was flagged if unsafe.",
    }
  },
  required: ["isSafe", "cleanedText"],
};

export const checkMessageSafety = async (text: string, username: string): Promise<ModerationResult> => {
  if (!apiKey) {
    console.warn("API Key is missing. Skipping moderation.");
    return { isSafe: true, cleanedText: text };
  }

  try {
    const prompt = `
      You are a content moderator for a public live event screen. 
      Analyze the following message from user "${username}": "${text}".
      
      Strictly filter out:
      1. Profanity and swear words.
      2. Hate speech or discrimination.
      3. Sexually explicit content.
      4. Severe insults.

      If the message is unsafe, return isSafe: false and a cleanedText version (e.g., replacing bad words with *** or emojis).
      If the message is safe, return isSafe: true and the original text as cleanedText.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: moderationSchema,
        temperature: 0.1, // Low temperature for consistent moderation
      },
    });

    const jsonText = response.text;
    if (!jsonText) {
      throw new Error("Empty response from AI");
    }

    const result = JSON.parse(jsonText) as ModerationResult;
    return result;

  } catch (error) {
    console.error("Moderation error:", error);
    // Fail safe: Allow message but log error, or block strictly? 
    // For this demo, we'll allow it with a console warning to ensure UX continuity if API fails.
    return { isSafe: true, cleanedText: text }; 
  }
};

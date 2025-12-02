import { GoogleGenAI, Part } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Using Nano Banana (Gemini 2.5 Flash Image) as requested
const MODEL_NAME = 'gemini-2.5-flash-image';

interface GeneratePanelOptions {
  prompt: string;
  referenceImagesBase64: string[];
  styleDescription: string;
  panelIndex: number;
}

export const generatePanelImage = async ({
  prompt,
  referenceImagesBase64,
  styleDescription,
  panelIndex
}: GeneratePanelOptions): Promise<string> => {
  try {
    const parts: Part[] = [];

    // 1. Add Reference Images if available (Img2Img functionality)
    if (referenceImagesBase64 && referenceImagesBase64.length > 0) {
      referenceImagesBase64.forEach(img => {
        // Clean base64 string if it contains metadata header
        const cleanBase64 = img.split(',')[1] || img;
        parts.push({
          inlineData: {
            mimeType: 'image/png', // Assuming PNG/JPEG, API is flexible
            data: cleanBase64
          }
        });
      });
    }

    // 2. Construct the prompt
    // We combine the specific panel prompt with the global style description
    const fullPrompt = `
      Create a panel for a webtoon/comic strip.
      Panel Number: ${panelIndex + 1}.
      
      Style/Atmosphere: ${styleDescription || "Standard Webtoon Style"}.
      
      Scene Description: ${prompt}
      
      Ensure the character consistency if reference images are provided.
      The output must be a single high-quality image.
    `.trim();

    parts.push({ text: fullPrompt });

    // 3. Call the API
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: { parts },
      config: {
        // Nano Banana does not support responseMimeType: 'image/jpeg' in the config directly 
        // in the same way strictly for some SDK versions, but usually returns text or inlineData.
      }
    });

    // 4. Extract Image
    if (response.candidates && response.candidates.length > 0) {
      const content = response.candidates[0].content;
      if (content && content.parts) {
        for (const part of content.parts) {
          if (part.inlineData && part.inlineData.data) {
            return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
          }
        }
      }
    }

    throw new Error("No image data found in response.");

  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    throw new Error(error.message || "Failed to generate image");
  }
};
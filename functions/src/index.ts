import { onCall, HttpsError } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import * as admin from "firebase-admin";

admin.initializeApp();

// Secret defined in Google Cloud Secret Manager
const geminiApiKey = defineSecret("GEMINI_API_KEY");

export const rewritePostWithGemini = onCall(
  {
    secrets: [geminiApiKey],
    cors: ["https://darjix.com", "http://localhost:3000", "http://localhost:3001"],
    timeoutSeconds: 60,
    maxInstances: 5,
    invoker: "public",
  },
  async (request) => {
    // 1. Enforce authentication
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "You must be signed in to rewrite blog posts."
      );
    }

    const { title = "", content = "" } = request.data || {};

    if (!title.trim() && !content.trim()) {
      throw new HttpsError(
        "invalid-argument",
        "Please provide a title or draft notes to rewrite."
      );
    }

    // 2. Fetch secret securely from Google Cloud Secret Manager
    const apiKey = geminiApiKey.value();
    if (!apiKey) {
      throw new HttpsError(
        "failed-precondition",
        "GEMINI_API_KEY secret is not configured in Google Cloud Secret Manager."
      );
    }

    const promptText = `You are an expert editorial writer for Sal Darji's personal blog (darjix.com).
Your task is to take the author's draft title and raw notes/text and rewrite them into a compelling, clear, well-structured, and engaging blog post in Markdown format.

Author's Draft Title:
${title.trim() || "(Untitled draft)"}

Author's Draft Notes/Text:
${content.trim() || "(No body text provided - expand on the title into a thoughtful post)"}

Guidelines:
1. Polish the structure with clean Markdown (use ## or ### subheadings, bullet points where helpful, bold emphasis, and smooth, readable paragraphs).
2. Maintain an authentic, first-person perspective suitable for a tech executive / product leader (thoughtful, insightful, conversational yet professional, avoiding overly generic corporate jargon).
3. If the input title is rough, incomplete, or can be improved, provide an improved, punchy blog post title.
4. Output your response as a valid JSON object with EXACTLY this structure:
{
  "title": "Refined Blog Post Title",
  "content": "Full rewritten blog post in Markdown format..."
}`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: promptText }],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              responseMimeType: "application/json",
            },
          }),
        }
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const errMsg = errData.error?.message || `Gemini API returned HTTP status ${response.status}`;
        console.error("Gemini API call failed:", errMsg);
        throw new HttpsError("failed-precondition", `Gemini API Error: ${errMsg}`);
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        console.error("Gemini returned empty candidate:", JSON.stringify(data));
        throw new HttpsError("unavailable", "No content received from Gemini.");
      }

      let parsedTitle = "";
      let parsedContent = "";
      try {
        const parsed = JSON.parse(rawText);
        parsedTitle = parsed.title || "";
        parsedContent = parsed.content || "";
      } catch {
        parsedContent = rawText;
      }

      return {
        title: parsedTitle.trim() || title,
        content: parsedContent.trim() || rawText,
      };
    } catch (err: any) {
      console.error("rewritePostWithGemini handler error:", err);
      if (err instanceof HttpsError) {
        throw err;
      }
      throw new HttpsError(
        "failed-precondition",
        err.message || "Failed to rewrite post with Gemini."
      );
    }
  }
);


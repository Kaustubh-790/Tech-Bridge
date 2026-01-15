import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export const generateLearningPath = async (req, res) => {
  try {
    const { domain, level } = req.body;

    const prompt = `
      Create a structured learning path for a "${level}" student wanting to master "${domain}".
      
      Structure the response as a JSON object with a "modules" array.
      Each module must have:
      - title: String
      - description: String
      - youtubeQuery: A precise search query to find the best tutorial for this specific topic on YouTube.
      
      Limit to 5 key modules.
      
      OUTPUT JSON FORMAT ONLY:
      {
        "modules": [
          {
            "title": "...",
            "description": "...",
            "youtubeQuery": "..."
          }
        ]
      }
    `;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" },
    });

    const responseText = result.response.text();
    const learningPath = JSON.parse(responseText);

    res.status(200).json(learningPath);
  } catch (error) {
    console.error("Error generating path:", error);
    res.status(500).json({ message: "AI generation failed" });
  }
};

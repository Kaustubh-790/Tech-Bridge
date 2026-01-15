import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  // FORCE JSON MODE (Helps reduce formatting errors)
  generationConfig: { responseMimeType: "application/json" },
});

export const generateLearningPath = async (req, res) => {
  console.log("--> HIT: generateLearningPath");

  try {
    const { domain, level } = req.body;
    console.log("Payload:", { domain, level });

    if (!domain || !level) {
      throw new Error("Missing domain or level in request body");
    }

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
            "title": "React Basics",
            "description": "Learn components and props",
            "youtubeQuery": "react components tutorial 2024"
          }
        ]
      }
    `;

    console.log("--> Asking Gemini...");
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    console.log("--> Gemini Replied (Raw Length):", responseText.length);

    // CLEANUP: Remove markdown code fences if present (Fixes 90% of crashes)
    const cleanJson = responseText.replace(/```json|```/g, "").trim();

    let learningPath;
    try {
      learningPath = JSON.parse(cleanJson);
    } catch (parseError) {
      console.error("JSON Parse Failed. Raw Text:", cleanJson);
      return res
        .status(500)
        .json({ message: "AI returned invalid JSON", raw: cleanJson });
    }

    res.status(200).json(learningPath);
  } catch (error) {
    console.error("Server Error in generateLearningPath:", error);
    res.status(500).json({ message: error.message || "AI generation failed" });
  }
};

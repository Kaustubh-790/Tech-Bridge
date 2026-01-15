import { YoutubeTranscript } from "youtube-transcript";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export const startStudySession = async (req, res) => {
  const { videoUrl } = req.body;

  try {
    // 1. Fetch Transcript
    // logic: We try to get the transcript. If it fails (no captions), we error out.
    let transcriptItems;
    try {
      transcriptItems = await YoutubeTranscript.fetchTranscript(videoUrl);
    } catch (e) {
      return res.status(400).json({
        message: "This video has no captions. Please choose another.",
      });
    }

    // 2. Process Text (Handle LONG videos)
    // We take the first 40k characters (approx 45 mins of speaking) to stay fast.
    const fullText = transcriptItems.map((item) => item.text).join(" ");
    const safeText = fullText.substring(0, 40000) + "...";

    // 3. AI Prompt (The "NotebookLM" Brain)
    const prompt = `
      You are an AI Tutor. Analyze this video transcript:
      "${safeText}"

      Tasks:
      1. SUMMARIZE: Write a concise markdown summary of the core concepts.
      2. QUIZ: Generate 3 multiple-choice questions (MCQ) to test understanding.
      
      Return JSON only:
      {
        "summary": "markdown string...",
        "quiz": [
          {
            "question": "...",
            "options": ["A", "B", "C", "D"],
            "correctAnswer": "A",
            "explanation": "Why it is correct..."
          }
        ]
      }
    `;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" },
    });

    const studyData = JSON.parse(result.response.text());

    // Return data to Frontend to render the "Split Screen" Study Mode
    res.status(200).json(studyData);
  } catch (error) {
    console.error("Study session error:", error);
    res.status(500).json({ message: "Failed to generate study material" });
  }
};

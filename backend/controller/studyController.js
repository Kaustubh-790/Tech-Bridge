import YoutubeTranscript from "youtube-transcript";
import youtubeSr from "youtube-sr";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Extract CommonJS exports safely
const { searchOne } = youtubeSr;

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getStudyData = async (req, res) => {
  try {
    const { videoUrl } = req.body;

    if (!videoUrl) {
      return res.status(400).json({ error: "videoUrl is required" });
    }

    let videoId = "";
    let finalVideoUrl = videoUrl;

    // 1. Handle YouTube Search or Direct URL
    if (videoUrl.includes("search_query")) {
      const urlParams = new URLSearchParams(videoUrl.split("?")[1]);
      const query = urlParams.get("search_query");

      if (!query) {
        return res.status(400).json({ error: "Invalid search query" });
      }

      // ✅ WORKS in Node 22
      const searchResults = await searchOne(query);

      if (!searchResults || !searchResults.id) {
        return res.status(404).json({ error: "No video found" });
      }

      videoId = searchResults.id;
      finalVideoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    } else {
      const url = new URL(videoUrl);
      videoId = url.searchParams.get("v");

      if (!videoId) {
        return res.status(400).json({ error: "Invalid YouTube URL" });
      }
    }

    // 2. Fetch Transcript
    let transcriptText = "";

    try {
      const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);
      transcriptText = transcriptItems.map((item) => item.text).join(" ");
    } catch (err) {
      console.error("Transcript Error:", err);
      return res.status(400).json({
        error: "Could not fetch transcript. Video might not have captions.",
      });
    }

    // 3. Generate Summary & Quiz with Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
You are an expert tutor. Analyze the following video transcript and generate a study guide.

Transcript:
"${transcriptText.substring(0, 15000)}"

Task:
1. Create a concise markdown summary of the key concepts.
2. Create a quiz with 5 multiple-choice questions based on the content.

Output must be strictly valid JSON with this structure:
{
  "summary": "markdown string...",
  "quiz": [
    {
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correctAnswer": "string (must match one option)",
      "explanation": "string"
    }
  ]
}
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Clean JSON markdown if present
    const jsonString = responseText.replace(/```json|```/g, "").trim();
    const studyData = JSON.parse(jsonString);

    // 4. Send Response
    res.json({
      videoUrl: finalVideoUrl,
      summary: studyData.summary,
      quiz: studyData.quiz,
    });
  } catch (error) {
    console.error("Study Controller Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export default getStudyData;

import fs from "fs";
import pdf from "pdf-parse";
import OpenAI from "openai";

const ai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
});

export const checkATS = async (req, res) => {
  try {
    const resumeFile = req.files.resume[0];
    const jdFile = req.files.jobDescription[0];

    const resumePdf = await pdf(
      fs.readFileSync(resumeFile.path)
    );

    const jdPdf = await pdf(
      fs.readFileSync(jdFile.path)
    );

    const resumeText = resumePdf.text;
    const jdText = jdPdf.text;

    const response =
      await ai.chat.completions.create({
        model: process.env.OPENAI_MODEL,

        messages: [
          {
            role: "system",
            content:
              "You are an expert ATS Resume Analyzer and Career Coach.",
          },
          {
            role: "user",
            content: `
Compare the resume against the job description.

Return ONLY valid JSON.

{
  "score": 0,
  "matchStatus": "",
  "fitExplanation": "",
  "strengths": "",
  "weaknesses": "",
  "suggestions": "",
  "missingKeywords": [],
  "recommendedSkills": [],
  "recommendedProjects": []
}
Rules:

score:
0-100 ATS compatibility score.

matchStatus:
- Strong Match
- Moderate Match
- Weak Match

fitExplanation:
Explain whether the candidate fits this role.

strengths:
List major strengths.

weaknesses:
List major weaknesses.

suggestions:
Specific improvements.

missingKeywords:
Keywords present in JD but missing in resume.

recommendedSkills:
Skills candidate should learn.

recommendedProjects:
Projects candidate should build.

Job Description:
${jdText}

Resume:
${resumeText}
`,
          },
        ],
      });

    let content =
      response.choices[0].message.content;

    content = content
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const result = JSON.parse(content);

    res.json(result);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
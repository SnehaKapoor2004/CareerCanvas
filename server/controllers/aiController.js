import Resume from "../models/Resume.js";
import ai from "../config/ai.js";
import fs from "fs";

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");


// ===================
// Upload Resume (AI Parsing)
// ===================
export const uploadResume = async (req, res) => {
  try {
    const { title } = req.body;
    const userId = req.userId;
    const file = req.file;

    if (!title) return res.status(400).json({ message: "Title required" });
    if (!file) return res.status(400).json({ message: "File required" });

    // -------- Extract PDF Text --------
    const filePath = file.path;
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    const resumeText = data.text || "";

    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    if (!resumeText.trim()) {
      return res.status(400).json({ message: "No text found in PDF" });
    }

    // -------- AI Extraction --------
    const response = await ai.chat.completions.create({
      model: process.env.OPENAI_MODEL,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `
Extract resume into STRICT JSON:

{
  "personal_info": {
    "name": "",
    "email": "",
    "phone": "",
    "location": ""
  },
  "summary": "",
  "skills": [],
  "experience": [
    { "company": "", "role": "", "description": "" }
  ],
  "education": [
    { "degree": "", "institution": "", "year": "" }
  ]
}

Return ONLY JSON.
`
        },
        { role: "user", content: resumeText }
      ]
    });

    let parsedData = JSON.parse(response.choices[0].message.content);

    // -------- SAFE NORMALIZATION --------

    if (!parsedData.personal_info) {
      parsedData.personal_info = { name: "", email: "", phone: "", location: "" };
    }

    // EXPERIENCE FIX
    if (!Array.isArray(parsedData.experience)) {
      parsedData.experience = [{
        company: "",
        role: "",
        description: parsedData.experience || ""
      }];
    } else {
      parsedData.experience = parsedData.experience.map(exp => ({
        company: exp.company || "",
        role: exp.role || "",
        description: exp.description || ""
      }));
    }

    // EDUCATION FIX
    if (!Array.isArray(parsedData.education)) {
      parsedData.education = [{
        degree: parsedData.education || "",
        institution: "",
        year: ""
      }];
    } else {
      parsedData.education = parsedData.education.map(edu => ({
        degree: edu.degree || "",
        institution: edu.institution || "",
        year: edu.year || ""
      }));
    }

    // SKILLS FIX
    if (!Array.isArray(parsedData.skills)) {
      parsedData.skills = parsedData.skills ? [parsedData.skills] : [];
    }

    // -------- MAP AI OUTPUT TO SCHEMA --------
    // Be resilient to different AI output shapes for name/summary/skills
    const extractName = () => {
      if (parsedData.personal_info) {
        return parsedData.personal_info.name || parsedData.personal_info.full_name || parsedData.personal_info.fullName || '';
      }
      return parsedData.name || parsedData.full_name || '';
    };

    const extractSummary = () => {
      return parsedData.summary || parsedData.professional_summary || parsedData.profile || '';
    };

    const extractSkills = () => {
      if (!parsedData.skills) return [];
      if (Array.isArray(parsedData.skills)) return parsedData.skills;
      // if comma-separated string
      if (typeof parsedData.skills === 'string') return parsedData.skills.split(/,|;|\n/).map(s => s.trim()).filter(Boolean);
      return [];
    };

    const extractLinkedin = () => {
      // look in personal_info first
      const p = parsedData.personal_info || {};
      const candidates = [p.linkedin, p.linkedin_profile, p.linkedin_url, p.website, parsedData.linkedin, parsedData.website];
      for (const c of candidates) {
        if (typeof c === 'string' && /linkedin\.com|linkedin/i.test(c)) return c.trim();
      }

      // deep search for any linkedin url in parsedData values
      const queue = [parsedData];
      while (queue.length) {
        const obj = queue.shift();
        if (!obj || typeof obj !== 'object') continue;
        for (const key of Object.keys(obj)) {
          const val = obj[key];
          if (typeof val === 'string' && /linkedin\.com|linkedin/i.test(val)) return val.trim();
          if (typeof val === 'object') queue.push(val);
        }
      }

      // fallback: try to find linkedin url or handle in raw resume text
      try {
        // full url
        let m = resumeText.match(/https?:\/\/(?:www\.)?linkedin\.com\S*/i);
        if (m && m[0]) return normalizeUrl(m[0]);

        // common handle patterns: linkedin.com/in/username or linkedin: username or in/username
        m = resumeText.match(/linkedin(?:\.com)?[:\s\/]*?(?:in\/)?([a-z0-9\-_.]{2,60})/i);
        if (m && m[1]) return `https://www.linkedin.com/in/${m[1].trim()}`;

        // sometimes written as '/in/username'
        m = resumeText.match(/(?:\/in\/|linkedin\/(?:in|pub)\/)([a-z0-9\-_.]{2,60})/i);
        if (m && m[1]) return `https://www.linkedin.com/in/${m[1].trim()}`;
      } catch (e) {}

      return '';
    };

    const extractWebsite = () => {
      // Prefer GitHub URL if present
      const p = parsedData.personal_info || {};
      const candidates = [p.website, p.website_url, parsedData.website, parsedData.url, parsedData.website_url];
      for (const c of candidates) {
        if (typeof c === 'string' && /github\.com/i.test(c)) return c.trim();
      }

      // deep search in parsedData for a github url
      const queue2 = [parsedData];
      while (queue2.length) {
        const obj = queue2.shift();
        if (!obj || typeof obj !== 'object') continue;
        for (const key of Object.keys(obj)) {
          const val = obj[key];
          if (typeof val === 'string' && /github\.com/i.test(val)) return normalizeUrl(val);
          if (typeof val === 'object') queue2.push(val);
        }
      }

      // fallback: try to find github or any url in raw resume text
      try {
        // github url
        let g = resumeText.match(/https?:\/\/(?:www\.)?github\.com\S*/i);
        if (g && g[0]) return normalizeUrl(g[0]);

        // github handle like 'github: username' or 'github username'
        g = resumeText.match(/github[:\s\/]*([a-z0-9\-_.]{1,39})/i);
        if (g && g[1]) return `https://github.com/${g[1].trim()}`;

        // any url
        const any = resumeText.match(/https?:\/\/(?:www\.)?\S+\.[a-z]{2,}\S*/i);
        if (any && any[0]) return normalizeUrl(any[0]);
      } catch (e) {}

      return '';
    };

    // Normalize URL to include protocol and strip trailing punctuation
    const normalizeUrl = (u) => {
      if (!u || typeof u !== 'string') return '';
      let s = u.trim();
      // remove trailing punctuation
      s = s.replace(/[.,;:]?\)?\]?\!?$/,'');
      if (!/^https?:\/\//i.test(s)) {
        s = 'https://' + s.replace(/^www\./i, '');
      }
      return s;
    };

    const extractProfession = () => {
      const nameVal = (extractName() || '').toLowerCase().replace(/\s+/g, '').trim();
      const p = parsedData.personal_info || {};
      const candidates2 = [p.profession, parsedData.profession, parsedData.title, parsedData.headline, parsedData.job_title, parsedData.role];
      for (const c of candidates2) {
        if (!c || typeof c !== 'string') continue;
        const trimmed = c.trim();
        if (!trimmed) continue;
        // ignore candidates that look like the name
        if (trimmed.toLowerCase().replace(/\s+/g, '').includes(nameVal)) continue;
        if (trimmed.length > 2 && trimmed.length < 120) return trimmed;
      }

      // try first experience role/position
      try {
        const exp0 = Array.isArray(parsedData.experience) && parsedData.experience[0];
        const roleCandidate = exp0 && (exp0.role || exp0.position || exp0.title);
        if (roleCandidate && typeof roleCandidate === 'string') {
          const t = roleCandidate.trim();
          if (t && !t.toLowerCase().includes(nameVal)) return t;
        }
      } catch (e) {}

      // search resume text for common titles
      try {
        const titleRegex = /(?:Software Engineer|Senior Software Engineer|Full Stack Developer|Frontend Developer|Backend Developer|Product Manager|Data Scientist|Data Analyst|UX Designer|UI Designer|Project Manager|DevOps Engineer|QA Engineer|Android Developer|iOS Developer|Web Developer|Systems Engineer|Business Analyst|Consultant|Designer|Engineer|Developer|Manager|Architect|Specialist|Administrator)\b/i;
        const m = resumeText.match(titleRegex);
        if (m && m[0]) return m[0].trim();
      } catch (e) {}

      return '';
    };

    const resumeToSave = {
      userId,
      title,
      professional_summary: extractSummary(),
      skills: extractSkills(),
      personal_info: {
        full_name: extractName(),
        email: parsedData.personal_info?.email || parsedData.email || '',
        phone: parsedData.personal_info?.phone || parsedData.phone || '',
        location: parsedData.personal_info?.location || parsedData.location || '',
        profession: (function(){
          const pval = extractProfession();
          if (pval) return pval;
          const raw = parsedData.personal_info?.profession || parsedData.profession || parsedData.title || '';
          const nameVal = (extractName() || '').toLowerCase().replace(/\s+/g,'').trim();
          if (raw && typeof raw === 'string' && !raw.toLowerCase().replace(/\s+/g,'').includes(nameVal)) return raw.trim();
          return '';
        })(),
        linkedin: parsedData.personal_info?.linkedin || parsedData.linkedin || parsedData.personal_info?.linkedin_profile || extractLinkedin() || '',
        website: extractWebsite() || parsedData.personal_info?.website || parsedData.website || parsedData.personal_info?.website_url || parsedData.url || '',
      },
      // Map experience items to schema fields (position, description)
      experience: Array.isArray(parsedData.experience)
        ? parsedData.experience.map(exp => ({
            company: exp.company || "",
            position: exp.role || exp.position || "",
            start_date: exp.start_date || "",
            end_date: exp.end_date || "",
            description: exp.description || "",
            is_current: !!exp.is_current,
          }))
        : [],
      // Map education
      education: Array.isArray(parsedData.education)
        ? parsedData.education.map(edu => ({
            institution: edu.institution || "",
            degree: edu.degree || "",
            field: edu.field || "",
            graduation_date: edu.year || edu.graduation_date || "",
            gpa: edu.gpa || "",
          }))
        : [],
      projects: [],
    };

    const newResume = await Resume.create(resumeToSave);
    console.log('Saved resume from AI upload:', JSON.stringify(newResume));

    return res.json({ resumeId: newResume._id, resume: newResume });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};


// ===================
// Enhance Professional Summary
// ===================
export const enhanceProfessionalSummary = async (req, res) => {
  try {
    const { summary } = req.body;
    if (!summary || !summary.trim()) return res.status(400).json({ message: "Summary required" });

    const response = await ai.chat.completions.create({
      model: process.env.OPENAI_MODEL,
      messages: [
        { role: "system", content: "You are an expert resume writer. Improve the professional summary to be concise, impactful, and tailored for hiring managers. Keep it under 3 sentences and focus on achievements and skills." },
        { role: "user", content: `Improve and rewrite this professional summary:\n\n${summary}` }
      ]
    });

    const enhanced = response.choices[0].message.content;
    return res.json({ enhancedSummary: enhanced });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};


// ===================
// Enhance Job Description
// ===================
export const enhanceJobDescription = async (req, res) => {
  try {
    const { jobDescription } = req.body;
    if (!jobDescription || !jobDescription.trim()) return res.status(400).json({ message: "Job description required" });

    const response = await ai.chat.completions.create({
      model: process.env.OPENAI_MODEL,
      messages: [
        { role: "system", content: "You are an expert resume writer. Rewrite the job description bullets to be achievement-focused, use action verbs, quantify results when possible, and keep each bullet concise." },
        { role: "user", content: `Rewrite and improve these job description bullets:\n\n${jobDescription}` }
      ]
    });

    const enhanced = response.choices[0].message.content;
    return res.json({ enhancedJobDescription: enhanced });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
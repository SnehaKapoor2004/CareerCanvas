import { useState } from "react";
import api from "../configs/api";
import Navbar from "../components/Navbar";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";



function ATSChecker() {
  const [resumeFile, setResumeFile] = useState(null);
  const [jdFile, setJdFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCheck = async () => {
    if (!resumeFile || !jdFile) {
      alert("Please upload Resume and Job Description");
      return;
    }

    const formData = new FormData();
    formData.append("resume", resumeFile);
    formData.append("jobDescription", jdFile);

    try {
      setLoading(true);

      const res = await api.post(
        "/api/ats/check",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setResult(res.data);
    } catch (error) {
      console.log(error);
      alert("Failed to analyze resume");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-5xl mx-auto">
<div
  onClick={() => navigate("/app")}
  className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 cursor-pointer mb-6 w-fit"
>
  <ArrowLeft size={20} />
  <span className="text-lg">Back to Dashboard</span>
</div>
<h1 className="text-4xl font-bold mb-2">
  ATS Resume Checker
</h1>

<p className="text-slate-500 mb-8">
  Upload Resume and Job Description to check ATS compatibility and job fit.
</p>

          <div className="bg-white rounded-2xl border shadow-sm p-8">

            <div className="space-y-5">

              <div>
                <label className="block font-medium mb-2">
                  Upload Resume
                </label>

                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) =>
                    setResumeFile(e.target.files[0])
                  }
                  className="w-full"
                />
              </div>

              <div>
                <label className="block font-medium mb-2">
                  Upload Job Description
                </label>

                <input
                  type="file"
                  accept=".pdf,.txt"
                  onChange={(e) =>
                    setJdFile(e.target.files[0])
                  }
                  className="w-full"
                />
              </div>

              <button
                onClick={handleCheck}
                disabled={loading}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading
                  ? "Analyzing..."
                  : "Check ATS Score"}
              </button>

            </div>

            {result && (
              <div className="mt-8">

                {/* ATS Score */}
                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                  <h2 className="text-3xl font-bold text-green-700">
                    ATS Score: {result.score}/100
                  </h2>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mt-5">
  <h3 className="font-semibold text-lg mb-2">
    Resume Match Verdict
  </h3>

  <p
    className={`font-bold text-lg ${
      result.matchStatus === "Strong Match"
        ? "text-green-600"
        : result.matchStatus === "Moderate Match"
        ? "text-yellow-600"
        : "text-red-600"
    }`}
  >
    {result.matchStatus}
  </p>

  <p className="mt-2 text-slate-700">
    {result.fitExplanation}
  </p>
</div>

                {/* Match Verdict */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mt-5">
                  <h3 className="font-semibold text-lg mb-2">
                    Resume Match Verdict
                  </h3>

                  <p className="font-bold text-blue-700">
                    {result.matchStatus}
                  </p>

                  <p className="mt-2 text-slate-700">
                    {result.fitExplanation}
                  </p>
                </div>

                {/* Strengths & Weaknesses */}
                <div className="grid md:grid-cols-2 gap-5 mt-6">

                  <div className="bg-green-50 p-5 rounded-xl">
                    <h3 className="font-semibold mb-2">
                      Strengths
                    </h3>

                    <p>{result.strengths}</p>
                  </div>

                  <div className="bg-red-50 p-5 rounded-xl">
                    <h3 className="font-semibold mb-2">
                      Weaknesses
                    </h3>

                    <p>{result.weaknesses}</p>
                  </div>

                </div>

                {/* Suggestions */}
                <div className="bg-yellow-50 p-5 rounded-xl mt-5">
                  <h3 className="font-semibold mb-2">
                    Suggestions
                  </h3>

                  <p>{result.suggestions}</p>
                </div>

                {/* Missing Keywords */}
                {result?.missingKeywords?.length > 0 && (
                  <div className="bg-orange-50 p-5 rounded-xl mt-5">
                    <h3 className="font-semibold mb-3">
                      Missing Keywords
                    </h3>

                    <div className="flex flex-wrap gap-2">
                      {result.missingKeywords.map(
                        (keyword, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-orange-200 rounded-full"
                          >
                            {keyword}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Recommended Skills */}
                {result?.recommendedSkills?.length > 0 && (
                  <div className="bg-purple-50 p-5 rounded-xl mt-5">
                    <h3 className="font-semibold mb-3">
                      Recommended Skills
                    </h3>

                    <div className="flex flex-wrap gap-2">
                      {result.recommendedSkills.map(
                        (skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-purple-200 rounded-full"
                          >
                            {skill}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}

                {result?.recommendedProjects?.length > 0 && (
  <div className="bg-cyan-50 p-5 rounded-xl mt-5">
    <h3 className="font-semibold mb-3">
      Recommended Projects
    </h3>

    <ul className="list-disc pl-5 space-y-1">
      {result.recommendedProjects.map(
        (project, index) => (
          <li key={index}>{project}</li>
        )
      )}
    </ul>
  </div>
)}

                {/* Recommended Projects */}
                {result?.recommendedProjects?.length > 0 && (
                  <div className="bg-cyan-50 p-5 rounded-xl mt-5">
                    <h3 className="font-semibold mb-3">
                      Recommended Projects
                    </h3>

                    <ul className="list-disc pl-5 space-y-1">
                      {result.recommendedProjects.map(
                        (project, index) => (
                          <li key={index}>
                            {project}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}

              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}

export default ATSChecker;
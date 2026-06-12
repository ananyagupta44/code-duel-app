"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import "./problem.css";
import Editor from "@monaco-editor/react";

export default function ProblemPage() {
  const { id } = useParams();
  const router = useRouter();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [running, setRunning] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [showLanguages, setShowLanguages] = useState(false);
  const languageDropdownRef = useRef(null);
  const [showSuccessBanner, setShowSuccessBanner] =
  useState(false);

  const runCode = async () => {
    try {
      setRunning(true);

      const res = await api.post("/code/run", {
        language,
        code,
        functionName: problem.functionName,
        input: customInput,
      });

      setOutput(res.data.output);
    } catch (error) {
      setOutput("Execution Failed");
      console.log(error);
    } finally {
      setRunning(false);
    }
  };

  const submitCode = async () => {
  try {
    setSubmitting(true);

    const res = await api.post(`/code/submit/${id}`, {
      language,
      code,
    });

    if (res.data.verdict === "Accepted") {
      setShowSuccessBanner(true);

      setTimeout(() => {
        router.push("/practice");
      }, 2500);
    } else {
      setOutput(
        `${res.data.verdict}
Passed ${res.data.passed}/${res.data.total} Test Cases`
      );
    }
  } catch (error) {
    console.log(error);
    setOutput("Submission Failed");
  } finally {
    setSubmitting(false);
  }
};

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const res = await api.get(`/problems/${id}`);
        setProblem(res.data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProblem();
  }, [id]);

  useEffect(() => {
    if (!problem) return;

    const savedCode = localStorage.getItem(`codeduel-${id}-${language}`);

    if (savedCode) {
      setCode(savedCode);
    } else {
      setCode(problem.starterCode?.[language] || "");
    }
  }, [problem, language, id]);

  useEffect(() => {
    if (!problem) return;

    setCode(problem.starterCode?.[language] || "");

    const firstExample = problem.testCases?.find((t) => !t.isHidden);

    if (firstExample) {
      setCustomInput(JSON.stringify(JSON.parse(firstExample.input), null, 2));
    }
  }, [problem, language]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        languageDropdownRef.current &&
        !languageDropdownRef.current.contains(event.target)
      ) {
        setShowLanguages(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!id) return;

    localStorage.setItem(`codeduel-${id}-${language}`, code);
  }, [code, id, language]);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!problem) {
    return <div className="loading">Problem Not Found</div>;
  }

  return (
    <div className="problem-page">
      <div className="problem-left">
        <h1>{problem.title}</h1>

        <div className="problem-meta">
          <span className={`meta-pill ${problem.difficulty}`}>
            {problem.difficulty}
          </span>

          <span className="meta-pill">
            {problem.topic
              .split("-")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ")}
          </span>

          <span className="meta-pill">{problem.timeLimit}s</span>
        </div>

        <div className="problem-description">
          <p>{problem.description}</p>
        </div>

        <div className="examples">
          <h2>Examples</h2>

          {problem.testCases
            ?.filter((test) => !test.isHidden)
            .map((test, index) => (
              <div className="example-card" key={index}>
                <h3>Example {index + 1}</h3>

                <p>
                  <strong>Input:</strong>
                </p>

                <pre>{JSON.stringify(JSON.parse(test.input), null, 2)}</pre>

                <p>
                  <strong>Output:</strong>
                </p>

                <pre>{test.expectedOutput}</pre>
              </div>
            ))}
        </div>
      </div>

      <div className="problem-right">
        <div className="editor-container">
          <div className="editor-header">
            <div className="language-selector" ref={languageDropdownRef}>
              <button
                className="language-btn"
                onClick={() => setShowLanguages((prev) => !prev)}
              >
                {language === "javascript"
                  ? "JavaScript"
                  : language === "python"
                    ? "Python"
                    : "C++"}

                <span
                  style={{
                    transform: showLanguages
                      ? "rotate(180deg)"
                      : "rotate(0deg)",
                    transition: "0.2s",
                  }}
                >
                  ▼
                </span>
              </button>

              {showLanguages && (
                <div className="language-menu">
                  <div
                    onClick={() => {
                      setLanguage("javascript");
                      setShowLanguages(false);
                    }}
                  >
                    JavaScript
                  </div>

                  <div
                    onClick={() => {
                      setLanguage("python");
                      setShowLanguages(false);
                    }}
                  >
                    Python
                  </div>

                  <div
                    onClick={() => {
                      setLanguage("cpp");
                      setShowLanguages(false);
                    }}
                  >
                    C++
                  </div>
                </div>
              )}
            </div>

            <div className="editor-actions">
              <button className="run-btn" onClick={runCode}>
                {running ? "Running..." : "Run Code"}
              </button>

              <button className="submit-btn" onClick={submitCode}>
                {submitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>

          <div className="editor-body">
            <Editor
              height="100%"
              theme="vs-dark"
              language={language === "cpp" ? "cpp" : language}
              value={code}
              onChange={(value) => setCode(value || "")}
              options={{
                fontSize: 15,
                minimap: {
                  enabled: false,
                },
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
            />
          </div>
          <div className="custom-input-panel">
            <div className="custom-input-info">
              <p>Enter input as JSON matching the example format.</p>

              <small>Example: {'{"nums":[2,7,11,15],"target":9}'}</small>
            </div>

            <textarea
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Enter custom input..."
            />
          </div>

          <div className="output-panel">
            <h3>Output</h3>
            <pre>{output}</pre>
          </div>
        </div>
      </div>
      {showSuccessBanner && (
  <div className="success-overlay">
    <div className="success-banner">
      <div className="success-icon">🏆</div>

      <h2>Problem Solved!</h2>

      <p>
        Congratulations! Your solution passed all
        test cases.
      </p>

      <span>
        Redirecting to Practice Arena...
      </span>
    </div>
  </div>
)}
    </div>
  );
}

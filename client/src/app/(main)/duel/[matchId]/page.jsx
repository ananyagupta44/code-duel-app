"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import "./duel.css";
import Editor from "@monaco-editor/react";
import { fjalla, chivo } from "@/fonts";
import { useRouter } from "next/navigation";
import socket from "@/lib/socket";
import { IoIosHourglass } from "react-icons/io";
import { throttle } from "lodash";
import { useAuth } from "@/context/authContext";
import { useMemo } from "react";

export default function DuelPage() {
  const { matchId } = useParams();
  const router = useRouter();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const { user } = useAuth();
  const emitCodeUpdate = useMemo(
    () =>
      throttle((newCode) => {
        socket.emit("match:codeUpdate", {
          matchId,
          playerId: user?._id,
          code: newCode,
          language,
        });
      }, 500),
    [matchId, language, user],
  );

  useEffect(() => {
    return () => {
      emitCodeUpdate.cancel();
    };
  }, [emitCodeUpdate]);

  const getStorageKey = (lang) => `duel_${matchId}_${lang}`;

  const handleRunCode = async () => {
    try {
      setRunning(true);

      const input = customInput.trim() || match.problemId.testCases?.[0]?.input;

      const res = await api.post("/code/run", {
        language,
        code,
        functionName: match.problemId.functionName,
        input,
        matchId,
      });

      setOutput(res.data.output);
    } catch (error) {
      setOutput(error.response?.data?.message || "Execution Failed");
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      const res = await api.post(`/matches/${matchId}/submit`, {
        language,
        code,
      });

      if (res.data.status === "finished") {
        router.push(`/duel/result/${matchId}`);
        return;
      }

      setOutput(`
Verdict: ${res.data.verdict}

Passed: ${res.data.passed}/${res.data.total}

Progress: ${res.data.progress}%

Status: ${res.data.status}
`);

      // later:
      // emit progress update socket event here
    } catch (error) {
      setOutput(error.response?.data?.message || "Submission Failed");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const res = await api.get(`/matches/${matchId}`);

        setMatch(res.data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    if (matchId) {
      fetchMatch();
    }
  }, [matchId]);

  useEffect(() => {
    if (!matchId) return;

    socket.emit("joinMatch", matchId);

    socket.on("progressUpdated", (data) => {
      setMatch((prev) => ({
        ...prev,
        player1Progress: data.player1Progress,
        player2Progress: data.player2Progress,
      }));
    });

    socket.on("matchFinished", (data) => {
      router.push(`/duel/result/${matchId}`);
    });

    return () => {
      socket.off("progressUpdated");
      socket.off("matchFinished");
    };
  }, [matchId, router]);

  useEffect(() => {
    if (!match?.startedAt) return;

    const updateTimer = () => {
      const elapsed = Math.floor(
        (Date.now() - new Date(match.startedAt)) / 1000,
      );

      const remaining = Math.max(0, match.durationSecs - elapsed);

      setTimeLeft(remaining);
    };

    updateTimer();

    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [match]);

  useEffect(() => {
    if (!match?.problemId || !matchId) return;

    const key = getStorageKey(language);

    const savedCode = localStorage.getItem(key);

    if (savedCode && savedCode.trim() !== "") {
      setCode(savedCode);
    } else {
      const starter = match.problemId.starterCode?.[language] || "";

      setCode(starter);
    }
  }, [match, language, matchId]);

  useEffect(() => {
    if (!matchId) return;

    localStorage.setItem(getStorageKey(language), code);
  }, [code, language, matchId]);

  useEffect(() => {
    const savedInput = localStorage.getItem(`duel_input_${matchId}`);

    if (savedInput) {
      setCustomInput(savedInput);
    }
  }, [matchId]);

  useEffect(() => {
    localStorage.setItem(`duel_input_${matchId}`, customInput);
  }, [customInput, matchId]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);

    const secs = seconds % 60;

    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatInput = (input) => {
    try {
      const parsed = JSON.parse(input);

      return Object.entries(parsed)
        .map(([key, value]) => `${key} = ${JSON.stringify(value)}`)
        .join("\n");
    } catch {
      return input;
    }
  };

  if (loading) {
    return <div className="duel-loading">Loading Match...</div>;
  }

  if (!match) {
    return <div className="duel-loading">Match Not Found</div>;
  }

  return (
    <div className={`duel-page ${chivo.className}`}>
      <div className="duel-content">
        <div className="left-column">
          {/* Problem */}
          <div className="problem-panel">
            <div className={`panel-header ${fjalla.className}`}>
              <h2>{match.problemId.title}</h2>
            </div>
            <div className="problem-body">
              <p>{match.problemId.description}</p>
              <h3>Examples</h3>
              {match.problemId.testCases?.map((testCase, index) => (
                <div key={index} className="example-box">
                  <h3>Example {index + 1}</h3>
                  <div className="example-section">
                    <div>
                      <strong>Input</strong>
                      <pre>{formatInput(testCase.input)}</pre>
                    </div>
                    <div>
                      <strong>Output</strong>
                      <pre>{testCase.expectedOutput}</pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Editor */}
          <div className="editor-panel">
            <div className="editor-header">
              <h2 className={fjalla.className}>Code Editor</h2>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
              </select>
            </div>
            <div className="editor-layout">
              <div className="editor-container">
                <Editor
                  height="600px"
                  theme="vs-dark"
                  language={language}
                  value={code}
                  onChange={(value) => {
                    setCode(value);

                    emitCodeUpdate(value);
                  }}
                  options={{
                    minimap: { enabled: false },
                    automaticLayout: true,
                    scrollBeyondLastLine: false,
                    scrollbar: {
                      alwaysConsumeMouseWheel: false,
                      verticalScrollbarSize: 10,
                    },
                    mouseWheelZoom: false,
                  }}
                />
              </div>
              <div className="output-panel">
                <div className="input-section">
                  <h3>Custom Input</h3>
                  <textarea
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder={`Example:\n\n{\n  "nums":[2,7,11,15],\n  "target":9\n}`}
                  />
                </div>
                <div className="output-section">
                  <h3>Output</h3>
                  <pre>{output || "Run your code..."}</pre>
                </div>
              </div>
            </div>
            <div className="editor-actions">
              <button
                className="run-btn"
                onClick={handleRunCode}
                disabled={running || match?.status === "finished"}
              >
                {running ? "Running..." : "Run Code"}
              </button>
              <button
                className="submit-btn"
                onClick={handleSubmit}
                disabled={submitting || match?.status === "finished"}
              >
                {submitting
                  ? "Submitting..."
                  : match?.status === "finished"
                    ? "Match Finished"
                    : "Submit Solution"}
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="match-sidebar">
          <div className="duel-sidebar-card">
            <div className="timer-box">
              <IoIosHourglass size={32} />
              <span>{formatTime(timeLeft)}</span>
            </div>
            {match.status === "finished" && match.winnerId && (
              <div className="winner-banner">
                🏆 Winner: {match.winnerId.username}
              </div>
            )}
            <div className="vs-section">
              <div
                className={`player-section ${match.player1Progress > match.player2Progress ? "leading" : ""}`}
              >
                <h3 className={`${fjalla.className} player-name`}>
                  {match.player1Id.username}
                </h3>
                <div className="player-progress">
                  <div
                    className="progress-fill"
                    style={{ width: `${match.player1Progress}%` }}
                  />
                </div>
                <span>{match.player1Progress}%</span>
              </div>
              <div className={`${fjalla.className} vs`}>VS</div>
              <div
                className={`player-section ${match.player2Progress > match.player1Progress ? "leading" : ""}`}
              >
                <h3 className={`${fjalla.className} player-name`}>
                  {match.player2Id.username}
                </h3>
                <div className="player-progress">
                  <div
                    className="progress-fill"
                    style={{ width: `${match.player2Progress}%` }}
                  />
                </div>
                <span>{match.player2Progress}%</span>
              </div>
            </div>
          </div>

          <div className="sidebar-card">
            <h3>Match Details</h3>
            <p>
              <strong>Type:</strong> {match.matchType}
            </p>
            <p>
              <strong>Difficulty:</strong> {match.problemId.difficulty}
            </p>
            <p>
              <strong>Topic:</strong> {match.problemId.topic}
            </p>
            <p>
              <strong>Function:</strong> {match.problemId.functionName}
            </p>
            <p>
              <strong>Time Limit:</strong> {match.problemId.timeLimit}s
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

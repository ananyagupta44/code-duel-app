"use client";

import "./spectateModal.css";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import Editor from "@monaco-editor/react";
import { X } from "lucide-react";
import socket from "@/lib/socket";

const LANGUAGE_LABELS = {
  javascript: "JavaScript",
  typescript: "TypeScript",
  python: "Python",
  java: "Java",
  cpp: "C++",
  c: "C",
  csharp: "C#",
  go: "Go",
  ruby: "Ruby",
};

const DIFFICULTY_TAG = {
  easy: "diff-tag-easy",
  medium: "diff-tag-medium",
  hard: "diff-tag-hard",
};

function formatLanguage(lang) {
  if (!lang) return "JavaScript";
  return LANGUAGE_LABELS[lang.toLowerCase()] || lang;
}

function formatDuration(totalSeconds) {
  if (totalSeconds == null || Number.isNaN(totalSeconds) || totalSeconds < 0) {
    return "--:--";
  }

  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = Math.floor(totalSeconds % 60);
  const paddedMins = String(mins).padStart(2, "0");
  const paddedSecs = String(secs).padStart(2, "0");

  return hrs > 0
    ? `${hrs}:${paddedMins}:${paddedSecs}`
    : `${paddedMins}:${paddedSecs}`;
}

// Gives the read-only editors a background that matches the rest of the
// dark purple theme instead of Monaco's default vs-dark gray. Safe to call
// every mount — defineTheme is idempotent.
function handleEditorBeforeMount(monaco) {
  monaco.editor.defineTheme("duelDark", {
    base: "vs-dark",
    inherit: true,
    rules: [],
    colors: {
      "editor.background": "#13101f",
      "editor.lineHighlightBackground": "#1f1830",
      "editorLineNumber.foreground": "#5d5270",
      "editorLineNumber.activeForeground": "#b89cff",
      "editor.foreground": "#e8e3f5",
      "editorCursor.foreground": "#b89cff",
      "editor.selectionBackground": "#3a2d5c",
      "scrollbarSlider.background": "#2a224080",
    },
  });
}

const EDITOR_OPTIONS = {
  readOnly: true,
  minimap: { enabled: false },
  fontSize: 14,
  scrollBeyondLastLine: false,
  padding: { top: 12 },
};

export default function SpectateModal({ isOpen, onClose, matchId }) {
  const [match, setMatch] = useState(null);
  const [player1Code, setPlayer1Code] = useState("");
  const [player2Code, setPlayer2Code] = useState("");
  const [player1Progress, setPlayer1Progress] = useState(0);
  const [player2Progress, setPlayer2Progress] = useState(0);
  const [events, setEvents] = useState([]);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!matchId) return;

    socket.emit("spectate:join", matchId);

    return () => {
      socket.emit("spectate:leave", matchId);
    };
  }, [matchId]);

  useEffect(() => {
    if (!matchId) return;

    const fetchMatch = async () => {
      try {
        const res = await api.get(`/matches/spectate/${matchId}`);
        setMatch(res.data);
        setPlayer1Code(res.data.player1Submission?.code || "");
        setPlayer2Code(res.data.player2Submission?.code || "");
        setPlayer1Progress(res.data.player1Progress || 0);
        setPlayer2Progress(res.data.player2Progress || 0);
      } catch (error) {
        console.log(error);
      }
    };

    fetchMatch();
  }, [matchId]);

  // Ticks the match timer in the topbar once a second.
  useEffect(() => {
    if (!matchId) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [matchId]);

  useEffect(() => {
    const handleCodeUpdate = (data) => {
      if (data.playerId === match?.player1Id?._id) {
        setPlayer1Code(data.code);
      }

      if (data.playerId === match?.player2Id?._id) {
        setPlayer2Code(data.code);
      }
    };

    socket.on("spectate:codeUpdate", handleCodeUpdate);

    return () => {
      socket.off("spectate:codeUpdate", handleCodeUpdate);
    };
  }, [match]);

  useEffect(() => {
    const handleProgressUpdate = (data) => {
      setPlayer1Progress(data.player1Progress);
      setPlayer2Progress(data.player2Progress);
    };

    socket.on("spectate:progressUpdate", handleProgressUpdate);

    return () => {
      socket.off("spectate:progressUpdate", handleProgressUpdate);
    };
  }, []);

  useEffect(() => {
    const handleEvent = (event) => {
      setEvents((prev) =>
        [{ ...event, _receivedAt: Date.now() }, ...prev].slice(0, 30),
      );
    };

    socket.on("spectate:event", handleEvent);

    return () => {
      socket.off("spectate:event", handleEvent);
    };
  }, []);

  if (!isOpen) return null;

  // Adjust this to whatever field your match document actually stores —
  // falls back to "--:--" gracefully if none of these are present.
  const matchStart =
    match?.startedAt || match?.startTime || match?.createdAt || null;
  const elapsedSeconds = matchStart
    ? Math.floor((now - new Date(matchStart).getTime()) / 1000)
    : null;

  const difficultyKey = match?.problemId?.difficulty?.toLowerCase();
  const player1Leading =
    !!match && player1Progress > player2Progress && player1Progress > 0;
  const player2Leading =
    !!match && player2Progress > player1Progress && player2Progress > 0;

  return (
    <>
      <div className="spectate-backdrop" onClick={onClose} />

      <div className="spectate-overlay">
        <div className="spectate-modal">
          <div className="spectate-topbar">
            <div className="spectator-indicator">
              <span className="rec-dot" />
              SPECTATING
            </div>

            <div className="match-timer">
              <span className="match-timer-label">Match Time</span>
              <span className="match-timer-value">
                {formatDuration(elapsedSeconds)}
              </span>
            </div>

            <button className="spectate-close" onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          <div className="spectate-modal-body">
            {!match ? (
              <div className="spectate-loading">
                <div className="spectate-loading-spinner" />
                <p>Connecting to match...</p>
              </div>
            ) : (
              <>
                <div className="spectate-problem">
                  <h1>{match?.problemId?.title}</h1>

                  <div className="problem-meta">
                    <span className={DIFFICULTY_TAG[difficultyKey] || ""}>
                      {match?.problemId?.difficulty}
                    </span>

                    <span>{match?.problemId?.topic}</span>
                  </div>

                  <p>{match?.problemId?.description}</p>
                </div>

                <div className="spectate-players">
                  {/* PLAYER 1 */}
                  <div
                    className={`player-column ${player1Leading ? "leading" : ""}`}
                  >
                    <div className="player-header">
                      <h3>{match?.player1Id?.username}</h3>

                      <div className="player-tags">
                        {player1Leading && (
                          <span className="leading-tag">LEADING</span>
                        )}
                        <span className="lang-tag">
                          {formatLanguage(match?.player1Submission?.language)}
                        </span>
                        <span className="elo-tag">
                          ELO {match?.player1Id?.elo}
                        </span>
                      </div>
                    </div>

                    <div className="progress-wrapper">
                      <div
                        className="progress-fill"
                        style={{ width: `${player1Progress}%` }}
                      />
                    </div>

                    <div className="editor-wrapper">
                      <Editor
                        height="400px"
                        language={
                          match?.player1Submission?.language || "javascript"
                        }
                        value={player1Code}
                        theme="duelDark"
                        beforeMount={handleEditorBeforeMount}
                        options={EDITOR_OPTIONS}
                      />
                    </div>
                  </div>

                  {/* PLAYER 2 */}
                  <div
                    className={`player-column ${player2Leading ? "leading" : ""}`}
                  >
                    <div className="player-header">
                      <h3>{match?.player2Id?.username}</h3>

                      <div className="player-tags">
                        {player2Leading && (
                          <span className="leading-tag">LEADING</span>
                        )}
                        <span className="lang-tag">
                          {formatLanguage(match?.player2Submission?.language)}
                        </span>
                        <span className="elo-tag">
                          ELO {match?.player2Id?.elo}
                        </span>
                      </div>
                    </div>

                    <div className="progress-wrapper">
                      <div
                        className="progress-fill"
                        style={{ width: `${player2Progress}%` }}
                      />
                    </div>

                    <div className="editor-wrapper">
                      <Editor
                        height="400px"
                        language={
                          match?.player2Submission?.language || "javascript"
                        }
                        value={player2Code}
                        theme="duelDark"
                        beforeMount={handleEditorBeforeMount}
                        options={EDITOR_OPTIONS}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="spectate-feed-panel">
          <div className="feed-panel-header">
            <span className="feed-live-dot" />
            <h3>Live Feed</h3>
            <span className="feed-count">{events.length}</span>
          </div>

          <div className="feed-events">
            {events.length === 0 ? (
              <div className="feed-empty">Waiting for activity...</div>
            ) : (
              events.map((event, index) => (
                <div key={index} className="feed-event">
                  <span className="feed-event-time">
                    {new Date(event._receivedAt).toLocaleTimeString([], {
                      hour12: false,
                    })}
                  </span>
                  <span className="feed-event-message">{event.message}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}

"use client";

import "./spectateModal.css";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import Editor from "@monaco-editor/react";
import { X } from "lucide-react";
import socket from "@/lib/socket";

export default function SpectateModal({ isOpen, onClose, matchId }) {
  const [match, setMatch] = useState(null);
  const [player1Code, setPlayer1Code] = useState("");
  const [player2Code, setPlayer2Code] = useState("");
  const [player1Progress, setPlayer1Progress] = useState(0);
  const [player2Progress, setPlayer2Progress] = useState(0);

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

  if (!isOpen) return null;

  return (
    <>
      <div className="spectate-backdrop" onClick={onClose} />

      <div className="spectate-modal">
        <button className="spectate-close" onClick={onClose}>
          <X size={22} />
        </button>

        <div className="spectate-problem">
          <h1>{match?.problemId?.title}</h1>

          <div className="problem-meta">
            <span>{match?.problemId?.difficulty}</span>

            <span>{match?.problemId?.topic}</span>
          </div>

          <p>{match?.problemId?.description}</p>
        </div>

        <div className="spectate-players">
          {/* PLAYER 1 */}

          <div className="player-column">
            <div className="player-header">
              <h3>{match?.player1Id?.username}</h3>

              <span>ELO {match?.player1Id?.elo}</span>
            </div>

            <div className="progress-wrapper">
              <div
                className="progress-fill"
                style={{
                  width: `${player1Progress}%`,
                }}
              />
            </div>

            <Editor
              height="420px"
              language={match?.player1Submission?.language || "javascript"}
              value={player1Code}
              options={{
                readOnly: true,
                minimap: {
                  enabled: false,
                },
                fontSize: 14,
              }}
            />
          </div>

          {/* PLAYER 2 */}

          <div className="player-column">
            <div className="player-header">
              <h3>{match?.player2Id?.username}</h3>

              <span>ELO {match?.player2Id?.elo}</span>
            </div>

            <div className="progress-wrapper">
              <div
                className="progress-fill"
                style={{
                  width: `${player2Progress}%`,
                }}
              />
            </div>

            <Editor
              height="420px"
              language={match?.player2Submission?.language || "javascript"}
              value={player2Code}
              options={{
                readOnly: true,
                minimap: {
                  enabled: false,
                },
                fontSize: 14,
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}

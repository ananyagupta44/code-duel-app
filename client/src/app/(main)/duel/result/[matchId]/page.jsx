"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import "./result.css";

export default function ResultPage() {
  const { matchId } = useParams();
  const router = useRouter();

  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const isAiMatch = match.matchType === "ai";
  const isTournamentMatch = match.matchType === "tournament";

  useEffect(() => {
    fetchMatch();
  }, []);

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

  if (loading) {
    return (
      <div className="result-page">
        <div className="result-card">
          <h1>Loading Match Result...</h1>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="result-page">
        <div className="result-card">
          <h1>Match Not Found</h1>
        </div>
      </div>
    );
  }

  const duration =
    match.startedAt && match.endedAt
      ? Math.floor((new Date(match.endedAt) - new Date(match.startedAt)) / 1000)
      : 0;

  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;

  const winnerName =
    match.winner === "ai"
      ? match.aiBot?.name
      : match.winnerId?.username || "Unknown";

  const loserName = isAiMatch
    ? match.winner === "player"
      ? match.aiBot?.name
      : match.player1Id?.username
    : match.loserId?.username ||
      (match.player1Id?._id === match.winnerId?._id
        ? match.player2Id?.username
        : match.player1Id?.username);

  const player2Name = isAiMatch
    ? match.aiBot?.name
    : match.player2Id?.username || "Waiting";

  const eloChange =
    match.player1EloAfter !== undefined && match.player1EloBefore !== undefined
      ? match.player1EloAfter - match.player1EloBefore
      : null;

  return (
    <div className="result-page">
      <div className="result-card">
        <div className="result-header">
          <h1>🏆 MATCH COMPLETE</h1>
          <p>
            {winnerName} defeated {loserName}
          </p>
        </div>

        <div className="winner-section">
          <div className="winner-avatar">
            {match.winnerId?.username?.[0]?.toUpperCase()}
          </div>

          <h2>{winnerName}</h2>

          <span className="winner-badge">WINNER</span>
        </div>

        <div className="match-info-grid">
          <div className="info-box">
            <span>Problem</span>
            <h3>{match.problemId?.title}</h3>
          </div>

          <div className="info-box">
            <span>Duration</span>
            <h3>
              {minutes}:{String(seconds).padStart(2, "0")}
            </h3>
          </div>

          <div className="info-box">
            <span>Status</span>
            <h3>{match.status}</h3>
          </div>

          <div className="info-box">
            <span>Mode</span>
            <h3>
              {isAiMatch
                ? "AI Duel"
                : isTournamentMatch
                  ? "Tournament"
                  : "Ranked Duel"}
            </h3>
          </div>
          {eloChange !== null && (
            <div className="info-box">
              <span>ELO Change</span>

              <h3
                style={{
                  color: eloChange >= 0 ? "#4ade80" : "#f87171",
                }}
              >
                {eloChange >= 0 ? "+" : ""}
                {eloChange}
              </h3>
            </div>
          )}
        </div>

        <div className="players-progress">
          <div className="player-progress-card">
            <h3>{player2Name}</h3>

            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${match.player1Progress}%`,
                }}
              />
            </div>

            <span>{match.player1Progress}%</span>
          </div>

          <div className="player-progress-card">
            <h3>{match.player2Id?.username}</h3>

            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${match.player2Progress}%`,
                }}
              />
            </div>

            <span>{match.player2Progress}%</span>
          </div>
        </div>

        <div className="result-buttons">
          <button onClick={() => router.push("/lobby")}>Back To Lobby</button>

          <button onClick={() => router.push("/practice")}>Practice</button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import socket from "@/lib/socket";
import SpectateModal from "@/components/spectate/SpectateModal";
import "./spectate.css";

export default function SpectatePage() {
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);

  useEffect(() => {
    const handleStats = (data) => {
      setMatches(data.liveMatches);
    };

    socket.on("heroStatsUpdated", handleStats);

    return () => {
      socket.off("heroStatsUpdated", handleStats);
    };
  }, []);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await api.get("/matches/live");
        console.log("LIVE MATCHES:", res.data);

        setMatches(res.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchMatches();
  }, []);

  return (
    <>
      <div className="spectate-page">
        <div className="spectate-header">
          <h1>Live Matches</h1>
          <p>Watch ongoing coding duels in real time.</p>
        </div>

        {matches.length === 0 ? (
          <div className="no-matches">
            <h2>No Live Matches</h2>
            <p>Check back later.</p>
          </div>
        ) : (
          <div className="matches-grid">
            {matches.map((match) => (
              <div
                key={match._id}
                className="spectate-card"
                onClick={() => setSelectedMatch(match._id)}
              >
                <div className="live-badge">
                  <div className="live-dot" />
                  LIVE
                </div>

                <div className="match-players">
                  <div className="player-side">
                    <h3>{match.player1Id?.username}</h3>
                    <span>ELO {match.player1Id?.elo}</span>
                  </div>

                  <div className="vs">VS</div>

                  <div className="player-side">
                    <h3>{match.player2Id?.username}</h3>
                    <span>ELO {match.player2Id?.elo}</span>
                  </div>
                </div>

                <div className="problem-info">
                  <div className="problem-title">{match.problemId?.title}</div>

                  <div className="problem-meta">
                    <span className="problem-tag">
                      {match.problemId?.difficulty}
                    </span>
                  </div>
                </div>

                <div className="progress-section">
                  <div className="progress-row">
                    <span>{match.player1Id?.username}</span>

                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${match.player1Progress || 0}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="progress-row">
                    <span>{match.player2Id?.username}</span>

                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${match.player2Progress || 0}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <SpectateModal
        isOpen={!!selectedMatch}
        matchId={selectedMatch}
        onClose={() => setSelectedMatch(null)}
      />
    </>
  );
}

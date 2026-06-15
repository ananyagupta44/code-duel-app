"use client";

import "../leaderboard.css";
import getAvatar from "@/utils/getAvatar";
import { useAuth } from "@/context/authContext";

export default function LeaderboardTable({ users, type = "elo" }) {
  const { user } = useAuth();
  const getValue = (user) => (type === "elo" ? user.elo : user.solvedCount);

  return (
    <div className="leaderboard-table">
      {users.slice(3).map((u, index) => {
        const isMe = user && u._id === user._id;
        return (
          <div
            className={`leaderboard-row ${isMe ? "leaderboard-row-me" : ""}`}
            key={u._id}
          >
            <span className="rank">#{index + 4}</span>

            <div className="user-info">
              <img src={getAvatar(u)} alt={u.username} />
              <span>{u.username}</span>
              {isMe && <span className="you-badge">YOU</span>}
            </div>

            <span className={`score ${isMe ? "score-me" : ""}`}>
              <span className="score-label">
                {type === "elo" ? "ELO:" : "Solved:"}
              </span>

              {getValue(u)}

              {type === "elo" && u.eloChange > 0 && (
                <span className="elo-up">▲ {u.eloChange}</span>
              )}

              {type === "elo" && u.eloChange < 0 && (
                <span className="elo-down">▼ {Math.abs(u.eloChange)}</span>
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}

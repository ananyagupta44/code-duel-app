"use client";

import "../leaderboard.css";
import getAvatar from "@/utils/getAvatar";
import { useAuth } from "@/context/authContext";

const ROW_HEIGHT = 64;
const VISIBLE_ROWS = 4;

export default function LeaderboardTable({ users, type = "elo" }) {
  const { user } = useAuth();

  const getValue = (u) => (type === "elo" ? u.elo : u.solvedCount);

  const rest = users.slice(3);

  return (
    <div className="leaderboard-table">
      <div
        className="leaderboard-scroll-body"
        style={{ maxHeight: `${ROW_HEIGHT * VISIBLE_ROWS}px` }}
      >
        {rest.map((u, index) => {
          const isMe = user && u._id === user._id;
          return (
            <div
              key={u._id}
              className={`leaderboard-row ${isMe ? "leaderboard-row-me" : ""}`}
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
    </div>
  );
}
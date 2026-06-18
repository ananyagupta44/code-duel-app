"use client";

import { useState } from "react";
import "../leaderboard.css";
import getAvatar from "@/utils/getAvatar";
import { useAuth } from "@/context/authContext";

const PAGE_SIZE = 3;

export default function LeaderboardTable({ users, type = "elo" }) {
  const { user } = useAuth();
  const [visible, setVisible] = useState(PAGE_SIZE);

  const getValue = (u) => (type === "elo" ? u.elo : u.solvedCount);

  const showMore = () =>
    setVisible((v) => Math.min(v + PAGE_SIZE, users.length));
  const showLess = () => setVisible(PAGE_SIZE);

  const isExpanded = visible > PAGE_SIZE;
  const hasMore = visible < users.length;

  return (
    <div className="leaderboard-table">
      {users.slice(3, 3 + visible).map((u, index) => {
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

      {/* Controls */}
      {(hasMore || isExpanded) && (
        <div className="lb-expand-row">
          {hasMore && (
            <button
              className="lb-expand-btn"
              onClick={showMore}
              aria-label="Show more players"
            >
              <span>{users.length - visible - 3} more players</span>
              <svg
                className="lb-chevron"
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
              >
                <path
                  d="M2 4.5l5 5 5-5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
          {isExpanded && (
            <button
              className="lb-expand-btn lb-expand-btn--collapse"
              onClick={showLess}
              aria-label="Show less"
            >
              <span>Show less</span>
              <svg
                className="lb-chevron lb-chevron--up"
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
              >
                <path
                  d="M2 9.5l5-5 5 5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

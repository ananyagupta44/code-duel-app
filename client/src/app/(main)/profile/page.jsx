"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import getAvatar from "@/utils/getAvatar";
import { useAuth } from "@/context/authContext";
import "./profile.css";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAllMatches, setShowAllMatches] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/profile/me");

        console.log("PROFILE DATA", res.data);
        console.log("ELO HISTORY", res.data.eloHistory);

        setProfile(res.data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="profile-page">
        <h2 style={{ color: "white" }}>Loading Profile...</h2>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-page">
        <h2 style={{ color: "white" }}>Profile Not Found</h2>
      </div>
    );
  }

  const totalGames = profile.wins + profile.losses;
  const winRate =
    totalGames > 0 ? Math.round((profile.wins / totalGames) * 100) : 0;

  const difficultyData = [
    { name: "Easy", value: profile.difficultyBreakdown.easy, color: "#5dcaa5" },
    {
      name: "Medium",
      value: profile.difficultyBreakdown.medium,
      color: "#fac775",
    },
    { name: "Hard", value: profile.difficultyBreakdown.hard, color: "#f09595" },
  ];
  const visibleMatches = showAllMatches
    ? profile.recentMatches
    : profile.recentMatches.slice(0, 4);

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar-card">
          <img src={getAvatar(profile)} alt={profile.username} />
          <div className="profile-id">
            <h1>{profile.username}</h1>
            <div className="profile-id-meta">
              <span className="profile-pill gold">Rank #{profile.rank}</span>
              <span className="profile-pill">{profile.elo} ELO</span>
              <span className="profile-pill">
                Joined{" "}
                {new Date(profile.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>

        <div className="profile-quick-stats">
          <div className="profile-qcard green">
            <div className="val">{profile.wins}</div>
            <div className="lbl">Wins</div>
          </div>
          <div className="profile-qcard red">
            <div className="val">{profile.losses}</div>
            <div className="lbl">Losses</div>
          </div>
          <div className="profile-qcard">
            <div className="val">{winRate}%</div>
            <div className="lbl">Win Rate</div>
          </div>
          <div className="profile-qcard gold">
            <div className="val">{profile.totalSolved}</div>
            <div className="lbl">Solved</div>
          </div>
        </div>
      </div>
      
      {profile.tournamentBadges?.length > 0 && (
        <div className="profile-badge-section">
          <h3 className="badge-section-title">Championship Trophies</h3>

          <div className="profile-badges">
            {profile.tournamentBadges.map((badge, i) => (
              <div key={badge.tournamentId || i} className="tournament-badge">
                <div className="tb-shine" />
                <div className="tb-medallion">
                  <div className="tb-medallion-ring" />
                  <span className="tb-medallion-icon">🏆</span>
                </div>

                <div className="tb-content">
                  <div className="tb-rank">Champion</div>
                  <div className="tb-name">{badge.tournamentName}</div>
                  <div className="tb-date">
                    {new Date(badge.wonAt).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="profile-grid2">
        <div className="profile-card">
          <h3>ELO Progress</h3>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={profile.eloHistory || []}>
                <XAxis dataKey="match" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} domain={["auto", "auto"]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="elo"
                  stroke="#b89cff"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="profile-card">
          <h3>Problems by Difficulty</h3>
          {profile.totalSolved > 0 ? (
            <div className="donut-wrap">
              <div style={{ height: 180, width: 180, flexShrink: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={difficultyData}
                      dataKey="value"
                      innerRadius={50}
                      outerRadius={85}
                      paddingAngle={2}
                    >
                      {difficultyData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="donut-legend">
                {difficultyData.map((d) => (
                  <div className="leg-row" key={d.name}>
                    <span className="leg-dot" style={{ background: d.color }} />
                    {d.name}
                    <span className="leg-val" style={{ color: d.color }}>
                      {d.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="profile-empty">No problems solved yet</div>
          )}
        </div>
      </div>

      <div className="profile-grid2">
        <div className="profile-card">
          <h3>Win / Loss — Last 14 Days</h3>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={profile.dailyActivity}>
                <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip />
                <Bar
                  dataKey="wins"
                  stackId="a"
                  fill="#5dcaa5"
                  radius={[3, 3, 0, 0]}
                />
                <Bar
                  dataKey="losses"
                  stackId="a"
                  fill="#f09595"
                  radius={[3, 3, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="profile-card">
          <h3>Top Topics Solved</h3>
          {(profile.topicBreakdown || []).length > 0 ? (
            <div className="topics-list">
              {profile.topicBreakdown.slice(0, 5).map((t) => {
                const max = profile.topicBreakdown[0].count;
                const pct = Math.round((t.count / max) * 100);
                return (
                  <div className="topic-row" key={t.topic}>
                    <span className="topic-name">
                      {t.topic
                        .split("-")
                        .map((w) => w[0].toUpperCase() + w.slice(1))
                        .join(" ")}
                    </span>
                    <div className="topic-bar-track">
                      <div
                        className="topic-bar-fill"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="topic-count">{t.count}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="profile-empty">No topics solved yet</div>
          )}
        </div>
      </div>

      <div className="profile-grid2 reverse">
        <div className="profile-card">
          <h3>Activity (Last 26 Weeks)</h3>

          <div className="activity-grid">
            {profile.activityHeatmap.map((cell, i) => (
              <div
                key={i}
                className={`act-cell ${
                  cell.level > 0 ? `act-${cell.level}` : ""
                }`}
              >
                <div className="heat-tooltip">
                  <strong>{cell.count}</strong>{" "}
                  {cell.count === 1 ? "submission" : "submissions"}
                  <br />
                  {new Date(cell.date).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="profile-card">
          <h3>Recent Matches</h3>
          {profile.recentMatches.length > 0 ? (
            <>
              <div className="match-history">
                {visibleMatches.map((m) => (
                  <div className="match-row" key={m._id}>
                    <div className={`result-tag ${m.isWin ? "win" : "loss"}`}>
                      {m.isWin ? "W" : "L"}
                    </div>
                    <div className="match-info">
                      <div className="title">
                        {m.problemTitle} vs {m.opponentUsername}
                      </div>
                      <div className="sub">
                        {m.matchType} · {m.duration}
                      </div>
                    </div>

                    <div className="match-date">{m.timeAgo}</div>
                  </div>
                ))}
              </div>

              {profile.recentMatches.length > 4 && (
                <button
                  className="match-history-toggle"
                  onClick={() => setShowAllMatches((prev) => !prev)}
                >
                  {showAllMatches
                    ? "Show less"
                    : `Show ${profile.recentMatches.length - 4} more`}
                  <span
                    className={`toggle-arrow ${showAllMatches ? "up" : "down"}`}
                  >
                    ▾
                  </span>
                </button>
              )}
            </>
          ) : (
            <div className="profile-empty">No matches played yet</div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import api from "@/lib/api";
import "./practice.css";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useAuth } from "@/context/authContext";
import { useAuthDrawer } from "@/context/drawerContext";
import { useRouter } from "next/navigation";

const RANK_CLASS = ["gold", "silver", "bronze"];
const RANK_MEDAL = ["🥇", "🥈", "🥉"];

export default function PracticePage() {
  const [problems, setProblems] = useState([]);
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("all");
  const [topic, setTopic] = useState("all");
  const [difficultyOpen, setDifficultyOpen] = useState(false);
  const [isAtEnd, setIsAtEnd] = useState(false);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [dailyChallenge, setDailyChallenge] = useState(null);
  const [dailyAttempted, setDailyAttempted] = useState(false);

  const difficultyRef = useRef(null);
  const topicsRef = useRef(null);

  const { isAuthenticated } = useAuth();
  const { openLogin } = useAuthDrawer();
  const router = useRouter();

  const handleProblemClick = (e) => {
    if (!isAuthenticated) {
      e.preventDefault();
      openLogin();
    }
  };

  const handleTopicsScroll = () => {
    if (!topicsRef.current) return;
    if (isAtEnd) {
      topicsRef.current.scrollTo({ left: 0, behavior: "smooth" });
    } else {
      topicsRef.current.scrollTo({
        left: topicsRef.current.scrollWidth,
        behavior: "smooth",
      });
    }
  };

  const topics = ["all", ...new Set(problems.map((p) => p.topic))];

  // ── data fetching ──────────────────────────────────────
  useEffect(() => {
    api
      .get("/problems")
      .then((res) => setProblems(res.data))
      .catch(console.log);
  }, []);

  useEffect(() => {
    api
      .get("/daily")
      .then((res) => setDailyChallenge(res.data))
      .catch(console.log);
  }, []);

  useEffect(() => {
    api
      .get("/users/leaderboard")
      .then((res) => setLeaderboard(res.data))
      .catch(console.log);
  }, []);

  useEffect(() => {
    api
      .get("/users/me/solved")
      .then((res) => setSolvedProblems(res.data))
      .catch(console.log);
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !dailyChallenge?._id) return;
    api
      .get(`/daily/${dailyChallenge._id}/attempted`)
      .then((res) => setDailyAttempted(res.data.attempted))
      .catch(() => {});
  }, [isAuthenticated, dailyChallenge]);

  // ── click-outside for difficulty dropdown ──────────────
  useEffect(() => {
    const handler = (e) => {
      if (difficultyRef.current && !difficultyRef.current.contains(e.target)) {
        setDifficultyOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── topics scroll tracker ──────────────────────────────
  useEffect(() => {
    const container = topicsRef.current;
    if (!container) return;

    const onScroll = () => {
      setIsAtEnd(
        container.scrollLeft + container.clientWidth >=
          container.scrollWidth - 10,
      );
    };
    container.addEventListener("scroll", onScroll);
    return () => container.removeEventListener("scroll", onScroll);
  }, []);

  // ── derived state ──────────────────────────────────────
  const solvedSet = new Set(solvedProblems || []);

  const filteredProblems = problems.filter((p) => {
    const titleMatch = p.title.toLowerCase().includes(search.toLowerCase());
    const diffMatch = difficulty === "all" || p.difficulty === difficulty;
    const topicMatch = topic === "all" || p.topic === topic;
    return titleMatch && diffMatch && topicMatch;
  });

  const formatTopicLabel = (t) =>
    t === "all"
      ? "All Topics"
      : t
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");

  const difficultyLabel =
    difficulty === "all"
      ? "All Difficulties"
      : difficulty.charAt(0).toUpperCase() + difficulty.slice(1);

  return (
    <div className="practice-page">
      {/* ── HEADER ─────────────────────────────────────── */}
      <div className="practice-header">
        <h1>PRACTICE</h1>
        <p className="practice-header-sub">
          Sharpen your skills. Solve problems. Climb the board.
        </p>

        <div className="filters">
          <input
            type="text"
            placeholder="Search problems..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="custom-dropdown" ref={difficultyRef}>
            <button
              className={`dropdown-trigger ${difficultyOpen ? "open" : ""}`}
              onClick={() => setDifficultyOpen((v) => !v)}
            >
              {difficultyLabel}
              <span className="chevron">▼</span>
            </button>

            {difficultyOpen && (
              <div className="dropdown-menu">
                {["all", "easy", "medium", "hard"].map((d) => (
                  <button
                    key={d}
                    className={difficulty === d ? "active-option" : ""}
                    onClick={() => {
                      setDifficulty(d);
                      setDifficultyOpen(false);
                    }}
                  >
                    {d === "all"
                      ? "All Difficulties"
                      : d.charAt(0).toUpperCase() + d.slice(1)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ───────────────────────────────── */}
      <div className="practice-content">
        {/* LEFT — topics + problem table */}
        <div className="practice-main">
          <div className="topics-wrapper">
            <div className="topics-container" ref={topicsRef}>
              {topics.map((item) => (
                <button
                  key={item}
                  className={`topic-pill ${topic === item ? "active" : ""}`}
                  onClick={() => setTopic(item)}
                >
                  {formatTopicLabel(item)}
                </button>
              ))}
            </div>

            <button className="topics-arrow" onClick={handleTopicsScroll}>
              {isAtEnd ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </button>
          </div>

          <div className="problem-table">
            <div className="table-header">
              <span>#</span>
              <span>Status</span>
              <span>Title</span>
              <span>Topic</span>
              <span>Difficulty</span>
            </div>

            {filteredProblems.length === 0 ? (
              <div className="table-empty">No problems match your filters.</div>
            ) : (
              filteredProblems.map((problem, index) => (
                <Link
                  key={problem._id}
                  href={`/practice/${problem._id}`}
                  className="problem-row"
                  onClick={handleProblemClick}
                >
                  <span className="problem-number">{index + 1}</span>

                  <span>
                    {solvedSet.has(problem.slug) ? (
                      <span className="status-badge solved">Solved</span>
                    ) : (
                      <span className="status-badge unsolved">Unsolved</span>
                    )}
                  </span>

                  <span className="problem-title">{problem.title}</span>

                  <span className="problem-topic">
                    {formatTopicLabel(problem.topic)}
                  </span>

                  <span className={`difficulty ${problem.difficulty}`}>
                    {problem.difficulty}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* RIGHT SIDEBAR — daily challenge + leaderboard */}
        <div className="practice-sidebar">
          {/* Daily Challenge */}
          {dailyChallenge && (
            <div className="daily-challenge-card">
              <div className="daily-header">
                <span className="daily-icon">🔥</span>
                <span className="daily-eyebrow">Daily Challenge</span>
              </div>

              <h3>{dailyChallenge.problemId?.title}</h3>

              <div className="daily-meta">
                <span
                  className={`difficulty-pill ${dailyChallenge.problemId?.difficulty}`}
                >
                  {dailyChallenge.problemId?.difficulty}
                </span>
                <span className="daily-participants">
                  👥 {dailyChallenge.participants} attempting
                </span>
              </div>

              <div className="daily-divider" />

              <div className="daily-top-solvers">
                <h4>Fastest Solvers</h4>

                {dailyChallenge.leaderboard?.length ? (
                  dailyChallenge.leaderboard.slice(0, 3).map((entry, i) => (
                    <div key={i} className="daily-solver">
                      <span className="daily-solver-rank">#{i + 1}</span>
                      <span className="daily-solver-name">
                        {entry.username}
                      </span>
                      <span className="daily-solver-time">
                        {Math.floor(entry.solveTimeMs / 60000)}m{" "}
                        {Math.floor((entry.solveTimeMs % 60000) / 1000)}s
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="no-solvers">Be the first solver today!</p>
                )}
              </div>

              <button
                className={`daily-btn ${dailyAttempted ? "daily-btn-solved" : ""}`}
                disabled={dailyAttempted}
                onClick={() => {
                  if (!dailyAttempted)
                    router.push(
                      `/practice/${dailyChallenge.problemId._id}?daily=true`,
                    );
                }}
              >
                {dailyAttempted ? "✓ Already Attempted" : "Start Challenge →"}
              </button>
            </div>
          )}

          {/* Leaderboard */}
          <div className="leaderboard-sidebar">
            <div className="leaderboard-heading">
              <h2>Leaderboard</h2>
              <span className="leaderboard-eyebrow">Problems Solved</span>
            </div>

            <div className="leaderboard-col-labels">
              <span>Rank</span>
              <span>Player</span>
              <span style={{ textAlign: "right" }}>Solved</span>
            </div>

            {leaderboard.slice(0, 10).map((u, i) => (
              <div key={u._id} className="leaderboard-user">
                <span className={`practice-rank ${RANK_CLASS[i] || ""}`}>
                  {i < 3 ? (
                    <span className="rank-medal">{RANK_MEDAL[i]}</span>
                  ) : (
                    `#${i + 1}`
                  )}
                </span>

                <span className="username">{u.username}</span>

                <span className="score">{u.solved}</span>
              </div>
            ))}

            <Link href="/leaderboard#solved" className="leaderboard-view-all">
              View Full Leaderboard →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

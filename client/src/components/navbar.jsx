"use client";

import Link from "next/link";
import { CircleUserRound } from "lucide-react";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import "../css/navbar.css";
import socket from "@/lib/socket";
import getAvatar from "@/utils/getAvatar";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthDrawer } from "@/context/drawerContext";
import api from "@/lib/api";
import { ImFire } from "react-icons/im";

const DIFFICULTY_COLOR = {
  easy: {
    color: "#4ade80",
    bg: "rgba(74,222,128,0.12)",
    border: "rgba(74,222,128,0.28)",
  },
  medium: {
    color: "#facc15",
    bg: "rgba(250,204,21,0.12)",
    border: "rgba(250,204,21,0.28)",
  },
  hard: {
    color: "#f87171",
    bg: "rgba(248,113,113,0.12)",
    border: "rgba(248,113,113,0.28)",
  },
};

export default function Navbar() {
  const { openLogin, openSignup } = useAuthDrawer();
  const { user, logout, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [dailyChallenge, setDailyChallenge] = useState(null);
  const [streak, setStreak] = useState(0);
  const [dailyAttempted, setDailyAttempted] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !dailyChallenge?._id) return;
    api
      .get(`/daily/${dailyChallenge._id}/attempted`)
      .then((res) => setDailyAttempted(res.data.attempted))
      .catch(() => {});
  }, [isAuthenticated, dailyChallenge]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    api
      .get("/daily")
      .then((res) => setDailyChallenge(res.data))
      .catch(() => {});
  }, []);

  // Optional: fetch the logged-in user's current streak
  useEffect(() => {
    if (!isAuthenticated) return;
    api
      .get("/users/me/streak")
      .then((res) => setStreak(res.data.streak ?? 0))
      .catch(() => {});
  }, [isAuthenticated]);

  const handleLogout = () => {
    if (user?._id) socket.emit("userOffline", user._id);
    socket.disconnect();
    logout();
    router.push("/");
  };

  if (!mounted) return null;

  const diff = dailyChallenge?.problemId?.difficulty?.toLowerCase();
  const diffStyle = DIFFICULTY_COLOR[diff] || DIFFICULTY_COLOR.medium;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          <Link href="/" className="logo">
            Code<span>Duel</span>
          </Link>

          <div className="nav-links">
            <Link
              href="/lobby"
              className={pathname === "/lobby" ? "active" : ""}
            >
              Lobby
            </Link>
            <Link
              href="/practice"
              className={pathname.startsWith("/practice") ? "active" : ""}
            >
              Practice
            </Link>
            <Link
              href="/leaderboard"
              className={pathname === "/leaderboard" ? "active" : ""}
            >
              Leaderboard
            </Link>
            <Link
              href="/tournaments"
              className={pathname === "/tournaments" ? "active" : ""}
            >
              Tournaments
            </Link>
            <Link
              href="/spectate"
              className={pathname.startsWith("/spectate") ? "active" : ""}
            >
              Spectate
            </Link>
          </div>
        </div>

        <div className="navbar-right">
          {/* ── DAILY CHALLENGE ICON ── */}
          {dailyChallenge && (
            <div className="daily-nav-wrap">
              <button className="daily-nav-icon" aria-label="Daily challenge">
                <span className="fire-icon-wrap">
                  {/* // in your root layout or _app.jsx */}
                  <svg width="0" height="0" style={{ position: "absolute" }}>
                    <defs>
                      <linearGradient
                        id="fireGrad"
                        x1="0%"
                        y1="100%"
                        x2="0%"
                        y2="0%"
                      >
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="50%" stopColor="#f97316" />
                        <stop offset="100%" stopColor="#fbbf24" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <ImFire size={22} />
                </span>
                {streak > 0 && (
                  <span className="daily-streak-badge">{streak}</span>
                )}
              </button>

              <div className="daily-nav-popover">
                <div className="daily-pop-eyebrow">
                  <span className="daily-pop-dot" />
                  DAILY CHALLENGE
                </div>

                <div className="daily-pop-title">
                  {dailyChallenge.problemId?.title}
                </div>

                <div className="daily-pop-meta">
                  <span
                    className="daily-pop-diff"
                    style={{
                      color: diffStyle.color,
                      background: diffStyle.bg,
                      border: `1px solid ${diffStyle.border}`,
                    }}
                  >
                    {dailyChallenge.problemId?.difficulty}
                  </span>

                  <span className="daily-pop-participants">
                    👥 {dailyChallenge.participants ?? 0} attempting
                  </span>
                </div>

                {dailyChallenge.leaderboard?.length > 0 && (
                  <div className="daily-pop-solvers">
                    <div className="daily-pop-solvers-label">Fastest today</div>

                    {dailyChallenge.leaderboard.slice(0, 3).map((e, i) => (
                      <div key={i} className="daily-pop-solver-row">
                        <span className="daily-pop-solver-rank">#{i + 1}</span>
                        <span className="daily-pop-solver-name">
                          {e.username}
                        </span>
                        <span className="daily-pop-solver-time">
                          {Math.floor(e.solveTimeMs / 60000)}m{" "}
                          {Math.floor((e.solveTimeMs % 60000) / 1000)}s
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  className={`daily-pop-btn ${dailyAttempted ? "daily-pop-btn-done" : ""}`}
                  disabled={dailyAttempted}
                  onClick={() => {
                    if (!dailyAttempted)
                      router.push(
                        `/practice/${dailyChallenge.problemId?._id}?daily=true`,
                      );
                  }}
                >
                  {dailyAttempted ? "✓ Already Attempted" : "Start Challenge →"}
                </button>
              </div>
            </div>
          )}

          {/* ── PROFILE ── */}
          <div className="profile-menu">
            <div className="profile-avatar">
              {isAuthenticated ? (
                <img src={getAvatar(user)} alt={user.username} />
              ) : (
                <CircleUserRound size={28} />
              )}
            </div>

            <div className="dropdown">
              {!isAuthenticated ? (
                <>
                  <button className="dropdown-btn" onClick={openLogin}>
                    Login
                  </button>
                  <button
                    className="dropdown-btn register"
                    onClick={openSignup}
                  >
                    Register
                  </button>
                </>
              ) : (
                <>
                  <div className="user-info">{user.username}</div>
                  <Link href="/profile">Profile</Link>
                  <button className="logout-btn" onClick={handleLogout}>
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

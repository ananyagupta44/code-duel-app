"use client";

import "../css/hero.css";
import Link from "next/link";
import { useState, useEffect } from "react";
import socket from "@/lib/socket";
import api from "@/lib/api";
import { MdArrowForwardIos } from "react-icons/md";
import { IoLogoGameControllerB } from "react-icons/io";
import { FaRobot } from "react-icons/fa";
import { FaUserFriends } from "react-icons/fa";
import { FaStopCircle } from "react-icons/fa";
import { RiSwordLine } from "react-icons/ri";
import { useAuth } from "@/context/authContext";
import { useAuthDrawer } from "@/context/drawerContext";
import { useRouter } from "next/navigation";
import SpectateModal from "@/components/spectate/SpectateModal";
import getAvatar from "@/utils/getAvatar";

export default function Hero() {
  const { isAuthenticated } = useAuth();
  const { openLogin } = useAuthDrawer();
  const router = useRouter();
  const [playType, setPlayType] = useState("human");
  const [matchMode, setMatchMode] = useState("casual");
  const [difficulty, setDifficulty] = useState("medium");
  const [topic, setTopic] = useState("array");
  const [playersOnline, setPlayersOnline] = useState(0);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [matchProgress, setMatchProgress] = useState({});
  const [liveMatches, setLiveMatches] = useState([]);
  const [topEloPlayers, setTopEloPlayers] = useState([]);
  const [topSolvedPlayers, setTopSolvedPlayers] = useState([]);
  const handleProtectedNavigation = (path) => {
    if (!isAuthenticated) {
      openLogin();
      return;
    }

    router.push(path);
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/hero");

        setPlayersOnline(res.data.playersOnline);

        setLiveMatches(res.data.liveMatches);
      } catch (error) {
        console.log(error);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    const handleStats = (data) => {
      setPlayersOnline(data.playersOnline);

      setLiveMatches(data.liveMatches);
    };

    socket.on("heroStatsUpdated", handleStats);

    return () => {
      socket.off("heroStatsUpdated", handleStats);
    };
  }, []);

  useEffect(() => {
    const handleProgress = (data) => {
      setMatchProgress((prev) => ({
        ...prev,
        [data.matchId]: {
          player1Progress: data.player1Progress,
          player2Progress: data.player2Progress,
        },
      }));
    };

    socket.on("progressUpdated", handleProgress);

    return () => {
      socket.off("progressUpdated", handleProgress);
    };
  }, []);

  useEffect(() => {
    const fetchTopPlayers = async () => {
      try {
        const res = await api.get("/leaderboard");
        setTopEloPlayers(res.data.eloLeaderboard.slice(0, 5));
        setTopSolvedPlayers(res.data.solvedLeaderboard.slice(0, 5));
      } catch (error) {
        console.log(error);
      }
    };

    fetchTopPlayers();
  }, []);

  useEffect(() => {
    const handleLeaderboardUpdate = (data) => {
      setTopEloPlayers(data.eloLeaderboard.slice(0, 5));
      setTopSolvedPlayers(data.solvedLeaderboard.slice(0, 5));
    };

    socket.on("leaderboard:update", handleLeaderboardUpdate);

    return () => {
      socket.off("leaderboard:update", handleLeaderboardUpdate);
    };
  }, []);

  const mockMatches = [
    {
      _id: "mock1",
      player1Id: { username: "CodeNinja" },
      player2Id: { username: "ByteMaster" },
    },
    {
      _id: "mock2",
      player1Id: { username: "AlgoKing" },
      player2Id: { username: "BugHunter" },
    },
    {
      _id: "mock3",
      player1Id: { username: "StackWizard" },
      player2Id: { username: "GraphGuru" },
    },
    {
      _id: "mock4",
      player1Id: { username: "DPMaster" },
      player2Id: { username: "BinaryBoss" },
    },
    {
      _id: "mock5",
      player1Id: { username: "StackWzard" },
      player2Id: { username: "Graphuru" },
    },
    {
      _id: "mock6",
      player1Id: { username: "DPMater" },
      player2Id: { username: "BinaryBss" },
    },
  ];

  const displayedMatches = liveMatches.length > 0 ? liveMatches : mockMatches;

  const handleFindMatch = async () => {
    if (playType === "friend") {
      router.push("/create-game");
      return;
    }

    if (playType === "ai") {
      router.push(`/ai?difficulty=${difficulty}&topic=${topic}`);
      return;
    }

    try {
      const res = await api.post("/matches/find", {
        matchType: matchMode,
        difficulty,
      });

      router.push(`/duel/${res.data.matchId}`);
    } catch (error) {
      alert(error.response?.data?.message || "No opponent found");
    }
  };

  return (
    <section className="hero">
      <div className="hero-top">
        <div className="hero-left">
          <h1>CodeDuel</h1>
          <p>Online Coding Arena</p>

          <div className="hero-buttons">
            <button
              className="hero-btn primary"
              onClick={() => handleProtectedNavigation("/lobby")}
            >
              Find Match
            </button>

            <button
              className="hero-btn secondary"
              onClick={() => handleProtectedNavigation("/practice")}
            >
              Practice
            </button>
          </div>
        </div>

        <div className="hero-right">
          <p>
            Challenge developers worldwide in fast-paced 1v1 coding battles.
            Compete, improve, and prove your skills in real-time coding arenas.
          </p>
        </div>
      </div>

      <div className="hero-bottom">
        <div className="hero-stats">
          <Link href="/lobby" className="stat">
            <div className="stat-value">
              <h2>{playersOnline}</h2>
              <MdArrowForwardIos className="stat-arrow" />
            </div>
            <span>Players Online</span>
          </Link>

          <Link href="/matches" className="stat">
            <div className="stat-value">
              <h2>{liveMatches.length}</h2>

              <MdArrowForwardIos className="stat-arrow" />
            </div>
            <span>Live Matches</span>
          </Link>
        </div>

        <div className="live-preview">
          <h3>
            <span className="live-dot" /> Live
          </h3>

          <div className="slider-container">
            <div className="slider-track">
              {displayedMatches.map((match, index) => {
                const progress = matchProgress[match._id] || {
                  player1Progress: match.player1Progress || 0,
                  player2Progress: match.player2Progress || 0,
                };

                const themes = [
                  "theme-purple",
                  "theme-teal",
                  "theme-coral",
                  "theme-gold",
                ];
                const themeClass = themes[index % themes.length];

                return (
                  <div
                    key={match._id}
                    className={`match-preview ${themeClass}`}
                    onClick={() => setSelectedMatch(match._id)}
                  >
                    <div className="preview-live-badge">
                      <span className="live-dot" />
                      LIVE
                    </div>

                    <div className="preview-players">
                      <div className="preview-player">
                        <h4>{match.player1Id?.username}</h4>
                      </div>
                      <div className="preview-vs">VS</div>
                      <div className="preview-player">
                        <h4>{match.player2Id?.username}</h4>
                      </div>
                    </div>

                    {match.problemId?.title && (
                      <div className="preview-problem">
                        {match.problemId.title}
                      </div>
                    )}

                    <div className="preview-progress">
                      <div className="preview-progress-row">
                        <span>
                          {match.player1Id?.username} —{" "}
                          {progress.player1Progress}%
                        </span>
                        <div className="preview-progress-bar">
                          <div
                            className="preview-progress-fill"
                            style={{ width: `${progress.player1Progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="preview-progress-row">
                        <span>
                          {match.player2Id?.username} —{" "}
                          {progress.player2Progress}%
                        </span>
                        <div className="preview-progress-bar">
                          <div
                            className="preview-progress-fill"
                            style={{ width: `${progress.player2Progress}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {liveMatches.length === 0 && (
                      <small className="demo-badge">Demo</small>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <section className={`matchmaking-panel panel-${playType}`}>
        <div className="play-type">
          <button
            className={playType === "human" ? "active" : ""}
            onClick={() => setPlayType("human")}
          >
            <IoLogoGameControllerB /> Random
          </button>

          <button
            className={playType === "ai" ? "active" : ""}
            onClick={() => setPlayType("ai")}
          >
            <FaRobot /> AI
          </button>

          <button
            className={playType === "friend" ? "active" : ""}
            onClick={() => setPlayType("friend")}
          >
            <FaUserFriends /> Friend
          </button>
        </div>

        <div className="match-options">
          {playType === "friend" && (
            <>
              <div className="match-mode">
                <button
                  className={matchMode === "casual" ? "active" : ""}
                  onClick={() => setMatchMode("casual")}
                >
                  <FaStopCircle />
                  Non Ranked
                </button>

                <button
                  className={matchMode === "ranked" ? "active" : ""}
                  onClick={() => setMatchMode("ranked")}
                >
                  <RiSwordLine />
                  ELO Ranked
                </button>
              </div>

              <div className="difficulty-options">
                {["Easy", "Medium", "Hard", "Random"].map((level) => (
                  <button
                    key={level}
                    className={
                      difficulty === level.toLowerCase() ? "active" : ""
                    }
                    onClick={() => setDifficulty(level.toLowerCase())}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </>
          )}

          {playType === "ai" && (
            <>
              <div className="topic-options">
                {[
                  "Array",
                  "String",
                  "Linked List",
                  "Graph",
                  "DP",
                  "Tree",
                  "Heap",
                ].map((item) => (
                  <button
                    key={item}
                    className={topic === item.toLowerCase() ? "active" : ""}
                    onClick={() => setTopic(item.toLowerCase())}
                  >
                    {item}
                  </button>
                ))}
              </div>

              <div className="difficulty-options">
                {["Easy", "Medium", "Hard", "Random"].map((level) => (
                  <button
                    key={level}
                    className={
                      difficulty === level.toLowerCase() ? "active" : ""
                    }
                    onClick={() => setDifficulty(level.toLowerCase())}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </>
          )}

          {playType === "human" && (
            <div className="friend-panel">
              <div className="match-mode">
                <button
                  className={matchMode === "casual" ? "active" : ""}
                  onClick={() => setMatchMode("casual")}
                >
                  <FaStopCircle />
                  Non Ranked
                </button>

                <button
                  className={matchMode === "ranked" ? "active" : ""}
                  onClick={() => setMatchMode("ranked")}
                >
                  <RiSwordLine />
                  ELO Ranked
                </button>
              </div>
              <div className="space"></div>
              <div className="difficulty-options">
                {["Easy", "Medium", "Hard", "Random"].map((level) => (
                  <button
                    key={level}
                    className={
                      difficulty === level.toLowerCase() ? "active" : ""
                    }
                    onClick={() => setDifficulty(level.toLowerCase())}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <button className="find-match-btn" onClick={handleFindMatch}>
          {playType === "friend"
            ? "CREATE GAME"
            : playType === "ai"
              ? "START GAME"
              : "FIND MATCH"}
        </button>
      </section>
      <div className="leaderboard-glimpse-row">
        <div className="leaderboard-glimpse theme-elo">
          <div className="glimpse-head">
            <h3>Top ELO</h3>
            <Link href="/leaderboard" className="view-all-btn">
              View All <MdArrowForwardIos />
            </Link>
          </div>

          <div className="glimpse-list">
            {topEloPlayers.map((player, index) => (
              <Link
                href="/leaderboard"
                key={player._id}
                className="glimpse-row"
              >
                <span
                  className={`glimpse-rank ${
                    index === 0
                      ? "gold"
                      : index === 1
                        ? "silver"
                        : index === 2
                          ? "bronze"
                          : "normal"
                  }`}
                >
                  {index + 1}
                </span>

                <div className="glimpse-avatar">
                  <img src={getAvatar(player)} alt={player.username} />
                </div>

                <span className="glimpse-name">{player.username}</span>
                <span className="glimpse-stat">{player.elo} ELO</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="leaderboard-glimpse theme-solved">
          <div className="glimpse-head">
            <h3>Most Solved</h3>
            <Link href="/leaderboard" className="view-all-btn">
              View All <MdArrowForwardIos />
            </Link>
          </div>

          <div className="glimpse-list">
            {topSolvedPlayers.map((player, index) => (
              <Link
                href="/leaderboard"
                key={player._id}
                className="glimpse-row"
              >
                <span
                  className={`glimpse-rank ${
                    index === 0
                      ? "gold"
                      : index === 1
                        ? "silver"
                        : index === 2
                          ? "bronze"
                          : "normal"
                  }`}
                >
                  {index + 1}
                </span>
                <div className="glimpse-avatar">
                  <img src={getAvatar(player)} alt={player.username} />
                </div>

                <span className="glimpse-name">{player.username}</span>
                <span className="glimpse-stat">
                  {player.solvedCount} Solved
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <SpectateModal
        isOpen={!!selectedMatch}
        matchId={selectedMatch}
        onClose={() => setSelectedMatch(null)}
      />
    </section>
  );
}

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

export default function Hero() {
  const [playType, setPlayType] = useState("human");
  const [matchMode, setMatchMode] = useState("casual");
  const [difficulty, setDifficulty] = useState("medium");
  const [topic, setTopic] = useState("array");
  const [playersOnline, setPlayersOnline] = useState(0);

  const [liveMatches, setLiveMatches] = useState([]);

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

  return (
    <section className="hero">
      <div className="hero-top">
        <div className="hero-left">
          <h1>CodeDuel</h1>
          <p>Online Coding Arena</p>

          <div className="hero-buttons">
            <Link href="/lobby" className="hero-btn primary">
              Find Match
            </Link>

            <Link href="/practice" className="hero-btn secondary">
              Practice
            </Link>
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
          <h3>• Live</h3>

          <div className="slider-container">
            <div className="slider-track">
              {displayedMatches.map((match) => (
                <Link
                  key={match._id}
                  href={liveMatches.length > 0 ? `/spectate/${match._id}` : "#"}
                  className="match-preview"
                >
                  <span>
                    {match.player1Id?.username}
                    <br />
                    vs
                    <br />
                    {match.player2Id?.username}
                  </span>

                  {liveMatches.length === 0 && (
                    <small className="demo-badge">Demo</small>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
      <section className="matchmaking-panel">
        <div className="play-type">
          <button
            className={playType === "human" ? "active" : ""}
            onClick={() => setPlayType("human")}
          >
            <IoLogoGameControllerB /> Human
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
          {playType === "human" && (
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

          {playType === "friend" && (
            <div className="friend-panel">
              <h3>Create a Private Duel Room</h3>

              <p>Invite friends using a room code and compete head-to-head.</p>
            </div>
          )}
        </div>

        <button
          className="find-match-btn"
          onClick={() => {
            if (playType === "friend") {
              router.push("/create-game");
            }
          }}
        >
          {playType === "friend"
            ? "CREATE GAME"
            : playType === "ai"
              ? "START GAME"
              : "FIND MATCH"}
        </button>
      </section>
    </section>
  );
}

"use client";

import "../css/hero.css";
import Link from "next/link";
import { useState } from "react";

export default function Hero() {
  const [playType, setPlayType] = useState("human");
  const [matchMode, setMatchMode] = useState("casual");
  const [difficulty, setDifficulty] = useState("medium");
  const [topic, setTopic] = useState("array");

  return (
    <section className="hero">
      <div className="hero-top">
        <div className="hero-left">
          <h1>CodeDuel</h1>
          <p>Online Coding Arena</p>

          <div className="hero-buttons">
            <button link="/lobby">Find Match</button>
            <button link="/practice">Practice</button>
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
            <h2>136</h2>
            <span>Players Online</span>
          </Link>

          <Link href="/matches" className="stat">
            <h2>24</h2>
            <span>Live Matches</span>
          </Link>
        </div>

        <div className="live-preview">
          <h3>• Live Matches</h3>

          <div className="slider-container">
            <div className="slider-track">
              <div className="match-preview">
                <span>
                  CodeNinja <br /> vs <br /> bytemaster
                </span>
              </div>

              <div className="match-preview">
                <span>
                  CodeNinja <br /> vs <br /> bytemaster
                </span>
              </div>

              <div className="match-preview">
                <span>
                  CodeNinja <br /> vs <br /> bytemaster
                </span>
              </div>

              <div className="match-preview">
                <span>
                  CodeNinja <br /> vs <br /> bytemaster
                </span>
              </div>
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
            ⚔ Human
          </button>

          <button
            className={playType === "ai" ? "active" : ""}
            onClick={() => setPlayType("ai")}
          >
            🤖 AI
          </button>

          <button
            className={playType === "friend" ? "active" : ""}
            onClick={() => setPlayType("friend")}
          >
            👥 Friend
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
                  Casual
                </button>

                <button
                  className={matchMode === "ranked" ? "active" : ""}
                  onClick={() => setMatchMode("ranked")}
                >
                  Ranked
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

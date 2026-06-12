"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import "./leaderboard.css";
import "./podium.css";
import "./leaderboardTable.css";

import Podium from "./Podium";
import LeaderboardTable from "./LeaderboardTable";
import LeaderboardHero from "./leaderboardHero";

import socket from "@/lib/socket";

export default function LeaderboardPage() {
  const [eloLeaderboard, setEloLeaderboard] = useState([]);
  const [solvedLeaderboard, setSolvedLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  const [leaderboardType, setLeaderboardType] = useState("elo");

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data } = await api.get("/leaderboard");

        setEloLeaderboard(data.eloLeaderboard);
        setSolvedLeaderboard(data.solvedLeaderboard);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();

    const handleLeaderboardUpdate = (data) => {
      setEloLeaderboard(data.eloLeaderboard);
      setSolvedLeaderboard(data.solvedLeaderboard);
    };

    socket.on("leaderboard:update", handleLeaderboardUpdate);

    return () => {
      socket.off("leaderboard:update", handleLeaderboardUpdate);
    };
  }, []);

  if (loading) {
    return (
      <main className="leaderboard-page">
        <h2>Loading Leaderboard...</h2>
      </main>
    );
  }

  const currentLeaderboard =
    leaderboardType === "elo" ? eloLeaderboard : solvedLeaderboard;

  return (
    <main className="leaderboard-page">
      <LeaderboardHero
        leaderboardType={leaderboardType}
        setLeaderboardType={setLeaderboardType}
      />

      <section className="leaderboard-single-column">
        <div
          className={`leaderboard-column ${
            leaderboardType === "elo" ? "elo-theme" : "solved-theme"
          }`}
        >
          <div className="leaderboard-column-header">
            <h2>
              {leaderboardType === "elo"
                ? "ELO Rankings"
                : "Most Problems Solved"}
            </h2>
          </div>

          <Podium users={currentLeaderboard} type={leaderboardType} />

          <LeaderboardTable users={currentLeaderboard} type={leaderboardType} />
        </div>
      </section>
    </main>
  );
}

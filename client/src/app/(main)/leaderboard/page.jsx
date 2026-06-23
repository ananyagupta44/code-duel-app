"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import "./leaderboard.css";
import "./components/podium.css";
import "./components/leaderboardTable.css";
import Podium from "./components/Podium";
import LeaderboardTable from "./components/LeaderboardTable";
import LeaderboardHero from "./components/leaderboardHero";
import YourStatsCard from "./components/YourStatsCard";
import socket from "@/lib/socket";
import EloDistribution from "./components/EloDistribution";
import SolvedDistribution from "./components/SolvedDistribution";
import { useSearchParams } from "next/navigation";

export default function LeaderboardPage() {
  const [eloLeaderboard, setEloLeaderboard] = useState([]);
  const [solvedLeaderboard, setSolvedLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myStats, setMyStats] = useState(null);
  const searchParams = useSearchParams();
  
  const [leaderboardType, setLeaderboardType] = useState("elo");

  useEffect(() => {
    const type = searchParams.get("type");

    if (type === "solved" || type === "elo") {
      setLeaderboardType(type);
    }
  }, [searchParams]);

  useEffect(() => {
    if (myStats) {
      console.log("ELO DISTRIBUTION:", myStats.eloDistribution);
    }
  }, [myStats]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const [leaderboardRes, statsRes] = await Promise.all([
          api.get("/leaderboard"),
          api.get("/leaderboard/me"),
        ]);

        setEloLeaderboard(leaderboardRes.data.eloLeaderboard);

        setSolvedLeaderboard(leaderboardRes.data.solvedLeaderboard);

        setMyStats(statsRes.data);

        console.log("MY STATS:", statsRes.data);
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

      <div className="leaderboard-content-layout">
        <div className="leaderboard-left-panel">
          <YourStatsCard type={leaderboardType} stats={myStats} />
          {leaderboardType === "elo" ? (
            <EloDistribution data={myStats?.eloDistribution} />
          ) : (
            <SolvedDistribution data={myStats?.solved?.topicBreakdown} />
          )}
        </div>

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

            <LeaderboardTable
              users={currentLeaderboard}
              type={leaderboardType}
            />
          </div>
        </section>
      </div>
    </main>
  );
}

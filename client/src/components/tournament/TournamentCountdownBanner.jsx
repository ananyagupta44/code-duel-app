"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { RiTimerFlashLine } from "react-icons/ri";
import "./tournamentCountdownBanner.css";
import socket from "@/lib/socket";
import { useAuth } from "@/context/authContext";

export default function TournamentCountdownBanner() {
  const [match, setMatch] = useState(null);
  const [timeLeft, setTimeLeft] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const res = await api.get("/tournaments/my-next-match");

        setMatch(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchMatch();

    const interval = setInterval(fetchMatch, 15000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleMatchReady = () => {
      setMatch(null);
    };

    socket.on("tournamentMatchReady", handleMatchReady);

    return () => {
      socket.off("tournamentMatchReady", handleMatchReady);
    };
  }, []);

  useEffect(() => {
    if (!match?.startTime) return;

    const timer = setInterval(() => {
      const diff = new Date(match.startTime).getTime() - Date.now();

      if (diff <= 0) {
        setTimeLeft("Starting...");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));

      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );

      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${mins}m`);
      } else {
        setTimeLeft(
          `${String(hours).padStart(2, "0")}:${String(mins).padStart(
            2,
            "0",
          )}:${String(secs).padStart(2, "0")}`,
        );
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [match]);

  if (!match) return null;

  if (match.status !== "waiting") return null;

  const currentUserId = user?._id;

  const isPlayer1 = String(match.player1Id?._id) === String(currentUserId);

  const opponent = isPlayer1
    ? match.player2Id?.username
    : match.player1Id?.username;
  return (
    <div className="tcb-banner">
      <div className="tcb-left">
        <div className="tcb-icon">
          <RiTimerFlashLine />
        </div>

        <div className="tcb-content">
          <div className="tcb-title">Tournament Match Scheduled</div>

          <div className="tcb-subtitle">
            {match.tournamentId?.name}
            {" • "}
            vs {opponent}
          </div>
        </div>
      </div>

      <div className="tcb-right">
        <div className="tcb-label">Starts In</div>

        <div className="tcb-timer">{timeLeft}</div>
      </div>
    </div>
  );
}

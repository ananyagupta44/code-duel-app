// components/tournament/ActiveMatchBanner.jsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import socket from "@/lib/socket";
import { RiSwordLine } from "react-icons/ri";
import "./activeMatchBanner.css";
import api from "@/lib/api";

export default function ActiveMatchBanner() {
  const router = useRouter();
  const [matchAlert, setMatchAlert] = useState(null);

  useEffect(() => {
    const handleMatchReady = (data) => {
      const dismissed = localStorage.getItem("dismissedTournamentMatch");

      if (dismissed !== data.matchId) {
        setMatchAlert(data);
      }
    };

    socket.on("tournamentMatchReady", handleMatchReady);

    return () => {
      socket.off("tournamentMatchReady", handleMatchReady);
    };
  }, []);

  useEffect(() => {
    const fetchActiveMatch = async () => {
      try {
        const res = await api.get("/tournaments/my-active-match");
        console.log("ACTIVE MATCH", res.data);

        if (!res.data) return;

        const currentUserId = localStorage.getItem("userId");

        const opponentName =
          res.data.player1Id._id === currentUserId
            ? res.data.player2Id.username
            : res.data.player1Id.username;

        setMatchAlert({
          matchId: res.data._id,
          tournamentId: res.data.tournamentId._id,
          tournamentName: res.data.tournamentId.name,
          opponentName,
        });
      } catch (err) {
        console.log(err);
      }
    };

    fetchActiveMatch();
  }, []);

  if (!matchAlert) return null;

  return (
    <div className="active-match-banner">
      <div className="amb-left">
        <div className="amb-icon">
          <RiSwordLine />
        </div>
        <div className="amb-text">
          <div className="amb-title">Your match is ready!</div>
          <div className="amb-sub">
            {matchAlert.tournamentName} — vs {matchAlert.opponentName}
          </div>
        </div>
      </div>

      <div className="amb-actions">
        <button
          className="amb-play-btn"
          onClick={() => {
            localStorage.setItem(
              "dismissedTournamentMatch",
              matchAlert.matchId,
            );

            setMatchAlert(null);

            router.push(`/duel/${matchAlert.matchId}`);
          }}
        >
          Play Now
        </button>
        <button className="amb-dismiss-btn" onClick={() => setMatchAlert(null)}>
          Later
        </button>
      </div>
    </div>
  );
}

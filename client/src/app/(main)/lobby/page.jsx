"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import "./lobby.css";
import PlayerCard from "./components/PlayerCard";
import socket from "@/lib/socket";
import { fjalla, chivo } from "@/fonts";
import { IoLogoGameControllerB } from "react-icons/io";
import { FaRobot } from "react-icons/fa";
import { FaUserFriends } from "react-icons/fa";
import { FaStopCircle } from "react-icons/fa";
import { RiSwordLine } from "react-icons/ri";

export default function LobbyPage() {
  const router = useRouter();

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [creatingMatch, setCreatingMatch] = useState(null);
  const [playType, setPlayType] = useState("human");
  const [matchMode, setMatchMode] = useState("casual");
  const [difficulty, setDifficulty] = useState("medium");
  const [topic, setTopic] = useState("array");
  const [currentUserElo, setCurrentUserElo] = useState(1000);
  const [pendingMatch, setPendingMatch] = useState(null);
  const [waitingModal, setWaitingModal] = useState(false);

  useEffect(() => {
    const handleRejected = ({ matchId }) => {
      if (pendingMatch === matchId) {
        setWaitingModal(false);
        setPendingMatch(null);

        alert("Challenge was declined.");
      }
    };

    socket.on("inviteRejected", handleRejected);

    return () => {
      socket.off("inviteRejected", handleRejected);
    };
  }, [pendingMatch]);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/matches/lobby");

      console.log("API USERS", res.data.users);

      setUsers(res.data.users);

      setCurrentUserElo(res.data.currentUserElo);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const displayedUsers = useMemo(() => {
    const safeUsers = Array.isArray(users) ? users : [];

    let result = [...safeUsers];

    if (matchMode === "casual") {
      result.sort((a, b) => b.solvedCount - a.solvedCount);
    }

    if (matchMode === "ranked") {
      result = result
        .filter((user) => Math.abs(user.elo - currentUserElo) <= 200)
        .sort((a, b) => b.elo - a.elo);
    }

    return result.map((user, index) => ({
      ...user,
      leaderboardRank: index + 1,
    }));
  }, [users, matchMode, currentUserElo]);

  const challengeUser = async (opponentId) => {
    try {
      setCreatingMatch(opponentId);

      const res = await api.post("/matches/create", {
        opponentId,
        matchType: matchMode,
      });
      console.log("MATCH RESPONSE:", res.data);
      setPendingMatch(res.data._id);
      setWaitingModal(true);
      console.log("Socket connected:", socket.connected);
      console.log("Socket ID:", socket.id);
      socket.emit("sendMatchInvite", {
        matchId: res.data._id,
        opponentId,
      });

      console.log("INVITE SENT", res.data._id, opponentId);
    } catch (error) {
      console.log("CREATE MATCH ERROR:", error);
      console.log(error);
      alert(error.response?.data?.message || "Failed to create match");
    } finally {
      setCreatingMatch(null);
    }
  };

  useEffect(() => {
    fetchUsers();

    const handleLobbyUpdate = (data) => {
      setUsers(data.users);
    };

    socket.on("lobbyUpdated", (users) => {
      console.log("SOCKET USERS", users);
      setUsers(users);
    });

    return () => {
      socket.off("lobbyUpdated", handleLobbyUpdate);
    };
  }, []);

  const top10 = displayedUsers.slice(0, 10);
  const top25 = displayedUsers.slice(10, 25);
  const top50 = displayedUsers.slice(25, 50);
  const remaining = displayedUsers.slice(50);

  return (
    <div className={`lobby-page ${chivo.className}`}>
      <div className="choose-opponent-section">
        <h1 className={`choose-title ${fjalla.className}`}>
          CHOOSE AN OPPONENT
        </h1>

        {matchMode === "casual" ? (
          <div className="opponents-grid">
            <div className={`opponent-column ${fjalla.className}`}>
              <h2>Top 10</h2>

              {top10.map((user) => (
                <PlayerCard
                  key={user._id}
                  user={user}
                  challengeUser={challengeUser}
                  creatingMatch={creatingMatch}
                />
              ))}
            </div>

            <div className={`opponent-column ${fjalla.className}`}>
              <h2>Top 25</h2>

              {top25.map((user) => (
                <PlayerCard
                  key={user._id}
                  user={user}
                  challengeUser={challengeUser}
                  creatingMatch={creatingMatch}
                />
              ))}
            </div>

            <div className={`opponent-column ${fjalla.className}`}>
              <h2>Top 50</h2>

              {top50.map((user) => (
                <PlayerCard
                  key={user._id}
                  user={user}
                  challengeUser={challengeUser}
                  creatingMatch={creatingMatch}
                />
              ))}
            </div>

            <div className={`opponent-column ${fjalla.className}`}>
              <h2>All Players</h2>

              {remaining.map((user) => (
                <PlayerCard
                  key={user._id}
                  user={user}
                  challengeUser={challengeUser}
                  creatingMatch={creatingMatch}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="ranked-section">
            <h2 className={fjalla.className}>ELO Ranked Matchmaking</h2>

            <div className="ranked-list">
              {displayedUsers.map((user) => (
                <PlayerCard
                  key={user._id}
                  user={user}
                  challengeUser={challengeUser}
                  creatingMatch={creatingMatch}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      {/* matchmaking panel*/}
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
      {waitingModal && (
        <div className="waiting-modal-overlay">
          <div className="waiting-modal">
            <div className="waiting-spinner"></div>

            <h2>Challenge Sent</h2>

            <p>Waiting for the opponent to accept your challenge...</p>

            <button
              className="cancel-wait-btn"
              onClick={() => {
                socket.emit("rejectMatchInvite", {
                  matchId: pendingMatch,
                });

                setWaitingModal(false);
                setPendingMatch(null);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

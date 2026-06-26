"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import "./lobby.css";
import PlayerCard from "./components/PlayerCard";
import { useAuth } from "@/context/authContext";
import socket from "@/lib/socket";
import { fjalla, chivo } from "@/fonts";
import { IoLogoGameControllerB } from "react-icons/io";
import { FaRobot } from "react-icons/fa";
import { FaUserFriends } from "react-icons/fa";
import { FaStopCircle } from "react-icons/fa";
import { RiSwordLine } from "react-icons/ri";
import { FaLongArrowAltDown } from "react-icons/fa";
import AiBotGrid from "./components/aiBotGrid";
import "./components/aiBotGrid.css";
import { useAuthDrawer } from "@/context/drawerContext";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const PLAY_TYPE_COPY = {
  human: {
    heading: "Find Your Game",
    subtext: "Get matched instantly with a random online player.",
  },
  ai: {
    heading: "Practice Makes Perfect",
    subtext: "Pick a bot and sharpen your skills at your own pace.",
  },
  friend: {
    heading: "Challenge a Friend",
    subtext: "Pick any online player and send them a direct challenge.",
  },
};

function LobbyContent() {
  const router = useRouter();
  const { openLogin } = useAuthDrawer();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [creatingMatch, setCreatingMatch] = useState(null);
  const [playType, setPlayType] = useState("human");
  const [matchMode, setMatchMode] = useState("casual");
  const [difficulty, setDifficulty] = useState("medium");
  const [topic, setTopic] = useState("array");
  const [currentUserElo, setCurrentUserElo] = useState(1000);
  const [pendingMatch, setPendingMatch] = useState(null);
  const [waitingModal, setWaitingModal] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [selectedBot, setSelectedBot] = useState("rookie");
  const [topics, setTopics] = useState([]);
  const [findingMatch, setFindingMatch] = useState(false);
  const searchParams = useSearchParams();

  const aiBots = [
    {
      id: "rookie",
      name: "Rookie Bot",
      elo: 800,
      tier: "Beginner",
      avatar: "🤖",
      description:
        "Still learning loops. Makes silly mistakes — great for a confidence boost.",
      speed: 20,
      accuracy: 25,
      theme: "teal",
    },
    {
      id: "debug-dave",
      name: "Debug Dave",
      elo: 1000,
      tier: "Novice",
      avatar: "🐛",
      description:
        "Sometimes fixes bugs. Sometimes creates them. Unpredictable pace.",
      speed: 35,
      accuracy: 38,
      theme: "blue",
    },
    {
      id: "array-assassin",
      name: "Array Assassin",
      elo: 1200,
      tier: "Intermediate",
      avatar: "⚡",
      description:
        "Lightning-fast array specialist. Sharp on indices and pointers.",
      speed: 55,
      accuracy: 50,
      theme: "coral",
    },
    {
      id: "graph-guru",
      name: "Graph Guru",
      elo: 1400,
      tier: "Advanced",
      avatar: "🕸️",
      description: "Lives inside BFS and DFS. Traverses problems with ease.",
      speed: 65,
      accuracy: 68,
      theme: "purple",
    },
    {
      id: "dp-demon",
      name: "DP Demon",
      elo: 1600,
      tier: "Expert",
      avatar: "🧠",
      description:
        "Remembers everything. Memoizes its way through hard problems.",
      speed: 78,
      accuracy: 80,
      theme: "pink",
    },
    {
      id: "grandmaster",
      name: "Grandmaster AI",
      elo: 1800,
      tier: "Elite",
      avatar: "👑",
      description: "Elite arena veteran. Optimal solutions on the first try.",
      speed: 90,
      accuracy: 92,
      theme: "gold",
    },
    {
      id: "champion",
      name: "AI Champion",
      elo: 2500,
      tier: "Final boss",
      avatar: "💀",
      description:
        "The final boss. Flawless logic, zero mercy, no second chances.",
      speed: 100,
      accuracy: 100,
      theme: "crimson",
    },
  ];

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

  useEffect(() => {
    const playTypeParam = searchParams.get("playType");
    const matchModeParam = searchParams.get("matchMode");
    const difficultyParam = searchParams.get("difficulty");
    const topicParam = searchParams.get("topic");

    if (playTypeParam) setPlayType(playTypeParam);
    if (matchModeParam) setMatchMode(matchModeParam);
    if (difficultyParam) setDifficulty(difficultyParam);
    if (topicParam) setTopic(topicParam);
  }, [searchParams]);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await api.get("/problems/topics");

        setTopics(res.data);

        if (res.data.length > 0) {
          setTopic(res.data[0]);
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchTopics();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/matches/lobby");
      setUsers(res.data.users);
      setCurrentUserElo(res.data.currentUserElo);
      setCurrentUserId(res.data.currentUserId);
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
        difficulty,
      });
      setPendingMatch(res.data._id);
      setWaitingModal(true);
      socket.emit("sendMatchInvite", {
        matchId: res.data._id,
        opponentId,
      });
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Failed to create match");
    } finally {
      setCreatingMatch(null);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!currentUserId) return;

    const handleLobbyUpdate = (users) => {
      setUsers(users.filter((u) => String(u._id) !== String(currentUserId)));
    };

    socket.on("lobbyUpdated", handleLobbyUpdate);

    return () => {
      socket.off("lobbyUpdated", handleLobbyUpdate);
    };
  }, [currentUserId]);

  const handleFindMatch = async () => {
    if (findingMatch) return;

    setFindingMatch(true);

    try {
      if (playType === "friend") {
        router.push("/create-game");
        return;
      }

      if (playType === "ai") {
        const res = await api.post("/ai/create", {
          topic,
          difficulty,
          botId: selectedBot,
        });

        router.push(`/duel/${res.data.matchId}`);
        return;
      }

      const res = await api.post("/matches/find", {
        matchType: matchMode,
        difficulty,
      });

      router.push(`/duel/${res.data.matchId}`);
    } catch (error) {
      alert(error.response?.data?.message || "No opponent found");
    } finally {
      setFindingMatch(false);
    }
  };

  const top10 = displayedUsers.slice(0, 10);
  const top25 = displayedUsers.slice(10, 25);
  const top50 = displayedUsers.slice(25, 50);
  const remaining = displayedUsers.slice(50);

  const heading = PLAY_TYPE_COPY[playType]?.heading ?? "Find Your Game";
  const subtext = PLAY_TYPE_COPY[playType]?.subtext ?? "";

  return (
    <div className={`lobby-page panel-${playType} ${chivo.className}`}>
      {playType === "friend" && (
        <div className="choose-opponent-section">
          <h1 className={`choose-title ${fjalla.className}`}>
            CHOOSE AN OPPONENT
          </h1>

          {matchMode === "casual" ? (
            <div className="opponents-grid">
              <div className={`opponent-column ${fjalla.className}`}>
                <h2>
                  Top 10{" "}
                  <span className="online-count">{top10.length} online</span>
                </h2>

                {top10.map((user, index) => (
                  <PlayerCard
                    key={user._id}
                    user={user}
                    challengeUser={challengeUser}
                    creatingMatch={creatingMatch}
                    index={index}
                  />
                ))}
              </div>

              <div className={`opponent-column ${fjalla.className}`}>
                <h2>
                  Top 25{" "}
                  <span className="online-count">{top25.length} online</span>
                </h2>

                {top25.map((user, index) => (
                  <PlayerCard
                    key={user._id}
                    user={user}
                    challengeUser={challengeUser}
                    creatingMatch={creatingMatch}
                    index={index}
                  />
                ))}
              </div>

              <div className={`opponent-column ${fjalla.className}`}>
                <h2>
                  Top 50{" "}
                  <span className="online-count">{top50.length} online</span>
                </h2>

                {top50.map((user, index) => (
                  <PlayerCard
                    key={user._id}
                    user={user}
                    challengeUser={challengeUser}
                    creatingMatch={creatingMatch}
                    index={index}
                  />
                ))}
              </div>

              <div className={`opponent-column ${fjalla.className}`}>
                <h2>
                  All Players{" "}
                  <span className="online-count">
                    {remaining.length} online
                  </span>
                </h2>

                {remaining.map((user, index) => (
                  <PlayerCard
                    key={user._id}
                    user={user}
                    challengeUser={challengeUser}
                    creatingMatch={creatingMatch}
                    index={index}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="ranked-section">
              <h2 className={fjalla.className}>ELO Ranked Matchmaking</h2>
              <p className="ranked-note">
                You can only challenge players within ±200 ELO of your rating.
              </p>

              <div className="ranked-list">
                {displayedUsers.map((user, index) => (
                  <PlayerCard
                    key={user._id}
                    user={user}
                    challengeUser={challengeUser}
                    creatingMatch={creatingMatch}
                    index={index}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {playType === "human" && (
        <div className="choose-opponent-section">
          <h1 className={`choose-title ${fjalla.className}`}>
            FIND YOUR NEXT DUEL
          </h1>

          {matchMode === "casual" ? (
            <div className="opponents-grid">
              <div className={`opponent-column ${fjalla.className}`}>
                <h2>
                  Top 10{" "}
                  <span className="online-count">{top10.length} online</span>
                </h2>

                {top10.map((user, index) => (
                  <PlayerCard
                    key={user._id}
                    user={user}
                    showChallenge={false}
                    index={index}
                  />
                ))}
              </div>

              <div className={`opponent-column ${fjalla.className}`}>
                <h2>
                  Top 25{" "}
                  <span className="online-count">{top25.length} online</span>
                </h2>

                {top25.map((user, index) => (
                  <PlayerCard
                    key={user._id}
                    user={user}
                    showChallenge={false}
                    index={index}
                  />
                ))}
              </div>

              <div className={`opponent-column ${fjalla.className}`}>
                <h2>
                  Top 50{" "}
                  <span className="online-count">{top50.length} online</span>
                </h2>

                {top50.map((user, index) => (
                  <PlayerCard
                    key={user._id}
                    user={user}
                    showChallenge={false}
                    index={index}
                  />
                ))}
              </div>

              <div className={`opponent-column ${fjalla.className}`}>
                <h2>
                  All Players{" "}
                  <span className="online-count">
                    {remaining.length} online
                  </span>
                </h2>

                {remaining.map((user, index) => (
                  <PlayerCard
                    key={user._id}
                    user={user}
                    showChallenge={false}
                    index={index}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="ranked-section">
              <h2 className={fjalla.className}>ELO Ranked Matchmaking</h2>
              <p className="ranked-note">
                You can only be matched with players within ±200 ELO of your
                rating.
              </p>

              <div className="ranked-list">
                {displayedUsers.map((user, index) => (
                  <PlayerCard
                    key={user._id}
                    user={user}
                    showChallenge={false}
                    index={index}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {playType === "ai" && (
        <div className="choose-opponent-section">
          <h1 className={`choose-title ${fjalla.className}`}>PRACTICE VS AI</h1>

          <AiBotGrid
            bots={aiBots}
            selectedBot={selectedBot}
            onSelect={setSelectedBot}
          />
        </div>
      )}
      <div className="lobby-subheading">
        <div className="lobby-subheading-text">
          <h1>{heading}</h1>
          {subtext && <p className="lobby-subheading-subtext">{subtext}</p>}
        </div>
        <div className="matchmaking-heading-arrow">
          <FaLongArrowAltDown size={32} />
        </div>
      </div>
      {/* matchmaking panel*/}
      <section className="matchmaking-panel">
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
                {topics.map((item) => (
                  <button
                    key={item}
                    className={topic === item ? "active" : ""}
                    onClick={() => setTopic(item)}
                  >
                    {item === "random" ? "Random" : item}
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

        <button
  className={`find-match-btn ${findingMatch ? "loading" : ""}`}
  disabled={findingMatch}
  onClick={() => {
    if (!findingMatch) {
      if (!isAuthenticated) {
        openLogin();
      } else {
        handleFindMatch();
      }
    }
  }}
>
  {findingMatch ? (
    <>
      <span className="btn-spinner" />
      Starting...
    </>
  ) : playType === "friend" ? (
    "CREATE GAME"
  ) : playType === "ai" ? (
    "START GAME"
  ) : (
    "FIND MATCH"
  )}
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

export default function LobbyPage() {
  return (
    <Suspense
      fallback={
        <main className="lobby-page">
          <h2>Loading Lobby...</h2>
        </main>
      }
    >
      <LobbyContent />
    </Suspense>
  );
}

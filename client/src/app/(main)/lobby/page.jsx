"use client";

import { useEffect, useMemo, useState, useRef } from "react";
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
import TutorialModal from "./components/TutorialModal";
import "./components/tutorialModal.css";
import HelpDialog from "./components/helpDialog";
import { FaQuestion } from "react-icons/fa6";

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
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const playTypeRef = useRef(null);
  const modeRef = useRef(null);
  const topicRef = useRef(null);
  const difficultyRef = useRef(null);
  const botRef = useRef(null);
  const startButtonRef = useRef(null);
  const searchParams = useSearchParams();
  const helpBtnRef = useRef(null);
  const [helpPopoverPos, setHelpPopoverPos] = useState({ top: 0, left: 0 });
  const isOverBtn = useRef(false);
  const isOverPopover = useRef(false);

  const openHelpPopover = () => {
    const rect = helpBtnRef.current.getBoundingClientRect();
    setHelpPopoverPos({
      top: rect.bottom + 8,
      left: rect.right - 300, // popover width is 300px, right-align with button
    });
    setShowHelpDialog(true);
  };

  const handleBtnEnter = () => {
    isOverBtn.current = true;
    openHelpPopover();
  };

  const handleBtnLeave = () => {
    isOverBtn.current = false;
    setTimeout(() => {
      if (!isOverBtn.current && !isOverPopover.current) {
        setShowHelpDialog(false);
      }
    }, 100);
  };

  const handlePopoverEnter = () => {
    isOverPopover.current = true;
  };

  const handlePopoverLeave = () => {
    isOverPopover.current = false;
    setTimeout(() => {
      if (!isOverBtn.current && !isOverPopover.current) {
        setShowHelpDialog(false);
      }
    }, 100);
  };

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

  useEffect(() => {
    const alreadySeen = localStorage.getItem("lobbyTutorialSeen");

    if (!alreadySeen) {
      setShowTutorial(true);
      setTutorialStep(0);
    }
  }, []);

  const skipTutorial = () => {
    localStorage.setItem("lobbyTutorialSeen", "true");
    setShowTutorial(false);
  };

  const finishTutorial = () => {
    localStorage.setItem("lobbyTutorialSeen", "true");
    setShowTutorial(false);
    setTutorialStep(0);
  };

  const startTutorial = () => {
    setPlayType("human");
    setMatchMode("casual");
    setDifficulty("medium");
    setTopic(topics[0] || "array");
    setSelectedBot("rookie");

    setTutorialStep(0);
    setShowHelpDialog(false);
    setShowTutorial(true);
  };

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

  const currentTutorialRef = useMemo(() => {
    if (!showTutorial) return null;
    if (tutorialStep === 0) return playTypeRef; // step 0 will be centered anyway
    if (playType === "ai" && tutorialStep === 1) return topicRef;
    if (playType !== "ai" && tutorialStep === 1) return modeRef;
    if (tutorialStep === 2) return difficultyRef;
    if (playType === "ai" && tutorialStep === 3) return botRef;
    return startButtonRef;
  }, [tutorialStep, playType, showTutorial]);

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

  const getTutorialStep = () => {
    if (playType === "human") {
      return [
        {
          title: "Choose Play Type",
          description: "Select Random, AI or Friend.",
        },
        {
          title: "Choose Match Mode",
          description: "Pick Ranked or Non Ranked.",
        },
        {
          title: "Choose Difficulty",
          description: "Select the problem difficulty.",
        },
        {
          title: "Find a Match",
          description: "Click FIND MATCH to start matchmaking.",
        },
      ];
    }

    if (playType === "ai") {
      return [
        {
          title: "Choose Play Type",
          description: "Select Random, AI or Friend.",
        },
        {
          title: "Choose Problem Topic",
          description: "Select the type of problem you want.",
        },
        {
          title: "Choose Difficulty",
          description: "Select problem difficulty.",
        },
        {
          title: "Choose an AI Bot",
          description: "Select the bot you'd like to battle.",
        },
        {
          title: "Start Game",
          description: "Click START GAME to begin.",
        },
      ];
    }

    return [
      {
        title: "Choose Play Type",
        description: "Select Random, AI or Friend.",
      },
      {
        title: "Choose Match Mode",
        description: "Pick Ranked or Non Ranked.",
      },
      {
        title: "Choose Difficulty",
        description: "Select the problem difficulty.",
      },
      {
        title: "Challenge a Player",
        description: "Challenge an online player or click CREATE GAME.",
      },
    ];
  };

  const tutorialSteps = getTutorialStep();

  return (
    <div className={`lobby-page panel-${playType} ${chivo.className}`}>
      <div className="lobby-help">
        <button
          ref={helpBtnRef}
          className="help-btn"
          aria-label="Help"
          onMouseEnter={handleBtnEnter}
          onMouseLeave={handleBtnLeave}
        >
          <FaQuestion />
        </button>
        {showHelpDialog && (
          <HelpDialog
            position={helpPopoverPos}
            onMouseEnter={handlePopoverEnter}
            onMouseLeave={handlePopoverLeave}
            onCancel={() => setShowHelpDialog(false)}
            onStart={startTutorial}
          />
        )}
      </div>
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
          <div
            ref={botRef}
            id="tutorial-bots"
            className={
              showTutorial && playType === "ai" && tutorialStep === 3
                ? "tutorial-highlight"
                : ""
            }
          >
            <AiBotGrid
              bots={aiBots}
              selectedBot={selectedBot}
              onSelect={(botId) => {
                setSelectedBot(botId);

                if (showTutorial && playType === "ai" && tutorialStep === 3) {
                  setTutorialStep(4);
                }
              }}
            />
          </div>
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
        <div
          ref={playTypeRef}
          id="tutorial-play-type"
          className={`play-type ${
            showTutorial && tutorialStep === 0 ? "tutorial-highlight" : ""
          }`}
        >
          <button
            className={playType === "human" ? "active" : ""}
            onClick={() => {
              setPlayType("human");

              if (showTutorial && tutorialStep === 0) {
                setTutorialStep(1);
              }
            }}
          >
            <IoLogoGameControllerB /> Random
          </button>

          <button
            className={playType === "ai" ? "active" : ""}
            onClick={() => {
              setPlayType("ai");

              if (showTutorial && tutorialStep === 0) {
                setTutorialStep(1);
              }
            }}
          >
            <FaRobot /> AI
          </button>

          <button
            className={playType === "friend" ? "active" : ""}
            onClick={() => {
              setPlayType("friend");

              if (showTutorial && tutorialStep === 0) {
                setTutorialStep(1);
              }
            }}
          >
            <FaUserFriends /> Friend
          </button>
        </div>

        <div className="match-options">
          {playType === "friend" && (
            <>
              <div
                ref={modeRef}
                id="tutorial-match-mode"
                className={`match-mode ${
                  showTutorial && tutorialStep === 1 && playType !== "ai"
                    ? "tutorial-highlight"
                    : ""
                }`}
              >
                <button
                  className={matchMode === "casual" ? "active" : ""}
                  onClick={() => {
                    setMatchMode("casual");

                    if (showTutorial && tutorialStep === 1) {
                      setTutorialStep(2);
                    }
                  }}
                >
                  <FaStopCircle />
                  Non Ranked
                </button>

                <button
                  className={matchMode === "ranked" ? "active" : ""}
                  onClick={() => {
                    setMatchMode("ranked");

                    if (showTutorial && tutorialStep === 1) {
                      setTutorialStep(2);
                    }
                  }}
                >
                  <RiSwordLine />
                  ELO Ranked
                </button>
              </div>

              <div
                ref={difficultyRef}
                id="tutorial-difficulty"
                className={`difficulty-options ${
                  showTutorial && tutorialStep === 2 ? "tutorial-highlight" : ""
                }`}
              >
                {["Easy", "Medium", "Hard", "Random"].map((level) => (
                  <button
                    key={level}
                    className={
                      difficulty === level.toLowerCase() ? "active" : ""
                    }
                    onClick={() => {
                      setDifficulty(level.toLowerCase());

                      if (showTutorial && tutorialStep === 2) {
                        setTutorialStep(3);
                      }
                    }}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </>
          )}

          {playType === "ai" && (
            <>
              <div
                ref={topicRef}
                id="tutorial-topic"
                className={`topic-options ${
                  showTutorial && tutorialStep === 1 && playType === "ai"
                    ? "tutorial-highlight"
                    : ""
                }`}
              >
                {topics.map((item) => (
                  <button
                    key={item}
                    className={topic === item ? "active" : ""}
                    onClick={() => {
                      setTopic(item);

                      if (
                        showTutorial &&
                        playType === "ai" &&
                        tutorialStep === 1
                      ) {
                        setTutorialStep(2);
                      }
                    }}
                  >
                    {item === "random" ? "Random" : item}
                  </button>
                ))}
              </div>

              <div
                ref={difficultyRef}
                id="tutorial-difficulty"
                className={`difficulty-options ${
                  showTutorial && tutorialStep === 2 ? "tutorial-highlight" : ""
                }`}
              >
                {["Easy", "Medium", "Hard", "Random"].map((level) => (
                  <button
                    key={level}
                    className={
                      difficulty === level.toLowerCase() ? "active" : ""
                    }
                    onClick={() => {
                      setDifficulty(level.toLowerCase());

                      if (showTutorial && tutorialStep === 2) {
                        setTutorialStep(3);
                      }
                    }}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </>
          )}

          {playType === "human" && (
            <div className="friend-panel">
              <div
                ref={modeRef}
                id="tutorial-match-mode"
                className={`match-mode ${
                  showTutorial && tutorialStep === 1 && playType !== "ai"
                    ? "tutorial-highlight"
                    : ""
                }`}
              >
                <button
                  className={matchMode === "casual" ? "active" : ""}
                  onClick={() => {
                    setMatchMode("casual");

                    if (showTutorial && tutorialStep === 1) {
                      setTutorialStep(2);
                    }
                  }}
                >
                  <FaStopCircle />
                  Non Ranked
                </button>

                <button
                  className={matchMode === "ranked" ? "active" : ""}
                  onClick={() => {
                    setMatchMode("ranked");

                    if (showTutorial && tutorialStep === 1) {
                      setTutorialStep(2);
                    }
                  }}
                >
                  <RiSwordLine />
                  ELO Ranked
                </button>
              </div>
              <div className="space"></div>
              <div
                ref={difficultyRef}
                id="tutorial-difficulty"
                className={`difficulty-options ${
                  showTutorial && tutorialStep === 2 ? "tutorial-highlight" : ""
                }`}
              >
                {["Easy", "Medium", "Hard", "Random"].map((level) => (
                  <button
                    key={level}
                    className={
                      difficulty === level.toLowerCase() ? "active" : ""
                    }
                    onClick={() => {
                      setDifficulty(level.toLowerCase());

                      if (showTutorial && tutorialStep === 2) {
                        setTutorialStep(3);
                      }
                    }}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          ref={startButtonRef}
          id="tutorial-start-button"
          className={`find-match-btn
        ${
          showTutorial &&
          ((playType === "human" && tutorialStep === 3) ||
            (playType === "friend" && tutorialStep === 3) ||
            (playType === "ai" && tutorialStep === 4))
            ? "tutorial-highlight"
            : ""
        }
    `}
          disabled={findingMatch}
          onClick={() => {
            if (findingMatch) return;
            if (!isAuthenticated) {
              openLogin();
              return;
            }
            if (
              showTutorial &&
              ((playType === "human" && tutorialStep === 3) ||
                (playType === "friend" && tutorialStep === 3) ||
                (playType === "ai" && tutorialStep === 4))
            ) {
              finishTutorial();
            }
            handleFindMatch();
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

      {showTutorial && (
        <TutorialModal
          step={tutorialStep + 1}
          totalSteps={tutorialSteps.length}
          title={tutorialSteps[tutorialStep].title}
          description={tutorialSteps[tutorialStep].description}
          onSkip={skipTutorial}
          onNext={() => {
            if (tutorialStep + 1 >= tutorialSteps.length) {
              finishTutorial();
            } else {
              setTutorialStep((s) => s + 1);
            }
          }}
          targetRef={currentTutorialRef}
        />
      )}
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

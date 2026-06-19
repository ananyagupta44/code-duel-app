"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import api from "@/lib/api";
import "./practice.css";
import { fjalla } from "@/fonts";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useAuth } from "@/context/authContext";
import { useAuthDrawer } from "@/context/drawerContext";

export default function PracticePage() {
  const [problems, setProblems] = useState([]);
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("all");
  const [topic, setTopic] = useState("all");
  const [difficultyOpen, setDifficultyOpen] = useState(false);
  const difficultyRef = useRef(null);
  const [isAtEnd, setIsAtEnd] = useState(false);
  const topicsRef = useRef(null);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const { isAuthenticated } = useAuth();
  const { openLogin } = useAuthDrawer();

  const handleProblemClick = (e) => {
    if (!isAuthenticated) {
      e.preventDefault();
      openLogin();
    }
  };

  const handleTopicsScroll = () => {
    if (!topicsRef.current) return;

    if (isAtEnd) {
      topicsRef.current.scrollTo({
        left: 0,
        behavior: "smooth",
      });
    } else {
      topicsRef.current.scrollTo({
        left: topicsRef.current.scrollWidth,
        behavior: "smooth",
      });
    }
  };
  const topics = ["all", ...new Set(problems.map((problem) => problem.topic))];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const problemsRes = await api.get("/problems");

        console.log("FIRST PROBLEM:", problemsRes.data[0]);

        setProblems(problemsRes.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        difficultyRef.current &&
        !difficultyRef.current.contains(event.target)
      ) {
        setDifficultyOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const container = topicsRef.current;

    const handleScroll = () => {
      const atEnd =
        container.scrollLeft + container.clientWidth >=
        container.scrollWidth - 10;

      setIsAtEnd(atEnd);
    };

    container?.addEventListener("scroll", handleScroll);

    return () => {
      container?.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await api.get("/users/leaderboard");
        console.log("LEADERBOARD:", res.data);

        setLeaderboard(res.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchLeaderboard();
  }, []);

  useEffect(() => {
    const fetchSolved = async () => {
      const res = await api.get("/users/me/solved");

      console.log("SOLVED PROBLEMS:", res.data);

      setSolvedProblems(res.data);
    };

    fetchSolved();
  }, []);

  const solvedSet = new Set(solvedProblems || []);

  const filteredProblems = problems.filter((problem) => {
    const titleMatch = problem.title
      .toLowerCase()
      .includes(search.toLowerCase());

    const difficultyMatch =
      difficulty === "all" || problem.difficulty === difficulty;

    const topicMatch = topic === "all" || problem.topic === topic;

    return titleMatch && difficultyMatch && topicMatch;
  });

  return (
    <div className="practice-page">
      <div className="practice-header">
        <h1 className={fjalla.className}>Practice Problems</h1>

        <div className="filters">
          <input
            type="text"
            placeholder="Search problems..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="custom-dropdown" ref={difficultyRef}>
            <button
              className="dropdown-trigger"
              onClick={() => setDifficultyOpen(!difficultyOpen)}
            >
              {difficulty === "all" ? "All Difficulties" : difficulty}
              <span>▼</span>
            </button>

            {difficultyOpen && (
              <div className="dropdown-menu">
                <button
                  onClick={() => {
                    setDifficulty("all");
                    setDifficultyOpen(false);
                  }}
                >
                  All Difficulties
                </button>

                <button
                  onClick={() => {
                    setDifficulty("easy");
                    setDifficultyOpen(false);
                  }}
                >
                  Easy
                </button>

                <button
                  onClick={() => {
                    setDifficulty("medium");
                    setDifficultyOpen(false);
                  }}
                >
                  Medium
                </button>

                <button
                  onClick={() => {
                    setDifficulty("hard");
                    setDifficultyOpen(false);
                  }}
                >
                  Hard
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="practice-main">
        <div className="practice-content">
          <div className="practice-main">
            <div className="topics-wrapper">
              <div className="topics-container" ref={topicsRef}>
                {topics.map((item) => (
                  <button
                    key={item}
                    className={`topic-pill ${topic === item ? "active" : ""}`}
                    onClick={() => setTopic(item)}
                  >
                    {item === "all"
                      ? "All Topics"
                      : item
                          .split("-")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() + word.slice(1),
                          )
                          .join(" ")}
                  </button>
                ))}
              </div>

              <button className="topics-arrow" onClick={handleTopicsScroll}>
                {isAtEnd ? (
                  <ChevronLeft size={18} />
                ) : (
                  <ChevronRight size={18} />
                )}
              </button>
            </div>

            <div className="problem-table">
              <div className="table-header">
                <span>#</span>
                <span>Status</span>
                <span>Title</span>
                <span>Topic</span>
                <span>Difficulty</span>
              </div>

              {filteredProblems.map((problem, index) => {
                console.log(
                  problem.title,
                  problem.slug,
                  solvedSet.has(problem.slug),
                );

                return (
                  <Link
                    key={problem._id}
                    href={`/practice/${problem._id}`}
                    className="problem-row"
                    onClick={handleProblemClick}
                  >
                    <span>{index + 1}</span>

                    <span>
                      {solvedSet.has(problem.slug) ? (
                        <span className="status-badge solved">Solved</span>
                      ) : (
                        <span className="status-badge unsolved">Unsolved</span>
                      )}
                    </span>

                    <span>{problem.title}</span>

                    <span>
                      {problem.topic
                        .split("-")
                        .map(
                          (word) =>
                            word.charAt(0).toUpperCase() + word.slice(1),
                        )
                        .join(" ")}
                    </span>

                    <span className={`difficulty ${problem.difficulty}`}>
                      {problem.difficulty}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="leaderboard-sidebar">
            <h2>Leaderboard</h2>

            {leaderboard.map((user, index) => (
              <div key={user._id} className="leaderboard-user">
                <span
                  className={`practice-rank ${
                    index === 0
                      ? "gold"
                      : index === 1
                        ? "silver"
                        : index === 2
                          ? "bronze"
                          : ""
                  }`}
                >
                  #{index + 1}
                </span>

                <span className="username">{user.username}</span>

                <span className="score">{user.solved}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

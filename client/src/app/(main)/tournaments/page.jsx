"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/authContext";
import "./tournaments.css";
import socket from "@/lib/socket";

const THEMES = ["theme-purple", "theme-teal", "theme-gold", "theme-coral"];

export default function TournamentsPage() {
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [joining, setJoining] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    maxParticipants: 8,
    difficulty: "easy",
    prizePool: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const res = await api.get("/tournaments");
        setTournaments(res.data);

        const firstActive = res.data.find((t) => t.status === "active");
        if (firstActive) {
          const detailRes = await api.get(`/tournaments/${firstActive._id}`);
          setSelectedTournament(detailRes.data);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchTournaments();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleTournamentUpdate = (updatedTournament) => {
      setTournaments((prev) =>
        prev.map((t) =>
          t._id === updatedTournament._id ? updatedTournament : t,
        ),
      );

      setSelectedTournament((prev) =>
        prev && prev._id === updatedTournament._id ? updatedTournament : prev,
      );
    };

    socket.on("tournament:update", handleTournamentUpdate);

    return () => {
      socket.off("tournament:update", handleTournamentUpdate);
    };
  }, []);

  useEffect(() => {
    setSelectedTournament(null);
  }, [filter]);

  const handleCreateTournament = async () => {
    try {
      await api.post("/tournaments/create", form);

      setShowCreateModal(false);

      const res = await api.get("/tournaments");

      setTournaments(res.data);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create tournament");
    }
  };

  const formatCountdown = (startDate) => {
    const diff = new Date(startDate).getTime() - now;
    if (diff <= 0) return "Starting soon";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    return `${days}d ${String(hours).padStart(2, "0")}h`;
  };

  const handleJoin = async (tournamentId) => {
    try {
      setJoining(tournamentId);
      await api.post(`/tournaments/${tournamentId}/join`);
      const res = await api.get("/tournaments");
      setTournaments(res.data);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to join tournament");
    } finally {
      setJoining(null);
    }
  };

  const isUserRegistered = (tournament) =>
    user && tournament.participants?.some((p) => p._id === user._id);

  const formatLabel = (type) => {
    if (type === "single-elimination") return "Single Elim";
    if (type === "double-elimination") return "Double Elim";
    if (type === "round-robin") return "Round Robin";
    return type;
  };

  const roundLabel = (roundNum, totalRounds) => {
    const remaining = totalRounds - roundNum;
    if (remaining === 0) return "Final";
    if (remaining === 1) return "Semifinal";
    if (remaining === 2) return "Quarterfinal";
    return `Round ${roundNum}`;
  };

  const liveTournaments = tournaments.filter((t) => t.status === "active");
  const upcomingTournaments = tournaments.filter(
    (t) => t.status === "upcoming",
  );
  const finishedTournaments = tournaments.filter(
    (t) => t.status === "finished",
  );

  const handleSelectTournament = async (tournamentId) => {
    try {
      const res = await api.get(`/tournaments/${tournamentId}`);
      setSelectedTournament(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const displayedTournaments =
    filter === "live"
      ? liveTournaments
      : filter === "upcoming"
        ? upcomingTournaments
        : filter === "finished"
          ? finishedTournaments
          : filter === "mine"
            ? tournaments.filter((t) => isUserRegistered(t))
            : null;

  if (loading) {
    return (
      <div className="tournaments-page">
        <h2 style={{ color: "white" }}>Loading Tournaments...</h2>
      </div>
    );
  }

  return (
    <div className="tournaments-page">
      <div className="t-hero">
        <h1>TOURNAMENTS</h1>
        <p>
          Compete in structured brackets. Climb to the top. Claim the crown.
        </p>
        <button
          className="t-create-btn"
          onClick={() => setShowCreateModal(true)}
        >
          + Create Tournament
        </button>
      </div>

      <div className="t-filter-row">
        <button
          className={`t-filter-btn ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All
        </button>
        <button
          className={`t-filter-btn ${filter === "live" ? "active" : ""}`}
          onClick={() => setFilter("live")}
        >
          Live
        </button>
        <button
          className={`t-filter-btn ${filter === "upcoming" ? "active" : ""}`}
          onClick={() => setFilter("upcoming")}
        >
          Upcoming
        </button>
        <button
          className={`t-filter-btn ${filter === "mine" ? "active" : ""}`}
          onClick={() => setFilter("mine")}
        >
          My Tournaments
        </button>
        <button
          className={`t-filter-btn ${filter === "finished" ? "active" : ""}`}
          onClick={() => setFilter("finished")}
        >
          Finished
        </button>
      </div>

      {filter === "all" ? (
        <>
          <div className="t-section">
            <div className="t-section-head">
              <h2>
                Live <span>now</span>
              </h2>
              <span className="t-section-sub">
                {liveTournaments.length} ongoing
              </span>
            </div>

            {liveTournaments.length > 0 ? (
              <div className="t-live-grid">
                {liveTournaments.map((t, index) => {
                  const totalPlayers = t.participants.length;
                  const lastRound = t.bracket?.[t.bracket.length - 1];
                  const remaining = lastRound
                    ? lastRound.matches.filter((m) => !m.winnerId).length * 2 +
                      lastRound.matches.filter((m) => m.winnerId).length
                    : totalPlayers;

                  return (
                    <div
                      key={t._id}
                      className={`t-card ${THEMES[index % THEMES.length]}`}
                      onClick={() => handleSelectTournament(t._id)}
                    >
                      <div className="t-live-badge">
                        <span className="t-live-dot" />
                        LIVE
                      </div>
                      <div className="t-title">{t.name}</div>
                      <div className="t-meta-row">
                        <span className="t-pill">
                          {formatLabel(t.tournamentType)}
                        </span>
                        <span className="t-pill">{t.difficulty}</span>
                      </div>
                      <div className="t-progress-label">
                        {roundLabel(t.currentRound, t.totalRounds)} · Round{" "}
                        {t.currentRound} of {t.totalRounds}
                      </div>
                      <div className="t-progress-track">
                        <div
                          className="t-progress-fill"
                          style={{
                            width: `${(t.currentRound / t.totalRounds) * 100}%`,
                          }}
                        />
                      </div>
                      <div className="t-footer">
                        <span>{totalPlayers} players</span>
                        <span>{remaining} remaining</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="t-empty">No live tournaments right now</div>
            )}
          </div>

          <div className="t-section">
            <div className="t-section-head">
              <h2>
                Upcoming <span>tournaments</span>
              </h2>
              <span className="t-section-sub">
                {upcomingTournaments.length} scheduled
              </span>
            </div>

            {upcomingTournaments.length > 0 ? (
              <div className="t-upcoming-grid">
                {upcomingTournaments.map((t, index) => {
                  const registered = isUserRegistered(t);
                  const full = t.participants.length >= t.maxParticipants;

                  return (
                    <div
                      key={t._id}
                      className={`t-card ${THEMES[index % THEMES.length]}`}
                    >
                      <div className="t-title">{t.name}</div>
                      <div className="t-meta-row">
                        <span className="t-pill">
                          {formatLabel(t.tournamentType)}
                        </span>
                        <span className="t-pill">{t.difficulty}</span>
                      </div>
                      <div className="t-countdown">
                        {formatCountdown(t.startDate)}
                      </div>
                      <div className="t-reg-label">
                        {t.participants.length} / {t.maxParticipants} registered
                      </div>
                      <div className="t-reg-track">
                        <div
                          className="t-reg-fill"
                          style={{
                            width: `${(t.participants.length / t.maxParticipants) * 100}%`,
                          }}
                        />
                      </div>
                      <button
                        className="t-join-btn"
                        disabled={registered || full || joining === t._id}
                        onClick={() => handleJoin(t._id)}
                      >
                        {registered
                          ? "Registered"
                          : full
                            ? "Full"
                            : joining === t._id
                              ? "Joining..."
                              : "Register"}
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="t-empty">No upcoming tournaments scheduled</div>
            )}
          </div>
        </>
      ) : (
        <div className="t-section">
          <div className="t-section-head">
            <h2>
              {filter === "live"
                ? "Live"
                : filter === "upcoming"
                  ? "Upcoming"
                  : filter === "finished"
                    ? "Finished"
                    : "My"}{" "}
              <span>tournaments</span>
            </h2>
          </div>

          {displayedTournaments.length > 0 ? (
            <div className="t-live-grid">
              {displayedTournaments.map((t, index) => {
                const registered = isUserRegistered(t);
                const full = t.participants.length >= t.maxParticipants;

                return (
                  <div
                    key={t._id}
                    className={`t-card ${THEMES[index % THEMES.length]}`}
                    onClick={() =>
                      (t.status === "active" || t.status === "finished") &&
                      handleSelectTournament(t._id)
                    }
                  >
                    {t.status === "active" && (
                      <div className="t-live-badge">
                        <span className="t-live-dot" />
                        LIVE
                      </div>
                    )}
                    <div className="t-title">{t.name}</div>
                    <div className="t-meta-row">
                      <span className="t-pill">
                        {formatLabel(t.tournamentType)}
                      </span>
                      <span className="t-pill">{t.difficulty}</span>
                    </div>

                    {t.status === "upcoming" && (
                      <>
                        <div className="t-countdown">
                          {formatCountdown(t.startDate)}
                        </div>
                        <div className="t-reg-label">
                          {t.participants.length} / {t.maxParticipants}{" "}
                          registered
                        </div>
                        {filter !== "mine" && (
                          <button
                            className="t-join-btn"
                            disabled={registered || full || joining === t._id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleJoin(t._id);
                            }}
                          >
                            {registered
                              ? "Registered"
                              : full
                                ? "Full"
                                : "Register"}
                          </button>
                        )}
                      </>
                    )}

                    {t.status === "finished" && (
                      <div className="t-finished-badge">COMPLETED</div>
                    )}
                    {t.status === "finished" && (
                      <div className="t-winner">
                        🏆 Winner: {t.winnerId?.username}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="t-empty">No tournaments found</div>
          )}
        </div>
      )}
      {selectedTournament?.status === "finished" && (
        <>
          <div className="t-summary-card">
            <div className="t-summary-title">Tournament Result</div>

            <div className="t-summary-grid">
              <div>
                <span>Winner</span>
                <strong>
                  🏆 {selectedTournament.winnerId?.username || "TBD"}
                </strong>
              </div>

              <div>
                <span>Participants</span>
                <strong>{selectedTournament.participants?.length || 0}</strong>
              </div>

              <div>
                <span>Rounds</span>
                <strong>{selectedTournament.totalRounds}</strong>
              </div>

              <div>
                <span>Difficulty</span>
                <strong>{selectedTournament.difficulty}</strong>
              </div>
            </div>
          </div>
          <div className="t-champion-banner">
            <div className="champion-crown">👑</div>

            <div>
              <h2>{selectedTournament.winnerId?.username}</h2>

              <p>Tournament Champion</p>
            </div>
          </div>
        </>
      )}
      {selectedTournament && (
        <div className="t-section">
          <div className="t-section-head">
            <h2>
              {selectedTournament.name}
              <span> bracket</span>
            </h2>
          </div>

          <div className="t-bracket-card">
            <div className="t-bracket">
              {selectedTournament.bracket?.map((round, rIndex) => (
                <div
                  className={`t-round ${
                    rIndex === selectedTournament.totalRounds - 1 ? "final" : ""
                  }`}
                  key={round.round}
                >
                  <div className="t-round-label">
                    {roundLabel(round.round, selectedTournament.totalRounds)}
                  </div>

                  {rIndex === selectedTournament.totalRounds - 1 && (
                    <div className="t-trophy">🏆</div>
                  )}

                  {round.matches.map((match) => (
                    <div className="t-match-box" key={match.matchId}>
                      <div
                        className={`t-match-player ${
                          match.winnerId?._id === match.player1Id?._id
                            ? "winner"
                            : match.winnerId
                              ? "loser"
                              : ""
                        }`}
                      >
                        {match.player1Id?.username || "TBD"}
                      </div>

                      <div
                        className={`t-match-player ${
                          match.winnerId?._id === match.player2Id?._id
                            ? "winner"
                            : match.winnerId
                              ? "loser"
                              : ""
                        }`}
                      >
                        {match.player2Id?.username || "TBD"}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {showCreateModal && (
        <div className="create-modal-overlay">
          <div className="create-modal">
            <h2>Create Tournament</h2>

            <input
              type="text"
              placeholder="Tournament Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />

            <input
              type="number"
              min="4"
              step="4"
              placeholder="Max Participants"
              value={form.maxParticipants}
              onChange={(e) =>
                setForm({
                  ...form,
                  maxParticipants: Number(e.target.value),
                })
              }
            />

            <select
              value={form.difficulty}
              onChange={(e) =>
                setForm({
                  ...form,
                  difficulty: e.target.value,
                })
              }
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
              <option value="mixed">Mixed</option>
            </select>

            <input
              type="text"
              placeholder="Prize Pool"
              value={form.prizePool}
              onChange={(e) =>
                setForm({
                  ...form,
                  prizePool: e.target.value,
                })
              }
            />

            <label>Start Date</label>
            <input
              type="datetime-local"
              value={form.startDate}
              onChange={(e) =>
                setForm({
                  ...form,
                  startDate: e.target.value,
                })
              }
            />

            <label>End Date</label>
            <input
              type="datetime-local"
              value={form.endDate}
              onChange={(e) =>
                setForm({
                  ...form,
                  endDate: e.target.value,
                })
              }
            />

            <div className="create-modal-actions">
              <button
                className="modal-cancel-btn"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </button>

              <button
                className="modal-create-btn"
                onClick={handleCreateTournament}
              >
                Create Tournament
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

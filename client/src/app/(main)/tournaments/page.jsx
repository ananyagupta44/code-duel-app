"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/context/authContext";
import "./tournaments.css";
import socket from "@/lib/socket";
import TournamentTimeline from "./components/tournamentTimeline";

const PARTICIPANT_OPTIONS = [4, 8, 16, 32, 64];

const EMPTY_FORM = {
  name: "",
  description: "",
  tournamentType: "single-elimination",
  maxParticipants: 8,
  difficulty: "mixed",
  prizePool: "",
  startDate: "",
  endDate: "",
  registrationDeadline: "",
  isPublic: true,
  championBadge: false,
};

export default function TournamentsPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [step, setStep] = useState(1); // 2-step form

  const showToast = (type, message) => setToast({ type, message });

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const res = await api.get("/tournaments");
        setTournaments(res.data);
      } catch {
        showToast("error", "Couldn't load tournaments. Try refreshing.");
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
    const handleUpdate = (updated) => {
      setTournaments((prev) => {
        const exists = prev.some((t) => t._id === updated._id);
        return exists
          ? prev.map((t) => (t._id === updated._id ? updated : t))
          : [...prev, updated];
      });
    };
    socket.on("tournament:update", handleUpdate);
    return () => socket.off("tournament:update", handleUpdate);
  }, []);

  const validateStep1 = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = "Tournament needs a name.";
    if (!form.startDate) errors.startDate = "Pick a start date.";
    if (!form.endDate) errors.endDate = "Pick an end date.";
    if (
      form.startDate &&
      form.endDate &&
      new Date(form.endDate) <= new Date(form.startDate)
    )
      errors.endDate = "End date must be after start date.";
    if (
      form.registrationDeadline &&
      form.startDate &&
      new Date(form.registrationDeadline) >= new Date(form.startDate)
    )
      errors.registrationDeadline = "Deadline must be before start date.";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) setStep(2);
  };

  const handleCreateTournament = async () => {
    try {
      setCreating(true);
      await api.post("/tournaments/create", form);
      setShowCreateModal(false);
      setForm(EMPTY_FORM);
      setFormErrors({});
      setStep(1);
      const res = await api.get("/tournaments");
      setTournaments(res.data);
      showToast("success", "Tournament created.");
    } catch (err) {
      showToast(
        "error",
        err.response?.data?.message || "Failed to create tournament.",
      );
    } finally {
      setCreating(false);
    }
  };

  const openModal = () => {
    setForm(EMPTY_FORM);
    setFormErrors({});
    setStep(1);
    setShowCreateModal(true);
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setStep(1);
    setFormErrors({});
  };

  const allLive = tournaments.filter((t) => t.status === "active");
  const allUpcoming = tournaments.filter((t) => t.status === "upcoming");
  const totalPlayersLive = allLive.reduce(
    (sum, t) => sum + (t.participants?.length || 0),
    0,
  );
  const allActiveMatchesCount = allLive.reduce((sum, t) => {
    const round = t.bracket?.find((r) => r.round === t.currentRound);
    if (!round) return sum;
    return (
      sum +
      round.matches.filter((m) => !m.winnerId && m.player1Id && m.player2Id)
        .length
    );
  }, 0);

  if (loading) {
    return (
      <div className="tournaments-page">
        <div className="t-hero">
          <h1>TOURNAMENTS</h1>
          <p>
            Compete in structured brackets. Climb to the top. Claim the crown.
          </p>
        </div>
        <div className="t-skeleton-row">
          {[0, 1, 2, 3].map((i) => (
            <div className="t-skeleton-stat" key={i} />
          ))}
        </div>
        <div className="t-skeleton-grid">
          {[0, 1, 2].map((i) => (
            <div className="t-skeleton-card" key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="tournaments-page">
      {/* ── Hero ── */}
      <div className="t-hero">
        <h1>TOURNAMENTS</h1>
        <p>
          Compete in structured brackets. Climb to the top. Claim the crown.
        </p>

        {/* New create button */}
        <button className="t-create-btn" onClick={openModal}>
          <span className="t-create-btn__icon">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 2v12M2 8h12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span>New Tournament</span>
        </button>

        <div className="t-stats-row">
          <div className="t-stat-card has-pulse">
            <div className="t-stat-value">{allLive.length}</div>
            <div className="t-stat-label">Live now</div>
          </div>
          <div className="t-stat-card accent-coral">
            <div className="t-stat-value">{allActiveMatchesCount}</div>
            <div className="t-stat-label">Active matches</div>
          </div>
          <div className="t-stat-card accent-teal">
            <div className="t-stat-value">{allUpcoming.length}</div>
            <div className="t-stat-label">Upcoming</div>
          </div>
          <div className="t-stat-card accent-gold">
            <div className="t-stat-value">{totalPlayersLive}</div>
            <div className="t-stat-label">Players competing</div>
          </div>
        </div>
      </div>

      {/* ── Timeline ── */}
      <TournamentTimeline tournaments={tournaments} />

      {/* ── Create Modal ── */}
      {showCreateModal && (
        <div className="cm-overlay" onClick={closeModal}>
          <div className="cm-modal" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="cm-header">
              <div className="cm-header-left">
                <div className="cm-header-icon">🏆</div>
                <div>
                  <div className="cm-title">Create Tournament</div>
                  <div className="cm-subtitle">
                    Step {step} of 2 — {step === 1 ? "Basic info" : "Settings"}
                  </div>
                </div>
              </div>
              <button
                className="cm-close"
                onClick={closeModal}
                aria-label="Close"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M1 1l12 12M13 1L1 13"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            {/* Step indicators */}
            <div className="cm-steps">
              <div className={`cm-step ${step >= 1 ? "active" : ""}`}>
                <div className="cm-step-dot">{step > 1 ? "✓" : "1"}</div>
                <span>Basics</span>
              </div>
              <div className="cm-step-line" />
              <div className={`cm-step ${step >= 2 ? "active" : ""}`}>
                <div className="cm-step-dot">2</div>
                <span>Settings</span>
              </div>
            </div>

            {/* ── Step 1 ── */}
            {step === 1 && (
              <div className="cm-body">
                <div className="cm-field">
                  <label className="cm-label">
                    Tournament name <span className="cm-required">*</span>
                  </label>
                  <input
                    className={`cm-input${formErrors.name ? " cm-input--error" : ""}`}
                    placeholder="e.g. Spring Championship 2025"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                  {formErrors.name && (
                    <span className="cm-error">{formErrors.name}</span>
                  )}
                </div>

                <div className="cm-field">
                  <label className="cm-label">Description</label>
                  <textarea
                    className="cm-textarea"
                    placeholder="What's this tournament about?"
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                  />
                </div>

                <div className="cm-row">
                  <div className="cm-field">
                    <label className="cm-label">
                      Start date <span className="cm-required">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      className={`cm-input${formErrors.startDate ? " cm-input--error" : ""}`}
                      value={form.startDate}
                      onChange={(e) =>
                        setForm({ ...form, startDate: e.target.value })
                      }
                    />
                    {formErrors.startDate && (
                      <span className="cm-error">{formErrors.startDate}</span>
                    )}
                  </div>
                  <div className="cm-field">
                    <label className="cm-label">
                      End date <span className="cm-required">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      className={`cm-input${formErrors.endDate ? " cm-input--error" : ""}`}
                      value={form.endDate}
                      onChange={(e) =>
                        setForm({ ...form, endDate: e.target.value })
                      }
                    />
                    {formErrors.endDate && (
                      <span className="cm-error">{formErrors.endDate}</span>
                    )}
                  </div>
                </div>

                <div className="cm-field">
                  <label className="cm-label">Registration deadline</label>
                  <input
                    type="datetime-local"
                    className={`cm-input${formErrors.registrationDeadline ? " cm-input--error" : ""}`}
                    value={form.registrationDeadline}
                    onChange={(e) =>
                      setForm({ ...form, registrationDeadline: e.target.value })
                    }
                  />
                  {formErrors.registrationDeadline && (
                    <span className="cm-error">
                      {formErrors.registrationDeadline}
                    </span>
                  )}
                </div>

                <div className="cm-actions">
                  <button className="cm-btn-ghost" onClick={closeModal}>
                    Cancel
                  </button>
                  <button className="cm-btn-primary" onClick={handleNext}>
                    Next <span>→</span>
                  </button>
                </div>
              </div>
            )}

            {/* ── Step 2 ── */}
            {step === 2 && (
              <div className="cm-body">
                <div className="cm-row">
                  <div className="cm-field">
                    <label className="cm-label">Format</label>
                    <select
                      className="cm-select"
                      value={form.tournamentType}
                      onChange={(e) =>
                        setForm({ ...form, tournamentType: e.target.value })
                      }
                    >
                      <option value="single-elimination">
                        Single elimination
                      </option>
                      <option value="double-elimination">
                        Double elimination
                      </option>
                      <option value="round-robin">Round robin</option>
                    </select>
                  </div>
                  <div className="cm-field">
                    <label className="cm-label">Difficulty</label>
                    <select
                      className="cm-select"
                      value={form.difficulty}
                      onChange={(e) =>
                        setForm({ ...form, difficulty: e.target.value })
                      }
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                      <option value="mixed">Mixed</option>
                    </select>
                  </div>
                </div>

                <div className="cm-field">
                  <label className="cm-label">Max players</label>
                  <div className="cm-pill-group">
                    {PARTICIPANT_OPTIONS.map((n) => (
                      <button
                        key={n}
                        className={`cm-pill${form.maxParticipants === n ? " active" : ""}`}
                        onClick={() => setForm({ ...form, maxParticipants: n })}
                        type="button"
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="cm-field">
                  <label className="cm-label">Prize pool</label>
                  <input
                    className="cm-input"
                    placeholder="e.g. $500, Trophy + Badge, etc."
                    value={form.prizePool}
                    onChange={(e) =>
                      setForm({ ...form, prizePool: e.target.value })
                    }
                  />
                </div>

                <div className="cm-toggles">
                  <label className="cm-toggle-row">
                    <div className="cm-toggle-info">
                      <span className="cm-toggle-label">Public tournament</span>
                      <span className="cm-toggle-desc">
                        Anyone can find and join this tournament
                      </span>
                    </div>
                    <div
                      className={`cm-toggle${form.isPublic ? " on" : ""}`}
                      onClick={() =>
                        setForm({ ...form, isPublic: !form.isPublic })
                      }
                      role="switch"
                      aria-checked={form.isPublic}
                    >
                      <div className="cm-toggle-thumb" />
                    </div>
                  </label>

                  <label className="cm-toggle-row">
                    <div className="cm-toggle-info">
                      <span className="cm-toggle-label">Champion badge</span>
                      <span className="cm-toggle-desc">
                        Winner receives a special profile badge
                      </span>
                    </div>
                    <div
                      className={`cm-toggle${form.championBadge ? " on" : ""}`}
                      onClick={() =>
                        setForm({ ...form, championBadge: !form.championBadge })
                      }
                      role="switch"
                      aria-checked={form.championBadge}
                    >
                      <div className="cm-toggle-thumb" />
                    </div>
                  </label>
                </div>

                <div className="cm-actions">
                  <button className="cm-btn-ghost" onClick={() => setStep(1)}>
                    ← Back
                  </button>
                  <button
                    className="cm-btn-primary"
                    onClick={handleCreateTournament}
                    disabled={creating}
                  >
                    {creating ? (
                      <>
                        <span className="cm-spinner" /> Creating…
                      </>
                    ) : (
                      "Create tournament"
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className={`t-toast t-toast--${toast.type}`}>{toast.message}</div>
      )}
    </div>
  );
}

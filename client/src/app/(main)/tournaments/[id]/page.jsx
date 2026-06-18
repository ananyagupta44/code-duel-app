"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import {
  Trophy,
  Users,
  Gauge,
  Gift,
  ListOrdered,
  Crown,
  Medal,
  CheckCircle2,
  Swords,
  Code2,
  Star,
  Sparkles,
} from "lucide-react";
import api from "@/lib/api";
import getAvatar from "@/utils/getAvatar";
import "./tournamentDetails.css";

/* =========================
   HELPERS
========================= */

function formatDateTime(date) {
  if (!date) return "Date to be announced";
  return new Date(date).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function useCountdown(targetDate) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!targetDate) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (!targetDate) return null;

  const diff = new Date(targetDate).getTime() - now;
  return {
    isPast: diff <= 0,
    days: Math.floor(Math.abs(diff) / 86400000),
    hours: Math.floor((Math.abs(diff) / 3600000) % 24),
    minutes: Math.floor((Math.abs(diff) / 60000) % 60),
    seconds: Math.floor((Math.abs(diff) / 1000) % 60),
  };
}

function formatCountdown(t) {
  if (!t) return "--";
  if (t.days > 0) return `${t.days}d ${t.hours}h`;
  if (t.hours > 0)
    return `${String(t.hours).padStart(2, "0")}h ${String(t.minutes).padStart(2, "0")}m`;
  return `${String(t.minutes).padStart(2, "0")}m ${String(t.seconds).padStart(2, "0")}s`;
}

function getRoundLabel(roundNumber, totalRounds) {
  const remaining = totalRounds - roundNumber;
  if (remaining <= 0) return "Final";
  if (remaining === 1) return "Semi-final";
  if (remaining === 2) return "Quarter-final";
  return `Round ${roundNumber}`;
}

/* =========================
   SMALL PIECES
========================= */

function RankPlace({ place }) {
  if (place === 1) return <span className="td-place gold"><Crown size={16} />1</span>;
  if (place === 2) return <span className="td-place silver"><Medal size={16} />2</span>;
  if (place === 3) return <span className="td-place bronze"><Medal size={16} />3</span>;
  return <span className="td-place">{place}</span>;
}

function MatchPlayer({ player, isWinner, isDecided }) {
  if (!player) {
    return (
      <div className="td-match-player td-match-player--tbd">
        <div className="td-player-avatar td-player-avatar--ghost" />
        <div>
          <div className="td-player-name">TBD</div>
          <div className="td-player-elo">Awaiting previous round</div>
        </div>
      </div>
    );
  }
  return (
    <div className={`td-match-player ${isWinner ? "is-winner" : isDecided ? "is-loser" : ""}`}>
      <img src={getAvatar(player)} alt={player.username} className="td-player-avatar" />
      <div>
        <div className="td-player-name">{player.username}</div>
        <div className="td-player-elo">ELO {player.elo ?? "—"}</div>
      </div>
      {isWinner && <CheckCircle2 size={18} className="td-winner-check" />}
    </div>
  );
}

function MatchCard({ match, isCurrentRound }) {
  const decided = Boolean(match.winnerId);
  return (
    <div className={`td-match-card${isCurrentRound && !decided ? " td-match-card--live" : ""}${decided ? " td-match-card--decided" : ""}`}>
      {isCurrentRound && !decided && (
        <div className="td-live-badge">
          <span className="td-live-dot" /> Live
        </div>
      )}
      <MatchPlayer
        player={match.player1Id}
        isWinner={decided && match.winnerId?._id === match.player1Id?._id}
        isDecided={decided}
      />
      <div className="td-vs">
        <Swords size={13} color="rgba(168,85,247,0.7)" />
      </div>
      <MatchPlayer
        player={match.player2Id}
        isWinner={decided && match.winnerId?._id === match.player2Id?._id}
        isDecided={decided}
      />
    </div>
  );
}

/* =========================
   BRACKET WITH SVG CONNECTORS
========================= */

// Card height + gap must match CSS exactly
const CARD_H = 98;   // px — td-match-card min height
const CARD_GAP = 16; // px — gap between cards in a round
const ROUND_W = 240; // px — td-round width
const COL_GAP = 100; // px — gap between round columns (horizontal space for connectors)

function BracketConnectors({ rounds }) {
  const containerRef = useRef(null);
  const [paths, setPaths] = useState([]);

  useEffect(() => {
    if (!containerRef.current || rounds.length < 2) return;

    const container = containerRef.current;
    const roundEls = container.querySelectorAll(".td-round");
    const newPaths = [];

    for (let r = 0; r < roundEls.length - 1; r++) {
      const currentRoundEl = roundEls[r];
      const nextRoundEl = roundEls[r + 1];

      const currentCards = currentRoundEl.querySelectorAll(".td-match-card");
      const nextCards = nextRoundEl.querySelectorAll(".td-match-card");

      const containerRect = container.getBoundingClientRect();

      // Each pair of current-round matches feeds one next-round match
      for (let i = 0; i < nextCards.length; i++) {
        const topSrcEl = currentCards[i * 2];
        const botSrcEl = currentCards[i * 2 + 1];
        const destEl = nextCards[i];

        if (!topSrcEl || !botSrcEl || !destEl) continue;

        const topRect = topSrcEl.getBoundingClientRect();
        const botRect = botSrcEl.getBoundingClientRect();
        const destRect = destEl.getBoundingClientRect();

        const x1 = topRect.right - containerRect.left;
        const y1top = topRect.top + topRect.height / 2 - containerRect.top;
        const y1bot = botRect.top + botRect.height / 2 - containerRect.top;
        const x2 = destRect.left - containerRect.left;
        const y2 = destRect.top + destRect.height / 2 - containerRect.top;

        const midX = (x1 + x2) / 2;

        // Top source → mid-right → dest
        const pathTop = `M ${x1} ${y1top} H ${midX} V ${y2} H ${x2}`;
        // Bot source → mid-right (already handled by top path's vertical)
        const pathBot = `M ${x1} ${y1bot} H ${midX}`;

        newPaths.push(
          { d: pathTop, key: `${r}-${i}-top` },
          { d: pathBot, key: `${r}-${i}-bot` },
        );
      }
    }

    setPaths(newPaths);
  }, [rounds]);

  return (
    <div className="td-bracket-outer" ref={containerRef}>
      <div className="td-bracket-scroll">
        {rounds.map((round, idx) => (
          <div key={round.round} className="td-round">
            <h3 className="td-round-label">
              {getRoundLabel(round.round, rounds.length)}
            </h3>
            <div
              className="td-matches"
              style={{
                // Each successive round has half the matches; space them so
                // their midpoints align with the gap between the two feeder matches.
                gap: `${CARD_GAP * Math.pow(2, idx)}px`,
                paddingTop: idx === 0 ? 0 : `${(CARD_H + CARD_GAP * Math.pow(2, idx - 1)) / 2 - CARD_H / 2}px`,
              }}
            >
              {round.matches.map((match) => (
                <MatchCard
                  key={match.matchId || `${round.round}-${match.player1Id?._id}`}
                  match={match}
                  isCurrentRound={round.round === rounds._currentRound}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* SVG overlay for connector lines */}
      {paths.length > 0 && (
        <svg
          className="td-bracket-svg"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            overflow: "visible",
          }}
        >
          <defs>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(168,85,247,0.55)" />
              <stop offset="100%" stopColor="rgba(168,85,247,0.15)" />
            </linearGradient>
          </defs>
          {paths.map((p) => (
            <path
              key={p.key}
              d={p.d}
              fill="none"
              stroke="url(#lineGrad)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </svg>
      )}
    </div>
  );
}

/* =========================
   PAGE
========================= */

export default function TournamentDetailsPage() {
  const { id } = useParams();
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTournament = async () => {
      try {
        const res = await api.get(`/tournaments/${id}`);
        setTournament(res.data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchTournament();
  }, [id]);

  const startAt = tournament?.startTime || tournament?.startDate || null;
  const countdown = useCountdown(tournament?.status === "upcoming" ? startAt : null);

  const handleJoinTournament = async () => {
    try {
      await api.post(`/tournaments/${tournament._id}/join`);
      const res = await api.get(`/tournaments/${id}`);
      setTournament(res.data);
      alert("Joined tournament successfully!");
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to join tournament");
    }
  };

  const currentUserId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
  const alreadyJoined = tournament?.participants?.some((p) => String(p._id) === String(currentUserId));

  const ranked = useMemo(() => {
    if (!tournament?.participants) return [];
    return [...tournament.participants].sort((a, b) => (b.elo ?? 0) - (a.elo ?? 0));
  }, [tournament]);

  const totalRounds = tournament?.totalRounds || tournament?.bracket?.length || 0;
  const previewAvatars = ranked.slice(0, 4);
  const spotsLeft = tournament ? tournament.maxParticipants - tournament.participants.length : null;
  const isFull = spotsLeft !== null && spotsLeft <= 0;

  // Attach currentRound to bracket array so MatchCard can access it
  const bracketWithMeta = useMemo(() => {
    if (!tournament?.bracket) return [];
    const arr = [...tournament.bracket];
    arr._currentRound = tournament.currentRound;
    return arr;
  }, [tournament]);

  if (loading) return <div className="tournament-details-page"><h2>Loading Tournament…</h2></div>;
  if (!tournament) return <div className="tournament-details-page"><h2>Tournament not found</h2></div>;

  const joinLabel = isFull
    ? "Full"
    : tournament.status === "upcoming"
    ? "Join Duel"
    : tournament.status === "active"
    ? "Spectate"
    : "View Results";

  return (
    <div className="tournament-details-page">

      {/* ── HERO ── */}
      <div className="td-hero">
        <div className="td-cover">
          <div className="td-cover-content">
            <Code2 size={48} />
            <span>{tournament.name?.slice(0, 2)?.toUpperCase()}</span>
          </div>
        </div>

        <div className="td-info">
          <div className="td-status-line">
            <span className={`td-status sm ${tournament.status}`}>{tournament.status}</span>
            <span className="td-meta-sep">•</span>
            <span>{formatDateTime(startAt)}</span>
            <span className="td-meta-sep">•</span>
            <span>{tournament.difficulty || "Mixed"} difficulty</span>
          </div>

          <h1 className="td-title">{tournament.name}</h1>

          <div className="td-org">
            <Trophy size={14} /> {tournament.organizer || "CodeDuel Arena"}
          </div>

          <p className="td-description">{tournament.description}</p>

          <div className="td-mini-participants">
            {previewAvatars.map((p) => (
              <img key={p._id} src={getAvatar(p)} alt={p.username} className="td-mini-avatar" />
            ))}
            <span className="td-mini-participants-text">
              {tournament.participants.length} coders
              {tournament.maxParticipants ? ` · ${tournament.maxParticipants} max` : ""}
            </span>
          </div>
        </div>

        <div className="td-countdown">
          {tournament.status === "upcoming" && (
            <>
              <div className="td-countdown-label">Tournament starts in</div>
              <div className="td-countdown-time">{formatCountdown(countdown)}</div>
              <div className="td-countdown-sub">{formatDateTime(startAt)}</div>
            </>
          )}
          {tournament.status === "active" && (
            <>
              <div className="td-countdown-label"><span className="td-live-dot" /> Live now</div>
              <div className="td-countdown-time">Round {tournament.currentRound || 1}</div>
              <div className="td-countdown-sub">of {totalRounds || "?"}</div>
            </>
          )}
          {tournament.status === "finished" && (
            <>
              <div className="td-countdown-label">Tournament ended</div>
              <div className="td-countdown-time"><Trophy size={32} /></div>
            </>
          )}

          <button
            className="td-join-btn"
            disabled={alreadyJoined || isFull || tournament.status !== "upcoming"}
            onClick={handleJoinTournament}
          >
            {alreadyJoined ? "Joined" : joinLabel}
          </button>
        </div>
      </div>

      {/* ── STATS ── */}
      <div className="td-stats-grid">
        <div className="td-stat-card">
          <div className="td-stat-card-header"><span>Participants</span><Users size={16} /></div>
          <h2>{tournament.participants.length}/{tournament.maxParticipants || "∞"}</h2>
        </div>
        <div className="td-stat-card">
          <div className="td-stat-card-header"><span>Difficulty</span><Gauge size={16} /></div>
          <h2>{tournament.difficulty || "—"}</h2>
        </div>
        <div className="td-stat-card">
          <div className="td-stat-card-header"><span>Prize Pool</span><Gift size={16} /></div>
          <h2>{tournament.prizePool || "—"}</h2>
        </div>
        <div className="td-stat-card">
          <div className="td-stat-card-header"><span>Current Round</span><ListOrdered size={16} /></div>
          <h2>{tournament.currentRound || "—"}</h2>
        </div>
      </div>

      {/* ── PLAYERS RANKING ── */}
      <div className="td-section">
        <h2>Players ranking</h2>
        <div className="td-table">
          <div className="td-table-header">
            <span>Place</span>
            <span>Player</span>
            <span>ELO</span>
          </div>
          {ranked.map((player, index) => (
            <div key={player._id} className="td-table-row">
              <RankPlace place={index + 1} />
              <div className="td-player-info">
                <img src={getAvatar(player)} alt={player.username} className="td-player-avatar" />
                <div>
                  <div className="td-player-name">{player.username}</div>
                  {player.currentStreak > 1 && (
                    <div className="td-player-elo">🔥 {player.currentStreak} win streak</div>
                  )}
                </div>
              </div>
              <div className="td-player-rating">{player.elo}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── BRACKET ── */}
      <div className="td-section">
        <h2>Tournament Bracket</h2>
        {bracketWithMeta.length > 0
          ? <BracketConnectors rounds={bracketWithMeta} />
          : <p className="td-bracket-empty">Bracket will be generated when the tournament starts.</p>
        }
      </div>

      {/* ── WINNER BANNER ── */}
      {tournament.status === "finished" && tournament.winnerId && (
        <div className="td-winner-banner">
          <div className="td-winner-banner__glow" />
          <div className="td-winner-banner__inner">
            <div className="td-winner-banner__trophy">
              <Trophy size={40} />
            </div>
            <div className="td-winner-banner__text">
              <span className="td-winner-banner__label">Tournament Champion</span>
              <span className="td-winner-banner__name">{tournament.winnerId.username}</span>
            </div>
            <div className="td-winner-banner__stars" aria-hidden="true">
              <Star size={14} />
              <Star size={20} />
              <Star size={14} />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
"use client";

import "./tournaments.css";
import { Fjalla_One } from "next/font/google";

const fjalla = Fjalla_One({
  subsets: ["latin"],
  weight: "400",
});

export default function TournamentsPage() {
  const liveMatches = [
    {
      id: 1,
      p1: "CodeNinja",
      p2: "GraphGuru",
      p1Progress: 72,
      p2Progress: 91,
    },
    {
      id: 2,
      p1: "ArrayKing",
      p2: "DPMaster",
      p1Progress: 43,
      p2Progress: 58,
    },
  ];

  const upcoming = [
    {
      title: "Weekend Duel Cup",
      players: "43 / 64",
      start: "Starts in 2 Days",
      prize: "+100 ELO",
    },
    {
      title: "Spring Invitational",
      players: "97 / 128",
      start: "Starts in 5 Days",
      prize: "Champion Badge",
    },
    {
      title: "Monthly Championship",
      players: "201 / 256",
      start: "Starts in 12 Days",
      prize: "+300 ELO",
    },
  ];

  const champions = [
    {
      season: "Spring 2026",
      winner: "ByteMaster",
    },
    {
      season: "Winter 2026",
      winner: "GraphGuru",
    },
    {
      season: "Fall 2025",
      winner: "CodeTitan",
    },
  ];

  const activity = [
    "CodeNinja eliminated ArrayKing",
    "GraphGuru advanced to Semi Finals",
    "Weekend Duel Cup registrations opened",
    "DPMaster reached 1800 ELO",
    "Champion AI defeated 7 challengers",
  ];

  return (
    <div className="tournaments-page">
      <section className="tournament-hero">
        <div className="hero-overlay" />

        <div className="hero-content">
          <span className="hero-tag">LIVE CHAMPIONSHIP</span>

          <h1 className={fjalla.className}>CODEDUEL WORLD CHAMPIONSHIP</h1>

          <p>
            Battle through the bracket. Defeat the best coders. Become Champion.
          </p>

          <div className="hero-meta">
            <div>
              <span>Players</span>
              <strong>128</strong>
            </div>

            <div>
              <span>Prize Pool</span>
              <strong>5000 Coins</strong>
            </div>

            <div>
              <span>Starts In</span>
              <strong>02d 11h</strong>
            </div>
          </div>

          <button className="register-btn">REGISTER NOW</button>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <h2>Live Matches</h2>
        </div>

        <div className="live-grid">
          {liveMatches.map((match) => (
            <div className="live-card" key={match.id}>
              <div className="live-badge">● LIVE</div>

              <div className="player-row">
                <span>{match.p1}</span>
                <span>{match.p1Progress}%</span>
              </div>

              <div className="progress">
                <div
                  className="fill"
                  style={{
                    width: `${match.p1Progress}%`,
                  }}
                />
              </div>

              <div className="vs">VS</div>

              <div className="player-row">
                <span>{match.p2}</span>
                <span>{match.p2Progress}%</span>
              </div>

              <div className="progress">
                <div
                  className="fill"
                  style={{
                    width: `${match.p2Progress}%`,
                  }}
                />
              </div>

              <button className="watch-btn">Spectate</button>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <h2>Upcoming Tournaments</h2>
        </div>

        <div className="upcoming-grid">
          {upcoming.map((tournament) => (
            <div key={tournament.title} className="upcoming-card">
              <h3>{tournament.title}</h3>

              <p>{tournament.players}</p>

              <p>{tournament.start}</p>

              <span>{tournament.prize}</span>

              <button>Join</button>
            </div>
          ))}
        </div>
      </section>

      <section className="section bracket-section">
        <div className="section-header">
          <h2>Featured Bracket</h2>
        </div>

        <div className="bracket">
          <div className="round">
            <div className="node">CodeNinja</div>
            <div className="node">ArrayKing</div>
            <div className="node">GraphGuru</div>
            <div className="node">DPMaster</div>
          </div>

          <div className="round">
            <div className="node">CodeNinja</div>
            <div className="node">GraphGuru</div>
          </div>

          <div className="round">
            <div className="node champion">?</div>
          </div>
        </div>
      </section>

      <section className="bottom-grid">
        <div className="champions-card">
          <h2>Hall Of Champions</h2>

          {champions.map((c) => (
            <div className="champion-row" key={c.season}>
              <span>{c.season}</span>
              <strong>{c.winner}</strong>
            </div>
          ))}
        </div>

        <div className="activity-card">
          <h2>Live Feed</h2>

          {activity.map((item, i) => (
            <div key={i} className="activity-item">
              {item}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

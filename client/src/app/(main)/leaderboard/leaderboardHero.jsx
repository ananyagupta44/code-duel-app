import "./leaderboard.css";

export default function LeaderboardHero({
  leaderboardType,
  setLeaderboardType,
}) {
  return (
    <section className="leaderboard-hero">
      <h1>CodeDuel Leaderboard</h1>

      <p>
        Climb the ranks. Earn your place among the best coders in the arena.
      </p>

      <div className="leaderboard-switch">
        <span
          className={
            leaderboardType === "elo" ? "switch-label active" : "switch-label"
          }
        >
          ELO
        </span>

        <label className="switch-button">
          <div className="switch-outer">
            <input
              type="checkbox"
              checked={leaderboardType === "solved"}
              onChange={(e) =>
                setLeaderboardType(e.target.checked ? "solved" : "elo")
              }
            />

            <div className="button">
              <span className="button-toggle"></span>
            </div>
          </div>
        </label>

        <span
          className={
            leaderboardType === "solved"
              ? "switch-label active"
              : "switch-label"
          }
        >
          SOLVED
        </span>
      </div>
    </section>
  );
}

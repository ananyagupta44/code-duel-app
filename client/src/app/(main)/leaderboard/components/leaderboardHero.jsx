import "../leaderboard.css";

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

      <div className="leaderboard-toggle">
        <button
          data-type="elo"
          className={leaderboardType === "elo" ? "active" : ""}
          onClick={() => setLeaderboardType("elo")}
        >
          ⚡ ELO Rating
        </button>
        <button
          data-type="solved"
          className={leaderboardType === "solved" ? "active" : ""}
          onClick={() => setLeaderboardType("solved")}
        >
          ✦ Problems Solved
        </button>
      </div>
    </section>
  );
}

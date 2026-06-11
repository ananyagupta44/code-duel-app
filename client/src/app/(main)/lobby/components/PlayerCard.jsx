import "../lobby.css";

export default function PlayerCard({ user, challengeUser, creatingMatch }) {
  return (
    <div className={`opponent-card ${user.isInMatch ? "in-match" : "online"}`}>
      <div className="opponent-left">
        <div className="opponent-avatar">{user.username[0].toUpperCase()}</div>

        <div className="opponent-info">
          <div className="opponent-meta">
            <span className="leaderboard-rank">#{user.leaderboardRank}</span>

            <span className="solved-count">{user.solvedCount} Solved</span>
          </div>

          <h3>{user.username}</h3>

          <div className="user-stats">
            <span>⚔ {user.wins}W</span>

            <span>❌ {user.losses}L</span>

            <span>🏆 {user.elo}</span>
          </div>
        </div>
      </div>

      <button
        className="challenge-btn"
        disabled={user.isInMatch || creatingMatch === user._id}
        onClick={() => challengeUser(user._id)}
      >
        {user.isInMatch
          ? "In Match"
          : creatingMatch === user._id
            ? "Creating..."
            : "Challenge"}
      </button>
    </div>
  );
}

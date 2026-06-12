import "../lobby.css";
import getAvatar from "@/utils/getAvatar";

export default function PlayerCard({ user, challengeUser, creatingMatch }) {
  return (
    <div className={`opponent-card ${user.isInMatch ? "in-match" : "online"}`}>
      <div className="opponent-left">
        <div className="opponent-avatar">
          <img src={getAvatar(user)} alt={user.username} />

          <span
            className={`status-dot ${user.isInMatch ? "busy" : "online"}`}
          />
        </div>

        <div className="opponent-info">
          <div className="opponent-meta">
            <span className="leaderboard-rank">#{user.leaderboardRank}</span>

            <span className="solved-count">
              {user.solvedCount ?? user.solvedProblems?.length ?? 0} Solved
            </span>
          </div>

          <div className="username-row">
            <h3>{user.username}</h3>
          </div>

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

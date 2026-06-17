import "../lobby.css";
import getAvatar from "@/utils/getAvatar";

const THEMES = ["theme-purple", "theme-teal", "theme-coral", "theme-gold"];

export default function PlayerCard({
  user,
  challengeUser,
  creatingMatch,
  index = 0,
}) {
  const totalGames = user.wins + user.losses;
  const winRate =
    totalGames > 0 ? Math.round((user.wins / totalGames) * 100) : 0;
  const themeClass = THEMES[index % THEMES.length];

  return (
    <div
      className={`opponent-card ${themeClass} ${user.isInMatch ? "in-match" : "online"}`}
    >
      <div className="opponent-left">
        <div className="opponent-avatar">
          <img src={getAvatar(user)} alt={user.username} />
          <span
            className={`status-dot ${user.isInMatch ? "busy" : "online"}`}
          />
        </div>
        <span className="elo-badge">{user.elo} ELO</span>
        <div className="opponent-info">
          <div className="opponent-meta">
            <span className="leaderboard-rank">#{user.leaderboardRank}</span>
          </div>

          <div className="username-row">
            <h3>{user.username}</h3>
          </div>

          <div className="user-stats">
            <div className="stat-item">
              <span className="stat-label">Wins</span>
              <span className="stat-value">{user.wins}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Losses</span>
              <span className="stat-value">{user.losses}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Solved</span>
              <span className="stat-value">{user.solvedCount ?? 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Win Rate</span>
              <span className="stat-value">{winRate}%</span>
            </div>
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

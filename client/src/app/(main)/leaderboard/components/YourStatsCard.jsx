import "./yourStatsCard.css";
import { GiFlame } from "react-icons/gi";

export default function YourStatsCard({ type, stats }) {
  if (!stats) return null;

  if (type === "elo") {
    const winRate =
      stats.elo.wins + stats.elo.losses > 0
        ? Math.round(
            (stats.elo.wins / (stats.elo.wins + stats.elo.losses)) * 100,
          )
        : 0;

    return (
      <div className="your-stats-card">
        <div className="card-header">Your ELO Rank</div>
        <div className="rank-number">#{stats.elo.rank}</div>
        <div className="rank-sub">
          Top {100 - stats.elo.percentile}% of all players
        </div>

        <div className="stat-grid">
          <div className="stat-box">
            <span>{stats.elo.elo}</span>
            <p>ELO Rating</p>
          </div>
          <div className="stat-box">
            <span>{stats.elo.percentile}%</span>
            <p>Percentile</p>
          </div>
        </div>

        <div className="percentile-labels">
          <span>0</span>
          <span>You</span>
          <span>Top</span>
        </div>
        <div className="percentile-track">
          <div
            className="percentile-fill"
            style={{ width: `${stats.elo.percentile}%` }}
          />
        </div>

        <div className="win-loss">
          <div>
            <span>{stats.elo.wins}</span>
            <p>Wins</p>
          </div>
          <div>
            <span>{stats.elo.losses}</span>
            <p>Losses</p>
          </div>
          <div>
            <span>{winRate}%</span>
            <p>Win Rate</p>
          </div>
        </div>

        <div className="rank-message">
          {stats.elo.pointsToNext > 0 ? (
            <>
              <span>+{stats.elo.pointsToNext} ELO</span> to pass{" "}
              <span>{stats.elo.nextPlayer?.username}</span> (#
              {stats.elo.rank - 1})
            </>
          ) : (
            "You are Rank #1 🏆"
          )}
        </div>

        {stats.elo.currentStreak > 0 && (
          <div className="streak-row">
            <span>
              <GiFlame className="text-gray-400" />
            </span>
            <span className="streak-label">
              Current streak · Best: {stats.elo.bestStreak}W
            </span>
            <span className="streak-value">{stats.elo.currentStreak}W</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="your-stats-card">
      <div className="card-header">Your Progress</div>
      <div className="solved-total">{stats.solved.totalSolved}</div>
      <div className="solved-label">Problems Solved</div>

      <div className="difficulty-stats">
        <div>
          <span>{stats.solved.difficultyBreakdown.easy}</span>
          <p>Easy</p>
        </div>
        <div>
          <span>{stats.solved.difficultyBreakdown.medium}</span>
          <p>Medium</p>
        </div>
        <div>
          <span>{stats.solved.difficultyBreakdown.hard}</span>
          <p>Hard</p>
        </div>
      </div>

      <div className="topic-section">
        <h4>Top Topics</h4>
        {stats.solved.topicBreakdown.slice(0, 5).map((topic) => (
          <div className="topic-row" key={topic.topic}>
            <span>
              {topic.topic
                .split("-")
                .map((w) => w[0].toUpperCase() + w.slice(1))
                .join(" ")}
            </span>
            <span>{topic.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

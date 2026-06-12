import "./leaderboard.css";
import getAvatar from "@/utils/getAvatar";

export default function LeaderboardTable({ users, type = "elo" }) {
  const getValue = (user) => (type === "elo" ? user.elo : user.solvedCount);

  return (
    <div className="leaderboard-table">
      {users.slice(3).map((user, index) => (
        <div className="leaderboard-row" key={user._id}>
          <span className="rank">#{index + 4}</span>

          <div className="user-info">
            <img src={getAvatar(user)} alt={user.username} />

            <span>{user.username}</span>
          </div>

          <span className="score">{getValue(user)}</span>
        </div>
      ))}
    </div>
  );
}

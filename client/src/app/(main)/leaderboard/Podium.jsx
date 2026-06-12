import "./podium.css";
import getAvatar from "@/utils/getAvatar";
import { GiQueenCrown } from "react-icons/gi";

export default function Podium({ users, type = "elo" }) {
  if (!users || users.length < 3) return null;

  const first = users[0];
  const second = users[1];
  const third = users[2];

  const getValue = (user) =>
    type === "elo" ? `${user.elo} ELO` : `${user.solvedCount} Solved`;

  return (
    <>
      <div className="podium">
        <div className="podium-card second">
          <img src={getAvatar(second)} alt={second.username} />
          <h3>{second.username}</h3>
          <p>{getValue(second)}</p>
          <div className="podium-stand">
            <span className="podium-stand-num">2</span>
          </div>
        </div>

        <div className="podium-card first">
          <div className="crown">
            <GiQueenCrown color="gold" size={32} />
          </div>
          <img src={getAvatar(first)} alt={first.username} />
          <h3>{first.username}</h3>
          <p>{getValue(first)}</p>
          <div className="podium-stand">
            <span className="podium-stand-num">1</span>
          </div>
        </div>

        <div className="podium-card third">
          <img src={getAvatar(third)} alt={third.username} />
          <h3>{third.username}</h3>
          <p>{getValue(third)}</p>
          <div className="podium-stand">
            <span className="podium-stand-num">3</span>
          </div>
        </div>
      </div>
      <div className="podium-base" />
    </>
  );
}

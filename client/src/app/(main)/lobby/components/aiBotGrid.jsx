"use client";

import "./aiBotGrid.css";

function RobotFigure({ color }) {
  const dim = "rgba(255,255,255,0.06)";
  return (
    <svg
      className="bot-svg"
      width="152"
      height="192"
      viewBox="0 0 76 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* antenna */}
      <rect
        x="28"
        y="2"
        width="20"
        height="4"
        rx="2"
        fill={color}
        opacity=".6"
      />
      <rect
        x="33"
        y="4"
        width="10"
        height="8"
        rx="3"
        fill={color}
        opacity=".7"
      />
      {/* head */}
      <rect
        x="14"
        y="12"
        width="48"
        height="34"
        rx="8"
        fill="#1a1530"
        stroke={color}
        strokeWidth="1.2"
      />
      {/* left eye */}
      <circle cx="27" cy="26" r="6" fill={dim} stroke={color} strokeWidth="1" />
      <circle cx="27" cy="26" r="3" fill={color} opacity=".9" />
      {/* right eye */}
      <circle cx="49" cy="26" r="6" fill={dim} stroke={color} strokeWidth="1" />
      <circle cx="49" cy="26" r="3" fill={color} opacity=".9" />
      {/* mouth */}
      <rect
        x="22"
        y="36"
        width="32"
        height="4"
        rx="2"
        fill={dim}
        stroke={color}
        strokeWidth=".8"
        strokeOpacity=".4"
      />
      <rect
        x="24"
        y="37"
        width="8"
        height="2"
        rx="1"
        fill={color}
        opacity=".7"
      />
      {/* left arm */}
      <rect
        x="8"
        y="16"
        width="8"
        height="22"
        rx="4"
        fill="#1a1530"
        stroke={color}
        strokeWidth="1"
        strokeOpacity=".6"
      />
      <rect
        x="10"
        y="20"
        width="4"
        height="3"
        rx="1"
        fill={color}
        opacity=".4"
      />
      {/* right arm */}
      <rect
        x="60"
        y="16"
        width="8"
        height="22"
        rx="4"
        fill="#1a1530"
        stroke={color}
        strokeWidth="1"
        strokeOpacity=".6"
      />
      <rect
        x="62"
        y="20"
        width="4"
        height="3"
        rx="1"
        fill={color}
        opacity=".4"
      />
      {/* torso */}
      <rect
        x="20"
        y="46"
        width="36"
        height="30"
        rx="6"
        fill="#1a1530"
        stroke={color}
        strokeWidth="1"
        strokeOpacity=".7"
      />
      <rect
        x="24"
        y="50"
        width="12"
        height="3"
        rx="1.5"
        fill={color}
        opacity=".3"
      />
      <rect
        x="24"
        y="56"
        width="28"
        height="2"
        rx="1"
        fill={color}
        opacity=".15"
      />
      <rect
        x="24"
        y="60"
        width="20"
        height="2"
        rx="1"
        fill={color}
        opacity=".15"
      />
      <rect
        x="24"
        y="64"
        width="24"
        height="2"
        rx="1"
        fill={color}
        opacity=".15"
      />
      {/* left leg */}
      <rect
        x="22"
        y="76"
        width="10"
        height="18"
        rx="4"
        fill="#1a1530"
        stroke={color}
        strokeWidth="1"
        strokeOpacity=".6"
      />
      <rect
        x="24"
        y="88"
        width="6"
        height="4"
        rx="2"
        fill={color}
        opacity=".4"
      />
      {/* right leg */}
      <rect
        x="44"
        y="76"
        width="10"
        height="18"
        rx="4"
        fill="#1a1530"
        stroke={color}
        strokeWidth="1"
        strokeOpacity=".6"
      />
      <rect
        x="46"
        y="88"
        width="6"
        height="4"
        rx="2"
        fill={color}
        opacity=".4"
      />
    </svg>
  );
}

const THEME_COLORS = {
  teal: "#5dcaa5",
  blue: "#85b7eb",
  coral: "#f0997b",
  purple: "#afa9ec",
  pink: "#ed93b1",
  gold: "#fac775",
  crimson: "#e24b4a",
};

export default function AiBotGrid({ bots, selectedBot, onSelect }) {
  return (
    <div className="ai-bot-grid-figures">
      {bots.map((bot) => {
        const color = THEME_COLORS[bot.theme] || "#a992d6";
        const isSelected = selectedBot === bot.id;

        return (
          <div
            key={bot.id}
            className={`bot-figure${isSelected ? " bot-figure--selected" : ""}`}
            style={{ "--bc": color }}
            onClick={() => onSelect(bot.id)}
          >
            <div className="bot-figure__body">
              <RobotFigure color={color} />

              {/* selection ring */}
              <div className="bot-figure__ring" />

              {/* hover tooltip */}
              <div className="bot-figure__tooltip">
                <div className="bft-elo">{bot.elo} ELO</div>
                <div className="bft-name">{bot.name}</div>
                <div className="bft-tier">{bot.tier}</div>
                <p className="bft-desc">{bot.description}</p>
                <div className="bft-bar-row">
                  <span className="bft-bar-label">Speed</span>
                  <div className="bft-track">
                    <div
                      className="bft-fill"
                      style={{ width: `${bot.speed}%` }}
                    />
                  </div>
                </div>
                <div className="bft-bar-row">
                  <span className="bft-bar-label">Accuracy</span>
                  <div className="bft-track">
                    <div
                      className="bft-fill"
                      style={{ width: `${bot.accuracy}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bot-figure__dot" />
            <div className="bot-figure__name">{bot.name.split(" ")[0]}</div>
          </div>
        );
      })}
    </div>
  );
}

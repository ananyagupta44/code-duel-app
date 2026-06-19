"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import "./tournamentTimeline.css";

const PX_PER_HOUR = 200;
const ROW_H = 92;
const CARD_H = 76;

const STATUS_COLOR = {
  active: "#e24b4a",
  upcoming: "#378add",
  finished: "#639922",
};

const STATUS_LABEL = {
  active: "Live",
  upcoming: "Upcoming",
  finished: "Finished",
};

const FILTERS = [
  { key: "all", label: "All" },
  { key: "active", label: "Live" },
  { key: "upcoming", label: "Upcoming" },
  { key: "finished", label: "Finished" },
];

function formatCountdown(dateStr) {
  const diff = new Date(dateStr) - Date.now();
  if (diff <= 0) return "soon";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 0) return `in ${h}h ${m}m`;
  return `in ${m}m`;
}

function packIntoLanes(tournaments) {
  const lanes = [];
  return [...tournaments]
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
    .map((t) => {
      const start = new Date(t.startDate).getTime();
      const end = new Date(t.endDate).getTime();
      let lane = lanes.findIndex((laneEnd) => laneEnd <= start - 4000);
      if (lane === -1) {
        lane = lanes.length;
        lanes.push(0);
      }
      lanes[lane] = end;
      return { ...t, lane };
    });
}

function generateTicks(minTime, maxTime) {
  const ticks = [];
  const start = new Date(minTime);
  const rem = start.getMinutes() % 30;
  if (rem !== 0) start.setMinutes(start.getMinutes() + (30 - rem), 0, 0);
  else start.setSeconds(0, 0);

  for (
    let t = new Date(start);
    t <= maxTime;
    t = new Date(t.getTime() + 30 * 60000)
  ) {
    ticks.push(new Date(t));
  }
  return ticks;
}

export default function TournamentTimeline({ tournaments = [] }) {
  const router = useRouter();
  const scrollRef = useRef(null);
  const [filter, setFilter] = useState("all");
  const [now, setNow] = useState(() => new Date());

  // Tick every minute to update "now" line
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  // Drag-to-scroll
  const drag = useRef({ active: false, startX: 0, scrollLeft: 0 });
  const onMouseDown = (e) => {
    drag.current = {
      active: true,
      startX: e.pageX - scrollRef.current.offsetLeft,
      scrollLeft: scrollRef.current.scrollLeft,
    };
    scrollRef.current.style.cursor = "grabbing";
  };
  const onMouseUp = () => {
    drag.current.active = false;
    if (scrollRef.current) scrollRef.current.style.cursor = "grab";
  };
  const onMouseMove = (e) => {
    if (!drag.current.active) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    scrollRef.current.scrollLeft =
      drag.current.scrollLeft - (x - drag.current.startX) * 1.2;
  };

  const visible =
    filter === "all"
      ? tournaments
      : tournaments.filter((t) => t.status === filter);

  // Time bounds
  const allDates = visible.flatMap((t) => [
    new Date(t.startDate),
    new Date(t.endDate),
  ]);
  const earliest = allDates.length
    ? new Date(Math.min(...allDates))
    : new Date(now.getTime() - 3600000);
  const latest = allDates.length
    ? new Date(Math.max(...allDates))
    : new Date(now.getTime() + 7200000);
  const minTime = new Date(
    Math.min(earliest.getTime(), now.getTime()) - 3600000,
  );
  const maxTime = new Date(Math.max(latest.getTime(), now.getTime()) + 3600000);
  const totalHours = (maxTime - minTime) / 3600000;
  const totalWidth = Math.max(600, totalHours * PX_PER_HOUR + 40);

  const timeToX = (dateStr) =>
    ((new Date(dateStr) - minTime) / 3600000) * PX_PER_HOUR;
  const nowX = ((now - minTime) / 3600000) * PX_PER_HOUR;

  const ticks = generateTicks(minTime, maxTime);
  const packed = packIntoLanes(visible);
  const laneCount = packed.length
    ? Math.max(...packed.map((t) => t.lane)) + 1
    : 1;

  // Scroll to now on mount / filter change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = Math.max(0, nowX - 200);
    }
  }, [filter, tournaments, nowX]);

  const scrollBy = (delta) =>
    scrollRef.current?.scrollBy({ left: delta, behavior: "smooth" });

  return (
    <div className="ttl-wrap">
      {/* Filters + nav */}
      <div className="ttl-topbar">
        <div className="ttl-filters">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              className={`ttl-filter-btn${filter === f.key ? " active" : ""}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="ttl-nav">
          <button
            onClick={() => scrollBy(-PX_PER_HOUR)}
            aria-label="Scroll left"
          >
            &#8249;
          </button>
          <button
            onClick={() => scrollBy(PX_PER_HOUR)}
            aria-label="Scroll right"
          >
            &#8250;
          </button>
        </div>
      </div>

      {/* Timeline scroll area */}
      <div
        ref={scrollRef}
        className="ttl-scroll"
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onMouseMove={onMouseMove}
      >
        <div className="ttl-inner" style={{ width: totalWidth }}>
          {/* Axis */}
          <div className="ttl-axis">
            {ticks.map((tick) => {
              const x = ((tick - minTime) / 3600000) * PX_PER_HOUR;
              const h = tick.getHours().toString().padStart(2, "0");
              const m = tick.getMinutes().toString().padStart(2, "0");
              return (
                <div
                  key={tick.toISOString()}
                  className="ttl-tick"
                  style={{ left: x }}
                >
                  {h}:{m}
                </div>
              );
            })}
          </div>

          {/* Rows */}
          <div className="ttl-rows" style={{ height: laneCount * ROW_H + 16 }}>
            {/* Grid lines */}
            {ticks.map((tick) => (
              <div
                key={tick.toISOString()}
                className="ttl-vline"
                style={{ left: ((tick - minTime) / 3600000) * PX_PER_HOUR }}
              />
            ))}

            {/* Now line */}
            {nowX >= 0 && nowX <= totalWidth && (
              <div className="ttl-now-line" style={{ left: nowX }}>
                <span className="ttl-now-label">now</span>
              </div>
            )}

            {/* Cards */}
            {packed.map((t) => {
              const x = Math.max(0, timeToX(t.startDate));
              const endX = timeToX(t.endDate);
              const w = Math.max(148, endX - x - 4);
              const y = t.lane * ROW_H;
              const color = STATUS_COLOR[t.status];
              const players = t.participants?.length || 0;

              return (
                <div
                  key={t._id}
                  className="ttl-card"
                  style={{ left: x, top: y, width: w, borderLeftColor: color }}
                  onClick={() => router.push(`/tournaments/${t._id}`)}
                >
                  <div className="ttl-card-name">{t.name}</div>
                  <div className="ttl-card-meta">
                    {t.difficulty} &nbsp;·&nbsp; {players}/{t.maxParticipants}{" "}
                    players
                  </div>
                  <div className="ttl-card-footer">
                    <span className={`ttl-badge ttl-badge--${t.status}`}>
                      {STATUS_LABEL[t.status]}
                    </span>
                    {t.status === "finished" && t.winnerId && (
                      <span className="ttl-winner">
                        🏆 {t.winnerId.username}
                      </span>
                    )}
                    {t.status === "upcoming" && (
                      <span className="ttl-countdown">
                        {formatCountdown(t.startDate)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {visible.length === 0 && (
              <div className="ttl-empty">No tournaments to display.</div>
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="ttl-legend">
        <span className="ttl-legend-item">
          <span className="ttl-legend-dot" style={{ background: "#e24b4a" }} />{" "}
          Live
        </span>
        <span className="ttl-legend-item">
          <span className="ttl-legend-dot" style={{ background: "#378add" }} />{" "}
          Upcoming
        </span>
        <span className="ttl-legend-item">
          <span className="ttl-legend-dot" style={{ background: "#639922" }} />{" "}
          Finished
        </span>
      </div>
    </div>
  );
}

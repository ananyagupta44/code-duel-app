"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import "./tournamentTimeline.css";

const PX_PER_HOUR = 200;
const ROW_H = 92;

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

const VIEW_MODES = [
  { key: "day", label: "Day" },
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
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

// returns { minTime, maxTime } for the selected view + anchor date
function getRangeBounds(viewMode, anchorDate) {
  const d = new Date(anchorDate + "T00:00:00");

  if (viewMode === "day") {
    const start = new Date(d);
    start.setHours(0, 0, 0, 0);
    const end = new Date(d);
    end.setHours(23, 59, 59, 999);
    return { minTime: start, maxTime: end };
  }

  if (viewMode === "week") {
    const start = new Date(d);
    start.setDate(start.getDate() - start.getDay());
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { minTime: start, maxTime: end };
  }

  if (viewMode === "month") {
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
    return { minTime: start, maxTime: end };
  }
}

function formatAnchorLabel(viewMode, anchorDate) {
  const d = new Date(anchorDate);
  if (viewMode === "day") {
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
  if (viewMode === "week") {
    const start = new Date(d);
    start.setDate(start.getDate() - start.getDay());
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
  }
  if (viewMode === "month") {
    return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }
}

function stepAnchor(viewMode, anchorDate, direction) {
  const d = new Date(anchorDate);
  if (viewMode === "day") d.setDate(d.getDate() + direction);
  if (viewMode === "week") d.setDate(d.getDate() + direction * 7);
  if (viewMode === "month") d.setMonth(d.getMonth() + direction);
  return d.toISOString().split("T")[0];
}

export default function TournamentTimeline({ tournaments = [] }) {
  const router = useRouter();
  const scrollRef = useRef(null);
  const [filter, setFilter] = useState("all");
  const [now, setNow] = useState(() => new Date());
  const [viewMode, setViewMode] = useState("day");
  const [anchorDate, setAnchorDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  // drag-to-scroll
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

  // compute time bounds from view mode
  const { minTime, maxTime } = getRangeBounds(viewMode, anchorDate);
  const totalHours = (maxTime - minTime) / 3600000;
  const totalWidth = Math.max(600, totalHours * PX_PER_HOUR + 40);

  const timeToX = (dateStr) =>
    ((new Date(dateStr) - minTime) / 3600000) * PX_PER_HOUR;
  const nowX = ((now - minTime) / 3600000) * PX_PER_HOUR;

  // filter tournaments that overlap with the current range
  const inRange = visible.filter((t) => {
    const start = new Date(t.startDate).getTime();
    const end = new Date(t.endDate).getTime();

    const overlaps = end >= minTime.getTime() && start <= maxTime.getTime();

    return overlaps;
  });

  const ticks = generateTicks(minTime, maxTime);
  const packed = packIntoLanes(inRange);
  const laneCount = packed.length
    ? Math.max(...packed.map((t) => t.lane)) + 1
    : 1;

  useEffect(() => {
    if (scrollRef.current) {
      const target = Math.max(0, nowX - 200);
      scrollRef.current.scrollLeft = target;
    }
  }, [filter, viewMode, anchorDate, nowX]);

  const scrollBy = (delta) =>
    scrollRef.current?.scrollBy({ left: delta, behavior: "smooth" });

  return (
    <div className="ttl-wrap">
      {/* top bar: filters + view mode + date nav */}
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

        <div className="ttl-controls">
          {/* view mode toggle */}
          <div className="ttl-view-toggle">
            {VIEW_MODES.map((v) => (
              <button
                key={v.key}
                className={`ttl-view-btn${viewMode === v.key ? " active" : ""}`}
                onClick={() => setViewMode(v.key)}
              >
                {v.label}
              </button>
            ))}
          </div>

          {/* date navigator */}
          <div className="ttl-date-nav">
            <button
              className="ttl-date-arrow"
              onClick={() =>
                setAnchorDate(stepAnchor(viewMode, anchorDate, -1))
              }
            >
              ‹
            </button>
            <input
              type="date"
              className="ttl-date-input"
              value={anchorDate}
              onChange={(e) => setAnchorDate(e.target.value)}
            />
            <span
              className="ttl-date-label"
              onClick={() => document.getElementById("ttl-date-picker").click()}
            >
              {formatAnchorLabel(viewMode, anchorDate)}
            </span>
            <input
              id="ttl-date-picker"
              type="date"
              className="ttl-date-input"
              value={anchorDate}
              onChange={(e) => setAnchorDate(e.target.value)}
            />
            <button
              className="ttl-date-arrow"
              onClick={() => setAnchorDate(stepAnchor(viewMode, anchorDate, 1))}
            >
              ›
            </button>
            <button
              className="ttl-today-btn"
              onClick={() =>
                setAnchorDate(new Date().toISOString().split("T")[0])
              }
            >
              Today
            </button>
          </div>

          {/* scroll nav */}
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
      </div>

      {/* timeline scroll area */}
      <div
        ref={scrollRef}
        className="ttl-scroll"
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onMouseMove={onMouseMove}
      >
        <div className="ttl-inner" style={{ width: totalWidth }}>
          <div className="ttl-axis">
            {ticks.map((tick) => {
              const x = ((tick - minTime) / 3600000) * PX_PER_HOUR;
              const h = tick.getHours().toString().padStart(2, "0");
              const m = tick.getMinutes().toString().padStart(2, "0");
              // in week/month view, also show the date on midnight ticks
              const showDate =
                (viewMode === "week" || viewMode === "month") &&
                h === "00" &&
                m === "00";
              return (
                <div
                  key={tick.toISOString()}
                  className={`ttl-tick${showDate ? " ttl-tick--date" : ""}`}
                  style={{ left: x }}
                >
                  {showDate
                    ? tick.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    : `${h}:${m}`}
                </div>
              );
            })}
          </div>

          <div className="ttl-rows" style={{ height: laneCount * ROW_H + 16 }}>
            {ticks.map((tick) => (
              <div
                key={tick.toISOString()}
                className="ttl-vline"
                style={{ left: ((tick - minTime) / 3600000) * PX_PER_HOUR }}
              />
            ))}

            {nowX >= 0 && nowX <= totalWidth && (
              <div className="ttl-now-line" style={{ left: nowX }}>
                <span className="ttl-now-label">now</span>
              </div>
            )}

            {packed.map((t) => {
              const startX = Math.max(0, timeToX(t.startDate));
              const endX = Math.min(totalWidth, timeToX(t.endDate));
              const w = Math.max(148, endX - startX - 4);
              const y = t.lane * ROW_H;
              const color = STATUS_COLOR[t.status];
              const players = t.participants?.length || 0;
              return (
                <div
                  key={t._id}
                  className="ttl-card"
                  style={{
                    left: startX,
                    top: y,
                    width: w,
                    borderLeftColor: color,
                  }}
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

            {inRange.length === 0 && (
              <div className="ttl-empty">
                No tournaments in this {viewMode}.
              </div>
            )}
          </div>
        </div>
      </div>

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

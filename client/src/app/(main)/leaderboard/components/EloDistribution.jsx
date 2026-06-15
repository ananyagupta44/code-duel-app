"use client";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  LabelList,
} from "recharts";
import "./eloDistribution.css";

export default function EloDistribution({ data = [] }) {
  return (
    <div className="elo-chart-card">
      <h3>ELO Distribution</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 4, left: -20, bottom: 0 }}
        >
          <XAxis
            dataKey="range"
            tick={{
              fill: "rgba(210,200,230,0.45)",
              fontSize: 10,
              fontFamily: "Chivo Mono",
            }}
          />
          <YAxis
            tick={{
              fill: "rgba(210,200,230,0.45)",
              fontSize: 10,
              fontFamily: "Chivo Mono",
            }}
          />
          <Tooltip
            contentStyle={{
              background: "#14101f",
              border: "1px solid rgba(169,146,214,0.3)",
              borderRadius: 8,
              fontFamily: "Chivo Mono",
              fontSize: "0.75rem",
            }}
            labelStyle={{ color: "#d4b8ff" }}
            itemStyle={{ color: "rgba(210,200,230,0.8)" }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.isUser ? "#f7c948" : "rgba(169,146,214,0.35)"}
              />
            ))}
            <LabelList
              dataKey="isUser"
              content={({ x, y, value }) =>
                !value ? null : (
                  <text
                    x={x}
                    y={y - 8}
                    fill="#f7c948"
                    textAnchor="middle"
                    fontSize={10}
                    fontWeight="bold"
                    fontFamily="Chivo Mono"
                  >
                    YOU
                  </text>
                )
              }
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="chart-legend">
        <div className="chart-legend-item">
          <div
            className="chart-legend-dot"
            style={{ background: "rgba(169,146,214,0.4)" }}
          />
          Players
        </div>
        <div className="chart-legend-item">
          <div className="chart-legend-dot" style={{ background: "#f7c948" }} />
          Your position
        </div>
      </div>
    </div>
  );
}

"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import "./solvedDistribution.css";

export default function SolvedDistribution({ data = [] }) {
  const chartData = data
    .slice(0, 8)
    .map((item) => ({
      topic: item.topic
        .split("-")
        .map(
          (word) =>
            word.charAt(0).toUpperCase() +
            word.slice(1)
        )
        .join(" "),
      solved: item.count,
    }));

  return (
    <div className="solved-chart-card">
      <h3>Topic Mastery</h3>

      <ResponsiveContainer
        width="100%"
        height={300}
      >
        <BarChart
          layout="vertical"
          data={chartData}
          margin={{
            left: 20,
          }}
        >
          <XAxis type="number" />

          <YAxis
            type="category"
            dataKey="topic"
            width={120}
          />

          <Tooltip />

          <Bar
            dataKey="solved"
            radius={[0, 6, 6, 0]}
            fill="#f7c948"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
"use client";

import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer } from "recharts";

interface RadarDataProps {
  data: {
    category: string;
    score: number;
    fullMark: number;
  }[];
}

export function HostelRadarChart({ data }: RadarDataProps) {
  // Prevent rendering empty or zeroed charts
  const hasData = data && data.some(d => d.score > 0);

  if (!hasData) return (
    <div className="w-full h-full min-h-[250px] flex items-center justify-center text-foreground/40 font-medium bg-foreground/5 rounded-3xl border border-border border-dashed">
      Not enough data for radar analysis.
    </div>
  );

  return (
    <div className="w-full h-[250px] sm:h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="65%" data={data}>
          <PolarGrid stroke="currentColor" className="opacity-10 text-foreground" />
          <PolarAngleAxis 
            dataKey="category" 
            tick={{ fill: "currentColor", fontSize: 12, fontWeight: 600 }}
            className="opacity-70 text-foreground"
          />
          <PolarRadiusAxis angle={90} domain={[0, 5]} tick={false} axisLine={false} />
          <Radar
            name="Hostel Rating"
            dataKey="score"
            stroke="currentColor"
            fill="currentColor"
            className="text-foreground"
            strokeWidth={2}
            fillOpacity={0.15}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

import { cn } from "@/lib/utils";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useState } from "react";
import { IExploreEarlyComprehensiveStep1Item } from "@/stores/server/features/explore/early-comprehensive/interfaces";
import { reverseGrade } from "@/lib/utils/common/format";

interface Step1Props {
  myGrade: number;
  data: IExploreEarlyComprehensiveStep1Item[];
}

export const Step1Chart = ({ myGrade, data }: Step1Props) => {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const preprocessed = data
    .map((item, index) => {
      const grade50Cut = reverseGrade(
        parseFloat(item.scores?.grade_50_cut + ""),
      );
      const grade70Cut = reverseGrade(
        parseFloat(item.scores?.grade_70_cut + ""),
      );
      return {
        ...item,
        index,
        range:
          grade50Cut !== null && grade70Cut !== null
            ? [grade50Cut, grade70Cut]
            : [],
        xLabelData: `${item.admission.university.region}\n${item.admission.university.name}\n${item.admission.name}\n${item.name}`,
      };
    })
    .map((item) => {
      if (item.range.length === 2 && item.range[0] === item.range[1]) {
        item.range[1] += 0.05;
      }
      return item;
    })
    .filter((item) => {
      const [min, max] = item.range;
      return (
        item.range.length === 2 && min <= 9 && min >= 1 && max <= 9 && max >= 1
      );
    });

  const barSize = 120;

  return (
    <ResponsiveContainer
      width={Math.max(1188, barSize * preprocessed.length)}
      height="100%"
    >
      <BarChart data={preprocessed} margin={{ right: 5, bottom: 5 }}>
        <XAxis
          tickLine={false}
          height={100}
          dataKey="xLabelData"
          tick={(props) => <TickX {...props} />}
          interval={0}
        />
        <YAxis
          stroke="#888888"
          interval={0}
          type="number"
          tickCount={9}
          axisLine={false}
          tickLine={false}
          domain={[1, 9]}
          tick={(props) => <TickY {...props} />}
        />
        <CartesianGrid
          vertical={false}
          z={1}
          className="stroke-foreground/20"
        />
        <Tooltip
          cursor={{ fill: "transparent" }}
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              setHoverIdx(payload[0].payload.index);
            } else {
              setHoverIdx(null);
            }

            const range = payload?.[0]?.payload?.range ?? [];
            const region =
              payload?.[0]?.payload?.admission.university.region ?? "";
            const university_name =
              payload?.[0]?.payload?.admission.university.name ?? "";
            const admission_name = payload?.[0]?.payload?.admission.name ?? "";
            const name = payload?.[0]?.payload?.name ?? "";

            const minGrade = reverseGrade(range[1] ?? 0);
            const maxGrade = reverseGrade(range[0] ?? 0);

            return (
              <div className="rounded-md bg-background px-4 py-4 text-foreground shadow-lg">
                <p>
                  {university_name}({region})
                </p>
                <p className="text-sm">{admission_name}</p>
                <p className="text-sm">{name}</p>
                <p className="text-sm font-semibold text-primary">
                  등급컷{" "}
                  {minGrade !== null && maxGrade !== null
                    ? `${minGrade.toFixed(2)} ~ ${maxGrade.toFixed(2)}`
                    : "정보 없음"}
                </p>
              </div>
            );
          }}
        />
        <Legend
          verticalAlign="top"
          layout="horizontal"
          align="left"
          wrapperStyle={{
            paddingLeft: "10px",
            paddingBottom: "30px",
            fontSize: 14,
            fontWeight: 700,
          }}
        />
        <Bar
          dataKey="range"
          radius={[4, 4, 4, 4]}
          barSize={barSize - 50}
          name="등급컷"
        >
          {preprocessed.map((entry) => (
            <Cell
              key={`cell-${entry.index}`}
              fill={entry.index === hoverIdx ? "hsl(var(--primary))" : ""}
            />
          ))}
        </Bar>

        <defs>
          <filter x="-0.15" y="-0.1" width="1.3" height="1.1" id="solid">
            <feFlood floodColor="hsl(var(--primary))" />
            <feMerge>
              <feMergeNode in="bg" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <ReferenceLine
          y={reverseGrade(myGrade) ?? 0}
          stroke="hsl(var(--primary))"
          strokeWidth={2}
        >
          <Label
            value="내 등급"
            offset={6}
            position="insideTopLeft"
            fill="#ffffff"
            filter="url(#solid)"
            className="text-xs font-semibold"
          />
        </ReferenceLine>
      </BarChart>
    </ResponsiveContainer>
  );
};

const TickY = ({ x, y, payload }: any) => {
  const grade = reverseGrade(payload.value);
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        fontSize={12}
        fill="#9A9A9A"
        textAnchor="end"
        fontWeight={400}
        fontFamily="Roboto"
      >
        {grade !== null ? `${grade.toFixed(2)}등급` : "N/A"}
      </text>
    </g>
  );
};

const TickX = ({ x, y, payload }: any) => {
  const [region, university_name, admission_name, name] =
    payload.value.split("\n");
  const width = 110;

  return (
    <g transform={`translate(${x},${y})`}>
      <foreignObject
        className="node"
        x={-width / 2}
        y="0"
        width={width}
        height="100%"
      >
        <div
          className={cn(
            "flex flex-col items-center space-y-1 text-xs font-semibold text-foreground/60",
          )}
        >
          <p>
            {university_name}({region})
          </p>
          <p>{admission_name}</p>
          <p>{name}</p>
        </div>
      </foreignObject>
    </g>
  );
};

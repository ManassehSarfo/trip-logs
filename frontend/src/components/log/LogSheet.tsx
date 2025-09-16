type DutyStatus = "off" | "sleeper" | "driving" | "onduty";

type LogEntry = {
  startHour: number;
  endHour: number;
  status: DutyStatus;
};

type LogSheetProps = {
  day: number;
  entries: LogEntry[];
};

const statusToRow: Record<DutyStatus, number> = {
  off: 0,
  sleeper: 1,
  driving: 2,
  onduty: 3,
};

export default function LogSheet({ day, entries }: LogSheetProps) {
  const width = 720;
  const height = 200;
  const rowHeight = height / 4;
  const leftMargin = 60;

  let pathD = "";
  entries.forEach((entry, i) => {
    const y = statusToRow[entry.status] * rowHeight + rowHeight / 2;
    const x1 = leftMargin + (entry.startHour / 24) * width;
    const x2 = leftMargin + (entry.endHour / 24) * width;

    if (i === 0) {
      pathD += `M ${x1},${y} L ${x2},${y}`;
    } else {
      const prevEntry = entries[i - 1];
      const prevY =
      statusToRow[prevEntry.status] * rowHeight + rowHeight / 2;

      if (prevEntry.status !== entry.status) {
        pathD += ` L ${x1},${prevY} L ${x1},${y} L ${x2},${y}`;
      } else {
        pathD += ` L ${x2},${y}`;
      }
    }
  });

  return (
    <div className="bg-white p-4 rounded-2xl shadow-md overflow-x-auto">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Driver’s Daily Log – Day {day}
      </h3>

      <svg
        width={width + leftMargin}
        height={height + 20}
        className="border border-gray-400"
      >
        {/* Horizontal grid lines and labels */}
        {["Off Duty", "Slp Berth", "Driving", "On Duty"].map((label, i) => {
          const y = i * rowHeight + rowHeight / 2;
          return (
            <g key={i}>
              <line
                x1={leftMargin}
                y1={y}
                x2={leftMargin + width}
                y2={y}
                stroke="#ccc"
                strokeWidth={1}
              />
              <text
                x={leftMargin - 10}
                y={y + 4}
                fontSize="12"
                textAnchor="end"
                fill="#333"
                fontWeight="500"
              >
                {label}
              </text>
            </g>
          );
        })}

        {/* Vertical hour marks */}
        {Array.from({ length: 25 }).map((_, i) => {
          const x = leftMargin + (i / 24) * width;
          return (
            <g key={i}>
              <line
                x1={x}
                y1={0}
                x2={x}
                y2={height}
                stroke="#ddd"
                strokeWidth={1}
              />
              {i % 2 === 0 && i < 24 && (
                <text
                  x={x}
                  y={height + 12}
                  fontSize="10"
                  textAnchor="middle"
                  fill="#333"
                >
                  {i}
                </text>
              )}
            </g>
          );
        })}

        {/* Duty line */}
        <path d={pathD} stroke="blue" strokeWidth={2} fill="none" />
      </svg>
    </div>
  );
}

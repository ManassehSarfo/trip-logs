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
  const width = 720; // 30px per hour
  const height = 200; // 4 rows
  const rowHeight = height / 4;

  // Build continuous duty path
  let pathD = "";
  entries.forEach((entry, i) => {
    const y = statusToRow[entry.status] * rowHeight + rowHeight / 2;
    const x1 = (entry.startHour / 24) * width;
    const x2 = (entry.endHour / 24) * width;

    if (i === 0) {
      pathD += `M ${x1},${y} L ${x2},${y}`;
    } else {
      const prevEntry = entries[i - 1];
      const prevY =
        statusToRow[prevEntry.status] * rowHeight + rowHeight / 2;
      const prevX = (entry.startHour / 24) * width;

      // Draw vertical line if status changed
      if (prevEntry.status !== entry.status) {
        pathD += ` L ${x1},${prevY} L ${x1},${y} L ${x2},${y}`;
      } else {
        pathD += ` L ${x2},${y}`;
      }
    }
  });

  return (
    <div className="bg-white p-4 rounded-2xl shadow-md">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Driver’s Daily Log – Day {day}
      </h3>

      <svg width={width} height={height + 20} className="border border-gray-400">
        {/* Horizontal grid lines */}
        {["Off Duty", "Sleeper Berth", "Driving", "On Duty"].map((label, i) => (
          <g key={i}>
            <line
              x1={0}
              y1={i * rowHeight + rowHeight / 2}
              x2={width}
              y2={i * rowHeight + rowHeight / 2}
              stroke="#ccc"
              strokeWidth={1}
            />
            <text
              x={-5}
              y={i * rowHeight + rowHeight / 2 + 4}
              fontSize="10"
              textAnchor="end"
              fill="#333"
            >
              {label}
            </text>
          </g>
        ))}

        {/* Vertical hour marks */}
        {Array.from({ length: 25 }).map((_, i) => {
          const x = (i / 24) * width;
          return (
            <g key={i}>
              <line x1={x} y1={0} x2={x} y2={height} stroke="#ddd" strokeWidth={1} />
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

type LogSheetProps = {
  day: number;
  hoursDriven: number[];
};

export default function LogSheet({ day, hoursDriven }: LogSheetProps) {
  return (
    <div className="p-4 bg-white rounded-2xl shadow-md">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">
        Daily Log Sheet - Day {day}
      </h3>
      <div className="grid grid-cols-24 gap-[1px] bg-gray-300">
        {Array.from({ length: 24 }).map((_, i) => {
          const driven = hoursDriven.includes(i);
          return (
            <div
              key={i}
              className={`h-12 flex items-center justify-center text-xs font-medium ${
                driven ? "bg-blue-500 text-white" : "bg-white"
              }`}
            >
              {i}:00
            </div>
          );
        })}
      </div>
    </div>
  );
}

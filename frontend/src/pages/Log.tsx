import { useEffect, useState } from "react";
import LogSheet from "../components/log/LogSheet";
import PageSwitcher from "../components/ui/PageSwitcher";

type DutyStatus = "off" | "sleeper" | "driving" | "onduty";

interface LogEntry {
  id: number;
  day: number;
  start_hour: number;
  end_hour: number;
  activity_type: DutyStatus;
  notes?: string | null;
  logsheet: number;
}

interface Stop {
  id: number;
  latitude: number;
  longitude: number;
  type: "fuel" | "rest" | "pickup" | "dropoff";
  duration_hours?: number;
  notes?: string;
  logsheet: number;
}

interface LogSheetModel {
  id: number;
  driver: number;
  date: string;
  start_location: string;
  end_location: string;
  entries: LogEntry[];
  stops: Stop[];
}

export default function Logs() {
  const [logsheets, setLogsheets] = useState<LogSheetModel[]>([]);
  const [loading, setLoading] = useState(true);

  const driverName = localStorage.getItem("driverName") || "";

  useEffect(() => {
    const fetchLogsheets = async () => {
      if (!driverName) {
        console.warn("No driver name in localStorage");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `http://localhost:8000/api/logsheets/by-driver/?name=${encodeURIComponent(
            driverName
          )}`
        );
        if (!res.ok) throw new Error("Failed to fetch driver logsheets");
        const data = await res.json();
        setLogsheets(data);
      } catch (err) {
        console.error("Error fetching logs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogsheets();
  }, [driverName]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex items-center gap-4 mb-6 w-full justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Daily Log Sheets</h1>
        <PageSwitcher />
      </div>

      {loading ? (
        <p>Loading logs…</p>
      ) : !driverName ? (
        <p className="text-red-500">No driver logged in.</p>
      ) : logsheets.length === 0 ? (
        <p>No logs found for {driverName}.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {logsheets.map((logsheet, idx) => (
            <div key={logsheet.id} className="space-y-4">
              <LogSheet
                day={idx + 1}
                entries={logsheet.entries.map((e) => ({
                  startHour: e.start_hour,
                  endHour: e.end_hour,
                  status: e.activity_type,
                }))}
              />

              {/* Stops */}
              <div className="bg-white p-4 rounded-2xl shadow-md">
                <h4 className="text-md font-semibold text-gray-700 mb-2">
                  Stops & Rests – {logsheet.date}
                </h4>
                {logsheet.stops.length === 0 ? (
                  <p className="text-sm text-gray-500">No stops recorded.</p>
                ) : (
                  <ul className="space-y-2">
                    {logsheet.stops.map((stop) => (
                      <li
                        key={stop.id}
                        className="flex justify-between items-center text-sm border-b pb-1"
                      >
                        <span className="capitalize font-medium">
                          {stop.type}
                        </span>
                        {stop.duration_hours && (
                          <span>{stop.duration_hours}h</span>
                        )}
                        {stop.notes && (
                          <span className="italic text-gray-500">
                            {stop.notes}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

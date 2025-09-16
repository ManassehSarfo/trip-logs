import { useState } from "react";
import TripForm from "../components/forms/TripForm";
import MapView from "../components/map/MapView";
import PageSwitcher from "../components/ui/PageSwitcher";
import polyline from "@mapbox/polyline";
import LogSheet from "../components/log/LogSheet";

export default function TripPlanner() {
  const [tripData, setTripData] = useState<{
    current?: [number, number];
    pickup?: [number, number];
    dropoff?: [number, number];
    route?: [number, number][];
    summary?: { distance: number; duration: number };
    dailyLogs?: {
      day: string;
      entries: {
        startHour: number;
        endHour: number;
        status: "off" | "sleeper" | "driving" | "onduty";
      }[];
    }[];
  }>({});

  const handleSubmit = async (formData: {
    current: { name: string; geo: [number, number] | null };
    pickup: { name: string; geo: [number, number] | null };
    dropoff: { name: string; geo: [number, number] | null };
    cycleHours: number;
  }) => {
    const payload = {
      current_location: formData.current.geo
        ? { lat: formData.current.geo[0], lon: formData.current.geo[1] }
        : null,
      pickup_location: formData.pickup.geo
        ? { lat: formData.pickup.geo[0], lon: formData.pickup.geo[1] }
        : null,
      dropoff_location: formData.dropoff.geo
        ? { lat: formData.dropoff.geo[0], lon: formData.dropoff.geo[1] }
        : null,
      current_cycle_hours: formData.cycleHours,
      driver_name: localStorage.getItem("driverName"),
    };

    try {
      const res = await fetch("http://localhost:8000/api/trip/logs/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Request failed with status ${res.status}`);

      const data = await res.json();

      let decodedRoute: [number, number][] = [];
      if (data.geometry) {
        const decoded = polyline.decode(data.geometry);
        decodedRoute = decoded.map(([lat, lon]) => [lat, lon]);
      }

      setTripData({
        current: payload.current_location
          ? [payload.current_location.lat, payload.current_location.lon]
          : undefined,
        pickup: payload.pickup_location
          ? [payload.pickup_location.lat, payload.pickup_location.lon]
          : undefined,
        dropoff: payload.dropoff_location
          ? [payload.dropoff_location.lat, payload.dropoff_location.lon]
          : undefined,
        route: decodedRoute,
        summary: data.route.summary,
        dailyLogs: data.dailyLogs,
      });
    } catch (err) {
      console.error("Trip planning error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex items-center gap-4 mb-6 w-full justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Trip Details</h1>
        <PageSwitcher />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
        {/* Form Section */}
        <div className="col-span-1">
          <TripForm onSubmit={handleSubmit} />
        </div>

        <div className="col-span-2 space-y-6">
          <MapView
            current={tripData.current}
            pickup={tripData.pickup}
            dropoff={tripData.dropoff}
            route={tripData.route}
          />

          {tripData.summary && (
            <div className="p-4 bg-white shadow rounded">
              <p>
                Distance: {(tripData.summary.distance / 1000).toFixed(1)} km
              </p>
              <p>
                Duration: {(tripData.summary.duration / 3600).toFixed(1)} hours
              </p>
            </div>
          )}

          <div className="flex flex-col gap-4">
             <h3 className="text-lg font-semibold mt-4">Daily Logs</h3>
              <div className="space-y-4">
                {tripData.dailyLogs?.map((log, idx) => (
                  <div key={idx} className="border rounded p-3 shadow-sm">
                    <p className="font-medium">Day {log.day}</p>
                    <ul className="list-disc ml-5">
                      {log.entries?.map((seg, i) => (
                        <li key={i}>
                          Hours: {seg.startHour} → {seg.endHour} ({seg.status})
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                {tripData.dailyLogs?.map((log, idx) => (
                  <div key={idx} className="border rounded p-3 shadow-sm">
                    <LogSheet
                      day={Number(log.day)}
                      entries={log.entries}
                      />
                  </div>
                ))}
                {(!tripData.dailyLogs || tripData.dailyLogs.length === 0) ? (
                  <p className="font-bold text-gray-400">No daily logs available. Kindly input trip details</p>
                ) : null}
              </div>
          </div>
       
        </div>
      </div>
    </div>
  );
}

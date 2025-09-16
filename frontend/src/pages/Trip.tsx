import { useState } from "react";
import TripForm from "../components/forms/TripForm";
import MapView from "../components/map/MapView";
import LogSheet from "../components/log/LogSheet";
import PageSwitcher from "../components/ui/PageSwitcher";

export default function TripPlanner() {
  const [tripData, setTripData] = useState<{
    current?: [number, number];
    pickup?: [number, number];
    dropoff?: [number, number];
    route?: [number, number][];
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

      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }

      const data = await res.json();

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
        route: data.route || [],
      });
    } catch (err) {
      console.error("Trip planning error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex items-center gap-4 mb-6 w-full sm:w-1/3 justify-between">
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

          <div className="flex gap-4">
            <LogSheet
              day={1}
              entries={[
                { startHour: 0, endHour: 6, status: "off" },
                { startHour: 6, endHour: 12, status: "driving" },
                { startHour: 12, endHour: 14, status: "onduty" },
                { startHour: 14, endHour: 24, status: "sleeper" },
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

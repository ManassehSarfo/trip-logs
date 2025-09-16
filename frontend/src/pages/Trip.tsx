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

  const handleSubmit = (formData: {
    current: string;
    pickup: string;
    dropoff: string;
    cycleHours: number;
  }) => {
    console.log("Form Submitted:", formData);

    // TODO: Call backend (Django API) for geocoding + route
    setTripData({
      current: [34.0522, -118.2437],
      pickup: [36.1699, -115.1398],
      dropoff: [32.7767, -96.797],
      route: [
        [34.0522, -118.2437],
        [36.1699, -115.1398],
        [32.7767, -96.797],
      ],
    });
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

        {/* Map + Logs Section */}
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

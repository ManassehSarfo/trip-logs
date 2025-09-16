import { useState } from "react";

type TripFormProps = {
  onSubmit: (data: {
    current: string;
    pickup: string;
    dropoff: string;
    cycleHours: number;
  }) => void;
};

export default function TripForm({ onSubmit }: TripFormProps) {
  const [current, setCurrent] = useState("");
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [cycleHours, setCycleHours] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ current, pickup, dropoff, cycleHours });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md p-6 bg-white rounded-2xl shadow-md space-y-4"
    >
      <h2 className="text-xl font-semibold text-gray-800">Trip Info</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Current Location
        </label>
        <input
          type="text"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
          placeholder="e.g. West Legon, Accra"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Pickup Location
        </label>
        <input
          type="text"
          value={pickup}
          onChange={(e) => setPickup(e.target.value)}
          className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
          placeholder="e.g. Achimota, Accra"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Dropoff Location
        </label>
        <input
          type="text"
          value={dropoff}
          onChange={(e) => setDropoff(e.target.value)}
          className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
          placeholder="e.g. Tema, Greater Accra"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Current Cycle Used (hrs)
        </label>
        <input
          type="number"
          min={0}
          max={70}
          value={cycleHours}
          onChange={(e) => setCycleHours(Number(e.target.value))}
          className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
        />
      </div>

      <button
        type="submit"
        className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg shadow"
      >
        Submit
      </button>
    </form>
  );
}

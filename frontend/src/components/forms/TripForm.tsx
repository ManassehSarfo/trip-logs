import { useState, useEffect } from "react";

type TripFormProps = {
  onSubmit: (data: {
    current: { name: string; geo: [number, number] | null };
    pickup: { name: string; geo: [number, number] | null };
    dropoff: { name: string; geo: [number, number] | null };
    cycleHours: number;
  }) => void;
};

type Suggestion = {
  display_name: string;
  lat: string;
  lon: string;
};

function LocationInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: { name: string; geo: [number, number] | null };
  onChange: (val: { name: string; geo: [number, number] | null }) => void;
  placeholder: string;
}) {
  const [query, setQuery] = useState(value.name || "");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();

    const fetchSuggestions = async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            query
          )}&format=json&addressdetails=1&limit=5`,
          { signal: controller.signal }
        );
        const data = await res.json();
        setSuggestions(data);
      } catch (err) {
        if ((err as any).name !== "AbortError") {
          console.error("Autocomplete error:", err);
        }
      }
    };

    const delay = setTimeout(fetchSuggestions, 300);
    return () => {
      clearTimeout(delay);
      controller.abort();
    };
  }, [query]);

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setShowSuggestions(true);
          onChange({ name: e.target.value, geo: null });
        }}
        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
        placeholder={placeholder}
      />
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {suggestions.map((s, idx) => (
            <li
              key={idx}
              className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
              onClick={() => {
                setQuery(s.display_name);
                onChange({
                  name: s.display_name,
                  geo: [parseFloat(s.lat), parseFloat(s.lon)],
                });
                setSuggestions([]);
                setShowSuggestions(false);
              }}
            >
              {s.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function TripForm({ onSubmit }: TripFormProps) {
  const [current, setCurrent] = useState<{ name: string; geo: [number, number] | null }>({ name: "", geo: null });
  const [pickup, setPickup] = useState<{ name: string; geo: [number, number] | null }>({ name: "", geo: null });
  const [dropoff, setDropoff] = useState<{ name: string; geo: [number, number] | null }>({ name: "", geo: null });
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

      <LocationInput
        label="Current Location"
        value={current}
        onChange={setCurrent}
        placeholder="e.g. West Legon, Accra"
      />

      <LocationInput
        label="Pickup Location"
        value={pickup}
        onChange={setPickup}
        placeholder="e.g. Achimota, Accra"
      />

      <LocationInput
        label="Dropoff Location"
        value={dropoff}
        onChange={setDropoff}
        placeholder="e.g. Tema, Greater Accra"
      />

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
        className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg shadow text-white"
      >
        Submit
      </button>
    </form>
  );
}

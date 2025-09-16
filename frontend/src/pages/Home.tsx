// src/pages/Home.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import dtl from "../assets/dtlogs.png";

const generateGuestName = () => {
  const animals = ["Falcon", "Wolf", "Tiger", "Hawk", "Eagle", "Lion"];
  const random = animals[Math.floor(Math.random() * animals.length)];
  return `Guest-${random}-${Math.floor(Math.random() * 1000)}`;
};

export default function Home() {
  const [driverName, setDriverName] = useState<string | null>(null);
  const [tempName, setTempName] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const savedName = localStorage.getItem("driverName");
    if (savedName) {
      setDriverName(savedName);
    } else {
      setShowModal(true);
    }
  }, []);

  const handleSaveName = () => {
    if (tempName.trim()) {
      setDriverName(tempName);
      localStorage.setItem("driverName", tempName);
      setShowModal(false);
    }
  };

  const handleGuest = () => {
    const guest = generateGuestName();
    setDriverName(guest);
    localStorage.setItem("driverName", guest);
    setShowModal(false);
  };

  const handleSwitchUser = () => {
    localStorage.removeItem("driverName");
    setDriverName(null);
    setShowModal(true);
  };

  const handleLogout = () => {
    localStorage.clear();
    setDriverName(null);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fadeIn">
          <div className="bg-white rounded-xl p-6 shadow-2xl w-full max-w-md animate-slideUp">
            <h2 className="text-xl font-bold mb-4">Enter Driver Name</h2>
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              placeholder="Driver's Name"
              className="w-full border rounded-lg p-2 mb-4 focus:outline-none focus:ring focus:ring-blue-300"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={handleGuest}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 font-bold transition"
              >
                Continue as Guest
              </button>
              <button
                onClick={handleSaveName}
                className="px-4 py-2 border-2 border-blue-200 hover:bg-blue-100 text-blue-500 font-bold rounded-lg shadow transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="p-4 flex justify-between items-center animate-slideDown">
        <div>
          {driverName && (
            <p className="text-2xl font-bold">Welcome, {driverName} 🚚</p>
          )}
        </div>
        {driverName && (
          <div className="flex gap-2">
            <button
              onClick={handleSwitchUser}
              className="px-4 py-2 border-2 border-blue-200 hover:bg-blue-100 text-blue-500 font-bold rounded-lg shadow transition"
            >
              Switch User
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 border-2 border-red-200 hover:bg-red-100 text-red-500 font-bold rounded-lg shadow transition"
            >
              Logout
            </button>
          </div>
        )}
      </header>

      {/* Content */}
      <main className="flex flex-col flex-grow items-center justify-center">
        <img src={dtl} alt="Logo" className="h-32 -m-4" />
        <div className="flex flex-col items-center justify-center bg-gray-50 p-12 rounded-2xl shadow-lg animate-fadeScale">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Welcome to Trip Planner
          </h1>
          <p className="text-gray-600 mb-8 text-center">
            Plan trips, view routes, and generate ELD daily log sheets with ease.
          </p>
          <Link
            to="/trip"
            className="px-6 py-3 border-2 border-blue-200 hover:bg-blue-100 text-blue-500 font-bold rounded-lg shadow-md transition"
          >
            Get Started
          </Link>
        </div>
      </main>
    </div>
  );
}

// src/components/Header.jsx
import React from "react";

export default function Header({ onNavigate, view }) {
  return (
    <header className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-coffee-700">☕ Coffee-to-Code Ratio</h1>
        <p className="text-sm text-gray-600 mt-1">Because caffeine deserves credit</p>
      </div>
      <nav className="hidden md:flex gap-2 items-center">
        <button onClick={() => onNavigate("dashboard")} className="px-3 py-2 rounded-lg text-sm bg-white shadow-sm">Home</button>
        <button onClick={() => onNavigate("history")} className="px-3 py-2 rounded-lg text-sm bg-white shadow-sm">History</button>
        <button onClick={() => onNavigate("insights")} className="px-3 py-2 rounded-lg text-sm bg-white shadow-sm">Insights</button>
        <button onClick={() => onNavigate("settings")} className="px-3 py-2 rounded-lg text-sm bg-white shadow-sm">Settings</button>
      </nav>
      <div className="md:hidden">
        <select className="rounded-lg p-2" onChange={(e) => onNavigate(e.target.value)} defaultValue="dashboard">
          <option value="dashboard">🏠 Home</option>
          <option value="insights">📈 Insights</option>
          <option value="history">📜 History</option>
          <option value="settings">⚙️ Settings</option>
        </select>
      </div>
    </header>
  );
}

// src/App.jsx
// Updated to persist history to Firestore (on reset) and fetch remote history on load.
// Keeps LocalStorage as primary fast source — Firestore is optional and acts as remote backup.
import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import CoffeeCard from "./components/CoffeeCard";
import CodingCard from "./components/CodingCard";
import MoodCard from "./components/MoodCard";
import AddCoffeeModal from "./components/modals/AddCoffeeModal";
import LogCodingModal from "./components/modals/LogCodingModal";
import Insights from "./pages/Insights";
import History from "./pages/History";
import Settings from "./pages/Settings";

import { initFirebase, addHistoryEntry, fetchHistory } from "./firebase";

const defaultToday = { cups: 0, codingMinutes: 0, mood: "😐" };

export default function App() {
  const [view, setView] = useState("dashboard");
  const [today, setToday] = useState(() => {
    const raw = localStorage.getItem("ctc_today");
    return raw ? JSON.parse(raw) : defaultToday;
  });
  const [history, setHistory] = useState(() => {
    const raw = localStorage.getItem("ctc_history");
    return raw ? JSON.parse(raw) : [];
  });

  const [showAddCoffee, setShowAddCoffee] = useState(false);
  const [showLogCoding, setShowLogCoding] = useState(false);

  // Initialize Firebase (optional)
  useEffect(() => {
    initFirebase();
  }, []);

  // On mount -> try to fetch remote history and merge
  useEffect(() => {
    let mounted = true;
    async function loadRemote() {
      try {
        const remote = await fetchHistory();
        if (!mounted) return;
        if (remote && remote.length > 0) {
          // Map remote entries to local shape and merge without duplicates
          const normalized = remote.map(r => ({
            id: r.id,
            date: r.date || r.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            cups: r.cups ?? 0,
            codingMinutes: r.codingMinutes ?? 0,
            mood: r.mood ?? "😐",
            notes: r.notes ?? ""
          }));

          // Merge preferring local (history array already has locally saved items)
          const merged = [...normalized, ...history].slice(0, 500);
          setHistory(merged);
        }
      } catch (e) {
        console.warn("Remote history load skipped:", e);
      }
    }
    loadRemote();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once

  useEffect(() => localStorage.setItem("ctc_today", JSON.stringify(today)), [today]);
  useEffect(() => localStorage.setItem("ctc_history", JSON.stringify(history)), [history]);

  function addCoffee(size, note = "") {
    const delta = size === "Small" ? 1 : size === "Medium" ? 1.5 : 2;
    setToday(t => ({ ...t, cups: +(t.cups + delta).toFixed(1) }));
    setShowAddCoffee(false);
  }

  function logCoding(minutes, type = "Feature", note = "") {
    setToday(t => ({ ...t, codingMinutes: t.codingMinutes + Number(minutes) }));
    setShowLogCoding(false);
  }

  function setMood(m) {
    setToday(t => ({ ...t, mood: m }));
  }

  async function resetToday() {
    // create a snapshot to persist
    const entry = {
      date: new Date().toISOString(),
      cups: today.cups,
      codingMinutes: today.codingMinutes,
      mood: today.mood,
      notes: ""
    };

    // Add to local state first for snappy UI
    setHistory(h => [entry, ...h]);

    // Try to persist to Firestore (optional)
    try {
      await addHistoryEntry(entry);
      // no-op (we keep local regardless)
    } catch (e) {
      console.warn("Could not persist history to Firestore:", e);
    }

    // Reset today's counters locally
    setToday(defaultToday);
  }

  function clearHistory() {
    setHistory([]);
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-xl mx-auto">
        <Header onNavigate={setView} view={view} />
        {view === "dashboard" && (
          <main className="space-y-4 mt-6">
            <div className="grid grid-cols-1 gap-4">
              <CoffeeCard
                cups={today.cups}
                onAdd={() => setShowAddCoffee(true)}
              />
              <CodingCard
                minutes={today.codingMinutes}
                onLog={() => setShowLogCoding(true)}
              />
              <MoodCard mood={today.mood} setMood={setMood} />
            </div>

            <div className="flex gap-3 mt-3">
              <button
                onClick={() => { resetToday(); }}
                className="flex-1 bg-amber-100 text-coffee-700 rounded-xl py-3 shadow-sm text-sm"
              >
                ☀️ Wrap up today
              </button>
              <button
                onClick={() => setView("insights")}
                className="flex-1 bg-coffee-700 text-white rounded-xl py-3 shadow-sm text-sm"
              >
                📈 Insights
              </button>
            </div>
          </main>
        )}

        {view === "insights" && <Insights onBack={() => setView("dashboard")} />}
        {view === "history" && <History history={history} onBack={() => setView("dashboard")} />}
        {view === "settings" && <Settings resetToday={() => setToday(defaultToday)} clearHistory={clearHistory} onBack={() => setView("dashboard")} />}

        <AddCoffeeModal open={showAddCoffee} onClose={() => setShowAddCoffee(false)} onAdd={addCoffee} />
        <LogCodingModal open={showLogCoding} onClose={() => setShowLogCoding(false)} onSave={logCoding} />
      </div>
    </div>
  );
}

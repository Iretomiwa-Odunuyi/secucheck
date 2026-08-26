import { useState } from "react";
import Home from "./components/Home.jsx";
import SubmitFlow from "./components/SubmitFlow.jsx";
import Dashboard from "./components/Dashboard.jsx";
import "./App.css";

export default function App() {
  const [view, setView] = useState("home");

  return (
    <div className="app">
      <header className="app-header">
        <h1 onClick={() => setView("home")} style={{ cursor: "pointer" }}>
          SecuCheck
        </h1>
        <nav>
          <button className={view === "submit" ? "active" : ""} onClick={() => setView("submit")}>
            Check Something
          </button>
          <button className={view === "dashboard" ? "active" : ""} onClick={() => setView("dashboard")}>
            School Dashboard
          </button>
        </nav>
      </header>

      <main>
        {view === "home" && <Home onStart={() => setView("submit")} />}
        {view === "submit" && <SubmitFlow />}
        {view === "dashboard" && <Dashboard />}
      </main>
    </div>
  );
}
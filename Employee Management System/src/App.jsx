import { useState } from "react";
import Layout from "./Components/Layout";
import Dashboard from "./Components/Dashboard";
import Login from "./Components/Login";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [currentPage, setCurrentPage] = useState("dashboard");

  // Show Login page if not logged in
  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <Layout
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      onLogout={() => setIsLoggedIn(false)}
    >
      {currentPage === "dashboard" && <Dashboard />}

      {currentPage === "employees" && (
        <div className="placeholder-page">
          <div className="placeholder-card">
            <h2>👥 Employee List</h2>
            <p className="placeholder-subtitle">
              Scheduled for <strong>Day 5 & 6</strong>:
            </p>
            <ul>
              <li><strong>Day 5:</strong> Create Employee List page using dummy data &amp; <code>map()</code></li>
              <li><strong>Day 6:</strong> Create reusable Employee Card/Table components with <code>Props</code></li>
            </ul>
            <button className="primary-btn" onClick={() => setCurrentPage("dashboard")}>
              ← Back to Dashboard
            </button>
          </div>
        </div>
      )}

      {currentPage === "departments" && (
        <div className="placeholder-page">
          <div className="placeholder-card">
            <h2>🏢 Departments</h2>
            <p className="placeholder-subtitle">Department organization and management modules.</p>
            <button className="primary-btn" onClick={() => setCurrentPage("dashboard")}>
              ← Back to Dashboard
            </button>
          </div>
        </div>
      )}

      {currentPage === "settings" && (
        <div className="placeholder-page">
          <div className="placeholder-card">
            <h2>⚙️ System Settings</h2>
            <p className="placeholder-subtitle">Configure application preferences and user permissions.</p>
            <button className="primary-btn" onClick={() => setCurrentPage("dashboard")}>
              ← Back to Dashboard
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default App;
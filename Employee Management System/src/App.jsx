import { useState } from "react";
import Header from "./Components/Header";
import Sidebar from "./Components/Sidebar";
import Dashboard from "./Components/Dashboard";
import "./App.css";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleMenuClick = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="app-container">
      {/* Header */}
      <Header onMenuClick={handleMenuClick} />

      <div className="main-layout">
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onMenuClick={handleMenuClick}
        />

        {/* Main Content */}
        <main className="content">
          <Dashboard />
        </main>
      </div>
    </div>
  );
}

export default App;
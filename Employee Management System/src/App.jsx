
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import AppRoutes from './Routers/AppRoutes';
import Header from './Components/Header';
import Sidebar from './Components/Sidebar';

const App = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const publicPaths = ["/", "/login", "/register"];
  const shouldShowLayout = !publicPaths.includes(location.pathname);

  useEffect(() => {
    document.body.classList.toggle("sidebar-is-open", sidebarOpen);

    return () => document.body.classList.remove("sidebar-is-open");
  }, [sidebarOpen]);

  if (!shouldShowLayout) {
    return <AppRoutes />;
  }

  return (
    <div className="app-container">
      <Header onMenuToggle={() => setSidebarOpen((isOpen) => !isOpen)} />

      <div className="main-layout">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        {sidebarOpen && (
          <button
            className="sidebar-overlay"
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="content">
          <AppRoutes />
        </main>
      </div>
    </div>
  );
};

export default App;
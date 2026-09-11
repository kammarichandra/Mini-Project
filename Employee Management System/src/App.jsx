
import { useLocation } from "react-router-dom";
import AppRoutes from './Routers/AppRoutes';
import Header from './Components/Header';
import Sidebar from './Components/Sidebar';

const App = () => {
  const location = useLocation();
  const shouldShowLayout = location.pathname !== "/login" && location.pathname !== "/";

  if (!shouldShowLayout) {
    return <AppRoutes />;
  }

  return (
    <div className="app-container">
      <Header />

      <div className="main-layout">
        <Sidebar />

        <main className="content">
          <AppRoutes />
        </main>
      </div>
    </div>
  );
};

export default App;
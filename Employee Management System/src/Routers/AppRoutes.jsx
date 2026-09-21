import { Navigate, Route, Routes } from "react-router-dom";
import Login from "../Pages/Login";
import DashboardPage from "../Pages/DashboardPage";
import Users from "../Pages/Employees";
import Settings from "../Pages/Settings";
import ProtectedRoute from "../Components/Protectedroute";
import Performance from "../Pages/Performance";
import Reports from "../Pages/Reports";
import Leave_Managment from "../Pages/Leave_Managment";
import Attendance from "../Pages/Attendance";
import Payroll from "../Pages/Payroll";
import Home from "../Pages/Home";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/Employees"
        element={
          <ProtectedRoute>
            <Users />
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />



      <Route
        path="/payroll"
        element={
          <ProtectedRoute>
            <Payroll />
          </ProtectedRoute>
        }
      />

      <Route
        path="/performance"
        element={
          <ProtectedRoute>
            <Performance />
          </ProtectedRoute>
        }
      />

      <Route
        path="/Reports"
        element={
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        }
      />

      <Route
        path="/Leave_Management"
        element={
          <ProtectedRoute>
            <Leave_Managment />
          </ProtectedRoute>
        }
      />

      <Route
        path="/Attendance"
        element={
          <ProtectedRoute>
            <Attendance />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;

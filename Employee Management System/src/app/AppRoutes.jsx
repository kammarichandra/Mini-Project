import { Navigate, Route, Routes } from "react-router-dom";
import Attendance from "@/features/attendance/Attendance";
import DashboardPage from "@/features/dashboard/DashboardPage";
import Users from "@/features/employees/Employees";
import Home from "@/features/home/Home";
import Login from "@/features/auth/LoginPage";
import LeaveManagement from "@/features/leave/LeaveManagement";
import Payroll from "@/features/payroll/Payroll";
import Performance from "@/features/performance/Performance";
import Recruitment from "@/features/recruitment/Recruitment";
import Reports from "@/features/reports/Reports";
import Register from "@/features/auth/RegisterPage";
import Settings from "@/features/settings/Settings";
import Welcome from "@/features/welcome/Welcome";
import ProtectedRoute from "@/shared/components/ProtectedRoute";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/welcome"
        element={
          <ProtectedRoute>
            <Welcome />
          </ProtectedRoute>
        }
      />

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
        path="/Candidates"
        element={
          <ProtectedRoute>
            <Recruitment />
          </ProtectedRoute>
        }
      />

      <Route
        path="/Interviews"
        element={
          <ProtectedRoute>
            <Recruitment />
          </ProtectedRoute>
        }
      />

      <Route
        path="/Hiring"
        element={
          <ProtectedRoute>
            <Recruitment />
          </ProtectedRoute>
        }
      />

      <Route
        path="/Leave_Management"
        element={
          <ProtectedRoute>
            <LeaveManagement />
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

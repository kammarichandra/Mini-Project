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
import TechnicalLeadPage from "@/features/technical-lead/TechnicalLeadPage";
import Welcome from "@/features/welcome/Welcome";
import ProtectedRoute from "@/shared/components/ProtectedRoute";
import { getCurrentUser, normalizeRole } from "@/shared/utils/auth";

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
        path="/payroll/*"
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
            <RolePage technicalLeadPage="performance">
              <Performance />
            </RolePage>
          </ProtectedRoute>
        }
      />

      <Route
        path="/Reports"
        element={
          <ProtectedRoute>
            <RolePage technicalLeadPage="reports">
              <Reports />
            </RolePage>
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-team"
        element={<ProtectedRoute><TechnicalLeadPage page="team" /></ProtectedRoute>}
      />
      <Route
        path="/projects"
        element={<ProtectedRoute><TechnicalLeadPage page="projects" /></ProtectedRoute>}
      />
      <Route
        path="/tasks"
        element={<ProtectedRoute><TechnicalLeadPage page="tasks" /></ProtectedRoute>}
      />
      <Route
        path="/code-reviews"
        element={<ProtectedRoute><TechnicalLeadPage page="reviews" /></ProtectedRoute>}
      />
      <Route
        path="/bug-tracking"
        element={<ProtectedRoute><TechnicalLeadPage page="bugs" /></ProtectedRoute>}
      />
      <Route
        path="/sprint-planning"
        element={<ProtectedRoute><TechnicalLeadPage page="sprint" /></ProtectedRoute>}
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

function RolePage({ technicalLeadPage, children }) {
  const role = normalizeRole(getCurrentUser()?.role);
  return role === "Technical Lead"
    ? <TechnicalLeadPage page={technicalLeadPage} />
    : children;
}

export default AppRoutes;

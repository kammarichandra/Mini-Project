import Dashboard from "@/shared/components/Dashboard";
import TechnicalLeadPage from "@/features/technical-lead/TechnicalLeadPage";
import { getCurrentUser, normalizeRole } from "@/shared/utils/auth";

function DashboardPage() {
  if (normalizeRole(getCurrentUser()?.role) === "Technical Lead") {
    return <TechnicalLeadPage page="dashboard" />;
  }

  return (
    <Dashboard />
  );
}

export default DashboardPage;
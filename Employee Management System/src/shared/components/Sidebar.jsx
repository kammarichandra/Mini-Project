import { NavLink } from "react-router-dom";
import logo from "@/assets/logo1.png";
import { getCurrentUser, hasRoleAccess, logoutUser, normalizeRole,} from "@/shared/utils/auth";

const Sidebar = ({ isOpen, onClose }) => {
  const role = normalizeRole(getCurrentUser()?.role);
  const payrollLinks = role === "Payroll"
    ? [
        ["/Payroll/dashboard", "fa-gauge-high", "Payroll Dashboard"],
        ["/Payroll/salaries", "fa-money-bill-wave", "Employee Salaries"],
        ["/Payroll/process", "fa-calculator", "Process Payroll"],
        ["/Payroll/payslips", "fa-file-invoice-dollar", "Payslips"],
        ["/Payroll/history", "fa-clock-rotate-left", "Payroll History"],
        ["/Payroll/reports", "fa-chart-column", "Payroll Reports"],
      ]
    : [["/Payroll", "fa-credit-card", "Payroll"]];
  const links = [
    ["/dashboard", "fa-gauge-high", "Dashboard"],
    ["/Employees", "fa-user", "Employees"],
    ["/settings", "fa-gear", "Settings"],
    ["/Leave_Management", "fa-plane-circle-xmark", "Leave Management"],
    ["/Attendance", "fa-calendar", "Attendance"],
    ["/performance", "fa-arrow-trend-up", "Performance"],
    ...payrollLinks,
    ["/Reports", "fa-file", "Reports"],
    ["/Candidates", "fa-user-plus", "Candidates"],
    ["/Interviews", "fa-calendar-check", "Interviews"],
    ["/Hiring", "fa-briefcase", "Hiring"],
  ];

  return (
    <aside className={`sidebar${isOpen ? " sidebar-open" : ""}`} id="main-navigation">
      <div className="sidebar-brand">
        <img className="sidebar-brand-logo" src={logo} alt="TeamSync logo" />
        <span>TeamSync</span>
       
      </div>

      <nav className="sidebar-nav" aria-label="Main navigation" onClick={onClose}>
        {links.filter(([path]) => hasRoleAccess(role, path)).map(([path, icon, label]) => (
          <NavLink key={path} to={path} className={({ isActive }) => (isActive ? "active" : "")}>
            <span><i className={`fa-solid ${icon}`}></i></span> {role === "Employee" && path === "/Payroll" ? "Payslips" : role === "Finance" && path === "/Payroll" ? "Salary & Payroll" : label}
          </NavLink>
        ))}
      </nav>

      <NavLink to="/" className="sidebar-logout" onClick={logoutUser}>
        <span><i className="fa-solid fa-arrow-right-from-bracket"></i></span> Logout
      </NavLink>
    </aside>
  );
};

export default Sidebar;
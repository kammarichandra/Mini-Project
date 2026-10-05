import { NavLink } from "react-router-dom";
import logo from "../assets/logo1.png";
import {
  getCurrentUser,
  getRoleHomePath,
  hasRoleAccess,
  normalizeRole,
} from "../utils/auth";
import "../welcome.css";

const workspaceLinks = [
  {
    path: "/Employees",
    icon: "fa-people-group",
    title: "Meet your team",
    description: "Browse employee profiles, roles and departments.",
  },
  {
    path: "/Attendance",
    icon: "fa-calendar-check",
    title: "Attendance",
    description: "Keep track of attendance and daily work schedules.",
  },
  {
    path: "/Leave_Management",
    icon: "fa-plane-circle-xmark",
    title: "Leave management",
    description: "Review time-off requests and leave information.",
  },
  {
    path: "/performance",
    icon: "fa-arrow-trend-up",
    title: "Performance",
    description: "Support growth with performance tracking.",
  },
  {
    path: "/payroll",
    icon: "fa-credit-card",
    title: "Payroll",
    description: "Open payroll tools and compensation records.",
  },
  {
    path: "/Reports",
    icon: "fa-chart-column",
    title: "Reports",
    description: "Explore clear insights about your workforce.",
  },
  {
    path: "/settings",
    icon: "fa-gear",
    title: "Settings",
    description: "Manage your TeamSync workspace preferences.",
  },
  {
    path: "/Candidates",
    icon: "fa-user-plus",
    title: "Candidates",
    description: "Open candidate tracking.",
  },
  {
    path: "/Interviews",
    icon: "fa-calendar-check",
    title: "Interviews",
    description: "Open interview coordination.",
  },
  {
    path: "/Hiring",
    icon: "fa-briefcase",
    title: "Hiring",
    description: "Open hiring management.",
  },
  {
    path: "/dashboard",
    icon: "fa-gauge-high",
    title: "Dashboard",
    description: "See a snapshot of your team and recent activity.",
  },
];

function Welcome() {
  const role = normalizeRole(getCurrentUser()?.role);
  const visibleLinks = workspaceLinks.filter(({ path }) =>
    hasRoleAccess(role, path)
  );
  const firstLink = getRoleHomePath(role);
  const primaryLabel = role === "Employee" ? "Open my profile" : "Open workspace";

  return (
    <div className="welcome-page">
      <header className="welcome-header">
        <div className="welcome-brand">
          <img src={logo} alt="TeamSync logo" />
          <span>
            <strong>TeamSync</strong>
            <small>PEOPLE · WORK · TOGETHER</small>
          </span>
        </div>
      </header>

      <section className="welcome-hero" aria-labelledby="welcome-title">
        <div className="welcome-hero-copy">
          <span className="welcome-eyebrow">
            <i className="fa-solid fa-sparkles" aria-hidden="true"></i>
            YOUR PEOPLE-FIRST WORKSPACE
          </span>
          <h1 id="welcome-title">Welcome to TeamSync</h1>
          <p>
            Your team, tools and day-to-day people operations are all together
            in one place. Let’s make today a great one.
          </p>
          <NavLink className="welcome-primary" to={firstLink}>
            {primaryLabel}
            <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
          </NavLink>
        </div>
        <div className="welcome-hero-art" aria-hidden="true">
          <div className="welcome-orbit welcome-orbit-outer"></div>
          <div className="welcome-orbit welcome-orbit-inner"></div>
          <div className="welcome-hero-icon">
            <i className="fa-solid fa-people-group"></i>
          </div>
          <div className="welcome-hero-note">
            <i className="fa-solid fa-heart"></i>
            Great teams grow together
          </div>
        </div>
      </section>

      <section className="welcome-workspace" aria-labelledby="workspace-title">
        <div className="welcome-section-heading">
          <div>
            <span className="welcome-section-kicker">YOUR WORKSPACE</span>
            <h2 id="workspace-title">Where would you like to go?</h2>
          </div>
          <p>Choose a space to get started.</p>
        </div>
        <div className="welcome-link-grid">
          {visibleLinks.map(({ path, icon, title, description }) => (
            <NavLink className="welcome-link-card" key={path} to={path}>
              <span className="welcome-link-icon">
                <i className={`fa-solid ${icon}`} aria-hidden="true"></i>
              </span>
              <span className="welcome-link-copy">
                <strong>{title}</strong>
                <span>{description}</span>
              </span>
              <i className="fa-solid fa-arrow-right welcome-link-arrow" aria-hidden="true"></i>
            </NavLink>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Welcome;

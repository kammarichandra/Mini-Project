import { NavLink } from "react-router-dom";
import logo from "../assets/logo1.png";

const Sidebar = ({ isOpen, onClose }) => {
  return (
    <aside className={`sidebar${isOpen ? " sidebar-open" : ""}`} id="main-navigation">
      <div className="sidebar-brand">
        <img className="sidebar-brand-logo" src={logo} alt="TeamSync logo" />
        <span>TeamSync</span>
       
      </div>

      <nav className="sidebar-nav" aria-label="Main navigation" onClick={onClose}>
        <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "active" : "") }>
          <span><i className="fa-solid fa-gauge-high"></i></span> Dashboard
        </NavLink>

        <NavLink to="/Employees" className={({ isActive }) => (isActive ? "active" : "") }>
          <span><i className="fa-regular fa-user"></i></span> Employees
        </NavLink>

        <NavLink to="/settings" className={({ isActive }) => (isActive ? "active" : "") }>
          <span><i className="fa-solid fa-gear"></i></span> Settings
        </NavLink>

        <NavLink to="/Leave_Management" className={({ isActive }) => (isActive ? "active" : "") }>
          <span><i className="fa-solid fa-plane-circle-xmark"></i></span> Leave Management
        </NavLink>

        <NavLink to="/Attendance" className={({ isActive }) => (isActive ? "active" : "") }>
          <span><i className="fa-regular fa-calendar"></i></span> Attendance
        </NavLink>

        <NavLink to="/performance" className={({ isActive }) => (isActive ? "active" : "") }>
          <span><i className="fa-solid fa-arrow-trend-up"></i></span> Performance
        </NavLink>

        <NavLink to="/Payroll" className={({ isActive }) => (isActive ? "active" : "") }>
          <span><i className="fa-regular fa-credit-card"></i></span> Payroll
        </NavLink>

        <NavLink to="/Reports" className={({ isActive }) => (isActive ? "active" : "") }>
          <span><i className="fa-regular fa-file"></i></span> Reports
        </NavLink>
      </nav>

      <NavLink to="/login" className="sidebar-logout" onClick={() => localStorage.removeItem("isLoggedIn")}>
        <span><i className="fa-solid fa-arrow-right-from-bracket"></i></span> Logout
      </NavLink>
    </aside>
  );
};

export default Sidebar;
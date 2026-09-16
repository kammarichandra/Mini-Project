import { NavLink } from "react-router-dom";

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <nav>
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
          <span><i class="fa-solid fa-plane-circle-xmark"></i></span> Leave Management
        </NavLink>

        <NavLink to="/Attendance" className={({ isActive }) => (isActive ? "active" : "") }>
          <span><i class="fa-regular fa-calendar"></i></span> Attendance
        </NavLink>

        <NavLink to="/performance" className={({ isActive }) => (isActive ? "active" : "") }>
          <span><i class="fa-solid fa-arrow-trend-up"></i></span> Performance
        </NavLink>

        <NavLink to="/Payroll" className={({ isActive }) => (isActive ? "active" : "") }>
          <span><i class="fa-regular fa-credit-card"></i></span> Payroll
        </NavLink>

        <NavLink to="/Reports" className={({ isActive }) => (isActive ? "active" : "") }>
          <span><i class="fa-regular fa-file"></i></span> Reports
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
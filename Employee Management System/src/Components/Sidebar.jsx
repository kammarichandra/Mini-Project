import { NavLink } from "react-router-dom";

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <nav>
        <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "active" : "") }>
          <span><i className="fa-solid fa-gauge-high"></i></span> Dashboard
        </NavLink>

        <NavLink to="/users" className={({ isActive }) => (isActive ? "active" : "") }>
          <span><i className="fa-regular fa-user"></i></span> Users
        </NavLink>

        <NavLink to="/settings" className={({ isActive }) => (isActive ? "active" : "") }>
          <span><i className="fa-solid fa-gear"></i></span> Settings
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
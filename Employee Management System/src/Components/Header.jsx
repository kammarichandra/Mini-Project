import { useNavigate } from "react-router-dom";
import { getCurrentUser, logoutUser } from "../utils/auth";
import { getEmployeeInitials } from "../utils/employees";
import Notifications from "./Notifications";

function Header({ onMenuToggle }) {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const displayName = user?.fullName || user?.email?.split("@")[0] || "User";
  const avatarInitials = getEmployeeInitials(
    displayName.replace(/[._-]+/g, " ")
  );

  return (
    <header className="app-header">
      <button
        className="menu-toggle"
        type="button"
        onClick={onMenuToggle}
        aria-label="Toggle navigation menu"
        aria-controls="main-navigation"
      >
        <i className="fa-solid fa-bars" aria-hidden="true"></i>
      </button>
      <label className="global-search">
        <i className="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
        <input type="search" placeholder="Search..." aria-label="Search" />
      </label>

      <div className="header-user">
        <Notifications user={user} />
        <div className="header-avatar" aria-label={`${displayName} profile`}>
          {avatarInitials}
        </div>
        <div className="header-user-copy">
          <strong>{displayName}</strong>
          <small>{user?.role || "Employee"}</small>
        </div>
        <button className="user-menu-button" type="button" onClick={() => { logoutUser(); navigate("/", { replace: true }); }} aria-label="Log out">
          <i className="fa-solid fa-chevron-down" aria-hidden="true"></i>
        </button>
      </div>
    </header>
  );
}

export default Header;
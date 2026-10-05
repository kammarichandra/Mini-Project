import { useNavigate } from "react-router-dom";
import { getCurrentUser, logoutUser } from "../utils/auth";

function Header({ onMenuToggle }) {
  const navigate = useNavigate();
  const user = getCurrentUser();

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
        <button className="icon-button" type="button" aria-label="Notifications">
          <i className="fa-regular fa-bell" aria-hidden="true"></i>
        </button>
        <div className="header-avatar">CS</div>
        <div className="header-user-copy">
          <strong>{user?.fullName || "User"}</strong>
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
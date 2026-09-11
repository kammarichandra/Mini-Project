import { useNavigate } from "react-router-dom";
import logo from "../assets/logo1.png";

function Header() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");
    navigate("/login", { replace: true });
  };

  return (
    <header className="app-header d-flex justify-content-between align-items-center px-4">
      <div className="d-flex align-items-center">
        <img src={logo} className="header-logo" alt="TeamSync logo" />

        <div className="brand-info ms-2">
          <h4 className="mb-0">TeamSync</h4>
          <small>emphasizes team management</small>
        </div>
      </div>

      <div className="user-section d-flex align-items-center gap-3">
        <span>Welcome, User</span>

        <div className="user-avatar">U</div>

        <button type="button" className="btn btn-outline-light btn-sm" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}

export default Header;
function Header({ onMenuClick }) {
  return (
    <header className="app-header">
      <div className="d-flex align-items-center">
        <button
          className="btn menu-button"
          onClick={onMenuClick}
          aria-label="Toggle sidebar"
        >
          ☰
        </button>

        <h4 className="mb-0 ms-2">React Dashboard</h4>
      </div>

      <div className="user-section">
        <span className="me-2">Welcome, User</span>

        <div className="user-avatar">
          U
        </div>
      </div>
    </header>
  );
}

export default Header;
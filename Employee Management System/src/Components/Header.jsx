function Header({ onLogout }) {
  return (
    <header className="header">
      <div className="header-brand">
        <span className="logo-icon">🏢</span>
        <h2>Employee Management System</h2>
      </div>
      <div className="header-user">
        <span className="user-greeting">👤 Admin</span>
        {onLogout && (
          <button className="logout-btn" onClick={onLogout}>
            Logout
          </button>
        )}
      </div>
    </header>
  );
}

export default Header;
function Sidebar({ isOpen, onMenuClick }) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={onMenuClick}
        ></div>
      )}

      <aside className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-header">
          <h5>Menu</h5>
        </div>

        <nav>
          <ul className="sidebar-menu">
            <li>
              <a href="#" className="active">
                🏠 Dashboard
              </a>
            </li>

            <li>
              <a href="#">
                👤 Users
              </a>
            </li>

            <li>
              <a href="#">
                📦 Products
              </a>
            </li>

            <li>
              <a href="#">
                🛒 Orders
              </a>
            </li>

            <li>
              <a href="#">
                📊 Reports
              </a>
            </li>

            <li>
              <a href="#">
                ⚙️ Settings
              </a>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;
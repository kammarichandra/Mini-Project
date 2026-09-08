import Header from "./Header";
import Sidebar from "./Sidebar";

function Layout({ children, currentPage, setCurrentPage, onLogout }) {
  return (
    <div className="layout">
      <Header onLogout={onLogout} />

      <div className="main-section">
        <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />

        <main className="content">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;
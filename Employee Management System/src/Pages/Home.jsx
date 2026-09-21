import { useNavigate } from "react-router-dom";
import logo from "../assets/logo1.png";
import "../Home.css";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="teamsync-home">
      <header className="home-nav">
        <button className="home-brand" type="button" onClick={() => navigate("/")}>
          <img src={logo} alt="TeamSync logo" />
          <strong>TeamSync</strong>
        </button>
        <nav>
          <a href="#features">Features</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </nav>
        <div className="home-nav-actions">
          <button className="nav-login" onClick={() => navigate("/login")}>Login</button>
          <button className="nav-start" onClick={() => navigate("/login")}>Get Started</button>
        </div>
      </header>

      <main>
        <section className="home-hero">
          <div className="hero-copy">
            <span className="hero-label">SMART HR · SIMPLE WORKFLOWS</span>
            <h1>Empowering Your People.<br /><span>Building a Better Tomorrow.</span></h1>
            <p>All-in-one HR software to manage your workforce, simplify HR processes, and help your team grow.</p>
            <div className="hero-buttons"><button className="get-started" onClick={() => navigate("/login")}>Get Started <span>→</span></button><button className="learn-more"><span>▷</span> Watch Demo</button></div>
          </div>
          <div className="hero-photo">
            <img src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1000&q=85" alt="A team collaborating around a table" />
            <div className="photo-badge photo-brand"><img src={logo} alt="" /><span><strong>TeamSync</strong><small>People-first HR</small></span></div>
            <div className="photo-badge team-count"><strong>✓ &nbsp;128 team members</strong><small>Connected and growing</small></div>
          </div>
        </section>

        <section className="feature-strip" id="features">
          {[['fa-user-group', 'Employee Management'], ['fa-calendar-check', 'Leave & Attendance'], ['fa-bullseye', 'Performance Tracking'], ['fa-shield-halved', 'Secure & Scalable']].map(([icon, title]) => <div className="strip-item" key={title}><span><i className={`fa-solid ${icon}`}></i></span><div><strong>{title}</strong><small>Simple and efficient</small></div></div>)}
        </section>

        <section className="home-features" id="about">
          <span className="section-kicker">ONE PLATFORM</span><h2>Everything your HR team needs</h2><p>A simple, connected workspace for people, processes and progress.</p>
          <div className="feature-grid">
            {[['fa-users', 'People Management', 'Keep employee profiles, departments and roles organized in one place.'], ['fa-clock', 'Attendance & Leave', 'Track attendance, leave balances and approvals with less admin work.'], ['fa-chart-column', 'Reports & Insights', 'Turn everyday HR data into clear, useful reports for your team.']].map(([icon, title, text]) => <article className="feature-panel" key={title}><span><i className={`fa-solid ${icon}`}></i></span><h3>{title}</h3><p>{text}</p></article>)}
          </div>
        </section>

        <section className="home-cta" id="contact"><div><span className="section-kicker">BUILT FOR PEOPLE</span><h2>Make HR simpler for everyone.</h2><p>Give managers and employees one friendly place to work together.</p></div><button className="nav-start" onClick={() => navigate("/login")}>Start with TeamSync&nbsp; →</button></section>
      </main>

      <footer className="home-footer">
        <span>© 2026 TeamSync · People operations made simple.</span><div><a href="#contact">Privacy</a><a href="#contact">Terms</a><a href="#contact">Help</a></div>
      </footer>

    </div>
  );
}

export default Home;
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo1.png";
import { getCurrentUser, getRoleHomePath } from "@/shared/utils/auth";
import "./Home.css";

function Home() {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [contactStatus, setContactStatus] = useState("");

  useEffect(() => {
    const currentUser = getCurrentUser();

    if (currentUser) {
      navigate(getRoleHomePath(currentUser.role), { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const timerId = window.setInterval(() => setCurrentTime(new Date()), 1000);
    return () => window.clearInterval(timerId);
  }, []);

  if (getCurrentUser()) {
    return null;
  }

  const formattedDate = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(currentTime);
  const formattedTime = new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(currentTime);

  const updateContactField = (event) => {
    const { name, value } = event.target;
    setContactForm((current) => ({ ...current, [name]: value }));
    setContactStatus("");
  };

  const handleContactSubmit = (event) => {
    event.preventDefault();
    const name = contactForm.name.trim();
    const email = contactForm.email.trim();
    const message = contactForm.message.trim();

    if (!name || !email || !message) {
      setContactStatus("Please complete each field before continuing.");
      return;
    }

    const subject = `TeamSync website enquiry from ${name}`;
    const body = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;
    const mailtoUrl = `mailto:support@teamsync.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    setContactStatus(
      "Your email app is opening with your message. Send the email there to complete your enquiry."
    );
    window.location.href = mailtoUrl;
  };

  return (
    <div className="teamsync-home">
      <header className="home-nav">
        <a className="home-brand" href="#home">
          <img src={logo} alt="TeamSync logo" />
          <strong>TeamSync</strong>
        </a>
        <nav aria-label="Main navigation">
          <a href="#home">Home</a>
          <a href="#services">Services</a>
          <a href="#features">Features</a>
          <a href="#about">About Us</a>
        </nav>
        <div className="home-nav-actions">
          <button className="nav-login" type="button" onClick={() => navigate("/login")}>Login</button>
          <button className="nav-start" type="button" onClick={() => navigate("/register")}>Get Started</button>
        </div>
      </header>

      <main>
        <section className="home-hero" id="home">
          <div className="hero-copy">
            <span className="hero-label">PEOPLE-FIRST HR · ONE SIMPLE WORKSPACE</span>
            <h1>Bring your people<br /><span>and work in sync.</span></h1>
            <p>Manage your team, attendance, and everyday HR tasks in one clear, easy-to-use place.</p>
            <div className="hero-buttons"><button className="get-started" type="button" onClick={() => navigate("/register")}>Get started <span>→</span></button><a className="learn-more" href="#features"><span aria-hidden="true">↓</span> Explore features</a></div>
            <div className="home-live-note"><span aria-hidden="true"></span> A calmer way to handle the workday</div>
          </div>
          <div className="hero-photo">
            <img src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1000&q=85" alt="A team collaborating around a table" />
            <div className="photo-badge photo-brand"><img src={logo} alt="" /><span><strong>TeamSync</strong><small>People-first HR</small></span></div>
            <div className="photo-badge team-count" role="timer" aria-label={`Current local time ${formattedTime}`}>
              <span className="live-indicator" aria-hidden="true"></span>
              <strong>{formattedTime}</strong>
              <small>{formattedDate} · Your local time</small>
            </div>
          </div>
        </section><br />

        {/* <section className="feature-strip" id="features">
          {[['fa-user-group', 'Employee Management'], ['fa-calendar-check', 'Leave & Attendance'], ['fa-bullseye', 'Performance Tracking'], ['fa-shield-halved', 'Secure & Scalable']].map(([icon, title]) => <div className="strip-item" key={title}><span><i className={`fa-solid ${icon}`}></i></span><div><strong>{title}</strong><small>Simple and efficient</small></div></div>)}
        </section> */}

        <section className="home-services" id="services">
          <div className="home-section-heading">
            <span className="section-kicker">TEAMSYNC SERVICES</span>
            <h2>Essential people operations, together</h2>
            <p>Explore the tools that help your organization manage the employee journey.</p>
          </div>
          <div className="feature-grid">
            {[
              ["fa-users", "Employee management", "Organize employee profiles, roles, departments, and workplace details."],
              ["fa-calendar-check", "Attendance", "Review daily attendance, work hours, and team availability."],
              ["fa-money-check-dollar", "Payroll", "Manage payroll information and make payslip details easier to access."],
              ["fa-umbrella-beach", "Leave management", "Submit, review, and keep track of employee leave requests."],
              ["fa-chart-line", "Performance", "Keep performance reviews and progress information in one workspace."],
            ].map(([icon, title, text]) => (
              <article className="feature-panel service-panel" key={title}>
                <span><i className={`fa-solid ${icon}`} aria-hidden="true"></i></span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="home-features" id="features">
          <div className="home-section-heading">
            <span className="section-kicker">WHY TEAMSYNC</span>
            <h2>Less switching. More clarity.</h2>
            <p>Useful functionality for the people behind every workday.</p>
          </div>
          <div className="feature-grid home-benefits-grid">
            {[
              ["fa-layer-group", "One connected workspace", "Bring core employee and HR workflows together instead of spreading everyday tasks across disconnected tools."],
              ["fa-eye", "Clearer day-to-day visibility", "Find attendance, leave, employee, and payroll information in the relevant parts of the workspace."],
              ["fa-user-shield", "Access that fits your role", "Role-based access helps admins, HR, managers, and employees reach the areas intended for them."],
            ].map(([icon, title, text]) => (
              <article className="feature-panel" key={title}>
                <span><i className={`fa-solid ${icon}`} aria-hidden="true"></i></span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="home-about" id="about">
          <span className="section-kicker">ABOUT TEAMSYNC</span>
          <h2>A practical employee management system for everyday work.</h2>
          <p>
            TeamSync brings employee information and essential HR workflows
            into one approachable system. It helps administrators and HR teams
            manage records, while giving managers and employees a shared place
            to take care of day-to-day people operations.
          </p>
        </section>

        <section className="home-get-started" aria-labelledby="home-get-started-title">
          <div>
            <span className="section-kicker">READY WHEN YOU ARE</span>
            <h2 id="home-get-started-title">Bring your team into sync.</h2>
            <p>Create an account or sign in to access your TeamSync workspace.</p>
          </div>
          <div className="home-get-started-actions">
            <button className="nav-start" type="button" onClick={() => navigate("/register")}>Get Started</button>
            <button className="home-get-started-login" type="button" onClick={() => navigate("/login")}>Login</button>
          </div>
        </section>

        <section className="home-cta home-contact-section" id="contact">
          <div className="home-contact-copy">
            <span className="section-kicker">WE’RE HERE TO HELP</span>
            <h2>Let’s talk about your team.</h2>
            <p>
              Have a question about TeamSync? Send us a note and your email
              app will prepare a message to our support team.
            </p>
            <a href="mailto:support@teamsync.com">
              <i className="fa-regular fa-envelope" aria-hidden="true"></i>
              support@teamsync.com
            </a>
          </div>

          <form className="home-contact-form" onSubmit={handleContactSubmit}>
            <div className="home-contact-form-heading">
              <h3>Send us a message</h3>
              <p>We’ll open a ready-to-send email for you.</p>
            </div>
            <div className="home-contact-fields">
              <label>
                <span>Your name</span>
                <input
                  type="text"
                  name="name"
                  value={contactForm.name}
                  onChange={updateContactField}
                  placeholder="Jane Smith"
                  autoComplete="name"
                  maxLength={100}
                  required
                />
              </label>
              <label>
                <span>Email address</span>
                <input
                  type="email"
                  name="email"
                  value={contactForm.email}
                  onChange={updateContactField}
                  placeholder="jane@company.com"
                  autoComplete="email"
                  maxLength={254}
                  required
                />
              </label>
              <label className="home-contact-message">
                <span>How can we help?</span>
                <textarea name="message" value={contactForm.message} onChange={updateContactField}
                  placeholder="Tell us a little about what you need..."
                  rows="4"
                  maxLength={2000}
                  required
                />
                <small>{contactForm.message.length}/2000</small>
              </label>
            </div>
            <button className="home-contact-submit" type="submit">
              Prepare email <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
            </button>
            <p className="home-contact-status" role="status" aria-live="polite">
              {contactStatus || "Your message will be addressed to support@teamsync.com."}
            </p>
          </form>
        </section>
      </main>

      <footer className="home-footer">
        <span>© {currentTime.getFullYear()} TeamSyncs · People operations made simpler.</span><div><a href="#contact">Contact</a><a href="#contact">Privacy</a><a href="#contact">Terms</a></div>
      </footer>

    </div>
  );
}

export default Home;
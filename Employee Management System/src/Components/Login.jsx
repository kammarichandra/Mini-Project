
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo1.png";
import "../Login.css";

function Login({ onLogin }) {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (localStorage.getItem("isLoggedIn") === "true") {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }

    setError("");
    localStorage.setItem("isLoggedIn", "true");

    if (rememberMe) {
      localStorage.setItem("userEmail", email);
    } else {
      localStorage.removeItem("userEmail");
    }

    if (onLogin) {
      onLogin();
    }

    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="auth-page login-auth-page">
      <header className="auth-header">
        <button className="auth-brand" type="button" onClick={() => navigate("/")}>
          <img src={logo} alt="TeamSync logo" />
          <strong>TeamSync</strong>
        </button>
      </header>

      <main className="login-main">
        <section className="login-auth-card" aria-label="Sign in to TeamSync">
          <div className="login-form-panel">
            <div className="login-heading">
              <span>TEAMSYNC WORKSPACE</span>
              <h1>Welcome back</h1>
              <p>Sign in to manage your people and processes.</p>
            </div>

            {error && <div className="login-error" role="alert">{error}</div>}

            <form onSubmit={handleSubmit}>
              <label className="login-field">
                <span>Email address</span>
                <input type="email" placeholder="Enter your email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" />
              </label>
              <label className="login-field">
                <span>Password <button type="button" onClick={() => alert("Forgot password functionality coming soon!")}>Forgot Password?</button></span>
                <input type="password" placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" />
              </label>
              <label className="login-remember"><input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} /> Remember me</label>
              <button className="login-submit" type="submit">Login</button>
            </form>

            <div className="login-divider"><span>Or continue with</span></div>
            <div className="social-buttons"><button type="button">G Google</button><button type="button">⊞ Microsoft</button></div>
            <p className="login-switch">Don't have an account? <button type="button" onClick={() => navigate("/register")}>Sign Up</button></p>
          </div>

          <aside className="login-visual register-visual">
            <div className="visual-copy">
              <span>TEAMSYNC HR PLATFORM</span>
              <h2>People operations, beautifully connected.</h2>
              <p>Great things happen when great teams work together.</p>
            </div>
            <div className="visual-photo-wrap">
              <img src="https://img.magnific.com/free-photo/young-businesswoman-leaning-her-working-desk-with-crossed-arms_181624-54694.jpg?semt=ais_hybrid&w=740&q=80" alt="Team members collaborating in an office" />
              <div className="visual-badge"><span>✓</span> Everything your team needs, in one place</div>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}

export default Login;


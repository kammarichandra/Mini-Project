import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo1.png";
import { registerUser, roles } from "@/shared/utils/auth";
import "./Register.css";

const FieldIcon = ({ type }) => {
  if (type === "user") {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5" /><path d="M5.5 19c.8-3 3-4.5 6.5-4.5s5.7 1.5 6.5 4.5" /></svg>;
  }

  if (type === "mail") {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="6" width="16" height="12" rx="1.5" /><path d="m5 8 7 5 7-5" /></svg>;
  }

  return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="10" width="12" height="9" rx="1.5" /><path d="M9 10V7a3 3 0 0 1 6 0v3M12 14v2" /></svg>;
};

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", role: "Employee", password: "", confirmPassword: "" });
  const [accepted, setAccepted] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!showTerms) return undefined;

    const closeOnEscape = (event) => {
      if (event.key === "Escape") setShowTerms(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [showTerms]);

  const updateField = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.fullName || !form.email || !form.password || !form.confirmPassword) {
      setError("Please complete all fields.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!accepted) {
      setError("Please accept the Terms & Conditions.");
      return;
    }
    try {
      registerUser({
        fullName: form.fullName.trim(),
        email: form.email,
        role: form.role,
        password: form.password,
      });
      setError("");
      navigate("/login", { state: { registered: true } });
    } catch (registrationError) {
      setError(registrationError.message);
    }
  };

  return (
    <div className="auth-page">
      <header className="auth-header">
        <button className="auth-brand" type="button" onClick={() => navigate("/")}>
          <img src={logo} alt="TeamSync logo" />
          <strong>TeamSync</strong>
        </button>
      </header>

      <main className="register-main">
        <section className="register-card" aria-label="Create your TeamSync account">
          <div className="register-form-panel">
            <div className="register-heading">
              <h1>Create Your Account</h1>
              <p>Join TeamSync and be part of a smarter workplace</p>
            </div>

            {error && <div className="register-error" role="alert">{error}</div>}

            <form onSubmit={handleSubmit}>
              <label className="register-field">
                <span>Full Name</span>
                <div className="register-input-wrap">
                  <FieldIcon type="user" />
                  <input name="fullName" value={form.fullName} onChange={updateField} placeholder="Enter your full name" autoComplete="name" />
                </div>
              </label>

              <label className="register-field">
                <span>Email Address</span>
                <div className="register-input-wrap">
                  <FieldIcon type="mail" />
                  <input name="email" type="email" value={form.email} onChange={updateField} placeholder="Enter your email address" autoComplete="email" />
                </div>
              </label>

              <label className="register-field">
                <span>Role</span>
                <div className="register-input-wrap">
                  <select name="role" value={form.role} onChange={updateField}>
                    {roles.map((role) => <option key={role} value={role}>{role}</option>)}
                  </select>
                </div>
                {form.role === "Payroll" && (
                  <small className="register-role-hint">
                    Manage employee salaries, deductions, payroll processing, and payslips.
                  </small>
                )}
              </label>

              <label className="register-field">
                <span>Password</span>
                <div className="register-input-wrap">
                  <FieldIcon type="lock" />
                  <input name="password" type="password" value={form.password} onChange={updateField} placeholder="Create a password" autoComplete="new-password" />
                </div>
              </label>

              <label className="register-field">
                <span>Confirm Password</span>
                <div className="register-input-wrap">
                  <FieldIcon type="lock" />
                  <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={updateField} placeholder="Confirm your password" autoComplete="new-password" />
                </div>
              </label>

              <label className="terms-check">
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={(event) => setAccepted(event.target.checked)}
                  required
                />
                <span>I agree to the <button type="button" onClick={() => setShowTerms(true)}>Terms &amp; Conditions</button></span>
              </label>

              <button className="register-submit" type="submit">Register</button>
            </form>

            <p className="auth-switch">Already have an account? <button type="button" onClick={() => navigate("/login")}>Login</button></p>
          </div>

          <aside className="register-visual">
            <div className="visual-copy">
              <span>TEAMSYNC HR PLATFORM</span>
              <h2>A smarter way to grow together.</h2>
              <p>Build a stronger workplace with simple tools for every stage of the employee journey.</p>
            </div>
            <div className="visual-photo-wrap">
              <img src="https://img.magnific.com/free-photo/businesspeople-having-good-time-meeting_1098-1786.jpg?semt=ais_hybrid&w=740&q=80" alt="Team members collaborating in an office" />
              <div className="visual-badge"><span>✓</span> Everything your team needs, in one place</div>
            </div>
          </aside>
        </section>
      </main>

      {showTerms && (
        <div
          className="register-terms-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowTerms(false);
          }}
        >
          <section
            className="register-terms-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="register-terms-title"
          >
            <header className="register-terms-header">
              <div>
                <span>TEAMSYNC ACCOUNT</span>
                <h2 id="register-terms-title">Terms &amp; Conditions</h2>
              </div>
              <button
                type="button"
                className="register-terms-close"
                aria-label="Close Terms and Conditions"
                onClick={() => setShowTerms(false)}
              >
                <i className="fa-solid fa-xmark" aria-hidden="true"></i>
              </button>
            </header>

            <div className="register-terms-content">
              <p className="register-terms-intro">
                Please read these terms before creating a TeamSync account.
                You must agree to them to register.
              </p>
              <h3>1. Your account</h3>
              <p>
                Provide accurate registration details and keep your sign-in
                credentials private. You are responsible for activity carried
                out through your account and should notify your organization if
                you believe it has been used without permission.
              </p>
              <h3>2. Appropriate use</h3>
              <p>
                Use TeamSync only for lawful workplace and HR activities that
                you are authorized to perform. Do not misuse the service,
                attempt to access another person’s account, or interfere with
                its operation.
              </p>
              <h3>3. Employee and workplace information</h3>
              <p>
                Enter or access employee information only when you have
                permission to do so. Your organization is responsible for
                determining what information it may process and for following
                applicable workplace and privacy requirements.
              </p>
              <h3>4. Service availability</h3>
              <p>
                TeamSync is provided as a workplace management application.
                Features may change over time, and uninterrupted availability
                cannot be guaranteed.
              </p>
              <h3>5. Agreement</h3>
              <p>
                By selecting “I agree,” you confirm that you have read and
                accept these Terms &amp; Conditions and will use TeamSync
                responsibly.
              </p>
            </div>

            <footer className="register-terms-footer">
              <button
                type="button"
                className="register-terms-secondary"
                onClick={() => setShowTerms(false)}
              >
                Close
              </button>
              <button
                type="button"
                className="register-terms-accept"
                autoFocus
                onClick={() => {
                  setAccepted(true);
                  setError("");
                  setShowTerms(false);
                }}
              >
                I agree
              </button>
            </footer>
          </section>
        </div>
      )}
    </div>
  );
}

export default Register;

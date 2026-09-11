
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo1.png";

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
    <div className="login-page">

      <div className="login-card">

        {/* Logo / Title */}
        <div className="login-header">

          <img src={logo} alt="TeamSync logo" className="login-logo" />

          <p className="login-title">
            TeamSync
          </p>

        </div>


        {/* Error Message */}
        {error && (
          <div className="login-error">
            {error}
          </div>
        )}


        {/* Login Form */}
        <form onSubmit={handleSubmit}>

          {/* Email */}
          <div className="form-group">

            <label htmlFor="email">
              Email
            </label>

            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

          </div>


          {/* Password */}
          <div className="form-group">

            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

          </div>


          {/* Remember Me + Forgot Password */}
          <div className="form-options">

            <label className="remember-me">

              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) =>
                  setRememberMe(e.target.checked)
                }
              />

              <span>Remember me</span>

            </label>

            <button
              type="button"
              className="forgot-password"
              onClick={() =>
                alert("Forgot password functionality coming soon!")
              }
            >
              Forgot Password?
            </button>

          </div>


          {/* Login Button */}
          <button
            type="submit"
            className="login-btn"
          >
            Login
          </button>

        </form>


        {/* Register */}
        <p className="signup-text">

          Don't have an account?{" "}

          <button
            type="button"
            className="register-link"
            onClick={() =>
              alert("Registration page coming soon!")
            }
          >
            Register
          </button>

        </p>

      </div>

    </div>
  );
}

export default Login;


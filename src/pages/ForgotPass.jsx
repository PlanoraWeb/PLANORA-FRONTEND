import React from "react";
import logo from "../assets/ikon.png"; // logo yolu React projesine göre değişebilir
import "../styles/DesignSystem.css";
import "../styles/Auth.css";
import Button from "../components/Button";
import Input from "../components/Input";
import { useState } from "react";
import { Link } from "react-router-dom";

function ResetPassword() {

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      await fetch("http://localhost:8080/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      setMessage("Password reset link has been sent to your email.");
    } catch (err) {
      setError("Unable to connect to server. Please try again.", err);
    } finally {
      setLoading(false);
    }
  };

  

  return (
    <div className="auth-page">
      <div className="auth-container">
        <a href="landing" className="auth-logo">
          <div className="logo-box">
            <img src={logo} alt="Planora" width="48" height="48" loading="eager" />
          </div>
          <span>Planora</span>
        </a>

        <div className="auth-card">
          <div className="auth-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>

          <h1>Reset your password</h1>
          <p className="auth-subtitle">
            Enter your email and we'll send you a link to reset your password.
          </p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label" htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                className="input"
                placeholder="alex@company.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              style={{ width: "100%" }}
              disabled={loading}
            >
              {loading ? "Sending..." : "Send reset link"}
            </Button>

            {message && <p className="success-message">{message}</p>}
            {error && <p className="error-message">{error}</p>}
          </form>

          <p className="auth-footer">
            <Link to="/login" className="auth-link">← Back to login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
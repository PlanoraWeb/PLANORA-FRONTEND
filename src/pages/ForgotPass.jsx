import React from "react";
import logo from "../assets/ikon.png"; // logo yolu React projesine göre değişebilir
import "../styles/DesignSystem.css";
import "../styles/Auth.css";
import Button from "../components/Button";
import Input from "../components/Input";

function ResetPassword() {
  const handleSubmit = (e) => {
    e.preventDefault();
    // Burada reset link gönderme işlemi yapılabilir
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
              />
            </div>

            <Button type="submit" className="btn btn-primary btn-lg" style={{ width: "100%" }}>
              Send reset link
            </Button>
          </form>

          <p className="auth-footer">
            <a href="login">← Back to log in</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
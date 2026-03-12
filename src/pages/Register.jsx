import React, { useState } from "react";import logo from "../assets/ikon.png"; // Logo yolu projenize göre değişebilir
import "../styles/DesignSystem.css";
import Button from "../components/Button";
import Input from "../components/Input";
import { Link } from "react-router-dom";
import Modal from "../components/Modal";

function Register() {
  const handleSubmit = (e) => {
    e.preventDefault();
    // Burada form gönderme işlemi yapılabilir
    console.log("Form submitted!");
  };

  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

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
          <h1>Start your free trial</h1>
          <p className="auth-subtitle">
            No credit card required. Full access for 14 days.
          </p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label" htmlFor="fullName">Full name</label>
              <Input
                type="text"
                id="fullName"
                placeholder="Alex Morgan"
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="workEmail">Work email</label>
              <Input
                type="email"
                id="workEmail"
                placeholder="alex@company.com"
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="password">Password</label>
              <Input
                type="password"
                id="password"
                placeholder="Min. 8 characters"
                required
                minLength={8}
              />
              <span className="input-hint">Must be at least 8 characters</span>
            </div>

            <div>
                <label className="checkbox-label">
                    <input type="checkbox" name="terms" required />
                    <span>
                    I agree to the{" "}
                    <button type="button" onClick={() => setShowTerms(true)} className="link-btn">
                        Terms of Service
                    </button>{" "}
                    and{" "}
                    <button type="button" onClick={() => setShowPrivacy(true)} className="link-btn">
                        Privacy Policy
                    </button>
                    </span>
                </label>

                {showTerms && (
                    <Modal onClose={() => setShowTerms(false)}>
                    <h2>Terms of Service</h2>
                    <p>Buraya Terms of Service metnini ekleyebilirsin...</p>
                    </Modal>
                )}

                {showPrivacy && (
                    <Modal onClose={() => setShowPrivacy(false)}>
                    <h2>Privacy Policy</h2>
                    <p>Buraya Privacy Policy metnini ekleyebilirsin...</p>
                    </Modal>
                )}
                </div>
            {/*HESAP OLUŞTURMA KISMI BURADA OLMALI*/}
            <Button type="submit" style={{ width: "100%" }}>
              Create account
            </Button>
          </form>

          <div className="auth-divider">
            <span>or sign up with</span>
          </div>

          <div className="auth-social">
            <Button type="button"style={{ width: "100%" }}>
              Continue with Google
            </Button>
            <Button type="button" style={{ width: "100%" }}>
              Continue with GitHub
            </Button>
          </div>

          <p className="auth-footer">
            Already have an account? <a href="login">Log in</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
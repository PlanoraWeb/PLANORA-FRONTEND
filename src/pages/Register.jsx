import React, { useState } from "react";
import logo from "../assets/ikon.png"; // Logo yolu projenize göre değişebilir
import "../styles/DesignSystem.css";
import Button from "../components/Button";
import Input from "../components/Input";
import { Link, useNavigate } from "react-router-dom";
import Modal from "../components/Modal";
import axios from "axios";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Ismi ve soyismi ayir
    const nameParts = formData.fullName.trim().split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ") || "User"; // Soyisim girilmediyse varsayilan atama

    try {
      const response = await axios.post("http://localhost:5000/api/v1/auth/register", {
        firstName,
        lastName,
        email: formData.email,
        password: formData.password,
      });

      if (response.data.success) {
        // Basarili ise giris sayfasina yonlendir
        navigate("/login");
      }
    } catch (err) {
      const errorData = err.response?.data?.error;
      if (errorData?.details && errorData.details.length > 0) {
        // Backend'den gelen spesifik doğrulama hatalarını birleştir
        const messages = errorData.details.map((d) => d.message).join(" | ");
        setError(messages);
      } else {
        setError(
          errorData?.message || "Kayıt olurken bir hata oluştu. Lütfen tekrar deneyin."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <Link to="/" className="auth-logo">
          <div className="logo-box">
            <img src={logo} alt="Planora" width="48" height="48" loading="eager" />
          </div>
          <span>Planora</span>
        </Link>

        <div className="auth-card">
          <h1>Start your free trial</h1>
          <p className="auth-subtitle">
            No credit card required. Full access for 14 days.
          </p>

          <form className="auth-form" onSubmit={handleSubmit}>
            {error && <div className="error-message" style={{ color: "red", marginBottom: "1rem" }}>{error}</div>}
            
            <div className="input-group">
              <label className="input-label" htmlFor="fullName">Full name</label>
              <Input
                type="text"
                id="fullName"
                placeholder="Alex Morgan"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="email">Work email</label>
              <Input
                type="email"
                id="email"
                placeholder="alex@company.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="password">Password</label>
              <Input
                type="password"
                id="password"
                placeholder="Min. 8 characters"
                value={formData.password}
                onChange={handleChange}
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
            
            <Button type="submit" style={{ width: "100%" }} disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <div className="auth-divider">
            <span>or sign up with</span>
          </div>

          <div className="auth-social">
            <Button type="button" style={{ width: "100%" }}>
              Continue with Google
            </Button>
            <Button type="button" style={{ width: "100%" }}>
              Continue with GitHub
            </Button>
          </div>

          <p className="auth-footer">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
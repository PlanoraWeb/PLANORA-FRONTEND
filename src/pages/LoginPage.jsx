import React, { useState } from 'react';
import './../styles/Auth.css';
import '../styles/DesignSystem.css'
import logo from './../assets/ikon.png';
import Button from '../components/Button';
import Input from '../components/Input';
import { Link, useNavigate } from 'react-router-dom';
import { loginRequest } from '../services/authService';
import Modal from '../components/Modal';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate();
  // const [showTerms, setShowTerms] = useState(false);
  // const [showPrivacy, setShowPrivacy] = useState(false);
  const [error, setError] = useState('');
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.type]: e.target.value });
  };


  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);


    try {
      const response = await loginRequest({
        email: formData.email,
        password: formData.password
      });

      const { accessToken, refreshToken, user } = response.data.data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(user));

      navigate('/dashboard');
    } catch (error) {
    // 🔴 401 → yanlış giriş
    if (error.response?.status === 401) {
      setError("Invalid email or password.");
    }
    // 🔴 timeout / server yok
    else if (error.code === "ECONNABORTED" || !error.response) {
      setError("Unable to connect to server, please try again.");
    }
    // 🔴 diğer durumlar
    else {
      setError("Something went wrong.");
    }
  } finally {
    setLoading(false);
  }
    };
  
  return (
    <div className="auth-page">
      <div className="auth-container">
        <Link to="/dashboard" className="auth-logo">
          <div className="logo-box">
            <img 
              src={logo}
              alt="Planora"
              width="48"
              height="48"
              loading="eager"
            />
          </div>
          <span>Planora</span>
        </Link>

        <div className="auth-card">
          <h1>Welcome back</h1>
          <p className="auth-subtitle">Enter your credentials to access your workspace.</p>

          {error && (
              <div className="auth-error">
                {error}
              </div>
          )}

          <form className="auth-form" onSubmit={handleLogin}>
            <div className="input-group">
              <label className="input-label">Email</label>
              <Input 
                type="email" 
                name="email"
                placeholder="alex@company.com" 
                required 
                onChange = {handleChange} // Veriyi yakalar
              />


              
            </div>
            
            <div className="input-group">
              <div className="input-label-row">
                <label className="input-label">Password</label>
                <Link to="/forgot-password" className="auth-link">
                  Forgot password?
                </Link>
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                required
                onChange = {handleChange} // Veriyi yakalar
              />
            </div>

            <div className="auth-options">
              <label className="checkbox-label">
                <input type="checkbox" name="remember" />
                <span>Remember me for 30 days</span>
              </label>
            </div>

            

            <Button 
              type="submit" 
              variant="primary" 
              size="lg" 
              style={{ width: '100%' }}
              disabled={loading}
            >
              {loading ? (
                <span className="spinner"></span>
              ) : (
                'Log in'
              )}
          </Button>
          </form>

          <p className="auth-footer">
            Don't have an account? 
            <Link to="/register">Start free trial</Link>
          </p>

        
            
            </div>
      </div>
    </div>
  );
};

export default Login;
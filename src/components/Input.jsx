import React from "react";
import '../styles/Input.css';

const Input = ({ label, type = "text", placeholder, ...props }) => {
  return (
    <div className="input-group">
      <label className="input-label">{label}</label>
      <input className="input" type={type} placeholder={placeholder} {...props} />
    </div>
  );
};

export default Input;
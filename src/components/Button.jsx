import React from "react";
import '../styles/Button.css';

const Button = ({ children, type = "button", variant = "primary", size = "md", style, ...props }) => {
  const classes = `btn btn-${variant} btn-${size}`;

  return (
    <button type={type} className={classes} style={style} {...props}>
      {children}
    </button>
  );
};

export default Button;
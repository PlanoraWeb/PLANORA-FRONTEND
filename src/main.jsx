import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/DesignSystem.css";
import "./styles/index.css";
import App from "./App.jsx";
import "./styles/LinearTheme.css";

if (typeof document !== "undefined") {
  document.documentElement.setAttribute("data-theme", "dark");
  document.documentElement.style.colorScheme = "dark";
  localStorage.setItem("planora-theme", "dark");
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

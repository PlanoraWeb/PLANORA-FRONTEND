import React from "react";
import "../styles/Modal.css"; // Modal için ayrı CSS

function Modal({ children, onClose }) {
  return (
    <>
      {/* Overlay */}
      <div className="modal-overlay" onClick={onClose}></div>

      {/* Modal content */}
      <div className="modal">
        <button className="modal-close-btn" onClick={onClose}>
          ×
        </button>
        <div className="modal-content">{children}</div>
      </div>
    </>
  );
}

export default Modal;
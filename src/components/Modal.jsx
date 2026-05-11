import React from "react";
import "../styles/Modal.css"; // Modal için ayrı CSS
import { useEffect } from "react";

function Modal({ children, onClose }) {
  // useEffect(() => {
  //   const handleEsc = (e) => {
  //     if (e.key === "Escape") onClose();
  //   };
  //   document.addEventListener("keydown", handleEsc);
  //   return () => document.removeEventListener("keydown", handleEsc);
  // }, [onClose]);
  useEffect(() => {
  document.body.style.overflow = 'hidden'; // Açıldığında kaydırmayı kapat
  return () => {
    document.body.style.overflow = 'unset'; // Kapandığında aç
  };
}, []);
  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div
          className="modal"
          onClick={(e) => e.stopPropagation()}
        >
          <button className="modal-close-btn" onClick={onClose}>
            ×
          </button>
          <div className="modal-content">{children}</div>
        </div>
      </div>
    </>
  );
}

export default Modal;
import React, { useEffect } from "react";
import "../styles/Modal.css";

function Modal({ children, onClose }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <div className="side-modal-overlay" onClick={onClose}>
      <div className="side-modal" onClick={(event) => event.stopPropagation()}>
        <button className="side-modal-close" onClick={onClose}>
          x
        </button>
        <div className="side-modal-content">{children}</div>
      </div>
    </div>
  );
}

export default Modal;

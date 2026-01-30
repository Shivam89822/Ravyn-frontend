import React from 'react'
import { useEffect, useRef, useState } from "react";
import { Ban, X } from "lucide-react";

import "./BlockReason.css"
function BlockReason({ onClose, onConfirm }) {

    const modalRef = useRef(null);
    const [reason, setReason] = useState("hate_content");

    useEffect(() => {
        function handleOutside(e) {
        if (modalRef.current && !modalRef.current.contains(e.target)) {
            onClose();
        }
        }

        document.addEventListener("mousedown", handleOutside);
        return () => document.removeEventListener("mousedown", handleOutside);
    }, [onClose]);

    function handleConfirm() {
        onConfirm(reason);
        onClose();
    }
    
  return (
    <div className="modal-backdrop">
      <div ref={modalRef} className="block-modal">
        
        <div className="modal-header">
          <Ban size={18} />
          <h3>Block User</h3>
          <button onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <p className="modal-desc">
          Blocking this user will prevent them from interacting with you.
        </p>

        <label className="modal-label">Select reason</label>
        <select
          className="modal-select"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        >
          <option value="spam">Spam</option>
          <option value="hate_content">Hate content</option>
          <option value="harassment">Harassment</option>
          <option value="fake_account">Fake account</option>
          <option value="nudity">Nudity</option>
          <option value="other">Other</option>
        </select>

        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-confirm" onClick={handleConfirm}>
            Confirm Block
          </button>
        </div>

      </div>
    </div>
  )
}

export default BlockReason

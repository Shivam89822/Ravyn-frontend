import React from "react";
import "./ShareMessage.css";
import { ArrowLeft, Send } from "lucide-react";
import { useSelector } from "react-redux";

function ShareMessage({ onClose }) {
  const conversations = useSelector(
    (state) => state.conversations.conversations
  );

  return (
    <div className="share-root">
      <div className="share-sheet">
        <div className="share-top">
          <button className="share-back-btn" onClick={onClose}>
            <ArrowLeft size={20} />
            <span>Share</span>
          </button>
        </div>

        <div className="share-body">
          {conversations.map((c, i) => (
            <div key={i} className="share-row">
              <div className="share-avatar">
                {c.friendProfilePic && (
                  <img src={c.friendProfilePic} alt="" />
                )}
              </div>

              <div className="share-info">
                <div className="share-name">{c.friendName}</div>
                <div className="share-username">@{c.friendUserName}</div>
              </div>

              <button className="share-send">
                <Send size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ShareMessage;

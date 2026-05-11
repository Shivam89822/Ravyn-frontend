import React, { useEffect, useState, useRef } from "react";
import "./GroupInfo.css";
import axios from "axios";
import { useSelector } from "react-redux";
import api from "../utils/axios.js";
function GroupInfo({setGroupUpdate, convoId }) {
  const [showDropdown, setShowDropdown] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [isUserAdmin,setUserAdmin]=useState(false);
   const user = useSelector((state) => state.user.user);
  const [image, setImage] = useState(
    "https://api.dicebear.com/7.x/avataaars/svg?seed=brotherhood"
  );



  const fileRef = useRef(null);

  const handleClick = () => {
    fileRef.current.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      setImage(preview);
      saveChange();
    }
  };

  const fetchConversation = async () => {
    try {
      const response = await api.get(
        "/api/conversation/fetch-single-conversation",
        { params: { convoId } }
      );

      setConversation(response.data);
      setParticipants(response.data.participants);
    } catch (e) {
      console.log(e.response?.data?.message || "backend error");
    }
  };

  const saveChange = async () => {
    const profile = fileRef.current?.files[0];
    const data = { profile };

    if (profile) {
      const formData = new FormData();
      formData.append("file", profile);
      formData.append("upload_preset", "shivam_products");

      try {
        const response = await axios.post(
          "https://api.cloudinary.com/v1_1/dksrg9oqk/image/upload",
          formData
        );

        data.groupProfile = response.data.secure_url;
        data.profilePublicId = response.data.public_id;
      } catch (e) {
        console.error(e);
        alert("Error uploading image to Cloudinary");
        return;
      }
    }

    try {
      await api.post(
        "/api/conversation/change-profile",
        {
          convoId,
          data,
        }
      );
     
    } catch (e) {
      console.log(e.response?.data?.message);
    }
  };

  const leaveGroup = async () => {
  try {
    await api.post("/api/conversation/remove-member", {
      convoId,
      userId: user._id
    });

    setGroupUpdate(false);

  } catch (e) {
    console.log(e.response?.data?.message);
  }
};

  const removeMember = async (userId) => {
    try {
      await api.post(
        "/api/conversation/remove-member",
        {
          convoId,
          userId,
        }
      );

      setParticipants((prev) => prev.filter((p) => p._id !== userId));
      setShowDropdown(null);
    } catch (e) {
      console.log(e.response?.data?.message);
    }
  };

  useEffect(() => {

    if (convoId) fetchConversation();
  }, []);

  useEffect(() => {
  if (conversation?.admins) {
    const isAdmin = conversation.admins
      .map(id => id.toString())
      .includes(user._id);

    setUserAdmin(isAdmin);
  }
}, [conversation, user._id]);
  return (
    <div className="gi-wrapper">
      <header className="gi-header">
        <button onClick={()=>{setGroupUpdate(false)}} className="gi-back-btn" aria-label="Go back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="gi-title">Group Info</h1>
        <div className="gi-header-space"></div>
      </header>
      <div className="gi-scrollable">
        <section className="gi-hero">
          <div className="gi-image-container">
            <img src={conversation.groupProfile?conversation.groupProfile:image} alt="Group" className="gi-avatar" />

            {isUserAdmin&&<button
              className="gi-camera-overlay"
              aria-label="Change group photo"
              onClick={handleClick}
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
              </svg>

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleImageChange}
              />
            </button>}
          </div>

          <div className="gi-hero-content">
            <div className="gi-name-section">
              <h2 className="gi-group-title">{conversation.groupName}</h2>
            </div>
          </div>
        </section>

        <section className="gi-members">
          <div className="gi-members-header">
            <h3>Members</h3>
            <span className="gi-count-badge">{participants.length}</span>
          </div>

          <div className="gi-members-list">
            {participants.map((member) => (
              <div key={member._id} className="gi-member-item">
                <img
                  src={
                    member.profilePictureUrl?.length > 0
                      ? member.profilePictureUrl
                      : `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.userName}`
                  }
                  alt={member.userName}
                  className="gi-member-avatar"
                />

                <div className="gi-member-info">
                  <div className="gi-member-name-row">
                    <p className="gi-member-name">{member.userName}</p>
                    {member.isAdmin && (
                      <span className="gi-admin-tag">Admin</span>
                    )}
                  </div>
                </div>

                <div className="gi-member-actions">
                  {isUserAdmin&&<button
                    className="gi-member-options"
                    onClick={() =>
                      setShowDropdown(
                        showDropdown === member._id ? null : member._id
                      )
                    }
                  >
                    ⋮
                  </button>}

                  {showDropdown === member._id && (
                    <div className="gi-dropdown">
                      <button
                        className="gi-remove-btn"
                        onClick={() => removeMember(member._id)}
                      >
                        Remove User
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="gi-divider"></section>

        <section className="gi-actions">
         
          <button className="gi-action-btn gi-action-danger" onClick={leaveGroup}>
            Leave Group
          </button>
        </section>
      </div>
    </div>
  );
}

export default GroupInfo;
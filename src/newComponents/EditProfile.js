import React, { useState, useEffect, useRef } from "react";
import "./EditProfile.css";
import { XCircle, Camera } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { updateUser } from "../features/user/UserSlice";
import axios from "axios";
import Loader from "../Components/Loader";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

function EditProfile() {
  const [tags, setTags] = useState([]);
  const [interests, setInterest] = useState("");
  const [userName, setUserName] = useState("");
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [Location, setLocation] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [profilePreview, setProfilePreview] = useState(null);
  const navigate=useNavigate();
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const user = useSelector((state) => state.user.user);

  const onSubmitChange = async () => {
    setIsComplete(true);

    const profile = fileInputRef.current?.files[0];
    const data = {
      email: user.email,
      userName: userName.trim() || user.userName,
      fullName: fullName.trim() || user.fullName,
      bio: bio.trim() || user.bio,
      Location: Location.trim() || user.Location,
      isPrivate,
      interests: tags
    };

    if (profile) {
      const formData = new FormData();
      formData.append("file", profile);
      formData.append("upload_preset", "shivam_products");

      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/dksrg9oqk/image/upload",
        formData
      );

      data.profilePictureUrl = response.data.secure_url;
      data.profilePicturePublicId = response.data.public_id;
    }

    const response = await axios.patch(
      `http://localhost:8080/api/users/${user._id}`,
      data
    );

    dispatch(updateUser(response.data));
    navigate("/home/user-profile")
    setIsComplete(false);
  };

  const addTag = () => {
    if (!interests.trim()) return;
    setTags([...tags, interests.trim()]);
    setInterest("");
  };

  const removeTag = (index) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleProfileClick = () => {
    fileInputRef.current.click();
  };

  const removeProfile = () => {
    setProfilePreview(null);
    fileInputRef.current.value = "";
  };

  useEffect(() => {
    if (user) {
      setUserName(user.userName || "");
      setFullName(user.fullName || "");
      setBio(user.bio || "");
      setLocation(user.Location || "");
      setIsPrivate(user.isPrivate || false);
      setTags(user.interests || []);
    }
  }, [user]);

  return (
    <div className="modal-overlay">
      <div className="edit-modal">
        <div className="modal-bg-effect"></div>

        <div className="modal-header">
          <h2 className="modal-title">Edit Profile</h2>
          <button className="close-btn" onClick={()=>{navigate("/home/user-profile")}}>×</button>
        </div>

        <div className="modal-content">
          <div className="avatar-edit-section">
            <div className="avatar-edit-wrapper">
              <div className="avatar-edit">
                <div
                  className="avatar-edit-inner"
                  onClick={handleProfileClick}
                >
                  {profilePreview ? (
                    <img
                      src={profilePreview}
                      alt="profile"
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "50%",
                        objectFit: "cover"
                      }}
                    />
                  ) : (
                    <Camera size={32} />
                  )}
                </div>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setProfilePreview(URL.createObjectURL(file));
                  }
                }}
              />
            </div>

            <div className="avatar-actions">
              <motion.button
                className="avatar-btn primary"
                whileHover={{ scale: 0.99 }}
                onClick={handleProfileClick}
              >
                Upload Photo
              </motion.button>

              <motion.button
                className="avatar-btn secondary"
                whileHover={{ scale: 0.99 }}
                onClick={removeProfile}
              >
                Remove
              </motion.button>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Name</label>
              <input
                className="form-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                className="form-input"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </div>

            <div className="form-group full-width">
              <label className="form-label">BIO</label>
              <textarea
                className="form-input"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
              <div className="char-counter">{bio.length}/150</div>
            </div>

            <div className="form-group">
              <label className="form-label">Location</label>
              <input
                className="form-input"
                value={Location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>

          <div className="tags-section">
            <label className="form-label">Interests</label>

            <div className="tags-input-wrapper">
              <input
                className="form-input"
                value={interests}
                onChange={(e) => setInterest(e.target.value)}
              />
              <button className="add-tag-btn" onClick={addTag}>
                Add
              </button>
            </div>

            <div className="tags-list">
              {tags.map((tag, i) => (
                <div className="tag-item" key={i}>
                  <span>{tag}</span>
                  <button
                    style={{ background: "transparent", border: "none" }}
                    onClick={() => removeTag(i)}
                  >
                    <XCircle size={18} color="#fff" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group full-width" style={{ marginTop: 32 }}>
            <label className="form-label">Privacy Settings</label>

            <div className="switch-section">
              <div>
                <h4>Private Account</h4>
                <p>Only approved followers</p>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="footer-btn cancel">Cancel</button>
          <button
            className="footer-btn save"
            disabled={isComplete}
            onClick={onSubmitChange}
          >
            Save Changes
          </button>
          {isComplete && (
            <div id="loader-holder">
              <Loader />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EditProfile;

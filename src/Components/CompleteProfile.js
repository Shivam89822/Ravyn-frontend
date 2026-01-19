import React, { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './CompleteProfile.css';
import { Camera } from "lucide-react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";
import { setUser, clearUser,updateUser } from '../features/user/UserSlice'; // Adjust path if needed
import Loader from './Loader';

function CompleteProfile() {
 
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // --- STATE ---
  const [intrest, setIntrest] = useState([]);
  const [currIntrest, setCurrIntrest] = useState("");
  const [profilePreview, setProfilePreview] = useState(null);
  const [isComplete,setIsComplete]=useState(false)
   const navigate = useNavigate();
  const dispatch=useDispatch()

  const user = useSelector((state) => state.user.user);
  const fileInputRef = useRef(null);

  const addItem = (e) => {
    
    if (e) e.preventDefault();

    if (currIntrest.trim() !== "" && intrest.length < 10) {
      if (!intrest.includes(currIntrest.trim())) {
        setIntrest([...intrest, currIntrest.trim()]);
        setCurrIntrest(""); // Clear input
      } else {
        alert("Interest already added!");
      }
    }
  };

  const removeIntrest = (indexToRemove) => {
    setIntrest(intrest.filter((_, idx) => idx !== indexToRemove));
  };

  // 3. Handle Profile Picture Click
  const handleProfileClick = () => {
    fileInputRef.current.click();
  };

  // 4. Main Form Submission
  const completeProfile = async (data) => {
    setIsComplete(true);
    const profile = fileInputRef.current?.files[0];
  
    if (profile) {
      const formData = new FormData();
      formData.append("file", profile);
      formData.append("upload_preset", "shivam_products");

      try {
        const response = await axios.post(
          "https://api.cloudinary.com/v1_1/dksrg9oqk/image/upload",
          formData
        );

        const imageUrl = response.data.secure_url;
        const publicId = response.data.public_id;

        data.profilePictureUrl = imageUrl;
        data.profilePicturePublicId = publicId;
      } catch (e) {
        console.error(e);
        alert("Error uploading image to Cloudinary");
        return; 
      }
    }

    // Handle Backend Update
    try {
      if (user?.email) {
        data.email = user.email;
      }
      data.intrests = intrest; // Attach the array of interests
      data.isFirstLogin=false;

      const response=await axios.patch(`http://localhost:8080/api/users/${user._id}`, data);
      // alert("User updated successfully");
      dispatch(updateUser(response.data))
      console.log(response.data)
    } catch (e) {
      console.error(e);
      // const message = e.response?.data?.message || "Backend error";
      navigate('/Home'); // Fallback navigation
    }
  };

  // --- JSX ---
  return (
    <div id='complete-profile-holder'>
      <form
        id='complete-profile-form'
        onSubmit={handleSubmit(completeProfile)}
      >
        <div>
          <div className='big-bold-text profile-item'>Complete Your Profile</div>
          <div className='profile-item yourself-text'>
            Tell us about yourself to get started
          </div>

          <div className='profile-item'>
            <div
              className="circle-profile-holder"
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

            <div
              className='smaller-blue-text'
              onClick={handleProfileClick}
            >
              Upload Profile Picture
            </div>

            {/* Hidden File Input */}
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              {...register("profilePic")}
              ref={(e) => {
                register("profilePic").ref(e);
                fileInputRef.current = e;
              }}
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setProfilePreview(URL.createObjectURL(file));
                }
              }}
            />
          </div>
        </div>

        <div className='form-info-box'>
          {/* Username */}
          <div className="info-box-items">
            <div className='info-items-of-items'>
              <label className='label-styler' htmlFor="username">
                Username
              </label>
            </div>
            <input
              placeholder='Username..'
              className='input-field'
              type="text"
              {...register("userName", { required: true })}
            />
          </div>

          {/* Bio */}
          <div className="info-box-items">
            <div className='info-items-of-items'>
              <label className='label-styler' htmlFor="userbio">Bio</label>
            </div>
            <textarea
              placeholder='Tell us about yourself..'
              className='input-field bio-holder'
              {...register("bio", { required: true })}
            />
          </div>

          {/* Location */}
          <div className="info-box-items">
            <div className='info-items-of-items'>
              <label className='label-styler' htmlFor="location">Location</label>
            </div>
            <input
              placeholder='City, State'
              className='input-field'
              type="text"
              {...register("Location", { required: true })}
            />
          </div>

          {/* Interests Section */}
          <div className="info-box-items">
            <div className='info-items-of-items'>
              <label className='label-styler'>Interests (Max 10)</label>
            </div>
            
            <div className='add-intrest-wrapper'>
              <input
                placeholder='e.g., Photography'
                value={currIntrest}
                onChange={(e) => setCurrIntrest(e.target.value)}
                className='input-field interest-input'
                type="text"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addItem(e);
                }}
              />
              <button 
                type="button" 
                className='add-button' 
                onClick={addItem}
              >
                Add
              </button>
            </div>

            <div className='interest-tags-container'>
              {intrest.map((name, idx) => (
                <div key={idx} className='intrest-item'>
                  {name}
                  <span 
                    className='remove-x' 
                    onClick={() => removeIntrest(idx)}
                  >
                    ×
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Private Account Toggle */}
          <div className="info-box-items">
            <div className='isPrivate-class'>
              <div className='input-field private-is-special'>
                <div>
                  <div id='private-acc-text'>Private Account</div>
                  <div id='extra-mdg-text'>
                    Only approved followers can see your posts
                  </div>
                </div>
                <label className="switch">
                  <input type="checkbox" {...register("isPrivate")} />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="info-box-items">
            <motion.button
            disabled={isComplete}
            
            whileHover={{scale:0.99,transition: { duration: 0.1 }}}
             id='complete-profile' type='submit'>
              Complete Profile
            </motion.button>
          </div>
          {isComplete&&<div id='loader-holder'>
            <Loader/>
          </div>}
        </div>
      </form>
    </div>
  );
}

export default CompleteProfile;
import { useRef, useState, useEffect } from "react";
import "./CreatePost.css";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux';
import { setUser, clearUser,updateUser } from '../features/user/UserSlice'; // Adjust path if needed
import Loader from './Loader';

export default function CreatePost(props) {

  const dispatch=useDispatch()
  const user=useSelector((state)=>state.user.user)
    
  const fileRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null); // URL for the preview
  const [fileType, setFileType] = useState(""); // To track if it's image or video
  const [caption, setCaption] = useState("");
  const [hashtagInput, setHashtagInput] = useState("");
  const [hashtags, setHashtags] = useState([]);
  const [isCommentAllowed, setIsCommentAllowed] = useState(true);
  const [isSubmited,setIsSubmited]=useState(false)

  const uploadPost=async()=>{
    setIsSubmited(true)
   let mediaUrl,publicId,resourceType;
  
    
   if (selectedFile) {
    
  const formData = new FormData();
  formData.append("file", selectedFile);
  formData.append("upload_preset", "shivam_products");
  

  try {
    const response = await axios.post(
      "https://api.cloudinary.com/v1_1/dksrg9oqk/auto/upload", 
      formData
    );
  

     
    mediaUrl = response.data.secure_url;
    publicId = response.data.public_id;
    resourceType = response.data.resource_type; 
    console.log("Upload successful:", mediaUrl, "Type:", resourceType);
  } catch (e) {
  console.error("Upload error FULL:", e);
  console.error("Status:", e.response?.status);
  console.error("Data:", e.response?.data);
  console.error("Headers:", e.response?.headers);
  alert("Error uploading media to Cloudinary");
    
    return;
  }
  }

  const data={
     mediaUrl:mediaUrl,
     publicId:publicId,
     caption:caption,
     isCommentAllowed:isCommentAllowed,
     type:resourceType,
     userId:user._id,
     hashtags:hashtags,
  }
   

  try{
    const response=await axios.post("http://localhost:8080/api/posts",data);
    setIsSubmited(false)

  }catch(e){
    const message=e.response?.data?.error||"Backend error"
    console.log("backend error")
    alert(message)
  }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Clean up memory if a previous preview exists
    if (previewUrl) URL.revokeObjectURL(previewUrl);

    setSelectedFile(file);
    setFileType(file.type); // Store type (e.g., 'video/mp4' or 'image/jpeg')
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleHashtagKeyDown = (e) => {
    if (e.key === "Enter" && hashtagInput.trim()) {
      e.preventDefault();
      if (!hashtags.includes(hashtagInput.trim())) {
        setHashtags([...hashtags, hashtagInput.trim()]);
      }
      setHashtagInput("");
    }
  };

  const closePreview = () => {
    setSelectedFile(null);
    setFileType("");
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setHashtags([]);
  };

  return (
    <div className="upload-wrapper">
      {/* UPLOAD SCREEN */}
      {!selectedFile && (
        <div className="upload-card">
          <div className="media-cross-holder">
            <h2 className="upload-title">Upload Media</h2>
            <motion.div
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.15 }}
              id="cross-holder"
              onClick={()=>{props.setShowCreatePost(false)}}
            >
              ❌
            </motion.div>
          </div>

          <div className="upload-area">
            <p className="primary-text">Drop images or videos here</p>
            <p className="secondary-text">JPG, PNG, MP4 supported</p>

            <button
              className="upload-btn"
              onClick={() => fileRef.current.click()}
            >
              Browse
            </button>

            <input
              ref={fileRef}
              type="file"
              accept="image/*,video/*"
              hidden
              onChange={handleFileChange}
            />
          </div>
        </div>
      )}

      {/* POST FORM SCREEN */}
      {selectedFile && (
        <div className="post-shower">
          <div className="post-header">
            <span>Create Post</span>
            <span className="close-btn" onClick={closePreview}>
              ✕
            </span>
          </div>

          <div className="post-body">
            {/* MEDIA PREVIEW */}
            <div className="media-preview">
              {fileType.startsWith("video") ? (
                <video
                  src={previewUrl}
                  className="preview-content"
                  autoPlay
                  loop
                  muted
                  playsInline
                  controls // Optional: remove if you want it to look exactly like a Reel
                />
              ) : (
                <img
                  src={previewUrl}
                  alt="preview"
                  className="preview-content"
                />
              )}
            </div>

            {/* FORM PANEL */}
            <div className="post-form-holder">
              <label>Caption</label>
              <textarea
                placeholder="Write a caption..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />

              <label>Hashtags</label>
              <input
                placeholder="Add hashtags and press Enter"
                value={hashtagInput}
                onChange={(e) => setHashtagInput(e.target.value)}
                onKeyDown={handleHashtagKeyDown}
              />

              <div className="hashtag-list">
                {hashtags.map((tag, index) => (
                  <span key={index} className="hashtag">
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="comment-toggle">
                <span>Allow comments</span>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={isCommentAllowed}
                    onChange={(e) => setIsCommentAllowed(e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <button className="share-btn" disabled={isSubmited} onClick={()=>{uploadPost()}}>Share Post</button>
              {isSubmited&&<Loader/>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
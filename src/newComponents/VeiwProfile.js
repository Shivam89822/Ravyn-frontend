import React, { useEffect, useState } from 'react'
import "./VeiwProfile.css"
import { UserPen ,User, Camera,MoreVertical,Grid3X3,Film,Bookmark,Heart,MessageCircle} from "lucide-react";
import { useDispatch, useSelector } from 'react-redux';
import "../Components/UserProfile.css"
import axios from "axios"
import { useNavigate } from 'react-router-dom';
function VeiwProfile() {
  const user = useSelector((state) => state.user.user);
  const [userPosts, setUserPosts] = useState([]);
  const [savedPost,setSavedPost]=useState([]);
  const navigate=useNavigate();  

  const [activeStyle,setActiveStyle]=useState({
    background:"linear-gradient(135deg, #a855f7, #ec4899, #38bdf8)",
    color:"white",
    borderRadius:"10px",
    transition: "background 0.4s ease, color 0.4s ease, transform 0.4s ease",
  
  })
  const [activeSlot,setActiveSlot]=useState('post')
   const imagePosts = userPosts.filter((p) => p.type === "image");
  const reelPosts = userPosts.filter((p) => p.type === "video");

   const fetchPost = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/post/${user.userName}`
      );
      setUserPosts(response.data);
      // console.log(response.data)
    } catch (e) {
      console.log(e.response?.data?.error || "Backend error");
    }
  };

  const fetchSavedReels=async()=>{
    try{
      const response=await axios.get(`http://localhost:8080/api/savedpost/${user._id}`)
      setSavedPost(response.data);
      console.log(response.data);
    }
    catch(e){
      console.log(e.response?.data?.error || "Backend error");
    }
  }



  useEffect(()=>{
    fetchPost();
    fetchSavedReels();
  },[])
  return (
    <div className='user-profile-container'>
      <div className='user-profile-upper-container'>
        <div className='upper-prof-first-item'>
            <div className="profile-wrapper">
            <div className="gradient-ring">
                <div className="profile-inner">
                {!user.profilePictureUrl&&<User size={52} strokeWidth={3} className="user-icon" />}
                {user.profilePictureUrl&&<img src={user.profilePictureUrl} style={{width:"100%",height:"100%",borderRadius:"50%"}} alt="" />}

                </div>
            </div>

            <button className="edit-btn">
                <Camera size={18} />
            </button>
         </div>
            <div><button onClick={()=>{navigate("/home/user-profile/edit-profile")}} className='edit-prof-btn'><span>Edit profile</span> <UserPen size={16} strokeWidth={3} /></button></div>
        </div>
        <div className='upper-prof-sec-item'>
            <div className='user-name'>{user.fullName}</div>
            <div className='full-name'>@{user.userName}</div>
            <div className='bio'>{user.bio}</div>
            <div className='stats-container'>
                <div className='stats-holder'>
                    <span className='count-box'>{user.postCount}</span><span className='right-of-count'>POSTS</span>
                </div>
                 <div className='stats-holder'>
                    <span className='count-box'>{user.followerCount}</span><span className='right-of-count'>FOLLOWER</span>
                </div>
                 <div className='stats-holder'>
                    <span className='count-box'>{user.followingCount}</span><span className='right-of-count'>FOLLOWING</span>
                </div>
            </div>
            <div>
                <button className='action-btn'><MoreVertical size={16} />Share Profile</button>
            </div>
        </div>
      </div>
      <div className='userProfile-lower-container'>
        <button onClick={()=>{setActiveSlot("post")}} style={activeSlot=="post"?activeStyle:{}} className='post-reel-save-btn'><Grid3X3 size={14} /><span>Posts</span></button><button style={activeSlot=="reel"?activeStyle:{}} onClick={()=>{setActiveSlot("reel")}} className='post-reel-save-btn'><Film size={14} /><span>Reels</span></button><button style={activeSlot=="saved"?activeStyle:{}} onClick={()=>{setActiveSlot("saved")}} className='post-reel-save-btn'><Bookmark size={14} /><span>Saved</span></button>
      </div>

      <div style={{marginTop:"30px"}} className="parent-post-holder">
        {/* EMPTY STATES */}
        {activeSlot === "post" && imagePosts.length === 0 && (
          <div className="empty-text">No posts</div>
        )}

        {activeSlot === "reel" && reelPosts.length === 0 && (
          <div className="empty-text">No reels</div>
        )}

        {userPosts.map((item) => {
          if (activeSlot === "post" && item.type === "image") {
            return (
              <div onClick={()=>{navigate("/home/reels",{state:item._id})}} key={item._id} className="post-item">
                <img
                  className="postImage"
                  src={item.mediaUrl}
                  alt="post"
                />

                <div className="post-hover-overlay">
                  <span>
                    <Heart size={18} /> {item.likeCount}
                  </span>
                  <span>
                    <MessageCircle size={18} /> {item.commentCount}
                  </span>
                </div>
              </div>
            );
          }

          if (activeSlot === "reel" && item.type === "video") {
            return (
              <div onClick={()=>{navigate("/home/reels",{state:item._id})}}  key={item._id} className="post-item">
                <video
                  className="postImage"
                  src={item.mediaUrl}
                  muted
                  preload="metadata"
                />

                <div className="post-hover-overlay">
                  <span>
                    <Heart size={18} /> {item.likeCount}
                  </span>
                  <span>
                    <MessageCircle size={18} /> {item.commentCount}
                  </span>
                </div>
              </div>
            );
          }
          return null;
        })}
        {savedPost.map((item,key)=>{
           if (activeSlot === "saved" && item.postId.type === "image") {
            return (
              <div onClick={()=>{navigate("/home/reels",{state:item.postId._id})}} key={item._id} className="post-item">
                <img
                  className="postImage"
                  src={item.postId.mediaUrl}
                  alt="post"
                />

                <div className="post-hover-overlay">
                  <span>
                    <Heart size={18} /> {item.postId.likeCount}
                  </span>
                  <span>
                    <MessageCircle size={18} /> {item.postId.commentCount}
                  </span>
                </div>
              </div>
            );
          }
          if (activeSlot === "saved" && item.postId.type === "video") {
            return (
              <div onClick={()=>{navigate("/home/reels",{state:item.postId._id})}} key={item._id} className="post-item">
                <video
                  className="postImage"
                  src={item.postId.mediaUrl}
                  muted
                  preload="metadata"
                />

                <div className="post-hover-overlay">
                  <span>
                    <Heart size={18} /> {item.postId.likeCount}
                  </span>
                  <span>
                    <MessageCircle size={18} /> {item.postId.commentCount}
                  </span>
                </div>
              </div>
            );
          }
          return null;
        })}


      </div>
    </div>
  )
}

export default VeiwProfile

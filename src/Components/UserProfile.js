import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Loader from "./Loader";
import "./UserProfile.css";
import { useDispatch, useSelector } from 'react-redux';

import {
  User,
  Plus,
  Image,
  PlaySquare,
  Bookmark,
  Heart,
  MessageCircle,
} from "lucide-react";

function UserProfile() {
  const navigate=useNavigate()

  const user = useSelector((state) => state.user.user);
  const [disableBtn,setDisableBtn]=useState(false)
  
  const { username } = useParams();
  const [isFollowed,setIsFollowed]=useState(false)
  const [isReq,setIsReq]=useState(false)


  const [visitedUser, setVisitedUser] = useState(null);
  const [currentSection, setCurrentSection] = useState("post");
  const [userPosts, setUserPosts] = useState([]);

 const checkFollowed = async () => {
  try {
    const response = await axios.get(
      "http://localhost:8080/api/follow/check",
      {
        params: {
          follower: user.userName,
          following: username,
        },
      }
    );

    setIsFollowed(response.data.isFollowing);
    setIsReq(response.data.isPending);
    
  } catch (e) {
    console.log(e.response?.data?.error || "Backend error");
  }
}; 

const unfollowUser=async()=>{
  setDisableBtn(true);
  try{
    const response =await axios.delete("http://localhost:8080/api/unfollow", {
                  data: {
                    follower: user.userName,
                    following: username
                  }
                });
    
    checkFollowed()
    setDisableBtn(false)
  }
  catch(e){
    console.log(e.response?.data?.error || "Backend error");
   
  }
  finally{
    setDisableBtn(false)
  }
}



  const followUser=async()=>{
    setDisableBtn(true)
    try{
      const follow={follower:user.userName,following:username};
      const response=await axios.post("http://localhost:8080/api/follow",follow)
      console.log("followed✅")
      checkFollowed()
    }
    catch(e){
      console.log(e.response?.data?.message||"Backend error");
    }
    finally{
      setDisableBtn(false)
    }
  }

  const fetchPost = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/post/${username}`
      );
      setUserPosts(response.data);
    } catch (e) {
      console.log(e.response?.data?.error || "Backend error");
    }
  };


  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/users/${username}`
      );
      setVisitedUser(response.data);
    } catch (e) {
      console.log(e.response?.data?.error || "Backend error");
    }
  };

  useEffect(() => {
    if (username) {
      fetchCurrentUser();
      fetchPost();
      checkFollowed();
    }
  }, [username,user]);

  if (!visitedUser) return <Loader />;

  const imagePosts = userPosts.filter((p) => p.type === "image");
  const reelPosts = userPosts.filter((p) => p.type === "video");

  return (
    <div style={{ color: "white" }}>
      {/* ===== PROFILE HEADER ===== */}
      <div className="main-prof-divider-box">
        <div className="main-divider-item">
          <div className="main-user-pro-holder">
            {visitedUser.profilePictureUrl ? (
              <img src={visitedUser.profilePictureUrl} alt="profile" style={{width:"100%",height:"100%",borderRadius:"50%"}}/>
            ) : (
              <span id="lucide-user">
                <User size={48} />
              </span>
            )}
          </div>
        </div>

        <div className="main-divider-item sec-item-box">
          <div className="name-follow-msg-holder">
            <div className="username-actual">{visitedUser.userName}</div>
            {!isFollowed&&!isReq&&<button className="btn-design only-color-change1" disabled={disableBtn}  onClick={()=>{followUser()}}>Follow</button>}
            {isFollowed&&!isReq&&<button className="btn-design only-color-change1" disabled={disableBtn}  onClick={()=>{unfollowUser()}}>UnFollow</button>}
            {!isFollowed&&isReq&&<button className="btn-design only-color-change1" disabled={disableBtn} onClick={()=>{unfollowUser()}}>Requested</button>}


            <button className="btn-design only-color-change2" onClick={()=>{navigate("/home/messages",{
              state:{
                friendName:visitedUser.userName
              }
            })}}>Message</button>
          </div>

          <div className="post-follower-holder">
            <div>
              {visitedUser.postCount} <span className="attributes-imp">posts</span>
            </div>
            <div>
              {visitedUser.followerCount}{" "}
              <span className="attributes-imp">followers</span>
            </div>
            <div>
              {visitedUser.followingCount}{" "}
              <span className="attributes-imp">following</span>
            </div>
          </div>

          <div className="fullName-holder">{visitedUser.fullName}</div>
          <div className="bio-holder">{visitedUser.bio}</div>
        </div>
      </div>

      {/* ===== HIGHLIGHTS ===== */}
      <div className="main-hight-box">
        <div className="highlight-name-box">
          <div className="cirlcle-higlight-holder">
            <Plus size={32} />
          </div>
          <div className="highlight-name">New</div>
        </div>
      </div>

      {/* ===== TABS ===== */}
      <div className="post-have-division">
        <div
          className={`division-items ${
            currentSection === "post" ? "active-tab" : ""
          }`}
          onClick={() => setCurrentSection("post")}
        >
          <Image size={12} />
          <span> Post</span>
        </div>

        <div
          className={`division-items ${
            currentSection === "reel" ? "active-tab" : ""
          }`}
          onClick={() => setCurrentSection("reel")}
        >
          <PlaySquare size={12} />
          <span> Reels</span>
        </div>

        <div className="division-items">
          <Bookmark size={12} />
          <span> Saved</span>
        </div>
      </div>

      {/* ===== POSTS / REELS GRID ===== */}
      <div className="parent-post-holder">
        {/* EMPTY STATES */}
        {currentSection === "post" && imagePosts.length === 0 && (
          <div className="empty-text">No posts</div>
        )}

        {currentSection === "reel" && reelPosts.length === 0 && (
          <div className="empty-text">No reels</div>
        )}

        {userPosts.map((item) => {
          if (currentSection === "post" && item.type === "image") {
            return (
              <div  onClick={()=>{navigate("/home/reels",{state:item._id})}} key={item._id} className="post-item">
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

          if (currentSection === "reel" && item.type === "video") {
            return (
              <div  onClick={()=>{navigate("/home/reels",{state:item._id})}} key={item._id} className="post-item">
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
      </div>
    </div>
  );
}

export default UserProfile;

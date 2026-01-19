import React, { use, useRef, useState } from "react";
import "./PostCard.css";
import { Heart, MessageCircle, Bookmark, Play,Send } from "lucide-react";
import { useDispatch, useSelector } from 'react-redux';
import axios from "axios"
function PostCard({currPost, post,setShareBox }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const user = useSelector((state) => state.user.user);
  const [isLikes,setIsLike]=useState(post.isLiked);
  const [likeCount,setLikeCount]=useState(post.likeCount);
  const [isSaved,setIsSaved]=useState(post.isSaved);
 
  const handleVideoClick = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const likePost=async()=>{
    try{
      await axios.post("http://localhost:8080/api/post/like",{
        userId:user._id,
        postId:post._id
      })
      setIsLike(true)
      setLikeCount(likeCount+1);
    
    }catch(e){
      console.log(e.response?.data?.message||"Backend error");
    }
  }

  const savePost=async()=>{
     try{
      await axios.post("http://localhost:8080/api/post/saved",{
        userId:user._id,
        postId:post._id
      })
      setIsSaved(true);
    
    }catch(e){
      console.log(e.response?.data?.message||"Backend error");
    }
  }

  const removeSave = async () => {
  try {
    await axios.delete("http://localhost:8080/api/post/removesave", {
      data: {
        userId: user._id,
        postId: post._id
      }
    });
    setIsSaved(false);
  } catch (e) {
    console.log(e.response?.data?.message || "Backend error");
  }
};


  const unlikePost=async()=>{
    try{
      await axios.post("http://localhost:8080/api/post/unlike",{
        userId:user._id,
        postId:post._id
      })
      setIsLike(false)
      setLikeCount(likeCount-1);
    }catch(e){
      console.log(e.response?.data?.message||"Backend error");
    }
  }


  return (
    <div className="post-card-main-box">
      <div className="name-profile-first-holder">
        <div className="profile-holder-circle first-items">
          {post?.userId?.profilePictureUrl && (
            <img className="profile-pic" src={post.userId.profilePictureUrl} alt="profile" />
          )}
        </div>

        <div className="name-time-holder first-items">
          <div>{post?.userId?.userName}</div>
          <div className="post-time">2 hour ago</div>
        </div>
      </div>

      <div className="post-img-holder">
        {post.type === "image" && post.mediaUrl && (
          <img src={post.mediaUrl} alt="post" />
        )}

        {post.type === "video" && post.mediaUrl && (
          <div className="reel-wrapper" onClick={handleVideoClick}>
            <video ref={videoRef} src={post.mediaUrl} />
            {!isPlaying && (
              <div className="reel-play-overlay">
                <Play size={48} />
              </div>
            )}
          </div>
        )}
      </div>

      <div>
        <div className="like-comment-save-box">
          <div className="like-comment-save-item like-comment-box">
            {!isLikes&&<div className="like-comment-item" onClick={()=>{likePost()}}>
              <Heart size={20} /> <span>{likeCount}</span>
            </div>}
            {isLikes&&<div className="like-comment-item" onClick={()=>{unlikePost()}}>
              <Heart fill="red" size={20} stroke="none"/> <span>{likeCount}</span>
            </div>}
            <div onClick={()=>{currPost(post)}} className="like-comment-item">
              <MessageCircle size={20} /> <span>{post.commentCount}</span>
            </div>
            <div onClick={()=>{setShareBox(true);currPost(post)}} className="like-comment-item">
              <Send size={20} /> 
            </div>
          </div>
          <div className="like-comment-save-item">
            <Bookmark onClick={()=>{isSaved?removeSave():savePost()}} fill={isSaved?"#22d3ee":""} stroke={isSaved?"#22d3ee":"white"} size={32} />
          </div>
        </div>

        <div className="last-three-item">{likeCount} likes</div>

        <div className="last-three-item">
          <span>{post?.userId?.userName}:</span>
          <span> {post.caption}</span>
        </div>

        <div
          onClick={()=>{currPost(post)}}
          className="last-three-item"
          style={{ color: "grey", fontSize: "small", cursor: "pointer" }}
        >
          View all {post.commentCount} comments
        </div>
      </div>
    </div>
  );
}

export default PostCard;

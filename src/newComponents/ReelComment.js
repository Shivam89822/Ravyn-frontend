import React, { useEffect, useState,useRef } from "react";
import "./ReelComment.css";
import axios from "axios"
import { useDispatch, useSelector } from 'react-redux';
import { Play,Heart } from "lucide-react";
function ReelComment({post,setPost}) {

    const [commentValue, setCommentValue] = useState("");
  const user = useSelector((state) => state.user.user);
  const [isPosting, setIsPosting] = useState(false);
  const [comments, setComments] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);


  const videoRef = useRef(null);
  

  const likeComment = async (commentId) => {
  try {
    await axios.post("http://localhost:8080/api/post/likeComment", {
      userId: user._id,
      commentId
    });

    setComments(prev =>
      prev.map(c =>
        c._id === commentId
          ? { ...c, isLiked: true, likeCount: c.likeCount + 1 }
          : c
      )
    );
  } catch (e) {
    console.log(e.response?.data?.message || "error");
  }
};

const dislikeComment = async (commentId) => {
  try {
    await axios.post("http://localhost:8080/api/post/unlikeComment", {
      userId: user._id,
      commentId
    });

    setComments(prev =>
      prev.map(c =>
        c._id === commentId
          ? { ...c, isLiked: false, likeCount: c.likeCount - 1 }
          : c
      )
    );
  } catch (e) {
    console.log(e.response?.data?.message || "error");
  }
};

  

  const fetchComments = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/api/post/fetchComment",
        {
          params: { postId: post._id ,userId:user._id}
        }
      );
      setComments(response.data);
      console.log(response.data)
    } catch (e) {
      console.log(e.response?.data?.message || "error");
    }
  };

  const postComment = async () => {
    if (!commentValue.trim()) return;

    setIsPosting(true);
    try {
      await axios.post("http://localhost:8080/api/post/comment", {
        user: user._id,
        post: post._id,
        text: commentValue
      });
      setCommentValue("");
      fetchComments();
    } catch (e) {
      console.log(e.response?.data?.message || "error");
    } finally {
      setIsPosting(false);
    }
  };

  const toggleVideo = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    fetchComments();
  }, []);

  return (
    <div className="comment-backdrop2">
        <div className="comment-overlay">
            <div className="comment-right">
        
        <div className="comment-header">
          <div className="user-info">
            <div className="avatar">{post?.userId?.profilePictureUrl&&<img src={post?.userId?.profilePictureUrl} alt="" />}</div>
            <div>
              <div className="username">{post?.userId?.userName}</div>
              <div className="location">California, USA</div>
            </div>
          </div>
          <div className="close-btn" onClick={()=>{setPost(false)}}>✕</div>
        </div>

        
        <div className="caption">
          <span className="username">{post?.userId?.userName}: </span>
          <span>
            {post.caption}
            <span className="hashtags">
              #photography #nature #sunset
            </span>
          </span>
        </div>

      
        <div className="comments-list">

          {comments&&comments.map((item,key)=><div className="comment">
            <div key={key} className="avatar small"> {item.userId.profilePictureUrl&&<img className="imagefitter" src={item.userId.profilePictureUrl} alt="error" />}</div>
            <div className="comment-body">
              <span className="username">{item.userId.userName} </span>
              <span>{item.text}</span>
              <div className="meta">5h · {item.likeCount} likes</div>
            </div>
            <div className="like">{!item.isLiked&&<Heart onClick={()=>{likeComment(item._id)}} size={16}/>}{item.isLiked && <Heart onClick={()=>{dislikeComment(item._id)}} fill="red" stroke="none" size={16} />}</div>
          </div>)}
         
        </div>

        {/* ACTIONS */}
        <div className="post-ended-box"> 
          <div>
            no more post
          </div>
        </div>

        {/* ADD COMMENT */}
        <div className="add-comment">
          <span className="emoji">😊</span>
          <input type="text" placeholder="Add a comment..." value={commentValue} onChange={(e)=>setCommentValue(e.target.value)}/>
          <button onClick={()=>{postComment()}} disabled={isPosting}>Post</button>
        </div>
      </div>
        </div>  
    </div>
  )
}

export default ReelComment

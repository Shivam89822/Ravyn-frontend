import React, { useEffect, useState ,useRef} from "react";
import "./SearchTab.css";
// import '../Components/UserProfile.css'
import axios from "axios";
import FeedLoader from "../Components/FeedLoader"

import {
  User,
  Plus,
  Image,
  PlaySquare,
  Bookmark,
  Heart,
  MessageCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
function SearchTab() {
  const [isLoading,setIsLoading]=useState(false)
  const [post, setPost] = useState([]);
  const [cursorTime, setCursorTime] = useState(null);
  const [hasMore,setHashMore]=useState(true);
  const bottomRef=useRef(null)
  const fetchedOnce = useRef(false);
  const navigate=useNavigate();
  const fetchReels = async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    try {
      const response = await axios.get(
        " https://ravyn-backend.onrender.com/api/reels/search",
        {
          params: { cursorTime: cursorTime },
        }
      );
      console.log(response.data);
      const {reels:reels,nextCursorTime:nextCursorTime,hasMore:hasMore}=response.data;
      if(reels){
        setPost(prev=>[...prev,...reels]);
        setCursorTime(nextCursorTime);
        setHashMore(hasMore);
      }
      
    } catch (e) {
      console.log(e);
    }
    finally{
      setIsLoading(false)
    }
  };
 useEffect(() => {
  if (fetchedOnce.current) return;
  fetchedOnce.current = true;
  fetchReels();
}, []);

useEffect(() => {
  if (!hasMore || isLoading) return;
  if (!bottomRef.current) return;

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        fetchReels();
      }
    },
    { threshold: 0.3 }
  );

  observer.observe(bottomRef.current);

  return () => observer.disconnect(); 
}, [hasMore, isLoading, cursorTime]);


  return (
    <div>
    <div className="main-reel-holder">  
      {post.map((item, index) => {
        return item.type =="video" ? (
          <div onClick={()=>{navigate("/home/reels",{state:item.postId})}} key={index} className="post-item">
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
        ) : (
          <div onClick={()=>{navigate("/home/reels",{state:item._id})}} key={index} className="post-item">
            <img className="postImage" src={item.mediaUrl} alt="post" />
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
      })}
    </div>
    {isLoading&&<div><FeedLoader/></div>}
    <div ref={bottomRef}></div>
    </div>
  );
}

export default SearchTab;

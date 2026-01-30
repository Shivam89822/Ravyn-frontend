import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import axios from "axios";
import "./Feed.css";
import PostCard from "./PostCard";
import FeedLoader from "./FeedLoader";
import CommentBox from "../newComponents/CommentBox";
import { Plus } from "lucide-react";
import ShareBox from "../newComponents/ShareBox";
import PreviewStatus from "../newComponents/PreviewStatus";
import { useNavigate } from "react-router-dom";
import { hideBottomNav, showBottomNav } from "../features/user/UiSlice";
function Feed() {
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();
  const [currPost,setCurrPost]=useState(null)
  const [feed, setFeed] = useState([]);
  const [cursorTime, setCursorTime] = useState(null);
  const [loader, setLoader] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [shareBox,setShareBox]=useState(false)
  const [statusPreview,setStatusPreview]=useState(null);
  const [status,setStatus]=useState([])
  const statusFileRef=useRef(null);
  const navigate=useNavigate();
  const [viralCursor, setViralCursor] = useState(null);
  const [hasMoreViral,setHasMoreViral]=useState(true);
  

  const bottomRef = useRef(null);
  const observerRef = useRef(null);
  // const [isComment,setIsComment]=useState(false);

  const handleStatusClick=()=>{
    statusFileRef.current.click();
  }


  const fetchStatus=async(req,res)=>{
    try{
      const response =await axios.get("http://localhost:8080/api/status/get",{
        params:{userId:user._id}
      });
    setStatus(response.data);
    }catch(e){
      console.log(e.response?.data?.message||"Backend error");
    }
  }

  useEffect(() => {
  if (currPost) {
    dispatch(hideBottomNav());
  } else {
    dispatch(showBottomNav());
  }

  return () => dispatch(showBottomNav());
}, [currPost]);




  const fetchFeed = async () => {
    if (!user || loader || !hasMore) return; 

    setLoader(true);

    try {
      const response = await axios.get(
        "http://localhost:8080/api/user/feed",
        {
          params: {
            limit: 5,
            userName: user.userName,
            cursor_time: cursorTime
          }
        }
      );

      const { posts, nextCursor } = response.data;

      if (!posts || posts.length === 0) {
        setHasMore(false);
        return;
      }

      setFeed(prev => {
        const existingIds = new Set(prev.map(p => p._id));
        const uniqueNewPosts = posts.filter(p => !existingIds.has(p._id));
        return [...prev, ...uniqueNewPosts];
      });
      setCursorTime(nextCursor);
      
    } catch (e) {
      console.log(e.response?.data?.message || "Backend Error");
    } finally {
      setLoader(false);
    }
  };

  const fetchViralFeed=async()=>{
    if (!user || loader || !hasMoreViral) return; 

    setLoader(true);
    try{
      const response =await axios.get("http://localhost:8080/api/post/fetchviralreel",{params:{viralCursor:viralCursor}});
      const { reels, nextCursor } = response.data;
      if (!reels || reels.length < 3) {
      
        setHasMoreViral(false);
        return;
      }
      setFeed(prev => {
        const existingIds = new Set(prev.map(p => p._id));
        const uniqueNewPosts = reels.filter(p => !existingIds.has(p._id));
        return [...prev, ...uniqueNewPosts];
      });
      setViralCursor(nextCursor);

    }catch(e){
      console.log(e.response?.data?.message);
    }finally{
      setLoader(false)
    }
  }

  useEffect(() => {
    if (user) {
      setFeed([]);
      setCursorTime(null);
      setHasMore(true);
      fetchFeed();
      fetchStatus();
    }
  }, [user]);

 useEffect(() => {
  if (!bottomRef.current || !user) return;

  if (observerRef.current) {
    observerRef.current.disconnect();
  }

  observerRef.current = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting && !loader&&hasMoreViral) {
        if (hasMore) {
          fetchFeed();
        } else if (hasMoreViral) {
          fetchViralFeed();
        }
      }
    },
    {
      root: null,
      rootMargin: "200px",
      threshold: 0
    }
  );

  observerRef.current.observe(bottomRef.current);

  return () => observerRef.current?.disconnect();
}, [user, hasMore, hasMoreViral, loader]);


  return (
    <div className="feed-superior-box">
      {statusPreview&&<PreviewStatus statusRef={statusFileRef} status={statusPreview} setStatus={setStatusPreview}/>}
      <div className="feed-box-item-holder main-post-container">
        <div className="status-box">
         <div>
            <div className="status-item-box" onClick={()=>{handleStatusClick()}}><Plus size={32} fill="#21B1C7" stroke="#21B1C7"/></div>
            <div className="story-name">Your Story</div>
          </div>
          <input type="file" style={{display:"none"}} onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setStatusPreview({
                        url: URL.createObjectURL(file),
                        type: file.type // "image/png", "video/mp4"
                      });
                }
              }} ref={statusFileRef} name="" id="" />

          {status.map((item,key)=>(
          <div onClick={()=>{navigate(`/status/${item.user.userName}`)}}>
            <div className="status-item-box">{item.user.profilePictureUrl&&<img style={{width:"100%",height:"100%",borderRadius:"50%"}} src={item.user.profilePictureUrl}/>}</div>
            <div className="story-name">{item.user.userName}</div>
          </div>
          ))}
                   
        </div>
        <div
          className="post-card-holder-box"
          style={{ display: "flex", flexDirection: "column", gap: "16px" }}
        >
          {feed.map(item => (
            <PostCard currPost={setCurrPost} setShareBox={setShareBox}  key={item._id} post={item} />
          ))}
         
            {currPost&&!shareBox&&<div>
              <CommentBox  post={currPost} setPost={setCurrPost}/>
            </div>}
            {shareBox&&<ShareBox setPost={setCurrPost} post={currPost} setShareBox={setShareBox}/>}
            
          {loader && <FeedLoader />}

          {(hasMore || hasMoreViral) && <div ref={bottomRef} style={{ height: "1px" }} />}

        </div>
      </div>

      <div className="feed-box-item-holder side-follow-suggestions">

        <div className="suggestion-box">
          <div className="suggest-message">SUGGESTED FOR YOU</div>
          <div>
            <div className="follow-suggestion-item"> 
              <div className="prof-holder-circle"></div>
              <div>
                <div>mike_dev</div>
                <div className="followed-by-text">followed by alex_photo</div>
              </div>
              <div>
                <button className="follow-btn">follow</button>
              </div>
            </div>
             <div className="follow-suggestion-item"> 
              <div className="prof-holder-circle"></div>
              <div>
                <div>mike_dev</div>
                <div className="followed-by-text">followed by alex_photo</div>
              </div>
              <div>
                <button className="follow-btn">follow</button>
              </div>
            </div>
             <div className="follow-suggestion-item"> 
              <div className="prof-holder-circle"></div>
              <div>
                <div>mike_dev</div>
                <div className="followed-by-text">followed by alex_photo</div>
              </div>
              <div>
                <button className="follow-btn">follow</button>
              </div>
            </div>
             <div className="follow-suggestion-item"> 
              <div className="prof-holder-circle"></div>
              <div>
                <div>mike_dev</div>
                <div className="followed-by-text">followed by alex_photo</div>
              </div>
              <div>
                <button className="follow-btn">follow</button>
              </div>
            </div>
           

          </div>
        </div>
        
      </div>
      
    </div>
  );
}

export default Feed;

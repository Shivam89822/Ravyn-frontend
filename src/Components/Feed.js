import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import "./Feed.css";
import PostCard from "./PostCard";
import FeedLoader from "./FeedLoader";
import CommentBox from "../newComponents/CommentBox";
import { Plus } from "lucide-react";
import api from "../utils/axios.js";
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
  const [initialLoading, setInitialLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [shareBox,setShareBox]=useState(false)
  const [statusPreview,setStatusPreview]=useState(null);
  const [status,setStatus]=useState([])
  const statusFileRef=useRef(null);
  const navigate=useNavigate();
  const [suggestion,setSuggestion]=useState([]);
  

  const bottomRef = useRef(null);
  const observerRef = useRef(null);
  const isFetchingRef = useRef(false);
  // const [isComment,setIsComment]=useState(false);

  const handleStatusClick=()=>{
    statusFileRef.current.click();
  }

const fetchSuggestions = useCallback(async () => {
  try {
    const response = await api.get(
      "/api/user/friend-suggestions",
      {
        params: { userId: user._id }
      }
    );
    setSuggestion(response.data);

  } catch (e) {
    console.log(e.response?.data?.message || "Error fetching suggestions");
  }
}, [user?._id]);

  const fetchStatus = useCallback(async () => {
    try{
      const response = await api.get("/api/status/get",{
        params:{userId:user._id}
      });
      setStatus(response.data);
    }catch(e){
      console.log(e.response?.data?.message||"Backend error");
    }
  }, [user?._id]);

  useEffect(() => {
  if (currPost) {
    dispatch(hideBottomNav());
  } else {
    dispatch(showBottomNav());
  }

  return () => dispatch(showBottomNav());
}, [currPost, dispatch]);

  const fetchFeedPage = useCallback(async ({ nextCursor = null, replace = false } = {}) => {
    if (!user?.userName || isFetchingRef.current) return;

    isFetchingRef.current = true;
    if (replace) {
      setInitialLoading(true);
    } else {
      setLoader(true);
    }

    try {
      const response = await api.get("/api/post/feed", {
        params: {
          limit: 5,
          userName: user.userName,
          cursor_time: nextCursor,
        }
      });

      const { posts, nextCursor: incomingCursor } = response.data;

      if (!posts || posts.length === 0) {
        setHasMore(false);
        if (replace) {
          setFeed([]);
        }
        return;
      }

      setHasMore(true);
      setFeed((prev) => {
        if (replace) {
          return posts;
        }

        const existingIds = new Set(prev.map((p) => p._id));
        const uniqueNewPosts = posts.filter((p) => !existingIds.has(p._id));
        return [...prev, ...uniqueNewPosts];
      });
      setCursorTime(incomingCursor || null);
    } catch (e) {
      console.log(e.response?.data?.message || "Backend Error");
    } finally {
      isFetchingRef.current = false;
      setInitialLoading(false);
      setLoader(false);
    }
  }, [user?.userName]);

  const followUser=async(userName)=>{
    try{
      await api.post("/api/follow",{
        follower:user.userName,following:userName
      });
      const newSuggestion = suggestion.filter(item => item.userName !== userName);
      setSuggestion(newSuggestion);
    }catch(e){
      console.log(e.response?.data?.message);
    }
  }

  useEffect(() => {
    if (!user?._id) return;

    setFeed([]);
    setCursorTime(null);
    setHasMore(true);
    fetchStatus();
    fetchSuggestions();
    fetchFeedPage({ nextCursor: null, replace: true });
  // This effect should only reset the feed when the active user changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

 useEffect(() => {
  if (!bottomRef.current || !user || !feed.length || !hasMore) return;

  if (observerRef.current) {
    observerRef.current.disconnect();
  }

  observerRef.current = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting && !loader && !initialLoading && hasMore) {
        fetchFeedPage({ nextCursor: cursorTime, replace: false });
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
}, [user, feed.length, hasMore, loader, initialLoading, cursorTime, fetchFeedPage]);


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

          {status.map((item)=>(
          <div key={item._id || item.user.userName} onClick={()=>{navigate(`/status/${item.user.userName}`)}}>
            <div className="status-item-box">{item.user.profilePictureUrl&&<img style={{width:"100%",height:"100%",borderRadius:"50%"}} src={item.user.profilePictureUrl} alt={`${item.user.userName} story`} />}</div>
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
            
          {(initialLoading || loader) && <FeedLoader />}

          {hasMore && <div ref={bottomRef} style={{ height: "1px" }} />}

        </div>
      </div>

      <div className="feed-box-item-holder side-follow-suggestions">

        <div className="suggestion-box">
          <div className="suggest-message">SUGGESTED FOR YOU</div>
          {suggestion.map((item)=>(
              <div key={item._id || item.userName} className="follow-suggestion-item"> 
              <div className="prof-holder-circle">{item.profilePictureUrl.length>0&&<img style={{height:'100%',width:'100%',borderRadius:"50%"}} src={item.profilePictureUrl} alt="" />}</div>
              <div>
                <div>{item.fullName}</div>
                <div className="followed-by-text">suggested for you</div>
              </div>
              <div>
                <button className="follow-btn" onClick={()=>{followUser(item.userName)}}>follow</button>
              </div>
            </div>

          ))}
          {/*  */}
        </div>
        
      </div>
      
    </div>
  );
}

export default Feed;

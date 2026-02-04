import React, { useEffect, useRef, useState } from 'react'
import "./ReelSection.css"
import ReelItem from './ReelItem'
import { useSelector } from "react-redux";
import axios from 'axios';
import { useLocation } from 'react-router-dom';
function ReelSection() {
    const [reels,setReels]=useState([]);
    const [cursorTime,setCursorTime]=useState(null)
    const [hasMore, setHasMore] = useState(true);
    const user = useSelector((state) => state.user?.user);
    const lastRef=useRef(null)
    const location = useLocation();
    const reelId = location.state;   

const fetchReel=async()=>{
    try{
        const response = await axios.get(" https://ravyn-backend.onrender.com/api/reels", {
        params: { userId: user?._id, cursorTime }
      });
        const {hasMore:hasMore,nextCursorTime:nextCursorTime,reels:reels}= response.data
        console.log(reels)
        
        if(reels.length>0){
          setReels(prev => {
            const safePrev = prev || [];
            const existingIds = new Set(safePrev.map(reel => reel._id));
            const uniqueReels = reels.filter(reel => !existingIds.has(reel._id));

            const combined = [...safePrev, ...uniqueReels];

            if (combined.length > 9) {
                return combined.slice(3);
            }
            return combined;
            });
            setCursorTime(nextCursorTime);
            setHasMore(hasMore)
        }
        console.log(reels)
      
    }
    catch(e){
        console.log(e);
    }
}

const fetchOnePost=async()=>{
  try{
    const response=await axios.get(" https://ravyn-backend.onrender.com/api/post/fetchone",{params:{reelId:reelId}})
    setReels([response.data]);
    setHasMore(true);    
  }catch(e){
    console.log(e.response?.data?.message);
  }
}

useEffect(() => {
  if (!hasMore || reels.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      if (entry.isIntersecting) {
        fetchReel(); // 🔥 fetch next batch
      }
    },
    { threshold: 0.6 }
  );

  const lastElement = lastRef.current;
  if (lastElement) observer.observe(lastElement);

  return () => observer.disconnect();
}, [reels, hasMore]);


useEffect(() => {
  if (reelId) {
    fetchOnePost(); 
  } else {
    fetchReel();    
  }
}, []);

  return (
    <div className='vdp-reel-main-viewport'>
     <div className='vdp-reel-scroll-engine'>
        {reels.map((reel,index) => {
          const isLast = index === reels.length - 1;
          return (
            <div
            ref={isLast?lastRef:null}
            key={reel._id}
            >
              <ReelItem reel={reel} />
            </div>
          )
          
        })}
     </div>
    </div>
  )
}

export default ReelSection

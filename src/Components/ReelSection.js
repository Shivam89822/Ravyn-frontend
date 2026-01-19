import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from "react-redux";
import axios from "axios";
import { Heart, MessageCircle, Send, Bookmark, MoreVertical, Music2, Volume2, VolumeX } from 'lucide-react';
import "./ReelSection.css";

const ReelSection = () => {
  const [reels, setReels] = useState([]);
  const [cursorTime, setCursorTime] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const user = useSelector((state) => state.user?.user);

  const fetchReels = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/reels", {
        params: { userId: user?._id, cursorTime }
      });
     const { reels: fetchedReels, nextCursorTime, hasMore: more } = response.data;

if (fetchedReels.length > 0) {
    setReels(prev => {
        // 1. Create a map of existing IDs to ensure uniqueness
        const existingIds = new Set(prev.map(reel => reel._id));
        
        // 2. Only add reels that don't already exist in the state
        const uniqueNewReels = fetchedReels.filter(reel => !existingIds.has(reel._id));
        
        // 3. Combine them
        const combined = [...prev, ...uniqueNewReels];

        // 4. Apply your project logic: If more than 9, discard first 3
        if (combined.length > 9) {
            return combined.slice(3);
        }
        return combined;
    });

    // 5. Update the cursor to ensure the next fetch is different
    setCursorTime(nextCursorTime);
    setHasMore(more);
}
    } catch (e) { console.error(e); }
  }, [cursorTime, hasMore, user?._id]);

  useEffect(() => { fetchReels(); }, []);

  return (
    <div className="vdp-reel-main-viewport">
      <div className="vdp-reel-scroll-engine">
        {reels.map((reel) => (
          <ReelItem key={reel._id} reel={reel} />
        ))}
      </div>
    </div>
  );
};

const ReelItem = ({ reel }) => {
  const videoRef = useRef(null);
  const playPromiseRef = useRef(null);
  // We start muted: TRUE to ensure the video actually plays on refresh
  const [isMuted, setIsMuted] = useState(true); 
  const [isLiked, setIsLiked] = useState(false);

  const handleManualPlay = () => {
    // Once the user clicks the video, we can safely unmute
    if (videoRef.current) {
      const wasPaused = videoRef.current.paused;
      if (wasPaused) {
        videoRef.current.play();
      } else {
        // Toggle Mute on click to allow user to "start" the sound
        setIsMuted(!isMuted);
      }
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      async (entries) => {
        const entry = entries[0];
        const video = videoRef.current;
        if (!video) return;

        if (entry.isIntersecting) {
          try {
            // We play MUTED initially to satisfy the browser policy
            video.muted = true; 
            playPromiseRef.current = video.play();
            await playPromiseRef.current;
            
            // AFTER it starts playing muted, we try to unmute if the user has interacted
            // If they haven't, this won't throw an error, it just won't play sound.
          } catch (err) {
            console.warn("Autoplay blocked. User must click to hear sound.");
          }
        } else {
          if (playPromiseRef.current) await playPromiseRef.current;
          video.pause();
          video.currentTime = 0;
        }
      },
      { threshold: 0.8 }
    );
    if (videoRef.current) observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, []);
  
  return (
    <div className="vdp-reel-card-container">
      <video
        ref={videoRef}
        className="vdp-reel-video-element"
        src={reel.mediaUrl}
        loop
        muted={isMuted}
        playsInline
        onClick={handleManualPlay}
      />

      <button className="vdp-reel-volume-btn" onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}>
        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>

      {/* Tap to Unmute Overlay (Only shows if muted) */}
      {isMuted && <div className="vdp-reel-tap-hint">Tap for sound</div>}

      <div className="vdp-reel-ui-layer">
        <div className="vdp-reel-interactions-bar">
          <div className="vdp-reel-icon-box" onClick={(e) => { e.stopPropagation(); setIsLiked(!isLiked); }}>
            <Heart size={30} fill={isLiked ? "#ec4899" : "none"} color={isLiked ? "#ec4899" : "white"} />
            <span className="vdp-reel-stat-label">{reel.likeCount || 0}</span>
          </div>
          <div className="vdp-reel-icon-box"><MessageCircle size={30} color="white" /><span className="vdp-reel-stat-label">{reel.commentCount || 0}</span></div>
          <div className="vdp-reel-icon-box"><Send size={28} color="white" /></div>
          <div className="vdp-reel-icon-box"><Bookmark size={28} color="white" /></div>
          <div className="vdp-reel-icon-box"><MoreVertical size={28} color="white" /></div>
        </div>

        <div className="vdp-reel-content-footer">
          <div className="vdp-reel-user-identity">
            <div className="vdp-reel-avatar-wrapper">
              <img src={reel.userId?.profilePictureUrl} alt="profile" />
            </div>
            <span className="vdp-reel-author-name">@{reel.userId?.userName}</span>
            <button className="vdp-reel-follow-chip">Follow</button>
          </div>
          <p className="vdp-reel-description">{reel.caption}</p>
          <div className="vdp-reel-audio-meta">
            <Music2 size={14} />
            <div className="vdp-reel-marquee-track">
               <span>Original Audio • {reel.userId?.userName}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ReelSection;
import React, { useState, useEffect,useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Volume2, VolumeX, Play, Pause, Heart, Send, ChevronLeft, ChevronRight,X } from "lucide-react";
import "./StatusElement.css";
import { useSelector } from "react-redux";
import axios from "axios"

function StatusElement() {
  const touchStartX = useRef(0);
const touchEndX = useRef(0);
const MIN_SWIPE_DISTANCE = 50;

  const [status, setStatus] = useState([]);
  const user = useSelector((state) => state.user.user);
  const { username } = useParams();
  const [currIdx, setCurrIdx] = useState(0);
  const videoRefs = useRef([]);
  const [isMuted, setIsMuted] = useState(true); 
  const [isPlay, setPlay] = useState(true); 
  const navigate=useNavigate();

  const containerRef=useRef(null);
  const fetchStatus = async () => {
    try {
      const response = await axios.get(" https://ravyn-backend.onrender.com/api/status/get", {
        params: { userId: user._id },
      });
      const data = response.data;
      const index = data.findIndex((item) => item.user.userName === username);
      setStatus(data);
      data(response.data)
      setCurrIdx(index !== -1 ? index : 0);
    } catch (e) {
      console.log(e.response?.data?.message || "Backend error");
    }
  };

  
  const [isTransitioning, setIsTransitioning] = useState(false);

  const getTimeAgo = (date) => {
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    return hours > 0 ? `${hours}h` : "now";
  };

  const handlePrev = () => {
    if (isTransitioning) return;
    if (currIdx > 0) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrIdx(currIdx - 1);
        setIsTransitioning(false);
      }, 100);
    }
  };

  const handleTouchStart = (e) => {
  touchStartX.current = e.touches[0].clientX;
};

const handleTouchMove = (e) => {
  touchEndX.current = e.touches[0].clientX;
};

const handleTouchEnd = () => {
  const distance = touchStartX.current - touchEndX.current;

  if (Math.abs(distance) < MIN_SWIPE_DISTANCE) return;

  if (distance > 0) {
    handleNext();
  } else {
    handlePrev();
  }
};


  const handleNext = () => {
    if (isTransitioning) return;
    if (currIdx < status.length - 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrIdx(currIdx + 1);
        setIsTransitioning(false);
      }, 100);
    }
  };
  function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  const toggleMute = () => {
  const currentVideo = videoRefs.current[currIdx];
  if (currentVideo) {
    const newMutedStatus = !currentVideo.muted;
    currentVideo.muted = newMutedStatus; // Change actual audio
    setIsMuted(newMutedStatus);         // Trigger React re-render for icon
  }
 };

 const togglePlay = () => {
  const video = videoRefs.current[currIdx];
  if (!video) return;

  if (video.paused) {
    video.play().catch(() => {});
    setPlay(true);
  } else {
    video.pause();
    setPlay(false);
  }
};

  const getItemClass = (index) => {
    if (index === currIdx) return "status-item center";
    if (index === currIdx - 1) return "status-item left";
    if (index === currIdx + 1) return "status-item right";
    return "status-item hidden";
  };
  useEffect(()=>{
    if(user)fetchStatus()
  },[])

useEffect(() => {
  videoRefs.current.forEach((video, i) => {
    if (!video) return;

    if (i === currIdx) {
      video.muted = isMuted; 
      video.currentTime = 0;
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  });
}, [currIdx, status, isMuted]);


  return (
    <div className="supreme-story-holder">
      <div className="cross-holder">
        <X size={30} color="white" onClick={()=>{navigate("/Home")}}/>
      </div>
      <button
        className={`nav-button prev-button ${currIdx === 0 ? "disabled" : ""}`}
        onClick={handlePrev}
        disabled={currIdx === 0 || isTransitioning}
      >
        <ChevronLeft size={32} />
      </button>

      <div className="carousel-container">
        {status.map((item, index) => (
          <div
            key={item._id}
            className={getItemClass(index)}
            ref={index === currIdx ? containerRef : null}
            onTouchStart={index === currIdx ? handleTouchStart : undefined}
            onTouchMove={index === currIdx ? handleTouchMove : undefined}
            onTouchEnd={index === currIdx ? handleTouchEnd : undefined}
>

            {item.type === "image" ? (
              <img
                className="status-media"
                src={item.mediaUrl}
                alt={`status by ${item.user.userName}`}
              />
            ) : (
              <video
                className="status-media"
                src={item.mediaUrl}
                ref={(el) => (videoRefs.current[index] = el)}
                muted
                loop
                playsInline
              />
            )}
    
            {index === currIdx && (
              <>
                <div className="upper-reel-overlay">
                  <div className="upper-overlay-item">
                    <div className="avatar">{item.user.userName.charAt(0).toUpperCase()}</div>
                    <div className="user-name-holder">{item.user.userName}</div>
                    <div className="time-holder">{getTimeAgo(item.createdAt)}</div>
                  </div>
                  <div className="upper-overlay-item">
                    <div className="icon-btn" onClick={toggleMute}>
                      {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </div>
                    <div className="icon-btn" onClick={togglePlay}>
                       {isPlay ? <Pause size={20} /> : <Play size={20} />}
                    </div>
                  </div>
                </div>

                <div className="lower-reel-overlay">
                  <div className="reply-input">
                    <input placeholder={`Reply to ${item.user.userName}`} type="text" />
                  </div>
                  <div className="lower-icon-holder">
                    <Heart size={22} />
                  </div>
                  <div className="lower-icon-holder">
                    <Send size={22} />
                  </div>
                </div>

                {item.elements.map((el, index) => (
          <div
            key={index}
            className="text-overlay"
            
            style={{
              position: "absolute",
              left: `${el.x * 100}%`,
              top: `${el.y * 100}%`,
              width: `${el.width * 100}%`,
              height: `${el.height * 100}%`,
              zIndex: 1,
              cursor: "pointer",
              fontSize: `${el.style.fontSizeRatio * (containerRef.current?.offsetWidth || 0)}px`,
              backgroundColor: `${hexToRgba(el.style.background, el.opacity)}`,
              fontFamily: `${el.style.fontFamily}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              wordBreak: 'break-word'
            }}
          >
            {el.content}
          </div>
        ))}
              </>
            )}

            {index !== currIdx && (
              <div className="side-overlay">
                <div className="side-info">
                  <div className="small-avatar">{item.user.userName.charAt(0).toUpperCase()}</div>
                  <div className="small-username">{item.user.userName}</div>
                  <div className="small-time">{getTimeAgo(item.createdAt)}</div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        className={`nav-button next-button ${currIdx === status.length - 1 ? "disabled" : ""}`}
        onClick={handleNext}
        disabled={currIdx === status.length - 1 || isTransitioning}
      >
        <ChevronRight size={32} />
      </button>
    </div>
  );
}

export default StatusElement;
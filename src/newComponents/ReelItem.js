import React, { useState, useRef, useEffect } from "react";
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreVertical,
  Music2,
  Volume2,
  VolumeX,
  ArrowLeft,
} from "lucide-react";
import "./ReelItem.css";
import axios from "axios";
import { useSelector } from "react-redux";
import ReelComment from "./ReelComment";
import { useNavigate } from "react-router-dom";
import ShareBox from "./ShareBox";
import api from "../utils/axios.js";
function ReelItem({ reel }) {
  const [shareOn, setShareOn] = useState(false);
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const playPromiseRef = useRef(null);
  const user = useSelector((state) => state.user?.user);
  const [isSaved, setIsSaved] = useState(reel.isSaved);
  const navigate = useNavigate();

  const isVideo = reel.type === "video";
  const isImage = reel.type === "image";

  const [isMuted, setIsMuted] = useState(true);
  const [isLiked, setIsLiked] = useState(reel.isLiked);
  const [likeCount, setLikeCount] = useState(reel.likeCount);
  const [commentOn, setCommentOn] = useState(false);

  const watchStartRef = useRef(null);
  const totalWatchTimeRef = useRef(0);
  const hasSentRef = useRef(false);

  const handleManualPlay = () => {
    if (!isVideo) return;
    const video = videoRef.current;
    if (!video) return;
    video.paused ? video.play() : video.pause();
  };

  const savePost = async () => {
    try {
      await api.post("/api/post/saved", {
        userId: user._id,
        postId: reel._id,
      });
      setIsSaved(true);
    } catch (e) {
      console.log(e.response?.data?.message || "Backend error");
    }
  };

  const removeSave = async () => {
    try {
      await api.delete("/api/post/removesave", {
        data: {
          userId: user._id,
          postId: reel._id,
        },
      });
      setIsSaved(false);
    } catch (e) {
      console.log(e.response?.data?.message || "Backend error");
    }
  };

  const likePost = async () => {
    try {
        setIsLiked(true);
      setLikeCount((prev) => prev + 1);
      await api.post("/api/likepath/like", {
        userId: user._id,
        postId: reel._id,
      });
    
    } catch (e) {
      console.log(e.response?.data?.message || "Backend error");
    }
  };

  const unlikePost = async () => {
    setIsLiked(false);
      setLikeCount((prev) => prev - 1);
    try {
      await api.post("/api/likepath/unlike", {
        userId: user._id,
        postId: reel._id,
      });
      
    } catch (e) {
      console.log(e.response?.data?.message || "Backend error");
    }
  };

  const sendEngagement = async () => {
    if (!user?._id || hasSentRef.current) return;

    if (watchStartRef.current) {
      const watched =
        (Date.now() - watchStartRef.current) / 1000;
      totalWatchTimeRef.current += watched;
      watchStartRef.current = null;
    }

    if (totalWatchTimeRef.current < 1 && !isLiked && !isSaved) return;

    hasSentRef.current = true;

    let percentWatched = 0;

    if (isVideo && videoRef.current) {
      const duration = videoRef.current.duration || 1;
      percentWatched = Math.min(
        (totalWatchTimeRef.current / duration) * 100,
        100
      );
    } else {
      percentWatched = 50;
    }

    try {
     
      await api.post(
        "/api/post/engagement",
        {
          userId: user._id,
          postId: reel._id,
          percentWatched,
          liked: isLiked,
          saved: isSaved,
        }
      );
    } catch (err) {
      console.log("Engagement send failed");
    }
  };

  useEffect(() => {
    const element = isVideo ? videoRef.current : containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      async ([entry]) => {
        try {
          if (entry.isIntersecting) {
            hasSentRef.current = false;
            if (isVideo && videoRef.current) {
              watchStartRef.current = Date.now();
              playPromiseRef.current = videoRef.current.play();
              await playPromiseRef.current;
              setIsMuted(false);
            }
          } else {
            if (watchStartRef.current) {
              const watched =
                (Date.now() - watchStartRef.current) / 1000;
              totalWatchTimeRef.current += watched;
              watchStartRef.current = null;
            }

            if (isVideo && videoRef.current) {
              videoRef.current.pause();
              videoRef.current.currentTime = 0;
            }

            sendEngagement();
          }
        } catch (err) {
          console.log("Autoplay blocked:", err);
        }
      },
      { threshold: 0.8 }
    );

    observer.observe(element);

    return () => {
      if (watchStartRef.current) {
        const watched =
          (Date.now() - watchStartRef.current) / 1000;
        totalWatchTimeRef.current += watched;
        watchStartRef.current = null;
      }
      sendEngagement();
      observer.disconnect();
    };
  }, [isVideo]);

  useEffect(() => {
    document.body.style.overflow = commentOn ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [commentOn]);

  return (
    <div ref={containerRef} className="vdp-reel-card-container">
      <div
        className="back-arrow"
        onClick={() => {
          navigate("/home");
        }}
      >
        <ArrowLeft size={24} color="white" />
      </div>

      {isVideo && (
        <>
          <video
            ref={videoRef}
            className="vdp-reel-video-element"
            src={reel.mediaUrl}
            loop
            muted={isMuted}
            playsInline
            autoPlay
            onClick={handleManualPlay}
          />

          <button
            className="vdp-reel-volume-btn"
            onClick={(e) => {
              e.stopPropagation();
              setIsMuted((prev) => !prev);
            }}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>

          {isMuted && (
            <div className="vdp-reel-tap-hint">Tap for sound</div>
          )}
        </>
      )}

      {isImage && (
        <img
          src={reel.mediaUrl}
          alt="reel"
          className="vdp-reel-image-element"
        />
      )}

      <div className="vdp-reel-ui-layer">
        <div className="vdp-reel-interactions-bar">
          <div className="vdp-reel-icon-box">
            <Heart
              size={30}
              onClick={() => (isLiked ? unlikePost() : likePost())}
              fill={isLiked ? "#ec4899" : "none"}
              color={isLiked ? "#ec4899" : "white"}
            />
            <span className="vdp-reel-stat-label">
              {likeCount}
            </span>
          </div>

          <div
            className="vdp-reel-icon-box"
            onClick={() =>
              setCommentOn((prev) => !prev)
            }
          >
            <MessageCircle size={30} color="white" />
            <span className="vdp-reel-stat-label">
              {reel.commentCount}
            </span>
          </div>

          <div
            className="vdp-reel-icon-box"
            onClick={() => setShareOn(true)}
          >
            <Send size={28} color="white" />
          </div>

          <div className="vdp-reel-icon-box">
            <Bookmark
              onClick={() =>
                isSaved ? removeSave() : savePost()
              }
              fill={isSaved ? "#22d3ee" : "white"}
              stroke={isSaved ? "#22d3ee" : "white"}
              size={32}
            />
          </div>

          <div className="vdp-reel-icon-box">
            <MoreVertical size={28} color="white" />
          </div>
        </div>

        <div className="vdp-reel-content-footer">
          <div className="vdp-reel-user-identity">
            <div className="vdp-reel-avatar-wrapper">
              {reel.userId.mediaUrl && (
                <img
                  src={reel.userId.mediaUrl}
                  alt="profile"
                />
              )}
            </div>
            <span
              style={{ cursor: "pointer" }}
              onClick={() =>
                navigate(
                  `/home/profile/${reel.userId.userName}`
                )
              }
              className="vdp-reel-author-name"
            >
              {reel.userId.userName}
            </span>
          </div>

          <p className="vdp-reel-description">
            {reel.caption}
          </p>

          {isVideo && (
            <div className="vdp-reel-audio-meta">
              <Music2 size={14} />
              <div className="vdp-reel-marquee-track">
                <span>
                  Original Audio • Demo Sound
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {commentOn && (
        <div
          className="comment-holder"
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          <div className="comment-box">
            <ReelComment
              post={reel}
              setPost={setCommentOn}
            />
          </div>
        </div>
      )}

      {shareOn && (
        <ShareBox
          setShareBox={setShareOn}
          post={reel}
          setPost={null}
        />
      )}
    </div>
  );
}

export default ReelItem;
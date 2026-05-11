import React, { useEffect, useRef } from "react";
import { PhoneOff, Video } from "lucide-react";
import useCall from "../hooks/useCall";
import "./VideoCallModal.css";

function VideoCallModal() {
  const {
    callState,
    acceptIncomingCall,
    rejectIncomingCall,
    endCall,
  } = useCall();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteAudioRef = useRef(null);

  useEffect(() => {
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = callState.localStream || null;
      if (callState.localStream) {
        localVideoRef.current
          .play()
          .catch(() => {});
      }
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = callState.remoteStream || null;
      if (callState.remoteStream) {
        remoteVideoRef.current
          .play()
          .catch(() => {});
      }
    }

    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = callState.remoteStream || null;
      remoteAudioRef.current.muted = false;
      remoteAudioRef.current.volume = 1;
      if (callState.remoteStream) {
        remoteAudioRef.current
          .play()
          .catch(() => {});
      }
    }
  }, [callState.localStream, callState.remoteStream]);

  if (callState.status === "idle" && !callState.error) return null;

  const isIncoming = callState.status === "incoming";
  const showFullModal =
    callState.status === "outgoing" ||
    callState.status === "connecting" ||
    callState.status === "in-call";
  const hasRemoteVideo = Boolean(
    callState.remoteStream?.getVideoTracks?.().length
  );
  const hasRemoteAudio = Boolean(
    callState.remoteStream?.getAudioTracks?.().length
  );

  return (
    <>
      <audio
        ref={remoteAudioRef}
        autoPlay
        playsInline
      />

      {isIncoming && (
        <div className="call-popup-overlay">
          <div className="call-popup-card">
            <div className="call-popup-avatar">
              {callState.remoteUser?.profilePictureUrl ? (
                <img src={callState.remoteUser.profilePictureUrl} alt="" />
              ) : (
                <div className="call-popup-fallback">
                  {callState.remoteUser?.fullName?.charAt(0) || "U"}
                </div>
              )}
            </div>
            <h3>{callState.remoteUser?.fullName || "Incoming call"}</h3>
            <p>Incoming video call</p>
            <div className="call-popup-actions">
              <button className="decline-btn" onClick={rejectIncomingCall}>
                Decline
              </button>
              <button className="accept-btn" onClick={acceptIncomingCall}>
                Accept
              </button>
            </div>
          </div>
        </div>
      )}

      {showFullModal && (
        <div className="video-call-overlay">
          <div className="video-call-card">
            <div className="video-call-header">
              <div>
                <h3>{callState.remoteUser?.fullName || "Video Call"}</h3>
                <p>
                  {callState.status === "outgoing" && "Ringing..."}
                  {callState.status === "connecting" && "Connecting..."}
                  {callState.status === "in-call" && "Live now"}
                </p>
              </div>
              <div className="live-chip">
                <Video size={16} />
                Video
              </div>
            </div>

            <div className="video-stage">
              <video
                ref={remoteVideoRef}
                className="remote-video"
                autoPlay
                playsInline
                controls={false}
                onLoadedMetadata={(event) => {
                  event.currentTarget.play().catch(() => {});
                }}
              />

              {!hasRemoteVideo && (
                <div className="video-placeholder">
                  <div className="video-placeholder-avatar">
                    {callState.remoteUser?.profilePictureUrl ? (
                      <img src={callState.remoteUser.profilePictureUrl} alt="" />
                    ) : (
                      <span>{callState.remoteUser?.fullName?.charAt(0) || "U"}</span>
                    )}
                  </div>
                      <span>{callState.remoteUser?.fullName || "Waiting for user"}</span>
                      {hasRemoteAudio && (
                        <small className="call-audio-badge">Audio connected</small>
                      )}
                </div>
              )}

              <video
                ref={localVideoRef}
                className="local-video"
                autoPlay
                playsInline
                muted
                onLoadedMetadata={(event) => {
                  event.currentTarget.play().catch(() => {});
                }}
              />

              <button
                className="floating-end-call-btn mobile-only-call-action"
                onClick={endCall}
              >
                <PhoneOff size={18} />
                End Call
              </button>
            </div>

            <div className="video-call-actions desktop-call-actions">
              <button className="end-call-btn" onClick={endCall}>
                <PhoneOff size={18} />
                End Call
              </button>
            </div>
          </div>
        </div>
      )}

      {callState.error && (
        <div className="call-toast">
          <span>{callState.error}</span>
          <button onClick={() => endCall()}>Close</button>
        </div>
      )}
    </>
  );
}

export default VideoCallModal;

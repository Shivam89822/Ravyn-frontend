import React, { createContext, useEffect, useRef, useState } from "react";
import socket from "../Socket";

export const CallContext = createContext(null);

const ICE_SERVERS = {
  iceServers: [
    {
      urls: [
        "stun:stun.l.google.com:19302",
        "stun:stun1.l.google.com:19302",
      ],
    },
  ],
};

const idleCallState = {
  status: "idle",
  direction: null,
  callId: null,
  conversationId: null,
  remoteUser: null,
  localStream: null,
  remoteStream: null,
  error: "",
};

const getMediaAccessErrorMessage = (error) => {
  if (!navigator.mediaDevices?.getUserMedia) {
    return "Camera and microphone are not available in this browser/context.";
  }

  if (!window.isSecureContext) {
    return "Camera and microphone need HTTPS or localhost. Open the frontend on localhost or serve it over HTTPS.";
  }

  if (error?.name === "NotAllowedError" || error?.name === "PermissionDeniedError") {
    return "Camera or microphone permission was denied in the browser.";
  }

  if (error?.name === "NotFoundError" || error?.name === "DevicesNotFoundError") {
    return "No camera or microphone device was found.";
  }

  if (error?.name === "NotReadableError" || error?.name === "TrackStartError") {
    return "Camera or microphone is already being used by another app.";
  }

  return "Unable to access camera or microphone for this call.";
};

export function CallProvider({ user, conversations, children }) {
  const [callState, setCallState] = useState(idleCallState);

  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const currentCallRef = useRef(idleCallState);
  const pendingIceCandidatesRef = useRef([]);
  const disconnectTimerRef = useRef(null);

  useEffect(() => {
    currentCallRef.current = callState;
  }, [callState]);

  const updateCallState = (updates) => {
    setCallState((prev) => {
      const nextState = { ...prev, ...updates };
      currentCallRef.current = nextState;
      return nextState;
    });
  };

  const stopTracks = (stream) => {
    if (!stream) return;
    stream.getTracks().forEach((track) => track.stop());
  };

  const resetConnection = () => {
    if (disconnectTimerRef.current) {
      clearTimeout(disconnectTimerRef.current);
      disconnectTimerRef.current = null;
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.onicecandidate = null;
      peerConnectionRef.current.ontrack = null;
      peerConnectionRef.current.onconnectionstatechange = null;
      peerConnectionRef.current.oniceconnectionstatechange = null;
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    stopTracks(localStreamRef.current);
    localStreamRef.current = null;
    remoteStreamRef.current = null;
    pendingIceCandidatesRef.current = [];
  };

  const finishCallLocally = (overrides = {}) => {
    resetConnection();
    setCallState({
      ...idleCallState,
      ...overrides,
    });
  };

  const ensureLocalStream = async () => {
    if (localStreamRef.current) return localStreamRef.current;

    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error("MEDIA_UNAVAILABLE");
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    localStreamRef.current = stream;
    updateCallState({ localStream: stream, error: "" });
    return stream;
  };

  const flushPendingIceCandidates = async () => {
    if (!peerConnectionRef.current || !peerConnectionRef.current.remoteDescription) {
      return;
    }

    while (pendingIceCandidatesRef.current.length) {
      const candidate = pendingIceCandidatesRef.current.shift();

      try {
        await peerConnectionRef.current.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      } catch (error) {
        console.log("ICE candidate flush error", error);
      }
    }
  };

  const createPeerConnection = async (targetUserId) => {
    if (peerConnectionRef.current) return peerConnectionRef.current;

    const stream = await ensureLocalStream();
    const peerConnection = new RTCPeerConnection(ICE_SERVERS);
    const remoteStream = new MediaStream();

    remoteStreamRef.current = remoteStream;

    stream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, stream);
    });

    peerConnection.ontrack = (event) => {
      event.streams[0]?.getTracks().forEach((track) => {
        remoteStream.addTrack(track);
      });

      updateCallState({ remoteStream });
    };

    peerConnection.onicecandidate = (event) => {
      if (!event.candidate || !targetUserId) return;

      socket.emit("webrtcIceCandidate", {
        callId: currentCallRef.current.callId,
        from: user?._id,
        to: targetUserId,
        candidate: event.candidate,
      });
    };

    peerConnection.onconnectionstatechange = () => {
      const state = peerConnection.connectionState;

      if (state === "connected") {
        if (disconnectTimerRef.current) {
          clearTimeout(disconnectTimerRef.current);
          disconnectTimerRef.current = null;
        }
        updateCallState({ status: "in-call" });
      }

      if (state === "disconnected") {
        if (disconnectTimerRef.current) {
          clearTimeout(disconnectTimerRef.current);
        }

        disconnectTimerRef.current = setTimeout(() => {
          if (
            peerConnectionRef.current &&
            peerConnectionRef.current.connectionState === "disconnected"
          ) {
            finishCallLocally({
              error: "Call connection was lost.",
            });
          }
        }, 5000);
      }

      if (state === "failed" || state === "closed") {
        finishCallLocally();
      }
    };

    peerConnection.oniceconnectionstatechange = () => {
      const iceState = peerConnection.iceConnectionState;

      if (iceState === "connected" || iceState === "completed") {
        if (disconnectTimerRef.current) {
          clearTimeout(disconnectTimerRef.current);
          disconnectTimerRef.current = null;
        }
      }

      if (iceState === "failed") {
        finishCallLocally({
          error: "Call connection failed.",
        });
      }
    };

    peerConnectionRef.current = peerConnection;
    updateCallState({ remoteStream });

    return peerConnection;
  };

  const sendOffer = async (targetUserId) => {
    const peerConnection = await createPeerConnection(targetUserId);
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    socket.emit("webrtcOffer", {
      callId: currentCallRef.current.callId,
      from: user?._id,
      to: targetUserId,
      offer,
    });
  };

  const startVideoCall = async (remoteUser, conversationId) => {
    if (!user?._id || !remoteUser?.friendId) return;
    if (currentCallRef.current.status !== "idle") return;

    const callId = `${user._id}-${remoteUser.friendId}-${Date.now()}`;

    try {
      await ensureLocalStream();

      updateCallState({
        status: "outgoing",
        direction: "outgoing",
        callId,
        conversationId,
        remoteUser: {
          _id: remoteUser.friendId,
          fullName: remoteUser.friendName,
          userName: remoteUser.friendUserName,
          profilePictureUrl: remoteUser.friendProfilePic,
        },
      });

      socket.emit("callUser", {
        callId,
        from: user._id,
        to: remoteUser.friendId,
        conversationId,
        callerName: user.fullName,
        callerUserName: user.userName,
        callerProfilePic: user.profilePictureUrl,
      });
    } catch (error) {
      finishCallLocally({
        error: getMediaAccessErrorMessage(error),
      });
    }
  };

  const acceptIncomingCall = async () => {
    const activeCall = currentCallRef.current;
    const targetUserId = activeCall.remoteUser?._id;

    if (!targetUserId || activeCall.status !== "incoming") return;

    try {
      updateCallState({ status: "connecting" });
      await createPeerConnection(targetUserId);

      socket.emit("answerCall", {
        callId: activeCall.callId,
        from: user?._id,
        to: targetUserId,
        conversationId: activeCall.conversationId,
      });
    } catch (error) {
      socket.emit("rejectCall", {
        callId: activeCall.callId,
        from: user?._id,
        to: targetUserId,
        reason: "media_error",
      });

      finishCallLocally({
        error: getMediaAccessErrorMessage(error),
      });
    }
  };

  const rejectIncomingCall = () => {
    const activeCall = currentCallRef.current;
    const targetUserId = activeCall.remoteUser?._id;

    if (!targetUserId) {
      finishCallLocally();
      return;
    }

    socket.emit("rejectCall", {
      callId: activeCall.callId,
      from: user?._id,
      to: targetUserId,
      reason: "rejected",
    });

    finishCallLocally();
  };

  const endCall = () => {
    const activeCall = currentCallRef.current;
    const targetUserId = activeCall.remoteUser?._id;

    if (targetUserId) {
      socket.emit("endCall", {
        callId: activeCall.callId,
        from: user?._id,
        to: targetUserId,
        reason: "ended",
      });
    }

    finishCallLocally();
  };

  useEffect(() => {
    if (!user?._id) return;

    const handleIncomingCall = (data) => {
      if (currentCallRef.current.status !== "idle") {
        socket.emit("rejectCall", {
          callId: data.callId,
          from: user._id,
          to: data.from,
          reason: "busy",
        });
        return;
      }

      const knownConversation = conversations.find(
        (conversation) => conversation.friendId === data.from
      );

      updateCallState({
        status: "incoming",
        direction: "incoming",
        callId: data.callId,
        conversationId: data.conversationId,
        remoteUser: {
          _id: data.from,
          fullName:
            knownConversation?.friendName || data.callerName || "Unknown user",
          userName:
            knownConversation?.friendUserName || data.callerUserName || "",
          profilePictureUrl:
            knownConversation?.friendProfilePic || data.callerProfilePic || "",
        },
        error: "",
      });
    };

    const handleAccepted = async (data) => {
      if (data.callId !== currentCallRef.current.callId) return;

      updateCallState({ status: "connecting" });
      await sendOffer(data.from);
    };

    const handleRejected = (data) => {
      if (data.callId !== currentCallRef.current.callId) return;

      const message =
        data.reason === "busy"
          ? "User is busy on another call."
          : "Call was declined.";

      finishCallLocally({ error: message });
    };

    const handleUnavailable = (data) => {
      if (data.callId !== currentCallRef.current.callId) return;
      finishCallLocally({ error: "User is offline right now." });
    };

    const handleEnded = (data) => {
      if (data.callId !== currentCallRef.current.callId) return;
      finishCallLocally({
        error:
          data.reason === "disconnect"
            ? "Call ended because the other user disconnected."
            : "",
      });
    };

    const handleOffer = async (data) => {
      if (data.callId !== currentCallRef.current.callId) return;

      const peerConnection = await createPeerConnection(data.from);
      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(data.offer)
      );
      await flushPendingIceCandidates();

      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      socket.emit("webrtcAnswer", {
        callId: data.callId,
        from: user._id,
        to: data.from,
        answer,
      });
    };

    const handleAnswer = async (data) => {
      if (data.callId !== currentCallRef.current.callId) return;
      if (!peerConnectionRef.current) return;

      await peerConnectionRef.current.setRemoteDescription(
        new RTCSessionDescription(data.answer)
      );
      await flushPendingIceCandidates();
    };

    const handleIceCandidate = async (data) => {
      if (data.callId !== currentCallRef.current.callId) return;
      if (!peerConnectionRef.current || !data.candidate) return;

      if (!peerConnectionRef.current.remoteDescription) {
        pendingIceCandidatesRef.current.push(data.candidate);
        return;
      }

      try {
        await peerConnectionRef.current.addIceCandidate(
          new RTCIceCandidate(data.candidate)
        );
      } catch (error) {
        console.log("ICE candidate error", error);
      }
    };

    socket.on("incomingReq", handleIncomingCall);
    socket.on("callAccepted", handleAccepted);
    socket.on("callRejected", handleRejected);
    socket.on("callUnavailable", handleUnavailable);
    socket.on("callEnded", handleEnded);
    socket.on("webrtcOffer", handleOffer);
    socket.on("webrtcAnswer", handleAnswer);
    socket.on("webrtcIceCandidate", handleIceCandidate);

    return () => {
      socket.off("incomingReq", handleIncomingCall);
      socket.off("callAccepted", handleAccepted);
      socket.off("callRejected", handleRejected);
      socket.off("callUnavailable", handleUnavailable);
      socket.off("callEnded", handleEnded);
      socket.off("webrtcOffer", handleOffer);
      socket.off("webrtcAnswer", handleAnswer);
      socket.off("webrtcIceCandidate", handleIceCandidate);
    };
  }, [conversations, user]);

  useEffect(() => {
    return () => {
      resetConnection();
    };
  }, []);

  return (
    <CallContext.Provider
      value={{
        callState,
        startVideoCall,
        acceptIncomingCall,
        rejectIncomingCall,
        endCall,
      }}
    >
      {children}
    </CallContext.Provider>
  );
}

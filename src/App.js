import React, { useEffect, useRef } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setUser, clearUser } from "./features/user/UserSlice";
import {
  setConversations,
} from "./features/Conversation/ConversationSlice";
import {
  userOnline,
  userOffline,
} from "./features/user/ActiveUserSlice";
import {
  loginSuccess,
  logout,
  authChecked
} from "./features/user/AuthSlice";

import "./App.css";
import api from "./utils/axios.js";

import Intropage from "./Components/Intropage";
import BasePage from "./Components/BasePage";
import UserProfile from "./Components/UserProfile";
import ReelSection from "./newComponents/ReelSection";
import Feed from "./Components/Feed";
import MessageSection from "./newComponents/MessageSection";
import VeiwProfile from "./newComponents/VeiwProfile";
import ProtectedRoute from "./ProtectedRoute";
import { useNavigate } from 'react-router-dom';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import socket from "./Socket";
import EditProfile from "./newComponents/EditProfile";
import SearchTab from "./newComponents/SearchTab";
import PreviewStatus from "./newComponents/PreviewStatus";
import StatusElement from "./newComponents/StatusElement";
import Setting from "./newComponents/SettingsPage";
import Notifications from "./newComponents/Notifications";
import { CallProvider } from "./context/CallContext";
import VideoCallModal from "./newComponents/VideoCallModal";


function App() {

  const dispatch = useDispatch();
  const { isAuthenticated, isAuthChecked } = useSelector((state) => state.auth);
  const user = useSelector((state) => state.user.user);
  const conversations = useSelector((state) => state.conversations.conversations);

  const conversationsRef = useRef([]);
  const onlineUsersRef = useRef(new Set());
  conversationsRef.current = conversations;

  const fetchConversation = async () => {
    try {
      const response = await api.get(
        "/api/conversation/fetchConversation",
        { params: { userId: user._id } }
      );
      console.log(response.data);
      dispatch(setConversations(response.data));
    } catch {}
  };


  useEffect(() => {
    const verifyUser = async () => {
      

      try {
        const res = await api.post("/api/auth/verify");
        dispatch(setUser(res.data.user));
        dispatch(loginSuccess());
       
      } catch {
        dispatch(clearUser());
        dispatch(logout());
    
      } finally {
        dispatch(authChecked()); // ✅ fixed
      }
    };

    verifyUser(); // ✅ always run
  }, [dispatch]);

  useEffect(() => {
    if (!isAuthChecked) return;

    if (isAuthenticated && user?._id) {
      if (!socket.connected) socket.connect();
      socket.emit("user-online", user._id);
      fetchConversation();
    } else {
      if (socket.connected) socket.disconnect();
    }
  }, [isAuthenticated, isAuthChecked, user?._id]);

  useEffect(() => {
    const handleMsg = (msg) => {
      console.log(msg);
    };

    socket.on("sendedMsg", handleMsg);
    return () => socket.off("sendedMsg", handleMsg);
  }, []);

  useEffect(() => {
    const handlePresence = ({ userId, status }) => {
      if (status === "online") {
        onlineUsersRef.current.add(userId);
      } else {
        onlineUsersRef.current.delete(userId);
      }

      const exists = conversationsRef.current.some(
        (c) => c.friendId === userId
      );
      if (!exists) return;

      if (status === "online") dispatch(userOnline(userId));
      else dispatch(userOffline(userId));
    };

    socket.on("presence-update", handlePresence);
    return () => socket.off("presence-update", handlePresence);
  }, [dispatch]);


  useEffect(() => {
    const handleInit = (userIds) => {
      onlineUsersRef.current = new Set(userIds);

      userIds.forEach((id) => {
        const exists = conversationsRef.current.some(
          (c) => c.friendId === id
        );
        if (exists) dispatch(userOnline(id));
      });
    };

    socket.on("presence-init", handleInit);
    return () => socket.off("presence-init", handleInit);
  }, [dispatch]);

  useEffect(() => {
    if (!conversations.length) return;

    conversations.forEach((conversation) => {
      if (onlineUsersRef.current.has(conversation.friendId)) {
        dispatch(userOnline(conversation.friendId));
      } else {
        dispatch(userOffline(conversation.friendId));
      }
    });
  }, [conversations, dispatch]);

  return (
    <CallProvider user={user} conversations={conversations}>
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              isAuthenticated ? <Navigate to="/home" replace /> : <Intropage />
            }
          />

          <Route element={<ProtectedRoute />}>
            <Route path="/home" element={<BasePage />}>
              <Route index element={<Feed />} />
              <Route path="messages" element={<MessageSection />} />
              <Route path="user-profile" element={<VeiwProfile />} />
              <Route path="user-profile/edit-profile" element={<EditProfile />} />
              <Route path="profile/:username" element={<UserProfile />} />
              <Route path="reels" element={<ReelSection />} />
              <Route path="search" element={<SearchTab />} />
              <Route path="status" element={<PreviewStatus />} />
              <Route path="settings" element={<Setting/>}/>
              <Route path="noticications" element={<Notifications/>}/>

            </Route>

            <Route path="/status/:username" element={<StatusElement />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <VideoCallModal />
      </Router>
    </CallProvider>
  );
}

export default App;

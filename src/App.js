
import React, { useEffect, useRef, useCallback } from "react";
import API_URL from "./config";
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
} from "./features/user/AuthSlice";

import "./App.css";
import Intropage from "./Components/Intropage";
import BasePage from "./Components/BasePage";
import UserProfile from "./Components/UserProfile";
import ReelSection from "./newComponents/ReelSection";
import Feed from "./Components/Feed";
import MessageSection from "./newComponents/MessageSection";
import VeiwProfile from "./newComponents/VeiwProfile";
import ProtectedRoute from "./ProtectedRoute";

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import socket from "./Socket";
import EditProfile from "./newComponents/EditProfile";
import SearchTab from "./newComponents/SearchTab";
import PreviewStatus from "./newComponents/PreviewStatus";
import StatusElement from "./newComponents/StatusElement";
import Setting from "./newComponents/SettingsPage";
import Notifications from "./newComponents/Notifications";


function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, isAuthChecked } = useSelector((state) => state.auth);
  const user = useSelector((state) => state.user.user);
  const conversations = useSelector((state) => state.conversations.conversations);

  const conversationsRef = useRef([]);
  conversationsRef.current = conversations;

 const fetchConversation = useCallback(async () => {
  if (!user?._id) return;

  try {
    const response = await axios.get(
      "https://ravyn-backend.onrender.com/api/fetchConversation",
      { params: { userId: user._id } }
    );
    dispatch(setConversations(response.data));
  } catch (err) {
    console.error(err);
  }
}, [dispatch, user?._id]);


  useEffect(() => {
    const verifyUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        dispatch(clearUser());
        dispatch(logout());
        return;
      }

      try {
        const res = await axios.post(
          `${API_URL}/api/auth/verify`,
          {},
          { headers: { authorization: `Bearer ${token}` } }
        );
        dispatch(setUser(res.data.user));
        dispatch(loginSuccess());
      } catch {
        localStorage.removeItem("token");
        dispatch(clearUser());
        dispatch(logout());
      }
    };

    if (!isAuthChecked) verifyUser();
  }, [dispatch, isAuthChecked]);

 useEffect(() => {
  if (!isAuthChecked) return;

  if (isAuthenticated && user?._id) {
    if (!socket.connected) socket.connect();
    socket.emit("user-online", user._id);
    fetchConversation();
  } else {
    if (socket.connected) socket.disconnect();
  }
}, [isAuthenticated, isAuthChecked, user?._id, fetchConversation]);


  useEffect(() => {
    const handleMsg = (msg) => {
      console.log(msg);
    };

    socket.on("sendedMsg", handleMsg);
    return () => socket.off("sendedMsg", handleMsg);
  }, []);

  useEffect(() => {
    const handlePresence = ({ userId, status }) => {
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

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Intropage />} />

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
    </Router>
  );
}

export default App;

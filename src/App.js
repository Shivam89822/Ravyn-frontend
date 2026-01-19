import React, { useEffect ,useRef} from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setUser, clearUser } from "./features/user/UserSlice";
import {
  setConversations,
  setCurrentConversation,
  updateLastMessage,
  resetConversationState,
} from "./features/Conversation/ConversationSlice"

import {
  userOnline,
  userOffline,
  resetPresenceState,
} from "./features/user/ActiveUserSlice"

import {
  loginSuccess,
  logout,
  authChecked,
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

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, isAuthChecked } = useSelector(
    (state) => state.auth
  );
   const user = useSelector((state) => state.user.user);
   const conversations = useSelector((state) => state.conversations.conversations);
   const activeUser = useSelector((state) => state.activeUser.activeUsers);
   const conversationsRef = useRef();


  const fetchConversation = async () => {
       try {
         const response = await axios.get(
           "http://localhost:8080/api/fetchConversation",
           { params: { userId: user._id } }
         );
        dispatch(setConversations(response.data))
        
       } catch (e) {
         console.log(e.response?.data?.message || "error");
       }
    };


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
          "http://localhost:8080/api/auth/verify",
          {},
          {
            headers: {
              authorization: `Bearer ${token}`,
            },
          }
        );

        dispatch(setUser(res.data.user)); 
        dispatch(loginSuccess());

      } catch (error) {
        console.error("Auth failed");
        localStorage.removeItem("token");
        dispatch(clearUser());
        dispatch(logout());
      }
    };

    if (!isAuthChecked) {
      verifyUser();
    }
  }, [dispatch, isAuthChecked]);


  useEffect(() => {
      conversationsRef.current = conversations;
    }, [conversations]);

  useEffect(() => {

    if (isAuthChecked && isAuthenticated) {
      socket.connect(); 
      socket.emit("user-online",user._id) 
    }

    if (isAuthChecked && !isAuthenticated) {
      socket.disconnect();
    }
  }, [isAuthenticated, isAuthChecked]);

  useEffect(()=>{
    if(user){
      fetchConversation()
    }
    if(user){
        socket.emit("user-online",user._id)
      }
  },[user])


  useEffect(()=>{   

    socket.on("sendedMsg",(msg)=>{
      console.log(msg)
    })
    
  },[])


 useEffect(() => {
  const handlePresence = ({ userId, status }) => {
    const isUserPresent = conversationsRef.current.some(
      (c) => c.friendId === userId
    );

    if (!isUserPresent) return;

    if (status === "online") {
      dispatch(userOnline(userId));
    } else {
      dispatch(userOffline(userId));
    }
  };

  socket.on("presence-update", handlePresence);
  

  return () => {
    socket.off("presence-update", handlePresence);
  };
}, [dispatch]);

useEffect(()=>{
 const handleInit = (userIds) => {
    userIds.forEach((id) => {
     
      
      
      const isUserPresent = conversationsRef.current.some(
        (c) => c.friendId === id
      );
      if (isUserPresent) {
      // console.log(id)

        dispatch(userOnline(id));
      }
    });
  };

  if(conversationsRef)socket.on("presence-init", handleInit);
   return () => {
   
    socket.off("presence-init", handleInit);
  };
},[conversationsRef])


  useEffect(()=>{
    console.log("triggerd")
    console.log(activeUser);
  },[activeUser])



  return (
    <Router>
      <Routes>
  
        <Route path="/" element={<Intropage />} />

    
        <Route element={<ProtectedRoute />}>
          <Route path="/home" element={<BasePage />}>
            <Route index element={<Feed />} />
            {/* <Route path="reels" element={<ReelSection />} /> */}
            <Route path="messages" element={<MessageSection />} />
            <Route path="user-profile" element={<VeiwProfile/>}/> 
            <Route path="user-profile/edit-profile" element={<EditProfile/>}/>          
            <Route path="profile/:username" element={<UserProfile />} />
             <Route path="reels" element={<ReelSection />} />
             <Route path="search" element={<SearchTab/>}/>
             <Route path="status" element={<PreviewStatus/>}/>

          </Route>
          <Route path="/status/:username" element={<StatusElement/>} />
        </Route>

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </Router>
  );
}

export default App;

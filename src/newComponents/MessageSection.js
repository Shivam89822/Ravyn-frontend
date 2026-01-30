import React, { useEffect, useState, useRef } from "react";
import "./MessageSection.css";
import { Phone, Video, Info, Send, Scale, X ,Unlock} from "lucide-react";
import {
  Ban,
  Star,
  Shield,
} from "lucide-react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import socket from "../Socket";
import { MessageCircle } from "lucide-react";
import {
  setConversations,
  setCurrentConversation,
  updateLastMessage,
  resetConversationState,
} from "../features/Conversation/ConversationSlice"

import {
  userOnline,
  userOffline,
  resetPresenceState,
} from "../features/user/ActiveUserSlice"
import MessageItem from "./MessageItem";
import BlockReason from "./BlockReason";





function MessageSection() {
  const location = useLocation();
  const user = useSelector((state) => state.user.user);
  const [friend, setFriend] = useState(location.state?.friendName || "");
  const [activeUser, setActiveUser] = useState(null);
  const conversations = useSelector((state) => state.conversations.conversations);
  const activeUsers = useSelector((state) => state.activeUser.activeUsers);
  
  const [currMsg, setCurrMsg] = useState("");
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [cursorTime, setCursorTime] = useState(null);
  const [close,setClose]=useState(false);
  const [showBox,setShowBox]=useState(false)
  const [isBlocked,setIsBlocked]=useState(false)
  const [iBlocked,setIBlocked]=useState(false)
  
  const [featureDesign,setFeatureDesign]=useState({
    transform:"scaleY(0)"
  })

  const conversationRef = useRef(null);
  const messageEndRef = useRef(null);
  const isFetchingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const overlayRef = useRef(null);

  useEffect(() => {
    conversationRef.current = conversationId;
  }, [conversationId]);

  const fetchMessage = async (convId, cursor) => {
    if (isFetchingRef.current || !hasMoreRef.current) return;
    isFetchingRef.current = true;

    try {
      const response = await axios.get(
        "http://localhost:8080/api/fetchMessage",
        {
          params: {
            conversationId: convId,
            cursorTime: cursor,
          },
        }
      );

      if (!response.data.length) {
        hasMoreRef.current = false;
        return;
      }
      setMessages((prev) => [...response.data, ...prev]);
      setCursorTime(response.data[0].createdAt);
    } catch (e) {
      console.log(e.response?.data?.message || "Backend error");
    } finally {
      isFetchingRef.current = false;
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/users/${friend}`
      );
      setActiveUser(response.data);

    } catch (e) {
      console.log(e.response?.data?.error || "Backend error");
    }
  };

  const blockUSer=async(reason)=>{
    try{
      const response=axios.post("http://localhost:8080/api/block/blockuser",{blockerId:user._id,blockedId:activeUser._id,reason:reason});
      
      setIsBlocked(true)

    }catch(e){
      console.log(e.response?.data?.message);
    }
  }

 const unBlockUser = async () => {
  try {
    await axios.delete(
      "http://localhost:8080/api/block/unblockuser",
      {
        params: {
          blockerId: user._id,
          blockedId: activeUser._id,
        },
      }
    );
    setIsBlocked(false);

  } catch (e) {
    console.log(e.response?.data?.message || "Backend error");
  }
};

  

  const sendMsg = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8080/api/message/sendMessage",
        {
          senderId: user._id,
          reciverId: activeUser._id,
          text: currMsg,
        }
      );

      setMessages((prev) => [...prev, response.data.message]);
      socket.emit("sendMessage", {
        conversationId: response.data.conversationId,
        messageId: response.data.message._id,
      });

      setCurrMsg("");
    } catch (e) {
      console.log(e.response?.data?.message || "Backend error");
    }
  };

  const fetchIsBlock=async()=>{
    try{
      const response=await axios.get("http://localhost:8080/api/block/checkblock",{
        params:{blockerId:user._id,blockedId:activeUser._id}
      })
      setIsBlocked(response.data);
      console.log(response.data)
      
    }catch(e){
      console.log(e.response?.data?.message||"Backend error");
    }
  }

  const fetchIsIBlock=async()=>{
    try{
      const response=await axios.get("http://localhost:8080/api/block/checkblock",{
        params:{blockerId:activeUser._id,blockedId:user._id}
      })
      setIBlocked(response.data);
      console.log(response.data)
      
    }catch(e){
      console.log(e.response?.data?.message||"Backend error");
    }
  }
  useEffect(()=>{
    if(activeUser){
      fetchIsBlock();
      fetchIsIBlock();
    };
  },[activeUser])

  useEffect(() => {
    const el = messageEndRef.current;
    if (!el) return;

    const handleScroll = () => {
      if (el.scrollTop === 0 && conversationId) {
        fetchMessage(conversationId, cursorTime);
      }
    };

    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [conversationId, cursorTime]);

  useEffect(() => {
    if (!conversations.length) return;
    const conversationIds = conversations.map((c) => c.conversationId);
    socket.emit("joinConversations", conversationIds);
    return () => socket.emit("leaveConversations", conversationIds);
  }, [conversations]);

  useEffect(() => {
    if (friend) fetchCurrentUser();
  }, [friend]);

  

  useEffect(() => {
    const handleNewMessage = (msg) => {
      if (msg.conversationId !== conversationRef.current) return;
      setMessages((prev) => [...prev, msg]);
    };

    socket.off("newMessage");
    socket.on("newMessage", handleNewMessage);

    return () => socket.off("newMessage", handleNewMessage);
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        overlayRef.current &&
        !overlayRef.current.contains(e.target)
      ) {
         setClose(true);
         setFeatureDesign({
          transform:"scaleY(0)"
         })
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [close]);

  useEffect(() => {
    if (!messageEndRef.current) return;
    messageEndRef.current.scrollTop =
      messageEndRef.current.scrollHeight;
  }, [messages]);

  const formatMessageTime = (date) => {
    const msgDate = new Date(date);
    const now = new Date();

    const time = msgDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const isToday = msgDate.toDateString() === now.toDateString();
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
      msgDate.toDateString() === yesterday.toDateString();

    if (isToday) return `today ${time}`;
    if (isYesterday) return `yesterday ${time}`;

    return `${msgDate
      .toLocaleDateString("en-IN", { day: "2-digit", month: "short" })
      .toLowerCase()} ${time}`;
  };

  return (
    <div className="msg-wrapper">
      {showBox&&<BlockReason onClose={()=>{setShowBox(false)}} onConfirm={(reason)=>{blockUSer(reason);setShowBox(false)}}/>}
      <div className="msg-left">
        <div className="left-fixed">
          <h2 className="msg-title">Messages</h2>
          <input type="search" className="msg-search" placeholder="Search messages..." />
        </div>

        <div className="left-scroll">
          {conversations.map((c, i) => (
            <div
              key={i}
              className={`conversation ${c.active ? "active" : ""}`}
              onClick={() => {
                if (c.conversationId === conversationId) return;

                setFriend(c.friendUserName);
                setConversationId(c.conversationId);
                setMessages([]);
                setCursorTime(null);
                hasMoreRef.current = true;
                fetchMessage(c.conversationId, new Date());
              }}
            >
              <div className="avatar">
                {c.friendProfilePic && (
                  <img src={c.friendProfilePic} style={{ width: "100%" }} alt="" />
                )}
                {activeUsers[c.friendId]&&<span className="online-dot"></span>}
              </div>

              <div className="conv-info">
                <div className="conv-name">{c.friendName}</div>
                <div className="conv-text">
                  {c.lastMessageSender == user._id ? "you: " : ""} {c.lastMessage}
                </div>
              </div>

              <div className="conv-meta">
                <span>{formatMessageTime(c.updatedAt)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {activeUser&&<div className="msg-right">
        <div className="right-fixed-top">
          <div className="chat-user">
            <div className="chat-user-inner">
              <div className="avatar large"></div>
              <div>
                {activeUser && <div className="chat-name">{activeUser.fullName}</div>}
                {activeUsers[activeUser._id]&&<div className="chat-status">Active now</div>}
              </div>
            </div>
            <div className="chat-actions">
              <div><Phone size={20} /></div>
              <div><Video size={20} /></div>
              <div><Info size={20} onClick={()=>{if(close){setFeatureDesign({transform:"scaleY(1)"})}else{setFeatureDesign({transform:"scaleY(0)"})}}} /></div>
            </div>
            <div className="feature-overlay" style={featureDesign} ref={overlayRef} >
              <button onClick={()=>{setShowBox(true)}} className="overlay-item block">
                <Ban size={18} />
                <span>Block</span>
              </button>

              <button className="overlay-item">
                <Star size={18} />
                <span>Close Friend</span>
              </button>

              <button className="overlay-item">
                <Shield size={18} />
                <span>Restrict</span>
              </button>

            </div>
          </div>
        </div>

        <div className="right-scroll" ref={messageEndRef}>
          <div className="chat-date">Today</div>

          {messages.map((items, key) =>
          <MessageItem post={items} key={key} activeUser={activeUser}/>
          )} 
          {/*  */}
        </div>

        <div className="right-fixed-bottom">
          

          {isBlocked&&<div className="blocked-box">
            <Ban size={18} />

            <div className="blocked-text">
              <h4>User Blocked</h4>
              <p>
                You have blocked this user.  
                You won’t see their content or receive messages.
              </p>
            </div>

            <button onClick={()=>{unBlockUser()}} className="unblock-btn" >
              <Unlock size={16} />
              Unblock
            </button>
          </div>}
          {iBlocked&&<div className="blocked-box">
            <Ban size={18} />

            <div className="blocked-text">
              <h4>User Blocked You</h4>
              <p>
                you got blocked by this user  
                You won’t see their content or receive messages.
              </p>
            </div>
          </div>

          }
          
          {!isBlocked&&!iBlocked&&<div className="send-msg">
            <input
              value={currMsg}
              onChange={(e) => setCurrMsg(e.target.value)}
              placeholder="Type a message..."
            />
            <div className="send-holder" onClick={sendMsg}>
              <Send size={22} />
            </div>
          </div>}
        </div>
      </div>}
      {!activeUser&&<div className="empty-chat-container">
        <div className="icon-wrappers">
            <div className="sparkle"></div>
            <div className="sparkle"></div>
            <div className="sparkle"></div>
            <div className="icon-inner">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin
="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
            </div>
        </div>

        <h2 className="title">Start Chatting Now</h2>
        <p className="subtitle">Select a conversation from the list to start messaging, or explore new connections to begin your journey.</p>

      
        <div className="features-list">
            <div className="feature-item">
                <div className="feature-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin
="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                </div>
                <div className="feature-text">
                    <div className="feature-title">Instant Messaging</div>
                    <div className="feature-desc">Real-time conversations with friends</div>
                </div>
            </div>

            <div className="feature-item">
                <div className="feature-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin
="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
                <div className="feature-text">
                    <div className="feature-title">Share Media</div>
                    <div className="feature-desc">Send photos, videos, and more</div>
                </div>
            </div>

            <div className="feature-item">
                <div className="feature-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin
="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>
                <div className="feature-text">
                    <div className="feature-title">Private & Secure</div>
                    <div className="feature-desc">Your messages are safe with us</div>
                </div>
            </div>
        </div>
    </div>

      }
    </div>
  );
}

export default MessageSection;

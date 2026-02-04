import React, { useEffect, useRef, useState } from "react";
import "./SideNavBar.css";
import {
  Home,
  Search,
  MessageCircle,
  Clapperboard,
  Bell,
  PlusSquare,
  Bookmark,
  Settings,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { transform } from "framer-motion";
import FeedLoader from "./FeedLoader"
import { Heart, Users, UserPlus, X ,User} from 'lucide-react';
import axios from "axios";
import { useSelector } from "react-redux";


function SideNavBar({ onCreatePost }) {
  const [style,setStyle]=useState({
    transform:"scaleX(0)"
  });
  const [isLoading,setIsLoading]=useState(true);
  const [isOpen,setIsOpen]=useState(false)
  const [notifyItem,setNotifyItem]=useState([]);
  const user = useSelector((state) => state.user.user);
  const notifyRef=useRef(null)
  
  const acceptFollowRequest=async(followerId,notifyId)=>{
    try{
      await axios.post(" https://ravyn-backend.onrender.com/api/follow/acceptreq",{
        followerId:followerId,
        followingId:user._id,
        notifyId:notifyId,
      })
      fetchNotification();
    }catch(e){
      console.log(e.response?.data?.message||"Backend error");
    }
  }

   const rejectFollowRequest = async (notifyId) => {
      try {
        await axios.post(
          " https://ravyn-backend.onrender.com/api/follow/rejectreq",
          { notifyId:notifyId }
        );
        fetchNotification();
      } catch (e) {
        console.log(e.response?.data?.message || "Backend error");
      } 
    };

  const fetchNotification=async()=>{
    try{
      const response= await axios.get(" https://ravyn-backend.onrender.com/api/notification/fetch",{
        params:{
          userId:user._id
        }
      })
      setNotifyItem(response.data.data);
      console.log(response.data.data)
      
    }catch(e){
      console.log(e.response?.data?.message||"Backend error");
    }
  }

  const fetchUser=async(userId)=>{
    try{
      const user=await axios.get(` https://ravyn-backend.onrender.com/api/singleuser/${userId}`);
      return user.data;
    }
    catch(e){
      console.log(e);
      return null;
    }
  }

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

  const toggleNotification=()=>{
    if(isOpen){
      setIsOpen(false);
      setStyle({
    transform:"scaleX(0)"
  })
  setIsLoading(true)
    }else{
      setIsOpen(true);
      setStyle({
    transform:"scaleX(1)"
  })
  setTimeout(()=>{
        setIsLoading(false);
      },400)

    }
  }

  useEffect(()=>{
    if(user){
      fetchNotification();
    }
  },[user])
  return (
    <div className="sidebar" ref={notifyRef}>
      <div className="notification-overlay"  style={{ ...style, left: `${notifyRef.current?.offsetWidth || 0}px` }}>
        {isLoading&&<div className="loader-holder">
          <FeedLoader/>
        </div>}
        {!isLoading&&<div className="notify-holder-box">
          <div className="notify-text">
           <div className="notify-text-item not-bell">
            <div><Bell color="white" size={24}/></div>
            <h4>Notification</h4>
           </div>
           <div className="notify-text-item"><X color="white" size={20}/></div>
          </div>
          {user.notifications.push&&<div className="actual-notify-holder">
            {notifyItem.map((item,idx)=>(
              <div>
                 {item.type=="follow_request"&&<div className="notify-holder-item">
              <div className="upper-notify-div">
                <div className="name-time">
                  <div className="avatar-holder blue">{!item.actor.profilePictureUrl&&<User color="black" size={18} fill="black"/>}{item.actor.profilePictureUrl&&<img style={{width:"100%",height:"100%",borderRadius:"50%"}} src={item.actor.profilePictureUrl} alt="" />}</div>
                  <div>
                    <div>{item.actor.userName} {item.actors&&item.actors.length > 1 > 1&&<span className="time-ago">+2 more</span>}</div>
                    <div className="time-ago">{formatMessageTime(item.createdAt)}</div>
                  </div>
                </div>
                <div className="plus-user blue">
                  <UserPlus size={20} color="white" fill="white"/> 
                </div>
              </div>
              <div className="middle-notify-div">
                sent you a follow request
              </div>
              <div className="last-notify-div">
                <button className="notify-btn blue" onClick={()=>{acceptFollowRequest(item.actor._id,item._id)}}>Accept</button><button className="notify-btn gray" onClick={()=>{rejectFollowRequest(item._id)}}>Decline</button>
              </div>
            </div>}
            
            {item.type=="follow"&&<div className="notify-holder-item">
              <div className="upper-notify-div">
                <div className="name-time">
                  <div className="avatar-holder purple">{!item.actor.profilePictureUrl&&<User color="black" size={18} fill="black"/>}{item.actor.profilePictureUrl&&<img style={{width:"100%",height:"100%",borderRadius:"50%"}} src={item.actor.profilePictureUrl} alt="" />}</div>
                  <div>
                    <div>{item.actor.userName} {item.actors&&item.actors.length > 1 > 1&&<span className="time-ago">+2 more</span>} </div>
                    <div className="time-ago">{formatMessageTime(item.createdAt)}</div>
                  </div>
                </div>
                <div className="plus-user purple">
                  <Users size={20} color="white" fill="white"/> 
                </div>
              </div>
              <div className="middle-notify-div">
                started following you
              </div>
            </div>}
            {item.type=="post_like"&&<div className="notify-holder-item">
              <div className="upper-notify-div">
                <div className="name-time">
                  <div className="avatar-holder orange">{!item.actor.profilePictureUrl&&<User color="black" size={18} fill="black"/>}{item.actor.profilePictureUrl&&<img style={{width:"100%",height:"100%",borderRadius:"50%"}} src={item.actor.profilePictureUrl} alt="" />}</div>
                  <div>
                    <div>{item.actor.userName} {item.actors&&item.actors.length > 1 > 1&&<span className="time-ago">+2 more</span>}</div>
                    <div className="time-ago">{formatMessageTime(item.createdAt)}</div>
                  </div>
                </div>
                <div className="plus-user orange">
                  <Heart size={20} color="white" fill="white"/> 
                </div>
              </div>
              <div className="middle-notify-div">
                liked your post
              </div>     
            </div>}
            {item.type=="post_comment"&&<div className="notify-holder-item">
              <div className="upper-notify-div">
                <div className="name-time">
                  <div className="avatar-holder green">{!item.actor.profilePictureUrl&&<User color="black" size={18} fill="black"/>}{item.actor.profilePictureUrl&&<img style={{width:"100%",height:"100%",borderRadius:"50%"}} src={item.actor.profilePictureUrl} alt="" />}</div>
                  <div>
                    <div>{item.actor.userName} {item.actors&&item.actors.length > 1 > 1&&<span className="time-ago">+2 more</span>}</div>
                    <div className="time-ago">{formatMessageTime(item.createdAt)}</div>
                  </div>
                </div>
                <div className="plus-user green">
                  <MessageCircle size={20} color="white" fill="white"/> 
                </div>
              </div>
              <div className="middle-notify-div">
                commented on your post
              </div>     
            </div>}
             {item.type=="comment_like"&&<div className="notify-holder-item">
              <div className="upper-notify-div">
                <div className="name-time">
                  <div className="avatar-holder yellow">{!item.actor.profilePictureUrl&&<User color="black" size={18} fill="black"/>}{item.actor.profilePictureUrl&&<img style={{width:"100%",height:"100%",borderRadius:"50%"}} src={item.actor.profilePictureUrl} alt="" />}</div>
                  <div>
                    <div>{item.actor.userName} {item.actors&&item.actors.length > 1 > 1&&<span className="time-ago">+2 more</span>}</div>
                    <div className="time-ago">{formatMessageTime(item.createdAt)}</div>
                  </div>
                </div>
                <div className="plus-user yellow">
                  <Heart size={20} color="white" fill="white"/> 
                </div>
              </div>
              <div className="middle-notify-div">
                liked your comment
              </div>     
            </div>}

              </div>
            ))}
            
          </div>}
          {!user.notifications.push&&<div style={{display:"flex",justifyContent:"center",margin:"20px"}}>
            Notification is turnoff
            </div>}
        </div>}          
      </div>
      {/*  */}

      <div className="logo">Ravyn</div>

      <NavLink
        to="/home"
        end
        className={({ isActive }) =>
          isActive ? "nav-item active" : "nav-item"
        }
      >
        <span className="icon-holder"><Home size={32} /></span>
        <span className="nav-text-holder">Home</span>
      </NavLink>

      <NavLink
        to="/home/search"
        className={({ isActive }) =>
          isActive ? "nav-item active" : "nav-item"
        }
      >
        <span className="icon-holder"><Search size={32} /></span>
        <span className="nav-text-holder">Search</span>
      </NavLink>

      <NavLink
        to="/home/messages"
        className={({ isActive }) =>
          isActive ? "nav-item active" : "nav-item"
        }
      >
        <span className="icon-holder"><MessageCircle size={32} /></span>
        <span className="nav-text-holder">Message</span>
      </NavLink>

      <NavLink
        to="/home/reels"
        className={({ isActive }) =>
          isActive ? "nav-item active" : "nav-item"
        }
      >
        <span className="icon-holder"><Clapperboard size={32} /></span>
        <span className="nav-text-holder">Reels</span>
      </NavLink>

      <div
        className={`nav-item ${isOpen ? "active" : ""}`}
        onClick={()=>{toggleNotification()}}
      >
        <span className="icon-holder"><Bell size={32} /></span>
        <span className="nav-text-holder">Notifications</span>
      </div>

      {/* CREATE POST – OVERLAY TRIGGER */}
      <div className="nav-item create-special" onClick={onCreatePost}>
        <span className="icon-holder"><PlusSquare size={32} /></span>
        <span className="nav-text-holder">Create Post</span>
      </div>

      <NavLink
        to="/home/saved"
        className={({ isActive }) =>
          isActive ? "nav-item active" : "nav-item"
        }
      >
        <span className="icon-holder"><Bookmark size={32} /></span>
        <span className="nav-text-holder">Saved</span>
      </NavLink>

      <NavLink
        to="/home/settings"
        className={({ isActive }) =>
          isActive ? "nav-item active" : "nav-item"
        }
      >
        <span className="icon-holder"><Settings size={32} /></span>
        <span className="nav-text-holder">Settings</span>
      </NavLink>

      <NavLink
        to="/home/user-profile"
        className={({ isActive }) =>
          isActive
            ? "nav-item active profile-in-nav-holder"
            : "nav-item profile-in-nav-holder"
        }
      >
        <span className="isCircle"></span>
        <span className="nav-text-holder">Profile</span>
      </NavLink>
    </div>
  );
}

export default SideNavBar;

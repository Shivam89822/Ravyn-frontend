import React from 'react'
import "./MessageSection.css"
import { useSelector } from "react-redux";

function MessageItem({post,activeUser}) {
    const user = useSelector((state) => state.user.user);
    
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
    <div>
            {post.senderId == user._id ? (
              post.type=="text"?(
              <div  className="whole-msg-container">
                <div className="chat-msg right">
                  {post.content}
                  <span className="time">{formatMessageTime(post.createdAt)}</span>
                </div>
                <div className="profile-circle sender-circle">
                  {user.profilePictureUrl && (
                    <img style={{ width: "100%" }} src={user.profilePictureUrl} alt="" />
                  )}
                </div>
              </div>):(
                post.type=="image"?
                (<div  className="whole-msg-container">
                <div className="chat-msg reel-right">
                  <div className="reelCard-msg">
                    <div className="reelCard-first">
                      <div className="small-avatar">{post.mediaMeta.profilePictureUrl&&<img style={{width:"100%",height:"100%",borderRadius:"50%"}} src={post.mediaMeta.profilePictureUrl} alt="" />}</div>
                      <div className="owner-name">{post.mediaMeta.ownerName}</div>
                    </div>
                    <div><img style={{width:"100%"}} src={post.mediaMeta.mediaUrl} alt="" /></div>
                    <div className="owner-post-caption">
                      {post.mediaMeta.caption}
                    </div>
                  </div>  
                  <span className="time">{formatMessageTime(post.createdAt)}</span>

                </div>
                </div>):(
                  <div  className="whole-msg-container">
                <div className="chat-msg reel-right">
                   <div className="reelCard-msg">
                    <div className="reelCard-first">
                      <div className="small-avatar">{post.mediaMeta.profilePictureUrl&&<image style={{width:"100%",height:"100%",borderRadius:"50%"}} src={post.mediaMeta.profilePictureUrl} alt="" />}</div>
                      <div className="owner-name">{post.mediaMeta.ownerName}</div>
                    </div>
                    <div><video style={{width:"100%"}} src={post.mediaMeta.mediaUrl} alt="" /></div>
                    <div className="owner-post-caption">
                      {post.mediaMeta.caption}
                    </div>
                  </div>    
                  
                  <span className="time">{formatMessageTime(post.createdAt)}</span>
                </div>
   
                </div>
                )
              )
            ) : (
               post.type=="text"? (<div  className="whole-msg-container">
                <div className="profile-circle">
                  {activeUser?.profilePictureUrl && (
                    <img style={{ width: "100%" }} src={activeUser.profilePictureUrl} alt="" />
                  )}
                </div>
                <div className="chat-msg left">
                  {post.content}
                  <span className="time">{formatMessageTime(post.createdAt)}</span>
                </div>
              </div>):(
                post.type=="image"?(
                  <div  className="whole-msg-container">
                <div className="chat-msg reel-left">
                  <div className="reelCard-msg">
                    <div className="reelCard-first">
                      <div className="small-avatar">{post.mediaMeta.profilePictureUrl&&<img style={{width:"100%",height:"100%",borderRadius:"50%"}} src={post.mediaMeta.profilePictureUrl} alt="" />}</div>
                      <div className="owner-name">{post.mediaMeta.ownerName}</div>
                    </div>
                    <div><img style={{width:"100%"}} src={post.mediaMeta.mediaUrl} alt="" /></div>
                    <div className="owner-post-caption">
                      {post.mediaMeta.caption}
                    </div>
                  </div> 
                  <span className="time">{formatMessageTime(post.createdAt)}</span>

                </div>
                </div>
                ):(
                  <div  className="whole-msg-container">
                <div className="chat-msg reel-left">
                   <div className="reelCard-msg">
                    <div className="reelCard-first">
                      <div className="small-avatar">{post.mediaMeta.profilePictureUrl&&<image style={{width:"100%",height:"100%",borderRadius:"50%"}} src={post.mediaMeta.profilePictureUrl} alt="" />}</div>
                      <div className="owner-name">{post.mediaMeta.ownerName}</div>
                    </div>
                    <div><video style={{width:"100%"}} src={post.mediaMeta.mediaUrl} alt="" /></div>
                    <div className="owner-post-caption">
                      {post.mediaMeta.caption}
                    </div>
                  </div>    
                  
                  <span className="time">{formatMessageTime(post.createdAt)}</span>
                </div>
   
                </div>

                )
              )
            )}
      
    </div>
  )
}

export default MessageItem

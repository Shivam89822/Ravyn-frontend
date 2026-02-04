import React, { useEffect, useState } from "react";
import { X, Search, Send } from "lucide-react";
import "./ShareBox.css";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios"
function ShareBox({setShareBox,post,setPost}) {
    const conversations = useSelector((state) => state.conversations.conversations);
    const [selected,setSelected]=useState([]);
    const [disble,setDisable]=useState(false)
    const user = useSelector((state) => state.user.user);

    const sendReels=async()=>{
      setDisable(true)
      try{
        const response=await axios.post(" https://ravyn-backend.onrender.com/api/reels/share",{
          users:selected,
          postId:post._id,
          sender:user._id
        })
        console.log("sended✅");
        setPost(null);
        setShareBox(false)


      }catch(e){
        console.log(e);
      }
    }

   
    
  return (
    <div className="share-overlay">
      <div className="share-box">

       
        <div className="share-header">
          <h3>Share with Friends</h3>
          <X className="close-icon" onClick={()=>{setShareBox(false);if(setPost)setPost(null)}}/>
        </div>

       
        <div className="search-box">
          <Search size={16} />
          <input type="text" placeholder="Search friends..." />
        </div>

     
        <div className="friend-list">
          {conversations.map(
            (item, i) => (
              <div className="friend-item" key={i}>
                <div className="friend-left">
                  <div className="avatar" >{item.friendProfilePic&&<img src={item.friendProfilePic}></img>}</div>
                  <span>{item.friendName}</span>
                </div>
                <input type="checkbox" onChange={(e) => {
                    if (e.target.checked) {
                        setSelected(prev => [...prev, item.friendId]);
                    } else {
                        setSelected(prev =>
                        prev.filter(id => id !== item.friendId)
                        );
                    }
                    }}/>
              </div>
            )
          )}
        </div>


        <button className="share-btn" onClick={()=>{sendReels()}} disabled={disble}>
          <Send size={18} 
           />
          Share
        </button>
      </div>
    </div>
  );
}

export default ShareBox;

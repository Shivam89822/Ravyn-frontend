import React, { useState } from "react";
import "./SearchNavBar.css";
import { Bell, User } from "lucide-react";
import axios from 'axios'
import { useNavigate } from "react-router-dom";
function SearchNavBar() {
  const tempObj = [
    { user: "shivam", location: "MP" },
    { user: "krishna", location: "UP" },
  ];
  const [suggestedPlayer,setSuggestedPlayer]=useState([]);
  const navigate=useNavigate()
  const [currSearch,setCurrSearch]=useState("")

 const searchPlayer = async (val) => {
  try {
    if (!val.trim()) return setSuggestedPlayer([]);

    const response = await axios.get(
      "http://localhost:8080/api/user/fetchuser",
      {
        params: { data: val } // ✅ QUERY PARAM
      }
    );

    setSuggestedPlayer(response.data);
  } catch (e) {
    console.log(e.response?.data?.message || "Backend error");
  }
};


  return (
    <nav id="search-navbar">
      <div className="nav-items search-holder-box">
        <input
          placeholder="Search Users ...."
          type="search"
          id="main-search"
          value={currSearch}
          onChange={(e)=>{setCurrSearch(e.target.value);searchPlayer(e.target.value)}}
        />

        <div className="search-guess-box">
          {suggestedPlayer.map((item, key) => (
            <div className="search-guess"
            onClick={()=>{setCurrSearch("");setSuggestedPlayer([]);navigate(`/home/profile/${item.userName}`)}}
            key={key}>
            
              <div className="is-profile-holder">
                {item.userName?.[0]?.toUpperCase()}
              </div>

              <div className="contain-name-user">
                <div className="user-above-info" style={{color:"white"}}>{item.fullName}</div>
                <div className="user-below-info">{item.userName}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="nav-items icon-wrapper">
        <div className="icon-circle">
          <Bell size={22} />
          <span className="notification-badge">3</span>
        </div>

        <div className="icon-circle">
          <User size={22} />
        </div>
      </div>
    </nav>
  );
}

export default SearchNavBar;

import React, { useState, useCallback } from "react";
import "./SearchNavBar.css";
import { Bell, User } from "lucide-react";
import axios from 'axios'
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import debounce from "lodash.debounce";

function SearchNavBar() {
  const user = useSelector((state) => state.user.user);
  const [suggestedPlayer, setSuggestedPlayer] = useState([]);
  const navigate = useNavigate()
  const [currSearch, setCurrSearch] = useState("")
  

  const debouncedSearch = useCallback(
    debounce(async (val) => {
      if (!val.trim()) {
        setSuggestedPlayer([]);
        return;
      }

      try {
        const response = await axios.get(
          " https://ravyn-backend.onrender.com/api/user/fetchuser",
          {
            params: { data: val, userId: user?._id }
          }
        );
        setSuggestedPlayer(response.data);
      } catch (e) {
        console.log(e.response?.data?.message || "Backend error");
      }
    }, 300),
    [user?._id]
  );

  const handleInputChange = (e) => {
    const value = e.target.value;
    setCurrSearch(value);
    debouncedSearch(value);
  };

  return (
    <nav id="search-navbar">
      <div className="nav-logo-mobile">Ravyn</div>
      
      <div className="nav-items search-holder-box">
        <input
          placeholder="Search Users ...."
          type="search"
          id="main-search"
          value={currSearch}
          onChange={handleInputChange}
        />

        {suggestedPlayer.length > 0 && (
          <div className="search-guess-box">
            {suggestedPlayer.map((item, key) => (
              <div className="search-guess"
                onClick={() => { setCurrSearch(""); setSuggestedPlayer([]); navigate(`/home/profile/${item.userName}`) }}
                key={key}>

                <div className="is-profile-holder">
                  {item.userName?.[0]?.toUpperCase()}
                </div>

                <div className="contain-name-user">
                  <div className="user-above-info">{item.fullName}</div>
                  <div className="user-below-info">{item.userName}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="notification-bell" onClick={()=>{navigate("/home/noticications")}}>
        <Bell size={20} color="white" />
        <span className="notification-badge">3</span>
      </div>
    </nav>
  );
}

export default SearchNavBar;
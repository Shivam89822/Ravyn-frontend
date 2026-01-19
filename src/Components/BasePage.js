import React, { useState } from 'react';
import "./BasePage.css";
import SideNavBar from './SideNavBar';
import CreatePost from './CreatePost';
import SearchNavBar from './SearchNavBar';
import { Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import CompleteProfile from './CompleteProfile';

function BasePage() {
  const [showCreatePost, setShowCreatePost] = useState(false);
  const location = useLocation();
  const user=useSelector((state) => state.user.user);

  const isReelsPage = location.pathname === "/home/reels";

  return (
    <div id="base-page-main-holder">
      {user.isFirstLogin?(
        <div><CompleteProfile/></div>
      ):(<div className="main-home-page-holder">

        {/* LEFT FIXED */}
        <aside className="Base-page-content left-side">
          <SideNavBar onCreatePost={() => setShowCreatePost(true)} />
        </aside>

        {/* RIGHT FIXED */}
        <div className="Base-page-content center-right-side">
          
          {/* Hide SearchNavBar on Reels */}
          {!isReelsPage && <SearchNavBar />}

          {/* ROUTE CONTENT */}
          <div className="dynamic-content">
            <Outlet />
          </div>
        </div>

        {/* OVERLAY – NOT ROUTE */}
        {showCreatePost && (
          <div className="createPost-overlay">
            <CreatePost
              onClose={() => setShowCreatePost(false)}
              setShowCreatePost={setShowCreatePost}
            />
          </div>
        )}

      </div>)}
    </div>
  );
}

export default BasePage;

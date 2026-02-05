import React, { useState, useEffect } from "react";
import "./BasePage.css";
import SideNavBar from "./SideNavBar";
import CreatePost from "./CreatePost";
import SearchNavBar from "./SearchNavBar";
import { Outlet, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import CompleteProfile from "./CompleteProfile";
import BottomNavBar from "../newComponents/BottomNavBar";
import {
  hideBottomNav,
  showBottomNav as showBottomNavAction,
} from "../features/user/UiSlice";

function BasePage() {
  const [showCreatePost, setShowCreatePost] = useState(false);
  const dispatch = useDispatch();
  const location = useLocation();

  const user = useSelector((state) => state.user.user);
  const isBottomNavVisible = useSelector(
    (state) => state.ui.showBottomNav
  );

  const isReelsPage = location.pathname === "/home/reels";
  const hideBottomNavRoutes = ["/home/user-profile/edit-profile"];
  const shouldHideBottomNav = hideBottomNavRoutes.includes(location.pathname);

  useEffect(() => {
    if (shouldHideBottomNav) {
      dispatch(hideBottomNav());
    } else {
      dispatch(showBottomNavAction());
    }
  }, [shouldHideBottomNav, dispatch]);

  return (
    <div id="base-page-main-holder">
      {user.isFirstLogin ? (
        <CompleteProfile />
      ) : (
        <div className="main-home-page-holder">
          <aside className="Base-page-content left-side">
            <SideNavBar onCreatePost={() => setShowCreatePost(true)} />
          </aside>

          <div className="Base-page-content center-right-side">
            {!isReelsPage && <SearchNavBar />}
            <div className="dynamic-content">
              <Outlet />
            </div>
          </div>

          <div
            className={`bottom-nav-wrapper ${
              !isBottomNavVisible ? "hidden" : ""
            }`}
          >
            <BottomNavBar />
          </div>

          {showCreatePost && (
            <div className="createPost-overlay">
              <CreatePost
                onClose={() => setShowCreatePost(false)}
                setShowCreatePost={setShowCreatePost}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default BasePage;

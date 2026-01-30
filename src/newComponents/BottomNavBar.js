import React from "react";
import { NavLink } from "react-router-dom";
import { Home, Search, PlusSquare, Bell, User } from "lucide-react";
import "./BottomNavBar.css";

function BottomNavBar() {
  return (
    <nav className="bottom-nav">
      <NavLink to="/home" className={({ isActive }) => isActive ? "nav-item create" : "nav-item"}>
        <Home size={24} />
        <span>Home</span>
      </NavLink>

      <NavLink to="/home/search" className={({ isActive }) => isActive ? "nav-item create" : "nav-item"}>
        <Search size={24} />
        <span>Search</span>
      </NavLink>

      <NavLink to="/home/reels" className={({ isActive }) => isActive ? "nav-item create" : "nav-item"}>
        <PlusSquare size={24} />
        <span>Reels</span>
      </NavLink>

      <NavLink to="/home/messages" className={({ isActive }) => isActive ? "nav-item create" : "nav-item"}>
        <Bell size={24} />
        <span>Message</span>
      </NavLink>

      <NavLink to="/home/user-profile" className={({ isActive }) => isActive ? "nav-item create" : "nav-item"}>
        <User size={24} />
        <span>Profile</span>
      </NavLink>
    </nav>
  );
}

export default BottomNavBar;

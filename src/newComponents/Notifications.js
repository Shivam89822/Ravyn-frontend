import React, { useEffect, useState } from "react";
import "./Notifications.css";
import axios from "axios";
import { useSelector } from "react-redux";
import {
  Bell,
  User,
  UserPlus,
  Users,
  Heart,
  MessageCircle,
  X
} from "lucide-react";
import FeedLoader from "../Components/FeedLoader";
import { Link } from "react-router-dom";

function Notifications() {
  const user = useSelector((state) => state.user.user);
  const [notifyItem, setNotifyItem] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchNotification = async () => {
    try {
      const response = await axios.get(
        " https://ravyn-backend.onrender.com/api/notification/fetch",
        { params: { userId: user._id } }
      );
      setNotifyItem(response.data.data);
    } catch (e) {
      console.log(e.response?.data?.message || "Backend error");
    } finally {
      setIsLoading(false);
    }
  };

  const acceptFollowRequest = async (followerId, notifyId) => {
    try {
      setActionLoading(notifyId);
      await axios.post(
        " https://ravyn-backend.onrender.com/api/follow/acceptreq",
        {
          followerId,
          followingId: user._id,
          notifyId
        }
      );
      fetchNotification();
    } catch (e) {
      console.log(e.response?.data?.message || "Backend error");
    } finally {
      setActionLoading(null);
    }
  };


  const rejectFollowRequest = async (notifyId) => {
    try {
      setActionLoading(notifyId);
      await axios.post(
        " https://ravyn-backend.onrender.com/api/follow/rejectreq",
        { notifyId:notifyId }
      );
      fetchNotification();
    } catch (e) {
      console.log(e.response?.data?.message || "Backend error");
    } finally {
      setActionLoading(null);
    }
  };

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

    if (isToday) return `Today · ${time}`;
    if (msgDate.toDateString() === yesterday.toDateString())
      return `Yesterday · ${time}`;

    return `${msgDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    })} · ${time}`;
  };

  useEffect(() => {
    if (user?._id) fetchNotification();
  }, [user?._id]);

  return (
    <div className="notif-root">
      <div className="notif-header">
        <Bell size={20} />
        <span>Notifications</span>
      </div>

      {isLoading && (
        <div className="notif-loader">
          <FeedLoader />
        </div>
      )}

      {!isLoading && notifyItem.length === 0 && (
        <div className="notif-empty">
          <Bell size={28} />
          <p>No notifications yet</p>
        </div>
      )}

      <div className="notif-list">
        {notifyItem.map((item) => (
          <div className="notif-row" key={item._id}>
            <div className="notif-avatar">
              {!item.actor.profilePictureUrl && <User size={18} />}
              {item.actor.profilePictureUrl && (
                <img src={item.actor.profilePictureUrl} alt="" />
              )}
            </div>

            <div className="notif-body">
              <div className="notif-line">
                <span className="notif-username">
                    <Link className="unstyled-link" to={`/home/profile/${item.actor.userName}`}>{item.actor.userName}</Link>      
                </span>
                <span className="notif-action">
                  {item.type === "follow_request" &&
                    "requested to follow you"}
                  {item.type === "follow" &&
                    "started following you"}
                  {item.type === "post_like" &&
                    "liked your post"}
                  {item.type === "post_comment" &&
                    "commented on your post"}
                  {item.type === "comment_like" &&
                    "liked your comment"}
                </span>
              </div>

              <div className="notif-time">
                {formatMessageTime(item.createdAt)}
              </div>

              {item.type === "follow_request" && (
                <div className="notif-actions">
                  <button
                    className="btn-accept"
                    disabled={actionLoading === item._id}
                    onClick={() =>
                      acceptFollowRequest(item.actor._id, item._id)
                    }
                  >
                    Accept
                  </button>
                  <button
                    className="btn-reject"
                    disabled={actionLoading === item._id}
                    onClick={() => rejectFollowRequest(item._id)}
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>

            <div className="notif-type-icon">
              {item.type === "follow_request" && <UserPlus size={16} />}
              {item.type === "follow" && <Users size={16} />}
              {item.type === "post_like" && <Heart size={16} />}
              {item.type === "comment_like" && <Heart size={16} />}
              {item.type === "post_comment" && (
                <MessageCircle size={16} />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Notifications;

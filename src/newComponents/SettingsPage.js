import React, { useEffect, useState, useRef } from 'react';
import { Shield, Bell, Trash2, ChevronDown, Users, Heart, Settings, Lock, Mail, MessageSquare } from 'lucide-react';
import './SettingsPage.css';
import axios from 'axios';
import { useSelector } from 'react-redux';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('privacy');
  const [notifications, setNotifications] = useState({ push: true, email: false, messages: false });
  const [blocked, setBlocked] = useState([])
  const user = useSelector((state) => state.user.user);
  const [privacyActive, setPrivacyActive] = useState(null);
  const blockRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(
        " https://ravyn-backend.onrender.com/api/user/notifications",
        { params: { userId: user._id } }
      );
      setNotifications({
        push: res.data.push,
        email: res.data.email,
        messages: res.data.message 
      });
    } catch (e) {
      console.log("Failed to fetch notifications");
    }
  };

  const updateNotificationSettings = async (type, value) => {
    try {
      const updatedNotifications = {
        ...notifications,
        [type]: value
      };
      
      setNotifications(updatedNotifications);

      await axios.put(" https://ravyn-backend.onrender.com/api/user/update-notifications", {
        userId: user._id,
        notifications: {
          push: updatedNotifications.push,
          email: updatedNotifications.email,
          message: updatedNotifications.messages
        }
      });
    } catch (e) {
      console.log("Failed to update notifications");
      fetchNotifications();
    }
  };

  const unBlockUser = async (blockedId) => {
    try {
      await axios.delete(
        " https://ravyn-backend.onrender.com/api/block/unblockuser",
        {
          params: {
            blockerId: user._id,
            blockedId: blockedId,
          },
        }
      );
      fetchBlocked();
    } catch (e) {
      console.log(e.response?.data?.message || "Backend error");
    }
  };

  const updateIntrest = async () => {
    try {
    } catch (e) {
      console.log(e);
    }
  }

  const fetchBlocked = async () => {
    try {
      const response = await axios.get(" https://ravyn-backend.onrender.com/api/block/fetchblock", {
        params: { userId: user._id }
      })
      setBlocked(response.data);
    } catch (e) {
      console.log(e);
    }
  }

  const toggleInterest = async (interestKey) => {
    const newValue = !interests[interestKey];
    
    setInterests(prev => ({ ...prev, [interestKey]: newValue }));

    try {
      const activeInterests = Object.entries({ ...interests, [interestKey]: newValue })
        .filter(([_, checked]) => checked)
        .map(([name]) => name);

      await axios.put(" https://ravyn-backend.onrender.com/api/user/update-interests", {
        userId: user._id,
        interests: activeInterests
      });
    } catch (e) {
      console.log("Failed to update interests");
    }
  };

  const [interests, setInterests] = useState({
    technology: false, sports: false, music: false, travel: false,
    food: false, gaming: false, fitness: false, art: false,
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');

  const tabs = [
    { id: 'privacy', label: 'Privacy & Safety', icon: Shield },
    { id: 'feed', label: 'Feed Preferences', icon: Heart },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'danger', label: 'Account', icon: Settings },
  ];

  const handleDeleteAccount = () => {
    if (deleteInput.toLowerCase() === 'delete') {
      alert('Account deletion initiated. Check your email for confirmation.');
      setShowDeleteConfirm(false);
      setDeleteInput('');
    }
  };

  useEffect(() => {
    if (user) {
      fetchBlocked();
      fetchNotifications();
    }
  }, [user]);

  useEffect(() => {
  if (user && user.intrests) {
    const existingInterests = Object.fromEntries(
      user.intrests.map(interest => [interest, true])
    );

    setInterests(prev => ({
      ...prev,
      ...existingInterests
    }));
  }
}, [user]);

  return (
    <div className="settings-container">
      <div className="bg-blur-elements">
        <div className="blur-circle-blue"></div>
        <div className="blur-circle-purple"></div>
      </div>

      <div className="sticky-header">
        <div className="max-width-container">
          <div className="header-title-row">
            <div className="icon-box-gradient">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <h1 className="main-title">Settings</h1>
          </div>
          <p className="subtitle" style={{ color: '#9ca3af', marginLeft: '2.75rem' }}>
            Customize your experience and manage your account
          </p>
        </div>
      </div>

      <div className="max-width-container" style={{ padding: '3rem 1rem' }}>
        <div className="tab-nav-container">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            >
              <tab.icon size={18} />
              <span className="tab-label-text">{tab.label}</span>
            </button>
          ))}
        </div>

        {activeTab === 'privacy' && (
          <div className="privacy-grid animate-fadeIn">
            {[
              { title: 'Blocked Users', icon: Lock, count: blocked.length, class: 'red-card' },
              { title: 'Restricted Users', icon: Shield, count: 2, class: 'yellow-card' },
              { title: 'Close Friends', icon: Users, count: 3, class: 'green-card' }
            ].map((section, idx) => (
              <div onClick={() => {
                if (section.class === "red-card") {
                  setPrivacyActive(prev => {
                    const next = prev === "block" ? null : "block";
                    if (next === "block") {
                      setTimeout(() => {
                        blockRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                      }, 100);
                    }
                    return next;
                  });
                }
              }} key={idx} className={`privacy-card ${section.class}`}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '0.75rem' }}>
                      <section.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'white', margin: 0 }}>{section.title}</h3>
                      <p style={{ fontSize: '0.875rem', color: '#9ca3af', margin: 0 }}>{section.count} users</p>
                    </div>
                  </div>
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                </div>
                <button style={{ background: 'none', border: 'none', color: '#60a5fa', fontWeight: '600', cursor: 'pointer' }}>
                  Manage →
                </button>
                {privacyActive === "block" &&
                  section.class === "red-card" && (
                    <div ref={blockRef} className="block-list">
                      {blocked.map(item => (
                        <div key={item._id} className="block-item">
                          <div className="block-user">
                            <div className="block-info">
                              <span className="block-username">
                                @{item.blockedId.userName}
                              </span>
                              <span className="block-reason">
                                Reason: {item.reason}
                              </span>
                            </div>
                          </div>
                          <button className="unblock-btn" onClick={() => { unBlockUser(item.blockedId._id) }}>
                            Unblock
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'feed' && (
          <div className="animate-fadeIn">
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white', marginBottom: '0.5rem' }}>Personalize Your Feed</h2>
              <p style={{ color: '#9ca3af' }}>Select topics you love and we'll show you more of what matters to you</p>
            </div>
            <div className="interests-grid">
              {Object.entries(interests).map(([key, checked]) => (
                <button
                  key={key}           
                  onClick={() => {setInterests(p => ({ ...p, [key]: !p[key] }));toggleInterest(key)}}
                  className={`interest-btn ${checked ? 'checked' : ''}`}
                >
                  <div className="glow"></div>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: '600', color: checked ? 'white' : '#d1d5db' }}>
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </span>
                    <div style={{
                      width: '1.25rem', height: '1.25rem', borderRadius: '0.5rem',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: checked ? 'none' : '2px solid #4b5563',
                      backgroundColor: checked ? 'rgba(255,255,255,0.2)' : 'transparent'
                    }}>
                      {checked && <div style={{ width: '0.75rem', height: '0.75rem', backgroundColor: 'white', borderRadius: '999px' }}></div>}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { id: 'push', title: 'Push Notifications', desc: 'Alerts for likes and comments', icon: Bell, state: notifications.push },
              { id: 'email', title: 'Email Notifications', desc: 'Weekly summaries', icon: Mail, state: notifications.email },
              { id: 'messages', title: 'Message Notifications', desc: 'Direct message alerts', icon: MessageSquare, state: notifications.messages }
            ].map((item) => (
              <div key={item.id} className="notify-item">
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ padding: '0.75rem', backgroundColor: 'rgba(37,99,235,0.2)', borderRadius: '0.75rem' }}>
                    <item.icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 style={{ fontWeight: '600', color: '#f3f4f6', margin: 0 }}>{item.title}</h3>
                    <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginTop: '0.25rem' }}>{item.desc}</p>
                  </div>
                </div>
                <button
                  className={`toggle-track ${item.state ? 'enabled' : ''}`}
                  onClick={() => updateNotificationSettings(item.id, !item.state)}
                >
                  <div className="toggle-thumb" style={{ transform: item.state ? 'translateX(1.5rem)' : 'translateX(0.25rem)' }}></div>
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'danger' && (
          <div className="animate-fadeIn">
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white', marginBottom: '2rem' }}>Account Management</h2>
            <div style={{
              background: 'linear-gradient(to bottom right, rgba(220, 38, 38, 0.2), rgba(127, 29, 29, 0.2))',
              border: '1px solid rgba(220, 38, 38, 0.4)',
              padding: '1.5rem', borderRadius: '1rem'
            }}>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ padding: '0.75rem', backgroundColor: 'rgba(220, 38, 38, 0.3)', borderRadius: '0.75rem' }}>
                  <Trash2 className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 style={{ color: '#f87171', fontWeight: '700', margin: 0 }}>Delete Account Permanently</h3>
                  <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>This action cannot be undone. All data will be lost.</p>
                </div>
              </div>

              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  style={{ backgroundColor: '#dc2626', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.75rem', border: 'none', fontWeight: '600', cursor: 'pointer' }}
                >Delete Account</button>
              ) : (
                <div className="animate-fadeIn" style={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(220, 38, 38, 0.5)' }}>
                  <p style={{ color: '#e5e7eb', fontWeight: '600' }}>Type <span style={{ color: '#f87171', backgroundColor: '#374151', padding: '0.25rem 0.5rem', borderRadius: '0.25rem' }}>DELETE</span> to confirm.</p>
                  <input
                    type="text"
                    value={deleteInput}
                    onChange={(e) => setDeleteInput(e.target.value)}
                    placeholder="Type DELETE"
                    style={{ width: '100%', backgroundColor: 'rgba(55, 65, 81, 0.5)', border: '1px solid #4b5563', padding: '0.75rem', borderRadius: '0.75rem', color: 'white', margin: '1rem 0' }}
                  />
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={deleteInput.toLowerCase() !== 'delete'}
                      style={{ flex: 1, backgroundColor: deleteInput.toLowerCase() === 'delete' ? '#dc2626' : '#374151', color: 'white', padding: '0.75rem', borderRadius: '0.75rem', border: 'none', cursor: 'pointer' }}
                    >Permanently Delete</button>
                    <button onClick={() => setShowDeleteConfirm(false)} style={{ flex: 1, backgroundColor: '#4b5563', color: 'white', padding: '0.75rem', borderRadius: '0.75rem', border: 'none', cursor: 'pointer' }}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
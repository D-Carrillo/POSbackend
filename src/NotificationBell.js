import React, { useState } from 'react';
import { useNotifications } from './NotificationContext';
import NotificationList from './NotificationList';
import './Notifications.css';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { unreadCount, fetchNotifications } = useNotifications();

  const toggleNotifications = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      fetchNotifications(); // refresh when opening
    }
  };

  return (
    <div className="notification-container">
      <div className="notification-bell" onClick={toggleNotifications}>
        <i className="fas fa-bell"></i>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </div>
      
      {isOpen && (
        <div className="notification-dropdown">
          <NotificationList onClose={() => setIsOpen(false)} />
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
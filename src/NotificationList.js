import React from 'react';
import axios from 'axios';
import { useNotifications } from './NotificationContext';
import './Notifications.css';

const NotificationList = ({ onClose }) => {
  const { notifications, loading, error, markAsRead, fetchNotifications } = useNotifications();
  const [actedNotifications, setActedNotifications] = React.useState({});
  const apiUrl = window.APP_CONFIG.API_URL;

  if (loading) {
    return <div className="notification-list-container">Loading notifications...</div>;
  }

  if (error) {
    return <div className="notification-list-container error">{error}</div>;
  }

  if (notifications.length === 0) {
    return <div className="notification-list-container">No notifications</div>;
  }

  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      markAsRead(notification.notification_id);
    }
  };

  const handleAcceptReturn = async (notification_id) => {
    try {
      await axios.post(`${apiUrl}/api/returns/accept`, { notification_id });
      alert('Return accepted successfully!');
      setActedNotifications(prev => ({...prev, [notification_id]: 'accepted'}));
      fetchNotifications(); // Refresh notifications
    } catch (err) {
      console.error('Failed to accept return:', err);
      alert('Failed to accept return: ' + (err.response?.data?.error || err.message));
    }
  };
  
  const handleDeclineReturn = async (notification_id) => {
    try {
      await axios.post(`${apiUrl}/api/returns/decline`, { notification_id });
      alert('Return declined successfully!');
      setActedNotifications(prev => ({...prev, [notification_id]: 'declined'}));
      fetchNotifications(); 
    } catch (err) {
      console.error('Failed to decline return:', err);
      alert('Failed to decline return: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="notification-list-container">
      <div className="notification-header">
        <h3>Notifications</h3>
        <button className="close-button" onClick={onClose}>×</button>
      </div>
      <ul className="notification-list">
        {notifications.map((notification) => (
          <li 
            key={notification.notification_id} 
            className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
            onClick={() => handleNotificationClick(notification)}
          >
            <div className="notification-content">
              {notification.message}
            </div>
            {notification.message.includes('Return request') && (
              <div className="notification-actions">
              {notification.status === 'accepted' && (
                <div className="action-taken accepted">You accepted the return</div>
              )}
              {notification.status === 'declined' && (
                <div className="action-taken declined">You declined the return</div>
              )}
              {!notification.status && (
                <>
                  <button onClick={() => handleAcceptReturn(notification.notification_id)}>
                    Accept Return
                  </button>
                  <button onClick={() => handleDeclineReturn(notification.notification_id)}>
                    Decline Return
                  </button>
                </>
              )}
            </div>
          )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotificationList;
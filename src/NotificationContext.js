import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const apiUrl = window.APP_CONFIG.API_URL;
  
 // get current supplier ID 
const getCurrentSupplierId = () => {
  // get the user from localStorage
  const user = JSON.parse(localStorage.getItem('user'));
  
  console.log("User object from localStorage:", user);
  
  // check if user exists and is a supplier
  if (user && user.type === 'supplier') {

    console.log("Supplier ID:", user.Supplier_ID || user.supplier_id || user.id);
    
    return user.Supplier_ID || user.supplier_id || user.id || null;
  }
  
  return null;
};

const fetchNotifications = async () => {
  const supplierId = getCurrentSupplierId();
  console.log("Attempting to fetch notifications for supplier ID:", supplierId);
  
  if (!supplierId) {
    console.log("No supplier ID found, skipping notification fetch");
    return;
  }
  
  setLoading(true);
  setError(null);
  
  try {
    console.log(`Making request to: /api/notifications/supplier/${supplierId}`);
    const response = await axios.get(`${apiUrl}/api/notifications/supplier/${supplierId}`);
    console.log("Notification response:", response.data);
    setNotifications(response.data);
    setUnreadCount(response.data.filter(notif => !notif.is_read).length);
  } catch (err) {
    console.error('Failed to fetch notifications:', err);
    // log more details about the error
    if (err.response) {
      console.error("Error response data:", err.response.data);
      console.error("Error response status:", err.response.status);
      setError(`Server error: ${err.response.status} - ${JSON.stringify(err.response.data)}`);
    } else if (err.request) {
      // the request was made but no response was received
      console.error("No response received:", err.request);
      setError("No response from server. Check your network connection.");
    } else {
      // something happened in setting up the request that triggered an Error
      console.error("Request setup error:", err.message);
      setError(`Request failed: ${err.message}`);
    }
  } finally {
    setLoading(false);
  }
};

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`${apiUrl}/api/notifications/${notificationId}/read`);
      
      setNotifications(prev => 
        prev.map(notif => 
          notif.notification_id === notificationId 
            ? { ...notif, is_read: 1 } 
            : notif
        )
      );

      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  useEffect(() => {
    const supplierId = getCurrentSupplierId();
    if (!supplierId) return;

    fetchNotifications();
    
    const interval = setInterval(() => {
      fetchNotifications();
    }, 60000); 
    
    return () => clearInterval(interval);
  }, []);

  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
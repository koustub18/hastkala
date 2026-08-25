import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, Package, Sparkles, Image as ImageIcon, IndianRupee, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../hooks/useNotifications';
import { useAuth } from '../contexts/AuthContext';
import { getSafeDate } from '@hastkala/core';
import { useNavigate } from 'react-router-dom';

const getNotificationIcon = (type) => {
  switch (type) {
    case 'product_created':
    case 'product_updated':
      return <Package size={16} className="text-terracotta-500" />;
    case 'catalog_success':
    case 'catalog_failed':
      return <Sparkles size={16} className="text-yellow-500" />;
    case 'image_enhanced_success':
    case 'image_enhanced_failed':
      return <ImageIcon size={16} className="text-blue-500" />;
    case 'pricing_success':
    case 'pricing_failed':
      return <IndianRupee size={16} className="text-green-500" />;
    default:
      return <Info size={16} className="text-earth-500" />;
  }
};

const formatTimeAgo = (dateStr) => {
  const date = getSafeDate(dateStr);
  if (!date) return 'Just now';
  
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString();
};

export const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications(user?.uid);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    // Optionally navigate if there's related metadata
    if (notification.relatedProductId) {
      navigate('/seller/dashboard'); // Or specific product route if it exists
    }
    
    setIsOpen(false);
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-earth-600 hover:text-terracotta-600 transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-earth-200 overflow-hidden z-50"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-earth-100 bg-earth-50/50">
              <h3 className="font-serif font-bold text-earth-900">Activity Center</h3>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markAllAsRead();
                    }}
                    className="text-xs font-semibold text-terracotta-600 hover:text-terracotta-700 flex items-center gap-1 bg-terracotta-50 px-2 py-1 rounded"
                  >
                    <Check size={12} /> Mark all read
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-earth-500">
                  <Bell size={32} className="mx-auto mb-3 opacity-20" />
                  <p className="text-sm">No activity yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-earth-100">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-4 cursor-pointer hover:bg-earth-50 transition-colors flex gap-3 ${
                        !notification.read ? 'bg-terracotta-50/30' : ''
                      }`}
                    >
                      <div className="flex-shrink-0 mt-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          !notification.read ? 'bg-white shadow-sm' : 'bg-earth-100'
                        }`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${!notification.read ? 'font-bold text-earth-900' : 'font-medium text-earth-800'}`}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-earth-600 mt-0.5 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-[10px] text-earth-400 mt-1.5 uppercase font-semibold tracking-wider">
                          {formatTimeAgo(notification.createdAt)}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="flex-shrink-0 flex items-center">
                          <div className="w-2 h-2 rounded-full bg-terracotta-500"></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

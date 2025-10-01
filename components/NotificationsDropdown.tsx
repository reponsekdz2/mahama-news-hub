import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import { Notification } from '../types.ts';
import { fetchNotifications, markNotificationsAsRead } from '../services/userService.ts';

interface NotificationsDropdownProps {
  onNavigateToArticle: (articleId: string) => void;
}

const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({ onNavigateToArticle }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useAuth();
  const { t } = useLanguage();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user?.token) return;

    const loadNotifications = async () => {
      try {
        const fetchedNotifications = await fetchNotifications(user.token);
        setNotifications(fetchedNotifications);
      } catch (error) {
        console.error("Failed to fetch notifications", error);
      }
    };
    
    loadNotifications();
    const interval = setInterval(loadNotifications, 60000); // Poll every minute

    return () => clearInterval(interval);
  }, [user?.token]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAllAsRead = async () => {
    if (!user?.token) return;
    const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
    if (unreadIds.length === 0) return;
    try {
      await markNotificationsAsRead(unreadIds, user.token);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error("Failed to mark notifications as read", error);
    }
  };
  
  const handleNotificationClick = async (notification: Notification) => {
      if(!user?.token) return;
      if(!notification.isRead) {
          try {
              await markNotificationsAsRead([notification.id], user.token);
              setNotifications(prev => prev.map(n => n.id === notification.id ? {...n, isRead: true} : n));
          } catch(err) {
              console.error(err);
          }
      }
      onNavigateToArticle(notification.relatedArticleId);
      setIsOpen(false);
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 relative"
        aria-label={`${unreadCount} new notifications`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold" style={{fontSize: '0.6rem'}}>{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black dark:ring-gray-700 ring-opacity-5 z-40">
          <div className="p-3 flex justify-between items-center border-b dark:border-gray-700">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">{t('notifications')}</h3>
            <button onClick={handleMarkAllAsRead} disabled={unreadCount === 0} className="text-xs text-accent-600 dark:text-accent-400 hover:underline disabled:opacity-50">{t('markAllAsRead')}</button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map(n => (
                <button key={n.id} onClick={() => handleNotificationClick(n)} className={`block w-full text-left p-3 text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 ${!n.isRead ? 'bg-accent-50 dark:bg-accent-900/20' : ''}`}>
                  <p className="text-gray-700 dark:text-gray-300">
                    <strong>{n.actorName}</strong> also commented on "{n.relatedArticleTitle}"
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </button>
              ))
            ) : (
              <p className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">{t('noNewNotifications')}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsDropdown;
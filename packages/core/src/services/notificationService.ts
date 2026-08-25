import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  writeBatch,
  query, 
  orderBy, 
  limit, 
  serverTimestamp,
  getDocs,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../utils/firebase';
import { Notification, CreateNotificationParams } from '../types/notification';

/**
 * Creates a notification for a specific user
 * This function handles failures silently to not break main flows
 */
export const createNotification = async (params: CreateNotificationParams): Promise<void> => {
  try {
    const notificationsRef = collection(db, 'users', params.userId, 'notifications');
    await addDoc(notificationsRef, {
      type: params.type,
      title: params.title,
      message: params.message,
      read: false,
      createdAt: serverTimestamp(),
      ...(params.relatedProductId ? { relatedProductId: params.relatedProductId } : {}),
      ...(params.metadata ? { metadata: params.metadata } : {})
    });
  } catch (error) {
    console.error('Failed to create notification:', error);
    // Deliberately not re-throwing to isolate notification failure
  }
};

/**
 * Marks a specific notification as read
 */
export const markNotificationRead = async (userId: string, notificationId: string): Promise<void> => {
  try {
    const notificationRef = doc(db, 'users', userId, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      read: true
    });
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
  }
};

/**
 * Marks all unread notifications as read for a user
 */
export const markAllNotificationsRead = async (userId: string): Promise<void> => {
  try {
    const notificationsRef = collection(db, 'users', userId, 'notifications');
    const q = query(notificationsRef, orderBy('createdAt', 'desc'), limit(50));
    
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    let count = 0;
    
    snapshot.docs.forEach(document => {
      if (!document.data().read) {
        batch.update(document.ref, { read: true });
        count++;
      }
    });
    
    if (count > 0) {
      await batch.commit();
    }
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error);
  }
};

/**
 * Subscribes to recent notifications for a user
 */
export const subscribeToNotifications = (
  userId: string, 
  limitCount: number = 20,
  onData: (notifications: Notification[]) => void
): (() => void) => {
  const notificationsRef = collection(db, 'users', userId, 'notifications');
  const q = query(notificationsRef, orderBy('createdAt', 'desc'), limit(limitCount));
  
  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Notification[];
    onData(notifications);
  }, (error) => {
    console.error('Failed to subscribe to notifications:', error);
  });
};

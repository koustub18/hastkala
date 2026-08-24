import React, { createContext, useContext, useEffect, useState } from 'react';
// @ts-ignore
import { onAuthStateChanged, setPersistence, getReactNativePersistence, User as FirebaseUser } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, getUserProfile, User } from '@hastkala/core';

interface AuthContextType {
  user: FirebaseUser | null;
  profile: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, profile: null, loading: true });

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: () => void;

    const initializeAuth = async () => {
      try {
        await setPersistence(auth, getReactNativePersistence(AsyncStorage));
      } catch (err) {
        console.warn('Firebase persistence warning:', err);
      }

      unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        setUser(currentUser);
        if (currentUser) {
          try {
            const userProfile = await getUserProfile(currentUser.uid);
            setProfile(userProfile);
          } catch (err) {
            console.error('Error fetching profile:', err);
            setProfile(null);
          }
        } else {
          setProfile(null);
        }
        setLoading(false);
      });
    };

    initializeAuth();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

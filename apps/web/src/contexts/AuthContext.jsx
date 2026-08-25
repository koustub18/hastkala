import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@hastkala/core';
import { getUserProfile, logoutUser } from '@hastkala/core';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authState, setAuthState] = useState('initializing'); // initializing, unauthenticated, profile_loading, ready

  const fetchProfile = async (uid) => {
    try {
      const userData = await getUserProfile(uid);
      setProfile(userData || null);
      return userData;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setProfile(null);
      return null;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setAuthState('profile_loading');
        await fetchProfile(currentUser.uid);
        setAuthState('ready');
      } else {
        setUser(null);
        setProfile(null);
        setAuthState('unauthenticated');
      }
    });

    return () => unsubscribe();
  }, []);

  const reloadProfile = async () => {
    if (auth.currentUser) {
      setAuthState('profile_loading');
      const userData = await fetchProfile(auth.currentUser.uid);
      setAuthState('ready');
      return userData;
    }
    return null;
  };

  const logout = () => logoutUser();

  const value = {
    user,
    profile,
    userRole: profile?.role || null,
    userStatus: profile?.status || null,
    userName: profile?.name || null,
    loading: authState === 'initializing' || authState === 'profile_loading',
    authState,
    reloadProfile,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {authState !== 'initializing' && children}
    </AuthContext.Provider>
  );
};

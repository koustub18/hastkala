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

  const fetchProfile = async (uid, retries = 3) => {
    try {
      if (auth.currentUser) {
        await auth.currentUser.getIdToken(true);
      }
    } catch (e) {
      console.warn("Failed to refresh ID token", e);
    }

    let attempt = 0;
    while (attempt < retries) {
      try {
        const userData = await getUserProfile(uid);
        setProfile(userData || null);
        return userData;
      } catch (error) {
        attempt++;
        console.warn(`Error fetching user profile (attempt ${attempt}/${retries}):`, error);
        if (attempt >= retries) {
          console.error("Max retries reached. Profile fetch failed.");
          setProfile(null);
          return null;
        }
        await new Promise(resolve => setTimeout(resolve, 500 * attempt));
      }
    }
    return null;
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

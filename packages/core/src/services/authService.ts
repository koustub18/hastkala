import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../utils/firebase';
import { User, UserRole } from '../types/user';

export const loginUser = async (email: string, password: string): Promise<FirebaseUser> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const registerUser = async (email: string, password: string, userData: { name: string; role: UserRole }): Promise<FirebaseUser> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  
  await updateProfile(user, { displayName: userData.name });

  await setDoc(doc(db, 'users', user.uid), {
    uid: user.uid,
    email: user.email,
    name: userData.name,
    role: userData.role,
    status: userData.role === 'customer' ? 'active' : (userData.role === 'admin' ? 'active' : 'pending'),
    createdAt: serverTimestamp(),
    hasOnboarded: false
  });

  return user;
};

export const logoutUser = async (): Promise<void> => {
  await signOut(auth);
};

export const getUserProfile = async (uid: string): Promise<User | null> => {
  const userDocRef = doc(db, 'users', uid);
  const userDoc = await getDoc(userDocRef);
  if (userDoc.exists()) {
    return userDoc.data() as User;
  }
  return null;
};

import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '../components/AuthProvider';

function RootLayoutNav() {
  const { user, profile, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';
    
    if (!user) {
      if (!inAuthGroup) {
        router.replace('/(auth)/login');
      }
    } else if (profile) {
      if (inAuthGroup) {
        // Route based on role
        if (profile.role === 'admin') {
          router.replace('/(admin)');
        } else if (profile.role === 'artisan') {
          router.replace('/(artisan)');
        } else {
          router.replace('/(customer)');
        }
      }
    }
  }, [user, profile, loading, segments, router]);

  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}

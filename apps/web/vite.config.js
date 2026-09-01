import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      'process.env.EXPO_PUBLIC_FIREBASE_API_KEY': JSON.stringify(env.EXPO_PUBLIC_FIREBASE_API_KEY || env.VITE_FIREBASE_API_KEY || 'AIzaSyAe4bI9u7kEo1q_r9pcVL5Wdd_7-CbuyFY'),
      'process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN': JSON.stringify(env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || env.VITE_FIREBASE_AUTH_DOMAIN || 'sihh-36ecf.firebaseapp.com'),
      'process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID': JSON.stringify(env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || env.VITE_FIREBASE_PROJECT_ID || 'sihh-36ecf'),
      'process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET': JSON.stringify(env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || env.VITE_FIREBASE_STORAGE_BUCKET || 'sihh-36ecf.firebasestorage.app'),
      'process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || env.VITE_FIREBASE_MESSAGING_SENDER_ID || '311587460892'),
      'process.env.EXPO_PUBLIC_FIREBASE_APP_ID': JSON.stringify(env.EXPO_PUBLIC_FIREBASE_APP_ID || env.VITE_FIREBASE_APP_ID || '1:311587460892:web:309919f2d04f702724ccd9'),
      'process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID': JSON.stringify(env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || env.VITE_FIREBASE_MEASUREMENT_ID || 'G-P1BDK146RQ')
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:5001',
          changeOrigin: true
        },
        '/uploads': {
          target: 'http://localhost:5001',
          changeOrigin: true
        }
      }
    }
  };
});

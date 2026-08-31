import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      'process.env.EXPO_PUBLIC_FIREBASE_API_KEY': JSON.stringify(env.EXPO_PUBLIC_FIREBASE_API_KEY || env.VITE_FIREBASE_API_KEY || ''),
      'process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN': JSON.stringify(env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || env.VITE_FIREBASE_AUTH_DOMAIN || ''),
      'process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID': JSON.stringify(env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || env.VITE_FIREBASE_PROJECT_ID || ''),
      'process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET': JSON.stringify(env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || env.VITE_FIREBASE_STORAGE_BUCKET || ''),
      'process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || env.VITE_FIREBASE_MESSAGING_SENDER_ID || ''),
      'process.env.EXPO_PUBLIC_FIREBASE_APP_ID': JSON.stringify(env.EXPO_PUBLIC_FIREBASE_APP_ID || env.VITE_FIREBASE_APP_ID || ''),
      'process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID': JSON.stringify(env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || env.VITE_FIREBASE_MEASUREMENT_ID || '')
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

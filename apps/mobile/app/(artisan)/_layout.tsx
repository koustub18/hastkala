import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../components/AuthProvider';
import { View, Text, ActivityIndicator } from 'react-native';

export default function ArtisanLayout() {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAF7F2' }}>
        <ActivityIndicator size="large" color="#8B4513" />
      </View>
    );
  }

  // If the artisan is not active (e.g. pending, new), we might want to restrict tabs, 
  // but for simplicity we'll let the screens handle their own empty/pending states.
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#8B4513',
        tabBarInactiveTintColor: '#2F4F4F',
        tabBarStyle: {
          backgroundColor: '#FAF7F2',
          borderTopColor: '#E5E5E5',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <Ionicons name="grid" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: 'Products',
          tabBarIcon: ({ color }) => <Ionicons name="cube" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="enquiries"
        options={{
          title: 'Enquiries',
          tabBarIcon: ({ color }) => <Ionicons name="chatbubbles" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
        }}
      />
      
      {/* Hide product creation/edit screens from tabs */}
      <Tabs.Screen name="product/add" options={{ href: null }} />
    </Tabs>
  );
}

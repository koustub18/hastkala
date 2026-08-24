import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function CustomerLayout() {
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
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <Ionicons name="search" size={24} color={color} />,
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
      
      {/* Hide nested screens from tabs */}
      <Tabs.Screen name="product/[id]" options={{ href: null }} />
      <Tabs.Screen name="artisan/[id]" options={{ href: null }} />
    </Tabs>
  );
}

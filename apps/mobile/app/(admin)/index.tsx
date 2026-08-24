import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../../components/AuthProvider';
import { logoutUser } from '@hastkala/core';

export default function AdminDashboard() {
  const { profile } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Command Center</Text>
      <Text style={styles.subtitle}>Welcome, {profile?.name || 'Admin'}</Text>

      <TouchableOpacity style={styles.button} onPress={() => logoutUser()}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAF7F2',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#2F4F4F',
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#8B4513',
    padding: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

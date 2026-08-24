import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '../../components/AuthProvider';
import { logoutUser } from '@hastkala/core';
import { Ionicons } from '@expo/vector-icons';

export default function ArtisanProfile() {
  const { profile } = useAuth();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Profile</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarInitial}>
            {(profile?.businessName || profile?.name || 'A').charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.name}>{profile?.businessName || profile?.name || 'Artisan'}</Text>
        
        <View style={[
          styles.statusBadge, 
          profile?.status === 'active' ? styles.statusActive : 
          profile?.status === 'rejected' ? styles.statusRejected : styles.statusPending
        ]}>
          <Text style={[
            styles.statusText,
            profile?.status === 'active' ? styles.statusTextActive : 
            profile?.status === 'rejected' ? styles.statusTextRejected : styles.statusTextPending
          ]}>
            {profile?.status?.toUpperCase() || 'UNKNOWN'}
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={20} color="#666" style={styles.infoIcon} />
            <View>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{profile?.email || 'Not provided'}</Text>
            </View>
          </View>
          
          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={20} color="#666" style={styles.infoIcon} />
            <View>
              <Text style={styles.label}>Phone</Text>
              <Text style={styles.value}>{profile?.phone || 'Not provided'}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={20} color="#666" style={styles.infoIcon} />
            <View>
              <Text style={styles.label}>Location</Text>
              <Text style={styles.value}>
                {profile?.city ? `${profile.city}${profile.state ? `, ${profile.state}` : ''}` : 'Not provided'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Business Description</Text>
          <Text style={styles.bioText}>
            {profile?.businessDesc || 'You have not provided a business description.'}
          </Text>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={() => logoutUser()}>
          <Ionicons name="log-out-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  content: {
    padding: 20,
    alignItems: 'center',
    paddingBottom: 40,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#8B4513',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 20,
  },
  avatarInitial: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2F4F4F',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 32,
    borderWidth: 1,
  },
  statusActive: {
    backgroundColor: '#E8F5E9',
    borderColor: '#C8E6C9',
  },
  statusPending: {
    backgroundColor: '#FFF3E0',
    borderColor: '#FFE0B2',
  },
  statusRejected: {
    backgroundColor: '#FFEBEE',
    borderColor: '#FFCDD2',
  },
  statusText: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  statusTextActive: {
    color: '#2E7D32',
  },
  statusTextPending: {
    color: '#E65100',
  },
  statusTextRejected: {
    color: '#C62828',
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    marginBottom: 20,
    width: '100%',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    marginRight: 16,
    width: 24,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginVertical: 12,
    marginLeft: 40,
  },
  label: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2F4F4F',
  },
  bioText: {
    fontSize: 14,
    color: '#444',
    lineHeight: 22,
    marginTop: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#8B4513',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 12,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../../components/AuthProvider';
import { getProducts, getEnquiriesByArtisan, Product, Enquiry } from '@hastkala/core';
import { Ionicons } from '@expo/vector-icons';

export default function ArtisanDashboard() {
  const { profile } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (!profile?.uid) return;
        
        const productsData = await getProducts({ artisanId: profile.uid });
        setProducts(productsData || []);

        const enquiriesData = await getEnquiriesByArtisan(profile.uid);
        setEnquiries(enquiriesData || []);
      } catch (error) {
        console.error("Failed to load artisan dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [profile]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#8B4513" />
      </View>
    );
  }

  const isPending = profile?.status === 'pending';
  const newEnquiriesCount = enquiries.filter(e => e.status === 'new').length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome, {profile?.businessName || profile?.name || 'Artisan'}</Text>
        <Text style={styles.date}>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>
      </View>

      {isPending && (
        <View style={styles.pendingAlert}>
          <Ionicons name="time" size={24} color="#8B4513" style={styles.alertIcon} />
          <View style={styles.alertTextContainer}>
            <Text style={styles.alertTitle}>Account Pending Approval</Text>
            <Text style={styles.alertText}>Your artisan account is currently under review by our admin team. Some features may be restricted until approved.</Text>
          </View>
        </View>
      )}

      <Text style={styles.sectionTitle}>Overview</Text>
      
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Ionicons name="cube-outline" size={32} color="#2F4F4F" />
          <Text style={styles.statValue}>{products.length}</Text>
          <Text style={styles.statLabel}>Total Products</Text>
        </View>
        
        <View style={styles.statCard}>
          <Ionicons name="chatbubbles-outline" size={32} color="#D2691E" />
          <Text style={styles.statValue}>{enquiries.length}</Text>
          <Text style={styles.statLabel}>Total Enquiries</Text>
        </View>

        <View style={[styles.statCard, { width: '100%' }]}>
          <Ionicons name="mail-unread-outline" size={32} color="#E53935" />
          <Text style={styles.statValue}>{newEnquiriesCount}</Text>
          <Text style={styles.statLabel}>New Enquiries</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAF7F2',
  },
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  pendingAlert: {
    flexDirection: 'row',
    backgroundColor: '#FFF3E0',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFE0B2',
    marginBottom: 24,
  },
  alertIcon: {
    marginRight: 12,
  },
  alertTextContainer: {
    flex: 1,
  },
  alertTitle: {
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 4,
  },
  alertText: {
    fontSize: 14,
    color: '#8B4513',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2F4F4F',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  statCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2F4F4F',
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

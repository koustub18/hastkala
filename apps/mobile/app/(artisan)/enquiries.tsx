import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Linking, Alert } from 'react-native';
import { useAuth } from '../../components/AuthProvider';
import { getEnquiriesByArtisan, Enquiry, getSafeDate } from '@hastkala/core';
import { Ionicons } from '@expo/vector-icons';

export default function ArtisanEnquiries() {
  const { profile } = useAuth();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnquiries = async () => {
      try {
        if (!profile?.uid) return;
        const data = await getEnquiriesByArtisan(profile.uid);
        setEnquiries(data || []);
      } catch (error) {
        console.error("Failed to load enquiries:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEnquiries();
  }, [profile]);

  const handleContact = (email: string | undefined) => {
    if (!email) {
      Alert.alert('Error', 'Customer email not available.');
      return;
    }
    Linking.openURL(`mailto:${email}`);
  };

  const renderEnquiry = ({ item }: { item: Enquiry }) => {
    const safeDate = getSafeDate(item.createdAt);
    const dateString = safeDate ? safeDate.toLocaleDateString() : 'Unknown Date';

    return (
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.productTitle}>{item.productTitle || 'Unknown Product'}</Text>
          <View style={[styles.statusBadge, item.status === 'replied' ? styles.statusReplied : styles.statusNew]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
        
        <View style={styles.customerInfo}>
          <Ionicons name="person-outline" size={16} color="#666" />
          <Text style={styles.customerName}>{item.customerName || 'Customer'}</Text>
          <Text style={styles.dateText}> • {dateString}</Text>
        </View>

        <Text style={styles.messageText}>{item.message}</Text>
        
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleContact(item.customerEmail)}
          >
            <Ionicons name="mail-outline" size={18} color="#2F4F4F" />
            <Text style={styles.actionButtonText}>Email Customer</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#8B4513" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Customer Enquiries</Text>
      </View>

      <FlatList
        data={enquiries}
        renderItem={renderEnquiry}
        keyExtractor={(item) => (item.id || item._id) as string}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>You don't have any enquiries yet.</Text>
        }
      />
    </View>
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
  listContent: {
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  productTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2F4F4F',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusNew: {
    backgroundColor: '#FFF3E0',
  },
  statusReplied: {
    backgroundColor: '#E8F5E9',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    textTransform: 'uppercase',
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  customerName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#444',
    marginLeft: 6,
  },
  dateText: {
    fontSize: 12,
    color: '#888',
  },
  messageText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
    backgroundColor: '#F9F9F9',
    padding: 12,
    borderRadius: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  actionButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2F4F4F',
  },
});

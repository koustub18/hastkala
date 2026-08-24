import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../../components/AuthProvider';
import { getEnquiriesByCustomer, Enquiry, getSafeDate } from '@hastkala/core';

export default function CustomerEnquiries() {
  const { profile } = useAuth();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnquiries = async () => {
      try {
        if (profile?.email) {
          const data = await getEnquiriesByCustomer(profile.email);
          setEnquiries(data);
        }
      } catch (error) {
        console.error("Failed to load enquiries:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEnquiries();
  }, [profile]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#8B4513" />
      </View>
    );
  }

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
        
        <Text style={styles.dateText}>Sent: {dateString}</Text>
        <Text style={styles.messageLabel}>Your message:</Text>
        <Text style={styles.messageText}>{item.message}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Enquiries</Text>
      </View>

      <FlatList
        data={enquiries}
        renderItem={renderEnquiry}
        keyExtractor={(item) => (item.id || item._id) as string}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>You haven't sent any enquiries yet.</Text>
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
    marginBottom: 8,
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
  dateText: {
    fontSize: 12,
    color: '#888',
    marginBottom: 12,
  },
  messageLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#444',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

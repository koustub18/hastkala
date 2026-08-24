import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { getArtisanProfile, getProducts, Product, User } from '@hastkala/core';
import ProductCard from '../../../components/ProductCard';

export default function ArtisanProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const [artisan, setArtisan] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtisanData = async () => {
      try {
        if (!id) return;
        
        const artisanData = await getArtisanProfile(id);
        setArtisan(artisanData);

        const productsData = await getProducts({ artisanId: id });
        setProducts(productsData || []);
      } catch (error) {
        Alert.alert('Error', 'Failed to load artisan profile.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchArtisanData();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#8B4513" />
      </View>
    );
  }

  if (!artisan) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Artisan not found.</Text>
      </View>
    );
  }

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.avatarPlaceholder}>
        <Text style={styles.avatarInitial}>
          {(artisan.name || artisan.businessName || 'A').charAt(0).toUpperCase()}
        </Text>
      </View>
      <Text style={styles.name}>{artisan.businessName || artisan.name || 'Unknown Artisan'}</Text>
      
      {artisan.city || artisan.state ? (
        <Text style={styles.location}>
          {artisan.city}{artisan.city && artisan.state ? ', ' : ''}{artisan.state}
        </Text>
      ) : null}

      {artisan.businessDesc ? (
        <Text style={styles.bio}>{artisan.businessDesc}</Text>
      ) : (
        <Text style={styles.bio}>No biography provided.</Text>
      )}

      <Text style={styles.sectionTitle}>Products by {artisan.name?.split(' ')[0]}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        renderItem={({ item }) => <ProductCard product={item} />}
        keyExtractor={(item) => (item.id || item._id) as string}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>This artisan has not listed any products yet.</Text>
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
  errorText: {
    fontSize: 18,
    color: '#8B4513',
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#8B4513',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarInitial: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2F4F4F',
    marginBottom: 4,
    textAlign: 'center',
  },
  location: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  bio: {
    fontSize: 16,
    color: '#444',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B4513',
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
});

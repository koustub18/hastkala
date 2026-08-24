import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '../../components/AuthProvider';
import { getProducts, Product } from '@hastkala/core';
import ProductCard from '../../components/ProductCard';
import { useRouter } from 'expo-router';

export default function CustomerHome() {
  const { profile } = useAuth();
  const router = useRouter();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const result = await getProducts({ limit: 3 });
        setFeaturedProducts(result || []);
      } catch (error) {
        console.error("Failed to load featured products:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFeatured();
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Namaste, {profile?.name || 'Guest'}</Text>
        <Text style={styles.tagline}>Discover authentic Indian handicrafts directly from the artisans.</Text>
      </View>
      
      <View style={styles.heroBanner}>
        <Text style={styles.heroTitle}>Empowering Artisans</Text>
        <Text style={styles.heroText}>Hastkala connects you with master craftspeople across India, ensuring fair prices and authentic heritage.</Text>
      </View>
      
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Featured Crafts</Text>
        <TouchableOpacity onPress={() => router.push('/(customer)/explore')}>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#8B4513" style={styles.loader} />
      ) : (
        <View style={styles.productsContainer}>
          {featuredProducts.map((product) => (
            <ProductCard key={product.id || product._id} product={product} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#2F4F4F',
    lineHeight: 24,
  },
  heroBanner: {
    backgroundColor: '#2F4F4F',
    padding: 20,
    borderRadius: 12,
    marginBottom: 32,
  },
  heroTitle: {
    color: '#FAF7F2',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  heroText: {
    color: '#E5E5E5',
    fontSize: 14,
    lineHeight: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  seeAll: {
    color: '#D2691E',
    fontWeight: 'bold',
  },
  loader: {
    marginTop: 40,
  },
  productsContainer: {
    gap: 16,
  },
});

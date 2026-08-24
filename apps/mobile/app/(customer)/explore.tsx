import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { getProducts, Product } from '@hastkala/core';
import ProductCard from '../../components/ProductCard';

const CATEGORIES = ['All', 'Textiles', 'Pottery', 'Decor', 'Paintings', 'Metalwork', 'Jewellery', 'Wood Carving'];

export default function ExploreScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const result = await getProducts({
        limit: 20
      });
      setProducts(result || []);
    } catch (error) {
      console.error("Failed to load products:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.artisanName && p.artisanName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const renderCategory = ({ item }: { item: string }) => (
    <TouchableOpacity 
      style={[styles.categoryPill, selectedCategory === item && styles.categoryPillActive]}
      onPress={() => setSelectedCategory(item)}
    >
      <Text style={[styles.categoryText, selectedCategory === item && styles.categoryTextActive]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Explore Marketplace</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search products or artisans..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        
        <View style={styles.categoriesContainer}>
          <FlatList
            data={CATEGORIES}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={renderCategory}
            keyExtractor={item => item}
            contentContainerStyle={styles.categoriesList}
          />
        </View>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#8B4513" />
        </View>
      ) : filteredProducts.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No products found matching your search.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={({ item }) => <ProductCard product={item} />}
          keyExtractor={(item) => (item.id || item._id) as string}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
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
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  categoriesContainer: {
    height: 40,
  },
  categoriesList: {
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryPillActive: {
    backgroundColor: '#8B4513',
    borderColor: '#8B4513',
  },
  categoryText: {
    color: '#2F4F4F',
    fontWeight: 'bold',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

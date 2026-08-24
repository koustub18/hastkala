import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../../components/AuthProvider';
import { getProducts, deleteProduct, Product } from '@hastkala/core';
import ProductCard from '../../components/ProductCard';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function ArtisanProducts() {
  const { profile } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      if (!profile?.uid) return;
      setLoading(true);
      const data = await getProducts({ artisanId: profile.uid });
      setProducts(data || []);
    } catch (error) {
      console.error("Failed to load artisan products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [profile]);

  const handleDelete = (id: string | undefined) => {
    if (!id) return;
    Alert.alert('Delete Product', 'Are you sure you want to delete this product?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteProduct(id);
            setProducts(products.filter(p => p.id !== id && p._id !== id));
          } catch (err) {
            Alert.alert('Error', 'Failed to delete product.');
          }
        }
      }
    ]);
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <View style={styles.productWrapper}>
      <ProductCard product={item} />
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id || item._id)}>
          <Ionicons name="trash-outline" size={20} color="#E53935" />
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Products</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/(artisan)/product/add')}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#8B4513" />
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => (item.id || item._id) as string}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>You haven't added any products yet.</Text>
          }
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  addButton: {
    backgroundColor: '#8B4513',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 20,
  },
  productWrapper: {
    marginBottom: 24,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: -8,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  deleteText: {
    color: '#E53935',
    marginLeft: 4,
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 40,
  },
});

import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Product } from '@hastkala/core';
import { useRouter } from 'expo-router';

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const router = useRouter();

  // Determine a valid image source or use a fallback
  const imgUri = product.image || ((product as any).images && (product as any).images.length > 0 ? (product as any).images[0] : null);
  const imageSource = imgUri ? { uri: imgUri } : require('../../assets/images/favicon.png');

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => router.push(`/(customer)/product/${product.id || product._id}`)}
      activeOpacity={0.8}
    >
      <Image source={imageSource} style={styles.image} resizeMode="cover" />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{product.title}</Text>
        <Text style={styles.artisan} numberOfLines={1}>By {product.artisanName || 'Unknown Artisan'}</Text>
        <View style={styles.bottomRow}>
          <Text style={styles.category}>{product.category || 'Craft'}</Text>
          <Text style={styles.price}>₹{product.price}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  image: {
    width: '100%',
    height: 200,
    backgroundColor: '#F5F5F5',
  },
  info: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2F4F4F', // Forest
    marginBottom: 4,
  },
  artisan: {
    fontSize: 14,
    color: '#8B4513', // Terracotta
    marginBottom: 8,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  category: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#FAF7F2', // Cream
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    overflow: 'hidden',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2F4F4F', // Forest
  },
});

import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { createProduct, uploadProductImage, ProcessedImage } from '@hastkala/core';
import { useAuth } from '../../../components/AuthProvider';
import { ImageStudio } from '../../../components/artisan/ImageStudio';

export default function AddProductScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [productImage, setProductImage] = useState<ProcessedImage | null>(null);

  const handleSubmit = async () => {
    if (!title || !category || !price) {
      Alert.alert('Error', 'Please fill in all required fields (Title, Category, Price).');
      return;
    }

    if (!profile?.uid) {
      Alert.alert('Error', 'Not authenticated.');
      return;
    }

    setLoading(true);
    try {
      let imageUrl = '';
      if (productImage) {
        const imageUri = productImage.enhancedUri || productImage.compressedUri || productImage.originalUri;
        const response = await fetch(imageUri);
        const blob = await response.blob();
        imageUrl = await uploadProductImage(profile.uid, productImage.fileName || 'product.jpg', blob);
      }

      await createProduct({
        title,
        category,
        price: Number(price),
        description,
        artisanId: profile.uid,
        artisanName: profile.businessName || profile.name || 'Unknown',
        image: imageUrl,
      });
      Alert.alert('Success', 'Product added successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add product.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>Add New Product</Text>
      <Text style={styles.subtitle}>List a new handicraft in the marketplace.</Text>

      <Text style={styles.label}>Product Title *</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Handwoven Silk Saree"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>Category *</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Textiles, Pottery, Wood Carving"
        value={category}
        onChangeText={setCategory}
      />

      <Text style={styles.label}>Price (₹) *</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 1500"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Describe the material, technique, and story..."
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />

      <Text style={styles.label}>Product Image</Text>
      {productImage ? (
        <View style={styles.selectedImageContainer}>
          <Text style={styles.selectedImageText}>Image selected and ready for upload.</Text>
          <TouchableOpacity onPress={() => setProductImage(null)} style={styles.changeImageButton}>
            <Text style={styles.changeImageText}>Change Image</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ marginBottom: 32 }}>
          <ImageStudio onImageConfirmed={(image) => setProductImage(image)} />
        </View>
      )}

      <View style={styles.actionRow}>
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={() => router.back()}
          disabled={loading}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitText}>Save Product</Text>
          )}
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
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#2F4F4F',
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2F4F4F',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    marginBottom: 20,
    fontSize: 16,
  },
  textArea: {
    minHeight: 120,
  },
  infoBox: {
    backgroundColor: '#E8F5E9',
    padding: 16,
    borderRadius: 8,
    marginBottom: 32,
  },
  infoText: {
    color: '#2E7D32',
    fontSize: 14,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#E5E5E5',
  },
  cancelText: {
    color: '#444',
    fontWeight: 'bold',
    fontSize: 16,
  },
  submitButton: {
    flex: 2,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#8B4513',
  },
  submitText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  selectedImageContainer: {
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 32,
  },
  selectedImageText: {
    color: '#10B981',
    fontWeight: '500',
    marginBottom: 12,
  },
  changeImageButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
  },
  changeImageText: {
    color: '#4B5563',
    fontWeight: '600',
  }
});

import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getProductById, createEnquiry, Product } from '@hastkala/core';
import { useAuth } from '../../../components/AuthProvider';

export default function ProductDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { profile } = useAuth();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [showEnquiryForm, setShowEnquiryForm] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        if (!id) return;
        const result = await getProductById(id);
        setProduct(result);
      } catch (error) {
        Alert.alert('Error', 'Failed to load product details.');
        router.back();
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const handleEnquiry = async () => {
    if (!profile) {
      Alert.alert('Error', 'You must be logged in to send an enquiry.');
      return;
    }
    if (!product || !product.artisanId) {
      Alert.alert('Error', 'Product information is incomplete.');
      return;
    }
    if (!message.trim()) {
      Alert.alert('Validation', 'Please enter a message.');
      return;
    }

    setSubmitting(true);
    try {
      await createEnquiry({
        productId: product.id || product._id || '',
        artisanId: product.artisanId,
        customerName: profile.name || 'Customer',
        customerEmail: profile.email || '',
        message: message.trim(),
      });
      
      Alert.alert('Success', 'Your request has been sent to the artisan!');
      setShowEnquiryForm(false);
      setMessage('');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send enquiry.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#8B4513" />
      </View>
    );
  }

  if (!product) return null;

  const imageSource = product.image ? { uri: product.image } : require('../../../assets/images/favicon.png');

  return (
    <ScrollView style={styles.container}>
      <Image source={imageSource} style={styles.image} resizeMode="cover" />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{product.title}</Text>
          <Text style={styles.price}>₹{product.price}</Text>
        </View>

        <Text style={styles.category}>{product.category}</Text>
        
        <TouchableOpacity 
          style={styles.artisanRow}
          onPress={() => router.push(`/(customer)/artisan/${product.artisanId}`)}
        >
          <Text style={styles.artisanName}>Made by: {product.artisanName || 'Unknown Artisan'}</Text>
          <Text style={styles.viewProfile}>View Profile &rarr;</Text>
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{product.description || 'No description available.'}</Text>
        </View>

        {showEnquiryForm ? (
          <View style={styles.enquiryForm}>
            <Text style={styles.sectionTitle}>Message to Artisan</Text>
            <TextInput
              style={styles.input}
              placeholder="Hi, I'm interested in buying this product..."
              multiline
              numberOfLines={4}
              value={message}
              onChangeText={setMessage}
              textAlignVertical="top"
            />
            <View style={styles.formActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowEnquiryForm(false)}
                disabled={submitting}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.submitButton}
                onPress={handleEnquiry}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Send Request</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.purchaseButton}
            onPress={() => setShowEnquiryForm(true)}
          >
            <Text style={styles.purchaseButtonText}>Request to Purchase</Text>
          </TouchableOpacity>
        )}
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
  },
  image: {
    width: '100%',
    height: 300,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2F4F4F',
    flex: 1,
    marginRight: 16,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  category: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  artisanRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    marginBottom: 24,
  },
  artisanName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  viewProfile: {
    fontSize: 14,
    color: '#2F4F4F',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2F4F4F',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
  },
  purchaseButton: {
    backgroundColor: '#2F4F4F',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  purchaseButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  enquiryForm: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  input: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    marginBottom: 16,
    minHeight: 100,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelButton: {
    padding: 12,
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#8B4513',
    padding: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { createProduct, uploadProductImage, ProcessedImage } from '@hastkala/core';
import { useAuth } from '../../../components/AuthProvider';
import { ImageStudio } from '../../../components/artisan/ImageStudio';
import { Audio } from 'expo-av';
import { Mic, Square } from 'lucide-react-native';

export default function AddProductScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [productImage, setProductImage] = useState<ProcessedImage | null>(null);
  
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:5001';

  const startRecording = async () => {
    try {
      setVoiceError('');
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status === 'granted') {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
        const { recording: newRecording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        setRecording(newRecording);
        
        // 60-second limit
        setTimeout(() => {
          stopRecording(newRecording);
        }, 60000);
      } else {
        setVoiceError('Microphone permission not granted');
      }
    } catch (err) {
      console.error('Failed to start recording', err);
      setVoiceError('Failed to start recording');
    }
  };

  const stopRecording = async (rec: Audio.Recording | null = recording) => {
    if (!rec) return;
    setRecording(null);
    setIsProcessingVoice(true);
    setVoiceError('');

    try {
      await rec.stopAndUnloadAsync();
      const uri = rec.getURI();
      if (!uri) throw new Error('No recording URI found');

      const formData = new FormData();
      formData.append('audio_file', {
        uri,
        name: 'catalog_voice.m4a',
        type: 'audio/m4a',
      } as any);

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000);

      const response = await fetch(`${API_URL}/api/ai/catalog`, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        }
      });
      clearTimeout(timeout);

      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate catalog');
      }

      const generated = data.catalog;
      if (generated) {
        if (generated.title && !title) setTitle(generated.title);
        if (generated.category && !category) setCategory(generated.category);
        
        let desc = description;
        if (generated.descriptionEnglish) desc = generated.descriptionEnglish;
        if (generated.descriptionHindi) desc += `\n\nGenerated Hindi Description:\n${generated.descriptionHindi}`;
        if (generated.material) desc += `\n\nMaterial: ${generated.material}`;
        if (generated.color) desc += `\nColor: ${generated.color}`;
        if (generated.craftType) desc += `\nCraft: ${generated.craftType}`;
        
        setDescription(desc);
      }
    } catch (err: any) {
      console.error('Processing error', err);
      setVoiceError(err.message || 'Error processing audio');
    } finally {
      setIsProcessingVoice(false);
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
    }
  };

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

      <View style={styles.voiceCard}>
        <View style={styles.voiceHeader}>
          <Mic color="#8B4513" size={20} />
          <Text style={styles.voiceTitle}>Multilingual Voice Cataloging</Text>
        </View>
        <Text style={styles.voiceSubtitle}>Speak in your native language to auto-fill details.</Text>
        
        {voiceError ? <Text style={styles.errorText}>{voiceError}</Text> : null}

        <TouchableOpacity 
          style={[
            styles.voiceButton, 
            recording ? styles.recordingButton : 
            isProcessingVoice ? styles.processingButton : 
            styles.idleButton
          ]}
          onPress={() => {
            if (isProcessingVoice) return;
            if (recording) stopRecording();
            else startRecording();
          }}
          disabled={isProcessingVoice}
        >
          {isProcessingVoice ? (
            <View style={styles.voiceButtonContent}>
              <ActivityIndicator color="#8B4513" size="small" />
              <Text style={[styles.voiceButtonText, { color: '#8B4513' }]}>Processing AI...</Text>
            </View>
          ) : recording ? (
            <View style={styles.voiceButtonContent}>
              <Square color="white" size={16} fill="white" />
              <Text style={[styles.voiceButtonText, { color: 'white' }]}>Stop Recording</Text>
            </View>
          ) : (
            <View style={styles.voiceButtonContent}>
              <Mic color="white" size={16} />
              <Text style={[styles.voiceButtonText, { color: 'white' }]}>Start Speaking</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

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
  voiceCard: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  voiceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  voiceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  voiceSubtitle: {
    fontSize: 13,
    color: '#D84315',
    marginBottom: 16,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 12,
    marginBottom: 8,
    fontWeight: '500',
  },
  voiceButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  idleButton: {
    backgroundColor: '#D84315',
  },
  recordingButton: {
    backgroundColor: '#D32F2F',
  },
  processingButton: {
    backgroundColor: '#FFE0B2',
  },
  voiceButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  voiceButtonText: {
    fontWeight: 'bold',
    fontSize: 14,
    textTransform: 'uppercase',
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

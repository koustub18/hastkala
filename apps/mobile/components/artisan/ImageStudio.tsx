import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';
import { ProcessedImage } from '@hastkala/core';
import { Camera, Image as ImageIcon, Wand2, Check } from 'lucide-react-native';

interface ImageStudioProps {
  onImageConfirmed: (image: ProcessedImage) => void;
  onCancel?: () => void;
}

export const ImageStudio: React.FC<ImageStudioProps> = ({ onImageConfirmed, onCancel }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewImage, setPreviewImage] = useState<ProcessedImage | null>(null);
  const [showEnhanced, setShowEnhanced] = useState(true);
  const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:5001';

  const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

  const handleValidationAndCompression = async (uri: string): Promise<void> => {
    try {
      setIsProcessing(true);

      const fileInfo = await FileSystem.getInfoAsync(uri);
      
      if (!fileInfo.exists) {
        throw new Error('Image file not found');
      }

      if (fileInfo.size && fileInfo.size > MAX_FILE_SIZE_BYTES) {
        Alert.alert('Too Large', 'Please select an image smaller than 5MB.');
        return;
      }

      // Compress image
      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1200 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      const fileName = uri.split('/').pop() || 'product_image.jpg';

      setPreviewImage({
        originalUri: uri,
        compressedUri: manipResult.uri,
        enhancedUri: null,
        mimeType: 'image/jpeg',
        fileName,
      });

    } catch (error) {
      console.error('Image processing error:', error);
      Alert.alert('Error', 'Failed to process the selected image.');
    } finally {
      setIsProcessing(false);
    }
  };

  const openCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera access is required to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1, // We will compress it manually later
      });

      if (!result.canceled && result.assets[0]) {
        await handleValidationAndCompression(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open camera.');
    }
  };

  const openGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Gallery access is required to select photos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        await handleValidationAndCompression(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open gallery.');
    }
  };

  
  const enhanceImage = async () => {
    if (!previewImage?.compressedUri) return;

    try {
      setIsProcessing(true);
      
      const formData = new FormData();
      formData.append('image_file', {
        uri: previewImage.compressedUri,
        name: previewImage.fileName,
        type: previewImage.mimeType,
      } as any);

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);

      const response = await fetch(`${API_URL}/api/ai/enhance`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal
      });
      clearTimeout(timeout);

      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to enhance image');
      }

      const localFileUri = `${FileSystem.documentDirectory}enhanced_${Date.now()}.png`;
      await FileSystem.writeAsStringAsync(localFileUri, data.base64Image, {
        encoding: FileSystem.EncodingType.Base64,
      });

      setPreviewImage({
        ...previewImage,
        enhancedUri: localFileUri,
      });
      setShowEnhanced(true);
      
    } catch (error: any) {
      console.error('Enhancement Error:', error);
      Alert.alert('Enhancement Unavailable', 'AI enhancement is unavailable right now. You can continue with the original photo.');
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmImage = () => {
    if (previewImage) {
      if (previewImage.enhancedUri && !showEnhanced) {
        onImageConfirmed({ ...previewImage, enhancedUri: null });
      } else {
        onImageConfirmed(previewImage);
      }
    }
  };

  const resetSelection = () => {
    setPreviewImage(null);
    setShowEnhanced(true);
  };

  if (isProcessing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Processing image...</Text>
      </View>
    );
  }

  if (previewImage) {
    const displayUri = (showEnhanced && previewImage.enhancedUri) ? previewImage.enhancedUri : (previewImage.compressedUri || previewImage.originalUri);

    return (
      <View style={styles.container}>
        <Text style={styles.header}>IMAGE PREVIEW</Text>
        
        <View style={styles.previewContainer}>
          <Image 
            source={{ uri: displayUri }} 
            style={styles.previewImage} 
            contentFit="contain"
          />
        </View>

        {previewImage.enhancedUri ? (
          <>
            <View style={styles.actionRow}>
              <TouchableOpacity 
                style={[styles.secondaryButton, { flex: 1, marginRight: 4, backgroundColor: !showEnhanced ? '#E0E7FF' : '#F3F4F6' }]} 
                onPress={() => setShowEnhanced(false)}>
                <Text style={[styles.secondaryButtonText, !showEnhanced && { color: '#4F46E5' }]}>Original</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.secondaryButton, { flex: 1, marginLeft: 4, backgroundColor: showEnhanced ? '#E0E7FF' : '#F3F4F6' }]} 
                onPress={() => setShowEnhanced(true)}>
                <Text style={[styles.secondaryButtonText, showEnhanced && { color: '#4F46E5' }]}>Enhanced</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.secondaryButton} onPress={resetSelection}>
                <Text style={styles.secondaryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.confirmButton} onPress={confirmImage}>
              <Check color="white" size={20} style={{ marginRight: 8 }} />
              <Text style={styles.primaryButtonText}>Use {showEnhanced ? 'Enhanced' : 'Original'} Photo</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.secondaryButton} onPress={resetSelection}>
                <Text style={styles.secondaryButtonText}>Retake</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.primaryButton} onPress={enhanceImage}>
                <Wand2 color="white" size={20} style={{ marginRight: 8 }} />
                <Text style={styles.primaryButtonText}>Enhance Photo</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.confirmButton} onPress={confirmImage}>
              <Check color="white" size={20} style={{ marginRight: 8 }} />
              <Text style={styles.primaryButtonText}>Use Original Photo</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Product Photo</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.captureButton} onPress={openCamera}>
          <Camera color="#4F46E5" size={32} />
          <Text style={styles.captureButtonText}>Camera</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.captureButton} onPress={openGallery}>
          <ImageIcon color="#4F46E5" size={32} />
          <Text style={styles.captureButtonText}>Gallery</Text>
        </TouchableOpacity>
      </View>
      {onCancel && (
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.secondaryButtonText}>Cancel</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    width: '100%',
  },
  centerContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  header: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 16,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  captureButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    width: '45%',
  },
  captureButtonText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#4F46E5',
  },
  previewContainer: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#F3F4F6',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  primaryButton: {
    flex: 2,
    flexDirection: 'row',
    backgroundColor: '#4F46E5',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  secondaryButtonText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 14,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  confirmButton: {
    flexDirection: 'row',
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  cancelButton: {
    marginTop: 16,
    padding: 12,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#4B5563',
    fontWeight: '500',
  }
});

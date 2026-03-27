import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Alert, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function PhotoPicker({ photos, onPhotosChange, maxPhotos = 5 }) {
  const pickFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.7, // Lower quality for Uganda network conditions
      allowsEditing: false,
    });

    if (!result.canceled && result.assets?.[0]) {
      onPhotosChange([...photos, result.assets[0].uri]);
    }
  };

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Photo library permission is required to select photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      allowsMultipleSelection: true,
      selectionLimit: maxPhotos - photos.length,
    });

    if (!result.canceled && result.assets) {
      const newUris = result.assets.map((a) => a.uri);
      onPhotosChange([...photos, ...newUris].slice(0, maxPhotos));
    }
  };

  const removePhoto = (index) => {
    const updated = photos.filter((_, i) => i !== index);
    onPhotosChange(updated);
  };

  const showPicker = () => {
    if (photos.length >= maxPhotos) {
      Alert.alert('Limit reached', `Maximum ${maxPhotos} photos allowed.`);
      return;
    }

    Alert.alert('Add Photo', 'Choose a source', [
      { text: 'Camera', onPress: pickFromCamera },
      { text: 'Gallery', onPress: pickFromGallery },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Photos ({photos.length}/{maxPhotos})</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
        {photos.map((uri, index) => (
          <View key={index} style={styles.photoWrapper}>
            <Image source={{ uri }} style={styles.thumbnail} />
            <TouchableOpacity style={styles.removeBtn} onPress={() => removePhoto(index)}>
              <Text style={styles.removeBtnText}>×</Text>
            </TouchableOpacity>
          </View>
        ))}

        {photos.length < maxPhotos && (
          <TouchableOpacity style={styles.addBtn} onPress={showPicker}>
            <Text style={styles.addIcon}>+</Text>
            <Text style={styles.addText}>Add Photo</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  scroll: {
    flexDirection: 'row',
  },
  photoWrapper: {
    marginRight: 10,
    position: 'relative',
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
  },
  removeBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#D32F2F',
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 18,
  },
  addBtn: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#1B5E20',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addIcon: {
    fontSize: 24,
    color: '#1B5E20',
    fontWeight: '600',
  },
  addText: {
    fontSize: 10,
    color: '#1B5E20',
    marginTop: 2,
  },
});

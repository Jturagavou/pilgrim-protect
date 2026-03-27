import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { uploadImage, submitSprayReport } from '../lib/api';
import { getCurrentLocation } from '../lib/location';
import { enqueue, isOnline } from '../lib/offlineQueue';
import PhotoPicker from '../components/PhotoPicker';

export default function SprayReportScreen({ route, navigation }) {
  const { school } = route.params;

  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [roomsSprayed, setRoomsSprayed] = useState('');
  const [photos, setPhotos] = useState([]); // local URIs
  const [notes, setNotes] = useState('');
  const [gpsCoords, setGpsCoords] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Auto-capture GPS on screen load
  useEffect(() => {
    (async () => {
      const coords = await getCurrentLocation();
      setGpsCoords(coords);
      setGpsLoading(false);
    })();
  }, []);

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) setDate(selectedDate);
  };

  const handleSubmit = async () => {
    // Validation
    const rooms = parseInt(roomsSprayed, 10);
    if (!rooms || rooms < 1) {
      Alert.alert('Missing info', 'Please enter the number of rooms sprayed.');
      return;
    }
    if (rooms > school.totalRooms) {
      Alert.alert('Check rooms', `This school has ${school.totalRooms} rooms. You entered ${rooms}.`);
      return;
    }

    setSubmitting(true);

    try {
      const online = await isOnline();

      if (online) {
        // Upload photos first
        const photoUrls = [];
        for (const uri of photos) {
          try {
            const result = await uploadImage(uri);
            photoUrls.push(result.url);
          } catch (err) {
            console.log('[SprayReport] Photo upload failed:', err.message);
          }
        }

        // Submit the report
        await submitSprayReport({
          school: school._id,
          date: date.toISOString(),
          roomsSprayed: rooms,
          photos: photoUrls,
          notes: notes.trim(),
          gpsCoords: gpsCoords || { lat: 0, lng: 0 },
        });

        Alert.alert('Success', 'Spray report submitted!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        // Save to offline queue
        const count = await enqueue({
          school: school._id,
          date: date.toISOString(),
          roomsSprayed: rooms,
          localPhotos: photos, // store local URIs for later upload
          photos: [],
          notes: notes.trim(),
          gpsCoords: gpsCoords || { lat: 0, lng: 0 },
        });

        Alert.alert(
          'Saved Offline',
          `No internet — report saved locally. ${count} report${count !== 1 ? 's' : ''} will upload when connected.`,
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (err) {
      // Network error — save offline as fallback
      try {
        const count = await enqueue({
          school: school._id,
          date: date.toISOString(),
          roomsSprayed: rooms,
          localPhotos: photos,
          photos: [],
          notes: notes.trim(),
          gpsCoords: gpsCoords || { lat: 0, lng: 0 },
        });
        Alert.alert(
          'Saved Offline',
          `Submission failed — saved locally. Will retry when connected.`,
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } catch (queueErr) {
        Alert.alert('Error', 'Could not submit or save report. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const dateStr = date.toLocaleDateString('en-UG', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* School header */}
      <View style={styles.schoolHeader}>
        <Text style={styles.schoolName}>{school.name}</Text>
        <Text style={styles.schoolDistrict}>{school.district} District — {school.totalRooms} rooms</Text>
      </View>

      {/* Date */}
      <Text style={styles.label}>Date</Text>
      <TouchableOpacity style={styles.dateBtn} onPress={() => setShowDatePicker(true)}>
        <Text style={styles.dateText}>{dateStr}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          maximumDate={new Date()}
          onChange={onDateChange}
        />
      )}

      {/* Rooms sprayed */}
      <Text style={styles.label}>Rooms Sprayed</Text>
      <TextInput
        style={styles.input}
        value={roomsSprayed}
        onChangeText={setRoomsSprayed}
        placeholder={`Max ${school.totalRooms}`}
        placeholderTextColor="#999"
        keyboardType="number-pad"
        maxLength={3}
      />

      {/* Photos */}
      <PhotoPicker photos={photos} onPhotosChange={setPhotos} maxPhotos={5} />

      {/* Notes */}
      <Text style={styles.label}>Notes (optional)</Text>
      <TextInput
        style={[styles.input, styles.notesInput]}
        value={notes}
        onChangeText={setNotes}
        placeholder="E.g., Headmaster was present, 2 rooms locked..."
        placeholderTextColor="#999"
        multiline
        numberOfLines={3}
        textAlignVertical="top"
      />

      {/* GPS */}
      <View style={styles.gpsRow}>
        <Text style={styles.gpsLabel}>GPS: </Text>
        {gpsLoading ? (
          <ActivityIndicator size="small" color="#1B5E20" />
        ) : gpsCoords ? (
          <Text style={styles.gpsValue}>
            {gpsCoords.lat.toFixed(4)}, {gpsCoords.lng.toFixed(4)}
          </Text>
        ) : (
          <Text style={styles.gpsError}>Location unavailable</Text>
        )}
      </View>

      {/* Submit */}
      <TouchableOpacity
        style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
        onPress={handleSubmit}
        disabled={submitting}
        activeOpacity={0.8}
      >
        {submitting ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.submitText}>Submit Report</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  schoolHeader: {
    backgroundColor: '#1B5E20',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  schoolName: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
  },
  schoolDistrict: {
    color: '#C8E6C9',
    fontSize: 14,
    marginTop: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
    marginTop: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1B1B1B',
    backgroundColor: '#FFF',
  },
  notesInput: {
    minHeight: 80,
    paddingTop: 12,
  },
  dateBtn: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#FFF',
  },
  dateText: {
    fontSize: 16,
    color: '#1B1B1B',
  },
  gpsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    padding: 12,
    backgroundColor: '#FFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  gpsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  gpsValue: {
    fontSize: 14,
    color: '#1B5E20',
    fontWeight: '500',
  },
  gpsError: {
    fontSize: 14,
    color: '#F57C00',
  },
  submitBtn: {
    backgroundColor: '#1B5E20',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
});

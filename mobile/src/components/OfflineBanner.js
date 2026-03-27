import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { getQueue } from '../lib/offlineQueue';

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const [queueCount, setQueueCount] = useState(0);

  useEffect(() => {
    // Check connectivity
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOffline(!state.isConnected || state.isInternetReachable === false);
    });

    // Check queue count periodically
    const checkQueue = async () => {
      const queue = await getQueue();
      setQueueCount(queue.length);
    };
    checkQueue();
    const interval = setInterval(checkQueue, 5000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  // Show nothing if online and no queued items
  if (!isOffline && queueCount === 0) return null;

  return (
    <View style={[styles.banner, isOffline ? styles.offline : styles.pending]}>
      {isOffline && (
        <Text style={styles.text}>No internet connection</Text>
      )}
      {queueCount > 0 && (
        <Text style={styles.text}>
          {queueCount} report{queueCount !== 1 ? 's' : ''} pending upload
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  offline: {
    backgroundColor: '#D32F2F',
  },
  pending: {
    backgroundColor: '#F57C00',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});

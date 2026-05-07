import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { getQueue, getSyncState } from '../lib/offlineQueue';
import { pilgrimTheme } from '../theme/pilgrimTheme';

export default function OfflineBanner({ style }) {
  const [isOffline, setIsOffline] = useState(false);
  const [queueCount, setQueueCount] = useState(0);
  const [syncState, setSyncState] = useState(null);

  useEffect(() => {
    // Check connectivity
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOffline(!state.isConnected || state.isInternetReachable === false);
    });

    // Check queue count periodically
    const checkQueue = async () => {
      const queue = await getQueue();
      setQueueCount(queue.length);
      const state = await getSyncState();
      setSyncState(state);
    };
    checkQueue();
    const interval = setInterval(checkQueue, 5000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  // Show nothing if online and no queued items
  if (!isOffline && queueCount === 0 && !syncState?.message) return null;

  const bannerStyle =
    isOffline
      ? styles.offline
      : syncState?.status === 'attention'
        ? styles.warning
        : syncState?.status === 'synced'
          ? styles.success
          : styles.pending;

  return (
    <View style={[styles.banner, bannerStyle, style]}>
      {isOffline && (
        <Text style={styles.text}>Offline mode active</Text>
      )}
      {queueCount > 0 && (
        <Text style={styles.text}>
          {queueCount} report{queueCount !== 1 ? 's' : ''} waiting to sync
        </Text>
      )}
      {syncState?.message ? (
        <Text style={styles.subtext}>{syncState.message}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  offline: {
    backgroundColor: pilgrimTheme.colors.dangerText,
  },
  pending: {
    backgroundColor: pilgrimTheme.colors.primary,
  },
  warning: {
    backgroundColor: pilgrimTheme.colors.warningText,
  },
  success: {
    backgroundColor: pilgrimTheme.colors.primaryDeep,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  subtext: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 2,
    opacity: 0.9,
  },
});

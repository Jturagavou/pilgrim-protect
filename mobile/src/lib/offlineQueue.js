import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { uploadImage, submitSprayReport } from './api';

const QUEUE_KEY = 'offline_queue';

/**
 * Get the current offline queue
 */
export async function getQueue() {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Add a report to the offline queue
 * Stores the full payload including base64 photo URIs
 */
export async function enqueue(report) {
  const queue = await getQueue();
  const entry = {
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    ...report,
  };
  queue.push(entry);
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  return queue.length;
}

/**
 * Remove a specific entry from the queue by id
 */
export async function dequeue(entryId) {
  const queue = await getQueue();
  const updated = queue.filter((item) => item.id !== entryId);
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(updated));
  return updated.length;
}

/**
 * Clear the entire queue
 */
export async function clearQueue() {
  await AsyncStorage.removeItem(QUEUE_KEY);
}

/**
 * Check if device is online
 */
export async function isOnline() {
  try {
    const state = await NetInfo.fetch();
    return state.isConnected && state.isInternetReachable !== false;
  } catch {
    return false;
  }
}

/**
 * Attempt to sync all queued reports
 * Returns: { synced: number, failed: number, remaining: number }
 */
export async function syncQueue(onProgress) {
  const online = await isOnline();
  if (!online) {
    const queue = await getQueue();
    return { synced: 0, failed: 0, remaining: queue.length };
  }

  const queue = await getQueue();
  let synced = 0;
  let failed = 0;

  for (const entry of queue) {
    try {
      // Upload photos first if they are local URIs
      const uploadedUrls = [];
      if (entry.localPhotos && entry.localPhotos.length > 0) {
        for (const photoUri of entry.localPhotos) {
          const result = await uploadImage(photoUri);
          uploadedUrls.push(result.url);
        }
      }

      // Build the report payload
      const reportPayload = {
        school: entry.school,
        date: entry.date,
        roomsSprayed: entry.roomsSprayed,
        photos: uploadedUrls.length > 0 ? uploadedUrls : entry.photos || [],
        notes: entry.notes || '',
        gpsCoords: entry.gpsCoords,
      };

      await submitSprayReport(reportPayload);
      await dequeue(entry.id);
      synced++;

      if (onProgress) {
        onProgress({ synced, total: queue.length });
      }
    } catch (err) {
      console.log('[OfflineQueue] Failed to sync entry:', entry.id, err.message);
      failed++;
    }
  }

  const remaining = (await getQueue()).length;
  return { synced, failed, remaining };
}

/**
 * Subscribe to connectivity changes and auto-sync
 */
export function startAutoSync(onSyncComplete) {
  const unsubscribe = NetInfo.addEventListener(async (state) => {
    if (state.isConnected && state.isInternetReachable !== false) {
      const queue = await getQueue();
      if (queue.length > 0) {
        console.log('[OfflineQueue] Connection restored — syncing', queue.length, 'reports');
        const result = await syncQueue();
        if (onSyncComplete) onSyncComplete(result);
      }
    }
  });
  return unsubscribe;
}

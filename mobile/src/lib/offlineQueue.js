import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { uploadImage, submitSprayReport } from './api';
import { getToken } from './auth';

const QUEUE_KEY = 'offline_queue';
const SYNC_STATE_KEY = 'offline_sync_state';

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

export async function getSyncState() {
  try {
    const raw = await AsyncStorage.getItem(SYNC_STATE_KEY);
    return raw
      ? JSON.parse(raw)
      : {
          status: 'idle',
          synced: 0,
          failed: 0,
          remaining: 0,
          updatedAt: null,
          message: '',
        };
  } catch {
    return {
      status: 'idle',
      synced: 0,
      failed: 0,
      remaining: 0,
      updatedAt: null,
      message: '',
    };
  }
}

async function setSyncState(patch) {
  const prev = await getSyncState();
  const next = {
    ...prev,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  await AsyncStorage.setItem(SYNC_STATE_KEY, JSON.stringify(next));
  return next;
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
    syncStatus: 'queued',
    syncAttempts: 0,
    ...report,
  };
  queue.push(entry);
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  await setSyncState({
    status: 'queued',
    remaining: queue.length,
    message: `${queue.length} report${queue.length !== 1 ? 's' : ''} waiting to sync.`,
  });
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

export async function markQueueEntry(entryId, patch) {
  const queue = await getQueue();
  const updated = queue.map((item) =>
    item.id === entryId ? { ...item, ...patch } : item
  );
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(updated));
  return updated;
}

export async function updateQueuedReport(entryId, report) {
  const queue = await getQueue();
  let found = false;
  const updated = queue.map((item) => {
    if (item.id !== entryId) return item;
    found = true;
    return {
      ...item,
      ...report,
      id: item.id,
      createdAt: item.createdAt,
      syncStatus: 'queued',
      syncAttempts: 0,
      lastError: '',
      updatedAt: new Date().toISOString(),
    };
  });

  if (!found) return false;

  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(updated));
  await setSyncState({
    status: 'queued',
    remaining: updated.length,
    message: `${updated.length} report${updated.length !== 1 ? 's' : ''} waiting to sync.`,
  });
  return true;
}

/**
 * Clear the entire queue
 */
export async function clearQueue() {
  await AsyncStorage.removeItem(QUEUE_KEY);
  await setSyncState({
    status: 'idle',
    synced: 0,
    failed: 0,
    remaining: 0,
    message: '',
  });
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
  const token = await getToken();
  if (!token) {
    const queue = await getQueue();
    await setSyncState({
      status: 'auth_required',
      synced: 0,
      failed: 0,
      remaining: queue.length,
      message: queue.length
        ? 'Sign in to sync queued reports.'
        : '',
    });
    return { synced: 0, failed: 0, remaining: queue.length };
  }

  const online = await isOnline();
  if (!online) {
    const queue = await getQueue();
    await setSyncState({
      status: 'offline',
      synced: 0,
      failed: 0,
      remaining: queue.length,
      message: 'Still offline. Queued reports will sync when connection returns.',
    });
    return { synced: 0, failed: 0, remaining: queue.length };
  }

  const queue = await getQueue();
  await setSyncState({
    status: queue.length ? 'syncing' : 'idle',
    synced: 0,
    failed: 0,
    remaining: queue.length,
    message: queue.length
      ? `Syncing ${queue.length} queued report${queue.length !== 1 ? 's' : ''}...`
      : '',
  });

  let synced = 0;
  let failed = 0;

  for (const entry of queue) {
    try {
      await markQueueEntry(entry.id, {
        syncStatus: 'syncing',
        syncAttempts: (entry.syncAttempts || 0) + 1,
      });

      // Upload photos first if they are local URIs
      const uploadedUrls = [];
      if (entry.localPhotos && entry.localPhotos.length > 0) {
        for (const photoUri of entry.localPhotos) {
          const result = await uploadImage(photoUri);
          uploadedUrls.push(result.url);
        }
      }

      const {
        id,
        createdAt,
        syncStatus,
        syncAttempts,
        localPhotos,
        schoolSnapshot,
        lastError,
        ...reportPayloadBase
      } = entry;

      const reportPayload = {
        ...reportPayloadBase,
        photos: uploadedUrls.length > 0 ? uploadedUrls : entry.photos || [],
        notes: entry.notes || '',
        gpsCoords: entry.gpsCoords,
      };

      await submitSprayReport(reportPayload);
      await dequeue(entry.id);
      synced++;
      const remainingNow = (await getQueue()).length;
      await setSyncState({
        status: remainingNow > 0 ? 'syncing' : 'synced',
        synced,
        failed,
        remaining: remainingNow,
        message:
          remainingNow > 0
            ? `Synced ${synced}. ${remainingNow} still waiting.`
            : `All queued reports synced successfully.`,
      });

      if (onProgress) {
        onProgress({ synced, total: queue.length });
      }
    } catch (err) {
      console.log('[OfflineQueue] Failed to sync entry:', entry.id, err.message);
      failed++;
      await markQueueEntry(entry.id, {
        syncStatus: 'failed',
        lastError: err?.message || 'Sync failed',
      });
      const remainingNow = (await getQueue()).length;
      await setSyncState({
        status: 'attention',
        synced,
        failed,
        remaining: remainingNow,
        message: `${failed} queued report${failed !== 1 ? 's' : ''} need attention.`,
      });
    }
  }

  const remaining = (await getQueue()).length;
  if (remaining === 0 && failed === 0) {
    await setSyncState({
      status: 'synced',
      synced,
      failed,
      remaining,
      message: 'Everything is synced.',
    });
  }
  return { synced, failed, remaining };
}

/**
 * Subscribe to connectivity changes and auto-sync
 */
export function startAutoSync(onSyncComplete) {
  const unsubscribe = NetInfo.addEventListener(async (state) => {
    if (state.isConnected && state.isInternetReachable !== false) {
      const token = await getToken();
      const queue = await getQueue();
      if (!token) {
        if (queue.length > 0) {
          await setSyncState({
            status: 'auth_required',
            synced: 0,
            failed: 0,
            remaining: queue.length,
            message: 'Sign in to sync queued reports.',
          });
        }
        return;
      }

      if (queue.length > 0) {
        console.log('[OfflineQueue] Connection restored — syncing', queue.length, 'reports');
        const result = await syncQueue();
        if (onSyncComplete) onSyncComplete(result);
      }
    } else {
      const queue = await getQueue();
      await setSyncState({
        status: 'offline',
        synced: 0,
        failed: 0,
        remaining: queue.length,
        message: queue.length
          ? `${queue.length} report${queue.length !== 1 ? 's' : ''} waiting for connection.`
          : 'Offline. New reports will be saved on this device.',
      });
    }
  });
  return unsubscribe;
}

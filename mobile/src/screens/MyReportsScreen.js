import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { getMyReports } from '../lib/api';
import { getQueue } from '../lib/offlineQueue';
import ReportCard from '../components/ReportCard';
import OfflineBanner from '../components/OfflineBanner';
import { pilgrimTheme } from '../theme/pilgrimTheme';

export default function MyReportsScreen({ navigation }) {
  const [reports, setReports] = useState([]);
  const [queuedReports, setQueuedReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchReports = useCallback(async () => {
    const queue = await getQueue();
    const queueSorted = [...queue].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    setQueuedReports(queueSorted);

    try {
      setError('');
      const data = await getMyReports();
      // Sort newest first
      const sorted = [...data].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setReports(sorted);
    } catch (err) {
      setReports([]);
      setError(
        queueSorted.length
          ? 'Offline: showing queued reports saved on this device.'
          : 'Could not load synced reports. Pull to retry when connected.'
      );
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchReports();
      setLoading(false);
    };
    load();
  }, [fetchReports]);

  useEffect(() => {
    const unsubscribe = navigation?.addListener?.('focus', () => {
      fetchReports();
    });
    return unsubscribe;
  }, [fetchReports, navigation]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchReports();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={pilgrimTheme.colors.primary} />
        <Text style={styles.loadingText}>Loading your reports...</Text>
      </View>
    );
  }

  const allReports = [...queuedReports, ...reports];

  return (
    <View style={styles.container}>
      <OfflineBanner style={styles.offlineBanner} />
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <FlatList
        data={allReports}
        keyExtractor={(item) => item._id || item.id}
        renderItem={({ item }) => {
          const editable = item.syncStatus === 'queued' || item.syncStatus === 'failed';
          return (
            <ReportCard
              report={item}
              onPress={
                editable
                  ? () =>
                      navigation.navigate('SprayReport', {
                        school: {
                          ...(item.schoolSnapshot || {}),
                          _id: typeof item.school === 'string' ? item.school : item.school?._id,
                          name: item.schoolSnapshot?.name || item.school?.name || 'Queued school',
                          district: item.schoolSnapshot?.district || item.school?.district || '',
                          totalRooms: item.schoolSnapshot?.totalRooms || item.roomsEligible || 0,
                          studentCount: item.schoolSnapshot?.studentCount || item.studentsProtected || 0,
                        },
                        queuedReport: item,
                      })
                  : undefined
              }
            />
          );
        }}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[pilgrimTheme.colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No reports yet</Text>
            <Text style={styles.emptyHint}>Submit your first spray report to see it here.</Text>
          </View>
        }
        ListHeaderComponent={
          <View style={styles.headerCard}>
            <Text style={styles.headerEyebrow}>Reporting history</Text>
            <Text style={styles.headerTitle}>Your recent field submissions</Text>
            <Text style={styles.listHeader}>
              {allReports.length} report{allReports.length !== 1 ? 's' : ''} visible
            </Text>
            <View style={styles.summaryRow}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryValue}>{reports.length}</Text>
                <Text style={styles.summaryLabel}>Synced</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryValue}>{queuedReports.length}</Text>
                <Text style={styles.summaryLabel}>Queued</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryValue}>Recent</Text>
                <Text style={styles.summaryLabel}>Activity</Text>
              </View>
            </View>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: pilgrimTheme.colors.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    color: pilgrimTheme.colors.textMuted,
    fontSize: 15,
  },
  list: {
    paddingVertical: 10,
    paddingBottom: 24,
  },
  offlineBanner: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    borderRadius: 16,
  },
  headerCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 20,
    backgroundColor: pilgrimTheme.colors.surface,
    borderWidth: 1,
    borderColor: pilgrimTheme.colors.border,
    ...pilgrimTheme.shadow.soft,
  },
  headerEyebrow: {
    color: pilgrimTheme.colors.primary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  headerTitle: {
    marginTop: 6,
    fontSize: 20,
    fontWeight: '700',
    color: pilgrimTheme.colors.ink,
  },
  listHeader: {
    fontSize: 13,
    color: pilgrimTheme.colors.textMuted,
    marginTop: 6,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: pilgrimTheme.colors.backgroundSoft,
    borderWidth: 1,
    borderColor: pilgrimTheme.colors.border,
    paddingVertical: 10,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '800',
    color: pilgrimTheme.colors.primaryDeep,
  },
  summaryLabel: {
    fontSize: 11,
    color: pilgrimTheme.colors.textMuted,
    marginTop: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  errorContainer: {
    backgroundColor: pilgrimTheme.colors.dangerSurface,
    padding: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
  },
  errorText: {
    color: pilgrimTheme.colors.dangerText,
    textAlign: 'center',
    fontSize: 13,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  emptyText: {
    color: pilgrimTheme.colors.ink,
    fontSize: 18,
    fontWeight: '600',
  },
  emptyHint: {
    color: pilgrimTheme.colors.textMuted,
    fontSize: 14,
    marginTop: 6,
  },
});

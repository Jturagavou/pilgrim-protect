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
import ReportCard from '../components/ReportCard';

export default function MyReportsScreen() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchReports = useCallback(async () => {
    try {
      setError('');
      const data = await getMyReports();
      // Sort newest first
      const sorted = [...data].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setReports(sorted);
    } catch (err) {
      setError('Could not load reports. Pull to retry.');
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

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchReports();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1B5E20" />
        <Text style={styles.loadingText}>Loading your reports...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <FlatList
        data={reports}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <ReportCard report={item} />}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1B5E20']} />
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>No reports yet</Text>
            <Text style={styles.emptyHint}>Submit your first spray report to see it here.</Text>
          </View>
        }
        ListHeaderComponent={
          reports.length > 0 ? (
            <Text style={styles.listHeader}>
              {reports.length} report{reports.length !== 1 ? 's' : ''} submitted
            </Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 15,
  },
  list: {
    paddingVertical: 8,
  },
  listHeader: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    marginBottom: 8,
    marginTop: 4,
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
  },
  errorText: {
    color: '#C62828',
    textAlign: 'center',
    fontSize: 13,
  },
  emptyText: {
    color: '#666',
    fontSize: 18,
    fontWeight: '600',
  },
  emptyHint: {
    color: '#999',
    fontSize: 14,
    marginTop: 6,
  },
});

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { getSchools } from '../lib/api';
import { clearAuth } from '../lib/auth';
import SchoolCard from '../components/SchoolCard';
import OfflineBanner from '../components/OfflineBanner';

export default function SchoolListScreen({ navigation }) {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchSchools = useCallback(async () => {
    try {
      setError('');
      const data = await getSchools();
      // Sort: red (needs spraying) first, then orange, then green
      const sorted = [...data].sort((a, b) => {
        const getDays = (d) => {
          if (!d) return 999;
          return Math.floor((Date.now() - new Date(d).getTime()) / (1000 * 60 * 60 * 24));
        };
        return getDays(b.lastSprayDate) - getDays(a.lastSprayDate);
      });
      setSchools(sorted);
    } catch (err) {
      setError('Could not load schools. Pull to retry.');
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchSchools();
      setLoading(false);
    };
    load();
  }, [fetchSchools]);

  // Refresh when returning from SprayReportScreen
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (!loading) fetchSchools();
    });
    return unsubscribe;
  }, [navigation, fetchSchools, loading]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSchools();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    await clearAuth();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  // Configure header buttons
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={() => navigation.navigate('MyReports')}
            style={styles.headerBtn}
          >
            <Text style={styles.headerBtnText}>My Reports</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1B5E20" />
        <Text style={styles.loadingText}>Loading schools...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <OfflineBanner />

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <FlatList
        data={schools}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <SchoolCard
            school={item}
            onPress={() => navigation.navigate('SprayReport', { school: item })}
          />
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1B5E20']} />
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>No schools found</Text>
          </View>
        }
        ListHeaderComponent={
          <Text style={styles.listHeader}>
            {schools.length} school{schools.length !== 1 ? 's' : ''} — tap to report
          </Text>
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
    color: '#999',
    fontSize: 16,
  },
  headerBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  headerBtnText: {
    color: '#1B5E20',
    fontSize: 14,
    fontWeight: '600',
  },
  logoutBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginLeft: 4,
  },
  logoutText: {
    color: '#D32F2F',
    fontSize: 14,
    fontWeight: '600',
  },
});

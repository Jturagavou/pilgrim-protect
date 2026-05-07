import React, { useCallback, useEffect, useState } from 'react';
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
import { getCurrentLocation } from '../lib/location';
import { sortSchoolsByDistance } from '../lib/geo';
import { useSchoolsQuery } from '../hooks/useFieldData';
import SchoolCard from '../components/SchoolCard';
import OfflineBanner from '../components/OfflineBanner';
import { pilgrimTheme } from '../theme/pilgrimTheme';

export default function ClosestSchoolsScreen({ navigation }) {
  const [schools, setSchools] = useState([]);
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const schoolsQuery = useSchoolsQuery();

  const loadNearbySchools = useCallback(async () => {
    setError('');
    const [location, schoolList] = await Promise.all([
      getCurrentLocation(),
      schoolsQuery.data ? Promise.resolve(schoolsQuery.data) : getSchools(),
    ]);

    if (!location) {
      setCoords(null);
      setSchools([]);
      setError('GPS is unavailable. Allow location access, then try again.');
      return;
    }

    const closest = sortSchoolsByDistance(schoolList, location).slice(0, 20);
    setCoords(location);
    setSchools(closest);

    if (!closest.length) {
      setError('No schools with coordinates were found in the current dataset.');
    }
  }, [schoolsQuery.data]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        await schoolsQuery.refetch();
        await loadNearbySchools();
      } catch {
        setError('Could not calculate closest schools. Pull to retry.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [loadNearbySchools]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await schoolsQuery.refetch();
      await loadNearbySchools();
    } catch {
      setError('Could not calculate closest schools. Pull to retry.');
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={pilgrimTheme.colors.primary} />
        <Text style={styles.loadingText}>Finding your nearest schools...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <OfflineBanner />

      <FlatList
        data={schools}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <SchoolCard
            school={item}
            onPress={() => navigation.navigate('SchoolDetail', { school: item })}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[pilgrimTheme.colors.primary]}
          />
        }
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.headerCard}>
            <Text style={styles.eyebrow}>GPS school finder</Text>
            <Text style={styles.title}>Closest schools to this device</Text>
            <Text style={styles.copy}>
              Use this when you arrive in the field and need to confirm which
              school record is nearest before starting a spray report.
            </Text>

            <View style={styles.gpsCard}>
              <Text style={styles.gpsLabel}>Current GPS</Text>
              <Text style={styles.gpsValue}>
                {coords
                  ? `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`
                  : 'Not available'}
              </Text>
            </View>

            {error ? (
              <View style={styles.errorCard}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : (
              <Text style={styles.resultText}>
                Showing {schools.length} nearby school{schools.length === 1 ? '' : 's'} sorted by distance.
              </Text>
            )}

            <TouchableOpacity
              style={styles.refreshButton}
              onPress={onRefresh}
              activeOpacity={0.85}
            >
              <Text style={styles.refreshText}>Refresh GPS and schools</Text>
            </TouchableOpacity>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No nearby schools yet</Text>
            <Text style={styles.emptyHint}>
              Turn on location access or pull down to try again.
            </Text>
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
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    color: pilgrimTheme.colors.textMuted,
    fontSize: 15,
  },
  list: {
    paddingVertical: 10,
    paddingBottom: 28,
  },
  headerCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 18,
    borderRadius: 24,
    backgroundColor: pilgrimTheme.colors.primaryDeep,
    ...pilgrimTheme.shadow.card,
  },
  eyebrow: {
    color: '#ffe2d2',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: {
    marginTop: 7,
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
  },
  copy: {
    marginTop: 8,
    color: '#ffe9dd',
    fontSize: 14,
    lineHeight: 21,
  },
  gpsCard: {
    marginTop: 16,
    borderRadius: 16,
    padding: 14,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  gpsLabel: {
    color: '#ffe2d2',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  gpsValue: {
    marginTop: 5,
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  resultText: {
    marginTop: 12,
    color: '#fff',
    fontSize: 13,
    lineHeight: 18,
  },
  errorCard: {
    marginTop: 12,
    borderRadius: 14,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  errorText: {
    color: '#fff',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  refreshButton: {
    marginTop: 14,
    borderRadius: 14,
    backgroundColor: '#fff',
    paddingVertical: 13,
    alignItems: 'center',
  },
  refreshText: {
    color: pilgrimTheme.colors.primaryDeep,
    fontWeight: '800',
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 42,
  },
  emptyText: {
    color: pilgrimTheme.colors.ink,
    fontSize: 18,
    fontWeight: '800',
  },
  emptyHint: {
    color: pilgrimTheme.colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
    textAlign: 'center',
  },
});

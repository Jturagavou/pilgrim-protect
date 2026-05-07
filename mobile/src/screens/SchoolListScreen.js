import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  StyleSheet,
} from 'react-native';
import { useQueueQuery, useSchoolsQuery } from '../hooks/useFieldData';
import SchoolCard from '../components/SchoolCard';
import OfflineBanner from '../components/OfflineBanner';
import { pilgrimTheme } from '../theme/pilgrimTheme';

export default function SchoolListScreen({ navigation }) {
  const [schools, setSchools] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const schoolsQuery = useSchoolsQuery();
  const queueQuery = useQueueQuery();

  const fetchSchools = useCallback(async () => {
    try {
      setError('');
      const { data } = await schoolsQuery.refetch();
      // Sort: red (needs spraying) first, then amber, then recent (orange)
      const sorted = [...(data || [])].sort((a, b) => {
        const getDays = (d) => {
          if (!d) return 999;
          return Math.floor((Date.now() - new Date(d).getTime()) / (1000 * 60 * 60 * 24));
        };
        return getDays(b.lastSprayDate) - getDays(a.lastSprayDate);
      });
      setSchools(sorted);
      await queueQuery.refetch();
    } catch (err) {
      setError('Could not load schools. Pull to retry.');
    }
  }, [queueQuery, schoolsQuery]);

  useEffect(() => {
    const load = async () => {
      await fetchSchools();
    };
    load();
  }, [fetchSchools]);

  // Refresh when returning from SprayReportScreen
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchSchools();
    });
    return unsubscribe;
  }, [navigation, fetchSchools]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSchools();
    setRefreshing(false);
  };

  const filteredSchools = schools.filter((school) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    return (
      school.name?.toLowerCase().includes(query) ||
      school.district?.toLowerCase().includes(query) ||
      school.subCounty?.toLowerCase().includes(query)
    );
  });

  const queueCount = queueQuery.data?.length ?? 0;

  if (schoolsQuery.isLoading && !schools.length) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={pilgrimTheme.colors.primary} />
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
        data={filteredSchools}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <SchoolCard
            school={item}
            onPress={() => navigation.navigate('SchoolDetail', { school: item })}
          />
        )}
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
            <Text style={styles.emptyText}>No schools available yet</Text>
            <Text style={styles.emptyHint}>
              Pull to retry or ask your admin to confirm school imports and access.
            </Text>
          </View>
        }
        ListHeaderComponent={
          <View style={styles.listIntro}>
            <Text style={styles.eyebrow}>Field workflow</Text>
            <Text style={styles.listTitle}>Choose a school and file a report</Text>
            <Text style={styles.listHeader}>
              {filteredSchools.length} school{filteredSchools.length !== 1 ? 's' : ''} visible
              {queueCount ? ` · ${queueCount} queued for sync` : ''}
            </Text>
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search schools or districts"
              placeholderTextColor="#999"
              selectionColor={pilgrimTheme.colors.primaryDeep}
              cursorColor={pilgrimTheme.colors.primaryDeep}
            />
            <View style={styles.summaryRow}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryValue}>{filteredSchools.length}</Text>
                <Text style={styles.summaryLabel}>Schools</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryValue}>{queueCount}</Text>
                <Text style={styles.summaryLabel}>Queued</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryValue}>Live</Text>
                <Text style={styles.summaryLabel}>Workflow</Text>
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
  listIntro: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 20,
    backgroundColor: pilgrimTheme.colors.surface,
    borderWidth: 1,
    borderColor: pilgrimTheme.colors.border,
    ...pilgrimTheme.shadow.soft,
  },
  eyebrow: {
    color: pilgrimTheme.colors.primary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.3,
    textTransform: 'uppercase',
  },
  listTitle: {
    marginTop: 6,
    fontSize: 20,
    fontWeight: '700',
    color: pilgrimTheme.colors.ink,
  },
  listHeader: {
    fontSize: 13,
    color: pilgrimTheme.colors.textMuted,
    marginTop: 6,
    lineHeight: 19,
    marginBottom: 12,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: pilgrimTheme.colors.border,
    backgroundColor: pilgrimTheme.colors.backgroundSoft,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: pilgrimTheme.colors.ink,
    fontSize: 15,
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
    paddingVertical: 10,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: pilgrimTheme.colors.border,
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
    color: pilgrimTheme.colors.textMuted,
    fontSize: 17,
    fontWeight: '700',
  },
  emptyHint: {
    marginTop: 8,
    color: pilgrimTheme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});

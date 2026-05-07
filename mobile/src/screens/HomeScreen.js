import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { clearAuth, getUser } from '../lib/auth';
import { useImpactQuery, useMeQuery, useQueueQuery, useSyncStateQuery } from '../hooks/useFieldData';
import OfflineBanner from '../components/OfflineBanner';
import { pilgrimTheme } from '../theme/pilgrimTheme';

function formatRole(role) {
  return String(role || 'field_worker')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function HomeScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const meQuery = useMeQuery();
  const impactQuery = useImpactQuery();
  const queueQuery = useQueueQuery();
  const syncQuery = useSyncStateQuery();

  const loadDashboard = useCallback(async () => {
    try {
      setError('');
      const localUser = await getUser();
      if (localUser) {
        setUser(localUser);
      }
      const meData = meQuery.data;
      setUser(meData?.user || localUser);
    } catch (err) {
      const localUser = await getUser();
      setUser(localUser);
      setError('Could not refresh dashboard data. You can still continue with saved access.');
    }
  }, [meQuery.data]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await loadDashboard();
      setLoading(false);
    };
    load();
  }, [loadDashboard]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadDashboard();
    });
    return unsubscribe;
  }, [loadDashboard, navigation]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={async () => {
            await clearAuth();
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
          }}
          style={styles.headerButton}
        >
          <Text style={styles.headerButtonText}>Logout</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      meQuery.refetch(),
      impactQuery.refetch(),
      queueQuery.refetch(),
      syncQuery.refetch(),
    ]);
    await loadDashboard();
    setRefreshing(false);
  };

  const stats = impactQuery.data;
  const queueCount = queueQuery.data?.length ?? 0;
  const syncState = syncQuery.data;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={pilgrimTheme.colors.primary} />
        <Text style={styles.loadingText}>Loading your demo workspace...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[pilgrimTheme.colors.primary]}
        />
      }
    >
      <OfflineBanner style={styles.offlineBanner} />

      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Mobile Command View</Text>
        <Text style={styles.title}>
          {user?.name ? `Welcome back, ${user.name.split(' ')[0]}` : 'Welcome back'}
        </Text>
        <Text style={styles.subtitle}>
          Stay connected to the same live schools, reports, and admin data as the main site.
        </Text>

        <View style={styles.heroMetaRow}>
          <View style={styles.metaPill}>
            <Text style={styles.metaLabel}>{formatRole(user?.role)}</Text>
          </View>
          <View style={styles.metaPill}>
            <Text style={styles.metaLabel}>{queueCount} queued</Text>
          </View>
        </View>
      </View>

      {error ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{stats?.totalSchools ?? '—'}</Text>
          <Text style={styles.summaryLabel}>Schools</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{stats?.totalSprayReports ?? '—'}</Text>
          <Text style={styles.summaryLabel}>Reports</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{queueCount}</Text>
          <Text style={styles.summaryLabel}>Queued</Text>
        </View>
      </View>

      <View style={styles.impactCard}>
        <Text style={styles.sectionTitle}>Live impact snapshot</Text>
        <Text style={styles.impactLine}>
          {stats?.totalStudentsProtected?.toLocaleString?.() ?? '—'} students currently protected
        </Text>
        <Text style={styles.impactLine}>
          {stats?.totalRoomsSprayed?.toLocaleString?.() ?? '—'} rooms sprayed across the live dataset
        </Text>
        <Text style={styles.syncHint}>
          {syncState?.message || 'Everything you do here stays connected to the main demo system.'}
        </Text>
      </View>

      <View style={styles.actionGrid}>
        <TouchableOpacity
          style={[styles.actionCard, styles.actionLocate]}
          onPress={() => navigation.navigate('Nearby')}
          activeOpacity={0.85}
        >
          <Text style={[styles.actionEyebrow, styles.actionLocateEyebrow]}>
            GPS Finder
          </Text>
          <Text style={[styles.actionTitle, styles.actionLocateTitle]}>
            Find closest schools
          </Text>
          <Text style={[styles.actionCopy, styles.actionLocateCopy]}>
            Use your device location to identify nearby school records before
            filing a report.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, styles.actionPrimary]}
          onPress={() => navigation.navigate('Schools')}
          activeOpacity={0.85}
        >
          <Text style={styles.actionEyebrow}>Field Worker</Text>
          <Text style={styles.actionTitle}>Browse schools</Text>
          <Text style={styles.actionCopy}>
            Choose a school, review its context, and start a new spray report.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('Reports')}
          activeOpacity={0.85}
        >
          <Text style={styles.actionEyebrow}>Operations</Text>
          <Text style={styles.actionTitle}>View my reports</Text>
          <Text style={styles.actionCopy}>
            See synced activity and anything still waiting for connection.
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.adminCard}>
        <Text style={styles.sectionTitle}>Admin demo note</Text>
        <Text style={styles.adminCopy}>
          This mobile flow is now tied to the same live backend as the website and admin panel,
          so counts, schools, and reports stay aligned across the full demo.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: pilgrimTheme.colors.background,
  },
  content: {
    padding: 18,
    paddingBottom: 40,
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
  headerButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  headerButtonText: {
    color: pilgrimTheme.colors.primaryDeep,
    fontWeight: '700',
  },
  hero: {
    backgroundColor: pilgrimTheme.colors.primaryDeep,
    borderRadius: 24,
    padding: 20,
    marginBottom: 14,
    ...pilgrimTheme.shadow.card,
  },
  offlineBanner: {
    borderRadius: 16,
    marginBottom: 14,
  },
  eyebrow: {
    color: '#ffe2d2',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.3,
  },
  title: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '800',
    marginTop: 6,
  },
  subtitle: {
    color: '#ffe9dd',
    fontSize: 14,
    lineHeight: 22,
    marginTop: 8,
  },
  heroMetaRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  metaPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  metaLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  errorCard: {
    backgroundColor: pilgrimTheme.colors.dangerSurface,
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  errorText: {
    color: pilgrimTheme.colors.dangerText,
    fontSize: 13,
    lineHeight: 18,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: pilgrimTheme.colors.surface,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: pilgrimTheme.colors.border,
    ...pilgrimTheme.shadow.soft,
  },
  summaryValue: {
    color: pilgrimTheme.colors.primaryDeep,
    fontSize: 22,
    fontWeight: '800',
  },
  summaryLabel: {
    color: pilgrimTheme.colors.textMuted,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginTop: 4,
  },
  impactCard: {
    backgroundColor: pilgrimTheme.colors.surface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: pilgrimTheme.colors.border,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: pilgrimTheme.colors.ink,
    marginBottom: 10,
  },
  impactLine: {
    color: pilgrimTheme.colors.ink,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 6,
  },
  syncHint: {
    marginTop: 8,
    color: pilgrimTheme.colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  actionGrid: {
    gap: 12,
    marginBottom: 14,
  },
  actionCard: {
    backgroundColor: pilgrimTheme.colors.surface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: pilgrimTheme.colors.border,
    ...pilgrimTheme.shadow.soft,
  },
  actionPrimary: {
    backgroundColor: '#fff9f4',
  },
  actionLocate: {
    backgroundColor: pilgrimTheme.colors.primaryDeep,
    borderColor: pilgrimTheme.colors.primaryDeep,
  },
  actionLocateEyebrow: {
    color: '#ffe2d2',
  },
  actionLocateTitle: {
    color: '#fff',
  },
  actionLocateCopy: {
    color: '#ffe9dd',
  },
  actionEyebrow: {
    color: pilgrimTheme.colors.primary,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  actionTitle: {
    color: pilgrimTheme.colors.ink,
    fontSize: 20,
    fontWeight: '700',
    marginTop: 6,
  },
  actionCopy: {
    color: pilgrimTheme.colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
  adminCard: {
    backgroundColor: pilgrimTheme.colors.backgroundSoft,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: pilgrimTheme.colors.border,
  },
  adminCopy: {
    color: pilgrimTheme.colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
  },
});

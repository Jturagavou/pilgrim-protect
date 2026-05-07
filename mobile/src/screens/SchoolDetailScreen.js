import React, { useEffect, useState } from 'react';
import {
  Alert,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSchoolQuery } from '../hooks/useFieldData';
import { getMyReports } from '../lib/api';
import { getQueue } from '../lib/offlineQueue';
import ReportCard from '../components/ReportCard';
import { pilgrimTheme } from '../theme/pilgrimTheme';

function formatDate(dateValue) {
  if (!dateValue) return 'No verified spray date yet';
  return new Date(dateValue).toLocaleDateString('en-UG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function cleanPhase(value) {
  return String(value || 'needs review').replace(/-/g, ' ');
}

function reportSchoolId(report) {
  if (!report) return '';
  if (typeof report.school === 'string') return report.school;
  return report.school?._id || report.school?.id || '';
}

export default function SchoolDetailScreen({ route, navigation }) {
  const { school: initialSchool } = route.params;
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [queuedReports, setQueuedReports] = useState([]);
  const [submittedReports, setSubmittedReports] = useState([]);
  const schoolQuery = useSchoolQuery(initialSchool._id, initialSchool);
  const school = schoolQuery.data || initialSchool;

  const loadWorkerReports = async () => {
    const schoolId = String(initialSchool._id);
    const queue = await getQueue();
    setQueuedReports(
      queue
        .filter((report) => String(reportSchoolId(report)) === schoolId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    );

    try {
      const reports = await getMyReports();
      setSubmittedReports(
        reports
          .filter((report) => String(reportSchoolId(report)) === schoolId)
          .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
      );
    } catch {
      setSubmittedReports([]);
    }
  };

  useEffect(() => {
    navigation.setOptions({ title: school?.name || initialSchool.name });
  }, [initialSchool.name, navigation, school?.name]);

  useEffect(() => {
    loadWorkerReports();
    const unsubscribe = navigation?.addListener?.('focus', loadWorkerReports);
    return unsubscribe;
  }, [initialSchool._id, navigation]);

  const onRefresh = async () => {
    setRefreshing(true);
    setError('');
    try {
      await Promise.all([schoolQuery.refetch(), loadWorkerReports()]);
    } catch {
      setError('Could not refresh school details. Showing the latest saved school data instead.');
    } finally {
      setRefreshing(false);
    }
  };

  const startReport = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Start report?',
      'You will confirm GPS, rooms, date, photos, and notes before the report is sent for admin verification.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Begin guided report',
          onPress: async () => {
            await Haptics.selectionAsync();
            navigation.navigate('SprayReport', { school });
          },
        },
      ],
    );
  };

  if (schoolQuery.isLoading && !school) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={pilgrimTheme.colors.primary} />
        <Text style={styles.loadingText}>Loading school detail...</Text>
      </View>
    );
  }

  const recentReports = Array.isArray(school?.sprayReports)
    ? school.sprayReports.slice(0, 3)
    : [];
  const allWorkerReports = [...queuedReports, ...submittedReports];
  const openQueuedReport = (report) => {
    navigation.navigate('SprayReport', {
      school: {
        ...school,
        ...(report.schoolSnapshot || {}),
        _id: typeof report.school === 'string' ? report.school : report.school?._id || school._id,
        name: report.schoolSnapshot?.name || school.name,
        district: report.schoolSnapshot?.district || school.district,
        totalRooms: report.schoolSnapshot?.totalRooms || school.totalRooms || report.roomsEligible || 0,
        studentCount: report.schoolSnapshot?.studentCount || school.studentCount || report.studentsProtected || 0,
      },
      queuedReport: report,
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[pilgrimTheme.colors.primary]}
          />
        }
      >
        <View style={styles.hero}>
          <Text style={styles.heroEyebrow}>Verified school record</Text>
          <Text style={styles.schoolName}>{school.name}</Text>
          <Text style={styles.schoolMeta}>
            {school.district} District
            {school.subCounty ? ` · ${school.subCounty}` : ''}
          </Text>
          <Text style={styles.schoolStatus}>
            Last verified spray: {formatDate(school.lastSprayDate)}
          </Text>
        </View>

        {error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{school.totalRooms || 0}</Text>
            <Text style={styles.statLabel}>Rooms</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{school.studentCount || 0}</Text>
            <Text style={styles.statLabel}>Students</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{recentReports.length}</Text>
            <Text style={styles.statLabel}>Verified</Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Field context</Text>
          <Text style={styles.sectionCopy}>
            Confirm this is the right campus before starting. Public school status
            only moves forward after admin verification.
          </Text>
          <View style={styles.pillRow}>
            <View style={styles.pill}>
              <Text style={styles.pillText}>{cleanPhase(school.sponsorshipStatus || school.status)}</Text>
            </View>
            <View style={styles.pill}>
              <Text style={styles.pillText}>
                {school.hasMalariaClub ? 'Malaria club' : 'No club recorded'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Recent verified activity</Text>
          {recentReports.length ? (
            recentReports.map((report) => (
              <View key={report._id} style={styles.reportRow}>
                <Text style={styles.reportDate}>{formatDate(report.date)}</Text>
                <Text style={styles.reportMeta}>
                  {report.roomsSprayed} rooms sprayed
                  {report.worker?.name ? ` · ${report.worker.name}` : ''}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.sectionCopy}>No verified reports are attached to this school yet.</Text>
          )}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>My reports for this school</Text>
          {allWorkerReports.length ? (
            allWorkerReports.map((report) => {
              const editable =
                report.syncStatus === 'queued' || report.syncStatus === 'failed';
              return (
                <ReportCard
                  key={report._id || report.id}
                  report={report}
                  compact
                  onPress={editable ? () => openQueuedReport(report) : undefined}
                />
              );
            })
          ) : (
            <Text style={styles.sectionCopy}>
              No reports from your device/account are attached to this school yet.
            </Text>
          )}
          <Text style={styles.editNote}>
            Queued reports can be edited before sync. Submitted reports are locked while awaiting admin review.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.stickyFooter}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={startReport}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryButtonText}>Start Spray Report</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: pilgrimTheme.colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 18,
    paddingBottom: 112,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    color: pilgrimTheme.colors.textMuted,
    fontSize: 15,
  },
  hero: {
    borderRadius: 24,
    padding: 20,
    backgroundColor: pilgrimTheme.colors.primaryDeep,
    ...pilgrimTheme.shadow.card,
  },
  heroEyebrow: {
    color: '#ffe2d2',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  schoolName: {
    fontSize: 25,
    fontWeight: '900',
    color: '#fff',
  },
  schoolMeta: {
    marginTop: 7,
    fontSize: 14,
    color: '#ffe9dd',
  },
  schoolStatus: {
    marginTop: 12,
    fontSize: 13,
    color: '#fff',
    fontWeight: '800',
  },
  errorCard: {
    backgroundColor: pilgrimTheme.colors.dangerSurface,
    padding: 12,
    borderRadius: 14,
    marginTop: 14,
  },
  errorText: {
    color: pilgrimTheme.colors.dangerText,
    fontSize: 13,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  statCard: {
    flex: 1,
    backgroundColor: pilgrimTheme.colors.surface,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: pilgrimTheme.colors.border,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '900',
    color: pilgrimTheme.colors.primaryDeep,
  },
  statLabel: {
    marginTop: 4,
    fontSize: 11,
    color: pilgrimTheme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionCard: {
    marginTop: 14,
    borderRadius: 20,
    padding: 18,
    backgroundColor: pilgrimTheme.colors.surface,
    borderWidth: 1,
    borderColor: pilgrimTheme.colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: pilgrimTheme.colors.ink,
    marginBottom: 8,
  },
  sectionCopy: {
    color: pilgrimTheme.colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  pill: {
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 7,
    backgroundColor: pilgrimTheme.colors.backgroundSoft,
  },
  pillText: {
    color: pilgrimTheme.colors.primaryDeep,
    fontWeight: '800',
    fontSize: 12,
    textTransform: 'capitalize',
  },
  reportRow: {
    borderTopWidth: 1,
    borderTopColor: pilgrimTheme.colors.border,
    paddingTop: 12,
    marginTop: 12,
  },
  reportDate: {
    color: pilgrimTheme.colors.ink,
    fontWeight: '800',
    fontSize: 14,
  },
  reportMeta: {
    color: pilgrimTheme.colors.textMuted,
    fontSize: 13,
    marginTop: 4,
  },
  editNote: {
    marginTop: 10,
    color: pilgrimTheme.colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  stickyFooter: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: pilgrimTheme.colors.border,
    backgroundColor: pilgrimTheme.colors.surface,
  },
  primaryButton: {
    borderRadius: 16,
    backgroundColor: pilgrimTheme.colors.primaryDeep,
    alignItems: 'center',
    paddingVertical: 16,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
  },
});

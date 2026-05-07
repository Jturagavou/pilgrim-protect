import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { primaryDark, successSurface } from '../theme/pilgrimColors';
import { pilgrimTheme } from '../theme/pilgrimTheme';

export default function ReportCard({ report, onPress, compact = false }) {
  const schoolInfo = report.school || report.schoolSnapshot || {};
  const dateValue = report.date || report.createdAt;
  const dateStr = new Date(dateValue).toLocaleDateString('en-UG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const statusLabel = report.verified
    ? 'Verified'
    : report.syncStatus === 'failed'
      ? 'Retry needed'
      : report.syncStatus === 'syncing'
        ? 'Syncing'
        : report.syncStatus === 'queued'
          ? 'Queued'
          : 'Awaiting review';
  const roomsEligible = report.roomsEligible || report.schoolSnapshot?.totalRooms || 0;
  const coveragePct = roomsEligible
    ? Math.round(((report.roomsSprayed || 0) / roomsEligible) * 100)
    : null;
  const serviceTypes = Array.isArray(report.serviceTypes) && report.serviceTypes.length
    ? report.serviceTypes
    : ['irs'];

  const CardShell = onPress ? TouchableOpacity : View;

  return (
    <CardShell
      style={[styles.card, compact && styles.compactCard]}
      {...(onPress ? { onPress, activeOpacity: 0.84 } : {})}
    >
      <View style={styles.header}>
        <Text style={styles.schoolName} numberOfLines={1}>
          {schoolInfo.name || 'Unknown School'}
        </Text>
        {report.verified ? (
          <View style={styles.verifiedBadge}>
            <Text style={styles.checkmark}>✓</Text>
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
        ) : report.syncStatus === 'queued' || report.syncStatus === 'syncing' || report.syncStatus === 'failed' ? (
          <View style={[styles.verifiedBadge, styles.pendingBadge]}>
            <Text style={[styles.checkmark, styles.pendingCheckmark]}>
              {report.syncStatus === 'failed' ? '!' : '•'}
            </Text>
            <Text style={[styles.verifiedText, styles.pendingText]}>
              {report.syncStatus === 'failed'
                ? 'Retry needed'
                : report.syncStatus === 'syncing'
                  ? 'Syncing'
                  : 'Queued'}
            </Text>
          </View>
        ) : null}
      </View>

      <Text style={styles.district}>
        {schoolInfo.district ? `${schoolInfo.district} District` : 'District unavailable'}
      </Text>

      <View style={styles.statusRow}>
        <Text style={styles.statusLabel}>Status</Text>
        <Text style={styles.statusValue}>{statusLabel}</Text>
      </View>

      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Date</Text>
          <Text style={styles.detailValue}>{dateStr}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Rooms</Text>
          <Text style={styles.detailValue}>
            {report.roomsSprayed}
            {roomsEligible ? `/${roomsEligible}` : ''}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Coverage</Text>
          <Text style={styles.detailValue}>{coveragePct === null ? '—' : `${coveragePct}%`}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Protected</Text>
          <Text style={styles.detailValue}>
            {report.studentsProtected || report.peopleProtected || '—'}
          </Text>
        </View>
      </View>

      <Text style={styles.services} numberOfLines={1}>
        {serviceTypes.map((item) => item.replace(/-/g, ' ')).join(' · ')}
      </Text>

      {report.notes ? (
        <Text style={styles.notes} numberOfLines={2}>{report.notes}</Text>
      ) : null}
      {report.lastError ? (
        <Text style={styles.errorText} numberOfLines={2}>{report.lastError}</Text>
      ) : null}
      {onPress ? <Text style={styles.editHint}>Tap to edit queued report</Text> : null}
    </CardShell>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: pilgrimTheme.colors.surface,
    borderRadius: 18,
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 14,
    borderWidth: 1,
    borderColor: pilgrimTheme.colors.border,
    ...pilgrimTheme.shadow.soft,
  },
  compactCard: {
    marginHorizontal: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  schoolName: {
    fontSize: 16,
    fontWeight: '700',
    color: pilgrimTheme.colors.ink,
    flex: 1,
    marginRight: 8,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: successSurface,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  checkmark: {
    fontSize: 12,
    color: primaryDark,
    fontWeight: '700',
    marginRight: 3,
  },
  verifiedText: {
    fontSize: 11,
    color: primaryDark,
    fontWeight: '600',
  },
  pendingBadge: {
    backgroundColor: '#FFF3E0',
  },
  pendingCheckmark: {
    color: '#B45309',
  },
  pendingText: {
    color: '#B45309',
  },
  district: {
    fontSize: 13,
    color: pilgrimTheme.colors.textMuted,
    marginBottom: 10,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusLabel: {
    fontSize: 12,
    color: pilgrimTheme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    fontWeight: '700',
  },
  statusValue: {
    fontSize: 12,
    color: pilgrimTheme.colors.ink,
    fontWeight: '700',
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: pilgrimTheme.colors.backgroundSoft,
    borderRadius: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 11,
    color: pilgrimTheme.colors.textMuted,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: pilgrimTheme.colors.ink,
  },
  notes: {
    fontSize: 13,
    color: pilgrimTheme.colors.textMuted,
    fontStyle: 'italic',
  },
  services: {
    marginBottom: 8,
    color: pilgrimTheme.colors.primaryDeep,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  editHint: {
    marginTop: 8,
    color: pilgrimTheme.colors.primaryDeep,
    fontSize: 12,
    fontWeight: '800',
  },
  errorText: {
    fontSize: 12,
    color: pilgrimTheme.colors.dangerText,
    marginTop: 8,
  },
});

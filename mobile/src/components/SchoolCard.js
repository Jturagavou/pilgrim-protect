import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { pilgrimOrange, primaryDark } from '../theme/pilgrimColors';
import { pilgrimTheme } from '../theme/pilgrimTheme';
import { formatDistance } from '../lib/geo';

/**
 * Get spray status color based on last spray date:
 * - orange (recent): sprayed within 30 days
 * - amber: 30-90 days ago
 * - red: >90 days or never sprayed
 */
function getSprayStatus(lastSprayDate) {
  if (!lastSprayDate) return { color: '#D32F2F', label: 'Never sprayed' };

  const daysSince = Math.floor(
    (Date.now() - new Date(lastSprayDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSince <= 30) return { color: pilgrimOrange, label: `${daysSince}d ago` };
  if (daysSince <= 90) return { color: '#F57C00', label: `${daysSince}d ago` };
  return { color: '#D32F2F', label: `${daysSince}d ago` };
}

export default function SchoolCard({ school, onPress }) {
  const status = getSprayStatus(school.lastSprayDate);
  const distanceLabel =
    typeof school.distanceKm === 'number' ? formatDistance(school.distanceKm) : null;
  const focusLabel =
    !school.lastSprayDate || status.label === 'Never sprayed'
      ? 'Needs scheduling'
      : school.hasMalariaClub
        ? 'Club active'
        : 'Routine follow-up';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.statusStrip, { backgroundColor: status.color }]} />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>{school.name}</Text>
          <View style={[styles.badge, { backgroundColor: status.color + '20' }]}>
            <View style={[styles.dot, { backgroundColor: status.color }]} />
            <Text style={[styles.badgeText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>

        <View style={styles.locationRow}>
          <Text style={styles.district}>{school.district} District</Text>
          {distanceLabel ? <Text style={styles.distance}>{distanceLabel}</Text> : null}
        </View>
        <Text style={styles.helper}>Tap to open a guided spray report for this school.</Text>

        <View style={styles.focusPill}>
          <Text style={styles.focusText}>{focusLabel}</Text>
        </View>

        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{school.totalRooms}</Text>
            <Text style={styles.statLabel}>Rooms</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{school.studentCount}</Text>
            <Text style={styles.statLabel}>Students</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: pilgrimTheme.colors.surface,
    borderRadius: 18,
    marginHorizontal: 16,
    marginVertical: 6,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: pilgrimTheme.colors.border,
    ...pilgrimTheme.shadow.soft,
  },
  statusStrip: {
    width: 5,
  },
  content: {
    flex: 1,
    padding: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: pilgrimTheme.colors.ink,
    flex: 1,
    marginRight: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  district: {
    fontSize: 13,
    color: pilgrimTheme.colors.textMuted,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 4,
  },
  distance: {
    color: pilgrimTheme.colors.primaryDeep,
    fontSize: 12,
    fontWeight: '800',
  },
  helper: {
    fontSize: 12,
    color: pilgrimTheme.colors.textMuted,
    marginBottom: 10,
    lineHeight: 18,
  },
  focusPill: {
    alignSelf: 'flex-start',
    backgroundColor: pilgrimTheme.colors.backgroundSoft,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 12,
  },
  focusText: {
    fontSize: 11,
    fontWeight: '700',
    color: pilgrimTheme.colors.primaryDeep,
    letterSpacing: 0.3,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stat: {
    alignItems: 'center',
    minWidth: 60,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: primaryDark,
  },
  statLabel: {
    fontSize: 11,
    color: pilgrimTheme.colors.textMuted,
    marginTop: 1,
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: pilgrimTheme.colors.border,
    marginHorizontal: 16,
  },
});

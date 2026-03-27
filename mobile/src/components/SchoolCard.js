import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

/**
 * Get spray status color based on last spray date:
 * - green: sprayed within 30 days
 * - orange: 30-90 days ago
 * - red: >90 days or never sprayed
 */
function getSprayStatus(lastSprayDate) {
  if (!lastSprayDate) return { color: '#D32F2F', label: 'Never sprayed' };

  const daysSince = Math.floor(
    (Date.now() - new Date(lastSprayDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSince <= 30) return { color: '#2E7D32', label: `${daysSince}d ago` };
  if (daysSince <= 90) return { color: '#F57C00', label: `${daysSince}d ago` };
  return { color: '#D32F2F', label: `${daysSince}d ago` };
}

export default function SchoolCard({ school, onPress }) {
  const status = getSprayStatus(school.lastSprayDate);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {/* Status indicator strip */}
      <View style={[styles.statusStrip, { backgroundColor: status.color }]} />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>{school.name}</Text>
          <View style={[styles.badge, { backgroundColor: status.color + '20' }]}>
            <View style={[styles.dot, { backgroundColor: status.color }]} />
            <Text style={[styles.badgeText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>

        <Text style={styles.district}>{school.district} District</Text>

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
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    flexDirection: 'row',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
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
    fontWeight: '600',
    color: '#1B1B1B',
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
    color: '#666',
    marginBottom: 10,
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
    color: '#1B5E20',
  },
  statLabel: {
    fontSize: 11,
    color: '#888',
    marginTop: 1,
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 16,
  },
});

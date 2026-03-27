import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ReportCard({ report }) {
  const dateStr = new Date(report.date).toLocaleDateString('en-UG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.schoolName} numberOfLines={1}>
          {report.school?.name || 'Unknown School'}
        </Text>
        {report.verified && (
          <View style={styles.verifiedBadge}>
            <Text style={styles.checkmark}>✓</Text>
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
        )}
      </View>

      <Text style={styles.district}>{report.school?.district || ''} District</Text>

      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Date</Text>
          <Text style={styles.detailValue}>{dateStr}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Rooms</Text>
          <Text style={styles.detailValue}>{report.roomsSprayed}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Photos</Text>
          <Text style={styles.detailValue}>{report.photos?.length || 0}</Text>
        </View>
      </View>

      {report.notes ? (
        <Text style={styles.notes} numberOfLines={2}>{report.notes}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  schoolName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1B1B1B',
    flex: 1,
    marginRight: 8,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  checkmark: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '700',
    marginRight: 3,
  },
  verifiedText: {
    fontSize: 11,
    color: '#2E7D32',
    fontWeight: '600',
  },
  district: {
    fontSize: 13,
    color: '#666',
    marginBottom: 10,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingVertical: 8,
    marginBottom: 8,
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 11,
    color: '#888',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  notes: {
    fontSize: 13,
    color: '#555',
    fontStyle: 'italic',
  },
});

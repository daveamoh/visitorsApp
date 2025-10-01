import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  useWindowDimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSnackbar } from '../../src/contexts/SnackbarContext';
import { visitorApi } from '../../src/services/api';

interface Visit {
  id: string;
  visitorName: string;
  visitorNumber: string;
  visiteeName: string;
  visiteeNumber: string;
  purpose: string;
  checkInTime: string;
  company: string;
  department: string;
  isCheckingOut?: boolean;
}

export default function Checkout() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const { showSnackbar } = useSnackbar();
  const { width } = useWindowDimensions();

  // responsive rules
  const numColumns = width >= 900 ? 3 : width >= 600 ? 2 : 1;

  // compute card width so cards look even
  const containerHorizontalPadding = 32; // container padding left+right (16 + 16)
  const cardHorizontalMargin = 12; // marginLeft + marginRight for each card (6 + 6)
  const effectiveWidth = Math.max(width - containerHorizontalPadding, 0);
  const cardWidth =
    numColumns > 1
      ? Math.floor((effectiveWidth - numColumns * cardHorizontalMargin) / numColumns)
      : Math.floor(effectiveWidth - 8); // single column with some breathing room

  const fetchVisits = async () => {
    try {
      setLoading(true);
      const response = await visitorApi.getAllVisitNotCheckedOut();
      const responseData = response?.data || [];

      if (!Array.isArray(responseData)) {
        console.error('Expected array but got', responseData);
        showSnackbar('Error: Invalid data format from server', 'error');
        setVisits([]);
        return;
      }

      const activeVisits: Visit[] = responseData
        .filter((v: any) => v.visit_status === 'opened')
        .map((v: any) => ({
          id: v.id.toString(),
          visitorName: v.visitor_name || 'Unknown Visitor',
          visitorNumber: v.visitor_msisdn || 'N/A',
          visiteeName: v.staff_name || 'Staff Member',
          visiteeNumber: v.staff_msisdn || 'N/A',
          purpose: v.visitor_reason || 'Visit',
          checkInTime: v.check_in_time,
          company: v.visitor_company || '',
          department: v.staff_department || '',
        }));

      setVisits(activeVisits);
    } catch (error) {
      console.error('Error fetching visits:', error);
      showSnackbar('Error loading visits. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCheckoutPress = async (visitId: string) => {
    try {
      setVisits(prev => prev.map(v => (v.id === visitId ? { ...v, isCheckingOut: true } : v)));
      await visitorApi.checkOutVisitor(visitId);
      showSnackbar('Visitor checked out successfully', 'success');
      // refresh
      fetchVisits();
    } catch (error) {
      console.error('Checkout error:', error);
      showSnackbar('Failed to check out visitor. Please try again.', 'error');
      // reset button state
      setVisits(prev => prev.map(v => (v.id === visitId ? { ...v, isCheckingOut: false } : v)));
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="small" />
        <Text style={{ marginTop: 8 }}>Loading visits...</Text>
      </View>
    );
  }

  if (visits.length === 0) {
    return (
      <View style={[styles.container, styles.center, { padding: 20 }]}>
        <MaterialIcons name="event-busy" size={48} color="#999" style={{ marginBottom: 16 }} />
        <Text style={{ fontSize: 16, color: 'red', textAlign: 'center' }}>No active visits found</Text>
        <Text style={{ marginTop: 8, color: '#999', textAlign: 'center' }}>
          All visitors have been checked out or no visits are currently open.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Active Visits</Text>

      {/* IMPORTANT: key forces FlatList remount when column count changes */}
      <FlatList
        key={`cols-${numColumns}`}
        data={visits}
        keyExtractor={item => item.id}
        numColumns={numColumns}
        columnWrapperStyle={numColumns > 1 ? styles.row : undefined}
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item: visit }) => (
          <View style={[styles.card, { width: cardWidth }]}>
            <View style={styles.cardHeader}>
              <Text style={styles.visitorName}>{visit.visitorName}</Text>
            </View>

            <View style={styles.detailRow}>
              <MaterialIcons name="phone" size={16} color="red" />
              <Text style={styles.detailText}>{visit.visitorNumber}</Text>
            </View>

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>Visiting:</Text>
            <View style={styles.detailRow}>
              <MaterialIcons name="person" size={16} color="red" />
              <Text style={styles.detailText}>{visit.visiteeName}</Text>
            </View>

            <View style={styles.detailRow}>
              <MaterialIcons name="phone" size={16} color="red" />
              <Text style={styles.detailText}>{visit.visiteeNumber}</Text>
            </View>

            {visit.purpose ? (
              <View style={styles.detailRow}>
                <MaterialIcons name="event-note" size={16} color="red" />
                <Text style={styles.detailText}>{visit.purpose}</Text>
              </View>
            ) : null}

            {visit.company ? (
              <View style={styles.detailRow}>
                <MaterialIcons name="business" size={16} color="red" />
                <Text style={styles.detailText}>{visit.company}</Text>
              </View>
            ) : null}

            <View style={styles.detailRow}>
              <MaterialIcons name="access-time" size={16} color="red" />
              <Text style={styles.detailText}>
                Checked in: {new Date(visit.checkInTime).toLocaleString()}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleCheckoutPress(visit.id)}
              disabled={visit.isCheckingOut}
            >
              {visit.isCheckingOut ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <MaterialIcons name="exit-to-app" size={18} color="#fff" style={styles.buttonIcon} />
                  <Text style={styles.buttonText}>Check Out</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  row: {
    justifyContent: 'flex-start',
    flexWrap: 'nowrap',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 6,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    marginBottom: 8,
  },
  visitorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    color: '#555',
    fontSize: 13,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'blue',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 8,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
  buttonIcon: {
    marginRight: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 8,
  },
  sectionTitle: {
    fontWeight: '600',
    color: '#444',
    marginBottom: 6,
  },
});

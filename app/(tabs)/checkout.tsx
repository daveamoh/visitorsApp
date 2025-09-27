import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { MaterialIcons } from '@expo/vector-icons';

interface Visit {
  id: string;
  visitorName: string;
  visitorNumber: string;
  visiteeName: string;
  visiteeNumber: string;
  purpose: string;
  checkInTime: string;
  checkOutTime: string | null;
}

export default function Checkout() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);

  // Simulate fetching visits data
  useEffect(() => {
    // In a real app, you would fetch this from your backend
    const fetchVisits = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data - replace with actual API call
        const mockVisits: Visit[] = [
          {
            id: '1',
            visitorName: 'John Doe',
            visitorNumber: '+1234567890',
            visiteeName: 'Jane Smith',
            visiteeNumber: '+1987654321',
            purpose: 'Business Meeting',
            checkInTime: '2023-09-27T10:30:00',
            checkOutTime: null
          },
          // Add more mock data as needed
        ];
        
        setVisits(mockVisits);
      } catch (error) {
        console.error('Error fetching visits:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVisits();
  }, []);

  const handleCheckout = async (visitId: string) => {
    try {
      // In a real app, you would call an API to update the checkout time
      setVisits(prevVisits => 
        prevVisits.map(visit => 
          visit.id === visitId 
            ? { ...visit, checkOutTime: new Date().toISOString() } 
            : visit
        )
      );
      
      // Show success message or update UI as needed
      alert('Checkout successful!');
    } catch (error) {
      console.error('Error during checkout:', error);
      alert('Failed to process checkout. Please try again.');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text>Loading visits...</Text>
      </View>
    );
  }

  if (visits.length === 0) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text>No active visits found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Active Visits</Text>
      
      {visits.map((visit) => (
        <View key={visit.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.visitorName}>{visit.visitorName}</Text>
            {!visit.checkOutTime && (
              <TouchableOpacity 
                style={styles.checkoutButton}
                onPress={() => handleCheckout(visit.id)}
              >
                <MaterialIcons name="exit-to-app" size={20} color="#fff" />
                <Text style={styles.checkoutButtonText}>Check Out</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.detailRow}>
            <MaterialIcons name="phone" size={16} color="#666" />
            <Text style={styles.detailText}>{visit.visitorNumber}</Text>
          </View>
          
          <View style={styles.divider} />
          
          <Text style={styles.sectionTitle}>Visiting:</Text>
          <View style={styles.detailRow}>
            <MaterialIcons name="person" size={16} color="#666" />
            <Text style={styles.detailText}>{visit.visiteeName}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <MaterialIcons name="phone" size={16} color="#666" />
            <Text style={styles.detailText}>{visit.visiteeNumber}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <MaterialIcons name="event-note" size={16} color="#666" />
            <Text style={styles.detailText}>{visit.purpose}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <MaterialIcons name="access-time" size={16} color="#666" />
            <Text style={styles.detailText}>
              {new Date(visit.checkInTime).toLocaleTimeString()}
            </Text>
          </View>
          
          {visit.checkOutTime && (
            <View style={[styles.detailRow, { marginTop: 8 }]}>
              <MaterialIcons name="exit-to-app" size={16} color="#4CAF50" />
              <Text style={[styles.detailText, { color: '#4CAF50' }]}>
                Checked out at {new Date(visit.checkOutTime).toLocaleTimeString()}
              </Text>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
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
    marginBottom: 20,
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  visitorName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  checkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  checkoutButtonText: {
    color: '#fff',
    marginLeft: 4,
    fontWeight: '500',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    color: '#555',
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 12,
  },
  sectionTitle: {
    fontWeight: '600',
    color: '#444',
    marginBottom: 8,
  },
});

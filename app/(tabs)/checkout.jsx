import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import axios from 'axios';
import { useSnackbar } from '../../src/contexts/SnackbarContext';

const { width: SW } = Dimensions.get('window');

const formatDateTime = (iso) => {
  if (!iso) return 'Unknown';
  let date;
  if (Array.isArray(iso)) {
    const [y, mo, d, h = 0, mi = 0, s = 0] = iso;
    date = new Date(y, mo - 1, d, h, mi, s);
  } else {
    date = new Date(String(iso).replace(' ', 'T'));
  }
  if (isNaN(date.getTime())) return 'Unknown';
  return date.toLocaleString([], {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
};

// ── Animated blob ──────────────────────────────────────────────────────────
function Blob({ style, color, delay = 0 }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 4000, useNativeDriver: true, delay }),
        Animated.timing(anim, { toValue: 0, duration: 4000, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);
  const tx = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 30] });
  const ty = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -50] });
  const sc = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.1, 0.9] });
  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.blob, style, { backgroundColor: color, transform: [{ translateX: tx }, { translateY: ty }, { scale: sc }] }]}
    />
  );
}

// ── Info row ───────────────────────────────────────────────────────────────
function InfoRow({ label, value, accent }) {
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: accent }]}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

// ── Success screen ─────────────────────────────────────────────────────────
function SuccessScreen({ visitorName, onReset }) {
  const scale = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 60, friction: 7 }).start();
  }, []);
  return (
    <View style={[styles.screen, { justifyContent: 'center', alignItems: 'center' }]}>
      <Blob style={styles.blobTL} color="#741511" delay={0} />
      <Blob style={styles.blobTR} color="#0c1e8b" delay={2000} />
      <Blob style={styles.blobBL} color="#da261c" delay={4000} />
      <Animated.View style={[styles.successCard, { transform: [{ scale }] }]}>
        <View style={styles.successIcon}>
          <Text style={{ fontSize: 30, color: '#fff' }}>👋</Text>
        </View>
        <Text style={styles.successTitle}>Checked Out!</Text>
        <Text style={styles.successBody}>
          <Text style={{ color: '#fff', fontWeight: '600' }}>{visitorName}</Text>
          {' '}has been successfully checked out.{'\n'}Thank you for visiting!
        </Text>
        <TouchableOpacity style={styles.gradBtn} onPress={onReset} activeOpacity={0.85}>
          <Text style={styles.gradBtnText}>Check Out Another Visitor</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────
export default function CheckOut() {
  const [phone, setPhone] = useState('');
  const [visits, setVisits] = useState([]);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState(null);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);
  const { showSnackbar } = useSnackbar();

  const search = async () => {
    if (!phone.trim()) { setError('Please enter a phone number'); return; }
    setLoading(true); setError(null); setVisits([]); setSelectedVisit(null); setCheckoutSuccess(false);
    try {
      const res = await axios.get(`/api/v1/visits/active/phone/${phone.trim()}`);
      const list = res.data?.data ?? [];
      if (list.length === 0) { setError('No active check-in found for this phone number.'); return; }
      setVisits(list);
      if (list.length === 1) setSelectedVisit(list[0]);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 404) {
          setError('No active check-in found for this phone number.');
        } else {
          setError(err.response?.data?.message || 'Failed to search. Please try again.');
        }
      } else {
        setError('An unexpected error occurred.');
      }
    } finally { setLoading(false); }
  };

  const checkout = async () => {
    if (!selectedVisit) return;
    setCheckingOut(true);
    try {
      await axios.put(`/api/v1/visits/check-out/${selectedVisit.id}`);
      setCheckoutSuccess(true);
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Checkout failed. Please try again.', 'error');
    } finally { setCheckingOut(false); }
  };

  const reset = () => {
    setPhone(''); setVisits([]); setSelectedVisit(null);
    setError(null); setCheckoutSuccess(false);
  };

  if (checkoutSuccess && selectedVisit) {
    return <SuccessScreen visitorName={selectedVisit.visitorName} onReset={reset} />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <Blob style={styles.blobTL} color="#741511" delay={0} />
      <Blob style={styles.blobTR} color="#0c1e8b" delay={2000} />
      <Blob style={styles.blobBL} color="#da261c" delay={4000} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={styles.pageTitle}>Check Out</Text>

        {/* Search card */}
        <View style={styles.card}>
          <Text style={styles.cardSub}>Enter the visitor's phone number to find their active check-in</Text>

          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{error}</Text>
            </View>
          )}

          <Text style={styles.label}>Phone Number</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TextInput
              style={[
                styles.input,
                { flex: 1 },
                phoneFocused && { borderColor: '#da261c' },
              ]}
              placeholder="e.g. 0241234567"
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={phone}
              onChangeText={(t) => { setPhone(t); setError(null); }}
              onSubmitEditing={search}
              keyboardType="phone-pad"
              returnKeyType="search"
              editable={!loading}
              onFocus={() => setPhoneFocused(true)}
              onBlur={() => setPhoneFocused(false)}
            />
            <TouchableOpacity
              style={[styles.searchBtn, (!phone.trim() || loading) && { opacity: 0.4 }]}
              onPress={search}
              disabled={!phone.trim() || loading}
              activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.searchBtnText}>Search</Text>}
            </TouchableOpacity>
          </View>
        </View>

        {/* Multiple visits selector */}
        {visits.length > 1 && !selectedVisit && (
          <View style={[styles.card, { padding: 0, overflow: 'hidden' }]}>
            <View style={styles.cardHeaderBar}>
              <Text style={styles.cardHeaderTitle}>Multiple Active Visits Found</Text>
              <Text style={styles.cardHeaderSub}>Select the visit to check out</Text>
            </View>
            <View style={{ padding: 12 }}>
              {visits.map((v) => (
                <TouchableOpacity
                  key={v.id}
                  style={styles.visitItem}
                  onPress={() => setSelectedVisit(v)}
                  activeOpacity={0.7}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.visitName}>{v.visitorName}</Text>
                    <Text style={styles.visitMeta}>Visiting: {v.staff?.displayName ?? 'Unknown'}</Text>
                    <Text style={styles.visitMeta}>Reason: {v.visitPurpose || 'Not specified'}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.visitMeta}>Checked in</Text>
                    <Text style={[styles.visitMeta, { color: '#da261c', fontWeight: '600' }]}>
                      {formatDateTime(v.checkInTime)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Confirm checkout */}
        {selectedVisit && (
          <View style={[styles.card, { padding: 0, overflow: 'hidden' }]}>
            <View style={styles.cardHeaderBar}>
              <Text style={[styles.cardHeaderTitle, { color: '#da261c', fontSize: 20 }]}>Confirm Check Out</Text>
              <Text style={styles.cardHeaderSub}>Verify the information below before proceeding</Text>
            </View>

            <View style={{ padding: 16, gap: 8 }}>
              <InfoRow accent="#da261c" label="Visitor Name"    value={selectedVisit.visitorName} />
              <InfoRow accent="#0c1e8b" label="Visitor Phone"   value={selectedVisit.visitorPhone || 'N/A'} />
              <InfoRow accent="#da261c" label="Company"         value={selectedVisit.visitorCompany || 'Not specified'} />
              <InfoRow accent="#0c1e8b" label="Visit Reason"    value={selectedVisit.visitPurpose  || 'Not specified'} />
              <InfoRow accent="#da261c" label="Staff Name"      value={selectedVisit.staff?.displayName ?? 'Unknown'} />
              <InfoRow accent="#0c1e8b" label="Staff Phone"     value={selectedVisit.staff?.mobilePhone ?? 'N/A'} />
              <InfoRow accent="#da261c" label="Staff Job Title" value={selectedVisit.staff?.jobTitle    ?? 'N/A'} />
              <InfoRow accent="#0c1e8b" label="Check-In Time"   value={formatDateTime(selectedVisit.checkInTime)} />
            </View>

            <View style={{ paddingHorizontal: 16, paddingBottom: 16, gap: 10 }}>
              <TouchableOpacity
                style={[styles.gradBtn, checkingOut && { opacity: 0.4 }]}
                onPress={checkout}
                disabled={checkingOut}
                activeOpacity={0.85}
              >
                {checkingOut
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={styles.gradBtnText}>Check Out</Text>}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => { setSelectedVisit(null); if (visits.length === 1) reset(); }}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#030624' },
  scroll: { flexGrow: 1, paddingHorizontal: 16, paddingTop: 40, paddingBottom: 32, alignItems: 'center', gap: 16 },

  blob: { position: 'absolute', width: SW, height: SW, borderRadius: SW / 2, opacity: 0.18 },
  blobTL: { top: -(SW * 0.5), left: -(SW * 0.5) },
  blobTR: { top: -(SW * 0.5), right: -(SW * 0.5) },
  blobBL: { bottom: -(SW * 0.5), left: SW * 0.1 },

  pageTitle: { fontSize: 32, fontWeight: '700', color: '#da261c', letterSpacing: -0.5, marginBottom: 4 },

  card: {
    width: '100%', maxWidth: 500, borderRadius: 20, padding: 20, zIndex: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(3,6,36,0.88)',
  },
  cardSub: { fontSize: 13, color: 'rgba(255,255,255,0.55)', marginBottom: 16 },
  cardHeaderBar: {
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  cardHeaderTitle: { fontSize: 16, fontWeight: '700', color: '#fff' },
  cardHeaderSub: { fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2 },

  label: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.8)', marginBottom: 8 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.12)', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: '#fff',
  },

  errorBanner: {
    backgroundColor: 'rgba(218,38,28,0.12)', borderWidth: 1,
    borderColor: 'rgba(218,38,28,0.4)', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 12, marginBottom: 16,
  },
  errorBannerText: { color: '#f87171', fontSize: 13 },

  searchBtn: {
    paddingHorizontal: 20, paddingVertical: 14, borderRadius: 12,
    backgroundColor: '#da261c', alignItems: 'center', justifyContent: 'center',
  },
  searchBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },

  visitItem: {
    flexDirection: 'row', alignItems: 'flex-start', padding: 14,
    borderRadius: 12, marginBottom: 8,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  visitName: { color: '#fff', fontWeight: '600', fontSize: 14, marginBottom: 4 },
  visitMeta: { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 2 },

  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10,
  },
  infoLabel: { fontSize: 13, fontWeight: '600' },
  infoValue: { fontSize: 13, color: 'rgba(255,255,255,0.85)', maxWidth: '60%', textAlign: 'right' },

  gradBtn: { paddingVertical: 16, borderRadius: 12, alignItems: 'center', backgroundColor: '#da261c' },
  gradBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  cancelBtn: {
    paddingVertical: 14, borderRadius: 12, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  cancelBtnText: { color: 'rgba(255,255,255,0.6)', fontWeight: '600', fontSize: 15 },

  successCard: {
    width: '100%', maxWidth: 400, backgroundColor: 'rgba(3,6,36,0.88)',
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    padding: 32, alignItems: 'center', zIndex: 10,
  },
  successIcon: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: '#da261c',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  successTitle: { fontSize: 24, fontWeight: '700', color: '#da261c', marginBottom: 12 },
  successBody: { fontSize: 14, color: 'rgba(255,255,255,0.65)', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
});
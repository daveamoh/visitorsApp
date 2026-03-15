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

// ── Labelled input ─────────────────────────────────────────────────────────
function Field({ label, required, accent = '#da261c', ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={{ color: '#da261c' }}> *</Text>}
      </Text>
      <TextInput
        style={[styles.input, focused && { borderColor: accent }]}
        placeholderTextColor="rgba(255,255,255,0.3)"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
      />
    </View>
  );
}

// ── Success screen ─────────────────────────────────────────────────────────
function SuccessScreen({ visitorName, staffName, onReset }) {
  const scale = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 60, friction: 7 }).start();
  }, []);
  return (
    <View style={styles.screen}>
      <Blob style={styles.blobTL} color="#0c1e8b" delay={0} />
      <Blob style={styles.blobTR} color="#da261c" delay={2000} />
      <Blob style={styles.blobBL} color="#741511" delay={4000} />
      <Animated.View style={[styles.successCard, { transform: [{ scale }] }]}>
        <View style={styles.successIcon}>
          <Text style={{ fontSize: 30, color: '#fff' }}>✓</Text>
        </View>
        <Text style={styles.successTitle}>Check-In Successful!</Text>
        <Text style={styles.successBody}>
          <Text style={{ color: '#fff', fontWeight: '600' }}>{visitorName}</Text>
          {' '}has been checked in to see{' '}
          <Text style={{ color: '#fff', fontWeight: '600' }}>{staffName}</Text>.
        </Text>
        <TouchableOpacity style={styles.gradBtn} onPress={onReset} activeOpacity={0.85}>
          <Text style={styles.gradBtnText}>Check In Another Visitor</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────
export default function CheckIn() {
  const [visitorName, setVisitorName] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [visitorCompany, setVisitorCompany] = useState('');
  const [visitReason, setVisitReason] = useState('');
  const [staffQuery, setStaffQuery] = useState('');
  const [staffResults, setStaffResults] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    if (staffQuery.trim().length < 2) { setStaffResults([]); setShowResults(false); return; }
    const t = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await axios.get('/api/v1/staff/search', { params: { name: staffQuery } });
        setStaffResults(res.data?.data ?? []);
        setShowResults(true);
      } catch { setStaffResults([]); setShowResults(false); }
      finally { setIsSearching(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [staffQuery]);

  const selectStaff = (s) => { setSelectedStaff(s); setStaffQuery(s.displayName); setShowResults(false); };

  const reset = () => {
    setVisitorName(''); setVisitorPhone(''); setVisitorCompany(''); setVisitReason('');
    setStaffQuery(''); setSelectedStaff(null); setStaffResults([]); setSubmitSuccess(false);
  };

  const submit = async () => {
    if (!visitorName.trim()) { showSnackbar('Please enter visitor name', 'error'); return; }
    if (!selectedStaff) { showSnackbar('Please select a staff member', 'error'); return; }
    setIsSubmitting(true);
    try {
      await axios.post('/api/v1/visits/check-in', {
        visitorName, visitorPhone, visitorCompany,
        visitPurpose: visitReason, staffAzureId: selectedStaff.azureId,
      });
      setSubmitSuccess(true);
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Check-in failed. Please try again.', 'error');
    } finally { setIsSubmitting(false); }
  };

  if (submitSuccess) {
    return <SuccessScreen visitorName={visitorName} staffName={selectedStaff?.displayName} onReset={reset} />;
  }

  const canSubmit = !!selectedStaff && visitorName.trim().length > 0 && !isSubmitting;

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <Blob style={styles.blobTL} color="#0c1e8b" delay={0} />
      <Blob style={styles.blobTR} color="#da261c" delay={2000} />
      <Blob style={styles.blobBL} color="#741511" delay={4000} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>

          {/* Header */}
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Check In</Text>
            <Text style={styles.cardSub}>Fill in the visitor information below</Text>
          </View>

          <View style={styles.cardBody}>
            <Field label="Visitor Name" required accent="#da261c" placeholder="John Doe" value={visitorName} onChangeText={setVisitorName} />
            <Field label="Visitor Phone" accent="#0c1e8b" placeholder="+233 24 123 4567" keyboardType="phone-pad" value={visitorPhone} onChangeText={setVisitorPhone} />
            <Field label="Visitor's Company" accent="#da261c" placeholder="ABC Ltd." value={visitorCompany} onChangeText={setVisitorCompany} />
            <Field label="Visit Reason" accent="#0c1e8b" placeholder="Business Meeting" value={visitReason} onChangeText={setVisitReason} />

            {/* Staff search */}
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>
                Staff Member<Text style={{ color: '#da261c' }}> *</Text>
                <Text style={{ color: 'rgba(255,255,255,0.4)', fontWeight: '400' }}> (type to search)</Text>
              </Text>
              <View>
                <TextInput
                  style={[
                    styles.input,
                    { paddingRight: 100 },
                    selectedStaff ? { borderColor: '#22c55e' } : showResults ? { borderColor: '#da261c' } : null,
                  ]}
                  placeholder="Start typing staff name..."
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  value={staffQuery}
                  onChangeText={(t) => {
                    setStaffQuery(t);
                    if (selectedStaff && t !== selectedStaff.displayName) setSelectedStaff(null);
                  }}
                />
                {selectedStaff && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>✓ Selected</Text>
                  </View>
                )}
                {isSearching && !selectedStaff && (
                  <View style={styles.badge}>
                    <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>Searching…</Text>
                  </View>
                )}
              </View>

              {showResults && (
                <View style={styles.dropdown}>
                  {staffResults.length > 0 ? staffResults.map((s, i) => (
                    <TouchableOpacity
                      key={s.azureId}
                      style={[styles.dropItem, i < staffResults.length - 1 && styles.dropDivider]}
                      onPress={() => selectStaff(s)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{s.displayName.charAt(0).toUpperCase()}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.staffName}>{s.displayName}</Text>
                        <Text style={styles.staffMeta}>{s.jobTitle || 'No job title'}{s.mail ? ` · ${s.mail}` : ''}</Text>
                      </View>
                    </TouchableOpacity>
                  )) : (
                    <View style={{ padding: 16, alignItems: 'center' }}>
                      <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>No staff found</Text>
                    </View>
                  )}
                </View>
              )}
            </View>

            {/* Submit */}
            <TouchableOpacity
              style={[styles.gradBtn, { marginTop: 8 }, !canSubmit && { opacity: 0.4 }]}
              onPress={submit}
              disabled={!canSubmit}
              activeOpacity={0.85}
            >
              {isSubmitting
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.gradBtnText}>Check In</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#030624' },
  scroll: { flexGrow: 1, paddingHorizontal: 16, paddingVertical: 32, alignItems: 'center' },

  blob: { position: 'absolute', width: SW, height: SW, borderRadius: SW / 2, opacity: 0.18 },
  blobTL: { top: -(SW * 0.5), left: -(SW * 0.5) },
  blobTR: { top: -(SW * 0.5), right: -(SW * 0.5) },
  blobBL: { bottom: -(SW * 0.5), left: SW * 0.1 },

  card: {
    width: '100%', maxWidth: 600, borderRadius: 20, zIndex: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(3,6,36,0.88)', overflow: 'visible',
  },
  cardHeader: {
    paddingHorizontal: 24, paddingTop: 28, paddingBottom: 20,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)', alignItems: 'center',
  },
  cardTitle: { fontSize: 32, fontWeight: '700', color: '#da261c', letterSpacing: -0.5 },
  cardSub: { fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 4 },
  cardBody: { padding: 24 },

  fieldWrap: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.8)', marginBottom: 8 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.12)', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: '#fff',
  },

  badge: { position: 'absolute', right: 12, top: 0, bottom: 0, justifyContent: 'center' },
  badgeText: {
    fontSize: 11, fontWeight: '600', color: '#22c55e',
    backgroundColor: 'rgba(34,197,94,0.15)', paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 20, overflow: 'hidden',
  },

  dropdown: {
    backgroundColor: '#030624', borderRadius: 12, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)', marginTop: 4, overflow: 'hidden', zIndex: 100,
  },
  dropItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  dropDivider: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },

  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#da261c', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  staffName: { color: '#fff', fontWeight: '600', fontSize: 14 },
  staffMeta: { color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 2 },

  gradBtn: {
    paddingVertical: 16, borderRadius: 12, alignItems: 'center',
    backgroundColor: '#da261c',
  },
  gradBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

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
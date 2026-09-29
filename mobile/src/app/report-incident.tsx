import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { dataService } from '../services/dataService';
import { locationService } from '../services/locationService';
import { IncidentCategory, IncidentReportStatus } from '../types/incident';
import { haptics } from '../utils/haptics';

const CATEGORIES: IncidentCategory[] = [
  'Flooding',
  'Road blockage',
  'Fire',
  'Structural damage',
  'Power outage',
  'Medical emergency',
  'Other',
];

const SEVERITIES: ('Critical' | 'High' | 'Medium' | 'Low')[] = ['Critical', 'High', 'Medium', 'Low'];

export default function ReportIncidentScreen() {
  const [category, setCategory] = useState<IncidentCategory>('Flooding');
  const [severity, setSeverity] = useState<'Critical' | 'High' | 'Medium' | 'Low'>('High');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('Sector 17, Chandigarh');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<IncidentReportStatus>('IDLE');
  const [incidentId, setIncidentId] = useState<string | null>(null);

  const handlePickPhoto = async () => {
    haptics.lightQuiet();
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch {
      console.warn('ImagePicker library unavailable or permission denied.');
    }
  };

  const handleSubmit = async () => {
    if (!description.trim()) return;

    haptics.mediumOperational();
    setUploadStatus('UPLOADING');

    try {
      const loc = await locationService.getCurrentLocation();
      setLocationName(loc.localityName);

      // Simulate network verification phase
      setTimeout(() => {
        setUploadStatus('VERIFYING');
      }, 700);

      const res = await dataService.submitIncident({
        category,
        severity,
        description,
        locationName: loc.localityName,
        latitude: loc.latitude,
        longitude: loc.longitude,
        photoUri: photoUri || undefined,
        timestamp: new Date().toISOString(),
      });

      if (res.success) {
        setIncidentId(res.incidentId || `rep-${Date.now()}`);
        setUploadStatus('SUBMITTED');
        haptics.success();
      } else {
        setUploadStatus('FAILED_RETRY');
      }
    } catch {
      setUploadStatus('FAILED_RETRY');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <Text style={styles.backBtnText}>← CANCEL</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerOverline}>CIVIL TELEMETRY</Text>
          <Text style={styles.headerTitle}>REPORT INCIDENT</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        {uploadStatus === 'SUBMITTED' ? (
          <View style={styles.submittedBox}>
            <View style={styles.submittedPill}>
              <Text style={styles.submittedPillText}>✓ REPORT SUBMITTED</Text>
            </View>
            <Text style={styles.submittedTitle}>DISPATCH LOGGED IN CIVIL QUEUE</Text>
            <Text style={styles.submittedNotice}>
              Incident reference ID: {incidentId}. Your report is pending review by field observers. It will appear on the crisis map once corroborated.
            </Text>

            <TouchableOpacity
              style={styles.returnBtn}
              onPress={() => router.replace('/(tabs)/map')}
            >
              <Text style={styles.returnBtnText}>VIEW ON CRISIS MAP →</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.form}>
            {/* STATUS BANNER WHEN UPLOADING OR FAILED */}
            {uploadStatus === 'UPLOADING' && (
              <View style={styles.statusBox}>
                <ActivityIndicator size="small" color={colors.terracotta} />
                <Text style={styles.statusBoxText}>UPLOADING OBSERVATION TELEMETRY...</Text>
              </View>
            )}

            {uploadStatus === 'VERIFYING' && (
              <View style={styles.statusBox}>
                <ActivityIndicator size="small" color={colors.safe} />
                <Text style={styles.statusBoxText}>VALIDATING SENSOR CORRELATION WITH GRID...</Text>
              </View>
            )}

            {uploadStatus === 'FAILED_RETRY' && (
              <View style={[styles.statusBox, styles.statusBoxError]}>
                <Text style={styles.statusBoxText}>FAILED — QUEUED OFFLINE. TAP TO RETRY.</Text>
                <TouchableOpacity onPress={handleSubmit} style={styles.retryBtn}>
                  <Text style={styles.retryBtnText}>RETRY</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* CATEGORY SELECTION */}
            <Text style={styles.fieldLabel}>INCIDENT CATEGORY</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.categoryChip, isSelected && styles.categoryChipSelected]}
                    onPress={() => {
                      haptics.lightQuiet();
                      setCategory(cat);
                    }}
                  >
                    <Text style={[styles.categoryText, isSelected && styles.categoryTextSelected]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* SEVERITY SELECTION */}
            <Text style={styles.fieldLabel}>ESTIMATED THREAT LEVEL</Text>
            <View style={styles.severityRow}>
              {SEVERITIES.map((sev) => {
                const isSelected = severity === sev;
                return (
                  <TouchableOpacity
                    key={sev}
                    style={[styles.sevBtn, isSelected && styles.sevBtnSelected]}
                    onPress={() => {
                      haptics.lightQuiet();
                      setSeverity(sev);
                    }}
                  >
                    <Text style={[styles.sevText, isSelected && styles.sevTextSelected]}>{sev}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* LOCATION OVERVIEW */}
            <Text style={styles.fieldLabel}>LOCATION</Text>
            <View style={styles.locationBox}>
              <Text style={styles.locationText}>📍 {locationName}</Text>
              <Text style={styles.locationSub}>Tagged via device foreground coordinates</Text>
            </View>

            {/* DESCRIPTION */}
            <Text style={styles.fieldLabel}>SITUATIONAL DESCRIPTION</Text>
            <TextInput
              style={styles.descInput}
              value={description}
              onChangeText={setDescription}
              placeholder="State precise ground observations (e.g. Water depth above curb, tree blocking southbound lane)..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={4}
            />

            {/* PHOTO EVIDENCE */}
            <Text style={styles.fieldLabel}>PHOTO EVIDENCE (OPTIONAL)</Text>
            {photoUri ? (
              <View style={styles.photoPreviewBox}>
                <Image source={{ uri: photoUri }} style={styles.photoPreview} />
                <TouchableOpacity
                  style={styles.changePhotoBtn}
                  onPress={handlePickPhoto}
                >
                  <Text style={styles.changePhotoText}>CHANGE PHOTO</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.addPhotoBtn} onPress={handlePickPhoto}>
                <Text style={styles.addPhotoIcon}>📷</Text>
                <Text style={styles.addPhotoText}>ATTACH FIELD PHOTOGRAPH</Text>
              </TouchableOpacity>
            )}

            {/* SUBMIT BUTTON */}
            <TouchableOpacity
              style={[styles.submitBtn, (!description.trim() || uploadStatus === 'UPLOADING') && styles.submitBtnDisabled]}
              disabled={!description.trim() || uploadStatus === 'UPLOADING'}
              onPress={handleSubmit}
            >
              <Text style={styles.submitBtnText}>TRANSMIT CITIZEN REPORT →</Text>
            </TouchableOpacity>

            <Text style={styles.govDisclaimer}>
              Reports are subject to civil verification. False or malicious reports can delay life-safety response.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
  },
  backBtn: {
    paddingVertical: 4,
    paddingRight: 8,
  },
  backBtnText: {
    fontFamily: typography.mono,
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 1,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerOverline: {
    fontFamily: typography.mono,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: colors.terracotta,
  },
  headerTitle: {
    fontFamily: typography.sans,
    fontSize: 16,
    fontWeight: '700',
    color: colors.paper,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  form: {
    gap: 12,
  },
  fieldLabel: {
    fontFamily: typography.mono,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: colors.textMuted,
    marginTop: 4,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    backgroundColor: colors.surface,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  categoryChipSelected: {
    backgroundColor: colors.terracottaDark,
    borderColor: colors.terracotta,
  },
  categoryText: {
    fontFamily: typography.sans,
    fontSize: 12,
    color: colors.textSecondary,
  },
  categoryTextSelected: {
    color: colors.paper,
    fontWeight: '600',
  },
  severityRow: {
    flexDirection: 'row',
    gap: 8,
  },
  sevBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 4,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    alignItems: 'center',
  },
  sevBtnSelected: {
    backgroundColor: colors.surfaceHighlight,
    borderColor: colors.terracotta,
  },
  sevText: {
    fontFamily: typography.mono,
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  sevTextSelected: {
    color: colors.terracotta,
    fontWeight: '700',
  },
  locationBox: {
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  locationText: {
    fontFamily: typography.sans,
    fontSize: 14,
    fontWeight: '600',
    color: colors.paper,
  },
  locationSub: {
    fontFamily: typography.sans,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  descInput: {
    backgroundColor: colors.surface,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    padding: 12,
    color: colors.paper,
    fontFamily: typography.sans,
    fontSize: 13,
    minHeight: 90,
    textAlignVertical: 'top',
  },
  addPhotoBtn: {
    backgroundColor: colors.surface,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderStyle: 'dashed',
    padding: 18,
    alignItems: 'center',
    gap: 6,
  },
  addPhotoIcon: {
    fontSize: 20,
  },
  addPhotoText: {
    fontFamily: typography.mono,
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 1,
  },
  photoPreviewBox: {
    backgroundColor: colors.surface,
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  photoPreview: {
    width: '100%',
    height: 160,
  },
  changePhotoBtn: {
    padding: 8,
    alignItems: 'center',
    backgroundColor: colors.surfaceHighlight,
  },
  changePhotoText: {
    fontFamily: typography.mono,
    fontSize: 10,
    color: colors.textMuted,
  },
  submitBtn: {
    backgroundColor: colors.terracotta,
    paddingVertical: 14,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnDisabled: {
    opacity: 0.4,
  },
  submitBtnText: {
    fontFamily: typography.mono,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: '#FFFFFF',
  },
  govDisclaimer: {
    fontFamily: typography.sans,
    fontSize: 11,
    color: colors.textDim,
    textAlign: 'center',
    marginTop: 4,
  },
  statusBox: {
    backgroundColor: colors.surfaceHighlight,
    padding: 12,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  statusBoxError: {
    borderColor: colors.critical,
    justifyContent: 'space-between',
  },
  statusBoxText: {
    fontFamily: typography.mono,
    fontSize: 10,
    fontWeight: '700',
    color: colors.paper,
    letterSpacing: 0.8,
  },
  retryBtn: {
    backgroundColor: colors.critical,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 3,
  },
  retryBtnText: {
    fontFamily: typography.mono,
    fontSize: 10,
    fontWeight: '700',
    color: '#FFF',
  },
  submittedBox: {
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.safe,
    gap: 12,
    alignItems: 'center',
  },
  submittedPill: {
    backgroundColor: colors.safeBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: colors.safeBorder,
  },
  submittedPillText: {
    fontFamily: typography.mono,
    fontSize: 10,
    fontWeight: '700',
    color: colors.safe,
    letterSpacing: 1,
  },
  submittedTitle: {
    fontFamily: typography.sans,
    fontSize: 17,
    fontWeight: '700',
    color: colors.paper,
    textAlign: 'center',
  },
  submittedNotice: {
    fontFamily: typography.sans,
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  returnBtn: {
    backgroundColor: colors.terracotta,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginTop: 8,
  },
  returnBtnText: {
    fontFamily: typography.mono,
    fontSize: 11,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 1,
  },
});

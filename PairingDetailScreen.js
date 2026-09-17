import { useState } from 'react';
import { Alert, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BREEDING_HERO_IMAGE } from './constants';

const ORANGE = '#ff7900';
const SAMPLE_COLLECTIONS = [
  { id: 'today', date: 'Today', count: 5 },
  { id: 'sep-15', date: 'Sep 15', count: 6 },
  { id: 'sep-14', date: 'Sep 14', count: 4 },
  { id: 'sep-13', date: 'Sep 13', count: 3 },
];

function todayValue() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function displayDate(value) {
  if (!value || value === 'Today' || /^[A-Za-z]{3}\s\d{1,2}$/.test(value)) return value;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}

function Metric({ icon, value, label, isLast }) {
  return (
    <View style={[styles.metric, !isLast && styles.metricDivider]}>
      <MaterialCommunityIcons name={icon} size={22} color={ORANGE} />
      <View><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></View>
    </View>
  );
}

function InfoItem({ icon, label, value }) {
  return (
    <View style={styles.infoItem}>
      <MaterialCommunityIcons name={icon} size={17} color={ORANGE} />
      <View style={styles.infoCopy}><Text style={styles.infoLabel}>{label}</Text><Text numberOfLines={2} style={styles.infoValue}>{value}</Text></View>
    </View>
  );
}

export default function PairingDetailScreen({ pairing, collections = [], onCollectionsChange, onBack }) {
  const { width } = useWindowDimensions();
  const compact = width < 520;
  const [collectionVisible, setCollectionVisible] = useState(false);
  const [collectionCount, setCollectionCount] = useState(1);
  const [collectionDate, setCollectionDate] = useState(todayValue());
  const [collectionNotes, setCollectionNotes] = useState('');

  if (!pairing) {
    return <View style={styles.missing}><Text style={styles.missingText}>Breeding group unavailable</Text><Pressable onPress={onBack} style={styles.missingButton}><Text style={styles.primaryText}>Back to Breeding</Text></Pressable></View>;
  }

  const groupName = pairing.groupName || [pairing.male, pairing.female].filter(Boolean).join(' x ');
  const sireBloodline = pairing.sireBloodline || pairing.bloodline?.match(/^(.+?)(?:\s+Cock|\s+sire|\s*-)/i)?.[1] || 'Sweater';
  const damBloodline = pairing.damBloodline || pairing.bloodline?.match(/[-·]\s*(.*?)(?:\s+Hen|\s+dam|$)/i)?.[1] || 'Kelso';
  const composition = pairing.composition || '1 cock - 8 hens';
  const cocks = composition.match(/(\d+)\s+cock/i)?.[1] || '1';
  const hens = composition.match(/(\d+)\s+hen/i)?.[1] || '8';
  const location = pairing.location || 'House A';
  const groupLabel = pairing.groupLabel || 'Main Breeders';
  const notes = pairing.notes || 'Healthy active breeders. Good egg production.';
  const recentCollections = collections.length ? collections : SAMPLE_COLLECTIONS;
  const recordedEggs = collections.reduce((sum, item) => sum + item.count, 0);
  const holdingEggs = recordedEggs || Number.parseInt(pairing.eggs, 10) || 18;
  const collectedToday = collections.length ? collections.filter((item) => item.date === todayValue()).reduce((sum, item) => sum + item.count, 0) : 5;
  const oldestEgg = pairing.oldestEgg && pairing.oldestEgg !== '--' ? pairing.oldestEgg : '4 days';

  const openCollection = () => {
    setCollectionCount(1);
    setCollectionDate(todayValue());
    setCollectionNotes('');
    setCollectionVisible(true);
  };

  const saveCollection = () => {
    const parsed = new Date(`${collectionDate}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) {
      Alert.alert('Check collection date', 'Enter the date as YYYY-MM-DD.');
      return;
    }
    onCollectionsChange?.([{ id: `collection-${Date.now()}`, count: collectionCount, date: collectionDate, notes: collectionNotes.trim() }, ...collections]);
    setCollectionVisible(false);
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.pageWrap}>
        <View style={styles.page}>
          <View style={[styles.hero, compact && styles.heroCompact]}>
            <Image source={BREEDING_HERO_IMAGE} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="center" cachePolicy="memory-disk" />
            <LinearGradient colors={['rgba(2,7,9,0.18)', 'rgba(2,7,9,0.22)', '#03090c']} locations={[0, 0.48, 1]} style={StyleSheet.absoluteFill} />
            <SafeAreaView edges={['top']} style={styles.heroSafeArea}>
              <View style={styles.heroHeader}>
                <Pressable accessibilityLabel="Back to breeding" onPress={onBack} style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}><Ionicons name="arrow-back" size={21} color="#eef1f2" /></Pressable>
                <Text style={styles.screenTitle}>Breeding Group</Text>
              </View>
              <View style={styles.heroCopy}>
                <Text style={[styles.farmName, compact && styles.farmNameCompact]}>FarmBuzz Farm</Text>
                <Text style={styles.farmTagline}>Raising quality gamefowl with strong bloodlines.</Text>
                <View style={styles.farmMeta}><Ionicons name="location-outline" size={14} color="#dce2e4" /><Text style={styles.farmMetaText}>Pampanga, Philippines</Text><View style={styles.metaDivider} /><MaterialCommunityIcons name="calendar-month-outline" size={14} color="#dce2e4" /><Text style={styles.farmMetaText}>Est. 2020</Text></View>
              </View>
            </SafeAreaView>
          </View>

          <View style={[styles.content, compact && styles.contentCompact]}>
            <View style={styles.groupHeader}>
              <View style={styles.groupIcon}><MaterialCommunityIcons name="link-variant" size={24} color={ORANGE} /></View>
              <View style={styles.groupCopy}><Text style={styles.groupTitle}>{groupName}</Text><Text style={styles.groupLabel}>{groupLabel}</Text><Text style={styles.groupMeta}>{cocks} {cocks === '1' ? 'cock' : 'cocks'} · {hens} hens  |  {location}</Text></View>
              <View style={styles.statusPill}><View style={styles.statusDot} /><Text style={styles.statusText}>{pairing.status || 'Active'}</Text></View>
            </View>

            <View style={styles.metricsPanel}>
              <Metric icon="egg-outline" value={String(holdingEggs)} label="Holding Eggs" />
              <Metric icon="basket-outline" value={String(collectedToday)} label="Collected Today" />
              <Metric icon="clock-outline" value={oldestEgg} label="Oldest Egg" isLast />
            </View>

            <View style={styles.actions}>
              <Pressable onPress={openCollection} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}><Ionicons name="add" size={20} color="#fff" /><Text style={styles.primaryText}>Record Egg Collection</Text></Pressable>
              <Pressable onPress={() => Alert.alert('Edit group', `Edit ${groupName}.`)} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}><MaterialCommunityIcons name="pencil-outline" size={18} color="#dce2e4" /><Text style={styles.secondaryText}>Edit Group</Text></Pressable>
            </View>

            <View style={styles.sectionHeading}><MaterialCommunityIcons name="clipboard-text-outline" size={18} color={ORANGE} /><Text style={styles.sectionTitle}>Group Information</Text></View>
            <View style={styles.infoPanel}>
              <View style={styles.infoColumn}><InfoItem icon="gender-male" label="Sire Bloodline" value={sireBloodline} /><InfoItem icon="gender-female" label="Dam Bloodline" value={damBloodline} /><InfoItem icon="tag-outline" label="Group Name" value={groupLabel} /><InfoItem icon="bird" label="Cocks" value={cocks} /></View>
              <View style={styles.infoColumn}><InfoItem icon="bird" label="Hens" value={hens} /><InfoItem icon="map-marker-outline" label="Location / House / Section" value={location} /><InfoItem icon="calendar-month-outline" label="Start Date" value={pairing.started || 'Aug 19, 2024'} /><InfoItem icon="note-text-outline" label="Notes" value={notes} /></View>
            </View>

            <View style={styles.sectionHeading}><MaterialCommunityIcons name="calendar-clock-outline" size={18} color={ORANGE} /><Text style={styles.sectionTitle}>Recent Egg Collection</Text><Text style={styles.sectionMeta}>{recentCollections.length} records</Text></View>
            <View style={styles.collectionPanel}>
              {recentCollections.slice(0, 5).map((item, index) => (
                <View key={item.id} style={[styles.collectionRow, index > 0 && styles.collectionDivider]}><MaterialCommunityIcons name="calendar-blank-outline" size={17} color="#829095" /><Text style={styles.collectionDate}>{displayDate(item.date)}</Text><MaterialCommunityIcons name="egg-outline" size={18} color={ORANGE} /><Text style={styles.collectionCount}>{item.count} eggs</Text><Ionicons name="chevron-forward" size={15} color="#607077" /></View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      <Modal transparent visible={collectionVisible} animationType="fade" statusBarTranslucent onRequestClose={() => setCollectionVisible(false)}>
        <View style={styles.modalOverlay}>
          <Pressable accessibilityLabel="Close collection form" onPress={() => setCollectionVisible(false)} style={StyleSheet.absoluteFill} />
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}><View><Text style={styles.sheetTitle}>Record Egg Collection</Text><Text style={styles.sheetSubtitle}>{groupName}</Text></View><Pressable onPress={() => setCollectionVisible(false)} style={styles.closeButton}><Ionicons name="close" size={20} color="#dce2e4" /></Pressable></View>
            <Text style={styles.fieldLabel}>Eggs collected</Text>
            <View style={styles.countControl}><Pressable onPress={() => setCollectionCount((value) => Math.max(1, value - 1))} style={styles.countButton}><Ionicons name="remove" size={20} color={ORANGE} /></Pressable><Text style={styles.countValue}>{collectionCount}</Text><Pressable onPress={() => setCollectionCount((value) => Math.min(99, value + 1))} style={styles.countButton}><Ionicons name="add" size={20} color={ORANGE} /></Pressable></View>
            <Text style={styles.fieldLabel}>Collection date</Text><View style={styles.inputShell}><MaterialCommunityIcons name="calendar-month-outline" size={19} color={ORANGE} /><TextInput value={collectionDate} onChangeText={setCollectionDate} placeholder="YYYY-MM-DD" placeholderTextColor="#68777c" style={styles.input} /></View>
            <Text style={styles.fieldLabel}>Notes (Optional)</Text><TextInput value={collectionNotes} onChangeText={setCollectionNotes} multiline placeholder="Condition, shell quality, or observations" placeholderTextColor="#68777c" style={styles.notesInput} />
            <View style={styles.sheetActions}><Pressable onPress={() => setCollectionVisible(false)} style={styles.cancelButton}><Text style={styles.cancelText}>Cancel</Text></Pressable><Pressable onPress={saveCollection} style={styles.saveButton}><Text style={styles.saveText}>Save Collection</Text></Pressable></View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#020709' }, pageWrap: { flexGrow: 1, alignItems: 'center', backgroundColor: '#020709' }, page: { width: '100%', maxWidth: 720 },
  hero: { height: 272, overflow: 'hidden', backgroundColor: '#101719' }, heroCompact: { height: 248 }, heroSafeArea: { flex: 1 }, heroHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingTop: Platform.OS === 'web' ? 10 : 3 },
  headerButton: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(190,204,208,0.35)', backgroundColor: 'rgba(2,8,11,0.65)', alignItems: 'center', justifyContent: 'center' }, screenTitle: { color: '#f3f5f6', fontSize: 15, fontWeight: '800' },
  heroCopy: { marginTop: 'auto', paddingHorizontal: 20, paddingBottom: 22 }, farmName: { color: '#fff', fontSize: 34, lineHeight: 40, fontWeight: '800', fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', web: 'Georgia' }) }, farmNameCompact: { fontSize: 29, lineHeight: 34 }, farmTagline: { marginTop: 3, color: '#c2cbce', fontSize: 13 }, farmMeta: { marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 6 }, farmMetaText: { color: '#d3dade', fontSize: 10 }, metaDivider: { width: 1, height: 12, marginHorizontal: 5, backgroundColor: 'rgba(210,220,224,0.35)' },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 30 }, contentCompact: { paddingHorizontal: 10 }, groupHeader: { minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: 11 }, groupIcon: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, borderColor: '#7b440f', backgroundColor: 'rgba(255,121,0,0.08)', alignItems: 'center', justifyContent: 'center' }, groupCopy: { flex: 1, minWidth: 0 }, groupTitle: { color: '#f2f5f6', fontSize: 19, lineHeight: 24, fontWeight: '800' }, groupLabel: { marginTop: 1, color: '#a8b2b5', fontSize: 10 }, groupMeta: { marginTop: 5, color: '#758389', fontSize: 9 },
  statusPill: { height: 24, paddingHorizontal: 9, borderRadius: 12, backgroundColor: 'rgba(35,110,63,0.25)', flexDirection: 'row', alignItems: 'center', gap: 5 }, statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#5eea78' }, statusText: { color: '#7de596', fontSize: 9, fontWeight: '700' },
  metricsPanel: { height: 82, marginTop: 6, borderRadius: 7, borderWidth: 1, borderColor: '#1c2b31', backgroundColor: '#091317', flexDirection: 'row', alignItems: 'center' }, metric: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 6 }, metricDivider: { borderRightWidth: 1, borderRightColor: '#213037' }, metricValue: { color: '#f0f3f4', fontSize: 17, fontWeight: '800' }, metricLabel: { marginTop: 2, color: '#7d8a8f', fontSize: 8 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 9, marginBottom: 18 }, primaryButton: { flex: 1.25, height: 46, borderRadius: 6, backgroundColor: ORANGE, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 }, primaryText: { color: '#fff', fontSize: 11, fontWeight: '800' }, secondaryButton: { flex: 1, height: 46, borderRadius: 6, borderWidth: 1, borderColor: '#293a41', backgroundColor: '#081216', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 }, secondaryText: { color: '#dce2e4', fontSize: 11, fontWeight: '700' },
  sectionHeading: { minHeight: 35, flexDirection: 'row', alignItems: 'center', gap: 7 }, sectionTitle: { color: '#e9edef', fontSize: 12, fontWeight: '800' }, sectionMeta: { marginLeft: 'auto', color: '#76858a', fontSize: 8 },
  infoPanel: { borderRadius: 7, borderWidth: 1, borderColor: '#1c2b31', backgroundColor: '#091317', padding: 8, flexDirection: 'row', gap: 8, marginBottom: 13 }, infoColumn: { flex: 1, minWidth: 0 }, infoItem: { minHeight: 47, paddingHorizontal: 7, flexDirection: 'row', alignItems: 'center', gap: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#1b2a30' }, infoCopy: { flex: 1, minWidth: 0 }, infoLabel: { color: '#6f7e84', fontSize: 7 }, infoValue: { marginTop: 2, color: '#d9dfe1', fontSize: 9, lineHeight: 12 },
  collectionPanel: { borderRadius: 7, borderWidth: 1, borderColor: '#1c2b31', backgroundColor: '#091317', paddingHorizontal: 10, overflow: 'hidden' }, collectionRow: { height: 44, flexDirection: 'row', alignItems: 'center', gap: 9 }, collectionDivider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#1e2e34' }, collectionDate: { flex: 1, color: '#aeb8bb', fontSize: 9 }, collectionCount: { minWidth: 46, color: '#dfe4e5', fontSize: 9 },
  modalOverlay: { flex: 1, padding: 10, backgroundColor: 'rgba(0,0,0,0.72)', alignItems: 'center', justifyContent: 'flex-end' }, sheet: { width: '100%', maxWidth: 700, borderRadius: 8, borderWidth: 1, borderColor: '#2b3b41', backgroundColor: '#081216', padding: 14 }, sheetHeader: { minHeight: 55, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#203037' }, sheetTitle: { color: '#f1f4f5', fontSize: 16, fontWeight: '800' }, sheetSubtitle: { marginTop: 3, color: '#7d8b90', fontSize: 9 }, closeButton: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#111d21', alignItems: 'center', justifyContent: 'center' }, fieldLabel: { marginTop: 12, marginBottom: 6, color: '#9da9ac', fontSize: 9, fontWeight: '700' }, countControl: { height: 54, borderRadius: 7, borderWidth: 1, borderColor: '#2b3b41', backgroundColor: '#0a161a', paddingHorizontal: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, countButton: { width: 36, height: 36, borderRadius: 6, borderWidth: 1, borderColor: '#664112', alignItems: 'center', justifyContent: 'center' }, countValue: { color: '#fff', fontSize: 19, fontWeight: '800' }, inputShell: { height: 46, borderRadius: 7, borderWidth: 1, borderColor: '#2b3b41', backgroundColor: '#0a161a', paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center', gap: 8 }, input: { flex: 1, height: 44, color: '#e4e9ea', fontSize: 11, outlineStyle: 'none' }, notesInput: { height: 72, borderRadius: 7, borderWidth: 1, borderColor: '#2b3b41', backgroundColor: '#0a161a', padding: 10, color: '#e4e9ea', fontSize: 11, textAlignVertical: 'top', outlineStyle: 'none' }, sheetActions: { marginTop: 14, flexDirection: 'row', gap: 8 }, cancelButton: { flex: 1, height: 45, borderRadius: 6, borderWidth: 1, borderColor: '#304047', alignItems: 'center', justifyContent: 'center' }, cancelText: { color: '#adb7ba', fontSize: 11, fontWeight: '700' }, saveButton: { flex: 1.2, height: 45, borderRadius: 6, backgroundColor: ORANGE, alignItems: 'center', justifyContent: 'center' }, saveText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  missing: { flex: 1, padding: 24, backgroundColor: '#020709', alignItems: 'center', justifyContent: 'center', gap: 14 }, missingText: { color: '#dce2e4', fontSize: 16, fontWeight: '700' }, missingButton: { height: 44, paddingHorizontal: 18, borderRadius: 6, backgroundColor: ORANGE, alignItems: 'center', justifyContent: 'center' }, pressed: { opacity: 0.72 },
});

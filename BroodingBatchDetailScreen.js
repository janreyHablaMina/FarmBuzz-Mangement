import { useMemo, useState } from 'react';
import { Alert, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BROODING_BATCHES } from './BroodingScreen';

const HERO_IMAGE = require('./assets/brooding-card.png');
const ORANGE = '#ff7900';

function formatToday() {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date());
}

function toneFor(status) {
  if (status === 'Needs Attention') return { color: '#ff756b', background: 'rgba(143,42,42,0.28)' };
  if (status === 'Ready for Growing') return { color: '#ffba56', background: 'rgba(159,91,13,0.24)' };
  return { color: '#6ee58c', background: 'rgba(30,112,58,0.24)' };
}

function SummaryMetric({ value, label, danger, last }) {
  return <View style={[styles.summaryMetric, !last && styles.summaryDivider]}><Text style={[styles.summaryValue, danger && styles.dangerValue]}>{value}</Text><Text style={styles.summaryLabel}>{label}</Text></View>;
}

function LossModal({ visible, batch, currentChicks, onClose, onSave }) {
  const [count, setCount] = useState('1');
  const [date, setDate] = useState(formatToday);
  const [note, setNote] = useState('');
  const save = () => {
    const value = Number.parseInt(count, 10);
    if (!Number.isFinite(value) || value < 1 || value > currentChicks) {
      Alert.alert('Check chicks lost', `Enter a number from 1 to ${currentChicks}.`);
      return;
    }
    onSave({ id: `LOSS-${Date.now()}`, count: value, date, note: note.trim() });
    setCount('1');
    setNote('');
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}><View><Text style={styles.modalEyebrow}>BROODING BATCH</Text><Text style={styles.modalTitle}>Record Loss</Text></View><Pressable accessibilityLabel="Close" onPress={onClose} style={styles.modalClose}><Ionicons name="close" size={20} color="#dce2e4" /></Pressable></View>
          <View style={styles.batchBand}><Text style={styles.batchBandId}>{batch.id}</Text><Text style={styles.batchBandValue}>{currentChicks} current chicks</Text></View>
          <Text style={styles.fieldLabel}>Chicks Lost</Text>
          <View style={styles.field}><MaterialCommunityIcons name="bird" size={18} color={ORANGE} /><TextInput value={count} onChangeText={setCount} keyboardType="number-pad" selectionColor={ORANGE} style={styles.fieldInput} /></View>
          <Text style={styles.fieldLabel}>Date</Text>
          <View style={styles.field}><MaterialCommunityIcons name="calendar-outline" size={18} color={ORANGE} /><TextInput value={date} onChangeText={setDate} selectionColor={ORANGE} style={styles.fieldInput} /></View>
          <Text style={styles.fieldLabel}>Note <Text style={styles.optional}>(optional)</Text></Text>
          <TextInput value={note} onChangeText={setNote} multiline placeholder="Reason or observation" placeholderTextColor="#69777c" selectionColor={ORANGE} style={styles.noteInput} />
          <View style={styles.modalActions}><Pressable onPress={onClose} style={styles.cancelButton}><Text style={styles.cancelText}>Cancel</Text></Pressable><Pressable onPress={save} style={styles.saveButton}><Text style={styles.saveText}>Save Loss</Text></Pressable></View>
        </View>
      </View>
    </Modal>
  );
}

export default function BroodingBatchDetailScreen({ batchId, lossRecords = [], onBack, onSaveLoss }) {
  const { width } = useWindowDimensions();
  const compact = width < 480;
  const [showLoss, setShowLoss] = useState(false);
  const batch = useMemo(() => BROODING_BATCHES.find((item) => item.id === batchId) || BROODING_BATCHES[0], [batchId]);
  const addedLosses = lossRecords.reduce((total, record) => total + record.count, 0);
  const currentChicks = Math.max(0, batch.chicks - addedLosses);
  const totalLosses = batch.startingChicks - currentChicks;
  const tone = toneFor(batch.status);

  return (
    <View style={styles.screen}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.pageWrap}>
        <View style={styles.page}>
          <View style={[styles.hero, compact && styles.heroCompact]}>
            <Image source={HERO_IMAGE} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="center" cachePolicy="memory-disk" />
            <LinearGradient colors={['rgba(2,7,9,0.16)', 'rgba(2,7,9,0.3)', '#03090c']} locations={[0, 0.5, 1]} style={StyleSheet.absoluteFill} />
            <SafeAreaView edges={['top']} style={styles.heroSafe}><View style={styles.header}><Pressable accessibilityLabel="Back to brooding" onPress={onBack} style={styles.backButton}><Ionicons name="arrow-back" size={21} color="#fff" /></Pressable><Text style={styles.headerTitle}>Brooding Batch</Text></View><View style={styles.heroCopy}><Text style={styles.batchTitle}>{batch.id}</Text><Text style={styles.heroDetail}>{currentChicks} chicks in {batch.location}</Text></View></SafeAreaView>
          </View>

          <View style={[styles.content, compact && styles.contentCompact]}>
            <View style={styles.identityCard}><View><Text style={styles.overline}>CURRENT BATCH</Text><Text style={styles.currentCount}>{currentChicks} chicks</Text><Text style={styles.ageText}>{batch.age} in brooding</Text></View><View style={[styles.statusPill, { backgroundColor: tone.background }]}><View style={[styles.statusDot, { backgroundColor: tone.color }]} /><Text style={[styles.statusText, { color: tone.color }]}>{batch.status}</Text></View></View>

            <Text style={styles.sectionTitle}>Source</Text>
            <View style={styles.infoCard}><View style={styles.infoItem}><MaterialCommunityIcons name="egg-outline" size={19} color={ORANGE} /><View><Text style={styles.infoLabel}>Incubation Batch</Text><Text style={styles.infoValue}>{batch.incubationBatch}</Text></View></View><View style={styles.infoItem}><MaterialCommunityIcons name="calendar-check-outline" size={19} color={ORANGE} /><View><Text style={styles.infoLabel}>Hatch Date</Text><Text style={styles.infoValue}>{batch.hatchDate}</Text></View></View><View style={styles.infoItem}><MaterialCommunityIcons name="bird" size={19} color={ORANGE} /><View><Text style={styles.infoLabel}>Starting Chicks</Text><Text style={styles.infoValue}>{batch.startingChicks}</Text></View></View></View>

            <Text style={styles.sectionTitle}>Source Breakdown</Text>
            <View style={styles.sourceCard}>{batch.sources.map((source, index) => <View key={source.groupName} style={[styles.sourceRow, index < batch.sources.length - 1 && styles.sourceDivider]}><View style={styles.sourceIcon}><MaterialCommunityIcons name="source-branch" size={18} color={ORANGE} /></View><View style={styles.sourceCopy}><Text style={styles.sourceName}>{source.groupName}</Text><Text style={styles.sourceCross}>{source.cross}</Text>{!!source.marking && <Text style={styles.marking}>Marking: {source.marking}</Text>}</View><Text style={styles.sourceChicks}>{source.chicks} chicks</Text></View>)}</View>

            <Text style={styles.sectionTitle}>Batch Summary</Text>
            <View style={styles.summaryCard}><SummaryMetric value={batch.startingChicks} label="Starting Chicks" /><SummaryMetric value={currentChicks} label="Current Chicks" /><SummaryMetric value={totalLosses} label="Total Losses" danger last /></View>

            <Text style={styles.sectionTitle}>Actions</Text>
            {batch.status === 'Ready for Growing' && <Pressable onPress={() => Alert.alert('Move to Growing', `${batch.id} is ready to leave brooding.`)} style={({ pressed }) => [styles.growingButton, pressed && styles.pressed]}><MaterialCommunityIcons name="arrow-right-circle-outline" size={22} color="#fff" /><Text style={styles.growingText}>Move to Growing</Text></Pressable>}
            <Pressable onPress={() => setShowLoss(true)} style={({ pressed }) => [styles.lossButton, pressed && styles.pressed]}><MaterialCommunityIcons name="minus-circle-outline" size={20} color={ORANGE} /><Text style={styles.lossText}>Record Loss</Text></Pressable>
            <View style={styles.secondaryActions}><Pressable onPress={() => Alert.alert('Edit location', batch.location)} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}><MaterialCommunityIcons name="map-marker-outline" size={18} color={ORANGE} /><Text style={styles.secondaryText}>Edit Brooder / Location</Text></Pressable><Pressable onPress={() => Alert.alert('Close batch', `Close ${batch.id}?`)} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}><MaterialCommunityIcons name="close-circle-outline" size={18} color="#ef6b55" /><Text style={[styles.secondaryText, styles.closeText]}>Close Batch</Text></Pressable></View>
          </View>
        </View>
      </ScrollView>
      <LossModal visible={showLoss} batch={batch} currentChicks={currentChicks} onClose={() => setShowLoss(false)} onSave={(record) => { onSaveLoss(record); setShowLoss(false); }} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#020709' }, pageWrap: { flexGrow: 1, alignItems: 'center', backgroundColor: '#020709' }, page: { width: '100%', maxWidth: 720 }, hero: { height: 248, overflow: 'hidden', backgroundColor: '#101719' }, heroCompact: { height: 228 }, heroSafe: { flex: 1 }, header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingTop: Platform.OS === 'web' ? 10 : 3 }, backButton: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(190,204,208,0.35)', backgroundColor: 'rgba(2,8,11,0.65)', alignItems: 'center', justifyContent: 'center' }, headerTitle: { color: '#f3f5f6', fontSize: 15, fontWeight: '800' }, heroCopy: { marginTop: 'auto', paddingHorizontal: 20, paddingBottom: 22 }, batchTitle: { color: '#fff', fontSize: 34, lineHeight: 40, fontWeight: '800', fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', web: 'Georgia' }) }, heroDetail: { marginTop: 4, color: '#c4cccf', fontSize: 12 },
  content: { padding: 16, paddingBottom: 30 }, contentCompact: { paddingHorizontal: 10 }, identityCard: { minHeight: 86, borderRadius: 7, borderWidth: 1, borderColor: '#23343b', backgroundColor: '#091317', padding: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }, overline: { color: '#718086', fontSize: 7, fontWeight: '800' }, currentCount: { marginTop: 5, color: '#fff', fontSize: 20, fontWeight: '800' }, ageText: { marginTop: 3, color: '#7c898e', fontSize: 9 }, statusPill: { minHeight: 24, maxWidth: 130, paddingHorizontal: 9, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 5 }, statusDot: { width: 5, height: 5, borderRadius: 3 }, statusText: { flexShrink: 1, fontSize: 8, fontWeight: '800' }, sectionTitle: { marginTop: 20, marginBottom: 8, color: '#e8edef', fontSize: 15, fontWeight: '800' },
  infoCard: { borderRadius: 7, borderWidth: 1, borderColor: '#1d2d33', backgroundColor: '#091317', flexDirection: 'row', paddingVertical: 13 }, infoItem: { flex: 1, minWidth: 0, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 7 }, infoLabel: { color: '#68767b', fontSize: 7 }, infoValue: { marginTop: 3, color: '#e0e6e8', fontSize: 9, fontWeight: '700' }, sourceCard: { borderRadius: 7, borderWidth: 1, borderColor: '#1d2d33', backgroundColor: '#091317', paddingHorizontal: 11 }, sourceRow: { minHeight: 68, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 9 }, sourceDivider: { borderBottomWidth: 1, borderBottomColor: '#1b2a30' }, sourceIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,121,0,0.08)', alignItems: 'center', justifyContent: 'center' }, sourceCopy: { flex: 1, minWidth: 0 }, sourceName: { color: '#edf1f2', fontSize: 11, fontWeight: '800' }, sourceCross: { marginTop: 3, color: '#7b898e', fontSize: 8 }, marking: { marginTop: 3, color: '#d9a057', fontSize: 8 }, sourceChicks: { color: ORANGE, fontSize: 9, fontWeight: '800' },
  summaryCard: { minHeight: 88, borderRadius: 7, borderWidth: 1, borderColor: '#1d2d33', backgroundColor: '#091317', flexDirection: 'row', alignItems: 'center' }, summaryMetric: { flex: 1, minWidth: 0, alignItems: 'center', justifyContent: 'center' }, summaryDivider: { borderRightWidth: 1, borderRightColor: '#213139' }, summaryValue: { color: '#fff', fontSize: 20, fontWeight: '800' }, dangerValue: { color: '#ef7467' }, summaryLabel: { marginTop: 5, color: '#77858a', fontSize: 8, textAlign: 'center' }, growingButton: { height: 50, borderRadius: 7, backgroundColor: ORANGE, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }, growingText: { color: '#fff', fontSize: 11, fontWeight: '800' }, lossButton: { height: 48, marginTop: 8, borderRadius: 7, borderWidth: 1, borderColor: ORANGE, backgroundColor: 'rgba(255,121,0,0.08)', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 }, lossText: { color: ORANGE, fontSize: 10, fontWeight: '800' }, secondaryActions: { marginTop: 8, flexDirection: 'row', gap: 8 }, secondaryButton: { flex: 1, minHeight: 46, borderRadius: 7, borderWidth: 1, borderColor: '#27383f', backgroundColor: '#091317', paddingHorizontal: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }, secondaryText: { flexShrink: 1, color: '#d9e0e2', fontSize: 9, fontWeight: '700', textAlign: 'center' }, closeText: { color: '#ef6b55' }, pressed: { opacity: 0.74 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.76)', alignItems: 'center', justifyContent: 'center', padding: 16 }, modalCard: { width: '100%', maxWidth: 440, borderRadius: 8, borderWidth: 1, borderColor: '#2a3b42', backgroundColor: '#081216', padding: 16 }, modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, modalEyebrow: { color: ORANGE, fontSize: 7, fontWeight: '800' }, modalTitle: { marginTop: 3, color: '#fff', fontSize: 20, fontWeight: '800' }, modalClose: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#111d21', alignItems: 'center', justifyContent: 'center' }, batchBand: { marginTop: 14, minHeight: 48, borderRadius: 6, backgroundColor: 'rgba(255,121,0,0.07)', paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, batchBandId: { color: ORANGE, fontSize: 11, fontWeight: '800' }, batchBandValue: { color: '#9da8ab', fontSize: 9 }, fieldLabel: { marginTop: 13, marginBottom: 5, color: '#cfd6d8', fontSize: 9, fontWeight: '700' }, optional: { color: '#6f7d82', fontWeight: '400' }, field: { height: 42, borderRadius: 6, borderWidth: 1, borderColor: '#293a41', backgroundColor: '#061014', paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 7 }, fieldInput: { flex: 1, height: 40, padding: 0, color: '#e7ebec', fontSize: 10, outlineStyle: 'none' }, noteInput: { height: 68, borderRadius: 6, borderWidth: 1, borderColor: '#293a41', backgroundColor: '#061014', padding: 10, color: '#e7ebec', fontSize: 10, textAlignVertical: 'top', outlineStyle: 'none' }, modalActions: { marginTop: 16, flexDirection: 'row', gap: 8 }, cancelButton: { flex: 1, height: 44, borderRadius: 6, borderWidth: 1, borderColor: '#2a3b42', alignItems: 'center', justifyContent: 'center' }, cancelText: { color: '#c8d0d2', fontSize: 10, fontWeight: '700' }, saveButton: { flex: 1, height: 44, borderRadius: 6, backgroundColor: ORANGE, alignItems: 'center', justifyContent: 'center' }, saveText: { color: '#fff', fontSize: 10, fontWeight: '800' },
});

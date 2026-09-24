import { useMemo, useState } from 'react';
import { Alert, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const HERO_IMAGE = require('./assets/brooding-card.png');
const ORANGE = '#ff7900';

function dateAfterDays(startDate, days) {
  const dueDate = new Date(startDate);
  if (Number.isNaN(dueDate.getTime())) return `Day ${days}`;
  dueDate.setDate(dueDate.getDate() + days);
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(dueDate);
}

export const BROODING_BATCHES = [
  { id: 'BR-024', chicks: 38, startingChicks: 40, age: 'Day 6', ageDays: 6, location: 'Brooder House 1', status: 'Brooding', note: 'Stable and feeding normally', incubationBatch: 'INC-024', hatchDate: 'Sep 11, 2026', sources: [{ groupName: 'Main Breeders', cross: 'Sweater x Kelso', chicks: 17, marking: 'Red' }, { groupName: 'Group B', cross: 'Kelso', chicks: 12, marking: 'Blue' }, { groupName: 'Group C', cross: 'Roundhead x Hatch', chicks: 9, marking: '' }] },
  { id: 'BR-021', chicks: 24, startingChicks: 27, age: 'Week 2', ageDays: 14, location: 'Brooder House 2', status: 'Needs Attention', note: 'Unusual loss recorded today', incubationBatch: 'INC-021', hatchDate: 'Sep 3, 2026', sources: [{ groupName: 'Main Breeders', cross: 'Sweater x Kelso', chicks: 14, marking: 'Green' }, { groupName: 'Group B', cross: 'Kelso', chicks: 10, marking: '' }] },
  { id: 'BR-018', chicks: 31, startingChicks: 34, age: 'Week 6', ageDays: 42, location: 'Main Brooder', status: 'Ready for Growing', note: 'Awaiting farmer confirmation', incubationBatch: 'INC-018', hatchDate: 'Aug 6, 2026', sources: [{ groupName: 'Main Breeders', cross: 'Sweater x Kelso', chicks: 18, marking: 'Red' }, { groupName: 'Group C', cross: 'Roundhead x Hatch', chicks: 13, marking: 'Yellow' }] },
];

function BatchCard({ batch, vaccinationSchedule, vaccineCompletions, onOpen, onMarkDone }) {
  const [outcomeVisible, setOutcomeVisible] = useState(false);
  const [mortalityInput, setMortalityInput] = useState(String(Math.max(0, batch.startingChicks - batch.chicks)));
  const familySources = (batch.sources || []).map((source) => {
    const parents = source.cross.split(/\s+x\s+/i);
    return { ...source, sire: parents[0], dam: parents[1] || source.cross };
  });
  const sire = familySources[0]?.sire || 'Not recorded';
  const nextVaccine = vaccinationSchedule
    .filter((vaccine) => vaccine.enabled !== false && !vaccineCompletions[vaccine.id])
    .sort((a, b) => a.day - b.day)[0];
  const nextActionTitle = nextVaccine?.name || 'Daily Brooder Check';
  const isOutcomeTask = nextVaccine?.id === 'brooding-outcome';
  const daysRemaining = nextVaccine ? nextVaccine.day - batch.ageDays : 0;
  const nextActionDue = nextVaccine ? dateAfterDays(batch.hatchDate, nextVaccine.day) : dateAfterDays(new Date(), 0);
  const dueDateValue = new Date(nextActionDue);
  const dueMonth = Number.isNaN(dueDateValue.getTime()) ? 'DAY' : dueDateValue.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  const dueDateNumber = Number.isNaN(dueDateValue.getTime()) ? batch.ageDays : dueDateValue.getDate();
  const nextActionRemaining = nextVaccine
    ? daysRemaining === 0
      ? 'Due today'
      : daysRemaining < 0
        ? `${Math.abs(daysRemaining)} day${Math.abs(daysRemaining) === 1 ? '' : 's'} overdue`
        : `${daysRemaining} day${daysRemaining === 1 ? '' : 's'} remaining`
    : 'Due today';
  const mortalityValue = Number.parseInt(mortalityInput, 10) || 0;
  const chicksAtRange = Math.max(0, batch.startingChicks - mortalityValue);
  const outcomeSuccessRate = batch.startingChicks ? Math.round((chicksAtRange / batch.startingChicks) * 1000) / 10 : 0;
  const completeTask = () => {
    if (!isOutcomeTask) {
      onMarkDone(nextVaccine?.id || `daily-${batch.id}`);
      return;
    }
    setMortalityInput(String(Math.max(0, batch.startingChicks - batch.chicks)));
    setOutcomeVisible(true);
  };
  const saveOutcome = () => {
    if (!Number.isInteger(mortalityValue) || mortalityValue < 0 || mortalityValue > batch.startingChicks) {
      Alert.alert('Check mortality', `Enter a whole number from 0 to ${batch.startingChicks}.`);
      return;
    }
    onMarkDone(nextVaccine.id, { mortality: mortalityValue, successRate: outcomeSuccessRate, chicksAtRange });
    setOutcomeVisible(false);
  };
  return (
    <View style={styles.batchCard}>
      <View style={styles.batchTop}>
        <View style={styles.batchIdentity}>
          <View style={styles.batchIcon}><MaterialCommunityIcons name="bird" size={23} color={ORANGE} /></View>
          <View><Text style={styles.batchName}>{batch.location}</Text><Text style={styles.batchId}>{batch.id}</Text></View>
        </View>
        <View style={styles.chickCount}><Text style={styles.chickCountValue}>{batch.chicks}</Text><Text style={styles.chickCountLabel}>chicks</Text></View>
      </View>
      {!!familySources.length && (
        <View style={styles.familyTree}>
          <View style={styles.sireNode}>
            <View style={styles.familyLabelRow}><MaterialCommunityIcons name="gender-male" size={13} color={ORANGE} /><Text style={styles.familyLabel}>SIRE</Text></View>
            <Text style={styles.familyValue}>{sire}</Text>
          </View>
          <View style={styles.treeConnector}><View style={styles.treeStem} /><View style={styles.treeTrunk} /></View>
          <View style={styles.damList}>
            {familySources.map((source, index) => (
              <View key={`${batch.id}-${source.groupName}`} style={styles.damBranch}>
                <View style={styles.branchLine} />
                <View style={styles.damNode}>
                  <View style={styles.damTopRow}>
                    <View style={styles.familyLabelRow}><MaterialCommunityIcons name="gender-female" size={13} color={ORANGE} /><Text style={styles.familyLabel}>DAM {index + 1}</Text></View>
                  </View>
                  <Text style={styles.familyValue}>{source.dam}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}
      <View style={styles.cardNextAction}>
        <View style={styles.cardNextActionIcon}>
          <Text style={styles.cardNextActionMonth}>{dueMonth}</Text>
          <Text style={styles.cardNextActionDay}>{dueDateNumber}</Text>
        </View>
        <View style={styles.cardNextActionCopy}>
          <Text style={styles.cardNextActionTitle}>{nextActionTitle}</Text>
          <View style={styles.cardNextActionTiming}>
            <View style={styles.cardNextActionMeta}><MaterialCommunityIcons name="clock-outline" size={12} color={ORANGE} /><Text style={styles.cardNextActionDetail}>{nextActionRemaining}</Text></View>
          </View>
        </View>
        <Pressable accessibilityLabel={`${isOutcomeTask ? 'Record' : 'Mark done'} ${nextActionTitle} for ${batch.id}`} onPress={completeTask} style={({ pressed }) => [styles.quickActionButton, pressed && styles.pressed]}><MaterialCommunityIcons name={isOutcomeTask ? 'chart-box-outline' : 'check'} size={14} color="#ffffff" /><Text style={styles.quickActionText}>{isOutcomeTask ? 'Record' : 'Mark Done'}</Text></Pressable>
      </View>
      <Modal visible={outcomeVisible} transparent animationType="fade" onRequestClose={() => setOutcomeVisible(false)}>
        <View style={styles.modalBackdrop}>
          <Pressable accessibilityLabel="Close outcome modal" onPress={() => setOutcomeVisible(false)} style={StyleSheet.absoluteFill} />
          <View style={styles.outcomeModal}>
            <View style={styles.outcomeHeader}>
              <View><Text style={styles.outcomeEyebrow}>FINAL BROODING TASK</Text><Text style={styles.outcomeTitle}>Record Batch Outcome</Text></View>
              <Pressable accessibilityLabel="Close" onPress={() => setOutcomeVisible(false)} style={styles.outcomeClose}><Ionicons name="close" size={20} color="#ffffff" /></Pressable>
            </View>
            <View style={styles.outcomeBatchBand}><Text style={styles.outcomeBatchId}>{batch.id}</Text><Text style={styles.outcomeBatchCount}>{batch.startingChicks} starting chicks</Text></View>
            <Text style={styles.outcomeFieldLabel}>Mortality</Text>
            <View style={styles.outcomeInputShell}><MaterialCommunityIcons name="minus-circle-outline" size={18} color={ORANGE} /><TextInput value={mortalityInput} onChangeText={(value) => setMortalityInput(value.replace(/[^0-9]/g, ''))} keyboardType="number-pad" inputMode="numeric" maxLength={4} selectTextOnFocus selectionColor={ORANGE} style={styles.outcomeInput} /></View>
            <View style={styles.outcomeSummary}>
              <View style={styles.outcomeMetric}><Text style={styles.outcomeMetricValue}>{chicksAtRange}</Text><Text style={styles.outcomeMetricLabel}>Ready to Range</Text></View>
              <View style={styles.outcomeSummaryDivider} />
              <View style={styles.outcomeMetric}><Text style={styles.outcomeMetricValue}>{outcomeSuccessRate}%</Text><Text style={styles.outcomeMetricLabel}>Success Rate</Text></View>
            </View>
            <View style={styles.outcomeActions}><Pressable onPress={() => setOutcomeVisible(false)} style={styles.outcomeCancel}><Text style={styles.outcomeCancelText}>Cancel</Text></Pressable><Pressable onPress={saveOutcome} style={styles.outcomeSave}><MaterialCommunityIcons name="content-save-check-outline" size={17} color="#ffffff" /><Text style={styles.outcomeSaveText}>Record Outcome</Text></Pressable></View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export default function BroodingScreen({ farm, onBack, onOpenBatch, onOpenSettings, onMarkTaskDone, addedBatches = [], lossRecordsByBatch = {}, vaccineCompletionsByBatch = {}, vaccinationSchedule = [], readyDay = 42 }) {
  const { width } = useWindowDimensions();
  const compact = width < 480;
  const [query, setQuery] = useState('');
  const adjustedBatches = useMemo(() => (addedBatches.length ? [addedBatches[0]] : [BROODING_BATCHES[0]]).map((batch) => {
    const addedLosses = (lossRecordsByBatch[batch.id] || []).reduce((total, record) => total + record.count, 0);
    const ready = batch.ageDays >= readyDay;
    return { ...batch, chicks: Math.max(0, batch.chicks - addedLosses), status: ready && batch.status !== 'Needs Attention' ? 'Ready for Growing' : batch.status };
  }), [addedBatches, lossRecordsByBatch, readyDay]);
  const batches = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return adjustedBatches;
    return adjustedBatches.filter((batch) => `${batch.id} ${batch.location} ${batch.status} ${batch.age}`.toLowerCase().includes(search));
  }, [adjustedBatches, query]);
  return (
    <View style={styles.screen}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.pageWrap}>
        <View style={styles.page}>
          <View style={[styles.hero, compact && styles.heroCompact]}>
            <Image source={HERO_IMAGE} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="center" cachePolicy="memory-disk" />
            <LinearGradient colors={['rgba(2,7,9,0.15)', 'rgba(2,7,9,0.25)', '#03090c']} locations={[0, 0.5, 1]} style={StyleSheet.absoluteFill} />
            <SafeAreaView edges={['top']} style={styles.heroSafe}>
              <View style={styles.header}><View style={styles.headerLeft}><Pressable accessibilityLabel="Back to farm" onPress={onBack} style={styles.backButton}><Ionicons name="arrow-back" size={21} color="#fff" /></Pressable><Text style={styles.headerTitle}>Brooding</Text></View><Pressable accessibilityLabel="Brooding settings" onPress={onOpenSettings} style={styles.backButton}><Ionicons name="settings-outline" size={21} color="#fff" /></Pressable></View>
              <View style={styles.heroCopy}><Text style={[styles.farmName, compact && styles.farmNameCompact]}>{farm?.name || 'FB Farm'}</Text><Text style={styles.tagline}>Manage chicks from hatch through the growing transition.</Text><View style={styles.meta}><Ionicons name="location-outline" size={14} color="#dce2e4" /><Text style={styles.metaText}>{farm?.location || 'Pampanga, Philippines'}</Text><View style={styles.metaDivider} /><Ionicons name="calendar-outline" size={14} color="#dce2e4" /><Text style={styles.metaText}>Est. {farm?.established || '2020'}</Text></View></View>
            </SafeAreaView>
          </View>

          <View style={[styles.content, compact && styles.contentCompact]}>
            <View style={styles.searchBox}>
              <Ionicons name="search" size={22} color="#9aa4a8" />
              <TextInput value={query} onChangeText={setQuery} placeholder="Search chicks or batches" placeholderTextColor="#879195" selectionColor={ORANGE} style={styles.searchInput} />
              {!!query && <Pressable accessibilityLabel="Clear search" onPress={() => setQuery('')} hitSlop={8}><Ionicons name="close-circle" size={18} color="#6c777b" /></Pressable>}
            </View>
            <View style={styles.listHeading}><View><Text style={styles.overline}>ACTIVE BATCHES</Text><Text style={styles.listTitle}>Brooding batches</Text></View><Text style={styles.batchCount}>{batches.length} active</Text></View>
            <View style={styles.batchList}>{batches.map((batch) => <BatchCard key={batch.id} batch={batch} vaccinationSchedule={vaccinationSchedule} vaccineCompletions={vaccineCompletionsByBatch[batch.id] || {}} onOpen={() => onOpenBatch(batch.id)} onMarkDone={(taskId, details) => onMarkTaskDone(batch.id, taskId, details)} />)}{!batches.length && <Text style={styles.empty}>No brooding batches found</Text>}</View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#020709' }, pageWrap: { flexGrow: 1, alignItems: 'center', backgroundColor: '#020709' }, page: { width: '100%', maxWidth: 720 },
  hero: { height: 252, overflow: 'hidden', backgroundColor: '#101719' }, heroCompact: { height: 230 }, heroSafe: { flex: 1 }, header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: Platform.OS === 'web' ? 10 : 3 }, headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 }, backButton: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(190,204,208,0.35)', backgroundColor: 'rgba(2,8,11,0.65)', alignItems: 'center', justifyContent: 'center' }, headerTitle: { color: '#f3f5f6', fontSize: 17, fontWeight: '700' },
  heroCopy: { marginTop: 'auto', paddingHorizontal: 20, paddingBottom: 22 }, farmName: { color: '#fff', fontSize: 34, lineHeight: 40, fontWeight: '800', fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', web: 'Georgia' }) }, farmNameCompact: { fontSize: 29, lineHeight: 34 }, tagline: { marginTop: 3, color: '#c2cbce', fontSize: 13 }, meta: { marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 6 }, metaText: { color: '#d3dade', fontSize: 10 }, metaDivider: { width: 1, height: 12, marginHorizontal: 5, backgroundColor: 'rgba(210,220,224,0.35)' },
  content: { paddingHorizontal: 10, paddingTop: 0, paddingBottom: 28 }, contentCompact: { paddingHorizontal: 8 }, searchBox: { height: 54, borderRadius: 7, borderWidth: 1, borderColor: '#26373e', backgroundColor: '#081216', paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 8 }, searchInput: { flex: 1, height: 52, padding: 0, color: '#e7ebec', fontSize: 12, outlineStyle: 'none' },
  overline: { color: '#899397', fontSize: 10, fontWeight: '600' },
  listHeading: { marginTop: 20, marginBottom: 9, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }, listTitle: { marginTop: 4, color: '#edf1f2', fontSize: 17, fontWeight: '800' }, batchCount: { color: '#8e9a9e', fontSize: 10, fontWeight: '700' }, batchList: { gap: 9 },
  batchCard: { borderRadius: 7, borderWidth: 1, borderColor: '#223138', backgroundColor: '#091317', padding: 13 }, batchTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }, batchIdentity: { minWidth: 0, flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 }, batchIcon: { width: 40, height: 40, borderRadius: 7, backgroundColor: 'rgba(255,122,0,0.1)', alignItems: 'center', justifyContent: 'center' }, batchName: { color: '#eef2f3', fontSize: 13, fontWeight: '800' }, batchId: { marginTop: 3, color: '#758287', fontSize: 9 }, chickCount: { alignItems: 'flex-end' }, chickCountValue: { color: '#ffffff', fontSize: 18, lineHeight: 20, fontWeight: '800' }, chickCountLabel: { marginTop: 2, color: '#78868b', fontSize: 8 },
  familyTree: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#1b2a30', flexDirection: 'row', alignItems: 'center', minHeight: 178 }, sireNode: { flex: 1, minWidth: 0, maxWidth: '36%', minHeight: 48, borderRadius: 7, borderWidth: 1, borderColor: 'rgba(255,122,0,0.45)', backgroundColor: '#0d191e', paddingHorizontal: 10, paddingVertical: 8, justifyContent: 'center' }, familyLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 5 }, familyLabel: { color: '#77858a', fontSize: 8, fontWeight: '800' }, familyValue: { marginTop: 5, color: '#e5eaeb', fontSize: 12, fontWeight: '700' }, treeConnector: { width: 30, height: 158, position: 'relative' }, treeStem: { position: 'absolute', left: 0, right: 0, top: '50%', height: 1, backgroundColor: '#526168' }, treeTrunk: { position: 'absolute', right: 0, top: 24, bottom: 24, width: 1, backgroundColor: '#526168' }, damList: { flex: 1, gap: 7 }, damBranch: { flexDirection: 'row', alignItems: 'center' }, branchLine: { width: 12, height: 1, backgroundColor: '#526168' }, damNode: { flex: 1, minWidth: 0, minHeight: 48, borderRadius: 7, borderWidth: 1, borderColor: '#293a40', backgroundColor: '#0d191e', paddingHorizontal: 10, paddingVertical: 8, justifyContent: 'center' }, damTopRow: { flexDirection: 'row', alignItems: 'center' }, empty: { paddingVertical: 28, color: '#748187', fontSize: 11, textAlign: 'center' }, pressed: { opacity: 0.76, transform: [{ scale: 0.995 }] },
  cardNextAction: { minHeight: 88, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#293a40', flexDirection: 'row', alignItems: 'center', gap: 10 }, cardNextActionIcon: { width: 44, height: 50, borderRadius: 6, borderWidth: 1, borderColor: '#8f500d', backgroundColor: 'rgba(255,121,0,0.08)', alignItems: 'center', justifyContent: 'center' }, cardNextActionMonth: { color: ORANGE, fontSize: 7, lineHeight: 9, fontWeight: '800' }, cardNextActionDay: { marginTop: 2, color: '#ffffff', fontSize: 17, lineHeight: 18, fontWeight: '800' }, cardNextActionCopy: { flex: 1, minWidth: 0 }, cardNextActionTitle: { color: '#eef2f3', fontSize: 12, fontWeight: '800' }, cardNextActionTiming: { marginTop: 6, gap: 3 }, cardNextActionMeta: { minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 4 }, cardNextActionDetail: { flexShrink: 1, color: ORANGE, fontSize: 9, fontWeight: '700' }, quickActionButton: { height: 38, minWidth: 94, borderRadius: 6, backgroundColor: ORANGE, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 }, quickActionText: { color: '#ffffff', fontSize: 9, fontWeight: '800' },
  modalBackdrop: { flex: 1, paddingHorizontal: 16, backgroundColor: 'rgba(0,4,6,0.84)', alignItems: 'center', justifyContent: 'center' }, outcomeModal: { width: '100%', maxWidth: 430, borderRadius: 8, borderWidth: 1, borderColor: '#2c3d44', backgroundColor: '#071216', padding: 16 }, outcomeHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }, outcomeEyebrow: { color: ORANGE, fontSize: 8, fontWeight: '800' }, outcomeTitle: { marginTop: 5, color: '#ffffff', fontSize: 21, fontWeight: '800' }, outcomeClose: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: '#44535a', alignItems: 'center', justifyContent: 'center' }, outcomeBatchBand: { height: 45, marginTop: 16, borderRadius: 6, backgroundColor: '#0d1a1f', paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, outcomeBatchId: { color: ORANGE, fontSize: 11, fontWeight: '800' }, outcomeBatchCount: { color: '#9ba7aa', fontSize: 9 }, outcomeFieldLabel: { marginTop: 15, marginBottom: 6, color: '#edf1f2', fontSize: 10, fontWeight: '700' }, outcomeInputShell: { height: 48, borderRadius: 7, borderWidth: 1, borderColor: '#304249', backgroundColor: '#081519', paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 9 }, outcomeInput: { flex: 1, height: 46, padding: 0, color: '#ffffff', fontSize: 13, outlineStyle: 'none' }, outcomeSummary: { minHeight: 72, marginTop: 12, borderRadius: 7, borderWidth: 1, borderColor: '#263940', backgroundColor: '#091519', flexDirection: 'row', alignItems: 'center' }, outcomeMetric: { flex: 1, alignItems: 'center' }, outcomeMetricValue: { color: '#ffffff', fontSize: 18, fontWeight: '800' }, outcomeMetricLabel: { marginTop: 4, color: '#7f8c91', fontSize: 8 }, outcomeSummaryDivider: { width: 1, height: 36, backgroundColor: '#263940' }, outcomeActions: { marginTop: 16, flexDirection: 'row', gap: 8 }, outcomeCancel: { flex: 1, height: 44, borderRadius: 7, borderWidth: 1, borderColor: '#304249', alignItems: 'center', justifyContent: 'center' }, outcomeCancelText: { color: '#e4e9ea', fontSize: 10, fontWeight: '700' }, outcomeSave: { flex: 1.4, height: 44, borderRadius: 7, backgroundColor: ORANGE, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }, outcomeSaveText: { color: '#ffffff', fontSize: 10, fontWeight: '800' },
});

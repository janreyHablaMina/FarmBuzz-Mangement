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

function vaccineDueDate(hatchDate, day) {
  const due = new Date(hatchDate);
  due.setDate(due.getDate() + day);
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(due);
}

function SummaryMetric({ value, label, danger, last }) {
  return <View style={[styles.summaryMetric, !last && styles.summaryDivider]}><Text style={[styles.summaryValue, danger && styles.dangerValue]}>{value}</Text><Text style={styles.summaryLabel}>{label}</Text></View>;
}

const BROODING_STAGES = [
  { day: 0, label: 'Hatched', icon: 'egg-easter' },
  { day: 1, label: 'Day 1', icon: 'bird' },
  { day: 14, label: 'Mid Brooding', icon: 'sprout-outline' },
  { day: 42, label: 'Ready for Growing', icon: 'arrow-right-circle-outline' },
];

function ProgressPreview({ batch, previewDay, onPreviewDayChange }) {
  const currentIndex = BROODING_STAGES.reduce((result, stage, index) => previewDay >= stage.day ? index : result, 0);
  const progress = Math.min(100, Math.round((previewDay / 42) * 100));
  const nextStage = BROODING_STAGES.find((stage) => stage.day > previewDay);
  const displayAge = previewDay === batch.ageDays ? batch.age : previewDay === 0 ? 'Hatched' : previewDay % 7 === 0 ? `Week ${previewDay / 7}` : `Day ${previewDay}`;
  const displayStatus = previewDay >= 42 ? 'Ready for Growing' : previewDay >= 14 ? 'Mid Brooding' : previewDay === 0 ? 'Hatched' : 'Brooding';
  const message = previewDay === 0 ? 'Hatch day and brooding entry' : previewDay < 7 ? 'Early brooding period' : previewDay < 14 ? 'First week development' : previewDay < 42 ? 'Growing steadily in brooding' : 'Ready for growing transition';

  return (
    <View style={styles.progressCard}>
      <View style={styles.progressMain}>
        <View style={styles.progressVisual}><Image source={HERO_IMAGE} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="70% center" /><LinearGradient colors={['rgba(3,9,12,0.08)', 'rgba(3,9,12,0.8)']} style={StyleSheet.absoluteFill} /></View>
        <View style={styles.progressCopy}><View style={styles.progressAgeRow}><Text style={styles.progressAge}>{displayAge}</Text><View style={styles.stageChip}><Text style={styles.stageChipText}>{displayStatus}</Text></View></View><Text style={styles.progressMessage}>{message}</Text><View style={styles.milestoneRow}><View><Text style={styles.milestoneLabel}>Next milestone</Text><Text style={styles.milestoneValue}>{nextStage?.label || 'Growing transition'}</Text></View><Text style={styles.progressPercent}>{progress}%</Text></View><View style={styles.mainProgressTrack}><View style={[styles.mainProgressFill, { width: `${progress}%` }]} /></View></View>
      </View>
      <View style={styles.timeline}><View style={styles.timelineTrack} />{BROODING_STAGES.map((stage, index) => { const active = index === currentIndex; const complete = index < currentIndex; return <Pressable accessibilityRole="button" accessibilityState={{ selected: active }} accessibilityLabel={`Preview ${stage.label}`} onPress={() => onPreviewDayChange(stage.day)} key={stage.label} style={({ pressed }) => [styles.timelineItem, pressed && styles.timelineItemPressed]}><View style={[styles.timelineDot, complete && styles.timelineDotComplete, active && styles.timelineDotActive]}><MaterialCommunityIcons name={stage.icon} size={active ? 17 : 14} color={active || complete ? ORANGE : '#657278'} /></View><Text numberOfLines={2} style={[styles.timelineLabel, active && styles.timelineLabelActive]}>{stage.label}</Text></Pressable>; })}</View>
    </View>
  );
}

function SnapshotItem({ icon, value, label, compact }) {
  return <View style={[styles.snapshotItem, compact && styles.snapshotItemCompact]}><MaterialCommunityIcons name={icon} size={21} color={ORANGE} /><Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.65} style={styles.snapshotValue}>{value}</Text><Text style={styles.snapshotLabel}>{label}</Text></View>;
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

function MoveToGrowingModal({ visible, batch, currentChicks, onClose, onConfirm }) {
  const [title, setTitle] = useState(`${batch.id} Growers`);
  const confirm = () => {
    if (!title.trim()) {
      Alert.alert('Batch title required', 'Enter a title for the growing batch.');
      return;
    }
    onConfirm(title.trim());
  };
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}><View><Text style={styles.modalEyebrow}>BROODING COMPLETE</Text><Text style={styles.modalTitle}>Move to Growing</Text></View><Pressable accessibilityLabel="Close" onPress={onClose} style={styles.modalClose}><Ionicons name="close" size={20} color="#dce2e4" /></Pressable></View>
          <View style={styles.transitionVisual}><View style={styles.transitionIcon}><MaterialCommunityIcons name="bird" size={24} color={ORANGE} /></View><View style={styles.transitionLine}><Ionicons name="arrow-forward" size={19} color={ORANGE} /></View><View style={[styles.transitionIcon, styles.transitionIconActive]}><MaterialCommunityIcons name="home-group" size={24} color="#fff" /></View></View>
          <View style={styles.transitionSummary}><View><Text style={styles.infoLabel}>Batch</Text><Text style={styles.transitionValue}>{batch.id}</Text></View><View><Text style={styles.infoLabel}>Moving</Text><Text style={styles.transitionValue}>{currentChicks} chicks</Text></View><View><Text style={styles.infoLabel}>From</Text><Text style={styles.transitionValue}>{batch.location}</Text></View></View>
          <Text style={styles.fieldLabel}>Growing Batch Title</Text>
          <View style={styles.field}><MaterialCommunityIcons name="format-title" size={18} color={ORANGE} /><TextInput value={title} onChangeText={setTitle} placeholder="e.g. September Growers" placeholderTextColor="#68777c" selectionColor={ORANGE} style={styles.fieldInput} /></View>
          <View style={styles.transitionNote}><MaterialCommunityIcons name="information-outline" size={19} color={ORANGE} /><Text style={styles.transitionNoteText}>This will complete the brooding batch and create its growing-stage record.</Text></View>
          <View style={styles.modalActions}><Pressable onPress={onClose} style={styles.cancelButton}><Text style={styles.cancelText}>Cancel</Text></Pressable><Pressable onPress={confirm} style={styles.saveButton}><Text style={styles.saveText}>Move to Growing</Text></Pressable></View>
        </View>
      </View>
    </Modal>
  );
}

export default function BroodingBatchDetailScreen({ batchId, lossRecords = [], vaccinationSchedule = [], vaccineCompletions = {}, onBack, onSaveLoss, onMarkVaccineCompleted }) {
  const { width } = useWindowDimensions();
  const compact = width < 480;
  const [showLoss, setShowLoss] = useState(false);
  const [showGrowing, setShowGrowing] = useState(false);
  const batch = useMemo(() => BROODING_BATCHES.find((item) => item.id === batchId) || BROODING_BATCHES[0], [batchId]);
  const [previewDay, setPreviewDay] = useState(batch.ageDays);
  const addedLosses = lossRecords.reduce((total, record) => total + record.count, 0);
  const currentChicks = Math.max(0, batch.chicks - addedLosses);
  const totalLosses = batch.startingChicks - currentChicks;
  const enabledVaccines = vaccinationSchedule.filter((item) => item.enabled).sort((a, b) => a.day - b.day);
  const completedVaccineCount = enabledVaccines.filter((item) => vaccineCompletions[item.id]).length;
  const vaccinesRequiringAction = enabledVaccines.filter((item) => !vaccineCompletions[item.id] && previewDay >= item.day).length;
  const nextVaccine = enabledVaccines.find((item) => !vaccineCompletions[item.id]);
  const nextVaccineStatus = nextVaccine
    ? previewDay > nextVaccine.day ? 'Overdue' : previewDay === nextVaccine.day ? 'Due Today' : 'Upcoming'
    : 'Completed';
  const nextVaccineTone = nextVaccineStatus === 'Overdue'
    ? '#ef7568'
    : nextVaccineStatus === 'Due Today'
      ? '#ffba56'
      : nextVaccineStatus === 'Completed'
        ? '#6ee58c'
        : '#8ec9df';
  const vaccineNeedsAction = nextVaccine && (nextVaccineStatus === 'Overdue' || nextVaccineStatus === 'Due Today');
  const readyForGrowing = previewDay >= 42;
  const previewStatus = readyForGrowing ? 'Ready for Growing' : previewDay >= 14 ? 'Mid Brooding' : previewDay === 0 ? 'Hatched' : 'Brooding';
  const nextAction = readyForGrowing
    ? { icon: 'arrow-right-circle-outline', title: 'Ready for Growing', detail: 'Brooding cycle complete - farmer confirmation required', button: 'Move to Growing', onPress: () => setShowGrowing(true) }
    : vaccineNeedsAction
      ? { icon: 'needle', title: `${nextVaccine.name} Vaccine Due`, detail: `${nextVaccineStatus} - scheduled for Day ${nextVaccine.day}`, button: 'Record Completed', onPress: () => onMarkVaccineCompleted(nextVaccine.id) }
      : previewDay <= 1
        ? { icon: 'home-check-outline', title: 'Confirm Brooder Setup', detail: 'Confirm the batch is settled in its assigned brooder.', button: 'Complete', onPress: () => Alert.alert('Brooder setup confirmed') }
        : previewDay < 7
          ? { icon: 'clipboard-check-outline', title: 'First Week Check', detail: `Due on Day 7 - ${7 - previewDay} day${7 - previewDay === 1 ? '' : 's'} remaining`, button: 'Start Check', onPress: () => Alert.alert('First Week Check', batch.id) }
          : { icon: 'chart-timeline-variant', title: 'Growing Transition Approaching', detail: `${Math.max(0, 42 - previewDay)} days until the Week 6 transition`, button: 'View Program', onPress: () => Alert.alert('Brooding program', `Day ${previewDay} of the six-week brooding cycle.`) };

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
            <ProgressPreview batch={batch} previewDay={previewDay} onPreviewDayChange={setPreviewDay} />

            <View style={styles.originStrip}><View style={styles.originItem}><Text style={styles.infoLabel}>Incubation Batch</Text><Text style={styles.infoValue}>{batch.incubationBatch}</Text></View><View style={styles.originDivider} /><View style={styles.originItem}><Text style={styles.infoLabel}>Hatch Date</Text><Text style={styles.infoValue}>{batch.hatchDate}</Text></View><View style={styles.originDivider} /><View style={styles.originItem}><Text style={styles.infoLabel}>Starting Chicks</Text><Text style={styles.infoValue}>{batch.startingChicks}</Text></View></View>

            <Text style={styles.sectionTitle}>Batch Snapshot</Text>
            <View style={styles.snapshotGrid}><SnapshotItem icon="bird" value={currentChicks} label="Current Chicks" compact={compact} /><SnapshotItem icon="source-branch" value={batch.sources.length} label="Source Groups" compact={compact} /><SnapshotItem icon="home-map-marker" value={batch.location} label="Brooder" compact={compact} /><SnapshotItem icon="progress-check" value={previewStatus} label="Status" compact={compact} /></View>

            <Text style={styles.sectionTitle}>Next Action</Text>
            <View style={styles.actionFocus}><View style={styles.actionFocusIcon}><MaterialCommunityIcons name={nextAction.icon} size={25} color={ORANGE} /></View><View style={styles.actionFocusCopy}><Text style={styles.actionFocusTitle}>{nextAction.title}</Text><Text style={styles.actionFocusDetail}>{nextAction.detail}</Text></View><Pressable onPress={nextAction.onPress} style={({ pressed }) => [styles.actionFocusButton, pressed && styles.pressed]}><Text style={styles.actionFocusButtonText}>{nextAction.button}</Text></Pressable></View>

            <Text style={styles.sectionTitle}>Source Breakdown</Text>
            <View style={styles.sourceCard}>{batch.sources.map((source, index) => <View key={source.groupName} style={[styles.sourceRow, index < batch.sources.length - 1 && styles.sourceDivider]}><View style={styles.sourceIcon}><MaterialCommunityIcons name="source-branch" size={18} color={ORANGE} /></View><View style={styles.sourceCopy}><Text style={styles.sourceName}>{source.groupName}</Text><Text style={styles.sourceCross}>{source.cross}</Text>{!!source.marking && <Text style={styles.marking}>Marking: {source.marking}</Text>}</View><Text style={styles.sourceChicks}>{source.chicks} chicks</Text></View>)}</View>

            <Text style={styles.sectionTitle}>Vaccination</Text>
            <View style={styles.vaccineOverview}><View><Text style={styles.vaccineOverviewValue}>{completedVaccineCount}/{enabledVaccines.length}</Text><Text style={styles.vaccineOverviewLabel}>Completed</Text></View><View style={styles.vaccineOverviewDivider} /><View><Text style={[styles.vaccineOverviewValue, vaccinesRequiringAction > 0 && styles.vaccineAttention]}>{vaccinesRequiringAction}</Text><Text style={styles.vaccineOverviewLabel}>Requires Action</Text></View></View>
            {nextVaccine ? (
              <View style={styles.nextVaccineCard}>
                <View style={styles.nextVaccineTop}><View style={styles.vaccineIcon}><MaterialCommunityIcons name="needle" size={21} color={ORANGE} /></View><View style={styles.nextVaccineCopy}><Text style={styles.nextVaccineEyebrow}>NEXT VACCINE</Text><Text style={styles.nextVaccineName}>{nextVaccine.name}</Text></View><View style={[styles.vaccineStatus, { borderColor: `${nextVaccineTone}70`, backgroundColor: `${nextVaccineTone}18` }]}><View style={[styles.statusDot, { backgroundColor: nextVaccineTone }]} /><Text style={[styles.vaccineStatusText, { color: nextVaccineTone }]}>{nextVaccineStatus}</Text></View></View>
                <View style={styles.vaccineMeta}><View><Text style={styles.infoLabel}>Day Due</Text><Text style={styles.infoValue}>Day {nextVaccine.day}</Text></View><View><Text style={styles.infoLabel}>Due Date</Text><Text style={styles.infoValue}>{vaccineDueDate(batch.hatchDate, nextVaccine.day)}</Text></View></View>
                {!!nextVaccine.note && <Text style={styles.nextVaccineNote}>{nextVaccine.note}</Text>}
                <Pressable onPress={() => onMarkVaccineCompleted(nextVaccine.id)} style={({ pressed }) => [styles.completeVaccineButton, pressed && styles.pressed]}><MaterialCommunityIcons name="check-circle-outline" size={19} color="#fff" /><Text style={styles.completeVaccineText}>Mark Completed</Text></Pressable>
              </View>
            ) : (
              <View style={styles.vaccinesComplete}><MaterialCommunityIcons name="check-decagram-outline" size={23} color="#6ee58c" /><View><Text style={styles.vaccinesCompleteTitle}>Schedule Completed</Text><Text style={styles.vaccinesCompleteDetail}>All enabled vaccines are recorded for this batch.</Text></View></View>
            )}

            <Text style={styles.sectionTitle}>Batch Totals</Text>
            <View style={styles.summaryCard}><SummaryMetric value={batch.startingChicks} label="Starting Chicks" /><SummaryMetric value={currentChicks} label="Current Chicks" /><SummaryMetric value={totalLosses} label="Total Losses" danger last /></View>

            <Text style={styles.sectionTitle}>Batch Management</Text>
            <Pressable onPress={() => setShowLoss(true)} style={({ pressed }) => [styles.lossButton, pressed && styles.pressed]}><MaterialCommunityIcons name="minus-circle-outline" size={20} color={ORANGE} /><Text style={styles.lossText}>Record Loss</Text></Pressable>
            <View style={styles.secondaryActions}><Pressable onPress={() => Alert.alert('Edit location', batch.location)} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}><MaterialCommunityIcons name="map-marker-outline" size={18} color={ORANGE} /><Text style={styles.secondaryText}>Edit Brooder / Location</Text></Pressable><Pressable onPress={() => Alert.alert('Close batch', `Close ${batch.id}?`)} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}><MaterialCommunityIcons name="close-circle-outline" size={18} color="#ef6b55" /><Text style={[styles.secondaryText, styles.closeText]}>Close Batch</Text></Pressable></View>
          </View>
        </View>
      </ScrollView>
      <LossModal visible={showLoss} batch={batch} currentChicks={currentChicks} onClose={() => setShowLoss(false)} onSave={(record) => { onSaveLoss(record); setShowLoss(false); }} />
      <MoveToGrowingModal visible={showGrowing} batch={batch} currentChicks={currentChicks} onClose={() => setShowGrowing(false)} onConfirm={(title) => { setShowGrowing(false); Alert.alert('Moved to Growing', `${title} (${batch.id}) is now in the growing stage.`); }} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#020709' }, pageWrap: { flexGrow: 1, alignItems: 'center', backgroundColor: '#020709' }, page: { width: '100%', maxWidth: 720 }, hero: { height: 248, overflow: 'hidden', backgroundColor: '#101719' }, heroCompact: { height: 228 }, heroSafe: { flex: 1 }, header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingTop: Platform.OS === 'web' ? 10 : 3 }, backButton: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(190,204,208,0.35)', backgroundColor: 'rgba(2,8,11,0.65)', alignItems: 'center', justifyContent: 'center' }, headerTitle: { color: '#f3f5f6', fontSize: 15, fontWeight: '800' }, heroCopy: { marginTop: 'auto', paddingHorizontal: 20, paddingBottom: 22 }, batchTitle: { color: '#fff', fontSize: 34, lineHeight: 40, fontWeight: '800', fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', web: 'Georgia' }) }, heroDetail: { marginTop: 4, color: '#c4cccf', fontSize: 12 },
  content: { padding: 16, paddingBottom: 30 }, contentCompact: { paddingHorizontal: 10 }, identityCard: { minHeight: 86, borderRadius: 7, borderWidth: 1, borderColor: '#23343b', backgroundColor: '#091317', padding: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }, overline: { color: '#718086', fontSize: 7, fontWeight: '800' }, currentCount: { marginTop: 5, color: '#fff', fontSize: 20, fontWeight: '800' }, ageText: { marginTop: 3, color: '#7c898e', fontSize: 9 }, statusPill: { minHeight: 24, maxWidth: 130, paddingHorizontal: 9, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 5 }, statusDot: { width: 5, height: 5, borderRadius: 3 }, statusText: { flexShrink: 1, fontSize: 8, fontWeight: '800' }, sectionTitle: { marginTop: 20, marginBottom: 8, color: '#e8edef', fontSize: 15, fontWeight: '800' },
  progressCard: { borderRadius: 7, borderWidth: 1, borderColor: '#26373e', backgroundColor: '#091317', overflow: 'hidden' }, progressMain: { minHeight: 176, flexDirection: 'row' }, progressVisual: { width: '35%', minWidth: 105, overflow: 'hidden', backgroundColor: '#101719' }, progressCopy: { flex: 1, minWidth: 0, padding: 14, justifyContent: 'center' }, progressAgeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }, progressAge: { color: '#fff', fontSize: 23, fontWeight: '800' }, stageChip: { minHeight: 23, maxWidth: 115, paddingHorizontal: 8, borderRadius: 12, backgroundColor: 'rgba(255,121,0,0.1)', justifyContent: 'center' }, stageChipText: { color: ORANGE, fontSize: 7, fontWeight: '800', textAlign: 'center' }, progressMessage: { marginTop: 5, color: '#8d9a9e', fontSize: 9 }, milestoneRow: { marginTop: 20, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }, milestoneLabel: { color: '#68767b', fontSize: 7 }, milestoneValue: { marginTop: 3, color: '#dfe5e7', fontSize: 10, fontWeight: '700' }, progressPercent: { color: ORANGE, fontSize: 10, fontWeight: '800' }, mainProgressTrack: { height: 5, marginTop: 9, borderRadius: 3, backgroundColor: '#1c2a30', overflow: 'hidden' }, mainProgressFill: { height: 5, borderRadius: 3, backgroundColor: ORANGE }, timeline: { minHeight: 92, borderTopWidth: 1, borderTopColor: '#1d2d33', flexDirection: 'row', alignItems: 'flex-start', paddingTop: 13, paddingHorizontal: 7, position: 'relative' }, timelineTrack: { position: 'absolute', top: 31, left: '12%', right: '12%', height: 2, backgroundColor: '#26363c' }, timelineItem: { flex: 1, minWidth: 0, alignItems: 'center' }, timelineItemPressed: { opacity: 0.68 }, timelineDot: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: '#34444a', backgroundColor: '#0d181c', alignItems: 'center', justifyContent: 'center' }, timelineDotComplete: { borderColor: '#8a4b0f', backgroundColor: '#17140f' }, timelineDotActive: { borderWidth: 2, borderColor: ORANGE, backgroundColor: '#21170e' }, timelineLabel: { minHeight: 20, marginTop: 6, color: '#748187', fontSize: 7, lineHeight: 9, textAlign: 'center' }, timelineLabelActive: { color: ORANGE, fontWeight: '800' },
  originStrip: { minHeight: 58, marginTop: 8, borderRadius: 7, borderWidth: 1, borderColor: '#1d2d33', backgroundColor: '#081216', flexDirection: 'row', alignItems: 'center' }, originItem: { flex: 1, minWidth: 0, alignItems: 'center', paddingHorizontal: 5 }, originDivider: { width: 1, height: 30, backgroundColor: '#213139' }, snapshotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, snapshotItem: { flex: 1, minWidth: 0, height: 94, borderRadius: 7, borderWidth: 1, borderColor: '#23343b', backgroundColor: '#091317', paddingHorizontal: 7, alignItems: 'center', justifyContent: 'center' }, snapshotItemCompact: { flexBasis: '48%', height: 86 }, snapshotValue: { width: '100%', marginTop: 7, color: '#eef2f3', fontSize: 13, fontWeight: '800', textAlign: 'center' }, snapshotLabel: { marginTop: 4, color: '#718086', fontSize: 7, textAlign: 'center' }, actionFocus: { minHeight: 86, borderRadius: 7, borderWidth: 1, borderColor: '#74410e', backgroundColor: 'rgba(255,121,0,0.06)', padding: 11, flexDirection: 'row', alignItems: 'center', gap: 10 }, actionFocusIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,121,0,0.1)', alignItems: 'center', justifyContent: 'center' }, actionFocusCopy: { flex: 1, minWidth: 0 }, actionFocusTitle: { color: '#f0f3f4', fontSize: 11, fontWeight: '800' }, actionFocusDetail: { marginTop: 4, color: '#8d9a9e', fontSize: 8, lineHeight: 12 }, actionFocusButton: { minWidth: 92, height: 38, borderRadius: 6, backgroundColor: ORANGE, paddingHorizontal: 10, alignItems: 'center', justifyContent: 'center' }, actionFocusButtonText: { color: '#fff', fontSize: 8, fontWeight: '800', textAlign: 'center' },
  infoCard: { borderRadius: 7, borderWidth: 1, borderColor: '#1d2d33', backgroundColor: '#091317', flexDirection: 'row', paddingVertical: 13 }, infoItem: { flex: 1, minWidth: 0, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 7 }, infoLabel: { color: '#68767b', fontSize: 7 }, infoValue: { marginTop: 3, color: '#e0e6e8', fontSize: 9, fontWeight: '700' }, sourceCard: { borderRadius: 7, borderWidth: 1, borderColor: '#1d2d33', backgroundColor: '#091317', paddingHorizontal: 11 }, sourceRow: { minHeight: 68, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 9 }, sourceDivider: { borderBottomWidth: 1, borderBottomColor: '#1b2a30' }, sourceIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,121,0,0.08)', alignItems: 'center', justifyContent: 'center' }, sourceCopy: { flex: 1, minWidth: 0 }, sourceName: { color: '#edf1f2', fontSize: 11, fontWeight: '800' }, sourceCross: { marginTop: 3, color: '#7b898e', fontSize: 8 }, marking: { marginTop: 3, color: '#d9a057', fontSize: 8 }, sourceChicks: { color: ORANGE, fontSize: 9, fontWeight: '800' },
  summaryCard: { minHeight: 88, borderRadius: 7, borderWidth: 1, borderColor: '#1d2d33', backgroundColor: '#091317', flexDirection: 'row', alignItems: 'center' }, summaryMetric: { flex: 1, minWidth: 0, alignItems: 'center', justifyContent: 'center' }, summaryDivider: { borderRightWidth: 1, borderRightColor: '#213139' }, summaryValue: { color: '#fff', fontSize: 20, fontWeight: '800' }, dangerValue: { color: '#ef7467' }, summaryLabel: { marginTop: 5, color: '#77858a', fontSize: 8, textAlign: 'center' }, growingButton: { height: 50, borderRadius: 7, backgroundColor: ORANGE, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }, growingText: { color: '#fff', fontSize: 11, fontWeight: '800' }, lossButton: { height: 48, marginTop: 8, borderRadius: 7, borderWidth: 1, borderColor: ORANGE, backgroundColor: 'rgba(255,121,0,0.08)', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 }, lossText: { color: ORANGE, fontSize: 10, fontWeight: '800' }, secondaryActions: { marginTop: 8, flexDirection: 'row', gap: 8 }, secondaryButton: { flex: 1, minHeight: 46, borderRadius: 7, borderWidth: 1, borderColor: '#27383f', backgroundColor: '#091317', paddingHorizontal: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }, secondaryText: { flexShrink: 1, color: '#d9e0e2', fontSize: 9, fontWeight: '700', textAlign: 'center' }, closeText: { color: '#ef6b55' }, pressed: { opacity: 0.74 },
  vaccineOverview: { minHeight: 62, borderRadius: 7, borderWidth: 1, borderColor: '#1d2d33', backgroundColor: '#091317', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' }, vaccineOverviewValue: { color: '#fff', fontSize: 17, fontWeight: '800', textAlign: 'center' }, vaccineAttention: { color: '#ef7568' }, vaccineOverviewLabel: { marginTop: 3, color: '#748287', fontSize: 8, textAlign: 'center' }, vaccineOverviewDivider: { width: 1, height: 34, backgroundColor: '#213139' }, nextVaccineCard: { marginTop: 8, borderRadius: 7, borderWidth: 1, borderColor: '#3f321d', backgroundColor: '#091317', padding: 12 }, nextVaccineTop: { flexDirection: 'row', alignItems: 'center', gap: 9 }, vaccineIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,121,0,0.09)', alignItems: 'center', justifyContent: 'center' }, nextVaccineCopy: { flex: 1, minWidth: 0 }, nextVaccineEyebrow: { color: '#748287', fontSize: 6, fontWeight: '800' }, nextVaccineName: { marginTop: 3, color: '#eef2f3', fontSize: 12, fontWeight: '800' }, vaccineStatus: { minHeight: 23, maxWidth: 90, paddingHorizontal: 8, borderRadius: 12, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 5 }, vaccineStatusText: { flexShrink: 1, fontSize: 7, fontWeight: '800' }, vaccineMeta: { marginTop: 11, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#1b2a30', flexDirection: 'row', gap: 50 }, nextVaccineNote: { marginTop: 9, color: '#7f8c91', fontSize: 8 }, completeVaccineButton: { height: 42, marginTop: 11, borderRadius: 6, backgroundColor: ORANGE, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }, completeVaccineText: { color: '#fff', fontSize: 9, fontWeight: '800' }, vaccinesComplete: { minHeight: 64, borderRadius: 7, borderWidth: 1, borderColor: '#265738', backgroundColor: 'rgba(35,110,63,0.12)', paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 10 }, vaccinesCompleteTitle: { color: '#dfe9e2', fontSize: 10, fontWeight: '800' }, vaccinesCompleteDetail: { marginTop: 3, color: '#789184', fontSize: 8 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.76)', alignItems: 'center', justifyContent: 'center', padding: 16 }, modalCard: { width: '100%', maxWidth: 440, borderRadius: 8, borderWidth: 1, borderColor: '#2a3b42', backgroundColor: '#081216', padding: 16 }, modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, modalEyebrow: { color: ORANGE, fontSize: 7, fontWeight: '800' }, modalTitle: { marginTop: 3, color: '#fff', fontSize: 20, fontWeight: '800' }, modalClose: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#111d21', alignItems: 'center', justifyContent: 'center' }, batchBand: { marginTop: 14, minHeight: 48, borderRadius: 6, backgroundColor: 'rgba(255,121,0,0.07)', paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, batchBandId: { color: ORANGE, fontSize: 11, fontWeight: '800' }, batchBandValue: { color: '#9da8ab', fontSize: 9 }, fieldLabel: { marginTop: 13, marginBottom: 5, color: '#cfd6d8', fontSize: 9, fontWeight: '700' }, optional: { color: '#6f7d82', fontWeight: '400' }, field: { height: 42, borderRadius: 6, borderWidth: 1, borderColor: '#293a41', backgroundColor: '#061014', paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 7 }, fieldInput: { flex: 1, height: 40, padding: 0, color: '#e7ebec', fontSize: 10, outlineStyle: 'none' }, noteInput: { height: 68, borderRadius: 6, borderWidth: 1, borderColor: '#293a41', backgroundColor: '#061014', padding: 10, color: '#e7ebec', fontSize: 10, textAlignVertical: 'top', outlineStyle: 'none' }, modalActions: { marginTop: 16, flexDirection: 'row', gap: 8 }, cancelButton: { flex: 1, height: 44, borderRadius: 6, borderWidth: 1, borderColor: '#2a3b42', alignItems: 'center', justifyContent: 'center' }, cancelText: { color: '#c8d0d2', fontSize: 10, fontWeight: '700' }, saveButton: { flex: 1, height: 44, borderRadius: 6, backgroundColor: ORANGE, alignItems: 'center', justifyContent: 'center' }, saveText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  transitionVisual: { height: 76, marginTop: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }, transitionIcon: { width: 54, height: 54, borderRadius: 27, borderWidth: 1, borderColor: '#70400f', backgroundColor: 'rgba(255,121,0,0.08)', alignItems: 'center', justifyContent: 'center' }, transitionIconActive: { backgroundColor: ORANGE }, transitionLine: { width: 56, height: 2, backgroundColor: '#5b3a1d', alignItems: 'center', justifyContent: 'center' }, transitionSummary: { minHeight: 68, marginTop: 8, borderRadius: 7, borderWidth: 1, borderColor: '#24353c', backgroundColor: '#061014', paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' }, transitionValue: { maxWidth: 110, marginTop: 4, color: '#e7ebec', fontSize: 9, fontWeight: '800', textAlign: 'center' }, transitionNote: { minHeight: 52, marginTop: 10, borderRadius: 7, backgroundColor: 'rgba(255,121,0,0.07)', paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center', gap: 8 }, transitionNoteText: { flex: 1, color: '#8e9b9f', fontSize: 8, lineHeight: 12 },
});

import { useMemo } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const ORANGE = '#ff7a00';

const SAMPLE_RECORDS = [
  {
    id: 'sample-treatment', type: 'Treatment', icon: 'bandage', title: 'Minor left leg wound',
    photo: 'https://fermer.ru/files/v2/forum/294244/lapa.jpg',
    bodyArea: 'Left lower leg', photoCaption: 'Condition before cleaning and antiseptic treatment.',
    findings: 'Small surface cut with mild swelling. Appetite and movement remain normal.',
    careGiven: 'Wound cleaned and antiseptic applied. Keep the pen dry and observe daily.',
    recordedDate: 'Aug 29, 2026', recordedBy: 'Maria Santos', severity: 'Monitor',
    followUp: true, followUpWhen: 'In 3 days', status: 'Under Care',
  },
  {
    id: 'sample-check', type: 'Health Check', icon: 'stethoscope', title: 'Monthly health check',
    findings: 'Weight, appetite, eyes, comb, feathers and movement checked. No concerns found.',
    careGiven: 'Routine observation only.', recordedDate: 'Aug 12, 2026',
    recordedBy: 'Maria Santos', severity: 'Routine', status: 'Completed',
  },
  {
    id: 'sample-vaccine', type: 'Vaccination', icon: 'needle', title: 'Newcastle booster',
    findings: 'Scheduled flock vaccination.', careGiven: 'Booster administered; no immediate reaction observed.',
    recordedDate: 'Jun 18, 2026', recordedBy: 'Dr. Carlo Reyes', severity: 'Routine', status: 'Completed',
  },
];

const ROUTINE_RECORD = {
  id: 'sample-routine', type: 'Health Check', icon: 'stethoscope', title: 'Routine health assessment',
  findings: 'Appetite, eyes, comb, feathers and movement checked. No concerns found.',
  careGiven: 'Routine observation only.', recordedDate: 'Aug 12, 2026',
  recordedBy: 'Maria Santos', severity: 'Routine', status: 'Completed',
};

const VACCINE_DUE_RECORD = {
  id: 'sample-vaccine-due', type: 'Vaccination', icon: 'needle', title: 'Newcastle booster due',
  findings: 'Booster is due based on the vaccination schedule.',
  careGiven: 'Not yet administered.', recordedDate: 'Sep 1, 2026', recordedBy: 'System reminder',
  severity: 'Monitor', needsAttention: true, followUp: true, followUpWhen: 'Due now', status: 'Due',
};

function birdKey(bird) { return bird?._recordKey || bird?.farmBuzzId || bird?.name; }

function HeaderButton({ icon, label, onPress }) {
  return <Pressable accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}><Ionicons name={icon} size={21} color="#eef1f2" /></Pressable>;
}

function Metric({ icon, value, label, isLast, compact, onPress }) {
  return <Pressable accessibilityRole={onPress ? 'button' : undefined} accessibilityLabel={onPress ? `Open ${label}` : undefined} disabled={!onPress} onPress={onPress} style={({ pressed }) => [styles.metric, compact && styles.metricCompact, !isLast && styles.metricDivider, pressed && onPress && styles.metricPressed]}><MaterialCommunityIcons name={icon} size={22} color={ORANGE} /><Text style={styles.metricValue}>{value}</Text><Text numberOfLines={2} style={styles.metricLabel}>{label}</Text></Pressable>;
}

function CareRow({ icon, label, value, note, onPress, isLast }) {
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.careRow, !isLast && styles.rowDivider, pressed && styles.rowPressed]}><View style={styles.careIcon}><MaterialCommunityIcons name={icon} size={22} color={ORANGE} /></View><View style={styles.careCopy}><Text style={styles.careLabel}>{label}</Text><Text numberOfLines={2} style={styles.careNote}>{note}</Text></View><Text style={styles.careValue}>{value}</Text><Ionicons name="chevron-forward" size={19} color="#899397" /></Pressable>;
}

function RecordRow({ record, onPress, isLast }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.recordRow, !isLast && styles.rowDivider, pressed && styles.rowPressed]}>
      <View style={styles.timelineRail}><View style={[styles.recordIcon, record.photo && styles.recordPhotoIcon]}>{record.photo ? <Image source={record.photo} style={styles.recordThumbnail} contentFit="cover" cachePolicy="memory-disk" /> : <MaterialCommunityIcons name={record.icon || 'clipboard-pulse-outline'} size={20} color={ORANGE} />}</View>{!isLast && <View style={styles.timelineLine} />}</View>
      <View style={styles.recordBody}>
        <View style={styles.recordHeading}><View style={styles.recordHeadingCopy}><Text style={styles.recordType}>{record.type}</Text><Text numberOfLines={2} style={styles.recordTitle}>{record.title}</Text></View><View style={styles.recordDateWrap}><Text style={styles.recordDate}>{record.recordedDate}</Text><Ionicons name="chevron-forward" size={16} color="#7f8a8e" /></View></View>
        <Text style={styles.recordMeta}>{record.recordedBy || 'Farm staff'} · {record.status || 'Recorded'}</Text>
      </View>
    </Pressable>
  );
}

export default function BirdHealthCareScreen({ bird, records = [], weightRecords = [], recordOverrides = {}, deletedRecordIds = [], onBack, onAddRecord, onOpenRecord, onOpenHealthRecords, onOpenTreatments, onOpenVaccinations, onOpenWeightHistory }) {
  const { width } = useWindowDimensions(); const compact = width < 480; const narrow = width < 380;
  const birdRecords = useMemo(() => {
    const key = birdKey(bird);
    const saved = records.filter((record) => record.birdId === key || record.name === bird?.name);
    const baseline = bird?.healthRecordsMode === 'empty' ? [] : bird?.name === 'Razor 014'
      ? SAMPLE_RECORDS
      : bird?.status === 'Needs Vaccine' ? [VACCINE_DUE_RECORD, ROUTINE_RECORD] : [ROUTINE_RECORD];
    return [...saved, ...baseline].filter((record) => !deletedRecordIds.includes(record.id)).map((record) => recordOverrides[record.id] || record);
  }, [bird, deletedRecordIds, recordOverrides, records]);
  if (!bird) return null;
  const activeRecords = birdRecords.filter((record) => record.followUp || record.needsAttention);
  const vaccinations = birdRecords.filter((record) => record.type === 'Vaccination').length;
  const noRecords = birdRecords.length === 0;
  const latestWeight = weightRecords[0]?.weight;
  const needsVaccine = bird.status === 'Needs Vaccine'; const needsCare = needsVaccine || activeRecords.length > 0;
  const healthStatus = noRecords ? 'No Records Yet' : needsVaccine ? 'Vaccination Due' : needsCare ? 'Under Observation' : 'Healthy';
  return (
    <View style={styles.screen}><StatusBar style="light" translucent backgroundColor="transparent" /><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.pageWrap}><View style={styles.page}>
      <View style={[styles.hero, compact && styles.heroCompact]}><Image source={bird.image} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="center" cachePolicy="memory-disk" /><LinearGradient colors={['rgba(2,7,9,0.18)', 'rgba(2,7,9,0.28)', '#03090c']} locations={[0, 0.48, 1]} style={StyleSheet.absoluteFill} /><SafeAreaView edges={['top']} style={styles.heroSafeArea}><View style={styles.heroHeader}><View style={styles.heroHeaderLeft}><HeaderButton icon="arrow-back" label="Back to bird profile" onPress={onBack} /><Text style={styles.screenTitle}>Health & Care</Text></View></View><View style={[styles.heroCopy, narrow && styles.heroCopyNarrow]}><Text numberOfLines={1} style={[styles.birdName, narrow && styles.birdNameNarrow]}>{bird.name}</Text><Text style={styles.birdMeta}>{bird.bloodline} · {bird.type}</Text><View style={styles.statusBadge}><View style={styles.statusDot} /><Text style={styles.statusText}>{healthStatus}</Text></View></View></SafeAreaView></View>
      <View style={[styles.content, narrow && styles.contentNarrow]}>
        {noRecords ? (
          <View style={styles.emptyPanel}><View style={styles.emptyIcon}><MaterialCommunityIcons name="clipboard-text-clock-outline" size={24} color={ORANGE} /></View><Text style={styles.emptyTitle}>Start this health record</Text><Text style={styles.emptyText}>Add the bird's first check, treatment, or vaccination.</Text><Pressable onPress={onAddRecord} style={({ pressed }) => [styles.firstRecordButton, pressed && styles.pressed]}><Ionicons name="add" size={19} color="#fff" /><Text style={styles.firstRecordText}>Add First Record</Text></Pressable></View>
        ) : (
          <>
            <View style={[styles.metrics, compact && styles.metricsCompact]}><Metric icon="clipboard-pulse-outline" value={String(birdRecords.length)} label="Records" compact={compact} onPress={onOpenHealthRecords} /><Metric icon="medical-bag" value={String(activeRecords.length)} label="Active Care" compact={compact} onPress={onOpenTreatments} /><Metric icon="needle" value={String(vaccinations)} label="Vaccinations" compact={compact} isLast /></View>
            <View style={styles.sectionHeading}><Text style={styles.sectionTitle}>Care Schedule</Text></View>
            <View style={styles.panel}><CareRow icon="calendar-check-outline" label="Next health check" note="Routine assessment" value="Sep 5" onPress={() => Alert.alert('Next health check', 'Scheduled for Sep 5, 2026.')} /><CareRow icon="needle" label="Vaccination" note="Newcastle booster" value={needsVaccine ? 'Due now' : 'Dec 18'} onPress={onOpenVaccinations} /><CareRow icon="weight-kilogram" label="Last weight" note={latestWeight ? 'Latest measurement' : 'No measurement'} value={latestWeight ? `${latestWeight.toFixed(2)} kg` : 'Not recorded'} onPress={onOpenWeightHistory} isLast /></View>
            <View style={styles.sectionHeading}><Text style={styles.sectionTitle}>Health History</Text><Text style={styles.recordCount}>{birdRecords.length} records</Text></View>
            <View style={styles.panel}>{birdRecords.map((record, index) => <RecordRow key={record.id} record={record} onPress={() => onOpenRecord(record)} isLast={index === birdRecords.length - 1} />)}</View>
            <Pressable onPress={onAddRecord} style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}><Ionicons name="add" size={23} color="#fff" /><Text style={styles.addButtonText}>Add Health Record</Text></Pressable>
          </>
        )}
      </View>
    </View></ScrollView></View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#020709' }, pageWrap: { flexGrow: 1, alignItems: 'center', backgroundColor: '#020709' }, page: { width: '100%', maxWidth: 720, backgroundColor: '#020709' },
  hero: { height: 330, overflow: 'hidden', backgroundColor: '#101719' }, heroCompact: { height: 300 }, heroSafeArea: { flex: 1 }, heroHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: Platform.OS === 'web' ? 10 : 3 }, heroHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 13 }, headerButton: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(190,204,208,0.35)', backgroundColor: 'rgba(2,8,11,0.65)', alignItems: 'center', justifyContent: 'center' }, screenTitle: { color: '#f1f3f4', fontSize: 18, fontWeight: '700' },
  heroCopy: { marginTop: 'auto', paddingHorizontal: 18, paddingBottom: 26 }, heroCopyNarrow: { paddingHorizontal: 11, paddingBottom: 20 }, birdName: { color: '#fff', fontSize: 34, lineHeight: 40, fontWeight: '800', textShadowColor: 'rgba(0,0,0,0.7)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 5 }, birdNameNarrow: { fontSize: 29, lineHeight: 34 }, birdMeta: { marginTop: 4, color: '#c1c8ca', fontSize: 13 }, statusBadge: { alignSelf: 'flex-start', minHeight: 31, marginTop: 12, paddingHorizontal: 11, borderWidth: 1, borderColor: '#765019', borderRadius: 16, backgroundColor: 'rgba(255,122,0,0.11)', flexDirection: 'row', alignItems: 'center', gap: 7 }, statusDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: ORANGE }, statusText: { color: '#ff9a36', fontSize: 10, fontWeight: '700' },
  content: { paddingHorizontal: 14, paddingTop: 14, paddingBottom: 34 }, contentNarrow: { paddingHorizontal: 9 }, overviewCard: { padding: 16, borderWidth: 1, borderColor: '#6b420f', borderRadius: 8, backgroundColor: '#0d1213' }, overviewHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 }, eyebrow: { color: ORANGE, fontSize: 8, fontWeight: '800' }, overviewTitle: { marginTop: 5, color: '#eef1f2', fontSize: 19, fontWeight: '800' }, overviewIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,122,0,0.1)', alignItems: 'center', justifyContent: 'center' }, overviewText: { maxWidth: 520, marginTop: 12, color: '#9ea8ab', fontSize: 11, lineHeight: 17 },
  metrics: { minHeight: 95, marginTop: 10, borderWidth: 1, borderColor: '#26343a', borderRadius: 8, backgroundColor: '#0a1317', flexDirection: 'row', overflow: 'hidden' }, metricsCompact: { minHeight: 88 }, metric: { flex: 1, minWidth: 0, paddingHorizontal: 8, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' }, metricCompact: { paddingHorizontal: 4, paddingVertical: 12 }, metricDivider: { borderRightWidth: 1, borderRightColor: '#223037' }, metricPressed: { backgroundColor: 'rgba(255,122,0,0.08)' }, metricValue: { marginTop: 5, color: '#f0f2f3', fontSize: 20, fontWeight: '800' }, metricLabel: { minHeight: 28, marginTop: 3, color: '#8f9a9e', fontSize: 9, lineHeight: 13, textAlign: 'center' },
  sectionHeading: { minHeight: 48, paddingTop: 18, paddingBottom: 8, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 10 }, sectionTitle: { color: '#e8ebec', fontSize: 15, fontWeight: '700' }, sectionSubtitle: { marginTop: 3, color: '#737f83', fontSize: 8 }, recordCount: { color: ORANGE, fontSize: 9, fontWeight: '700' }, panel: { borderWidth: 1, borderColor: '#26343a', borderRadius: 8, backgroundColor: '#0a1317', overflow: 'hidden' },
  careRow: { minHeight: 76, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 10 }, careIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,122,0,0.08)', alignItems: 'center', justifyContent: 'center' }, careCopy: { flex: 1, minWidth: 0 }, careLabel: { color: '#e3e7e8', fontSize: 12, fontWeight: '700' }, careNote: { marginTop: 4, color: '#818d90', fontSize: 9, lineHeight: 13 }, careValue: { maxWidth: 72, color: ORANGE, fontSize: 10, fontWeight: '700', textAlign: 'right' }, rowDivider: { borderBottomWidth: 1, borderBottomColor: '#223037' }, rowPressed: { backgroundColor: '#111d22' },
  recordRow: { minHeight: 96, paddingHorizontal: 12, paddingVertical: 13, flexDirection: 'row', gap: 10 }, timelineRail: { width: 42, alignItems: 'center' }, recordIcon: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: '#613b0c', backgroundColor: 'rgba(255,122,0,0.08)', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', zIndex: 2 }, recordPhotoIcon: { borderColor: ORANGE }, recordThumbnail: { width: '100%', height: '100%' }, timelineLine: { position: 'absolute', top: 40, bottom: -14, width: 1, backgroundColor: '#3c2b17' }, recordBody: { flex: 1, minWidth: 0 }, recordHeading: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }, recordHeadingCopy: { flex: 1, minWidth: 0 }, recordType: { color: ORANGE, fontSize: 8, fontWeight: '800', textTransform: 'uppercase' }, recordTitle: { marginTop: 4, color: '#e6eaeb', fontSize: 12, lineHeight: 17, fontWeight: '700' }, recordDateWrap: { flexDirection: 'row', alignItems: 'center', gap: 3 }, recordDate: { color: '#899599', fontSize: 8 }, recordMeta: { marginTop: 5, color: '#768286', fontSize: 8 }, recordDetails: { marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#223037' }, injuryPhotoSection: { marginBottom: 10 }, injuryPhotoHeading: { marginBottom: 7, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }, injuryPhoto: { width: '100%', aspectRatio: 1.7, borderRadius: 7, backgroundColor: '#111a1e' }, areaBadge: { minHeight: 25, paddingHorizontal: 8, borderWidth: 1, borderColor: '#65400e', borderRadius: 13, backgroundColor: 'rgba(255,122,0,0.08)', flexDirection: 'row', alignItems: 'center', gap: 4 }, areaBadgeText: { color: '#ff9a36', fontSize: 8, fontWeight: '700' }, photoCaption: { marginTop: 6, color: '#788488', fontSize: 8, lineHeight: 12 }, detailLabel: { color: ORANGE, fontSize: 7, fontWeight: '800' }, detailLabelSpaced: { marginTop: 10 }, detailText: { marginTop: 4, color: '#9aa5a8', fontSize: 9, lineHeight: 15 },
  emptyPanel: { minHeight: 220, padding: 20, borderWidth: 1, borderColor: '#26343a', borderRadius: 8, backgroundColor: '#0a1317', alignItems: 'center', justifyContent: 'center' },
  emptyIcon: { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(255,122,0,0.09)', alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { marginTop: 12, color: '#e6eaeb', fontSize: 14, fontWeight: '700' },
  emptyText: { maxWidth: 330, marginTop: 6, color: '#7e8a8e', fontSize: 9, lineHeight: 14, textAlign: 'center' },
  firstRecordButton: { height: 42, marginTop: 15, paddingHorizontal: 16, borderRadius: 8, backgroundColor: '#f66f00', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  firstRecordText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  addButton: { height: 52, marginTop: 14, borderRadius: 8, backgroundColor: '#f66f00', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 }, addButtonText: { color: '#fff', fontSize: 13, fontWeight: '700' }, pressed: { opacity: 0.72 },
});

import { useMemo, useState } from 'react';
import { Alert, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, Line, LinearGradient as SvgLinearGradient, Path, Stop, Text as SvgText } from 'react-native-svg';
import { PAIRINGS } from './BreedingScreen';

const ORANGE = '#ff7a00';

const BREEDING_HISTORY = [
  { id: 'BR-015', partner: 'Amber 021', date: 'Jan 8 - Mar 30, 2026', eggs: '14 eggs', hatched: '9 hatched' },
  { id: 'BR-009', partner: 'Pearl 017', date: 'Aug 12 - Oct 18, 2025', eggs: '10 eggs', hatched: '7 hatched' },
];

export const DEFAULT_EGG_RECORDS = [
  { id: 'egg-5', date: 'Sep 1, 2026', shortDate: 'Sep 1', count: 1, quality: 'Good', note: 'Clean shell', recordedBy: 'Maria Santos' },
  { id: 'egg-4', date: 'Aug 30, 2026', shortDate: 'Aug 30', count: 1, quality: 'Good', note: 'Normal size', recordedBy: 'Maria Santos' },
  { id: 'egg-3', date: 'Aug 29, 2026', shortDate: 'Aug 29', count: 1, quality: 'Good', note: 'Collected from Nest 2', recordedBy: 'Miguel Dela Cruz' },
  { id: 'egg-2', date: 'Aug 27, 2026', shortDate: 'Aug 27', count: 1, quality: 'Check', note: 'Small shell mark', recordedBy: 'Maria Santos' },
  { id: 'egg-1', date: 'Aug 26, 2026', shortDate: 'Aug 26', count: 1, quality: 'Good', note: 'Normal size', recordedBy: 'Maria Santos' },
];

const PRODUCTION_WEEKS = [
  { label: 'Aug 4', count: 3 }, { label: 'Aug 11', count: 4 }, { label: 'Aug 18', count: 4 }, { label: 'Aug 25', count: 5 }, { label: 'Sep 1', count: 5 },
];

function HeaderButton({ icon, label, onPress }) {
  return <Pressable accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}><Ionicons name={icon} size={21} color="#eef1f2" /></Pressable>;
}

function Metric({ icon, value, label, isLast, onPress }) {
  return <Pressable accessibilityRole={onPress ? 'button' : undefined} accessibilityLabel={onPress ? `Open ${label}` : undefined} disabled={!onPress} onPress={onPress} style={({ pressed }) => [styles.metric, !isLast && styles.metricDivider, pressed && onPress && styles.metricPressed]}><MaterialCommunityIcons name={icon} size={21} color={ORANGE} /><Text numberOfLines={1} style={styles.metricValue}>{value}</Text><Text numberOfLines={2} style={styles.metricLabel}>{label}</Text></Pressable>;
}

function ProductionTrend({ currentWeek }) {
  const [chartWidth, setChartWidth] = useState(600);
  const chartHeight = 210;
  const plotLeft = 36;
  const plotRight = chartWidth - 8;
  const plotTop = 25;
  const plotBottom = 165;
  const data = PRODUCTION_WEEKS.map((item, index) => index === PRODUCTION_WEEKS.length - 1 ? { ...item, count: currentWeek } : item);
  const maxValue = Math.max(7, ...data.map((item) => item.count));
  const points = data.map((item, index) => ({
    ...item,
    x: plotLeft + (index / (data.length - 1)) * (plotRight - plotLeft),
    y: plotTop + ((maxValue - item.count) / maxValue) * (plotBottom - plotTop),
  }));
  const linePath = points.map((point, index) => `${index ? 'L' : 'M'} ${point.x} ${point.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${plotBottom} L ${points[0].x} ${plotBottom} Z`;
  const ticks = [maxValue, Math.round(maxValue * 0.66), Math.round(maxValue * 0.33), 0];
  return (
    <View style={styles.trendChart} onLayout={(event) => {
      const nextWidth = Math.round(event.nativeEvent.layout.width);
      if (nextWidth > 0 && nextWidth !== chartWidth) setChartWidth(nextWidth);
    }}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="xMidYMid meet">
        <Defs><SvgLinearGradient id="eggArea" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor={ORANGE} stopOpacity="0.3" /><Stop offset="0.6" stopColor={ORANGE} stopOpacity="0.08" /><Stop offset="1" stopColor={ORANGE} stopOpacity="0" /></SvgLinearGradient></Defs>
        {ticks.map((tick, index) => { const y = plotTop + ((plotBottom - plotTop) / 3) * index; return <Line key={`${tick}-${index}`} x1={plotLeft} y1={y} x2={plotRight} y2={y} stroke="#26343a" strokeWidth="1" strokeDasharray="4 5" />; })}
        <Line x1={plotLeft} y1={plotTop} x2={plotLeft} y2={plotBottom} stroke="#526066" strokeWidth="1" />
        <Line x1={plotLeft} y1={plotBottom} x2={plotRight} y2={plotBottom} stroke="#526066" strokeWidth="1" />
        {ticks.map((tick, index) => { const y = plotTop + ((plotBottom - plotTop) / 3) * index; return <SvgText key={`axis-${tick}-${index}`} x={plotLeft - 7} y={y + 4} fill="#788589" fontSize="9" textAnchor="end">{tick}</SvgText>; })}
        <Path d={areaPath} fill="url(#eggArea)" />
        <Path d={linePath} fill="none" stroke={ORANGE} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" opacity="0.1" />
        <Path d={linePath} fill="none" stroke={ORANGE} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((point, index) => <Circle key={`halo-${point.label}`} cx={point.x} cy={point.y} r={index === points.length - 1 ? 12 : 9} fill={ORANGE} opacity="0.13" />)}
        {points.map((point) => <Circle key={`point-${point.label}`} cx={point.x} cy={point.y} r="6" fill="#0a1317" stroke={ORANGE} strokeWidth="3" />)}
        {points.map((point) => <Circle key={`center-${point.label}`} cx={point.x} cy={point.y} r="2.3" fill="#fff2e5" />)}
        {points.map((point, index) => <SvgText key={`value-${point.label}`} x={point.x} y={Math.max(13, point.y - 13)} fill={index === points.length - 1 ? '#ffad5f' : '#e3e7e8'} fontSize="10" fontWeight="700" textAnchor={index === 0 ? 'start' : index === points.length - 1 ? 'end' : 'middle'}>{point.count}</SvgText>)}
        {points.map((point, index) => <SvgText key={`label-${point.label}`} x={point.x} y="191" fill="#849094" fontSize="9" textAnchor={index === 0 ? 'start' : index === points.length - 1 ? 'end' : 'middle'}>{point.label}</SvgText>)}
      </Svg>
    </View>
  );
}

function CollectionRow({ record, isLast }) {
  return (
    <View style={[styles.collectionRow, !isLast && styles.rowDivider]}>
      <View style={styles.collectionIcon}><MaterialCommunityIcons name="egg-outline" size={22} color={ORANGE} /></View>
      <View style={styles.collectionCopy}><Text style={styles.collectionDate}>{record.date}</Text><Text numberOfLines={1} style={styles.collectionMeta}>{record.note || 'Egg collection'} - {record.recordedBy}</Text></View>
      <View style={styles.collectionAside}><Text style={styles.collectionCount}>{record.count} {record.count === 1 ? 'egg' : 'eggs'}</Text><View style={styles.qualityBadge}><Text style={styles.qualityText}>{record.quality}</Text></View></View>
    </View>
  );
}

function PairCard({ pairing, bird, onPress }) {
  const isMale = pairing.male === bird.name;
  const partner = isMale ? pairing.female : pairing.male;
  const partnerImage = isMale ? pairing.femaleImage : pairing.maleImage;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.pairCard, pressed && styles.rowPressed]}>
      <View style={styles.pairImages}><Image source={bird.image} style={styles.pairImage} contentFit="cover" cachePolicy="memory-disk" /><Image source={partnerImage} style={[styles.pairImage, styles.partnerImage]} contentFit="cover" cachePolicy="memory-disk" /></View>
      <View style={styles.pairCopy}><Text style={styles.pairEyebrow}>ACTIVE PAIRING - {pairing.id}</Text><Text numberOfLines={1} style={styles.pairTitle}>{bird.name} <Text style={styles.cross}>x</Text> {partner}</Text><Text style={styles.pairMeta}>{isMale ? 'Sire' : 'Dam'} - Started {pairing.started}</Text></View>
      <View style={styles.pairEggs}><MaterialCommunityIcons name="egg-outline" size={18} color={ORANGE} /><Text style={styles.pairEggValue}>{pairing.eggs}</Text></View><Ionicons name="chevron-forward" size={20} color="#8e999c" />
    </Pressable>
  );
}

function HistoryRow({ item, isLast }) {
  return <Pressable onPress={() => Alert.alert(item.id, `${item.partner}\n${item.eggs} - ${item.hatched}`)} style={({ pressed }) => [styles.historyRow, !isLast && styles.rowDivider, pressed && styles.rowPressed]}><View style={styles.historyIcon}><MaterialCommunityIcons name="link-variant" size={21} color={ORANGE} /></View><View style={styles.historyCopy}><Text style={styles.historyTitle}>{item.partner}</Text><Text style={styles.historyDate}>{item.id} - {item.date}</Text></View><View style={styles.historyResult}><Text style={styles.historyEggs}>{item.eggs}</Text><Text style={styles.historyHatched}>{item.hatched}</Text></View><Ionicons name="chevron-forward" size={19} color="#899397" /></Pressable>;
}

function EmptyPairing({ eligible, female }) {
  return <View style={styles.emptyState}><View style={styles.emptyIcon}><MaterialCommunityIcons name="link-variant-off" size={28} color={ORANGE} /></View><Text style={styles.emptyTitle}>No active pairing</Text><Text style={styles.emptyText}>{eligible ? `This ${female ? 'hen' : 'cock'} is not currently assigned to a breeding pair.` : 'This bird is not yet eligible for pairing.'}</Text></View>;
}

export default function BirdBreedingScreen({ bird, addedPairings = [], eggRecords = [], onEggRecordsChange, onBack, onOpenPairing, onOpenOffspring, onAddPairing }) {
  const { width } = useWindowDimensions();
  const compact = width < 480;
  const narrow = width < 380;
  const pairings = useMemo(() => [...addedPairings, ...PAIRINGS].filter((pairing) => pairing.male === bird?.name || pairing.female === bird?.name), [addedPairings, bird]);
  const [activeTab, setActiveTab] = useState('production');
  const [recordOpen, setRecordOpen] = useState(false);
  const [eggCount, setEggCount] = useState(1);
  const [quality, setQuality] = useState('Good');
  const [note, setNote] = useState('');
  if (!bird) return null;

  const female = bird.filter === 'hen' || bird.filter === 'pullet';
  const matureFemale = bird.filter === 'hen';
  const eligible = bird.filter === 'cock' || matureFemale;
  const role = matureFemale ? 'Dam' : bird.filter === 'cock' ? 'Sire' : bird.filter === 'pullet' ? 'Future Dam' : 'Future Sire';
  const pairEggs = pairings.reduce((total, pairing) => total + (Number.parseInt(pairing.eggs, 10) || 0), 0);
  const recordedLifetime = Number.parseInt(bird.details?.find((detail) => detail.icon === 'egg-outline')?.text, 10) || 0;
  const defaultTotal = bird.name === 'Ring #027' ? DEFAULT_EGG_RECORDS.reduce((total, record) => total + record.count, 0) : 0;
  const recentTotal = eggRecords.reduce((total, record) => total + record.count, 0);
  const addedTotal = Math.max(0, recentTotal - defaultTotal);
  const cycleEggs = matureFemale ? 12 + addedTotal : 0;
  const lifetimeEggs = recordedLifetime + addedTotal;
  const layingRate = Math.min(100, Math.round((recentTotal / 7) * 100));
  const completedHistory = bird.name === 'Razor 014' ? BREEDING_HISTORY : [];
  const hasPerformance = completedHistory.length > 0;
  const screenTitle = matureFemale ? 'Egg Production & Breeding' : female ? 'Egg Production' : 'Breeding Performance';

  const saveCollection = () => {
    const record = { id: `egg-${Date.now()}`, date: 'Sep 1, 2026', shortDate: 'Sep 1', count: eggCount, quality, note: note.trim() || 'Routine collection', recordedBy: 'JU Gamefarm Admin' };
    onEggRecordsChange?.([record, ...eggRecords]);
    setEggCount(1); setQuality('Good'); setNote(''); setRecordOpen(false);
    Alert.alert('Collection recorded', `${eggCount} ${eggCount === 1 ? 'egg was' : 'eggs were'} added to ${bird.name}'s production history.`);
  };

  const showProduction = female && (!matureFemale || activeTab === 'production');
  const showBreeding = !female || (matureFemale && activeTab === 'breeding');

  return (
    <View style={styles.screen}><StatusBar style="light" translucent backgroundColor="transparent" /><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.pageWrap}><View style={styles.page}>
      <View style={[styles.hero, compact && styles.heroCompact]}><Image source={bird.image} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="center" cachePolicy="memory-disk" /><LinearGradient colors={['rgba(2,7,9,0.16)', 'rgba(2,7,9,0.32)', '#03090c']} locations={[0, 0.48, 1]} style={StyleSheet.absoluteFill} /><SafeAreaView edges={['top']} style={styles.heroSafeArea}><View style={styles.heroHeader}><View style={styles.heroHeaderLeft}><HeaderButton icon="arrow-back" label="Back to bird profile" onPress={onBack} /><Text numberOfLines={1} style={[styles.screenTitle, narrow && styles.screenTitleNarrow]}>{screenTitle}</Text></View></View><View style={[styles.heroCopy, narrow && styles.heroCopyNarrow]}><Text numberOfLines={1} style={[styles.birdName, narrow && styles.birdNameNarrow]}>{bird.name}</Text><Text style={styles.birdMeta}>{bird.bloodline} - {bird.type}</Text><View style={styles.roleBadge}><MaterialCommunityIcons name={female ? 'gender-female' : 'gender-male'} size={15} color={ORANGE} /><Text style={styles.roleText}>{role}</Text></View></View></SafeAreaView></View>
      <View style={[styles.content, narrow && styles.contentNarrow]}>
        {matureFemale && <View style={styles.tabs}><Pressable onPress={() => setActiveTab('production')} style={[styles.tab, activeTab === 'production' && styles.tabActive]}><MaterialCommunityIcons name="egg-outline" size={18} color={activeTab === 'production' ? ORANGE : '#778387'} /><Text style={[styles.tabText, activeTab === 'production' && styles.tabTextActive]}>Production</Text></Pressable><Pressable onPress={() => setActiveTab('breeding')} style={[styles.tab, activeTab === 'breeding' && styles.tabActive]}><MaterialCommunityIcons name="link-variant" size={18} color={activeTab === 'breeding' ? ORANGE : '#778387'} /><Text style={[styles.tabText, activeTab === 'breeding' && styles.tabTextActive]}>Breeding</Text></Pressable></View>}
        {showProduction && matureFemale && <>
          <View style={styles.cyclePanel}><View style={styles.cycleTop}><View><Text style={styles.eyebrow}>CURRENT LAYING CYCLE</Text><View style={styles.cycleValueRow}><Text style={styles.cycleValue}>{cycleEggs}</Text><Text style={styles.cycleUnit}>eggs</Text></View><Text style={styles.cycleDate}>Started Aug 19, 2026</Text></View><View style={styles.cycleStatus}><View style={styles.cycleStatusDot} /><Text numberOfLines={1} style={styles.cycleStatusText}>{bird.status || 'Active'}</Text></View></View><View style={styles.cycleProgress}><View style={[styles.cycleProgressFill, { width: `${Math.min(100, Math.round((cycleEggs / 18) * 100))}%` }]} /></View><Text style={styles.cycleGoal}>{cycleEggs} of 18 egg cycle target</Text></View>
          <View style={styles.metrics}><Metric icon="egg-outline" value={String(recentTotal)} label="Last 7 Days" /><Metric icon="chart-line" value={`${layingRate}%`} label="Laying Rate" /><Metric icon="counter" value={String(lifetimeEggs)} label="Lifetime Eggs" isLast /></View>
          <View style={styles.sectionHeading}><View><Text style={styles.sectionTitle}>Production Trend</Text><Text style={styles.sectionSubtitle}>Eggs collected per week</Text></View><View style={styles.statusPill}><View style={styles.statusPillDot} /><Text style={styles.statusPillText}>On track</Text></View></View>
          <View style={styles.trendPanel}><ProductionTrend currentWeek={recentTotal} /><View style={styles.trendNote}><MaterialCommunityIcons name="information-outline" size={15} color={ORANGE} /><Text style={styles.trendNoteText}>Production is based on recorded collections for this hen.</Text></View></View>
          <View style={styles.sectionHeading}><View><Text style={styles.sectionTitle}>Recent Collections</Text><Text style={styles.sectionSubtitle}>Newest entries appear first</Text></View><Text style={styles.sectionCount}>{eggRecords.length} records</Text></View>
          {eggRecords.length ? <View style={styles.listPanel}>{eggRecords.slice(0, 5).map((record, index, visible) => <CollectionRow key={record.id} record={record} isLast={index === visible.length - 1} />)}</View> : <View style={styles.emptyState}><View style={styles.emptyIcon}><MaterialCommunityIcons name="egg-off-outline" size={28} color={ORANGE} /></View><Text style={styles.emptyTitle}>No collections recorded</Text><Text style={styles.emptyText}>Record the first egg collection for this hen.</Text></View>}
          <Pressable onPress={() => setRecordOpen(true)} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}><Ionicons name="add" size={22} color="#fff" /><Text style={styles.primaryButtonText}>Record Egg Collection</Text></Pressable>
        </>}
        {showProduction && !matureFemale && <><View style={styles.readinessPanel}><View style={styles.readinessIcon}><MaterialCommunityIcons name="egg-off-outline" size={31} color={ORANGE} /></View><Text style={styles.eyebrow}>LAYING READINESS</Text><Text style={styles.readinessTitle}>Waiting for first egg</Text><Text style={styles.readinessText}>Egg production tracking and breeding eligibility will begin when this pullet's first egg is recorded.</Text><View style={styles.readinessFacts}><Metric icon="egg-outline" value="0" label="Eggs Recorded" /><Metric icon="clock-outline" value="Pending" label="Laying Status" /><Metric icon="link-variant-off" value="0" label="Pairings" isLast /></View></View><Pressable onPress={() => setRecordOpen(true)} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}><MaterialCommunityIcons name="egg-outline" size={21} color="#fff" /><Text style={styles.primaryButtonText}>Record First Egg</Text></Pressable></>}
        {showBreeding && <>
          <View style={styles.metrics}><Metric icon="link-variant" value={String(pairings.length)} label="Active Pairings" /><Metric icon="egg-outline" value={String(pairEggs)} label="Eggs from Pairings" /><Metric icon="egg-easter" value={bird.name === 'Razor 014' ? '16' : '0'} label="Recorded Offspring" onPress={onOpenOffspring} isLast /></View>
          <View style={styles.performancePanel}><View style={styles.performanceHeader}><View><Text style={styles.eyebrow}>BREEDING PERFORMANCE</Text><Text style={styles.performanceTitle}>{eligible ? `${role} breeding record` : 'Future breeding record'}</Text></View><View style={styles.performanceScore}><Text style={styles.scoreValue}>{hasPerformance ? '71%' : '--'}</Text><Text style={styles.scoreLabel}>Hatch rate</Text></View></View><View style={styles.performanceTrack}><View style={[styles.performanceFill, { width: hasPerformance ? '71%' : '0%' }]} /></View><Text style={styles.performanceNote}>{eligible ? 'Calculated from recorded egg collections and completed hatches.' : `Performance will appear when this ${female ? 'pullet becomes a laying hen' : 'stag becomes breeding eligible'}.`}</Text></View>
          <View style={styles.sectionHeading}><Text style={styles.sectionTitle}>Active Pairings</Text><Text style={styles.sectionCount}>{pairings.length} active</Text></View>
          {pairings.length ? <View style={styles.listPanel}>{pairings.map((pairing) => <PairCard key={pairing.id} pairing={pairing} bird={bird} onPress={() => onOpenPairing(pairing)} />)}</View> : <EmptyPairing eligible={eligible} female={female} />}
          <View style={styles.sectionHeading}><Text style={styles.sectionTitle}>{female ? 'Pairing History' : 'Breeding History'}</Text><Text style={styles.sectionCount}>{completedHistory.length} completed</Text></View>
          {completedHistory.length ? <View style={styles.listPanel}>{completedHistory.map((item, index) => <HistoryRow key={item.id} item={item} isLast={index === completedHistory.length - 1} />)}</View> : <View style={styles.historyEmpty}><Text style={styles.historyEmptyText}>No completed breeding records yet.</Text></View>}
          <Pressable disabled={!eligible} onPress={onAddPairing} style={({ pressed }) => [styles.primaryButton, !eligible && styles.primaryButtonDisabled, pressed && eligible && styles.pressed]}><Ionicons name="add" size={22} color="#fff" /><Text style={styles.primaryButtonText}>{eligible ? 'Create New Pairing' : 'Not Yet Eligible'}</Text></Pressable>
        </>}
      </View>
    </View></ScrollView>
    <Modal visible={recordOpen} transparent animationType="fade" onRequestClose={() => setRecordOpen(false)}><Pressable style={styles.modalBackdrop} onPress={() => setRecordOpen(false)}><Pressable style={[styles.modalCard, compact && styles.modalCardCompact]} onPress={() => {}}><View style={styles.modalHandle} /><View style={styles.modalHeader}><View><Text style={styles.modalTitle}>{matureFemale ? 'Record Egg Collection' : 'Record First Egg'}</Text><Text style={styles.modalSubtitle}>Add a production entry for {bird.name}</Text></View><Pressable accessibilityLabel="Close" onPress={() => setRecordOpen(false)} style={styles.modalClose}><Ionicons name="close" size={20} color="#c7cdcf" /></Pressable></View><Text style={styles.inputLabel}>Number of eggs</Text><View style={styles.stepper}><Pressable accessibilityLabel="Decrease egg count" disabled={eggCount <= 1} onPress={() => setEggCount((count) => Math.max(1, count - 1))} style={styles.stepperButton}><Ionicons name="remove" size={20} color={eggCount <= 1 ? '#465257' : ORANGE} /></Pressable><View style={styles.stepperValue}><Text style={styles.stepperNumber}>{eggCount}</Text><Text style={styles.stepperUnit}>{eggCount === 1 ? 'egg' : 'eggs'}</Text></View><Pressable accessibilityLabel="Increase egg count" onPress={() => setEggCount((count) => Math.min(6, count + 1))} style={styles.stepperButton}><Ionicons name="add" size={20} color={ORANGE} /></Pressable></View><Text style={styles.inputLabel}>Condition</Text><View style={styles.qualityOptions}>{['Good', 'Check', 'Damaged'].map((option) => <Pressable key={option} onPress={() => setQuality(option)} style={[styles.qualityOption, quality === option && styles.qualityOptionActive]}><Text style={[styles.qualityOptionText, quality === option && styles.qualityOptionTextActive]}>{option}</Text></Pressable>)}</View><Text style={styles.inputLabel}>Note</Text><TextInput value={note} onChangeText={setNote} multiline placeholder="Shell condition, nest, or observation..." placeholderTextColor="#58656a" style={styles.noteInput} /><View style={styles.modalActions}><Pressable onPress={() => setRecordOpen(false)} style={styles.cancelButton}><Text style={styles.cancelText}>Cancel</Text></Pressable><Pressable onPress={saveCollection} style={({ pressed }) => [styles.saveButton, pressed && styles.pressed]}><MaterialCommunityIcons name="content-save-check-outline" size={19} color="#fff" /><Text style={styles.saveText}>Save Collection</Text></Pressable></View></Pressable></Pressable></Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#020709' }, pageWrap: { flexGrow: 1, alignItems: 'center', backgroundColor: '#020709' }, page: { width: '100%', maxWidth: 720, backgroundColor: '#020709' },
  hero: { height: 330, overflow: 'hidden', backgroundColor: '#101719' }, heroCompact: { height: 300 }, heroSafeArea: { flex: 1 }, heroHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: Platform.OS === 'web' ? 10 : 3 }, heroHeaderLeft: { flex: 1, minWidth: 0, marginRight: 8, flexDirection: 'row', alignItems: 'center', gap: 12 }, headerButton: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(190,204,208,0.35)', backgroundColor: 'rgba(2,8,11,0.65)', alignItems: 'center', justifyContent: 'center' }, screenTitle: { flexShrink: 1, color: '#f1f3f4', fontSize: 17, fontWeight: '700' }, screenTitleNarrow: { fontSize: 14 }, heroCopy: { marginTop: 'auto', paddingHorizontal: 18, paddingBottom: 26 }, heroCopyNarrow: { paddingHorizontal: 11, paddingBottom: 20 }, birdName: { color: '#fff', fontSize: 34, lineHeight: 40, fontWeight: '800', textShadowColor: 'rgba(0,0,0,0.72)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 5 }, birdNameNarrow: { fontSize: 29, lineHeight: 34 }, birdMeta: { marginTop: 4, color: '#c1c8ca', fontSize: 13 }, roleBadge: { alignSelf: 'flex-start', minHeight: 31, marginTop: 12, paddingHorizontal: 11, borderWidth: 1, borderColor: '#765019', borderRadius: 16, backgroundColor: 'rgba(255,122,0,0.11)', flexDirection: 'row', alignItems: 'center', gap: 6 }, roleText: { color: '#ff9a36', fontSize: 10, fontWeight: '700' },
  content: { paddingHorizontal: 14, paddingTop: 14, paddingBottom: 34 }, contentNarrow: { paddingHorizontal: 9 }, tabs: { height: 48, marginBottom: 10, padding: 4, borderWidth: 1, borderColor: '#28363c', borderRadius: 8, backgroundColor: '#081115', flexDirection: 'row', gap: 4 }, tab: { flex: 1, borderRadius: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 }, tabActive: { borderWidth: 1, borderColor: '#64400e', backgroundColor: 'rgba(255,122,0,0.08)' }, tabText: { color: '#7d898d', fontSize: 10, fontWeight: '700' }, tabTextActive: { color: ORANGE },
  cyclePanel: { padding: 15, borderWidth: 1, borderColor: '#67410e', borderRadius: 8, backgroundColor: '#0b1316' }, cycleTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }, eyebrow: { color: ORANGE, fontSize: 8, fontWeight: '800' }, cycleValueRow: { marginTop: 3, flexDirection: 'row', alignItems: 'baseline', gap: 6 }, cycleValue: { color: '#f3f5f5', fontSize: 34, lineHeight: 41, fontWeight: '800' }, cycleUnit: { color: '#a0aaad', fontSize: 13, fontWeight: '700' }, cycleDate: { color: '#788488', fontSize: 8 }, cycleStatus: { maxWidth: 104, minHeight: 28, paddingHorizontal: 9, borderWidth: 1, borderColor: '#67410e', borderRadius: 14, flexDirection: 'row', alignItems: 'center', gap: 6 }, cycleStatusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: ORANGE }, cycleStatusText: { flexShrink: 1, color: '#e4a054', fontSize: 7, fontWeight: '700' }, cycleProgress: { height: 6, marginTop: 14, borderRadius: 3, backgroundColor: '#202c31', overflow: 'hidden' }, cycleProgressFill: { height: '100%', borderRadius: 3, backgroundColor: ORANGE }, cycleGoal: { marginTop: 7, color: '#788488', fontSize: 8 },
  metrics: { minHeight: 94, marginTop: 10, borderWidth: 1, borderColor: '#26343a', borderRadius: 8, backgroundColor: '#0a1317', flexDirection: 'row', overflow: 'hidden' }, metric: { flex: 1, minWidth: 0, paddingHorizontal: 5, paddingVertical: 13, alignItems: 'center', justifyContent: 'center' }, metricDivider: { borderRightWidth: 1, borderRightColor: '#223037' }, metricPressed: { backgroundColor: 'rgba(255,122,0,0.08)' }, metricValue: { marginTop: 5, color: '#f0f2f3', fontSize: 18, fontWeight: '800' }, metricLabel: { minHeight: 27, marginTop: 3, color: '#8f9a9e', fontSize: 8, lineHeight: 12, textAlign: 'center' },
  sectionHeading: { minHeight: 54, paddingTop: 18, paddingBottom: 8, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 10 }, sectionTitle: { color: '#e8ebec', fontSize: 15, fontWeight: '700' }, sectionSubtitle: { marginTop: 3, color: '#737f83', fontSize: 8 }, sectionCount: { color: ORANGE, fontSize: 9, fontWeight: '700' }, statusPill: { height: 25, paddingHorizontal: 8, borderWidth: 1, borderColor: '#65400e', borderRadius: 13, flexDirection: 'row', alignItems: 'center', gap: 5 }, statusPillDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: ORANGE }, statusPillText: { color: '#e29b48', fontSize: 7, fontWeight: '700' },
  trendPanel: { paddingHorizontal: 8, paddingTop: 8, paddingBottom: 10, borderWidth: 1, borderColor: '#2d3b41', borderRadius: 8, backgroundColor: '#0a1317', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 6 }, trendChart: { width: '100%', height: 210 }, trendNote: { minHeight: 38, paddingHorizontal: 9, borderRadius: 6, backgroundColor: 'rgba(255,122,0,0.055)', flexDirection: 'row', alignItems: 'center', gap: 7 }, trendNoteText: { flex: 1, color: '#879397', fontSize: 8 },
  listPanel: { borderWidth: 1, borderColor: '#26343a', borderRadius: 8, backgroundColor: '#0a1317', overflow: 'hidden' }, rowDivider: { borderBottomWidth: 1, borderBottomColor: '#223037' }, collectionRow: { minHeight: 76, paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center', gap: 10 }, collectionIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,122,0,0.08)', alignItems: 'center', justifyContent: 'center' }, collectionCopy: { flex: 1, minWidth: 0 }, collectionDate: { color: '#e2e6e7', fontSize: 11, fontWeight: '700' }, collectionMeta: { marginTop: 4, color: '#788488', fontSize: 8 }, collectionAside: { alignItems: 'flex-end', gap: 4 }, collectionCount: { color: '#eef1f2', fontSize: 10, fontWeight: '800' }, qualityBadge: { height: 20, paddingHorizontal: 7, borderWidth: 1, borderColor: '#65400e', borderRadius: 10, alignItems: 'center', justifyContent: 'center' }, qualityText: { color: ORANGE, fontSize: 7, fontWeight: '700' },
  performancePanel: { marginTop: 10, padding: 15, borderWidth: 1, borderColor: '#5f3b10', borderRadius: 8, backgroundColor: '#0d1213' }, performanceHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }, performanceTitle: { marginTop: 5, color: '#e8ebec', fontSize: 15, fontWeight: '700' }, performanceScore: { alignItems: 'flex-end' }, scoreValue: { color: ORANGE, fontSize: 22, fontWeight: '800' }, scoreLabel: { marginTop: 2, color: '#7f8a8e', fontSize: 8 }, performanceTrack: { height: 6, marginTop: 14, borderRadius: 3, backgroundColor: '#1e2a2f', overflow: 'hidden' }, performanceFill: { height: '100%', borderRadius: 3, backgroundColor: ORANGE }, performanceNote: { marginTop: 9, color: '#808b8f', fontSize: 8, lineHeight: 13 },
  pairCard: { minHeight: 92, paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center', gap: 9 }, pairImages: { width: 67, flexDirection: 'row' }, pairImage: { width: 46, height: 46, borderRadius: 23, borderWidth: 2, borderColor: '#6b420f', backgroundColor: '#111a1e', zIndex: 2 }, partnerImage: { marginLeft: -24, zIndex: 1 }, pairCopy: { flex: 1, minWidth: 0 }, pairEyebrow: { color: ORANGE, fontSize: 7, fontWeight: '800' }, pairTitle: { marginTop: 5, color: '#e6eaeb', fontSize: 12, fontWeight: '700' }, cross: { color: ORANGE }, pairMeta: { marginTop: 4, color: '#7e8a8e', fontSize: 8 }, pairEggs: { alignItems: 'center', gap: 2 }, pairEggValue: { color: '#aeb7ba', fontSize: 8 }, rowPressed: { backgroundColor: '#111d22' }, historyRow: { minHeight: 76, paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center', gap: 10 }, historyIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,122,0,0.08)', alignItems: 'center', justifyContent: 'center' }, historyCopy: { flex: 1, minWidth: 0 }, historyTitle: { color: '#e1e6e7', fontSize: 11, fontWeight: '700' }, historyDate: { marginTop: 4, color: '#788488', fontSize: 8 }, historyResult: { alignItems: 'flex-end' }, historyEggs: { color: '#c4cbcd', fontSize: 9, fontWeight: '700' }, historyHatched: { marginTop: 3, color: ORANGE, fontSize: 8 },
  emptyState: { minHeight: 140, padding: 20, borderWidth: 1, borderColor: '#26343a', borderRadius: 8, backgroundColor: '#0a1317', alignItems: 'center', justifyContent: 'center' }, emptyIcon: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,122,0,0.08)', alignItems: 'center', justifyContent: 'center' }, emptyTitle: { marginTop: 10, color: '#dce1e2', fontSize: 12, fontWeight: '700' }, emptyText: { maxWidth: 300, marginTop: 5, color: '#7d898d', fontSize: 9, lineHeight: 14, textAlign: 'center' }, historyEmpty: { height: 70, borderWidth: 1, borderColor: '#26343a', borderRadius: 8, backgroundColor: '#0a1317', alignItems: 'center', justifyContent: 'center' }, historyEmptyText: { color: '#7f8a8e', fontSize: 10 },
  readinessPanel: { minHeight: 330, padding: 18, borderWidth: 1, borderColor: '#5b3a11', borderRadius: 8, backgroundColor: '#0a1317', alignItems: 'center', justifyContent: 'center' }, readinessIcon: { width: 68, height: 68, marginBottom: 12, borderRadius: 34, backgroundColor: 'rgba(255,122,0,0.08)', alignItems: 'center', justifyContent: 'center' }, readinessTitle: { marginTop: 5, color: '#e9eced', fontSize: 19, fontWeight: '800' }, readinessText: { maxWidth: 350, marginTop: 8, color: '#849094', fontSize: 10, lineHeight: 16, textAlign: 'center' }, readinessFacts: { width: '100%', minHeight: 90, marginTop: 22, borderTopWidth: 1, borderTopColor: '#26343a', flexDirection: 'row' },
  primaryButton: { height: 52, marginTop: 14, borderRadius: 8, backgroundColor: '#f66f00', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 }, primaryButtonDisabled: { backgroundColor: '#343b3e', opacity: 0.7 }, primaryButtonText: { color: '#fff', fontSize: 13, fontWeight: '700' }, pressed: { opacity: 0.72 },
  modalBackdrop: { flex: 1, padding: 18, backgroundColor: 'rgba(0,0,0,0.78)', alignItems: 'center', justifyContent: 'center' }, modalCard: { width: '100%', maxWidth: 520, padding: 14, borderWidth: 1, borderColor: '#344249', borderRadius: 8, backgroundColor: '#081115' }, modalCardCompact: { padding: 11 }, modalHandle: { alignSelf: 'center', width: 40, height: 4, marginBottom: 12, borderRadius: 2, backgroundColor: '#3b474c' }, modalHeader: { marginBottom: 15, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }, modalTitle: { color: '#edf0f1', fontSize: 18, fontWeight: '800' }, modalSubtitle: { marginTop: 4, color: '#7f8b8f', fontSize: 9 }, modalClose: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#142025', alignItems: 'center', justifyContent: 'center' }, inputLabel: { marginTop: 4, marginBottom: 7, color: '#aab4b7', fontSize: 9, fontWeight: '700' }, stepper: { height: 64, marginBottom: 13, borderWidth: 1, borderColor: '#344249', borderRadius: 7, flexDirection: 'row', alignItems: 'center' }, stepperButton: { width: 58, height: '100%', alignItems: 'center', justifyContent: 'center' }, stepperValue: { flex: 1, alignItems: 'center', justifyContent: 'center' }, stepperNumber: { color: '#edf0f1', fontSize: 22, fontWeight: '800' }, stepperUnit: { color: '#788488', fontSize: 8 }, qualityOptions: { marginBottom: 13, flexDirection: 'row', gap: 7 }, qualityOption: { flex: 1, height: 40, borderWidth: 1, borderColor: '#344249', borderRadius: 7, alignItems: 'center', justifyContent: 'center' }, qualityOptionActive: { borderColor: ORANGE, backgroundColor: 'rgba(255,122,0,0.08)' }, qualityOptionText: { color: '#869296', fontSize: 9, fontWeight: '700' }, qualityOptionTextActive: { color: ORANGE }, noteInput: { minHeight: 78, padding: 10, borderWidth: 1, borderColor: '#344249', borderRadius: 7, color: '#edf0f1', fontSize: 10, textAlignVertical: 'top', outlineStyle: 'none' }, modalActions: { marginTop: 14, flexDirection: 'row', gap: 8 }, cancelButton: { flex: 0.8, height: 48, borderWidth: 1, borderColor: '#334147', borderRadius: 7, alignItems: 'center', justifyContent: 'center' }, cancelText: { color: '#b9c1c3', fontSize: 11, fontWeight: '700' }, saveButton: { flex: 1.2, height: 48, borderRadius: 7, backgroundColor: '#f66f00', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }, saveText: { color: '#fff', fontSize: 11, fontWeight: '800' },
});

import { useMemo, useState } from 'react';
import { Alert, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, Line, LinearGradient as SvgLinearGradient, Path, Stop, Text as SvgText } from 'react-native-svg';

const ORANGE = '#ff7a00';

export const DEFAULT_WEIGHT_RECORDS = [
  { id: 'weight-5', weight: 2.8, date: 'Sep 1, 2026', shortDate: 'Sep 1', note: 'Routine health check', recordedBy: 'Maria Santos' },
  { id: 'weight-4', weight: 2.72, date: 'Aug 12, 2026', shortDate: 'Aug 12', note: 'Monthly measurement', recordedBy: 'Maria Santos' },
  { id: 'weight-3', weight: 2.65, date: 'Jul 18, 2026', shortDate: 'Jul 18', note: 'Breeding condition check', recordedBy: 'Miguel Dela Cruz' },
  { id: 'weight-2', weight: 2.58, date: 'Jun 20, 2026', shortDate: 'Jun 20', note: 'Routine measurement', recordedBy: 'Miguel Dela Cruz' },
  { id: 'weight-1', weight: 2.5, date: 'May 16, 2026', shortDate: 'May 16', note: 'Baseline measurement', recordedBy: 'Maria Santos' },
];

function HeaderButton({ icon, label, onPress }) {
  return <Pressable accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}><Ionicons name={icon} size={21} color="#eef1f2" /></Pressable>;
}

function Metric({ icon, label, value, note, isLast }) {
  return (
    <View style={[styles.metric, !isLast && styles.metricDivider]}>
      <MaterialCommunityIcons name={icon} size={21} color={ORANGE} />
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text numberOfLines={1} style={styles.metricNote}>{note}</Text>
    </View>
  );
}

function WeightRow({ record, previous, isLast }) {
  const change = previous ? record.weight - previous.weight : 0;
  const changeText = change === 0 ? 'Baseline' : `${change > 0 ? '+' : ''}${change.toFixed(2)} kg`;
  return (
    <View style={[styles.historyRow, !isLast && styles.rowDivider]}>
      <View style={styles.historyIcon}><MaterialCommunityIcons name="weight-kilogram" size={21} color={ORANGE} /></View>
      <View style={styles.historyCopy}>
        <Text style={styles.historyDate}>{record.date}</Text>
        <Text numberOfLines={2} style={styles.historyNote}>{record.note || 'Weight measurement'}</Text>
        <Text style={styles.historyBy}>Recorded by {record.recordedBy || 'Farm staff'}</Text>
      </View>
      <View style={styles.historyValueWrap}>
        <Text style={styles.historyValue}>{record.weight.toFixed(2)} kg</Text>
        <Text style={[styles.historyChange, change < 0 && styles.historyChangeDown]}>{changeText}</Text>
      </View>
    </View>
  );
}

function TrendLineGraph({ records, minValue, maxValue }) {
  const [chartWidth, setChartWidth] = useState(600);
  const chartHeight = 220;
  const plotLeft = 38;
  const plotRight = chartWidth - 7;
  const plotTop = 25;
  const plotBottom = 178;
  const usableWidth = plotRight - plotLeft;
  const range = Math.max(maxValue - minValue, 0.2);
  const points = records.map((record, index) => ({
    ...record,
    x: plotLeft + (records.length === 1 ? usableWidth / 2 : (index / (records.length - 1)) * usableWidth),
    y: plotTop + ((maxValue - record.weight) / range) * (plotBottom - plotTop),
  }));
  const ticks = Array.from({ length: 5 }, (_, index) => maxValue - (range / 4) * index);
  const linePath = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
  const areaPath = points.length ? `${linePath} L ${points[points.length - 1].x} ${plotBottom} L ${points[0].x} ${plotBottom} Z` : '';

  return (
    <View style={styles.svgChartWrap} onLayout={(event) => {
      const nextWidth = Math.round(event.nativeEvent.layout.width);
      if (nextWidth > 0 && nextWidth !== chartWidth) setChartWidth(nextWidth);
    }}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="xMidYMid meet">
        <Defs>
          <SvgLinearGradient id="areaShadow" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={ORANGE} stopOpacity="0.28" />
            <Stop offset="0.55" stopColor={ORANGE} stopOpacity="0.1" />
            <Stop offset="1" stopColor={ORANGE} stopOpacity="0" />
          </SvgLinearGradient>
          <SvgLinearGradient id="lineColor" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#ff8e22" />
            <Stop offset="1" stopColor="#ff6700" />
          </SvgLinearGradient>
        </Defs>

        {ticks.map((tick, index) => {
          const y = plotTop + ((plotBottom - plotTop) / 4) * index;
          return <Line key={tick.toFixed(3)} x1={plotLeft} y1={y} x2={plotRight} y2={y} stroke="#26343a" strokeWidth="1" strokeDasharray="4 5" />;
        })}
        <Line x1={plotLeft} y1={plotTop} x2={plotLeft} y2={plotBottom} stroke="#526066" strokeWidth="1.2" />
        <Line x1={plotLeft} y1={plotBottom} x2={plotRight} y2={plotBottom} stroke="#526066" strokeWidth="1.2" />

        {ticks.map((tick, index) => {
          const y = plotTop + ((plotBottom - plotTop) / 4) * index;
          return <SvgText key={`axis-${tick.toFixed(3)}`} x={plotLeft - 9} y={y + 4} fill="#7f8b90" fontSize="10" textAnchor="end">{tick.toFixed(2)}</SvgText>;
        })}

        {areaPath && <Path d={areaPath} fill="url(#areaShadow)" />}
        {linePath && <Path d={linePath} fill="none" stroke={ORANGE} strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" opacity="0.1" />}
        {linePath && <Path d={linePath} fill="none" stroke={ORANGE} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" opacity="0.13" />}
        {linePath && <Path d={linePath} fill="none" stroke="url(#lineColor)" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />}

        {points.map((point, index) => {
          const latest = index === points.length - 1;
          return <Circle key={`halo-${point.id}`} cx={point.x} cy={point.y} r={latest ? 13 : 11} fill={ORANGE} opacity={latest ? 0.16 : 0.1} />;
        })}
        {points.map((point, index) => {
          const latest = index === points.length - 1;
          return <Circle key={`point-${point.id}`} cx={point.x} cy={point.y} r={latest ? 7 : 6.5} fill="#0a1317" stroke={latest ? '#ff9d43' : ORANGE} strokeWidth="3" />;
        })}
        {points.map((point) => <Circle key={`center-${point.id}`} cx={point.x} cy={point.y} r="2.5" fill="#fff1e4" />)}
        {points.map((point, index) => <SvgText key={`value-${point.id}`} x={point.x} y={Math.max(13, point.y - 14)} fill={index === points.length - 1 ? '#ffb268' : '#e4e8e9'} fontSize="11" fontWeight="700" textAnchor={index === 0 ? 'start' : index === points.length - 1 ? 'end' : 'middle'}>{point.weight.toFixed(2)} kg</SvgText>)}
        {points.map((point, index) => <SvgText key={`date-${point.id}`} x={point.x} y={202} fill="#899599" fontSize="10" textAnchor={index === 0 ? 'start' : index === points.length - 1 ? 'end' : 'middle'}>{point.shortDate}</SvgText>)}
      </Svg>
    </View>
  );
}

export default function WeightHistoryScreen({ bird, records = DEFAULT_WEIGHT_RECORDS, onRecordsChange, onBack }) {
  const { width } = useWindowDimensions();
  const compact = width < 480;
  const narrow = width < 380;
  const [addOpen, setAddOpen] = useState(false);
  const [weight, setWeight] = useState('');
  const [note, setNote] = useState('');
  const sorted = useMemo(() => [...records], [records]);
  const current = sorted[0] || DEFAULT_WEIGHT_RECORDS[0];
  const previous = sorted[1];
  const change = previous ? current.weight - previous.weight : 0;
  const chartRecords = [...sorted].reverse().slice(-6);
  const values = chartRecords.map((item) => item.weight);
  const minWeight = Math.floor((Math.min(...values) - 0.15) * 10) / 10;
  const maxWeight = Math.ceil((Math.max(...values) + 0.15) * 10) / 10;

  const saveWeight = () => {
    const parsed = Number.parseFloat(weight);
    if (!Number.isFinite(parsed) || parsed <= 0 || parsed > 10) {
      Alert.alert('Check the weight', 'Enter a valid weight between 0 and 10 kg.');
      return;
    }
    const newRecord = {
      id: `weight-${Date.now()}`,
      weight: parsed,
      date: 'Sep 1, 2026',
      shortDate: 'Sep 1',
      note: note.trim() || 'Weight measurement',
      recordedBy: 'JU Gamefarm Admin',
    };
    onRecordsChange?.([newRecord, ...records]);
    setWeight('');
    setNote('');
    setAddOpen(false);
    Alert.alert('Weight recorded', `${bird.name} now weighs ${parsed.toFixed(2)} kg.`);
  };

  if (!bird) return null;

  return (
    <View style={styles.screen}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.pageWrap}>
        <View style={styles.page}>
          <View style={[styles.hero, compact && styles.heroCompact]}>
            <Image source={bird.image} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="center" cachePolicy="memory-disk" />
            <LinearGradient colors={['rgba(2,7,9,0.2)', 'rgba(2,7,9,0.42)', '#03090c']} locations={[0, 0.5, 1]} style={StyleSheet.absoluteFill} />
            <SafeAreaView edges={['top']} style={styles.heroSafeArea}>
              <View style={styles.heroHeader}><View style={styles.heroHeaderLeft}><HeaderButton icon="arrow-back" label="Back to bird health" onPress={onBack} /><Text style={styles.screenTitle}>Weight History</Text></View><HeaderButton icon="ellipsis-horizontal" label="Weight options" onPress={() => Alert.alert('Weight records', 'Measurements are shown from newest to oldest.')} /></View>
              <View style={[styles.heroCopy, narrow && styles.heroCopyNarrow]}><Text style={styles.birdName}>{bird.name}</Text><Text style={styles.birdMeta}>{bird.bloodline} - {bird.type}</Text></View>
            </SafeAreaView>
          </View>

          <View style={[styles.content, narrow && styles.contentNarrow]}>
            <View style={styles.currentCard}>
              <View><Text style={styles.eyebrow}>CURRENT WEIGHT</Text><View style={styles.currentValueRow}><Text style={styles.currentValue}>{current.weight.toFixed(2)}</Text><Text style={styles.currentUnit}>kg</Text></View><Text style={styles.currentDate}>Recorded {current.date}</Text></View>
              <View style={styles.changeBadge}><MaterialCommunityIcons name={change >= 0 ? 'trending-up' : 'trending-down'} size={18} color={ORANGE} /><Text style={styles.changeValue}>{change >= 0 ? '+' : ''}{change.toFixed(2)} kg</Text><Text style={styles.changeLabel}>since last record</Text></View>
            </View>

            <View style={styles.metrics}><Metric icon="calendar-clock" value={`${sorted.length}`} label="Measurements" note="Recorded entries" /><Metric icon="chart-line" value={`${change >= 0 ? '+' : ''}${change.toFixed(2)} kg`} label="Latest Change" note="From previous" /><Metric icon="scale-balance" value="2.5-3.1 kg" label="Reference Range" note="Adult cock" isLast /></View>

            <View style={styles.sectionHeading}><View><Text style={styles.sectionTitle}>Weight Trend</Text><Text style={styles.sectionSubtitle}>Recent measurements in kilograms</Text></View><View style={styles.stableBadge}><View style={styles.stableDot} /><Text style={styles.stableText}>Stable</Text></View></View>
            <View style={styles.chartCard}>
              <TrendLineGraph records={chartRecords} minValue={minWeight} maxValue={maxWeight} />
              <View style={styles.rangeNote}><MaterialCommunityIcons name="information-outline" size={15} color={ORANGE} /><Text style={styles.rangeText}>Use the trend alongside appetite, activity, and health observations.</Text></View>
            </View>

            <View style={styles.sectionHeading}><View><Text style={styles.sectionTitle}>Measurement History</Text><Text style={styles.sectionSubtitle}>Newest records appear first</Text></View><Text style={styles.recordCount}>{sorted.length} records</Text></View>
            <View style={styles.historyPanel}>{sorted.map((record, index) => <WeightRow key={record.id} record={record} previous={sorted[index + 1]} isLast={index === sorted.length - 1} />)}</View>
            <Pressable onPress={() => setAddOpen(true)} style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}><Ionicons name="add" size={22} color="#fff" /><Text style={styles.addButtonText}>Add Weight</Text></Pressable>
          </View>
        </View>
      </ScrollView>

      <Modal visible={addOpen} transparent animationType="fade" onRequestClose={() => setAddOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setAddOpen(false)}>
          <Pressable style={[styles.modalCard, compact && styles.modalCardCompact]} onPress={() => {}}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}><View><Text style={styles.modalTitle}>Add Weight</Text><Text style={styles.modalSubtitle}>Record a new measurement for {bird.name}</Text></View><Pressable accessibilityLabel="Close" onPress={() => setAddOpen(false)} style={styles.closeButton}><Ionicons name="close" size={20} color="#c7cdcf" /></Pressable></View>
            <Text style={styles.inputLabel}>Weight (kg) *</Text><View style={styles.weightInputWrap}><MaterialCommunityIcons name="weight-kilogram" size={21} color={ORANGE} /><TextInput value={weight} onChangeText={(value) => setWeight(value.replace(/[^0-9.]/g, ''))} keyboardType="decimal-pad" placeholder="Example: 2.85" placeholderTextColor="#58656a" style={styles.weightInput} /><Text style={styles.inputUnit}>kg</Text></View>
            <Text style={styles.inputLabel}>Note</Text><TextInput value={note} onChangeText={setNote} multiline placeholder="Routine check, after treatment, feeding change..." placeholderTextColor="#58656a" style={styles.noteInput} />
            <View style={styles.formActions}><Pressable onPress={() => setAddOpen(false)} style={styles.cancelButton}><Text style={styles.cancelText}>Cancel</Text></Pressable><Pressable onPress={saveWeight} style={({ pressed }) => [styles.saveButton, pressed && styles.pressed]}><MaterialCommunityIcons name="content-save-check-outline" size={19} color="#fff" /><Text style={styles.saveText}>Save Weight</Text></Pressable></View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#020709' }, pageWrap: { flexGrow: 1, alignItems: 'center', backgroundColor: '#020709' }, page: { width: '100%', maxWidth: 720, backgroundColor: '#020709' },
  hero: { height: 300, overflow: 'hidden', backgroundColor: '#101719' }, heroCompact: { height: 275 }, heroSafeArea: { flex: 1 }, heroHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: Platform.OS === 'web' ? 10 : 3 }, heroHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 }, headerButton: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(190,204,208,0.35)', backgroundColor: 'rgba(2,8,11,0.65)', alignItems: 'center', justifyContent: 'center' }, screenTitle: { color: '#f1f3f4', fontSize: 18, fontWeight: '700' }, heroCopy: { marginTop: 'auto', paddingHorizontal: 18, paddingBottom: 27 }, heroCopyNarrow: { paddingHorizontal: 11, paddingBottom: 21 }, birdName: { color: '#fff', fontSize: 32, lineHeight: 38, fontWeight: '800' }, birdMeta: { marginTop: 4, color: '#b7c0c3', fontSize: 12 },
  content: { paddingHorizontal: 14, paddingTop: 14, paddingBottom: 34 }, contentNarrow: { paddingHorizontal: 9 }, currentCard: { minHeight: 118, padding: 15, borderWidth: 1, borderColor: '#67410e', borderRadius: 8, backgroundColor: '#0b1214', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }, eyebrow: { color: ORANGE, fontSize: 8, fontWeight: '800' }, currentValueRow: { marginTop: 3, flexDirection: 'row', alignItems: 'baseline', gap: 5 }, currentValue: { color: '#f2f4f4', fontSize: 34, lineHeight: 40, fontWeight: '800' }, currentUnit: { color: '#a6b0b3', fontSize: 14, fontWeight: '700' }, currentDate: { color: '#7f8b8f', fontSize: 9 }, changeBadge: { minWidth: 122, padding: 10, borderRadius: 7, backgroundColor: 'rgba(255,122,0,0.08)', alignItems: 'center' }, changeValue: { marginTop: 3, color: ORANGE, fontSize: 14, fontWeight: '800' }, changeLabel: { marginTop: 2, color: '#7d898d', fontSize: 8 },
  metrics: { minHeight: 105, marginTop: 10, borderWidth: 1, borderColor: '#26343a', borderRadius: 8, backgroundColor: '#0a1317', flexDirection: 'row', overflow: 'hidden' }, metric: { flex: 1, minWidth: 0, paddingHorizontal: 5, paddingVertical: 13, alignItems: 'center', justifyContent: 'center' }, metricDivider: { borderRightWidth: 1, borderRightColor: '#223037' }, metricValue: { marginTop: 4, color: '#eef1f2', fontSize: 14, fontWeight: '800', textAlign: 'center' }, metricLabel: { marginTop: 3, color: '#a0aaad', fontSize: 8, fontWeight: '700', textAlign: 'center' }, metricNote: { marginTop: 3, color: '#687579', fontSize: 7, textAlign: 'center' },
  sectionHeading: { minHeight: 56, paddingTop: 19, paddingBottom: 8, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 10 }, sectionTitle: { color: '#e8ebec', fontSize: 15, fontWeight: '700' }, sectionSubtitle: { marginTop: 3, color: '#737f83', fontSize: 8 }, stableBadge: { height: 24, paddingHorizontal: 8, borderWidth: 1, borderColor: '#65400e', borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 5 }, stableDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: ORANGE }, stableText: { color: '#e39b47', fontSize: 8, fontWeight: '700' }, recordCount: { color: ORANGE, fontSize: 9, fontWeight: '700' },
  chartCard: { paddingHorizontal: 8, paddingTop: 10, paddingBottom: 12, borderWidth: 1, borderColor: '#314047', borderRadius: 8, backgroundColor: '#0a1317', shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 8 }, svgChartWrap: { width: '100%', height: 220 }, rangeNote: { minHeight: 38, marginTop: 8, paddingHorizontal: 9, borderRadius: 6, backgroundColor: 'rgba(255,122,0,0.065)', flexDirection: 'row', alignItems: 'center', gap: 7 }, rangeText: { flex: 1, color: '#929da0', fontSize: 8, lineHeight: 12 },
  historyPanel: { borderWidth: 1, borderColor: '#26343a', borderRadius: 8, backgroundColor: '#0a1317', overflow: 'hidden' }, historyRow: { minHeight: 82, padding: 11, flexDirection: 'row', alignItems: 'center', gap: 10 }, rowDivider: { borderBottomWidth: 1, borderBottomColor: '#223037' }, historyIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,122,0,0.08)', alignItems: 'center', justifyContent: 'center' }, historyCopy: { flex: 1, minWidth: 0 }, historyDate: { color: '#e2e6e7', fontSize: 11, fontWeight: '700' }, historyNote: { marginTop: 3, color: '#899599', fontSize: 8, lineHeight: 12 }, historyBy: { marginTop: 4, color: '#687579', fontSize: 7 }, historyValueWrap: { alignItems: 'flex-end' }, historyValue: { color: '#edf0f1', fontSize: 12, fontWeight: '800' }, historyChange: { marginTop: 4, color: ORANGE, fontSize: 8, fontWeight: '700' }, historyChangeDown: { color: '#d69045' },
  addButton: { height: 52, marginTop: 14, borderRadius: 8, backgroundColor: '#f66f00', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 }, addButtonText: { color: '#fff', fontSize: 13, fontWeight: '700' }, pressed: { opacity: 0.72 },
  modalBackdrop: { flex: 1, padding: 18, backgroundColor: 'rgba(0,0,0,0.76)', alignItems: 'center', justifyContent: 'center' }, modalCard: { width: '100%', maxWidth: 520, padding: 14, borderWidth: 1, borderColor: '#344249', borderRadius: 8, backgroundColor: '#081115' }, modalCardCompact: { padding: 11 }, modalHandle: { alignSelf: 'center', width: 40, height: 4, marginBottom: 12, borderRadius: 2, backgroundColor: '#3b474c' }, modalHeader: { marginBottom: 15, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }, modalTitle: { color: '#edf0f1', fontSize: 18, fontWeight: '800' }, modalSubtitle: { marginTop: 4, color: '#7f8b8f', fontSize: 9 }, closeButton: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#142025', alignItems: 'center', justifyContent: 'center' }, inputLabel: { marginBottom: 6, color: '#aab4b7', fontSize: 9, fontWeight: '700' }, weightInputWrap: { height: 52, marginBottom: 13, paddingHorizontal: 11, borderWidth: 1, borderColor: '#344249', borderRadius: 7, flexDirection: 'row', alignItems: 'center', gap: 8 }, weightInput: { flex: 1, height: 50, color: '#edf0f1', fontSize: 14, outlineStyle: 'none' }, inputUnit: { color: '#8e999d', fontSize: 11, fontWeight: '700' }, noteInput: { minHeight: 82, padding: 11, borderWidth: 1, borderColor: '#344249', borderRadius: 7, color: '#edf0f1', fontSize: 11, textAlignVertical: 'top', outlineStyle: 'none' }, formActions: { marginTop: 14, flexDirection: 'row', gap: 8 }, cancelButton: { flex: 0.8, height: 48, borderWidth: 1, borderColor: '#334147', borderRadius: 7, alignItems: 'center', justifyContent: 'center' }, cancelText: { color: '#b9c1c3', fontSize: 11, fontWeight: '700' }, saveButton: { flex: 1.2, height: 48, borderRadius: 7, backgroundColor: '#f66f00', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }, saveText: { color: '#fff', fontSize: 11, fontWeight: '800' },
});

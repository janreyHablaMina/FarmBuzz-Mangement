import { useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const HERO_IMAGE = require('./assets/growing-card.png');
const ORANGE = '#ff7900';

export const GROWING_BATCHES = [
  { id: 'GR-024', title: 'September Growers', birds: 38, startingBirds: 40, age: '8 Weeks', ageDays: 56, hatchDate: '2026-07-23T12:00:00', location: 'Grower House 1', status: 'Growing', nextAction: '', broodingBatch: 'BR-024' },
  { id: 'GR-018', title: 'North House Growers', birds: 42, startingBirds: 43, age: 'Month 3', ageDays: 90, hatchDate: '2026-06-19T12:00:00', location: 'Grower Area 2', status: 'Growing', nextAction: 'Health task due in 2 days', broodingBatch: 'BR-018' },
  { id: 'GR-015', title: 'August Growers', birds: 27, startingBirds: 29, age: 'Month 2', ageDays: 68, hatchDate: '2026-07-11T12:00:00', location: 'Grower House 2', status: 'Needs Attention', nextAction: 'Health review overdue', broodingBatch: 'BR-015' },
  { id: 'GR-011', title: 'Early Season Growers', birds: 31, startingBirds: 32, age: 'Month 4', ageDays: 120, hatchDate: '2026-05-20T12:00:00', location: 'Grower Area 1', status: 'Ready for Ranging', nextAction: 'Move to Ranging', broodingBatch: 'BR-011' },
];

function statusTone(status) {
  if (status === 'Needs Attention') return { color: '#ff756b', background: 'rgba(143,42,42,0.28)' };
  if (status === 'Ready for Ranging') return { color: '#ffba56', background: 'rgba(159,91,13,0.24)' };
  return { color: '#6ee58c', background: 'rgba(30,112,58,0.24)' };
}

function SummaryCard({ item, compact }) {
  return <View style={[styles.summaryCard, compact && styles.summaryCardCompact]}><View style={styles.summaryValueRow}><MaterialCommunityIcons name={item.icon} size={25} color={ORANGE} /><Text style={styles.summaryValue}>{item.value}</Text></View><Text numberOfLines={1} style={styles.summaryLabel}>{item.label}</Text><Text numberOfLines={1} style={styles.summaryDetail}>{item.detail}</Text></View>;
}

function BatchCard({ batch, onPress, readyDays }) {
  const tone = statusTone(batch.status);
  const progress = Math.min(100, Math.round((batch.ageDays / readyDays) * 100));
  return (
    <Pressable accessibilityLabel={`Open growing batch ${batch.id}`} onPress={onPress} style={({ pressed }) => [styles.batchCard, pressed && styles.pressed]}>
      <View style={styles.batchTop}><View style={styles.batchIdentity}><View style={styles.batchIcon}><MaterialCommunityIcons name="bird" size={23} color={ORANGE} /></View><View><Text style={styles.batchId}>{batch.id}</Text><Text style={styles.location}>{batch.location}</Text></View></View><View style={[styles.statusPill, { backgroundColor: tone.background }]}><View style={[styles.statusDot, { backgroundColor: tone.color }]} /><Text style={[styles.statusText, { color: tone.color }]}>{batch.status}</Text></View></View>
      <View style={styles.batchMetrics}><View><Text style={styles.birdValue}>{batch.birds}</Text><Text style={styles.metricLabel}>current birds</Text></View><View style={styles.ageCopy}><Text style={styles.ageValue}>{batch.age}</Text><Text style={styles.metricLabel}>{progress}% to ranging stage</Text></View></View>
      <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${progress}%` }]} /></View>
      <View style={styles.batchFooter}>{batch.nextAction ? <View style={styles.nextAction}><MaterialCommunityIcons name={batch.status === 'Ready for Ranging' ? 'arrow-right-circle-outline' : 'calendar-alert'} size={15} color={batch.status === 'Needs Attention' ? '#ef7568' : ORANGE} /><Text style={[styles.nextActionText, batch.status === 'Needs Attention' && styles.attentionText]}>{batch.nextAction}</Text></View> : <Text style={styles.onTrack}>On track</Text>}<Ionicons name="chevron-forward" size={17} color="#67767b" /></View>
    </Pressable>
  );
}

export default function GrowingScreen({ onBack, onOpenBatch, onOpenSettings, readyDay = 120 }) {
  const { width } = useWindowDimensions();
  const compact = width < 480;
  const [query, setQuery] = useState('');
  const readyDays = readyDay;
  const adjustedBatches = useMemo(() => GROWING_BATCHES.map((batch) => {
    if (batch.ageDays >= readyDays) return { ...batch, status: 'Ready for Ranging', nextAction: 'Move to Ranging' };
    if (batch.status === 'Needs Attention') return batch;
    return { ...batch, status: 'Growing', nextAction: batch.nextAction === 'Move to Ranging' ? '' : batch.nextAction };
  }), [readyDays]);
  const batches = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return adjustedBatches;
    return adjustedBatches.filter((batch) => `${batch.id} ${batch.location} ${batch.status} ${batch.age} ${batch.nextAction}`.toLowerCase().includes(search));
  }, [adjustedBatches, query]);
  const summary = [
    { icon: 'layers-triple-outline', value: String(GROWING_BATCHES.length), label: 'Active Batches', detail: 'currently growing' },
    { icon: 'bird', value: String(GROWING_BATCHES.reduce((total, batch) => total + batch.birds, 0)), label: 'Total Growers', detail: 'across active batches' },
    { icon: 'alert-circle-outline', value: String(GROWING_BATCHES.filter((batch) => batch.status === 'Needs Attention').length), label: 'Needs Attention', detail: 'requires review' },
    { icon: 'arrow-right-circle-outline', value: String(adjustedBatches.filter((batch) => batch.status === 'Ready for Ranging').length), label: 'Ready for Ranging', detail: `from day ${readyDay}` },
  ];

  return (
    <View style={styles.screen}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.pageWrap}>
        <View style={styles.page}>
          <View style={[styles.hero, compact && styles.heroCompact]}><Image source={HERO_IMAGE} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="center" cachePolicy="memory-disk" /><LinearGradient colors={['rgba(2,7,9,0.15)', 'rgba(2,7,9,0.22)', '#03090c']} locations={[0, 0.5, 1]} style={StyleSheet.absoluteFill} /><SafeAreaView edges={['top']} style={styles.heroSafe}><View style={styles.header}><View style={styles.headerLeft}><Pressable accessibilityLabel="Back to farm" onPress={onBack} style={styles.backButton}><Ionicons name="arrow-back" size={21} color="#fff" /></Pressable><Text style={styles.headerTitle}>Growing</Text></View><Pressable accessibilityLabel="Growing settings" onPress={onOpenSettings} style={styles.backButton}><Ionicons name="settings-outline" size={21} color="#fff" /></Pressable></View><View style={styles.heroCopy}><Text style={[styles.farmName, compact && styles.farmNameCompact]}>FarmBuzz Farm</Text><Text style={styles.tagline}>Manage juvenile batches through the ranging transition.</Text><View style={styles.meta}><Ionicons name="location-outline" size={14} color="#dce2e4" /><Text style={styles.metaText}>Pampanga, Philippines</Text><View style={styles.metaDivider} /><Ionicons name="calendar-outline" size={14} color="#dce2e4" /><Text style={styles.metaText}>Est. 2020</Text></View></View></SafeAreaView></View>
          <View style={[styles.content, compact && styles.contentCompact]}>
            <View style={styles.searchBox}><Ionicons name="search" size={20} color="#8d999d" /><TextInput value={query} onChangeText={setQuery} placeholder="Search growing batches" placeholderTextColor="#748187" selectionColor={ORANGE} style={styles.searchInput} /></View>
            <Text style={styles.overline}>GROWING DASHBOARD</Text>
            <View style={styles.summaryGrid}>{summary.map((item) => <SummaryCard key={item.label} item={item} compact={compact} />)}</View>
            <View style={styles.listHeading}><View><Text style={styles.overline}>GROWING BATCHES</Text><Text style={styles.listTitle}>Active batches</Text></View><View style={styles.countPill}><Text style={styles.countText}>{batches.length} active</Text></View></View>
            <View style={styles.batchList}>{batches.map((batch) => <BatchCard key={batch.id} batch={batch} readyDays={readyDays} onPress={() => onOpenBatch(batch.id)} />)}{!batches.length && <Text style={styles.empty}>No growing batches found</Text>}</View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#020709' }, pageWrap: { flexGrow: 1, alignItems: 'center', backgroundColor: '#020709' }, page: { width: '100%', maxWidth: 720 }, hero: { height: 272, overflow: 'hidden', backgroundColor: '#101719' }, heroCompact: { height: 248 }, heroSafe: { flex: 1 }, header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: Platform.OS === 'web' ? 10 : 3 }, headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 }, backButton: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(190,204,208,0.35)', backgroundColor: 'rgba(2,8,11,0.65)', alignItems: 'center', justifyContent: 'center' }, headerTitle: { color: '#f3f5f6', fontSize: 15, fontWeight: '800' }, heroCopy: { marginTop: 'auto', paddingHorizontal: 20, paddingBottom: 22 }, farmName: { color: '#fff', fontSize: 34, lineHeight: 40, fontWeight: '800', fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', web: 'Georgia' }) }, farmNameCompact: { fontSize: 29, lineHeight: 34 }, tagline: { marginTop: 3, color: '#c2cbce', fontSize: 13 }, meta: { marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 6 }, metaText: { color: '#d3dade', fontSize: 10 }, metaDivider: { width: 1, height: 12, marginHorizontal: 5, backgroundColor: 'rgba(210,220,224,0.35)' },
  content: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 28 }, contentCompact: { paddingHorizontal: 10 }, searchBox: { height: 48, borderRadius: 7, borderWidth: 1, borderColor: '#26373e', backgroundColor: '#081216', paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 8 }, searchInput: { flex: 1, height: 46, padding: 0, color: '#e7ebec', fontSize: 11, outlineStyle: 'none' }, overline: { marginTop: 18, color: '#879499', fontSize: 8, fontWeight: '800' }, summaryGrid: { marginTop: 8, flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, summaryCard: { flex: 1, minWidth: 0, height: 112, borderRadius: 7, borderWidth: 1, borderColor: '#26373e', backgroundColor: '#091317', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 7 }, summaryCardCompact: { flexBasis: '48%', height: 98 }, summaryValueRow: { flexDirection: 'row', alignItems: 'center', gap: 10 }, summaryValue: { color: '#f1f4f5', fontSize: 19, fontWeight: '800' }, summaryLabel: { marginTop: 8, color: '#e1e6e7', fontSize: 10, textAlign: 'center' }, summaryDetail: { marginTop: 4, color: '#6f7d82', fontSize: 7, textAlign: 'center' }, listHeading: { marginTop: 20, marginBottom: 9, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }, listTitle: { marginTop: 3, color: '#edf1f2', fontSize: 16, fontWeight: '800' }, countPill: { height: 24, paddingHorizontal: 9, borderRadius: 12, backgroundColor: '#0b171b', borderWidth: 1, borderColor: '#1c2d33', alignItems: 'center', justifyContent: 'center' }, countText: { color: '#839095', fontSize: 8 }, batchList: { gap: 8 },
  batchCard: { borderRadius: 7, borderWidth: 1, borderColor: '#1c2c32', backgroundColor: '#091317', padding: 12 }, batchTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }, batchIdentity: { flexDirection: 'row', alignItems: 'center', gap: 10 }, batchIcon: { width: 42, height: 42, borderRadius: 7, borderWidth: 1, borderColor: '#4a3218', backgroundColor: 'rgba(255,121,0,0.08)', alignItems: 'center', justifyContent: 'center' }, batchId: { color: '#eef2f3', fontSize: 13, fontWeight: '800' }, location: { marginTop: 3, color: '#78868b', fontSize: 8 }, statusPill: { minHeight: 22, maxWidth: 125, paddingHorizontal: 8, borderRadius: 11, flexDirection: 'row', alignItems: 'center', gap: 5 }, statusDot: { width: 5, height: 5, borderRadius: 3 }, statusText: { flexShrink: 1, fontSize: 8, fontWeight: '700' }, batchMetrics: { marginTop: 13, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }, birdValue: { color: '#fff', fontSize: 21, lineHeight: 23, fontWeight: '800' }, metricLabel: { marginTop: 2, color: '#748187', fontSize: 8 }, ageCopy: { alignItems: 'flex-end' }, ageValue: { color: '#dce2e4', fontSize: 11, fontWeight: '800' }, progressTrack: { height: 4, marginTop: 10, borderRadius: 2, backgroundColor: '#1c2a30', overflow: 'hidden' }, progressFill: { height: 4, borderRadius: 2, backgroundColor: ORANGE }, batchFooter: { minHeight: 29, marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#1b2a30', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, nextAction: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 }, nextActionText: { flex: 1, color: ORANGE, fontSize: 8, fontWeight: '700' }, attentionText: { color: '#ef7568' }, onTrack: { color: '#6f7d82', fontSize: 8 }, empty: { paddingVertical: 30, color: '#748187', fontSize: 11, textAlign: 'center' }, pressed: { opacity: 0.76, transform: [{ scale: 0.995 }] },
});

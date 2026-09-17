import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { INCUBATION_BATCHES } from './farmData';

const HERO_IMAGE = require('./assets/eggs-incubation-hero.png');
const DEVELOPING_EGG_IMAGE = require('./assets/incubation-stage-developing.png');
const CANDLING_EGG_IMAGE = require('./assets/incubation-stage-candling.png');
const HATCHING_EGG_IMAGE = require('./assets/incubation-egg.png');
const ORANGE = '#ff7900';

const SUMMARY = [
  { icon: 'layers-triple-outline', value: '3', label: 'Active Batches', detail: 'currently running' },
  { icon: 'egg-outline', value: '48', label: 'Eggs Incubating', detail: 'across all batches' },
  { icon: 'flashlight', value: '1', label: 'Candling Due', detail: 'requires checking' },
  { icon: 'egg-easter', value: '1', label: 'Hatching Soon', detail: 'within 3 days' },
];

function HeaderButton({ onPress }) {
  return <Pressable accessibilityLabel="Back to farm" onPress={onPress} style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}><Ionicons name="arrow-back" size={21} color="#eef1f2" /></Pressable>;
}

function SummaryItem({ item, compact }) {
  return (
    <View style={[styles.summaryCard, compact && styles.summaryCardCompact]}>
      <View style={styles.summaryValueRow}><MaterialCommunityIcons name={item.icon} size={25} color={ORANGE} /><Text style={styles.summaryValue}>{item.value}</Text></View>
      <Text style={styles.summaryLabel}>{item.label}</Text>
      <Text numberOfLines={1} style={styles.summaryDetail}>{item.detail}</Text>
    </View>
  );
}

function statusTone(status) {
  if (status === 'Candling Due' || status === 'Due Today') return { color: '#ffba56', background: 'rgba(159,91,13,0.22)' };
  if (status === 'Hatching Soon') return { color: '#74d9ff', background: 'rgba(24,102,132,0.22)' };
  if (status === 'Candled') return { color: '#7de596', background: 'rgba(35,110,63,0.22)' };
  return { color: '#aab6ba', background: 'rgba(94,108,114,0.18)' };
}

function BatchPreview({ batch }) {
  const pulse = useRef(new Animated.Value(0)).current;
  const isHatching = batch.status === 'Hatching Soon' || batch.status === 'Due Today';
  const isCandling = batch.status === 'Candling Due' || batch.status === 'Candled';
  const source = isHatching ? HATCHING_EGG_IMAGE : isCandling ? CANDLING_EGG_IMAGE : DEVELOPING_EGG_IMAGE;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1150, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1150, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [pulse]);

  return (
    <View style={styles.batchPreview}>
      <Animated.Image
        source={source}
        resizeMode="contain"
        style={[
          styles.batchPreviewImage,
          {
            opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.86, 1] }),
            transform: [
              { translateY: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, -2] }) },
              { scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1.03] }) },
            ],
          },
        ]}
      />
    </View>
  );
}

function BatchCard({ batch, onPress }) {
  const tone = statusTone(batch.status || 'Incubating');
  return (
    <Pressable accessibilityLabel={`Open incubation batch ${batch.id}`} onPress={onPress} style={({ pressed }) => [styles.batchCard, pressed && styles.cardPressed]}>
      <View style={styles.batchHeader}>
        <View style={styles.batchIdentity}><BatchPreview batch={batch} /><View><Text style={styles.batchId}>{batch.id}</Text><Text style={styles.incubator}>{batch.incubator}</Text></View></View>
        <View style={[styles.statusPill, { backgroundColor: tone.background }]}><View style={[styles.statusDot, { backgroundColor: tone.color }]} /><Text style={[styles.statusText, { color: tone.color }]}>{batch.status || 'Incubating'}</Text></View>
      </View>
      <View style={styles.batchMain}>
        <View><Text style={styles.eggValue}>{batch.eggCount}</Text><Text style={styles.eggLabel}>eggs incubating</Text></View>
        <View style={styles.dayBlock}><Text style={styles.dayValue}>Day {batch.dayNumber} of 21</Text><Text style={styles.dayLabel}>{batch.daysLeft} days remaining</Text></View>
      </View>
      <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${Math.min(100, batch.progress)}%` }]} /></View>
      <View style={styles.batchDates}>
        <View style={styles.dateItem}><MaterialCommunityIcons name="calendar-import-outline" size={15} color="#78878c" /><View><Text style={styles.dateLabel}>Date Set</Text><Text style={styles.dateValue}>{batch.startDate}</Text></View></View>
        <View style={styles.dateItem}><MaterialCommunityIcons name="calendar-check-outline" size={15} color="#78878c" /><View><Text style={styles.dateLabel}>Expected Hatch</Text><Text style={styles.dateValue}>{batch.estimatedHatch}</Text></View></View>
        <Ionicons name="chevron-forward" size={17} color="#66757a" />
      </View>
    </Pressable>
  );
}

export default function EggsIncubationScreen({ onBack, onCreateBatch, onOpenBatch }) {
  const { width } = useWindowDimensions();
  const compact = width < 480;
  const [query, setQuery] = useState('');
  const visibleBatches = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return INCUBATION_BATCHES;
    return INCUBATION_BATCHES.filter((batch) => `${batch.id} ${batch.incubator} ${batch.status} ${batch.eggCount}`.toLowerCase().includes(normalized));
  }, [query]);

  return (
    <View style={styles.screen}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.pageWrap}>
        <View style={styles.page}>
          <View style={[styles.hero, compact && styles.heroCompact]}>
            <Image source={HERO_IMAGE} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="center" cachePolicy="memory-disk" />
            <LinearGradient colors={['rgba(2,7,9,0.2)', 'rgba(2,7,9,0.18)', '#03090c']} locations={[0, 0.46, 1]} style={StyleSheet.absoluteFill} />
            <SafeAreaView edges={['top']} style={styles.heroSafeArea}>
              <View style={styles.heroHeader}><HeaderButton onPress={onBack} /><Text style={styles.screenTitle}>Incubation</Text></View>
              <View style={styles.heroCopy}><Text style={[styles.farmName, compact && styles.farmNameCompact]}>FarmBuzz Farm</Text><Text style={styles.farmTagline}>Track every batch from setting to hatch.</Text><View style={styles.farmMeta}><Ionicons name="location-outline" size={14} color="#dce2e4" /><Text style={styles.metaText}>Pampanga, Philippines</Text><View style={styles.metaDivider} /><Ionicons name="calendar-outline" size={14} color="#dce2e4" /><Text style={styles.metaText}>Est. 2020</Text></View></View>
            </SafeAreaView>
          </View>

          <View style={[styles.content, compact && styles.contentCompact]}>
            <View style={styles.actionRow}>
              <View style={styles.searchBox}><Ionicons name="search" size={20} color="#8d999d" /><TextInput value={query} onChangeText={setQuery} placeholder="Search batches" placeholderTextColor="#748187" selectionColor={ORANGE} style={styles.searchInput} /></View>
              <Pressable onPress={onCreateBatch} style={({ pressed }) => [styles.moveButton, pressed && styles.pressed]}><Ionicons name="add" size={20} color="#fff" /><Text style={styles.moveButtonText}>Move Eggs In</Text></Pressable>
            </View>

            <Text style={styles.overline}>INCUBATION DASHBOARD</Text>
            <View style={styles.summaryGrid}>{SUMMARY.map((item) => <SummaryItem key={item.label} item={item} compact={compact} />)}</View>

            <View style={styles.listHeading}><View><Text style={styles.overline}>INCUBATION BATCHES</Text><Text style={styles.listTitle}>Active batches</Text></View><View style={styles.countPill}><Text style={styles.countText}>{visibleBatches.length} active</Text></View></View>
            <View style={styles.batchList}>{visibleBatches.map((batch) => <BatchCard key={batch.id} batch={batch} onPress={() => onOpenBatch(batch.id)} />)}{!visibleBatches.length && <Text style={styles.emptyText}>No batches found</Text>}</View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#020709' }, pageWrap: { flexGrow: 1, alignItems: 'center', backgroundColor: '#020709' }, page: { width: '100%', maxWidth: 720 },
  hero: { height: 272, overflow: 'hidden', backgroundColor: '#101719' }, heroCompact: { height: 248 }, heroSafeArea: { flex: 1 }, heroHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingTop: Platform.OS === 'web' ? 10 : 3 }, headerButton: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(190,204,208,0.35)', backgroundColor: 'rgba(2,8,11,0.65)', alignItems: 'center', justifyContent: 'center' }, screenTitle: { color: '#f3f5f6', fontSize: 15, fontWeight: '800' },
  heroCopy: { marginTop: 'auto', paddingHorizontal: 20, paddingBottom: 22 }, farmName: { color: '#fff', fontSize: 34, lineHeight: 40, fontWeight: '800', fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', web: 'Georgia' }) }, farmNameCompact: { fontSize: 29, lineHeight: 34 }, farmTagline: { marginTop: 3, color: '#c2cbce', fontSize: 13 }, farmMeta: { marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 6 }, metaText: { color: '#d3dade', fontSize: 10 }, metaDivider: { width: 1, height: 12, marginHorizontal: 5, backgroundColor: 'rgba(210,220,224,0.35)' },
  content: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 28 }, contentCompact: { paddingHorizontal: 10 }, actionRow: { flexDirection: 'row', gap: 8 }, searchBox: { flex: 1, height: 48, borderRadius: 7, borderWidth: 1, borderColor: '#26373e', backgroundColor: '#081216', paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 8 }, searchInput: { flex: 1, height: 46, padding: 0, color: '#e7ebec', fontSize: 11, outlineStyle: 'none' }, moveButton: { minWidth: 124, height: 48, borderRadius: 7, backgroundColor: ORANGE, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }, moveButtonText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  overline: { marginTop: 18, color: '#879499', fontSize: 8, fontWeight: '800' },
  summaryGrid: { marginTop: 8, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  summaryCard: { flex: 1, minWidth: 0, height: 112, borderRadius: 7, borderWidth: 1, borderColor: '#26373e', backgroundColor: '#091317', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 7 },
  summaryCardCompact: { flexBasis: '48%', height: 98 },
  summaryValueRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  summaryValue: { color: '#f1f4f5', fontSize: 19, fontWeight: '800' },
  summaryLabel: { marginTop: 8, color: '#e1e6e7', fontSize: 10, textAlign: 'center' },
  summaryDetail: { marginTop: 4, color: '#6f7d82', fontSize: 7, textAlign: 'center' },
  listHeading: { marginTop: 20, marginBottom: 9, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }, listTitle: { marginTop: 3, color: '#edf1f2', fontSize: 16, fontWeight: '800' }, countPill: { height: 24, paddingHorizontal: 9, borderRadius: 12, backgroundColor: '#0b171b', borderWidth: 1, borderColor: '#1c2d33', alignItems: 'center', justifyContent: 'center' }, countText: { color: '#839095', fontSize: 8 }, batchList: { gap: 8 },
  batchCard: { borderRadius: 7, borderWidth: 1, borderColor: '#1c2c32', backgroundColor: '#091317', padding: 12 }, batchHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, batchIdentity: { flexDirection: 'row', alignItems: 'center', gap: 10 }, batchPreview: { width: 52, height: 52, borderRadius: 7, borderWidth: 1, borderColor: '#3b321f', backgroundColor: '#101719', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }, batchPreviewImage: { width: 46, height: 46 }, batchId: { color: '#eef2f3', fontSize: 13, fontWeight: '800' }, incubator: { marginTop: 3, color: '#78868b', fontSize: 8 }, statusPill: { height: 22, paddingHorizontal: 8, borderRadius: 11, flexDirection: 'row', alignItems: 'center', gap: 5 }, statusDot: { width: 5, height: 5, borderRadius: 3 }, statusText: { fontSize: 8, fontWeight: '700' },
  batchMain: { marginTop: 13, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }, eggValue: { color: '#fff', fontSize: 21, lineHeight: 23, fontWeight: '800' }, eggLabel: { color: '#7d8a8f', fontSize: 8 }, dayBlock: { alignItems: 'flex-end' }, dayValue: { color: '#dce2e4', fontSize: 10, fontWeight: '700' }, dayLabel: { marginTop: 2, color: '#748187', fontSize: 8 }, progressTrack: { height: 4, marginTop: 10, borderRadius: 2, backgroundColor: '#1c2a30', overflow: 'hidden' }, progressFill: { height: 4, borderRadius: 2, backgroundColor: ORANGE }, batchDates: { marginTop: 11, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#1b2a30', flexDirection: 'row', alignItems: 'center', gap: 13 }, dateItem: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 6 }, dateLabel: { color: '#647278', fontSize: 7 }, dateValue: { marginTop: 2, color: '#aeb8bb', fontSize: 8 }, emptyText: { paddingVertical: 30, color: '#748187', fontSize: 11, textAlign: 'center' }, pressed: { opacity: 0.72 }, cardPressed: { opacity: 0.78, transform: [{ scale: 0.995 }] },
});

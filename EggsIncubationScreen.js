import { useMemo, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HOLDING_EGG_TOTAL, HOLDING_GROUPS, INCUBATION_BATCHES } from './farmData';

const INCUBATION_HERO_IMAGE = require('./assets/eggs-incubation-hero.png');

const SUMMARY = [
  { icon: 'egg-outline', value: String(HOLDING_EGG_TOTAL), label: 'Eggs in Holding', detail: '11 ready to set' },
  { icon: 'calendar-month-outline', value: '2', label: 'Active Batches', detail: 'In incubation' },
  { icon: 'egg-outline', value: '3', label: 'Hatching Soon', detail: 'Next 3 days' },
];

function HeaderButton({ icon, label, onPress }) {
  return (
    <Pressable
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}
    >
      <Ionicons name={icon} size={21} color="#eef1f2" />
    </Pressable>
  );
}

function SummaryCard({ item, narrow }) {
  return (
    <View style={[styles.summaryCard, narrow && styles.summaryCardNarrow]}>
      <View style={styles.summaryValueRow}>
        <MaterialCommunityIcons name={item.icon} size={29} color="#ff8200" />
        <Text style={[styles.summaryValue, narrow && styles.summaryValueNarrow]}>{item.value}</Text>
      </View>
      <Text numberOfLines={2} style={[styles.summaryLabel, narrow && styles.summaryLabelNarrow]}>{item.label}</Text>
      <Text numberOfLines={1} style={styles.summaryDetail}>{item.detail}</Text>
    </View>
  );
}

function SectionHeader({ title, onViewAll }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Pressable onPress={onViewAll} style={({ pressed }) => [styles.viewAll, pressed && styles.pressed]}>
        <Text style={styles.viewAllText}>View all</Text>
        <Ionicons name="chevron-forward" size={18} color="#ff8a00" />
      </Pressable>
    </View>
  );
}

function PairAvatar({ source, trailing }) {
  return (
    <View style={[styles.pairAvatarWrap, trailing && styles.pairAvatarTrailing]}>
      <Image source={source} style={styles.pairAvatar} contentFit="cover" cachePolicy="memory-disk" />
    </View>
  );
}

function HoldingPairRow({ pair, isLast }) {
  return (
    <Pressable
      accessibilityLabel={`Open eggs held by ${pair.male} and ${pair.female}`}
      onPress={() => Alert.alert(`${pair.male} x ${pair.female}`, `${pair.eggCount} eggs - oldest ${pair.oldestDays} days`)}
      style={({ pressed }) => [styles.holdingRow, !isLast && styles.rowDivider, pressed && styles.rowPressed]}
    >
      <View style={styles.avatarPair}>
        <PairAvatar source={pair.maleImage} />
        <PairAvatar source={pair.femaleImage} trailing />
      </View>
      <View style={styles.holdingCopy}>
        <Text style={styles.holdingName}>{pair.male} x {pair.female}</Text>
        <View style={styles.holdingMeta}>
          <Text style={styles.holdingEggs}>{pair.eggCount} eggs</Text>
          <Text style={styles.metaDot}>•</Text>
          <Text style={styles.holdingOldest}>Oldest {pair.oldestDays} days</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9da6a9" />
    </Pressable>
  );
}

function BatchMetric({ icon, label, value, emphasized, isLast }) {
  return (
    <View style={[styles.batchMetric, !isLast && styles.batchMetricDivider]}>
      <MaterialCommunityIcons name={icon} size={22} color="#ff8200" />
      <View style={styles.batchMetricCopy}>
        <Text numberOfLines={2} style={styles.batchMetricLabel}>{label}</Text>
        <Text numberOfLines={2} style={[styles.batchMetricValue, emphasized && styles.batchMetricEmphasis]}>{value}</Text>
      </View>
    </View>
  );
}

function BatchMetrics({ batch, compact }) {
  return (
    <View style={[styles.batchMetrics, compact && styles.batchMetricsCompact]}>
      <BatchMetric icon="egg-outline" label={batch.eggs} value="Total" />
      <BatchMetric icon="calendar-month-outline" label={batch.day} value="Incubating" />
      <BatchMetric icon="timer-sand" label={batch.eventLabel} value={batch.eventValue} emphasized isLast />
    </View>
  );
}

function BatchCard({ batch, compact, narrow, onPress }) {
  return (
    <Pressable
      accessibilityLabel={`Open incubation batch ${batch.id}`}
      onPress={onPress}
      style={({ pressed }) => [styles.batchCard, pressed && styles.cardPressed]}
    >
      <View style={styles.batchTop}>
        <Image
          source={INCUBATION_HERO_IMAGE}
          style={[styles.batchImage, narrow && styles.batchImageNarrow]}
          contentFit="cover"
          contentPosition="right"
        />
        <View style={styles.batchBody}>
          <View style={styles.batchHeader}>
            <Text style={styles.batchTitle}>Batch {batch.id}</Text>
            <View style={styles.incubatingChip}>
              <Text style={styles.incubatingText}>Incubating</Text>
            </View>
          </View>
          {!compact && <BatchMetrics batch={batch} />}
        </View>
        <Ionicons name="chevron-forward" size={20} color="#9da6a9" />
      </View>
      {compact && <BatchMetrics batch={batch} compact />}
    </Pressable>
  );
}

export default function EggsIncubationScreen({ onBack, onOpenEggHolding, onCreateBatch, onOpenBatch, onOpenHistory }) {
  const { width } = useWindowDimensions();
  const compact = width < 480;
  const narrow = width < 390;
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim().toLowerCase();

  const visiblePairs = useMemo(() => {
    const matches = HOLDING_GROUPS.filter((pair) =>
      `${pair.male} ${pair.female} ${pair.eggCount} ${pair.oldestDays}`.toLowerCase().includes(normalizedQuery),
    );
    return normalizedQuery ? matches : matches.slice(0, 2);
  }, [normalizedQuery]);
  const visibleBatches = useMemo(() => INCUBATION_BATCHES.filter((batch) =>
    `${batch.id} ${batch.eggs} ${batch.day} ${batch.eventLabel} ${batch.eventValue}`.toLowerCase().includes(normalizedQuery),
  ), [normalizedQuery]);

  return (
    <View style={styles.screen}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.pageWrap}>
        <View style={styles.page}>
          <View style={[styles.hero, compact && styles.heroCompact]}>
            <Image
              source={INCUBATION_HERO_IMAGE}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              contentPosition="center"
              cachePolicy="memory-disk"
            />
            <LinearGradient
              colors={['rgba(2, 7, 9, 0.24)', 'rgba(2, 7, 9, 0.12)', '#040a0d']}
              locations={[0, 0.43, 1]}
              style={StyleSheet.absoluteFill}
            />
            <SafeAreaView edges={['top']} style={styles.heroSafeArea}>
              <View style={styles.heroHeader}>
                <View style={styles.heroHeaderLeft}>
                  <HeaderButton icon="arrow-back" label="Back to management" onPress={onBack} />
                  <Text style={[styles.screenTitle, narrow && styles.screenTitleNarrow]}>Eggs & Incubation</Text>
                </View>
              </View>
              <View style={[styles.heroCopy, narrow && styles.heroCopyNarrow]}>
                <Text style={[styles.farmName, narrow && styles.farmNameNarrow]}>FarmBuzz Farm</Text>
                <Text style={styles.farmTagline}>Raising quality gamefowl with strong bloodlines.</Text>
                <View style={styles.farmMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="location-outline" size={16} color="#c0c7c9" />
                    <Text style={styles.metaText}>Pampanga, Philippines</Text>
                  </View>
                  <View style={styles.metaDivider} />
                  <View style={styles.metaItem}>
                    <Ionicons name="calendar-outline" size={16} color="#c0c7c9" />
                    <Text style={styles.metaText}>Est. 2020</Text>
                  </View>
                </View>
              </View>
            </SafeAreaView>
          </View>

          <View style={[styles.content, narrow && styles.contentNarrow]}>
            <View style={[styles.actionRow, compact && styles.actionRowCompact]}>
              <View style={styles.searchBox}>
                <Ionicons name="search" size={22} color="#9aa4a8" />
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Search eggs or batches..."
                  placeholderTextColor="#879195"
                  selectionColor="#ff7900"
                  style={styles.searchInput}
                />
                {!!query && (
                  <Pressable accessibilityLabel="Clear search" onPress={() => setQuery('')} hitSlop={8}>
                    <Ionicons name="close-circle" size={18} color="#6c777b" />
                  </Pressable>
                )}
              </View>
              <Pressable
                onPress={onCreateBatch}
                accessibilityLabel="Create batch"
                style={({ pressed }) => [styles.addButton, compact && styles.addButtonCompact, pressed && styles.pressed]}
              >
                <Ionicons name="add" size={27} color="#fff" />
                {!compact && <Text style={styles.addButtonText}>Create Batch</Text>}
              </Pressable>
            </View>

            <View style={styles.summaryGrid}>
              {SUMMARY.map((item) => <SummaryCard key={item.label} item={item} narrow={narrow} />)}
            </View>

            <SectionHeader title="Active Incubation Batches" onViewAll={() => Alert.alert('Incubation Batches')} />
            <View style={styles.batchList}>
              {visibleBatches.map((batch) => (
                <BatchCard
                  key={batch.id}
                  batch={batch}
                  compact={compact}
                  narrow={narrow}
                  onPress={() => onOpenBatch(batch.id)}
                />
              ))}
              {!visibleBatches.length && <Text style={styles.emptyText}>No incubation batches found</Text>}
            </View>

            <SectionHeader title="Eggs in Holding" onViewAll={onOpenEggHolding} />
            <View style={styles.listCard}>
              {visiblePairs.map((pair, index) => (
                <HoldingPairRow key={pair.id} pair={pair} isLast={index === visiblePairs.length - 1} />
              ))}
              {!visiblePairs.length && <Text style={styles.emptyText}>No holding eggs found</Text>}
            </View>

            <Pressable
              onPress={() => Alert.alert('Ready to set', '11 eggs can now be added to an incubation batch.')}
              style={({ pressed }) => [styles.readyAlert, pressed && styles.pressed]}
            >
              <MaterialCommunityIcons name="alert-outline" size={25} color="#ff8500" />
              <Text style={styles.readyAlertText}>11 eggs ready to set</Text>
              <Ionicons name="chevron-forward" size={18} color="#ff8500" />
            </Pressable>

            <Pressable
              onPress={onOpenHistory}
              style={({ pressed }) => [styles.historyCard, pressed && styles.cardPressed]}
            >
              <MaterialCommunityIcons name="calendar-month-outline" size={28} color="#ff8500" />
              <View style={styles.historyCopy}>
                <Text style={styles.historyTitle}>Incubation History</Text>
                <Text style={styles.historyDetail}>See past batches and hatch results</Text>
              </View>
              <Ionicons name="chevron-forward" size={21} color="#9da6a9" />
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#020709' },
  pageWrap: { flexGrow: 1, alignItems: 'center', backgroundColor: '#020709' },
  page: { width: '100%', maxWidth: 720, backgroundColor: '#020709' },
  hero: { height: 250, overflow: 'hidden', backgroundColor: '#101719' },
  heroCompact: { height: 245 },
  heroSafeArea: { flex: 1 },
  heroHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: Platform.OS === 'web' ? 10 : 3,
  },
  heroHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 13, minWidth: 0 },
  headerButton: {
    width: 40, height: 40, borderRadius: 20, borderWidth: 1,
    borderColor: 'rgba(190, 204, 208, 0.35)', backgroundColor: 'rgba(2, 8, 11, 0.65)',
    alignItems: 'center', justifyContent: 'center',
  },
  screenTitle: { color: '#f0f2f3', fontSize: 17, fontWeight: '700', letterSpacing: 0 },
  screenTitleNarrow: { fontSize: 15 },
  heroCopy: { marginTop: 'auto', maxWidth: 500, paddingHorizontal: 18, paddingBottom: 24 },
  heroCopyNarrow: { maxWidth: 345, paddingHorizontal: 12, paddingBottom: 18 },
  farmName: {
    color: '#f5f6f6', fontSize: 34, lineHeight: 40, fontWeight: '800', letterSpacing: 0,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', web: 'Georgia' }),
    textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 5,
  },
  farmNameNarrow: { fontSize: 29, lineHeight: 34 },
  farmTagline: { marginTop: 6, color: '#bac1c3', fontSize: 14, lineHeight: 20, letterSpacing: 0 },
  farmMeta: { marginTop: 14, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 10 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { color: '#b8c0c2', fontSize: 12, letterSpacing: 0 },
  metaDivider: { width: 1, height: 14, backgroundColor: '#6d777a' },
  content: { paddingHorizontal: 10, paddingBottom: 20 },
  contentNarrow: { paddingHorizontal: 8 },
  actionRow: { flexDirection: 'row', gap: 10 },
  actionRowCompact: { flexDirection: 'row', gap: 8 },
  searchBox: {
    flex: 1, height: 52, flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, borderColor: '#28343a', backgroundColor: '#0b1418',
  },
  searchInput: {
    flex: 1, height: 50, paddingVertical: 0, color: '#e7ebec', fontSize: 14,
    letterSpacing: 0, outlineStyle: 'none',
  },
  addButton: {
    height: 52, minWidth: 172, paddingHorizontal: 20, borderRadius: 8,
    backgroundColor: '#f66f00', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9,
  },
  addButtonCompact: { width: 52, minWidth: 52, paddingHorizontal: 0 },
  addButtonText: { color: '#fff', fontSize: 14, fontWeight: '700', letterSpacing: 0 },
  summaryGrid: { marginTop: 14, flexDirection: 'row', gap: 10 },
  summaryCard: {
    flex: 1, minWidth: 0, height: 112, paddingHorizontal: 5, borderRadius: 8, borderWidth: 1,
    borderColor: '#1c2a30', backgroundColor: '#0b1418', alignItems: 'center', justifyContent: 'center',
  },
  summaryCardNarrow: { height: 104 },
  summaryValueRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  summaryValue: { color: '#f0f2f3', fontSize: 27, fontWeight: '600', letterSpacing: 0 },
  summaryValueNarrow: { fontSize: 23 },
  summaryLabel: { marginTop: 8, color: '#d4d9db', fontSize: 12, textAlign: 'center', letterSpacing: 0 },
  summaryLabelNarrow: { fontSize: 10 },
  summaryDetail: { marginTop: 4, color: '#899397', fontSize: 10, letterSpacing: 0 },
  sectionHeader: {
    marginTop: 22, marginBottom: 7, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  sectionTitle: { color: '#e5e9ea', fontSize: 16, fontWeight: '600', letterSpacing: 0 },
  viewAll: { minHeight: 32, flexDirection: 'row', alignItems: 'center', gap: 4, paddingLeft: 10 },
  viewAllText: { color: '#ff8a00', fontSize: 12, letterSpacing: 0 },
  listCard: { borderRadius: 8, borderWidth: 1, borderColor: '#1c2a30', backgroundColor: '#0b1418', overflow: 'hidden' },
  holdingRow: { minHeight: 73, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 12, paddingVertical: 8 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: '#1b292f' },
  avatarPair: { width: 78, flexDirection: 'row', alignItems: 'center' },
  pairAvatarWrap: { position: 'relative', zIndex: 2 },
  pairAvatarTrailing: { marginLeft: -14, zIndex: 1 },
  pairAvatar: { width: 46, height: 46, borderRadius: 23, borderWidth: 2, borderColor: '#18262c', backgroundColor: '#0a1317' },
  holdingCopy: { flex: 1, minWidth: 0 },
  holdingName: { color: '#e9eced', fontSize: 14, fontWeight: '600', letterSpacing: 0 },
  holdingMeta: { marginTop: 5, flexDirection: 'row', alignItems: 'center', gap: 8 },
  holdingEggs: { color: '#d2d8da', fontSize: 11, letterSpacing: 0 },
  holdingOldest: { color: '#8f999d', fontSize: 11, letterSpacing: 0 },
  metaDot: { color: '#657074', fontSize: 11 },
  readyAlert: {
    minHeight: 48, marginTop: 9, paddingHorizontal: 15, borderRadius: 8, borderWidth: 1,
    borderColor: '#6a3a0d', backgroundColor: 'rgba(109, 57, 8, 0.2)', flexDirection: 'row', alignItems: 'center', gap: 11,
  },
  readyAlertText: { flex: 1, color: '#ff8a00', fontSize: 13, fontWeight: '600', letterSpacing: 0 },
  batchList: { gap: 8 },
  batchCard: {
    minHeight: 104, padding: 9, borderRadius: 8, borderWidth: 1,
    borderColor: '#1c2a30', backgroundColor: '#0b1418',
  },
  batchTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  batchImage: { width: 78, height: 84, borderRadius: 7, borderWidth: 1, borderColor: '#66360d' },
  batchImageNarrow: { width: 66, height: 76 },
  batchBody: { flex: 1, minWidth: 0 },
  batchHeader: { alignItems: 'flex-start', gap: 5 },
  batchTitle: { color: '#e9eced', fontSize: 14, fontWeight: '700', letterSpacing: 0 },
  incubatingChip: { height: 26, paddingHorizontal: 9, borderRadius: 13, backgroundColor: 'rgba(255, 132, 0, 0.1)', justifyContent: 'center' },
  incubatingText: { color: '#ff8900', fontSize: 10, fontWeight: '600', letterSpacing: 0 },
  batchMetrics: { marginTop: 11, flexDirection: 'row', alignItems: 'center' },
  batchMetricsCompact: {
    marginTop: 9, paddingTop: 9, borderTopWidth: 1, borderTopColor: '#1d2b31',
  },
  batchMetric: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 6 },
  batchMetricDivider: { borderRightWidth: 1, borderRightColor: '#1d2b31' },
  batchMetricCopy: { flex: 1, minWidth: 0 },
  batchMetricLabel: { color: '#d4d9db', fontSize: 10, lineHeight: 12, letterSpacing: 0 },
  batchMetricValue: { marginTop: 2, color: '#899397', fontSize: 9, lineHeight: 11, letterSpacing: 0 },
  batchMetricEmphasis: { color: '#ff8500', fontWeight: '600' },
  historyCard: {
    minHeight: 65, marginTop: 9, paddingHorizontal: 17, borderRadius: 8, borderWidth: 1,
    borderColor: '#1c2a30', backgroundColor: '#0b1418', flexDirection: 'row', alignItems: 'center', gap: 14,
  },
  historyCopy: { flex: 1 },
  historyTitle: { color: '#e6eaeb', fontSize: 14, fontWeight: '600', letterSpacing: 0 },
  historyDetail: { marginTop: 4, color: '#8e999c', fontSize: 11, letterSpacing: 0 },
  emptyText: { paddingVertical: 28, color: '#7f8a8e', fontSize: 12, textAlign: 'center', letterSpacing: 0 },
  pressed: { opacity: 0.72 },
  rowPressed: { backgroundColor: '#101c21' },
  cardPressed: { opacity: 0.76, transform: [{ scale: 0.995 }] },
});

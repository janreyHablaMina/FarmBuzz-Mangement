import { useMemo, useState } from 'react';
import {
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
import { BREEDING_HERO_IMAGE } from './constants';

const ROOSTER_IMAGE =
  'https://images.unsplash.com/photo-1730360037813-9777f13b88bb?auto=format&fit=crop&w=400&q=82';
const HEN_IMAGE =
  'https://images.unsplash.com/photo-1770221499235-11dd1041e181?auto=format&fit=crop&w=400&q=82';
const BLACK_ROOSTER_IMAGE =
  'https://images.unsplash.com/photo-1551127501-d4385c7484b4?auto=format&fit=crop&w=400&q=82';
const BROWN_HEN_IMAGE =
  'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=400&q=82';

const BREEDING_SUMMARY = [
  { icon: 'link-variant', value: '6', label: 'Active Pairs', compactLabel: 'Pairs' },
  { icon: 'gender-male', value: '4', label: 'Active Sires', compactLabel: 'Sires', detail: 'Cocks' },
  { icon: 'gender-female', value: '6', label: 'Active Dams', compactLabel: 'Dams', detail: 'Hens' },
  { icon: 'egg-outline', value: '18', label: 'Eggs in Holding', compactLabel: 'Holding', detail: '4 groups' },
];

export const PAIRINGS = [
  {
    male: 'Razor 014',
    female: 'Ruby 032',
    maleImage: ROOSTER_IMAGE,
    femaleImage: BROWN_HEN_IMAGE,
    bloodline: 'Kelso Cock · Sweater Hen',
    id: 'BR-021',
    started: 'Aug 19',
    eggs: '6 eggs',
    oldestEgg: '5 days',
    status: 'Active',
    statusColor: '#5eea78',
    statusBackground: 'rgba(29, 126, 66, 0.15)',
  },
  {
    male: 'Blade 089',
    female: 'Queen 061',
    maleImage: BLACK_ROOSTER_IMAGE,
    femaleImage: HEN_IMAGE,
    bloodline: 'Roundhead Cock · Hatch Hen',
    id: 'BR-018',
    started: 'Aug 16',
    eggs: '5 eggs',
    oldestEgg: '4 days',
    status: 'Set soon',
    statusColor: '#ff9a00',
    statusBackground: 'rgba(150, 92, 0, 0.15)',
  },
  {
    male: 'Storm 057',
    female: 'Lady 103',
    maleImage: ROOSTER_IMAGE,
    femaleImage: HEN_IMAGE,
    bloodline: 'Hatch Cock · Kelso Hen',
    id: 'BR-024',
    started: 'Aug 22',
    eggs: '4 eggs',
    oldestEgg: '3 days',
    status: 'Active',
    statusColor: '#5eea78',
    statusBackground: 'rgba(29, 126, 66, 0.15)',
  },
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

function SummaryMetric({ item, isLast }) {
  return (
    <View style={[styles.summaryMetric, !isLast && styles.summaryMetricDivider]}>
      <View style={styles.summaryMetricIcon}>
        <MaterialCommunityIcons name={item.icon} size={18} color="#ff8500" />
      </View>
      <View style={styles.summaryMetricCopy}>
        <View style={styles.summaryMetricValueRow}>
          <Text style={styles.summaryMetricValue}>{item.value}</Text>
          <Text numberOfLines={1} style={styles.summaryMetricLabel}>{item.compactLabel}</Text>
        </View>
        {item.detail && <Text numberOfLines={1} style={styles.summaryMetricDetail}>{item.detail}</Text>}
      </View>
    </View>
  );
}

function BirdAvatar({ source, trailing }) {
  return (
    <View style={[styles.avatarWrap, trailing && styles.avatarTrailing]}>
      <Image source={source} style={styles.avatar} contentFit="cover" cachePolicy="memory-disk" />
    </View>
  );
}

function PairMetric({ icon, label, value, isLast }) {
  return (
    <View style={[styles.pairMetric, !isLast && styles.pairMetricDivider]}>
      <MaterialCommunityIcons name={icon} size={23} color="#ff8500" />
      <View>
        <Text style={styles.pairMetricLabel}>{label}</Text>
        <Text style={styles.pairMetricValue}>{value}</Text>
      </View>
    </View>
  );
}

function getPairEggCount(pairing, collections = []) {
  return (Number.parseInt(pairing.eggs, 10) || 0)
    + collections.reduce((total, collection) => total + collection.count, 0);
}

function PairingCard({ pairing, collections, compact, onPress }) {
  const eggCount = getPairEggCount(pairing, collections);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open pairing ${pairing.male} and ${pairing.female}`}
      onPress={onPress}
      style={({ pressed }) => [styles.pairingCard, pressed && styles.cardPressed]}
    >
      <View style={[styles.pairingTop, compact && styles.pairingTopCompact]}>
        <View style={styles.avatarPair}>
          <BirdAvatar source={pairing.maleImage} />
          <BirdAvatar source={pairing.femaleImage} trailing />
        </View>

        <View style={styles.pairingCopy}>
          <Text numberOfLines={compact ? 2 : 1} style={[styles.pairingTitle, compact && styles.pairingTitleCompact]}>
            {pairing.male} <Text style={styles.pairingCross}>×</Text> {pairing.female}
          </Text>
          <Text numberOfLines={1} style={styles.pairingBloodline}>{pairing.bloodline}</Text>
          <Text style={styles.pairingId}>{pairing.id}</Text>
        </View>

        <View style={[styles.pairStatus, compact && styles.pairStatusCompact]}>
          <View style={[styles.pairStatusDot, { backgroundColor: pairing.statusColor }]} />
          <Text numberOfLines={1} style={[styles.pairStatusText, compact && styles.pairStatusTextCompact, { color: pairing.statusColor }]}>{pairing.status}</Text>
        </View>
      </View>

      <View style={styles.pairingMetrics}>
        <PairMetric icon="calendar-month-outline" label="Started" value={pairing.started} />
        <PairMetric icon="egg-outline" label="Holding" value={`${eggCount} eggs`} />
        <PairMetric icon="clock-outline" label="Oldest egg" value={pairing.oldestEgg} isLast />
      </View>
    </Pressable>
  );
}

export default function BreedingScreen({ onBack, onAddPairing, onOpenPairing, addedPairings = [], eggCollectionsByPairing = {} }) {
  const { width } = useWindowDimensions();
  const compact = width < 480;
  const narrow = width < 390;
  const [query, setQuery] = useState('');
  const allPairings = useMemo(() => [...addedPairings, ...PAIRINGS], [addedPairings]);
  const summaryItems = useMemo(() => {
    const eggGroups = allPairings.filter((pairing) => getPairEggCount(pairing, eggCollectionsByPairing[pairing.id]) > 0);
    const values = [
      allPairings.length,
      new Set(allPairings.map((pairing) => pairing.male)).size,
      new Set(allPairings.map((pairing) => pairing.female)).size,
      allPairings.reduce((total, pairing) => total + getPairEggCount(pairing, eggCollectionsByPairing[pairing.id]), 0),
    ];
    return BREEDING_SUMMARY.map((item, index) => ({
      ...item,
      value: String(values[index]),
      ...(index === 3 ? { detail: `${eggGroups.length} groups` } : {}),
    }));
  }, [allPairings, eggCollectionsByPairing]);

  const visiblePairings = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return allPairings;
    return allPairings.filter((pairing) =>
      `${pairing.male} ${pairing.female} ${pairing.bloodline} ${pairing.id}`
        .toLowerCase()
        .includes(normalized),
    );
  }, [allPairings, query]);

  return (
    <View style={styles.screen}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.pageWrap}>
        <View style={styles.page}>
          <View style={[styles.hero, compact && styles.heroCompact]}>
            <Image
              source={BREEDING_HERO_IMAGE}
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
                  <Text style={styles.screenTitle}>Breeding</Text>
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
                  placeholder="Search by name or ring #"
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
                onPress={onAddPairing}
                accessibilityLabel="Add pairing"
                style={({ pressed }) => [styles.addButton, compact && styles.addButtonCompact, pressed && styles.pressed]}
              >
                <Ionicons name="add" size={27} color="#fff" />
                {!compact && <Text style={styles.addButtonText}>Add Pairing</Text>}
              </Pressable>
            </View>

            <Text style={[styles.eyebrow, styles.summaryHeading]}>BREEDING SUMMARY</Text>
            <View style={styles.summaryPanel}>
              <View style={styles.summaryPrimary}>
                <View style={styles.summaryAccent} />
                <View style={styles.summaryPrimaryIcon}>
                  <MaterialCommunityIcons name="link-variant" size={25} color="#ff8500" />
                </View>
                <View style={styles.summaryPrimaryCopy}>
                  <Text style={styles.summaryPrimaryLabel}>ACTIVE PAIRINGS</Text>
                  <View style={styles.summaryPrimaryValueRow}>
                    <Text style={styles.summaryPrimaryValue}>{summaryItems[0].value}</Text>
                    <Text style={styles.summaryPrimaryUnit}>breeding pairs</Text>
                  </View>
                </View>
                <View style={styles.summaryLiveBadge}>
                  <View style={styles.summaryLiveDot} />
                  <Text style={styles.summaryLiveText}>Active</Text>
                </View>
              </View>
              <View style={styles.summaryMetrics}>
                {summaryItems.slice(1).map((item, index, items) => (
                  <SummaryMetric key={item.label} item={item} isLast={index === items.length - 1} />
                ))}
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.eyebrow}>ACTIVE PAIRINGS</Text>
              <View style={styles.sectionCount}>
                <Text style={styles.sectionCountText}>{visiblePairings.length} active</Text>
              </View>
            </View>

            <View style={styles.pairingList}>
              {visiblePairings.map((pairing) => (
                <PairingCard
                  key={pairing.id}
                  pairing={pairing}
                  collections={eggCollectionsByPairing[pairing.id] || []}
                  compact={compact}
                  onPress={() => onOpenPairing(pairing)}
                />
              ))}
              {!visiblePairings.length && (
                <View style={styles.emptyState}>
                  <MaterialCommunityIcons name="link-variant" size={32} color="#5f6a6e" />
                  <Text style={styles.emptyText}>No pairings found</Text>
                </View>
              )}
            </View>

            <View style={styles.reminder}>
              <MaterialCommunityIcons name="clock-outline" size={24} color="#ff8500" />
              <Text style={styles.reminderText}>For best results, set properly stored eggs within 3-7 days.</Text>
            </View>
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
  heroHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  headerButton: {
    width: 40, height: 40, borderRadius: 20, borderWidth: 1,
    borderColor: 'rgba(190, 204, 208, 0.35)', backgroundColor: 'rgba(2, 8, 11, 0.65)',
    alignItems: 'center', justifyContent: 'center',
  },
  screenTitle: { color: '#f0f2f3', fontSize: 17, fontWeight: '700', letterSpacing: 0 },
  heroCopy: { marginTop: 'auto', paddingHorizontal: 18, paddingBottom: 24 },
  heroCopyNarrow: { paddingHorizontal: 12, paddingBottom: 18 },
  farmName: {
    color: '#f5f6f6', fontSize: 34, lineHeight: 40, fontWeight: '800', letterSpacing: 0,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', web: 'Georgia' }),
    textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 5,
  },
  farmNameNarrow: { fontSize: 29, lineHeight: 34 },
  farmTagline: { marginTop: 6, color: '#bac1c3', fontSize: 14, lineHeight: 20, letterSpacing: 0 },
  farmMeta: { marginTop: 16, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 10 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { color: '#b8c0c2', fontSize: 12, letterSpacing: 0 },
  metaDivider: { width: 1, height: 14, backgroundColor: '#6d777a' },
  content: { paddingHorizontal: 10, paddingBottom: 18 },
  contentNarrow: { paddingHorizontal: 8 },
  actionRow: { flexDirection: 'row', gap: 10 },
  actionRowCompact: { flexDirection: 'row', gap: 8 },
  searchBox: {
    flex: 1, height: 52, flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, borderColor: '#28343a',
    backgroundColor: '#0b1418',
  },
  searchInput: {
    flex: 1, height: 50, paddingVertical: 0, color: '#e7ebec', fontSize: 14,
    letterSpacing: 0, outlineStyle: 'none',
  },
  addButton: {
    height: 52, minWidth: 155, paddingHorizontal: 20, borderRadius: 8,
    backgroundColor: '#f66f00', flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 9,
  },
  addButtonCompact: { width: 52, minWidth: 52, paddingHorizontal: 0 },
  addButtonText: { color: '#fff', fontSize: 14, fontWeight: '700', letterSpacing: 0 },
  eyebrow: { color: '#899397', fontSize: 10, fontWeight: '600', letterSpacing: 0 },
  summaryHeading: { marginTop: 14 },
  summaryPanel: { marginTop: 7, borderRadius: 8, borderWidth: 1, borderColor: '#2b3030', backgroundColor: '#0b1418', overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.24, shadowRadius: 12, elevation: 4 },
  summaryPrimary: { minHeight: 72, paddingHorizontal: 13, paddingVertical: 11, flexDirection: 'row', alignItems: 'center', backgroundColor: '#0d171b' },
  summaryAccent: { position: 'absolute', left: 0, top: 14, bottom: 14, width: 3, borderTopRightRadius: 2, borderBottomRightRadius: 2, backgroundColor: '#ff8500' },
  summaryPrimaryIcon: { width: 42, height: 42, borderRadius: 8, backgroundColor: 'rgba(255,133,0,0.09)', alignItems: 'center', justifyContent: 'center' },
  summaryPrimaryCopy: { flex: 1, minWidth: 0, marginLeft: 11 },
  summaryPrimaryLabel: { color: '#8c989b', fontSize: 8, fontWeight: '700', letterSpacing: 0 },
  summaryPrimaryValueRow: { marginTop: 2, flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  summaryPrimaryValue: { color: '#f2f4f4', fontSize: 23, lineHeight: 27, fontWeight: '800', letterSpacing: 0 },
  summaryPrimaryUnit: { color: '#c0c7c9', fontSize: 11, letterSpacing: 0 },
  summaryLiveBadge: { height: 27, paddingHorizontal: 9, borderRadius: 14, borderWidth: 1, borderColor: '#275032', backgroundColor: 'rgba(38,126,58,0.1)', flexDirection: 'row', alignItems: 'center', gap: 5 },
  summaryLiveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#63dc72' },
  summaryLiveText: { color: '#75df81', fontSize: 8, fontWeight: '700', letterSpacing: 0 },
  summaryMetrics: { minHeight: 69, flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#223037', backgroundColor: '#091216' },
  summaryMetric: { flex: 1, minWidth: 0, paddingHorizontal: 7, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  summaryMetricDivider: { borderRightWidth: 1, borderRightColor: '#223037' },
  summaryMetricIcon: { width: 29, height: 29, borderRadius: 7, borderWidth: 1, borderColor: 'rgba(255,133,0,0.18)', backgroundColor: 'rgba(255,133,0,0.08)', alignItems: 'center', justifyContent: 'center' },
  summaryMetricCopy: { minWidth: 0 },
  summaryMetricValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  summaryMetricValue: { color: '#f0f2f3', fontSize: 16, fontWeight: '800', letterSpacing: 0 },
  summaryMetricLabel: { color: '#aab3b6', fontSize: 8, letterSpacing: 0 },
  summaryMetricDetail: { marginTop: 2, color: '#687579', fontSize: 7, letterSpacing: 0 },
  sectionHeader: { marginTop: 26, marginBottom: 7, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionCount: {
    minWidth: 66, height: 26, borderRadius: 13, borderWidth: 1,
    borderColor: '#18262c', backgroundColor: '#091216', alignItems: 'center', justifyContent: 'center',
  },
  sectionCountText: { color: '#899397', fontSize: 10, letterSpacing: 0 },
  pairingList: { gap: 8 },
  pairingCard: {
    borderRadius: 8, borderWidth: 1, borderColor: '#18262c',
    backgroundColor: '#0a1317', overflow: 'hidden',
  },
  pairingTop: { minHeight: 82, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10 },
  pairingTopCompact: { gap: 7, padding: 8 },
  avatarPair: { flexDirection: 'row', alignItems: 'center', paddingRight: 2 },
  avatarWrap: { position: 'relative', zIndex: 2 },
  avatarTrailing: { marginLeft: -16, zIndex: 1 },
  avatar: {
    width: 54, height: 54, borderRadius: 27, borderWidth: 2,
    borderColor: '#18262c', backgroundColor: '#0a1317',
  },
  pairingCopy: { flex: 1, minWidth: 0 },
  pairingTitle: { color: '#edf0f1', fontSize: 15, lineHeight: 20, fontWeight: '600', letterSpacing: 0 },
  pairingTitleCompact: { fontSize: 12, lineHeight: 15 },
  pairingCross: { color: '#ff8500' },
  pairingBloodline: { marginTop: 3, color: '#9fa8ab', fontSize: 10, lineHeight: 14, letterSpacing: 0 },
  pairingId: { marginTop: 3, color: '#778286', fontSize: 9, letterSpacing: 0 },
  pairStatus: {
    maxWidth: 78, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 5,
  },
  pairStatusCompact: { maxWidth: 58, gap: 4 },
  pairStatusDot: { width: 6, height: 6, borderRadius: 3 },
  pairStatusText: { fontSize: 10, fontWeight: '600', letterSpacing: 0 },
  pairStatusTextCompact: { fontSize: 8 },
  pairingMetrics: {
    minHeight: 54, borderTopWidth: 1, borderTopColor: '#162329',
    flexDirection: 'row', alignItems: 'center', paddingVertical: 8,
  },
  pairMetric: {
    flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8, paddingHorizontal: 8,
  },
  pairMetricDivider: { borderRightWidth: 1, borderRightColor: '#1d2b31' },
  pairMetricLabel: { color: '#778286', fontSize: 8, lineHeight: 11, letterSpacing: 0 },
  pairMetricValue: { marginTop: 2, color: '#d7dcde', fontSize: 10, lineHeight: 13, letterSpacing: 0 },
  reminder: {
    minHeight: 48, marginTop: 9, paddingHorizontal: 17, borderRadius: 8,
    borderWidth: 1, borderColor: '#242c2e', backgroundColor: '#15191a',
    flexDirection: 'row', alignItems: 'center', gap: 13,
  },
  reminderText: { flex: 1, color: '#8f989b', fontSize: 11, lineHeight: 16, letterSpacing: 0 },
  emptyState: { height: 180, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyText: { color: '#7f8a8e', fontSize: 13 },
  pressed: { opacity: 0.72 },
  cardPressed: { opacity: 0.75, transform: [{ scale: 0.995 }] },
});

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
  { icon: 'link-variant', value: '12', label: 'Active Groups', compactLabel: 'Active Groups', detail: 'breeding groups' },
  { icon: 'egg-outline', value: '48', label: 'Holding Eggs', compactLabel: 'Holding Eggs', detail: 'across all groups' },
  { icon: 'clock-alert-outline', value: '3', label: 'Need Attention', compactLabel: 'Need Attention', detail: 'groups to check' },
];

const BREEDING_GROUPS = [
  { name: 'Sweater x Kelso', composition: '2 cocks - 8 hens', id: 'BG-021', started: 'Aug 19', eggs: 18, oldestEgg: '5 days', status: 'Active', statusColor: '#5eea78' },
  { name: 'Kelso', composition: '1 cock - 6 hens', id: 'BG-018', started: 'Aug 16', eggs: 14, oldestEgg: '4 days', status: 'Active', statusColor: '#5eea78' },
  { name: 'Roundhead x Hatch', composition: '2 cocks - 10 hens', id: 'BG-024', started: 'Aug 22', eggs: 16, oldestEgg: '3 days', status: 'Active', statusColor: '#5eea78' },
  { name: 'Sweater', composition: '1 cock - 6 hens', id: 'BG-015', started: 'Aug 1', eggs: 0, oldestEgg: '--', status: 'No collection', statusColor: '#ff6673' },
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
      <View style={styles.summaryMetricValueRow}>
        <MaterialCommunityIcons name={item.icon} size={29} color="#ff8200" />
        <Text style={styles.summaryMetricValue}>{item.value}</Text>
      </View>
      <Text numberOfLines={2} style={styles.summaryMetricLabel}>{item.compactLabel}</Text>
      {item.detail && <Text numberOfLines={1} style={styles.summaryMetricDetail}>{item.detail}</Text>}
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

function BreedingGroupCard({ group, compact, onPress }) {
  const active = group.status === 'Active';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open breeding group ${group.name}`}
      onPress={onPress}
      style={({ pressed }) => [styles.pairingCard, pressed && styles.cardPressed]}
    >
      <View style={styles.groupAccent} />
      <View style={[styles.pairingTop, compact && styles.pairingTopCompact]}>
        <View style={styles.pairingCopy}>
          <Text numberOfLines={compact ? 2 : 1} style={[styles.pairingTitle, compact && styles.pairingTitleCompact]}>
            {group.name}
          </Text>
          <View style={styles.groupMetaLine}>
            <Text numberOfLines={1} style={styles.pairingBloodline}>{group.composition}</Text>
            <View style={styles.groupIdBadge}>
              <Text style={styles.pairingId}>{group.id}</Text>
            </View>
          </View>
        </View>

        <View style={styles.groupCardAction}>
          <View style={[styles.pairStatus, !active && styles.pairStatusAttention, compact && styles.pairStatusCompact]}>
            <View style={[styles.pairStatusDot, { backgroundColor: group.statusColor }]} />
            <Text numberOfLines={1} style={[styles.pairStatusText, compact && styles.pairStatusTextCompact, !active && styles.pairStatusTextAttention]}>{group.status}</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={18} color="#526067" />
        </View>
      </View>

      <View style={styles.pairingMetrics}>
        <PairMetric icon="calendar-month-outline" label="Started" value={group.started} />
        <PairMetric icon="egg-outline" label="Holding" value={`${group.eggs} eggs`} />
        <PairMetric icon="clock-outline" label="Oldest egg" value={group.oldestEgg} isLast />
      </View>
    </Pressable>
  );
}

export default function BreedingScreen({ onBack, onAddPairing, onOpenPairing, addedPairings = [] }) {
  const { width } = useWindowDimensions();
  const compact = width < 480;
  const narrow = width < 390;
  const [query, setQuery] = useState('');
  const summaryItems = BREEDING_SUMMARY;
  const allGroups = useMemo(() => [
    ...addedPairings.map((pairing) => ({
      name: pairing.groupName || pairing.male,
      composition: pairing.composition || '1 cock - 1 hen',
      id: pairing.id,
      started: pairing.started,
      eggs: Number.parseInt(pairing.eggs, 10) || 0,
      oldestEgg: pairing.oldestEgg || '--',
      status: pairing.status || 'Active',
      statusColor: pairing.statusColor || '#5eea78',
      pairing,
    })),
    ...BREEDING_GROUPS.map((group, index) => ({ ...group, pairing: PAIRINGS[index % PAIRINGS.length] })),
  ], [addedPairings]);

  const visibleGroups = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return allGroups;
    return allGroups.filter((group) =>
      `${group.name} ${group.composition} ${group.id} ${group.status}`
        .toLowerCase()
        .includes(normalized),
    );
  }, [allGroups, query]);

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
                  placeholder="Search by bloodline or group name"
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
                accessibilityLabel="Add breeding group"
                style={({ pressed }) => [styles.addButton, compact && styles.addButtonCompact, pressed && styles.pressed]}
              >
                <Ionicons name="add" size={24} color="#fff" />
                <Text style={styles.addButtonText}>Add Group</Text>
              </Pressable>
            </View>

            <Text style={[styles.eyebrow, styles.summaryHeading]}>BREEDING SUMMARY</Text>
            <View style={styles.summaryPanel}>
              <View style={styles.summaryMetrics}>
                {summaryItems.map((item, index, items) => (
                  <SummaryMetric key={item.label} item={item} isLast={index === items.length - 1} />
                ))}
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.eyebrow}>BREEDING GROUPS</Text>
              <View style={styles.sectionCount}>
                <Text style={styles.sectionCountText}>{visibleGroups.filter((group) => group.status === 'Active').length} active</Text>
                <Ionicons name="chevron-down" size={13} color="#7f8a8e" />
              </View>
            </View>

            <View style={styles.pairingList}>
              {visibleGroups.map((group) => (
                <BreedingGroupCard
                  key={group.id}
                  group={group}
                  compact={compact}
                  onPress={() => onOpenPairing(group.pairing)}
                />
              ))}
              {!visibleGroups.length && (
                <View style={styles.emptyState}>
                  <MaterialCommunityIcons name="link-variant" size={32} color="#5f6a6e" />
                  <Text style={styles.emptyText}>No breeding groups found</Text>
                </View>
              )}
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
  hero: { height: 272, overflow: 'hidden', backgroundColor: '#101719' },
  heroCompact: { height: 248 },
  heroSafeArea: { flex: 1 },
  heroHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: Platform.OS === 'web' ? 10 : 3,
  },
  heroHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
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
    height: 52, minWidth: 103, paddingHorizontal: 12, borderRadius: 8,
    backgroundColor: '#f66f00', flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 7,
  },
  addButtonCompact: { minWidth: 96, paddingHorizontal: 10 },
  addButtonText: { color: '#fff', fontSize: 11, fontWeight: '800', letterSpacing: 0 },
  eyebrow: { color: '#899397', fontSize: 10, fontWeight: '600', letterSpacing: 0 },
  summaryHeading: { marginTop: 14 },
  summaryPanel: { marginTop: 14 },
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
  summaryMetrics: { flexDirection: 'row', gap: 10 },
  summaryMetric: { flex: 1, minWidth: 0, height: 112, paddingHorizontal: 5, borderRadius: 8, borderWidth: 1, borderColor: '#1c2a30', backgroundColor: '#0b1418', alignItems: 'center', justifyContent: 'center' },
  summaryMetricDivider: {},
  summaryMetricIcon: { width: 29, height: 29, borderRadius: 7, borderWidth: 1, borderColor: 'rgba(255,133,0,0.18)', backgroundColor: 'rgba(255,133,0,0.08)', alignItems: 'center', justifyContent: 'center' },
  summaryMetricCopy: { minWidth: 0, alignItems: 'center' },
  summaryMetricValueRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  summaryMetricValue: { color: '#f0f2f3', fontSize: 27, fontWeight: '600', letterSpacing: 0 },
  summaryMetricLabel: { marginTop: 8, color: '#d4d9db', fontSize: 12, textAlign: 'center', letterSpacing: 0 },
  summaryMetricDetail: { marginTop: 4, color: '#899397', fontSize: 10, letterSpacing: 0 },
  sectionHeader: { marginTop: 26, marginBottom: 7, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionCount: {
    minWidth: 66, height: 26, borderRadius: 13, borderWidth: 1,
    borderColor: '#18262c', backgroundColor: '#091216', alignItems: 'center', justifyContent: 'center',
    flexDirection: 'row', gap: 4, paddingHorizontal: 9,
  },
  sectionCountText: { color: '#899397', fontSize: 10, letterSpacing: 0 },
  pairingList: { gap: 8 },
  pairingCard: {
    position: 'relative', borderRadius: 8, borderWidth: 1, borderColor: '#1a292f',
    backgroundColor: '#091216', overflow: 'hidden',
  },
  groupAccent: { position: 'absolute', left: 0, top: 13, width: 3, height: 28, borderRadius: 2, backgroundColor: '#ff7900' },
  pairingTop: { minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: 12, paddingLeft: 16, paddingRight: 11, paddingVertical: 10 },
  pairingTopCompact: { gap: 7, paddingLeft: 14, paddingRight: 8, paddingVertical: 9 },
  avatarPair: { flexDirection: 'row', alignItems: 'center', paddingRight: 2 },
  avatarWrap: { position: 'relative', zIndex: 2 },
  avatarTrailing: { marginLeft: -16, zIndex: 1 },
  avatar: {
    width: 54, height: 54, borderRadius: 27, borderWidth: 2,
    borderColor: '#18262c', backgroundColor: '#0a1317',
  },
  pairingCopy: { flex: 1, minWidth: 0 },
  pairingTitle: {
    color: '#f2f5f6',
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '800',
    letterSpacing: 0,
  },
  pairingTitleCompact: { fontSize: 14, lineHeight: 18 },
  groupMetaLine: { marginTop: 5, flexDirection: 'row', alignItems: 'center', gap: 8 },
  pairingBloodline: { color: '#94a0a4', fontSize: 10, lineHeight: 14, letterSpacing: 0 },
  groupIdBadge: { borderRadius: 4, backgroundColor: 'rgba(255, 121, 0, 0.1)', paddingHorizontal: 5, paddingVertical: 2 },
  pairingId: { color: '#e8903a', fontSize: 8, fontWeight: '700', letterSpacing: 0 },
  groupCardAction: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  pairStatus: {
    maxWidth: 102, minHeight: 22, borderRadius: 11, paddingHorizontal: 8,
    backgroundColor: 'rgba(35, 110, 63, 0.22)', flexDirection: 'row',
    alignItems: 'center', justifyContent: 'flex-end', gap: 5,
  },
  pairStatusAttention: { backgroundColor: 'rgba(158, 45, 57, 0.22)' },
  pairStatusCompact: { maxWidth: 90, paddingHorizontal: 7, gap: 4 },
  pairStatusDot: { width: 6, height: 6, borderRadius: 3 },
  pairStatusText: { color: '#7de596', fontSize: 9, fontWeight: '700', letterSpacing: 0 },
  pairStatusTextAttention: { color: '#ff8994' },
  pairStatusTextCompact: { fontSize: 8 },
  pairingMetrics: {
    minHeight: 48, marginHorizontal: 8, marginBottom: 8, borderRadius: 6,
    backgroundColor: '#071014', flexDirection: 'row', alignItems: 'center', paddingVertical: 7,
  },
  pairMetric: {
    flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8, paddingHorizontal: 8,
  },
  pairMetricDivider: { borderRightWidth: 1, borderRightColor: '#17252a' },
  pairMetricLabel: { color: '#778286', fontSize: 8, lineHeight: 11, letterSpacing: 0 },
  pairMetricValue: { marginTop: 2, color: '#d7dcde', fontSize: 10, lineHeight: 13, letterSpacing: 0 },
  emptyState: { height: 180, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyText: { color: '#7f8a8e', fontSize: 13 },
  pressed: { opacity: 0.72 },
  cardPressed: { opacity: 0.75, transform: [{ scale: 0.995 }] },
});

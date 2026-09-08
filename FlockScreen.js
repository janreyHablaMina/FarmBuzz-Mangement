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
import { FLOCK_HERO_IMAGE } from './constants';

const FLOCK_BADGE_IMAGE = require('./assets/flock-badge-illustration.png');

const FILTERS = [
  { key: 'all', label: 'All', count: 126 },
  { key: 'cock', label: 'Cocks', count: 36 },
  { key: 'hen', label: 'Hens', count: 34 },
  { key: 'stag', label: 'Stags', count: 30 },
  { key: 'pullet', label: 'Pullets', count: 26 },
];

function getFarmBuzzId(bird) {
  if (bird.farmBuzzId) return bird.farmBuzzId;
  const ring = bird.details?.find((detail) => detail.icon === 'tag-outline')?.text;
  const digits = (ring || bird.name).replace(/\D/g, '').slice(-5) || '001';
  return `FBZ-${new Date().getFullYear()}-${digits.padStart(3, '0')}`;
}

export const BIRDS = [
  {
    name: 'Razor 014',
    type: 'Cock',
    filter: 'cock',
    bloodline: 'Kelso Bloodline',
    details: [
      { icon: 'calendar-month-outline', text: '20 months' },
      { icon: 'tag-outline', text: 'Ring #014' },
      { icon: 'trophy-outline', text: '3 wins' },
    ],
    status: 'Active',
    statusColor: '#79e718',
    statusBackground: 'rgba(75, 150, 18, 0.13)',
    image:
      'https://images.unsplash.com/photo-1730360037813-9777f13b88bb?auto=format&fit=crop&w=400&q=82',
  },
  {
    name: 'Ring #027',
    type: 'Hen',
    filter: 'hen',
    bloodline: 'Sweater Bloodline',
    details: [
      { icon: 'calendar-month-outline', text: '2 years' },
      { icon: 'egg-outline', text: '68 eggs' },
    ],
    status: 'Near Laying',
    statusColor: '#ff9100',
    statusBackground: 'rgba(160, 88, 0, 0.13)',
    image:
      'https://images.unsplash.com/photo-1770221499235-11dd1041e181?auto=format&fit=crop&w=400&q=82',
  },
  {
    name: 'Comet 031',
    type: 'Stag',
    filter: 'stag',
    bloodline: 'Hatch Bloodline',
    details: [
      { icon: 'calendar-month-outline', text: '10 months' },
      { icon: 'weight-kilogram', text: '2.4 kg' },
    ],
    status: 'Growing',
    statusColor: '#00d9f0',
    statusBackground: 'rgba(0, 120, 150, 0.13)',
    image:
      'https://images.unsplash.com/photo-1551127501-d4385c7484b4?auto=format&fit=crop&w=400&q=82',
  },
  {
    name: 'Ruby 052',
    type: 'Pullet',
    filter: 'pullet',
    bloodline: 'Roundhead Bloodline',
    details: [
      { icon: 'calendar-month-outline', text: '8 months' },
      { icon: 'weight-kilogram', text: '1.8 kg' },
    ],
    status: 'Healthy',
    statusColor: '#79e718',
    statusBackground: 'rgba(75, 150, 18, 0.13)',
    image:
      'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=400&q=82',
  },
  {
    name: 'Cock FB-00142',
    type: 'Cock',
    filter: 'cock',
    bloodline: 'Bloodline unknown',
    details: [{ icon: 'tag-outline', text: 'Ring unavailable' }],
    status: 'Needs Vaccine',
    statusColor: '#ff3c44',
    statusBackground: 'rgba(160, 30, 35, 0.14)',
    image:
      'https://images.unsplash.com/photo-1730360037813-9777f13b88bb?auto=format&fit=crop&w=400&q=82',
  },
  {
    name: 'Amber 101',
    farmBuzzId: 'FBZ-2026-101',
    type: 'Hen',
    filter: 'hen',
    bloodline: 'Bloodline unknown',
    details: [
      { icon: 'calendar-month-outline', text: '9 months' },
      { icon: 'tag-outline', text: 'Ring #101' },
    ],
    status: 'Active',
    statusColor: '#ff8500',
    statusBackground: 'rgba(255, 133, 0, 0.13)',
    healthRecordsMode: 'empty',
    image:
      'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=400&q=82',
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

function FilterChip({ item, active, onPress, compact }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.filterChip,
        compact && styles.filterChipCompact,
        active && styles.filterChipActive,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.filterLabelRow}>
        <Text numberOfLines={1} style={[styles.filterLabel, compact && styles.filterLabelCompact]}>
          {item.label}
        </Text>
      </View>
      <Text style={[styles.filterCount, compact && styles.filterCountCompact, active && styles.filterCountActive]}>
        {item.count}
      </Text>
    </Pressable>
  );
}

function BirdCard({ bird, compact, onPress }) {
  const genderColor = bird.filter === 'hen' || bird.filter === 'pullet' ? '#ff2448' : '#168cff';
  const genderIcon = bird.filter === 'hen' || bird.filter === 'pullet' ? 'gender-female' : 'gender-male';
  const farmBuzzId = getFarmBuzzId(bird);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${bird.name}, ${bird.status}`}
      onPress={onPress}
      style={({ pressed }) => [styles.birdCard, compact && styles.birdCardCompact, pressed && styles.cardPressed]}
    >
      <Image source={bird.image} style={[styles.birdImage, compact && styles.birdImageCompact]} contentFit="cover" transition={250} cachePolicy="memory-disk" />
      <View style={styles.birdContent}>
        <View style={styles.birdTitleRow}>
          <Text numberOfLines={1} style={[styles.birdName, compact && styles.birdNameCompact]}>{bird.name}</Text>
          <MaterialCommunityIcons name={genderIcon} size={compact ? 15 : 17} color={genderColor} />
          {!compact && <Text style={styles.birdType}>{bird.type}</Text>}
        </View>
        <Text numberOfLines={1} style={styles.bloodline}>{bird.bloodline}</Text>
        <View style={styles.farmIdRow}>
          <Text style={styles.farmIdLabel}>ID</Text>
          <Text numberOfLines={1} style={styles.farmIdText}>{farmBuzzId}</Text>
        </View>
      </View>
      <View style={[styles.statusSide, compact && styles.statusSideCompact]}><View style={[styles.statusDot, { backgroundColor: bird.statusColor }]} /><Text numberOfLines={2} style={[styles.statusInlineText, compact && styles.statusInlineTextCompact, { color: bird.statusColor }]}>{bird.status}</Text></View>
      <Ionicons name="chevron-forward" size={compact ? 18 : 21} color="#8e999d" />
    </Pressable>
  );
}

function FlockSummary() {
  return (
    <View style={styles.summaryPanel}>
      <View style={styles.summaryIcon}>
        <Image source={FLOCK_BADGE_IMAGE} contentFit="contain" style={styles.summaryIconImage} />
      </View>
      <View>
        <Text style={styles.summaryValue}>126</Text>
        <Text style={styles.summaryLabel}>Total birds in this farm</Text>
      </View>
    </View>
  );
}

export default function FlockScreen({
  onBack,
  onAddBird,
  onOpenBird,
  addedBirds = [],
  birdOverrides = {},
}) {
  const { width } = useWindowDimensions();
  const compact = width < 480;
  const narrow = width < 390;
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');

  const visibleBirds = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return [...addedBirds, ...BIRDS]
      .map((bird) => birdOverrides[bird._recordKey || bird.farmBuzzId || bird.name] || bird)
      .filter((bird) => {
      const matchesFilter = filter === 'all' || bird.filter === filter;
      const matchesQuery = !normalized || `${bird.name} ${bird.bloodline} ${getFarmBuzzId(bird)}`.toLowerCase().includes(normalized);
      return matchesFilter && matchesQuery;
    });
  }, [addedBirds, birdOverrides, filter, query]);

  return (
    <View style={styles.screen}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.pageWrap}>
        <View style={styles.page}>
          <View style={[styles.hero, compact && styles.heroCompact]}>
            <Image
              source={FLOCK_HERO_IMAGE}
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
                  <Text style={styles.screenTitle}>Flock</Text>
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
                onPress={onAddBird}
                accessibilityLabel="Add bird"
                style={({ pressed }) => [
                  styles.addBirdButton,
                  compact && styles.addBirdButtonCompact,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons name="add" size={28} color="#fff" />
                {!compact && <Text style={styles.addBirdText}>Add Bird</Text>}
              </Pressable>
            </View>

            <View style={[styles.filterRow, compact && styles.filterRowCompact]}>
              {FILTERS.map((item) => (
                <FilterChip
                  key={item.key}
                  item={item}
                  active={filter === item.key}
                  onPress={() => setFilter(item.key)}
                  compact={compact}
                />
              ))}
            </View>

            <View style={styles.birdList}>
              {visibleBirds.map((bird) => (
                <BirdCard
                  key={bird.name}
                  bird={bird}
                  compact={compact}
                  onPress={() => onOpenBird(bird)}
                />
              ))}
              {!visibleBirds.length && (
                <View style={styles.emptyState}>
                  <MaterialCommunityIcons name="bird" size={32} color="#5f6a6e" />
                  <Text style={styles.emptyText}>No birds found</Text>
                </View>
              )}
            </View>

            <FlockSummary />
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
  screenTitle: { color: '#f4f6f6', fontSize: 19, fontWeight: '700', letterSpacing: 0 },
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
  content: { paddingHorizontal: 16, paddingBottom: 18 },
  contentNarrow: { paddingHorizontal: 8 },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 0 },
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
  addBirdButton: {
    height: 52, minWidth: 165, paddingHorizontal: 22, borderRadius: 8,
    backgroundColor: '#f66f00', flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 11,
  },
  addBirdButtonCompact: { width: 52, minWidth: 52, paddingHorizontal: 0 },
  addBirdText: { color: '#fff', fontSize: 15, fontWeight: '700', letterSpacing: 0 },
  filterRow: { width: '100%', flexDirection: 'row', gap: 6, paddingVertical: 16 },
  filterRowCompact: { gap: 4 },
  filterChip: {
    flex: 1, minWidth: 0, height: 62, borderRadius: 8, borderWidth: 1, borderColor: '#172329',
    backgroundColor: '#0b1418', alignItems: 'center', justifyContent: 'center',
  },
  filterChipCompact: { height: 58 },
  filterChipActive: { borderColor: '#ff7900', backgroundColor: 'rgba(255, 121, 0, 0.08)' },
  filterLabelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
  filterLabel: { color: '#e4e8e9', fontSize: 13, fontWeight: '600', letterSpacing: 0 },
  filterLabelCompact: { fontSize: 10 },
  filterCount: { marginTop: 3, color: '#9ba5a8', fontSize: 11, letterSpacing: 0 },
  filterCountCompact: { fontSize: 9 },
  filterCountActive: { color: '#ff9a1f' },
  birdList: { gap: 8 },
  birdCard: {
    minHeight: 82, borderRadius: 8, borderWidth: 1, borderColor: '#172329',
    backgroundColor: '#0a1317', flexDirection: 'row', alignItems: 'center',
    padding: 6, gap: 10, overflow: 'hidden',
  },
  birdCardCompact: { minHeight: 78, padding: 6, gap: 8 },
  birdImage: { width: 68, height: 68, borderRadius: 6, backgroundColor: '#152126' },
  birdImageCompact: { width: 62, height: 66 },
  birdContent: { flex: 1, minWidth: 0, alignSelf: 'stretch', justifyContent: 'center' },
  birdTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, minWidth: 0 },
  birdName: { color: '#f0f2f3', fontSize: 16, lineHeight: 20, fontWeight: '600', letterSpacing: 0, maxWidth: '62%' },
  birdNameCompact: { fontSize: 14, lineHeight: 18, maxWidth: '78%' },
  birdType: { color: '#a4adb0', fontSize: 11, letterSpacing: 0 },
  bloodline: { marginTop: 3, color: '#929da0', fontSize: 10, lineHeight: 14, letterSpacing: 0 },
  farmIdRow: { marginTop: 2, flexDirection: 'row', alignItems: 'center', gap: 4 },
  farmIdLabel: { color: '#ff8500', fontSize: 7, lineHeight: 10, fontWeight: '800', letterSpacing: 0 },
  farmIdText: { color: '#c98745', fontSize: 8, lineHeight: 10, fontWeight: '600', letterSpacing: 0 },
  statusSide: { width: 92, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 5 },
  statusSideCompact: { width: 68 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusInlineText: { fontSize: 9, lineHeight: 12, fontWeight: '600', letterSpacing: 0 },
  statusInlineTextCompact: { maxWidth: 56, fontSize: 8, lineHeight: 10, textAlign: 'right' },
  cardPressed: { opacity: 0.75, transform: [{ scale: 0.995 }] },
  emptyState: { height: 190, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyText: { color: '#7f8a8e', fontSize: 13 },
  summaryPanel: {
    minHeight: 70, marginTop: 10, paddingHorizontal: 16, borderRadius: 8,
    borderWidth: 1, borderColor: '#1c292f', backgroundColor: '#0b1418',
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  summaryIcon: {
    width: 42, height: 42, borderRadius: 21, borderWidth: 1, borderColor: '#b45200',
    alignItems: 'center', justifyContent: 'center', backgroundColor: '#10191d', overflow: 'hidden',
  },
  summaryIconImage: { width: 30, height: 30 },
  summaryValue: { color: '#f2f4f4', fontSize: 22, lineHeight: 25, fontWeight: '700', letterSpacing: 0 },
  summaryLabel: { marginTop: 1, color: '#8e989b', fontSize: 10, letterSpacing: 0 },
  pressed: { opacity: 0.72 },
});

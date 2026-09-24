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
  const quickDetails = bird.details?.slice(0, 2) || [];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${bird.name}, ${bird.status}`}
      onPress={onPress}
      style={({ pressed }) => [styles.birdCard, compact && styles.birdCardCompact, pressed && styles.cardPressed]}
    >
      <View style={styles.recordHeader}>
        <View style={styles.recordIdBlock}>
          <MaterialCommunityIcons name="identifier" size={15} color="#ff8500" />
          <Text numberOfLines={1} style={styles.farmIdText}>{farmBuzzId}</Text>
        </View>
        <View style={[styles.typeBadge, { borderColor: `${genderColor}55` }]}>
          <MaterialCommunityIcons name={genderIcon} size={13} color={genderColor} />
          <Text style={[styles.birdType, { color: genderColor }]}>{bird.type}</Text>
        </View>
      </View>

      <View style={styles.recordBody}>
        <View style={styles.portraitFrame}>
          <Image
            source={bird.image}
            style={styles.birdImage}
            contentFit="cover"
            transition={250}
            cachePolicy="memory-disk"
          />
        </View>
        <View style={styles.recordContent}>
          <Text numberOfLines={1} style={[styles.birdName, compact && styles.birdNameCompact]}>{bird.name}</Text>
          <Text numberOfLines={2} style={styles.bloodline}>{bird.bloodline}</Text>
          <View style={styles.detailGrid}>
            {quickDetails.map((detail) => (
              <View key={`${bird.name}-${detail.text}`} style={styles.detailPill}>
                <MaterialCommunityIcons name={detail.icon} size={13} color="#9fb0b6" />
                <Text numberOfLines={1} style={styles.detailText}>{detail.text}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.recordFooter}>
        <View style={styles.statusBlock}>
          <View style={[styles.statusDot, { backgroundColor: bird.statusColor }]} />
          <View style={styles.statusTextBlock}>
            <Text style={styles.footerLabel}>STATUS</Text>
            <Text numberOfLines={1} style={[styles.statusInlineText, { color: bird.statusColor }]}>{bird.status}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#718086" />
      </View>
    </Pressable>
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
              colors={['rgba(2, 7, 9, 0.12)', 'rgba(2, 7, 9, 0.44)', '#020709']}
              locations={[0, 0.54, 1]}
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

            <View style={styles.listHeading}>
              <View>
                <Text style={styles.overline}>ACTIVE FLOCK</Text>
                <Text style={styles.listTitle}>Birds</Text>
              </View>
              <Text style={styles.listCount}>{visibleBirds.length} shown</Text>
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
  hero: { height: 252, overflow: 'hidden', backgroundColor: '#020709' },
  heroCompact: { height: 230 },
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
  screenTitle: { color: '#f4f6f6', fontSize: 17, fontWeight: '700', letterSpacing: 0 },
  heroCopy: { marginTop: 'auto', paddingHorizontal: 20, paddingBottom: 22 },
  heroCopyNarrow: { paddingHorizontal: 14, paddingBottom: 18 },
  farmName: {
    color: '#f5f6f6', fontSize: 34, lineHeight: 40, fontWeight: '800', letterSpacing: 0,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', web: 'Georgia' }),
    textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 5,
  },
  farmNameNarrow: { fontSize: 29, lineHeight: 34 },
  farmTagline: { marginTop: 3, color: '#c2cbce', fontSize: 13, lineHeight: 18, letterSpacing: 0 },
  farmMeta: { marginTop: 12, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { color: '#d3dade', fontSize: 10, letterSpacing: 0 },
  metaDivider: { width: 1, height: 12, marginHorizontal: 5, backgroundColor: 'rgba(210,220,224,.35)' },
  content: { paddingHorizontal: 10, paddingBottom: 30 },
  contentNarrow: { paddingHorizontal: 8 },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 0 },
  actionRowCompact: { flexDirection: 'row', gap: 8 },
  searchBox: {
    flex: 1, height: 54, flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 14, borderRadius: 7, borderWidth: 1, borderColor: '#26373e',
    backgroundColor: '#081216',
  },
  searchInput: {
    flex: 1, height: 52, paddingVertical: 0, color: '#e7ebec', fontSize: 12,
    letterSpacing: 0, outlineStyle: 'none',
  },
  addBirdButton: {
    height: 54, minWidth: 112, paddingHorizontal: 16, borderRadius: 7,
    backgroundColor: '#f66f00', flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8,
  },
  addBirdButtonCompact: { width: 54, minWidth: 54, paddingHorizontal: 0 },
  addBirdText: { color: '#fff', fontSize: 11, fontWeight: '800', letterSpacing: 0 },
  filterRow: { width: '100%', flexDirection: 'row', gap: 7, paddingTop: 12, paddingBottom: 6 },
  filterRowCompact: { gap: 5 },
  filterChip: {
    flex: 1, minWidth: 0, height: 38, borderRadius: 19, borderWidth: 1, borderColor: '#26373e',
    backgroundColor: '#071014', alignItems: 'center', justifyContent: 'center',
  },
  filterChipCompact: { height: 34 },
  filterChipActive: { borderColor: '#ff7900', backgroundColor: 'rgba(255, 121, 0, 0.12)' },
  filterLabelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
  filterLabel: { color: '#dce3e5', fontSize: 10, fontWeight: '800', letterSpacing: 0 },
  filterLabelCompact: { fontSize: 9 },
  filterCount: { marginTop: 1, color: '#9ba5a8', fontSize: 8, letterSpacing: 0 },
  filterCountCompact: { fontSize: 7 },
  filterCountActive: { color: '#ff9a1f' },
  listHeading: { marginTop: 12, marginBottom: 9, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  overline: { color: '#899397', fontSize: 10, fontWeight: '600' },
  listTitle: { marginTop: 4, color: '#edf1f2', fontSize: 17, lineHeight: 22, fontWeight: '800' },
  listCount: { color: '#8e9a9e', fontSize: 10, fontWeight: '700' },
  birdList: { gap: 10 },
  birdCard: {
    borderRadius: 7, borderWidth: 1, borderColor: '#22343b',
    backgroundColor: '#071115', overflow: 'hidden',
  },
  birdCardCompact: {},
  recordHeader: {
    minHeight: 38, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#1b2a30',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10,
    backgroundColor: '#09171b',
  },
  recordIdBlock: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 6 },
  recordBody: { padding: 12, flexDirection: 'row', gap: 12 },
  portraitFrame: {
    width: 84, height: 84, borderRadius: 7, borderWidth: 1, borderColor: '#26383f',
    overflow: 'hidden', backgroundColor: '#152126',
  },
  birdImage: { width: '100%', height: '100%' },
  recordContent: { flex: 1, minWidth: 0 },
  birdName: { color: '#f3f5f5', fontSize: 17, lineHeight: 22, fontWeight: '800', letterSpacing: 0 },
  birdNameCompact: { fontSize: 13, lineHeight: 18 },
  typeBadge: { flexShrink: 0, minHeight: 23, paddingHorizontal: 7, borderRadius: 12, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 3 },
  birdType: { fontSize: 9, fontWeight: '700', letterSpacing: 0 },
  bloodline: { marginTop: 4, color: '#9ba6aa', fontSize: 11, lineHeight: 15, letterSpacing: 0 },
  detailGrid: { marginTop: 10, flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  detailPill: {
    maxWidth: '48%', minHeight: 26, paddingHorizontal: 8, borderRadius: 5,
    backgroundColor: '#0c1a1f', flexDirection: 'row', alignItems: 'center', gap: 5,
  },
  detailText: { flexShrink: 1, color: '#c9d1d3', fontSize: 9, lineHeight: 12, fontWeight: '700', letterSpacing: 0 },
  recordFooter: {
    minHeight: 46, paddingHorizontal: 12, borderTopWidth: 1, borderTopColor: '#1b2a30',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10,
    backgroundColor: '#061014',
  },
  statusBlock: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusTextBlock: { flex: 1, minWidth: 0 },
  footerLabel: { color: '#6f7f85', fontSize: 8, lineHeight: 10, fontWeight: '800', letterSpacing: 0 },
  farmIdText: { flexShrink: 1, color: '#d9e0e2', fontSize: 9, lineHeight: 12, fontWeight: '700', letterSpacing: 0 },
  statusDot: { width: 9, height: 9, borderRadius: 5 },
  statusInlineText: { flexShrink: 1, fontSize: 9, lineHeight: 12, fontWeight: '700', letterSpacing: 0 },
  cardPressed: { opacity: 0.75, transform: [{ scale: 0.995 }] },
  emptyState: { height: 190, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyText: { color: '#7f8a8e', fontSize: 13 },
  pressed: { opacity: 0.72 },
});

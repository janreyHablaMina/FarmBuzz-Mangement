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

const HEALTH_HERO_IMAGE = require('./assets/health-care-hero.png');

const ROOSTER_IMAGE =
  'https://images.unsplash.com/photo-1730360037813-9777f13b88bb?auto=format&fit=crop&w=300&q=82';
const BLACK_ROOSTER_IMAGE =
  'https://images.unsplash.com/photo-1551127501-d4385c7484b4?auto=format&fit=crop&w=300&q=82';
const HEN_IMAGE =
  'https://images.unsplash.com/photo-1770221499235-11dd1041e181?auto=format&fit=crop&w=300&q=82';
const BROWN_HEN_IMAGE =
  'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=300&q=82';

const HEALTH_SUMMARY = [
  { icon: 'alert-outline', value: '5', label: 'Need Attention', color: '#ff9a00', tint: 'rgba(255, 145, 0, 0.11)' },
  { icon: 'bandage', value: '3', label: 'Treatments', color: '#72e34e', tint: 'rgba(72, 180, 72, 0.11)' },
  { icon: 'needle', value: '7', label: 'Vaccinations Due', color: '#ff9700', tint: 'rgba(255, 145, 0, 0.11)' },
];

const ATTENTION_RECORDS = [
  { name: 'Razor 014', breed: 'Kelso Cock', image: ROOSTER_IMAGE, status: 'Injured', color: '#ff4c42' },
  { name: 'Thunder 041', breed: 'Sweater Stag', image: BLACK_ROOSTER_IMAGE, status: 'Sick', color: '#ff5b4f' },
  { name: 'Queen 033', breed: 'Kelso Hen', image: BROWN_HEN_IMAGE, status: 'Review', color: '#ff9a00' },
];

const UPCOMING_CARE = [
  {
    name: 'Blade 008', breed: 'Hatch Cock', image: BLACK_ROOSTER_IMAGE,
    care: 'Treatment', timing: '3 days left', icon: 'bottle-tonic-plus-outline', color: '#73e252',
  },
  {
    name: 'Lady 052', breed: 'Roundhead Hen', image: HEN_IMAGE,
    care: 'Vaccination', timing: 'Due in 3 days', icon: 'needle', color: '#ff9a00',
  },
  {
    name: 'Spike 022', breed: 'Kelso Hen', image: ROOSTER_IMAGE,
    care: 'Vaccination', timing: '2 days overdue', icon: 'needle', color: '#ff4c42',
  },
];

const SHORTCUTS = [
  { label: 'Treatments', detail: 'View all', icon: 'bottle-tonic-plus-outline', color: '#ff9a00', tint: 'rgba(255, 145, 0, 0.11)' },
  { label: 'Vaccinations', detail: 'View all', icon: 'needle', color: '#ff9a00', tint: 'rgba(255, 145, 0, 0.11)' },
  { label: 'Health History', detail: 'View records', icon: 'clipboard-text-outline', color: '#ff9a00', tint: 'rgba(255, 145, 0, 0.11)' },
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
        <View style={[styles.summaryIcon, { backgroundColor: item.tint }]}>
          <MaterialCommunityIcons name={item.icon} size={27} color={item.color} />
        </View>
        <Text style={[styles.summaryValue, narrow && styles.summaryValueNarrow]}>{item.value}</Text>
      </View>
      <Text numberOfLines={2} style={[styles.summaryLabel, narrow && styles.summaryLabelNarrow]}>
        {item.label}
      </Text>
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

function AttentionRow({ record, isLast }) {
  return (
    <Pressable
      accessibilityLabel={`Open health record for ${record.name}`}
      onPress={() => Alert.alert(record.name, `${record.breed} - ${record.status}`)}
      style={({ pressed }) => [styles.listRow, !isLast && styles.listRowDivider, pressed && styles.rowPressed]}
    >
      <Image source={record.image} style={styles.birdAvatar} contentFit="cover" cachePolicy="memory-disk" />
      <View style={styles.birdCopy}>
        <Text style={styles.birdName}>{record.name}</Text>
        <Text style={styles.birdBreed}>{record.breed}</Text>
      </View>
      <View style={styles.statusChip}>
        <View style={[styles.statusDot, { backgroundColor: record.color }]} />
        <Text style={[styles.statusText, { color: record.color }]}>{record.status}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9da6a9" />
    </Pressable>
  );
}

function CareRow({ record, isLast, narrow }) {
  return (
    <Pressable
      accessibilityLabel={`Open upcoming care for ${record.name}`}
      onPress={() => Alert.alert(record.name, `${record.care}: ${record.timing}`)}
      style={({ pressed }) => [styles.listRow, !isLast && styles.listRowDivider, pressed && styles.rowPressed]}
    >
      <Image source={record.image} style={styles.birdAvatar} contentFit="cover" cachePolicy="memory-disk" />
      <View style={styles.birdCopy}>
        <Text style={styles.birdName}>{record.name}</Text>
        <Text style={styles.birdBreed}>{record.breed}</Text>
      </View>
      <View style={[styles.careCopy, narrow && styles.careCopyNarrow]}>
        <View style={styles.careTextWrap}>
          <Text numberOfLines={1} style={styles.careLabel}>{record.care}</Text>
          <View style={styles.careTimingRow}>
            <View style={[styles.careTimingDot, { backgroundColor: record.color }]} />
            <Text numberOfLines={1} style={[styles.careTiming, { color: record.color }]}>{record.timing}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function Shortcut({ item, compact, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.shortcut, compact && styles.shortcutCompact, pressed && styles.cardPressed]}
    >
      <View style={[styles.shortcutIcon, { backgroundColor: item.tint }]}>
        <MaterialCommunityIcons name={item.icon} size={23} color={item.color} />
      </View>
      <View style={styles.shortcutCopy}>
        <Text numberOfLines={1} style={styles.shortcutLabel}>{item.label}</Text>
        <Text style={styles.shortcutDetail}>{item.detail}</Text>
      </View>
      <Ionicons name="chevron-forward" size={19} color="#a5aeb1" />
    </Pressable>
  );
}

export default function HealthCareScreen({ onBack, onAddHealthRecord, onOpenHealthRecords, onOpenTreatments, onOpenVaccinations, onOpenNeedsAttention, addedHealthRecords = [] }) {
  const { width } = useWindowDimensions();
  const compact = width < 480;
  const narrow = width < 390;
  const [query, setQuery] = useState('');

  const normalizedQuery = query.trim().toLowerCase();
  const addedAttention = useMemo(() => addedHealthRecords.filter((record) => record.needsAttention), [addedHealthRecords]);
  const addedCare = useMemo(() => addedHealthRecords.filter((record) => record.followUp).map((record) => ({
    ...record,
    care: record.type,
    timing: record.followUpWhen,
  })), [addedHealthRecords]);
  const summaryItems = useMemo(() => HEALTH_SUMMARY.map((item, index) => {
    const addedCount = index === 0
      ? addedHealthRecords.filter((record) => record.needsAttention).length
      : index === 1
        ? addedHealthRecords.filter((record) => record.type === 'Treatment' || record.type === 'Medication').length
        : addedHealthRecords.filter((record) => record.type === 'Vaccination' && record.followUp).length;
    return { ...item, value: String(Number.parseInt(item.value, 10) + addedCount) };
  }), [addedHealthRecords]);
  const visibleAttention = useMemo(() => [...addedAttention, ...ATTENTION_RECORDS].filter((record) =>
    `${record.name} ${record.breed} ${record.status}`.toLowerCase().includes(normalizedQuery),
  ), [addedAttention, normalizedQuery]);
  const visibleCare = useMemo(() => [...addedCare, ...UPCOMING_CARE].filter((record) =>
    `${record.name} ${record.breed} ${record.care} ${record.timing}`.toLowerCase().includes(normalizedQuery),
  ), [addedCare, normalizedQuery]);
  const visibleRecent = useMemo(() => addedHealthRecords.filter((record) =>
    `${record.name} ${record.breed} ${record.type} ${record.title}`.toLowerCase().includes(normalizedQuery),
  ), [addedHealthRecords, normalizedQuery]);

  return (
    <View style={styles.screen}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.pageWrap}>
        <View style={styles.page}>
          <View style={[styles.hero, compact && styles.heroCompact]}>
            <Image
              source={HEALTH_HERO_IMAGE}
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
                  <Text style={styles.screenTitle}>Health & Care</Text>
                </View>
              </View>
              <View style={[styles.heroCopy, narrow && styles.heroCopyNarrow]}>
                <Text style={[styles.farmName, narrow && styles.farmNameNarrow]}>FarmBuzz Farm</Text>
                <Text style={styles.farmTagline}>Monitor health, treatments and vaccinations of your flock.</Text>
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
                  placeholder="Search birds or records..."
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
                onPress={onAddHealthRecord}
                accessibilityLabel="Add health record"
                style={({ pressed }) => [styles.addButton, compact && styles.addButtonCompact, pressed && styles.pressed]}
              >
                <Ionicons name="add" size={27} color="#fff" />
                {!compact && <Text style={styles.addButtonText}>Add Health Record</Text>}
              </Pressable>
            </View>

            <View style={styles.summaryGrid}>
              {summaryItems.map((item) => <SummaryCard key={item.label} item={item} narrow={narrow} />)}
            </View>

            {!!visibleRecent.length && (
              <>
                <SectionHeader title="Recent Health Records" onViewAll={onOpenHealthRecords} />
                <View style={styles.listCard}>
                  {visibleRecent.map((record, index) => (
                    <AttentionRow
                      key={record.id}
                      record={{ ...record, status: record.type }}
                      isLast={index === visibleRecent.length - 1}
                    />
                  ))}
                </View>
              </>
            )}

            <SectionHeader title="Needs Attention" onViewAll={onOpenNeedsAttention} />
            <View style={styles.listCard}>
              {visibleAttention.map((record, index) => (
                <AttentionRow key={record.id || record.name} record={record} isLast={index === visibleAttention.length - 1} />
              ))}
              {!visibleAttention.length && <Text style={styles.emptyText}>No attention records found</Text>}
            </View>

            <SectionHeader title="Upcoming Care" onViewAll={() => Alert.alert('Upcoming Care')} />
            <View style={styles.listCard}>
              {visibleCare.map((record, index) => (
                <CareRow
                  key={record.id || record.name}
                  record={record}
                  narrow={narrow}
                  isLast={index === visibleCare.length - 1}
                />
              ))}
              {!visibleCare.length && <Text style={styles.emptyText}>No upcoming care found</Text>}
            </View>

            <View style={[styles.shortcutGrid, compact && styles.shortcutGridCompact]}>
              {SHORTCUTS.map((item) => <Shortcut key={item.label} item={item} compact={compact} onPress={item.label === 'Treatments' ? onOpenTreatments : item.label === 'Vaccinations' ? onOpenVaccinations : onOpenHealthRecords} />)}
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
  hero: { height: 285, overflow: 'hidden', backgroundColor: '#101719' },
  heroCompact: { height: 275 },
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
  heroCopy: { marginTop: 'auto', maxWidth: 470, paddingHorizontal: 18, paddingBottom: 24 },
  heroCopyNarrow: { maxWidth: 330, paddingHorizontal: 12, paddingBottom: 18 },
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
    height: 52, minWidth: 200, paddingHorizontal: 20, borderRadius: 8,
    backgroundColor: '#f66f00', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9,
  },
  addButtonCompact: { width: 52, minWidth: 52, paddingHorizontal: 0 },
  addButtonText: { color: '#fff', fontSize: 14, fontWeight: '700', letterSpacing: 0 },
  summaryGrid: { marginTop: 20, flexDirection: 'row', gap: 10 },
  summaryCard: {
    flex: 1, minWidth: 0, height: 112, borderRadius: 8, borderWidth: 1,
    borderColor: '#1c2a30', backgroundColor: '#0b1418', alignItems: 'center', justifyContent: 'center',
  },
  summaryCardNarrow: { height: 104 },
  summaryValueRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  summaryIcon: { width: 43, height: 43, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  summaryValue: { color: '#f0f2f3', fontSize: 31, fontWeight: '600', letterSpacing: 0 },
  summaryValueNarrow: { fontSize: 25 },
  summaryLabel: { marginTop: 10, paddingHorizontal: 4, color: '#a8b1b4', fontSize: 12, textAlign: 'center', letterSpacing: 0 },
  summaryLabelNarrow: { marginTop: 8, fontSize: 10 },
  sectionHeader: {
    marginTop: 23, marginBottom: 7, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  sectionTitle: { color: '#e5e9ea', fontSize: 16, fontWeight: '600', letterSpacing: 0 },
  viewAll: { minHeight: 32, flexDirection: 'row', alignItems: 'center', gap: 4, paddingLeft: 10 },
  viewAllText: { color: '#ff8a00', fontSize: 12, letterSpacing: 0 },
  listCard: { borderRadius: 8, borderWidth: 1, borderColor: '#1c2a30', backgroundColor: '#0b1418', overflow: 'hidden' },
  listRow: { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 11, paddingHorizontal: 14, paddingVertical: 7 },
  listRowDivider: { borderBottomWidth: 1, borderBottomColor: '#1b292f' },
  birdAvatar: { width: 46, height: 46, borderRadius: 23, borderWidth: 1, borderColor: '#28363b' },
  birdCopy: { flex: 1, minWidth: 0 },
  birdName: { color: '#e9eced', fontSize: 15, fontWeight: '600', letterSpacing: 0 },
  birdBreed: { marginTop: 3, color: '#929da1', fontSize: 11, letterSpacing: 0 },
  statusChip: { maxWidth: 72, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 5 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 9, fontWeight: '600', letterSpacing: 0 },
  careCopy: { width: 160, justifyContent: 'center' },
  careCopyNarrow: { width: 96 },
  careTextWrap: { width: '100%', minWidth: 0, alignItems: 'flex-end' },
  careLabel: { color: '#9ca6aa', fontSize: 10, textAlign: 'right', letterSpacing: 0 },
  careTimingRow: { marginTop: 3, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4 },
  careTimingDot: { width: 5, height: 5, borderRadius: 3 },
  careTiming: { minWidth: 0, fontSize: 9, fontWeight: '600', textAlign: 'right', letterSpacing: 0 },
  shortcutGrid: { marginTop: 15, flexDirection: 'row', gap: 10 },
  shortcutGridCompact: { flexDirection: 'column' },
  shortcut: {
    flex: 1, minWidth: 0, minHeight: 84, paddingHorizontal: 12, borderRadius: 8,
    borderWidth: 1, borderColor: '#1c2a30', backgroundColor: '#0b1418',
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  shortcutCompact: { minHeight: 68 },
  shortcutIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  shortcutCopy: { flex: 1, minWidth: 0 },
  shortcutLabel: { color: '#e6eaeb', fontSize: 12, fontWeight: '600', letterSpacing: 0 },
  shortcutDetail: { marginTop: 4, color: '#8d989c', fontSize: 10, letterSpacing: 0 },
  emptyText: { paddingVertical: 28, color: '#7f8a8e', fontSize: 12, textAlign: 'center', letterSpacing: 0 },
  pressed: { opacity: 0.72 },
  rowPressed: { backgroundColor: '#101c21' },
  cardPressed: { opacity: 0.76, transform: [{ scale: 0.995 }] },
});

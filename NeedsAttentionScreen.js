import { useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const ORANGE = '#ff7a00';
const HERO_IMAGE = require('./assets/health-care-hero.png');
const CANDLING_IMAGE = require('./assets/incubation-stage-candling.png');
const ROOSTER_IMAGE = 'https://images.unsplash.com/photo-1730360037813-9777f13b88bb?auto=format&fit=crop&w=350&q=82';
const BLACK_ROOSTER_IMAGE = 'https://images.unsplash.com/photo-1551127501-d4385c7484b4?auto=format&fit=crop&w=350&q=82';
const HEN_IMAGE = 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=350&q=82';

const BASE_RECORDS = [
  { id: 'att-razor', title: 'Razor 014 is injured', subject: 'Kelso Cock', category: 'Health', severity: 'Critical', timing: 'Needs review now', icon: 'shield-cross-outline', image: ROOSTER_IMAGE, module: 'health' },
  { id: 'att-thunder', title: 'Thunder 041 shows signs of illness', subject: 'Sweater Stag', category: 'Health', severity: 'Critical', timing: 'Needs review now', icon: 'medical-bag', image: BLACK_ROOSTER_IMAGE, module: 'health' },
  { id: 'att-vaccine', title: 'Vaccination is overdue', subject: 'Spike 022', category: 'Vaccination', severity: 'Overdue', timing: '2 days overdue', icon: 'needle', image: HEN_IMAGE, module: 'health' },
  { id: 'att-treatment', title: "Check Blade's treatment", subject: 'Blade 008', category: 'Task', severity: 'Due Today', timing: 'Due 9:00 AM', icon: 'clipboard-alert-outline', image: BLACK_ROOSTER_IMAGE, module: 'tasks' },
  { id: 'att-candling', title: 'Candling check is due', subject: 'Batch B-002', category: 'Incubation', severity: 'Due Today', timing: 'Complete today', icon: 'flashlight', image: CANDLING_IMAGE, module: 'incubation' },
  { id: 'att-queen', title: 'Health record needs review', subject: 'Queen 033', category: 'Health', severity: 'Review', timing: 'Review by tomorrow', icon: 'file-document-alert-outline', image: HEN_IMAGE, module: 'health' },
  { id: 'att-feed', title: 'Feed stock is running low', subject: 'Pen 3 and Pen 4', category: 'Task', severity: 'Upcoming', timing: 'Due tomorrow', icon: 'silo-outline', image: null, module: 'tasks' },
];

const FILTERS = ['All', 'Critical', 'Due Today', 'Upcoming'];

function HeaderButton({ onPress }) {
  return <Pressable accessibilityLabel="Back" onPress={onPress} style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}><Ionicons name="arrow-back" size={21} color="#eef1f2" /></Pressable>;
}

function SummaryMetric({ icon, value, label, isLast }) {
  return <View style={[styles.metric, !isLast && styles.metricDivider]}><MaterialCommunityIcons name={icon} size={21} color={ORANGE} /><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></View>;
}

function AttentionCard({ item, compact, onPress }) {
  return <Pressable accessibilityLabel={`Open ${item.title}`} onPress={onPress} style={({ pressed }) => [styles.card, compact && styles.cardCompact, pressed && styles.cardPressed]}>
    {item.image ? <Image source={item.image} style={[styles.recordImage, compact && styles.recordImageCompact]} contentFit="cover" cachePolicy="memory-disk" /> : <View style={[styles.recordImage, compact && styles.recordImageCompact, styles.imagePlaceholder]}><MaterialCommunityIcons name={item.icon} size={27} color={ORANGE} /></View>}
    <View style={styles.cardCopy}><View style={styles.categoryRow}><MaterialCommunityIcons name={item.icon} size={13} color={ORANGE} /><Text style={styles.category}>{item.category}</Text></View><Text numberOfLines={2} style={[styles.cardTitle, compact && styles.cardTitleCompact]}>{item.title}</Text><Text numberOfLines={1} style={styles.subject}>{item.subject}</Text><View style={styles.statusRow}><View style={styles.statusDot} /><Text style={styles.severity}>{item.severity}</Text><Text style={styles.statusDivider}>-</Text><Text numberOfLines={1} style={styles.timing}>{item.timing}</Text></View></View>
    <Ionicons name="chevron-forward" size={compact ? 18 : 21} color="#8e999c" />
  </Pressable>;
}

export default function NeedsAttentionScreen({ healthRecords = [], onBack, onOpenHealthCare, onOpenTasks, onOpenIncubation }) {
  const { width } = useWindowDimensions();
  const compact = width < 480;
  const narrow = width < 380;
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');

  const records = useMemo(() => {
    const added = healthRecords.filter((record) => record.needsAttention).map((record) => ({ id: record.id, title: record.title || `${record.name} needs attention`, subject: record.name, category: 'Health', severity: 'Review', timing: record.followUpWhen || 'Review required', icon: 'shield-alert-outline', image: record.image, module: 'health' }));
    return [...added, ...BASE_RECORDS];
  }, [healthRecords]);

  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return records.filter((item) => {
      const matchesFilter = filter === 'All' || (filter === 'Upcoming' ? ['Upcoming', 'Review'].includes(item.severity) : item.severity === filter);
      const matchesQuery = !normalized || `${item.title} ${item.subject} ${item.category} ${item.severity}`.toLowerCase().includes(normalized);
      return matchesFilter && matchesQuery;
    });
  }, [filter, query, records]);

  const openRecord = (item) => {
    if (item.module === 'tasks') onOpenTasks();
    else if (item.module === 'incubation') onOpenIncubation();
    else onOpenHealthCare();
  };

  const criticalCount = records.filter((item) => item.severity === 'Critical').length;
  const dueCount = records.filter((item) => ['Overdue', 'Due Today'].includes(item.severity)).length;
  const upcomingCount = records.length - criticalCount - dueCount;

  return <View style={styles.screen}><StatusBar style="light" translucent backgroundColor="transparent" /><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.pageWrap}><View style={styles.page}>
    <View style={[styles.hero, compact && styles.heroCompact]}><Image source={HERO_IMAGE} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="center" cachePolicy="memory-disk" /><LinearGradient colors={['rgba(2,7,9,0.18)', 'rgba(2,7,9,0.42)', '#03090c']} locations={[0, 0.48, 1]} style={StyleSheet.absoluteFill} /><SafeAreaView edges={['top']} style={styles.heroSafeArea}><View style={styles.heroHeader}><View style={styles.heroHeaderLeft}><HeaderButton onPress={onBack} /><Text style={styles.screenTitle}>Needs Attention</Text></View><View style={styles.openCount}><View style={styles.openDot} /><Text style={styles.openText}>{records.length} open</Text></View></View><View style={[styles.heroCopy, narrow && styles.heroCopyNarrow]}><Text style={[styles.heroTitle, narrow && styles.heroTitleNarrow]}>Farm Attention Center</Text><Text style={styles.heroSubtitle}>Review urgent health, task, vaccination, and incubation items.</Text></View></SafeAreaView></View>
    <View style={[styles.content, narrow && styles.contentNarrow]}>
      <View style={styles.metrics}><SummaryMetric icon="alert-octagon-outline" value={String(criticalCount)} label="Critical" /><SummaryMetric icon="clock-alert-outline" value={String(dueCount)} label="Due Now" /><SummaryMetric icon="calendar-clock-outline" value={String(upcomingCount)} label="Upcoming" isLast /></View>

      <View style={styles.searchBox}><Ionicons name="search" size={21} color="#929da1" /><TextInput value={query} onChangeText={setQuery} placeholder="Search attention items..." placeholderTextColor="#7c888c" selectionColor={ORANGE} style={styles.searchInput} />{!!query && <Pressable accessibilityLabel="Clear search" onPress={() => setQuery('')} hitSlop={8}><Ionicons name="close-circle" size={18} color="#687478" /></Pressable>}</View>
      <View style={styles.filters}>{FILTERS.map((item) => <Pressable key={item} onPress={() => setFilter(item)} style={[styles.filter, filter === item && styles.filterActive]}><Text numberOfLines={1} style={[styles.filterText, filter === item && styles.filterTextActive]}>{item}</Text></Pressable>)}</View>

      <View style={styles.sectionHeading}><View><Text style={styles.sectionTitle}>Open Items</Text><Text style={styles.sectionSubtitle}>Most urgent items appear first</Text></View><Text style={styles.sectionCount}>{visible.length} shown</Text></View>
      <View style={styles.list}>{visible.map((item) => <AttentionCard key={item.id} item={item} compact={compact} onPress={() => openRecord(item)} />)}{!visible.length && <View style={styles.empty}><MaterialCommunityIcons name="check-circle-outline" size={36} color={ORANGE} /><Text style={styles.emptyTitle}>No matching items</Text><Text style={styles.emptyText}>Try another filter or search term.</Text></View>}</View>

      <View style={styles.footerNote}><MaterialCommunityIcons name="information-outline" size={16} color={ORANGE} /><Text style={styles.footerText}>Selecting an item opens the module responsible for resolving it.</Text></View>
    </View>
  </View></ScrollView></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#020709' }, pageWrap: { flexGrow: 1, alignItems: 'center', backgroundColor: '#020709' }, page: { width: '100%', maxWidth: 720, backgroundColor: '#020709' }, hero: { height: 290, overflow: 'hidden', backgroundColor: '#101719' }, heroCompact: { height: 270 }, heroSafeArea: { flex: 1 }, heroHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: Platform.OS === 'web' ? 10 : 3 }, heroHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 }, headerButton: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(190,204,208,0.35)', backgroundColor: 'rgba(2,8,11,0.65)', alignItems: 'center', justifyContent: 'center' }, screenTitle: { color: '#f1f3f3', fontSize: 17, fontWeight: '700' }, openCount: { height: 29, paddingHorizontal: 9, borderWidth: 1, borderColor: '#67410f', borderRadius: 15, backgroundColor: 'rgba(2,8,11,0.62)', flexDirection: 'row', alignItems: 'center', gap: 6 }, openDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: ORANGE }, openText: { color: '#e4a057', fontSize: 8, fontWeight: '700' }, heroCopy: { marginTop: 'auto', paddingHorizontal: 18, paddingBottom: 25 }, heroCopyNarrow: { paddingHorizontal: 11, paddingBottom: 20 }, heroTitle: { color: '#f3f5f5', fontSize: 30, lineHeight: 36, fontWeight: '800' }, heroTitleNarrow: { fontSize: 25, lineHeight: 30 }, heroSubtitle: { maxWidth: 480, marginTop: 5, color: '#b5bec0', fontSize: 11, lineHeight: 17 },
  content: { paddingHorizontal: 12, paddingTop: 10, paddingBottom: 30 }, contentNarrow: { paddingHorizontal: 8 }, metrics: { minHeight: 88, borderWidth: 1, borderColor: '#26343a', borderRadius: 8, backgroundColor: '#0a1317', flexDirection: 'row', overflow: 'hidden' }, metric: { flex: 1, minWidth: 0, paddingVertical: 11, alignItems: 'center', justifyContent: 'center' }, metricDivider: { borderRightWidth: 1, borderRightColor: '#223037' }, metricValue: { marginTop: 4, color: '#edf0f1', fontSize: 18, fontWeight: '800' }, metricLabel: { marginTop: 3, color: '#829094', fontSize: 8 }, searchBox: { height: 52, marginTop: 9, paddingHorizontal: 14, borderWidth: 1, borderColor: '#28353a', borderRadius: 8, backgroundColor: '#0a1317', flexDirection: 'row', alignItems: 'center', gap: 9 }, searchInput: { flex: 1, height: 50, paddingVertical: 0, color: '#e4e8e9', fontSize: 12, outlineStyle: 'none' }, filters: { marginTop: 8, flexDirection: 'row', gap: 5 }, filter: { flex: 1, minWidth: 0, height: 40, borderWidth: 1, borderColor: '#28353a', borderRadius: 7, backgroundColor: '#0a1317', alignItems: 'center', justifyContent: 'center' }, filterActive: { borderColor: ORANGE, backgroundColor: 'rgba(255,122,0,0.08)' }, filterText: { color: '#879397', fontSize: 8, fontWeight: '700' }, filterTextActive: { color: ORANGE }, sectionHeading: { minHeight: 60, paddingTop: 19, paddingBottom: 8, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }, sectionTitle: { color: '#e7eaeb', fontSize: 15, fontWeight: '700' }, sectionSubtitle: { marginTop: 3, color: '#737f83', fontSize: 8 }, sectionCount: { color: ORANGE, fontSize: 8, fontWeight: '700' }, list: { gap: 7 }, card: { minHeight: 104, padding: 8, borderWidth: 1, borderColor: '#26343a', borderRadius: 8, backgroundColor: '#0a1317', flexDirection: 'row', alignItems: 'center', gap: 11 }, cardCompact: { minHeight: 94, padding: 6, gap: 8 }, recordImage: { width: 86, height: 86, borderRadius: 7, backgroundColor: '#172126' }, recordImageCompact: { width: 70, height: 78 }, imagePlaceholder: { alignItems: 'center', justifyContent: 'center' }, cardCopy: { flex: 1, minWidth: 0 }, categoryRow: { flexDirection: 'row', alignItems: 'center', gap: 5 }, category: { color: ORANGE, fontSize: 7, fontWeight: '800', textTransform: 'uppercase' }, cardTitle: { marginTop: 5, color: '#e8ebec', fontSize: 13, lineHeight: 17, fontWeight: '800' }, cardTitleCompact: { fontSize: 11, lineHeight: 15 }, subject: { marginTop: 3, color: '#879397', fontSize: 8 }, statusRow: { marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 5, minWidth: 0 }, statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: ORANGE }, severity: { color: ORANGE, fontSize: 8, fontWeight: '700' }, statusDivider: { color: '#556268', fontSize: 8 }, timing: { flexShrink: 1, color: '#8a9699', fontSize: 8 }, cardPressed: { borderColor: '#704713', backgroundColor: '#101a1e' }, empty: { minHeight: 180, borderWidth: 1, borderColor: '#26343a', borderRadius: 8, backgroundColor: '#0a1317', alignItems: 'center', justifyContent: 'center' }, emptyTitle: { marginTop: 9, color: '#dfe3e4', fontSize: 12, fontWeight: '700' }, emptyText: { marginTop: 4, color: '#788488', fontSize: 9 }, footerNote: { minHeight: 48, marginTop: 11, padding: 9, borderRadius: 7, backgroundColor: 'rgba(255,122,0,0.055)', flexDirection: 'row', alignItems: 'center', gap: 8 }, footerText: { flex: 1, color: '#859195', fontSize: 8 }, pressed: { opacity: 0.72 },
});

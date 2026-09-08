import { useMemo, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BREEDING_HERO_IMAGE } from './constants';

const ORANGE = '#ff7a00';
const ROOSTER_IMAGE = 'https://images.unsplash.com/photo-1730360037813-9777f13b88bb?auto=format&fit=crop&w=400&q=82';
const HEN_IMAGE = 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=400&q=82';
const BLACK_BIRD_IMAGE = 'https://images.unsplash.com/photo-1551127501-d4385c7484b4?auto=format&fit=crop&w=400&q=82';
const SPECKLED_BIRD_IMAGE = 'https://images.unsplash.com/photo-1624295886848-623d4d12c1d6?auto=format&fit=crop&w=400&q=82';

const NAMES = ['Ember', 'Copper', 'Scout', 'Pepper', 'Flint', 'Maple', 'Ash', 'Goldie', 'Onyx', 'Sunny', 'Cinder', 'Pearl', 'Rusty', 'Willow', 'Jet', 'Honey'];
const IMAGES = [ROOSTER_IMAGE, HEN_IMAGE, BLACK_BIRD_IMAGE, SPECKLED_BIRD_IMAGE];

export const OFFSPRING_RECORDS = NAMES.map((name, index) => {
  const group = index < 8 ? 0 : index < 13 ? 1 : 2;
  const dams = ['Ruby 032', 'Amber 021', 'Pearl 017'];
  const pairingIds = ['BR-021', 'BR-015', 'BR-009'];
  const batchIds = ['B-031', 'B-024', 'B-017'];
  const sex = index % 5 === 4 ? 'Unsexed' : index % 2 === 0 ? 'Male' : 'Female';
  return {
    id: `FBZ-2026-${String(201 + index).padStart(3, '0')}`,
    name: `${name} ${String(201 + index)}`,
    sex,
    type: sex === 'Male' ? 'Cockerel' : sex === 'Female' ? 'Pullet' : 'Chick',
    sire: 'Razor 014',
    dam: dams[group],
    pairingId: pairingIds[group],
    batchId: batchIds[group],
    hatchDate: group === 0 ? 'Apr 12, 2026' : group === 1 ? 'Feb 8, 2026' : 'Oct 24, 2025',
    age: group === 0 ? '4 months' : group === 1 ? '6 months' : '10 months',
    status: index % 6 === 5 ? 'Monitor' : index % 4 === 3 ? 'Growing' : 'Registered',
    image: IMAGES[index % IMAGES.length],
  };
});

const FILTERS = ['All', 'Male', 'Female', 'Unsexed'];

function HeaderButton({ icon, label, onPress }) {
  return <Pressable accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}><Ionicons name={icon} size={21} color="#eef1f2" /></Pressable>;
}

function SummaryMetric({ icon, value, label, isLast }) {
  return <View style={[styles.metric, !isLast && styles.metricDivider]}><MaterialCommunityIcons name={icon} size={20} color={ORANGE} /><Text style={styles.metricValue}>{value}</Text><Text numberOfLines={1} style={styles.metricLabel}>{label}</Text></View>;
}

function OffspringCard({ item, compact, onPress }) {
  return (
    <Pressable accessibilityLabel={`Open ${item.name}`} onPress={onPress} style={({ pressed }) => [styles.card, compact && styles.cardCompact, pressed && styles.cardPressed]}>
      <Image source={item.image} style={[styles.birdImage, compact && styles.birdImageCompact]} contentFit="cover" cachePolicy="memory-disk" />
      <View style={styles.cardCopy}>
        <View style={styles.nameRow}>
          <Text numberOfLines={1} style={[styles.birdName, compact && styles.birdNameCompact]}>{item.name}</Text>
          <MaterialCommunityIcons name={item.sex === 'Male' ? 'gender-male' : item.sex === 'Female' ? 'gender-female' : 'help-circle-outline'} size={compact ? 15 : 18} color={ORANGE} />
        </View>
        <Text numberOfLines={1} style={styles.birdId}>{item.id} - {item.type}</Text>
        <View style={styles.statusRow}><View style={styles.statusDot} /><Text style={styles.statusText}>{item.status}</Text></View>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}><MaterialCommunityIcons name="calendar-month-outline" size={13} color="#899599" /><Text style={styles.metaText}>{item.age}</Text></View>
          <View style={styles.metaItem}><MaterialCommunityIcons name="egg-outline" size={13} color="#899599" /><Text style={styles.metaText}>{item.batchId}</Text></View>
          {!compact && <View style={styles.metaItem}><MaterialCommunityIcons name="link-variant" size={13} color="#899599" /><Text style={styles.metaText}>{item.pairingId}</Text></View>}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={compact ? 18 : 21} color="#8d989c" />
    </Pressable>
  );
}

export default function OffspringScreen({ bird, pairing, onBack }) {
  const { width } = useWindowDimensions();
  const compact = width < 480;
  const narrow = width < 380;
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const contextTitle = pairing ? `${pairing.male} x ${pairing.female}` : bird?.name || 'All breeding records';
  const contextSubtitle = pairing ? `${pairing.id} offspring` : `Recorded offspring linked to ${bird?.name || 'this farm'}`;

  const contextRecords = useMemo(() => OFFSPRING_RECORDS.filter((item) => {
    if (pairing) return item.pairingId === pairing.id;
    if (bird) return item.sire === bird.name || item.dam === bird.name;
    return true;
  }), [bird, pairing]);

  const visibleRecords = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return contextRecords.filter((item) => {
      const matchesFilter = filter === 'All' || item.sex === filter;
      const matchesQuery = !normalized || [item.name, item.id, item.batchId, item.sire, item.dam].some((value) => value.toLowerCase().includes(normalized));
      return matchesFilter && matchesQuery;
    });
  }, [contextRecords, filter, query]);

  const registered = contextRecords.filter((item) => item.status === 'Registered').length;
  const male = contextRecords.filter((item) => item.sex === 'Male').length;
  const female = contextRecords.filter((item) => item.sex === 'Female').length;

  return (
    <View style={styles.screen}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.pageWrap}>
        <View style={styles.page}>
          <View style={[styles.hero, compact && styles.heroCompact]}>
            <Image source={BREEDING_HERO_IMAGE} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="center" cachePolicy="memory-disk" />
            <LinearGradient colors={['rgba(2,7,9,0.2)', 'rgba(2,7,9,0.4)', '#03090c']} locations={[0, 0.5, 1]} style={StyleSheet.absoluteFill} />
            <SafeAreaView edges={['top']} style={styles.heroSafeArea}>
              <View style={styles.heroHeader}><View style={styles.heroHeaderLeft}><HeaderButton icon="arrow-back" label="Back to breeding" onPress={onBack} /><Text style={styles.screenTitle}>Offspring</Text></View><HeaderButton icon="ellipsis-horizontal" label="Offspring options" onPress={() => Alert.alert('Offspring options', 'Manage offspring records and registrations here.')} /></View>
              <View style={[styles.heroCopy, narrow && styles.heroCopyNarrow]}><Text numberOfLines={2} style={[styles.heroTitle, narrow && styles.heroTitleNarrow]}>{contextTitle}</Text><Text style={styles.heroSubtitle}>{contextSubtitle}</Text></View>
            </SafeAreaView>
          </View>

          <View style={[styles.content, narrow && styles.contentNarrow]}>
            <View style={styles.parentPanel}>
              <View style={styles.parentImages}>
                <Image source={pairing?.maleImage || bird?.image || ROOSTER_IMAGE} style={styles.parentImage} contentFit="cover" cachePolicy="memory-disk" />
                {pairing && <Image source={pairing.femaleImage} style={[styles.parentImage, styles.parentImageTrailing]} contentFit="cover" cachePolicy="memory-disk" />}
              </View>
              <View style={styles.parentCopy}><Text style={styles.eyebrow}>{pairing ? 'BREEDING PAIR' : 'PARENT RECORD'}</Text><Text numberOfLines={1} style={styles.parentTitle}>{contextTitle}</Text><Text style={styles.parentMeta}>{contextRecords.length} recorded offspring</Text></View>
            </View>

            <View style={styles.metrics}><SummaryMetric icon="bird" value={String(contextRecords.length)} label="Total" /><SummaryMetric icon="identifier" value={String(registered)} label="Registered" /><SummaryMetric icon="gender-male" value={String(male)} label="Male" /><SummaryMetric icon="gender-female" value={String(female)} label="Female" isLast /></View>

            <View style={[styles.actionRow, compact && styles.actionRowCompact]}>
              <View style={styles.searchBox}><Ionicons name="search" size={20} color="#929da1" /><TextInput value={query} onChangeText={setQuery} placeholder="Search offspring or ID..." placeholderTextColor="#7c888c" selectionColor={ORANGE} style={styles.searchInput} />{!!query && <Pressable accessibilityLabel="Clear search" onPress={() => setQuery('')} hitSlop={8}><Ionicons name="close-circle" size={18} color="#687478" /></Pressable>}</View>
              <Pressable accessibilityLabel="Register offspring" onPress={() => Alert.alert('Register offspring', 'Choose a hatched chick and assign its FarmBuzz ID.')} style={({ pressed }) => [styles.addButton, compact && styles.addButtonCompact, pressed && styles.pressed]}><Ionicons name="add" size={25} color="#fff" />{!compact && <Text style={styles.addButtonText}>Register Offspring</Text>}</Pressable>
            </View>

            <View style={styles.filters}>{FILTERS.map((item) => <Pressable key={item} onPress={() => setFilter(item)} style={[styles.filter, filter === item && styles.filterActive]}><Text style={[styles.filterText, filter === item && styles.filterTextActive]}>{item}</Text><Text style={[styles.filterCount, filter === item && styles.filterTextActive]}>{item === 'All' ? contextRecords.length : contextRecords.filter((record) => record.sex === item).length}</Text></Pressable>)}</View>

            <View style={styles.sectionHeading}><View><Text style={styles.sectionTitle}>Offspring Records</Text><Text style={styles.sectionSubtitle}>Hatch and registration information</Text></View><Text style={styles.sectionCount}>{visibleRecords.length} shown</Text></View>
            <View style={styles.list}>{visibleRecords.map((item) => <OffspringCard key={item.id} item={item} compact={compact} onPress={() => Alert.alert(item.name, `${item.id}\n${item.sire} x ${item.dam}\nHatched ${item.hatchDate}\nBatch ${item.batchId}\nStatus: ${item.status}`)} />)}{!visibleRecords.length && <View style={styles.empty}><MaterialCommunityIcons name="bird" size={34} color="#5f6c70" /><Text style={styles.emptyTitle}>No offspring found</Text><Text style={styles.emptyText}>Try another filter or register a new offspring record.</Text></View>}</View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#020709' }, pageWrap: { flexGrow: 1, alignItems: 'center', backgroundColor: '#020709' }, page: { width: '100%', maxWidth: 720, backgroundColor: '#020709' },
  hero: { height: 290, overflow: 'hidden', backgroundColor: '#101719' }, heroCompact: { height: 270 }, heroSafeArea: { flex: 1 }, heroHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: Platform.OS === 'web' ? 10 : 3 }, heroHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 }, headerButton: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(190,204,208,0.35)', backgroundColor: 'rgba(2,8,11,0.65)', alignItems: 'center', justifyContent: 'center' }, screenTitle: { color: '#f1f3f3', fontSize: 17, fontWeight: '700' }, heroCopy: { marginTop: 'auto', paddingHorizontal: 18, paddingBottom: 26 }, heroCopyNarrow: { paddingHorizontal: 11, paddingBottom: 20 }, heroTitle: { color: '#f3f5f5', fontSize: 31, lineHeight: 37, fontWeight: '800' }, heroTitleNarrow: { fontSize: 26, lineHeight: 31 }, heroSubtitle: { marginTop: 5, color: '#b4bdc0', fontSize: 12 },
  content: { paddingHorizontal: 12, paddingTop: 10, paddingBottom: 30 }, contentNarrow: { paddingHorizontal: 8 }, parentPanel: { minHeight: 82, padding: 11, borderWidth: 1, borderColor: '#5b3a10', borderRadius: 8, backgroundColor: '#0a1317', flexDirection: 'row', alignItems: 'center', gap: 12 }, parentImages: { width: 70, flexDirection: 'row' }, parentImage: { width: 54, height: 54, borderRadius: 27, borderWidth: 2, borderColor: ORANGE, backgroundColor: '#172126', zIndex: 2 }, parentImageTrailing: { marginLeft: -25, zIndex: 1 }, parentCopy: { flex: 1, minWidth: 0 }, eyebrow: { color: ORANGE, fontSize: 7, fontWeight: '800' }, parentTitle: { marginTop: 4, color: '#e9eced', fontSize: 14, fontWeight: '800' }, parentMeta: { marginTop: 4, color: '#808c90', fontSize: 9 },
  metrics: { minHeight: 86, marginTop: 10, borderWidth: 1, borderColor: '#26343a', borderRadius: 8, backgroundColor: '#0a1317', flexDirection: 'row', overflow: 'hidden' }, metric: { flex: 1, minWidth: 0, paddingVertical: 11, alignItems: 'center', justifyContent: 'center' }, metricDivider: { borderRightWidth: 1, borderRightColor: '#223037' }, metricValue: { marginTop: 4, color: '#eef1f2', fontSize: 17, fontWeight: '800' }, metricLabel: { marginTop: 3, color: '#879397', fontSize: 8 },
  actionRow: { marginTop: 10, flexDirection: 'row', gap: 9 }, actionRowCompact: { gap: 8 }, searchBox: { flex: 1, height: 52, paddingHorizontal: 14, borderWidth: 1, borderColor: '#28353a', borderRadius: 8, backgroundColor: '#0a1317', flexDirection: 'row', alignItems: 'center', gap: 9 }, searchInput: { flex: 1, height: 50, paddingVertical: 0, color: '#e4e8e9', fontSize: 12, outlineStyle: 'none' }, addButton: { minWidth: 168, height: 52, paddingHorizontal: 15, borderRadius: 8, backgroundColor: '#f66f00', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 }, addButtonCompact: { width: 52, minWidth: 52, paddingHorizontal: 0 }, addButtonText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  filters: { marginTop: 9, flexDirection: 'row', gap: 6 }, filter: { flex: 1, minWidth: 0, height: 42, borderWidth: 1, borderColor: '#26343a', borderRadius: 7, backgroundColor: '#0a1317', alignItems: 'center', justifyContent: 'center' }, filterActive: { borderColor: ORANGE, backgroundColor: 'rgba(255,122,0,0.07)' }, filterText: { color: '#8d999c', fontSize: 9, fontWeight: '700' }, filterTextActive: { color: ORANGE }, filterCount: { marginTop: 2, color: '#657176', fontSize: 7 },
  sectionHeading: { minHeight: 58, paddingTop: 18, paddingBottom: 8, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }, sectionTitle: { color: '#e7eaeb', fontSize: 15, fontWeight: '700' }, sectionSubtitle: { marginTop: 3, color: '#737f83', fontSize: 8 }, sectionCount: { color: ORANGE, fontSize: 9, fontWeight: '700' }, list: { gap: 7 }, card: { minHeight: 100, padding: 8, borderWidth: 1, borderColor: '#243239', borderRadius: 8, backgroundColor: '#0a1317', flexDirection: 'row', alignItems: 'center', gap: 11 }, cardCompact: { minHeight: 92, padding: 6, gap: 8 }, birdImage: { width: 82, height: 82, borderRadius: 7, backgroundColor: '#172126' }, birdImageCompact: { width: 68, height: 76 }, cardCopy: { flex: 1, minWidth: 0 }, nameRow: { flexDirection: 'row', alignItems: 'center', gap: 5 }, birdName: { flexShrink: 1, color: '#edf0f1', fontSize: 15, fontWeight: '800' }, birdNameCompact: { fontSize: 13 }, birdId: { marginTop: 3, color: '#879397', fontSize: 8 }, statusRow: { marginTop: 5, flexDirection: 'row', alignItems: 'center', gap: 5 }, statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: ORANGE }, statusText: { color: ORANGE, fontSize: 8, fontWeight: '700' }, metaRow: { marginTop: 8, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 }, metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 }, metaText: { color: '#8e999c', fontSize: 8 }, cardPressed: { borderColor: '#76501c', backgroundColor: '#101a1e' }, empty: { minHeight: 180, borderWidth: 1, borderColor: '#26343a', borderRadius: 8, backgroundColor: '#0a1317', alignItems: 'center', justifyContent: 'center' }, emptyTitle: { marginTop: 9, color: '#d9dfe0', fontSize: 12, fontWeight: '700' }, emptyText: { marginTop: 5, color: '#788488', fontSize: 9 }, pressed: { opacity: 0.72 },
});

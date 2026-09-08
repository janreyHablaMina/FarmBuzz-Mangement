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
import { HOLDING_EGG_TOTAL, HOLDING_GROUPS } from './farmData';

const HERO_IMAGE = require('./assets/eggs-incubation-hero.png');
const ORANGE = '#ff7a00';

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

function SummaryCard({ icon, value, label, compact }) {
  return (
    <View style={[styles.summaryCard, compact && styles.summaryCardCompact]}>
      <View style={styles.summaryIcon}>
        <MaterialCommunityIcons name={icon} size={25} color={ORANGE} />
      </View>
      <View style={styles.summaryCopy}>
        <Text style={[styles.summaryValue, compact && styles.summaryValueCompact]}>{value}</Text>
        <Text numberOfLines={2} style={styles.summaryLabel}>{label}</Text>
      </View>
    </View>
  );
}

function PairAvatar({ source, trailing }) {
  return (
    <View style={[styles.avatarWrap, trailing && styles.avatarTrailing]}>
      <Image source={source} style={styles.avatar} contentFit="cover" cachePolicy="memory-disk" />
    </View>
  );
}

function HoldingRow({ group, isLast }) {
  return (
    <Pressable
      accessibilityLabel={`${group.male} and ${group.female}, ${group.eggCount} eggs`}
      onPress={() => Alert.alert(
        `${group.male} x ${group.female}`,
        `${group.eggCount} eggs collected ${group.collected}. Oldest egg: ${group.oldestDays} days.`,
      )}
      style={({ pressed }) => [
        styles.holdingRow,
        !isLast && styles.rowDivider,
        pressed && styles.rowPressed,
      ]}
    >
      <View style={styles.avatarPair}>
        <PairAvatar source={group.maleImage} />
        <PairAvatar source={group.femaleImage} trailing />
      </View>
      <View style={styles.rowCopy}>
        <Text numberOfLines={1} style={styles.pairName}>{group.male} x {group.female}</Text>
        <Text style={styles.pairMeta}>
          {group.eggCount} eggs  -  oldest {group.oldestDays} days
        </Text>
        <Text style={styles.collectedText}>Collected {group.collected}</Text>
      </View>
      <View style={styles.statusChip}>
        <Text style={styles.statusText}>{group.status}</Text>
      </View>
    </Pressable>
  );
}

export default function EggHoldingScreen({ onBack, onCreateBatch }) {
  const { width } = useWindowDimensions();
  const compact = width < 480;
  const narrow = width < 390;
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim().toLowerCase();

  const visibleGroups = useMemo(() => HOLDING_GROUPS.filter((group) =>
    `${group.male} ${group.female} ${group.eggCount} ${group.status}`
      .toLowerCase()
      .includes(normalizedQuery),
  ), [normalizedQuery]);

  return (
    <View style={styles.screen}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.pageWrap}>
        <View style={styles.page}>
          <View style={[styles.hero, compact && styles.heroCompact]}>
            <Image
              source={HERO_IMAGE}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              contentPosition="center"
              cachePolicy="memory-disk"
            />
            <LinearGradient
              colors={['rgba(1, 5, 7, 0.18)', 'rgba(1, 5, 7, 0.08)', '#03090c']}
              locations={[0, 0.48, 1]}
              style={StyleSheet.absoluteFill}
            />
            <SafeAreaView edges={['top']} style={styles.heroSafeArea}>
              <View style={styles.heroHeader}>
                <View style={styles.heroHeaderLeft}>
                  <HeaderButton icon="arrow-back" label="Back to eggs and incubation" onPress={onBack} />
                  <Text style={styles.screenTitle}>Egg Holding</Text>
                </View>
              </View>
              <View style={[styles.heroCopy, narrow && styles.heroCopyNarrow]}>
                <Text style={[styles.farmName, narrow && styles.farmNameNarrow]}>FarmBuzz Farm</Text>
                <Text style={styles.farmTagline}>Review eggs waiting to enter incubation.</Text>
                <View style={styles.farmMeta}>
                  <Ionicons name="location-outline" size={16} color="#c0c7c9" />
                  <Text style={styles.metaText}>Pampanga, Philippines</Text>
                  <View style={styles.metaDivider} />
                  <Ionicons name="calendar-outline" size={16} color="#c0c7c9" />
                  <Text style={styles.metaText}>Est. 2020</Text>
                </View>
              </View>
            </SafeAreaView>
          </View>

          <View style={[styles.content, narrow && styles.contentNarrow]}>
            <View style={[styles.actionRow, compact && styles.actionRowCompact]}>
              <View style={styles.searchBox}>
                <Ionicons name="search" size={21} color="#9aa4a8" />
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Search holding groups..."
                  placeholderTextColor="#879195"
                  selectionColor={ORANGE}
                  style={styles.searchInput}
                />
                {!!query && (
                  <Pressable accessibilityLabel="Clear search" onPress={() => setQuery('')} hitSlop={8}>
                    <Ionicons name="close-circle" size={18} color="#6c777b" />
                  </Pressable>
                )}
              </View>
              <Pressable
                onPress={() => Alert.alert('Add egg collection', 'The egg collection form will open here.')}
                accessibilityLabel="Add egg collection"
                style={({ pressed }) => [styles.addButton, compact && styles.addButtonCompact, pressed && styles.pressed]}
              >
                <Ionicons name="add" size={25} color="#fff" />
                {!compact && <Text style={styles.addButtonText}>Add Collection</Text>}
              </Pressable>
            </View>

            <View style={[styles.summaryGrid, narrow && styles.summaryGridNarrow]}>
              <SummaryCard icon="egg-outline" value={HOLDING_EGG_TOTAL} label="Eggs in Holding" compact={narrow} />
              <SummaryCard icon="link-variant" value={HOLDING_GROUPS.length} label="Holding Groups" compact={narrow} />
              <SummaryCard icon="calendar-month-outline" value="5 days" label="Oldest Egg" compact={narrow} />
            </View>

            <Text style={styles.sectionTitle}>Holding Groups</Text>
            <View style={styles.listCard}>
              {visibleGroups.map((group, index) => (
                <HoldingRow
                  key={group.id}
                  group={group}
                  isLast={index === visibleGroups.length - 1}
                />
              ))}
              {!visibleGroups.length && <Text style={styles.emptyText}>No holding groups found</Text>}
            </View>

            <View style={styles.guidanceCard}>
              <MaterialCommunityIcons name="information-outline" size={23} color={ORANGE} />
              <Text style={styles.guidanceText}>For best hatchability, set properly stored eggs within 3-7 days.</Text>
            </View>

            <Pressable
              onPress={() => Alert.alert('Holding history', 'Past egg holding records will open here.')}
              style={({ pressed }) => [styles.historyRow, pressed && styles.rowPressed]}
            >
              <MaterialCommunityIcons name="history" size={25} color={ORANGE} />
              <View style={styles.historyCopy}>
                <Text style={styles.historyTitle}>Holding History</Text>
                <Text style={styles.historyDetail}>Review past egg collections</Text>
              </View>
            </Pressable>

            <Pressable
              onPress={onCreateBatch}
              style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
            >
              <MaterialCommunityIcons name="archive-arrow-down-outline" size={23} color="#fff" />
              <Text style={styles.primaryButtonText}>Create Incubation Batch</Text>
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
  hero: { height: 274, overflow: 'hidden', backgroundColor: '#101719' },
  heroCompact: { height: 260 },
  heroSafeArea: { flex: 1 },
  heroHeader: { paddingHorizontal: 16, paddingTop: Platform.OS === 'web' ? 10 : 3 },
  heroHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  headerButton: {
    width: 40, height: 40, borderRadius: 20, borderWidth: 1,
    borderColor: 'rgba(190, 204, 208, 0.35)', backgroundColor: 'rgba(2, 8, 11, 0.65)',
    alignItems: 'center', justifyContent: 'center',
  },
  screenTitle: { color: '#f0f2f3', fontSize: 17, fontWeight: '700', letterSpacing: 0 },
  heroCopy: { marginTop: 'auto', maxWidth: 520, paddingHorizontal: 18, paddingBottom: 23 },
  heroCopyNarrow: { paddingHorizontal: 12, paddingBottom: 18 },
  farmName: {
    color: '#f5f6f6', fontSize: 34, lineHeight: 40, fontWeight: '800', letterSpacing: 0,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', web: 'Georgia' }),
    textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 5,
  },
  farmNameNarrow: { fontSize: 29, lineHeight: 34 },
  farmTagline: { marginTop: 6, color: '#bac1c3', fontSize: 14, lineHeight: 20, letterSpacing: 0 },
  farmMeta: { marginTop: 14, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  metaText: { color: '#b8c0c2', fontSize: 12, letterSpacing: 0 },
  metaDivider: { width: 3, height: 3, marginHorizontal: 5, borderRadius: 2, backgroundColor: '#899397' },
  content: { paddingHorizontal: 10, paddingBottom: 22 },
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
    height: 52, minWidth: 166, paddingHorizontal: 18, borderRadius: 8,
    backgroundColor: '#f66f00', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  addButtonCompact: { width: 52, minWidth: 52, paddingHorizontal: 0 },
  addButtonText: { color: '#fff', fontSize: 14, fontWeight: '700', letterSpacing: 0 },
  summaryGrid: { marginTop: 14, flexDirection: 'row', gap: 10 },
  summaryGridNarrow: { gap: 6 },
  summaryCard: {
    flex: 1, minWidth: 0, height: 82, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1,
    borderColor: '#1c2a30', backgroundColor: '#0b1418', flexDirection: 'row', alignItems: 'center', gap: 11,
  },
  summaryCardCompact: { height: 92, paddingHorizontal: 7, flexDirection: 'column', justifyContent: 'center', gap: 4 },
  summaryIcon: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255, 122, 0, 0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  summaryCopy: { minWidth: 0 },
  summaryValue: { color: '#f0f2f3', fontSize: 24, fontWeight: '700', letterSpacing: 0 },
  summaryValueCompact: { fontSize: 18, textAlign: 'center' },
  summaryLabel: { marginTop: 2, color: '#9aa4a8', fontSize: 10, lineHeight: 13, letterSpacing: 0, textAlign: 'center' },
  sectionTitle: { marginTop: 23, marginBottom: 8, color: '#e5e9ea', fontSize: 16, fontWeight: '600', letterSpacing: 0 },
  listCard: { borderRadius: 8, borderWidth: 1, borderColor: '#1c2a30', backgroundColor: '#0b1418', overflow: 'hidden' },
  holdingRow: { minHeight: 84, flexDirection: 'row', alignItems: 'center', gap: 11, paddingHorizontal: 12, paddingVertical: 9 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: '#1b292f' },
  avatarPair: { width: 72, flexDirection: 'row', alignItems: 'center' },
  avatarWrap: { position: 'relative', zIndex: 2 },
  avatarTrailing: { marginLeft: -14, zIndex: 1 },
  avatar: { width: 43, height: 43, borderRadius: 22, borderWidth: 2, borderColor: '#18262c', backgroundColor: '#0a1317' },
  rowCopy: { flex: 1, minWidth: 0 },
  pairName: { color: '#e9eced', fontSize: 14, fontWeight: '600', letterSpacing: 0 },
  pairMeta: { marginTop: 4, color: '#b0b8bb', fontSize: 11, lineHeight: 14, letterSpacing: 0 },
  collectedText: { marginTop: 3, color: '#7f8a8e', fontSize: 10, letterSpacing: 0 },
  statusChip: {
    minHeight: 27, maxWidth: 76, paddingHorizontal: 8, borderRadius: 14,
    backgroundColor: 'rgba(255, 122, 0, 0.1)', alignItems: 'center', justifyContent: 'center',
  },
  statusText: { color: ORANGE, fontSize: 9, fontWeight: '600', textAlign: 'center', letterSpacing: 0 },
  guidanceCard: {
    minHeight: 52, marginTop: 10, paddingHorizontal: 14, borderRadius: 8, borderWidth: 1,
    borderColor: '#59340f', backgroundColor: 'rgba(95, 49, 6, 0.18)', flexDirection: 'row', alignItems: 'center', gap: 11,
  },
  guidanceText: { flex: 1, color: '#c9cfd1', fontSize: 11, lineHeight: 16, letterSpacing: 0 },
  historyRow: {
    minHeight: 64, marginTop: 10, paddingHorizontal: 15, borderRadius: 8, borderWidth: 1,
    borderColor: '#1c2a30', backgroundColor: '#0b1418', flexDirection: 'row', alignItems: 'center', gap: 13,
  },
  historyCopy: { flex: 1 },
  historyTitle: { color: '#e6eaeb', fontSize: 14, fontWeight: '600', letterSpacing: 0 },
  historyDetail: { marginTop: 3, color: '#8e999c', fontSize: 11, letterSpacing: 0 },
  primaryButton: {
    minHeight: 52, marginTop: 11, paddingHorizontal: 18, borderRadius: 8,
    backgroundColor: '#f66f00', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9,
  },
  primaryButtonText: { color: '#fff', fontSize: 14, fontWeight: '700', letterSpacing: 0 },
  emptyText: { paddingVertical: 28, color: '#7f8a8e', fontSize: 12, textAlign: 'center', letterSpacing: 0 },
  pressed: { opacity: 0.72 },
  rowPressed: { backgroundColor: '#101c21' },
});

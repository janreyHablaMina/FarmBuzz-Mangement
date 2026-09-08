import { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
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

const TEAM_HERO_IMAGE = require('./assets/team-hero.png');

export const FARMS = [
  { id: 'all', name: 'All Farms', location: '3 managed farms' },
  { id: 'main', name: 'FarmBuzz Main Farm', location: 'San Fernando, Pampanga' },
  { id: 'angeles', name: 'Angeles Breeding Farm', location: 'Angeles City, Pampanga' },
  { id: 'guagua', name: 'Guagua Hatchery', location: 'Guagua, Pampanga' },
];

export const MEMBERS = [
  {
    id: 'maria-santos', name: 'Maria Santos', role: 'Farm Manager', team: 'All Farms', farm: 'All Farms', farmIds: ['main', 'angeles', 'guagua'],
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=82',
    status: 'On duty', statusColor: '#61df67', shift: '6:00 AM - 4:00 PM', tasks: '5 tasks today',
  },
  {
    id: 'joel-dizon', name: 'Joel Dizon', role: 'Flock Care Lead', team: 'FarmBuzz Main Farm', farm: 'FarmBuzz Main Farm', farmIds: ['main'],
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=82',
    status: 'On duty', statusColor: '#61df67', shift: '6:00 AM - 3:00 PM', tasks: '4 tasks today',
  },
  {
    id: 'carlo-reyes', name: 'Carlo Reyes', role: 'Breeding Specialist', team: 'Angeles Breeding Farm', farm: 'Angeles Breeding Farm', farmIds: ['angeles'],
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=82',
    status: 'Field rounds', statusColor: '#39a7ff', shift: '7:00 AM - 5:00 PM', tasks: '3 pairings due',
  },
  {
    id: 'ana-cruz', name: 'Ana Cruz', role: 'Poultry Health Aide', team: 'FarmBuzz Main Farm', farm: 'FarmBuzz Main Farm', farmIds: ['main'],
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=300&q=82',
    status: 'Available', statusColor: '#61df67', shift: '8:00 AM - 5:00 PM', tasks: '2 checks due',
  },
  {
    id: 'mark-villanueva', name: 'Mark Villanueva', role: 'Farm Assistant', team: 'Guagua Hatchery', farm: 'Guagua Hatchery', farmIds: ['guagua'],
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=82',
    status: 'Off duty', statusColor: '#899397', shift: 'Returns tomorrow', tasks: 'No tasks assigned',
  },
  {
    id: 'liza-manalo', name: 'Liza Manalo', role: 'Hatchery Assistant', team: 'Guagua Hatchery', farm: 'Guagua Hatchery', farmIds: ['guagua'],
    image: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=300&q=82',
    status: 'On duty', statusColor: '#61df67', shift: '5:00 AM - 2:00 PM', tasks: '2 batches due',
  },
];

const COVERAGE = [
  { label: 'Morning', time: '5 AM - 1 PM', members: '4 members', color: '#ff9100' },
  { label: 'Day', time: '1 PM - 7 PM', members: '3 members', color: '#ff9100' },
  { label: 'Night', time: '7 PM - 5 AM', members: '2 members', color: '#ff9100' },
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
      <View style={[styles.summaryIcon, { backgroundColor: item.tint }]}>
        <MaterialCommunityIcons name={item.icon} size={25} color={item.color} />
      </View>
      <Text style={[styles.summaryValue, narrow && styles.summaryValueNarrow]}>{item.value}</Text>
      <Text numberOfLines={2} style={[styles.summaryLabel, narrow && styles.summaryLabelNarrow]}>{item.label}</Text>
    </View>
  );
}

function MemberCard({ member, narrow, onPress }) {
  const offDuty = member.status.toLowerCase() === 'off duty';
  return (
    <Pressable
      accessibilityLabel={`Open team member ${member.name}`}
      onPress={onPress}
      style={({ pressed }) => [styles.memberCard, narrow && styles.memberCardNarrow, pressed && styles.cardPressed]}
    >
      <View style={styles.avatarWrap}>
        <Image source={member.image} style={[styles.avatar, narrow && styles.avatarNarrow]} contentFit="cover" cachePolicy="memory-disk" />
      </View>
      <View style={styles.memberMain}>
        <View style={styles.memberTitleRow}>
          <Text numberOfLines={1} style={styles.memberName}>{member.name}</Text>
          <Text numberOfLines={1} style={styles.memberRole}>{member.role}</Text>
        </View>
        <View style={styles.memberMeta}>
          <View style={styles.teamTag}>
            <Ionicons name="location-outline" size={13} color="#ff9000" />
            <Text numberOfLines={1} style={styles.teamTagText}>{member.farm || member.team}</Text>
          </View>
          <Ionicons name="time-outline" size={12} color="#778488" />
          <Text numberOfLines={1} style={styles.shiftText}>{member.shift}</Text>
        </View>
      </View>
      <View style={[styles.memberAside, narrow && styles.memberAsideNarrow]}>
        <View style={styles.memberAsideTop}>
          <View style={styles.memberStatus}>
            <View style={[styles.memberStatusDot, offDuty && styles.memberStatusDotMuted]} />
            <Text numberOfLines={1} style={[styles.statusText, offDuty && styles.statusTextMuted]}>{member.status}</Text>
          </View>
          <Ionicons name="chevron-forward" size={17} color="#8d999d" />
        </View>
        <Text numberOfLines={1} style={styles.memberTasks}>{member.tasks}</Text>
      </View>
    </Pressable>
  );
}

function CoverageItem({ item, isLast }) {
  return (
    <View style={[styles.coverageItem, !isLast && styles.coverageDivider]}>
      <View style={[styles.coverageDot, { backgroundColor: item.color }]} />
      <View>
        <Text style={styles.coverageLabel}>{item.label}</Text>
        <Text style={styles.coverageTime}>{item.time}</Text>
      </View>
      <Text style={styles.coverageMembers}>{item.members}</Text>
    </View>
  );
}

export default function TeamScreen({ onBack, onAddMember, onOpenMember, members = MEMBERS }) {
  const { width } = useWindowDimensions();
  const compact = width < 480;
  const narrow = width < 390;
  const [query, setQuery] = useState('');
  const [selectedFarmId, setSelectedFarmId] = useState('all');
  const [farmPickerVisible, setFarmPickerVisible] = useState(false);
  const selectedFarm = FARMS.find((farm) => farm.id === selectedFarmId) || FARMS[0];
  const onDutyCount = members.filter((member) => member.status.toLowerCase() === 'on duty').length;
  const summaryItems = [
    { icon: 'account-group-outline', value: String(members.length), label: 'Team Members', color: '#ff8500', tint: 'rgba(255, 133, 0, 0.1)' },
    { icon: 'account-check-outline', value: String(onDutyCount), label: 'On Duty', color: '#ff8500', tint: 'rgba(255, 133, 0, 0.1)' },
    { icon: 'barn', value: String(FARMS.length - 1), label: 'Managed Farms', color: '#ff8500', tint: 'rgba(255, 133, 0, 0.1)' },
  ];

  const visibleMembers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return members.filter((member) => {
      const matchesFarm = selectedFarmId === 'all' || member.farmIds?.includes(selectedFarmId);
      const matchesQuery = `${member.name} ${member.role} ${member.farm || member.team} ${member.status}`
        .toLowerCase()
        .includes(normalized);
      return matchesFarm && matchesQuery;
    });
  }, [members, query, selectedFarmId]);

  return (
    <View style={styles.screen}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.pageWrap}>
        <View style={styles.page}>
          <View style={[styles.hero, compact && styles.heroCompact]}>
            <Image source={TEAM_HERO_IMAGE} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="center" cachePolicy="memory-disk" />
            <LinearGradient
              colors={['rgba(2, 7, 9, 0.24)', 'rgba(2, 7, 9, 0.12)', '#040a0d']}
              locations={[0, 0.43, 1]}
              style={StyleSheet.absoluteFill}
            />
            <SafeAreaView edges={['top']} style={styles.heroSafeArea}>
              <View style={styles.heroHeader}>
                <View style={styles.heroHeaderLeft}>
                  <HeaderButton icon="arrow-back" label="Back to management" onPress={onBack} />
                  <Text style={styles.screenTitle}>Team</Text>
                </View>
              </View>
              <View style={[styles.heroCopy, narrow && styles.heroCopyNarrow]}>
                <Text style={[styles.farmName, narrow && styles.farmNameNarrow]}>FarmBuzz Farm</Text>
                <Text style={styles.farmTagline}>The people keeping every bird and daily operation on track.</Text>
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
                  placeholder="Search people or roles..."
                  placeholderTextColor="#879195"
                  selectionColor="#ff8500"
                  style={styles.searchInput}
                />
                {!!query && (
                  <Pressable accessibilityLabel="Clear search" onPress={() => setQuery('')} hitSlop={8}>
                    <Ionicons name="close-circle" size={18} color="#6c777b" />
                  </Pressable>
                )}
              </View>
              <Pressable
                onPress={onAddMember}
                accessibilityLabel="Add team member"
                style={({ pressed }) => [styles.addButton, compact && styles.addButtonCompact, pressed && styles.pressed]}
              >
                {compact ? (
                  <Ionicons name="add" size={27} color="#fff" />
                ) : (
                  <>
                    <MaterialCommunityIcons name="account-plus-outline" size={22} color="#fff" />
                    <Text style={styles.addButtonText}>Add Member</Text>
                  </>
                )}
              </Pressable>
            </View>

            <View style={styles.summaryGrid}>
              {summaryItems.map((item) => <SummaryCard key={item.label} item={item} narrow={narrow} />)}
            </View>

            <Text style={styles.selectorLabel}>Viewing team for</Text>
            <Pressable
              accessibilityLabel="Choose a farm"
              onPress={() => setFarmPickerVisible(true)}
              style={({ pressed }) => [styles.farmSelector, pressed && styles.cardPressed]}
            >
              <View style={styles.farmSelectorIcon}><MaterialCommunityIcons name="barn" size={21} color="#ff8500" /></View>
              <View style={styles.farmSelectorCopy}>
                <Text style={styles.farmSelectorName}>{selectedFarm.name}</Text>
                <Text style={styles.farmSelectorLocation}>{selectedFarm.location}</Text>
              </View>
              <Ionicons name="chevron-down" size={19} color="#98a2a5" />
            </Pressable>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Team Members</Text>
              <Text style={styles.memberCount}>{visibleMembers.length} shown</Text>
            </View>
            <View style={styles.memberList}>
              {visibleMembers.map((member) => <MemberCard key={member.id} member={member} narrow={narrow} onPress={() => onOpenMember(member)} />)}
              {!visibleMembers.length && (
                <View style={styles.emptyState}>
                  <MaterialCommunityIcons name="account-search-outline" size={34} color="#5f6a6e" />
                  <Text style={styles.emptyText}>No team members found</Text>
                </View>
              )}
            </View>

            <View style={styles.sectionHeader}>
              <View><Text style={styles.sectionTitle}>Today's Coverage</Text><Text style={styles.coverageFarm}>{selectedFarm.name}</Text></View>
              <Pressable onPress={() => Alert.alert('Team schedule')}>
                <Text style={styles.scheduleLink}>View schedule</Text>
              </Pressable>
            </View>
            <View style={[styles.coveragePanel, compact && styles.coveragePanelCompact]}>
              {COVERAGE.map((item, index) => (
                <CoverageItem key={item.label} item={item} isLast={index === COVERAGE.length - 1} />
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
      <Modal visible={farmPickerVisible} transparent animationType="fade" onRequestClose={() => setFarmPickerVisible(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setFarmPickerVisible(false)}>
          <Pressable style={styles.farmSheet} onPress={(event) => event.stopPropagation()}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <View><Text style={styles.sheetTitle}>Choose Farm</Text><Text style={styles.sheetSubtitle}>View the people assigned to a farm</Text></View>
              <Pressable accessibilityLabel="Close farm selector" onPress={() => setFarmPickerVisible(false)} style={styles.sheetClose}><Ionicons name="close" size={20} color="#d6dcde" /></Pressable>
            </View>
            {FARMS.map((farm, index) => {
              const selected = farm.id === selectedFarmId;
              const count = farm.id === 'all' ? members.length : members.filter((member) => member.farmIds?.includes(farm.id)).length;
              return (
                <Pressable key={farm.id} onPress={() => { setSelectedFarmId(farm.id); setFarmPickerVisible(false); }} style={({ pressed }) => [styles.farmOption, index < FARMS.length - 1 && styles.farmOptionDivider, pressed && styles.rowPressed]}>
                  <View style={[styles.farmOptionIcon, selected && styles.farmOptionIconSelected]}><MaterialCommunityIcons name={farm.id === 'all' ? 'view-grid-outline' : 'barn'} size={20} color={selected ? '#ff8500' : '#829095'} /></View>
                  <View style={styles.farmOptionCopy}><Text style={[styles.farmOptionName, selected && styles.farmOptionNameSelected]}>{farm.name}</Text><Text style={styles.farmOptionMeta}>{farm.location} - {count} members</Text></View>
                  {selected && <Ionicons name="checkmark-circle" size={21} color="#ff8500" />}
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#020709' },
  pageWrap: { flexGrow: 1, alignItems: 'center', backgroundColor: '#020709' },
  page: { width: '100%', maxWidth: 720, backgroundColor: '#020709' },
  hero: { height: 270, overflow: 'hidden', backgroundColor: '#101719' },
  heroCompact: { height: 260 },
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
  heroCopy: { marginTop: 'auto', maxWidth: 465, paddingHorizontal: 18, paddingBottom: 23 },
  heroCopyNarrow: { maxWidth: 335, paddingHorizontal: 12, paddingBottom: 17 },
  farmName: {
    color: '#f5f6f6', fontSize: 34, lineHeight: 40, fontWeight: '800', letterSpacing: 0,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', web: 'Georgia' }),
    textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 5,
  },
  farmNameNarrow: { fontSize: 29, lineHeight: 34 },
  farmTagline: { marginTop: 6, color: '#bac1c3', fontSize: 14, lineHeight: 20, letterSpacing: 0 },
  farmMeta: { marginTop: 13, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 10 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { color: '#b8c0c2', fontSize: 12, letterSpacing: 0 },
  metaDivider: { width: 1, height: 14, backgroundColor: '#6d777a' },
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
    height: 52, minWidth: 160, paddingHorizontal: 18, borderRadius: 8,
    backgroundColor: '#f66f00', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9,
  },
  addButtonCompact: { width: 52, minWidth: 52, paddingHorizontal: 0 },
  addButtonText: { color: '#fff', fontSize: 14, fontWeight: '700', letterSpacing: 0 },
  summaryGrid: { marginTop: 14, flexDirection: 'row', gap: 10 },
  summaryCard: {
    flex: 1, minWidth: 0, height: 104, paddingHorizontal: 5, borderRadius: 8,
    borderWidth: 1, borderColor: '#1c2a30', backgroundColor: '#0b1418', alignItems: 'center', justifyContent: 'center',
  },
  summaryCardNarrow: { height: 98 },
  summaryIcon: { width: 39, height: 39, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  summaryValue: { marginTop: 5, color: '#eef2f3', fontSize: 25, lineHeight: 28, fontWeight: '600', letterSpacing: 0 },
  summaryValueNarrow: { fontSize: 22 },
  summaryLabel: { marginTop: 3, color: '#9ca6aa', fontSize: 10, textAlign: 'center', letterSpacing: 0 },
  summaryLabelNarrow: { fontSize: 9 },
  selectorLabel: { marginTop: 18, marginBottom: 6, color: '#7f8b8f', fontSize: 9, fontWeight: '700', textTransform: 'uppercase' },
  farmSelector: { minHeight: 64, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#29373d', backgroundColor: '#0a1317', flexDirection: 'row', alignItems: 'center', gap: 10 },
  farmSelectorIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,133,0,0.09)', alignItems: 'center', justifyContent: 'center' },
  farmSelectorCopy: { flex: 1, minWidth: 0 },
  farmSelectorName: { color: '#e8ebec', fontSize: 13, fontWeight: '700' },
  farmSelectorLocation: { marginTop: 3, color: '#7f8b8f', fontSize: 9 },
  teamList: { gap: 7 },
  teamCard: { minHeight: 82, padding: 11, borderRadius: 8, borderWidth: 1, borderColor: '#243239', backgroundColor: '#0a1317', flexDirection: 'row', alignItems: 'center', gap: 10 },
  teamCardIcon: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, borderColor: '#523713', backgroundColor: 'rgba(255,133,0,0.07)', alignItems: 'center', justifyContent: 'center' },
  teamCardCopy: { flex: 1, minWidth: 0 },
  teamCardName: { color: '#e9eced', fontSize: 13, fontWeight: '700', letterSpacing: 0 },
  teamCardFocus: { marginTop: 3, color: '#909b9e', fontSize: 9, letterSpacing: 0 },
  teamCardMeta: { marginTop: 7, flexDirection: 'row', alignItems: 'center', gap: 5 },
  teamCardMetaText: { color: '#778488', fontSize: 8, letterSpacing: 0 },
  teamCardDot: { color: '#59666b', fontSize: 8, letterSpacing: 0 },
  teamCardAvatars: { flexDirection: 'row', alignItems: 'center', paddingLeft: 12 },
  teamCardAvatar: { width: 30, height: 30, borderRadius: 15, borderWidth: 2, borderColor: '#0a1317' },
  teamCardAvatarTrailing: { marginLeft: -11 },
  filters: { paddingTop: 14, gap: 7 },
  filterButton: {
    minHeight: 34, paddingHorizontal: 14, borderRadius: 8, borderWidth: 1,
    borderColor: '#202b30', backgroundColor: '#0b1418', alignItems: 'center', justifyContent: 'center',
  },
  filterButtonActive: { borderColor: '#ff8500', backgroundColor: 'rgba(255, 133, 0, 0.1)' },
  filterText: { color: '#929c9f', fontSize: 11, letterSpacing: 0 },
  filterTextActive: { color: '#ff9a00' },
  sectionHeader: { marginTop: 20, marginBottom: 7, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { color: '#e5e9ea', fontSize: 16, fontWeight: '600', letterSpacing: 0 },
  memberCount: { color: '#899397', fontSize: 10, letterSpacing: 0 },
  memberList: { gap: 7 },
  memberCard: {
    minHeight: 84, padding: 11, borderRadius: 8, borderWidth: 1, borderColor: '#1d2b31',
    backgroundColor: '#0a1317', flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  memberCardNarrow: { minHeight: 82, paddingHorizontal: 9, gap: 8 },
  avatarWrap: { position: 'relative' },
  avatar: { width: 54, height: 54, borderRadius: 8, borderWidth: 1, borderColor: '#3a4549' },
  avatarNarrow: { width: 48, height: 48, borderRadius: 7 },
  memberMain: { flex: 1, minWidth: 0 },
  memberTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  memberName: { flexShrink: 1, color: '#e9eced', fontSize: 13, fontWeight: '700', letterSpacing: 0 },
  memberRole: { flexShrink: 1, color: '#8e9a9e', fontSize: 9, letterSpacing: 0 },
  memberMeta: { marginTop: 9, flexDirection: 'row', alignItems: 'center', gap: 5 },
  teamTag: {
    maxWidth: '52%', flexDirection: 'row', alignItems: 'center', gap: 4,
  },
  teamTagText: { color: '#8ea1a5', fontSize: 9, letterSpacing: 0 },
  shiftText: { flex: 1, color: '#7f8b8f', fontSize: 9, letterSpacing: 0 },
  memberAside: { width: 112, minHeight: 44, alignItems: 'flex-end', justifyContent: 'center', gap: 8 },
  memberAsideNarrow: { width: 84 },
  memberAsideTop: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 7 },
  memberStatus: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  memberStatusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#ff8500' },
  memberStatusDotMuted: { backgroundColor: '#59666b' },
  statusText: { color: '#ff9400', fontSize: 8, fontWeight: '700', letterSpacing: 0 },
  statusTextMuted: { color: '#768286' },
  memberTasks: { maxWidth: '100%', color: '#859195', fontSize: 8, letterSpacing: 0 },
  scheduleLink: { color: '#ff8a00', fontSize: 11, letterSpacing: 0 },
  coverageFarm: { marginTop: 2, color: '#788589', fontSize: 8 },
  coveragePanel: {
    minHeight: 76, borderRadius: 8, borderWidth: 1, borderColor: '#1c2a30',
    backgroundColor: '#0b1418', flexDirection: 'row', alignItems: 'stretch',
  },
  coveragePanelCompact: { flexDirection: 'column' },
  coverageItem: { flex: 1, minWidth: 0, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 9 },
  coverageDivider: { borderRightWidth: 1, borderRightColor: '#1d2b31' },
  coverageDot: { width: 9, height: 9, borderRadius: 5 },
  coverageLabel: { color: '#dfe4e5', fontSize: 11, fontWeight: '600', letterSpacing: 0 },
  coverageTime: { marginTop: 3, color: '#7f8a8e', fontSize: 9, letterSpacing: 0 },
  coverageMembers: { marginLeft: 'auto', color: '#9ca6aa', fontSize: 9, letterSpacing: 0 },
  emptyState: { height: 190, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyText: { color: '#7f8a8e', fontSize: 12, letterSpacing: 0 },
  modalBackdrop: { flex: 1, padding: 14, backgroundColor: 'rgba(0,0,0,0.72)', justifyContent: 'flex-end', alignItems: 'center' },
  farmSheet: { width: '100%', maxWidth: 700, paddingHorizontal: 12, paddingTop: 8, paddingBottom: 18, borderRadius: 8, borderWidth: 1, borderColor: '#2b3940', backgroundColor: '#091216' },
  sheetHandle: { width: 38, height: 4, borderRadius: 2, backgroundColor: '#435057', alignSelf: 'center', marginBottom: 10 },
  sheetHeader: { minHeight: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sheetTitle: { color: '#edf0f1', fontSize: 16, fontWeight: '700' },
  sheetSubtitle: { marginTop: 3, color: '#7f8b8f', fontSize: 9 },
  sheetClose: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#111d22', alignItems: 'center', justifyContent: 'center' },
  farmOption: { minHeight: 66, paddingHorizontal: 5, flexDirection: 'row', alignItems: 'center', gap: 10 },
  farmOptionDivider: { borderBottomWidth: 1, borderBottomColor: '#1d2b31' },
  farmOptionIcon: { width: 39, height: 39, borderRadius: 20, backgroundColor: '#111d22', alignItems: 'center', justifyContent: 'center' },
  farmOptionIconSelected: { backgroundColor: 'rgba(255,133,0,0.1)' },
  farmOptionCopy: { flex: 1, minWidth: 0 },
  farmOptionName: { color: '#c9d0d2', fontSize: 12, fontWeight: '600' },
  farmOptionNameSelected: { color: '#ff9400' },
  farmOptionMeta: { marginTop: 3, color: '#748084', fontSize: 8 },
  rowPressed: { backgroundColor: 'rgba(255,255,255,0.025)' },
  pressed: { opacity: 0.72 },
  cardPressed: { opacity: 0.76, transform: [{ scale: 0.995 }] },
});

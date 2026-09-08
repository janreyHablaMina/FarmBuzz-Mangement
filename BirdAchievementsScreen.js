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
import { FLOCK_HERO_IMAGE } from './constants';

const ORANGE = '#ff7a00';
const EMPTY_WIN = { title: '', wins: '1', certificate: '', location: '', date: 'Sep 8, 2026', notes: '' };
const CERTIFICATE_IMAGES = [
  'https://images.unsplash.com/photo-1569336415962-a4bd9f69c07b?auto=format&fit=crop&w=260&q=82',
  'https://images.unsplash.com/photo-1578269174936-2709b6aeb913?auto=format&fit=crop&w=260&q=82',
  'https://images.unsplash.com/photo-1589758438368-0ad531db3366?auto=format&fit=crop&w=260&q=82',
  'https://images.unsplash.com/photo-1569025690938-a00729c9e1f9?auto=format&fit=crop&w=260&q=82',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=260&q=82',
];

function getFarmBuzzId(bird) {
  if (bird.farmBuzzId) return bird.farmBuzzId;
  const ring = bird.details?.find((detail) => detail.icon === 'tag-outline')?.text || bird.name;
  const digits = ring.replace(/\D/g, '').slice(-5) || '001';
  return `FBZ-${new Date().getFullYear()}-${digits.padStart(3, '0')}`;
}

function getInitialWins(bird) {
  const winDetail = bird?.details?.find((detail) => /win/i.test(detail.text || ''));
  const wins = Number((winDetail?.text || '').match(/\d+/)?.[0] || 0);
  return Number.isFinite(wins) ? wins : 0;
}

function makeDefaultAchievement(bird) {
  const wins = getInitialWins(bird);
  const recordCount = Math.max(5, wins);
  return {
    records: Array.from({ length: recordCount }, (_, index) => ({
      id: `win-sample-${index + 1}`,
      title: [
        'Regional Derby Win',
        'Farm Cup Champion',
        'Breeders Match Win',
        'Conditioning Trial Win',
        'Club Circuit Placement',
      ][index] || `Win Record ${index + 1}`,
      wins: '1',
      certificate: [
        'Regional Derby Certificate',
        'Farm Cup Trophy Certificate',
        'Breeders Match Result Certificate',
        'Conditioning Trial Recognition',
        'Club Circuit Placement Certificate',
      ][index] || `${bird.name} certificate ${index + 1}`,
      location: [
        'San Fernando, Pampanga',
        'Angeles City, Pampanga',
        'Mabalacat, Pampanga',
        'Mexico, Pampanga',
        'Pampanga, Philippines',
      ][index] || 'Pampanga, Philippines',
      date: ['Sep 8, 2026', 'Aug 24, 2026', 'Jul 18, 2026', 'Jun 12, 2026', 'May 30, 2026'][index] || 'Sep 8, 2026',
      notes: `${bird.name} performance record with certificate on file.`,
      image: CERTIFICATE_IMAGES[index % CERTIFICATE_IMAGES.length],
    })),
  };
}

function getRecords(achievement, bird) {
  if (achievement?.records) return achievement.records;
  if (achievement?.wins) {
    const wins = Number.parseInt(achievement.wins, 10) || 0;
    return wins > 0 ? [{
      id: 'win-saved',
      title: achievement.title || 'Recorded win history',
      wins: String(wins),
      certificate: achievement.certificate || '',
      location: achievement.location || '',
      date: achievement.updatedAt || 'Sep 8, 2026',
      notes: achievement.notes || '',
      image: CERTIFICATE_IMAGES[0],
    }] : [];
  }
  return makeDefaultAchievement(bird || { name: 'Bird', details: [] }).records;
}

function HeaderButton({ icon, label, onPress }) {
  return <Pressable accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}><Ionicons name={icon} size={21} color="#eef1f2" /></Pressable>;
}

function LabeledInput({ label, value, onChangeText, placeholder, icon, multiline, keyboardType }) {
  return (
    <View style={[styles.inputBox, multiline && styles.notesBox]}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputRow}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#657176"
          selectionColor={ORANGE}
          multiline={multiline}
          keyboardType={keyboardType}
          textAlignVertical={multiline ? 'top' : 'center'}
          style={[styles.textInput, multiline && styles.notesInput]}
        />
        {icon && <MaterialCommunityIcons name={icon} size={20} color="#aeb7ba" />}
      </View>
    </View>
  );
}

function CertificatePreview({ compact, source }) {
  if (source) {
    return (
      <Image
        source={source}
        style={[styles.certificatePreview, compact && styles.certificatePreviewCompact]}
        contentFit="cover"
        contentPosition="center"
        cachePolicy="memory-disk"
      />
    );
  }

  return (
    <View style={[styles.certificatePreview, compact && styles.certificatePreviewCompact]}>
      <View style={styles.certificateSeal}>
        <MaterialCommunityIcons name="certificate-outline" size={18} color="#fff7ed" />
      </View>
      <View style={styles.certificateLines}>
        <View style={styles.certificateLineStrong} />
        <View style={styles.certificateLine} />
        <View style={styles.certificateLineShort} />
      </View>
    </View>
  );
}

function WinRecord({ record, compact, onPress }) {
  const wins = Number.parseInt(record.wins, 10) || 0;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.winCard, pressed && styles.cardPressed]}>
      <CertificatePreview compact={compact} source={record.image} />
      <View style={styles.winCopy}>
        <View style={styles.winTitleRow}>
          <Text numberOfLines={1} style={styles.winTitle}>{record.title || `${wins} Win${wins === 1 ? '' : 's'}`}</Text>
        </View>
        <Text numberOfLines={1} style={styles.winMeta}>{wins} win{wins === 1 ? '' : 's'} - {record.date}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#899397" />
    </Pressable>
  );
}

function DetailRow({ icon, label, value }) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailIcon}>
        <MaterialCommunityIcons name={icon} size={20} color={ORANGE} />
      </View>
      <View style={styles.detailCopy}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value || 'Not recorded'}</Text>
      </View>
    </View>
  );
}

export default function BirdAchievementsScreen({ bird, achievement, onAchievementChange, onBack }) {
  const { width } = useWindowDimensions();
  const compact = width < 520;
  const narrow = width < 380;
  const [records, setRecords] = useState(() => getRecords(achievement, bird));
  const [query, setQuery] = useState('');
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [draft, setDraft] = useState(EMPTY_WIN);
  const totalWins = records.reduce((sum, record) => sum + (Number.parseInt(record.wins, 10) || 0), 0);
  const visibleRecords = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return records;
    return records.filter((record) => (
      `${record.title} ${record.certificate} ${record.location} ${record.notes} ${record.date}`.toLowerCase().includes(search)
    ));
  }, [query, records]);

  if (!bird) {
    return (
      <View style={styles.missingScreen}>
        <Text style={styles.missingTitle}>Bird record unavailable</Text>
        <Pressable onPress={onBack} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Back to Bird Profile</Text>
        </Pressable>
      </View>
    );
  }

  const persistRecords = (nextRecords) => {
    const nextTotal = nextRecords.reduce((sum, record) => sum + (Number.parseInt(record.wins, 10) || 0), 0);
    setRecords(nextRecords);
    onAchievementChange?.({
      records: nextRecords,
      wins: String(nextTotal),
      updatedAt: 'Sep 8, 2026',
    });
  };

  const openNewWin = () => {
    setEditingId(null);
    setDraft(EMPTY_WIN);
    setEditorOpen(true);
  };

  const openRecord = (record) => {
    setSelectedRecord(record);
  };

  const editRecord = (record) => {
    setEditingId(record.id);
    setDraft({
      title: record.title || '',
      wins: record.wins || '1',
      certificate: record.certificate || '',
      location: record.location || '',
      date: record.date || 'Sep 8, 2026',
      notes: record.notes || '',
    });
    setEditorOpen(true);
  };

  const saveWin = () => {
    const parsedWins = Number.parseInt(draft.wins || '0', 10);
    if (!draft.title.trim()) {
      Alert.alert('Title required', 'Add a short title for this win record.');
      return;
    }
    if (!Number.isFinite(parsedWins) || parsedWins < 1) {
      Alert.alert('Check wins', 'Enter at least 1 win for this record.');
      return;
    }

    const record = {
      id: editingId || `win-${Date.now()}`,
      title: draft.title.trim(),
      wins: String(parsedWins),
      certificate: draft.certificate.trim(),
      location: draft.location.trim(),
      date: draft.date.trim() || 'Sep 8, 2026',
      notes: draft.notes.trim(),
      image: records.find((item) => item.id === editingId)?.image || CERTIFICATE_IMAGES[records.length % CERTIFICATE_IMAGES.length],
    };
    const nextRecords = editingId
      ? records.map((item) => item.id === editingId ? record : item)
      : [record, ...records];
    persistRecords(nextRecords);
    setSelectedRecord(record);
    setEditorOpen(false);
    Alert.alert(editingId ? 'Win updated' : 'Win added', `${bird.name}'s achievement record has been saved.`);
  };

  const deleteWin = () => {
    if (!editingId) return;
    persistRecords(records.filter((record) => record.id !== editingId));
    setSelectedRecord(null);
    setEditorOpen(false);
    Alert.alert('Win deleted', 'The win record was removed.');
  };

  if (selectedRecord) {
    const wins = Number.parseInt(selectedRecord.wins, 10) || 0;
    return (
      <View style={styles.screen}>
        <StatusBar style="light" translucent backgroundColor="transparent" />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.pageWrap}>
          <View style={styles.page}>
            <View style={[styles.hero, compact && styles.heroCompact]}>
              <Image source={bird.image || FLOCK_HERO_IMAGE} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="center" cachePolicy="memory-disk" />
              <LinearGradient colors={['rgba(2,7,9,0.16)', 'rgba(2,7,9,0.25)', 'rgba(2,7,9,0.9)', '#03090c']} locations={[0, 0.4, 0.8, 1]} style={StyleSheet.absoluteFill} />
              <SafeAreaView edges={['top']} style={styles.heroSafeArea}>
                <View style={styles.heroHeader}>
                  <View style={styles.heroHeaderLeft}>
                    <HeaderButton icon="arrow-back" label="Back to wins" onPress={() => setSelectedRecord(null)} />
                    <Text style={styles.screenTitle}>Win Detail</Text>
                  </View>
                  <HeaderButton
                    icon="pencil-outline"
                    label="Edit win"
                    onPress={() => {
                      setSelectedRecord(null);
                      editRecord(selectedRecord);
                    }}
                  />
                </View>
                <View style={[styles.heroCopy, narrow && styles.heroCopyNarrow]}>
                  <View style={styles.achievementBadge}>
                    <MaterialCommunityIcons name="certificate-outline" size={15} color={ORANGE} />
                    <Text style={styles.achievementBadgeText}>CERTIFICATE DETAIL</Text>
                  </View>
                  <Text style={styles.birdName}>{selectedRecord.title}</Text>
                  <Text style={styles.birdId}>{wins} win{wins === 1 ? '' : 's'} - {bird.name}</Text>
                </View>
              </SafeAreaView>
            </View>

            <View style={[styles.content, narrow && styles.contentNarrow]}>
              <View style={styles.certificateHeroCard}>
                <CertificatePreview />
                <View style={styles.certificateHeroCopy}>
                  <Text style={styles.certificateHeroLabel}>Certificate</Text>
                  <Text numberOfLines={2} style={styles.certificateHeroTitle}>{selectedRecord.certificate || 'No certificate attached yet'}</Text>
                </View>
              </View>
              <View style={styles.detailPanel}>
                <DetailRow icon="trophy-outline" label="Wins" value={`${wins}`} />
                <DetailRow icon="map-marker-outline" label="Location" value={selectedRecord.location} />
                <DetailRow icon="calendar-outline" label="Date" value={selectedRecord.date} />
                <DetailRow icon="note-text-outline" label="Notes" value={selectedRecord.notes} />
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.pageWrap}>
        <View style={styles.page}>
          <View style={[styles.hero, compact && styles.heroCompact]}>
            <Image source={bird.image || FLOCK_HERO_IMAGE} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="center" cachePolicy="memory-disk" />
            <LinearGradient colors={['rgba(2,7,9,0.16)', 'rgba(2,7,9,0.25)', 'rgba(2,7,9,0.9)', '#03090c']} locations={[0, 0.4, 0.8, 1]} style={StyleSheet.absoluteFill} />
            <SafeAreaView edges={['top']} style={styles.heroSafeArea}>
              <View style={styles.heroHeader}>
                <View style={styles.heroHeaderLeft}>
                  <HeaderButton icon="arrow-back" label="Back to bird profile" onPress={onBack} />
                  <Text style={styles.screenTitle}>Achievements</Text>
                </View>
                <HeaderButton icon="add" label="Add win" onPress={openNewWin} />
              </View>
              <View style={[styles.heroCopy, narrow && styles.heroCopyNarrow]}>
                <View style={styles.achievementBadge}>
                  <MaterialCommunityIcons name="trophy-outline" size={15} color={ORANGE} />
                  <Text style={styles.achievementBadgeText}>PERFORMANCE RECORD</Text>
                </View>
                <Text style={styles.birdName}>{bird.name}</Text>
                <Text style={styles.birdId}>{getFarmBuzzId(bird)}</Text>
              </View>
            </SafeAreaView>
          </View>

          <View style={[styles.content, narrow && styles.contentNarrow]}>
            <View style={styles.summaryPanel}>
              <View style={styles.summaryItem}><MaterialCommunityIcons name="trophy-outline" size={23} color={ORANGE} /><Text style={styles.summaryValue}>{totalWins}</Text><Text style={styles.summaryLabel}>Total Wins</Text></View>
              <View style={styles.summaryDivider} /><View style={styles.summaryItem}><MaterialCommunityIcons name="certificate-outline" size={23} color={ORANGE} /><Text style={styles.summaryValue}>{records.filter((record) => record.certificate).length}</Text><Text style={styles.summaryLabel}>Certificates</Text></View>
              <View style={styles.summaryDivider} /><View style={styles.summaryItem}><MaterialCommunityIcons name="map-marker-outline" size={23} color={ORANGE} /><Text style={styles.summaryValue}>{records.filter((record) => record.location).length}</Text><Text style={styles.summaryLabel}>Locations</Text></View>
            </View>

            <View style={styles.actionRow}>
              <View style={styles.searchBox}>
                <Ionicons name="search" size={20} color="#899397" />
                <TextInput value={query} onChangeText={setQuery} placeholder="Search wins..." placeholderTextColor="#657176" style={styles.searchInput} />
                {!!query && <Pressable accessibilityLabel="Clear search" onPress={() => setQuery('')}><Ionicons name="close-circle" size={19} color="#7d898d" /></Pressable>}
              </View>
              <Pressable
                accessibilityLabel="Add win"
                onPress={openNewWin}
                style={({ pressed }) => [styles.addSquareButton, pressed && styles.pressed]}
              >
                <Ionicons name="add" size={28} color="#fff" />
              </Pressable>
            </View>

            <View style={styles.sectionHeading}>
              <View><Text style={styles.sectionTitle}>Wins</Text><Text style={styles.sectionSubtitle}>Newest records appear first</Text></View>
              <Text style={styles.itemCount}>{visibleRecords.length} records</Text>
            </View>

            <View style={styles.winList}>
              {visibleRecords.map((record) => <WinRecord key={record.id} record={record} compact={compact} onPress={() => openRecord(record)} />)}
            </View>
            {!visibleRecords.length && (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="trophy-broken" size={34} color="#536065" />
                <Text style={styles.emptyTitle}>No wins found</Text>
                <Text style={styles.emptyText}>{records.length ? 'Try another search.' : 'Add the first win record for this bird.'}</Text>
              </View>
            )}

          </View>
        </View>
      </ScrollView>

      <Modal visible={editorOpen} transparent animationType="fade" statusBarTranslucent onRequestClose={() => setEditorOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setEditorOpen(false)}>
          <Pressable style={[styles.modalCard, compact && styles.modalCardCompact]} onPress={() => {}}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderCopy}>
                <Text style={styles.modalTitle}>{editingId ? 'Edit Win' : 'Add Win'}</Text>
                <Text numberOfLines={1} style={styles.modalSubtitle}>{bird.name} - {getFarmBuzzId(bird)}</Text>
              </View>
              <Pressable accessibilityLabel="Close" onPress={() => setEditorOpen(false)} style={styles.modalClose}>
                <Ionicons name="close" size={20} color="#c7cdcf" />
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" style={styles.formScroll}>
              <LabeledInput label="Win Title" value={draft.title} onChangeText={(value) => setDraft((current) => ({ ...current, title: value }))} placeholder="Event or achievement title" icon="trophy-outline" />
              <LabeledInput label="Wins" value={draft.wins} onChangeText={(value) => setDraft((current) => ({ ...current, wins: value.replace(/[^\d]/g, '') }))} placeholder="1" icon="counter" keyboardType="numeric" />
              <LabeledInput label="Certificate" value={draft.certificate} onChangeText={(value) => setDraft((current) => ({ ...current, certificate: value }))} placeholder="Certificate name or reference number" icon="certificate-outline" />
              <LabeledInput label="Location" value={draft.location} onChangeText={(value) => setDraft((current) => ({ ...current, location: value }))} placeholder="Where it happened" icon="map-marker-outline" />
              <LabeledInput label="Date" value={draft.date} onChangeText={(value) => setDraft((current) => ({ ...current, date: value }))} placeholder="Sep 8, 2026" icon="calendar-outline" />
              <LabeledInput label="Notes" value={draft.notes} onChangeText={(value) => setDraft((current) => ({ ...current, notes: value }))} placeholder="Performance notes, opponent, judge remarks, or result details" icon="note-text-outline" multiline />
            </ScrollView>
            <View style={styles.modalActions}>
              {editingId && <Pressable onPress={deleteWin} style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}><Text style={styles.deleteButtonText}>Delete</Text></Pressable>}
              <Pressable onPress={saveWin} style={({ pressed }) => [styles.saveButton, pressed && styles.pressed]}>
                <MaterialCommunityIcons name="content-save-outline" size={20} color="#fff" />
                <Text style={styles.saveButtonText}>Save Win</Text>
              </Pressable>
            </View>
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
  hero: { height: 265, overflow: 'hidden', backgroundColor: '#101719' },
  heroCompact: { height: 245 },
  heroSafeArea: { flex: 1 },
  heroHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: Platform.OS === 'web' ? 10 : 3 },
  heroHeaderLeft: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 13 },
  headerButton: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(190,204,208,0.35)', backgroundColor: 'rgba(2,8,11,0.65)', alignItems: 'center', justifyContent: 'center' },
  screenTitle: { flexShrink: 1, color: '#f3f5f5', fontSize: 18, fontWeight: '700', letterSpacing: 0 },
  heroCopy: { marginTop: 'auto', paddingHorizontal: 18, paddingBottom: 24 },
  heroCopyNarrow: { paddingHorizontal: 12 },
  achievementBadge: { alignSelf: 'flex-start', minHeight: 28, paddingHorizontal: 10, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,122,0,0.38)', backgroundColor: 'rgba(255,122,0,0.08)', flexDirection: 'row', alignItems: 'center', gap: 6 },
  achievementBadgeText: { color: ORANGE, fontSize: 9, fontWeight: '800', letterSpacing: 0 },
  birdName: { marginTop: 9, color: '#fff', fontSize: 33, lineHeight: 39, fontWeight: '800', letterSpacing: 0, textShadowColor: 'rgba(0,0,0,0.75)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 5 },
  birdId: { marginTop: 3, color: '#b8c0c2', fontSize: 11, letterSpacing: 0 },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 30 },
  contentNarrow: { paddingHorizontal: 9 },
  summaryPanel: { minHeight: 86, borderWidth: 1, borderColor: '#26343a', borderRadius: 8, backgroundColor: '#0a1317', flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  summaryItem: { flex: 1, minWidth: 0, alignItems: 'center', paddingHorizontal: 6 },
  summaryDivider: { width: 1, alignSelf: 'stretch', backgroundColor: '#223037' },
  summaryValue: { marginTop: 4, color: '#f4f5f5', fontSize: 22, lineHeight: 26, fontWeight: '800', letterSpacing: 0 },
  summaryLabel: { marginTop: 2, color: '#8f9a9d', fontSize: 9, letterSpacing: 0 },
  actionRow: { marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 8 },
  searchBox: { flex: 1, minWidth: 0, height: 58, borderWidth: 1, borderColor: '#26343a', borderRadius: 8, backgroundColor: '#0a1317', paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 9 },
  searchInput: { flex: 1, minWidth: 0, color: '#f1f3f3', fontSize: 13, letterSpacing: 0, outlineStyle: 'none' },
  addSquareButton: { width: 54, height: 58, borderRadius: 8, backgroundColor: ORANGE, alignItems: 'center', justifyContent: 'center' },
  sectionHeading: { marginTop: 18, marginBottom: 9, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  sectionTitle: { color: '#e7eaeb', fontSize: 16, fontWeight: '700', letterSpacing: 0 },
  sectionSubtitle: { marginTop: 3, color: '#7b878b', fontSize: 9, letterSpacing: 0 },
  itemCount: { color: ORANGE, fontSize: 8, fontWeight: '700', letterSpacing: 0 },
  winList: { gap: 9 },
  winCard: { minHeight: 78, borderWidth: 1, borderColor: '#26343a', borderRadius: 8, backgroundColor: '#0a1317', paddingHorizontal: 7, paddingVertical: 7, flexDirection: 'row', alignItems: 'center', gap: 10 },
  certificatePreview: { width: 64, height: 64, borderRadius: 7, overflow: 'hidden', borderWidth: 1, borderColor: '#765024', backgroundColor: '#f4ead6', alignItems: 'center', justifyContent: 'center' },
  certificatePreviewCompact: { width: 60, height: 60 },
  certificateSeal: { width: 30, height: 30, borderRadius: 15, backgroundColor: ORANGE, alignItems: 'center', justifyContent: 'center' },
  certificateLines: { position: 'absolute', left: 9, right: 9, bottom: 9, gap: 3, alignItems: 'center' },
  certificateLineStrong: { width: '72%', height: 3, borderRadius: 2, backgroundColor: '#8b6230' },
  certificateLine: { width: '88%', height: 2, borderRadius: 1, backgroundColor: '#c6a16b' },
  certificateLineShort: { width: '54%', height: 2, borderRadius: 1, backgroundColor: '#c6a16b' },
  winCopy: { flex: 1, minWidth: 0 },
  winTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  winTitle: { flex: 1, minWidth: 0, color: '#eef1f2', fontSize: 13, fontWeight: '700', letterSpacing: 0 },
  winDate: { color: '#7f8c90', fontSize: 8, letterSpacing: 0 },
  winMeta: { marginTop: 5, color: ORANGE, fontSize: 10, fontWeight: '700', letterSpacing: 0 },
  winDetail: { marginTop: 4, color: '#879296', fontSize: 9, letterSpacing: 0 },
  certificateHeroCard: { minHeight: 112, borderWidth: 1, borderColor: '#26343a', borderRadius: 8, backgroundColor: '#0a1317', padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  certificateHeroCopy: { flex: 1, minWidth: 0 },
  certificateHeroLabel: { color: '#8f9a9d', fontSize: 9, fontWeight: '700', letterSpacing: 0 },
  certificateHeroTitle: { marginTop: 5, color: '#f1f3f3', fontSize: 15, lineHeight: 20, fontWeight: '700', letterSpacing: 0 },
  detailPanel: { marginTop: 14, borderWidth: 1, borderColor: '#26343a', borderRadius: 8, backgroundColor: '#0a1317', overflow: 'hidden' },
  detailRow: { minHeight: 66, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: 1, borderBottomColor: '#223037' },
  detailIcon: { width: 38, height: 38, borderRadius: 7, backgroundColor: 'rgba(255,122,0,0.08)', alignItems: 'center', justifyContent: 'center' },
  detailCopy: { flex: 1, minWidth: 0 },
  detailLabel: { color: '#8f9a9d', fontSize: 9, letterSpacing: 0 },
  detailValue: { marginTop: 4, color: '#e7eaeb', fontSize: 12, lineHeight: 17, letterSpacing: 0 },
  cardPressed: { opacity: 0.74, transform: [{ scale: 0.99 }] },
  emptyState: { minHeight: 130, borderWidth: 1, borderColor: '#26343a', borderRadius: 8, backgroundColor: '#0a1317', alignItems: 'center', justifyContent: 'center', padding: 18 },
  emptyTitle: { marginTop: 8, color: '#dce1e2', fontSize: 13, fontWeight: '700', letterSpacing: 0 },
  emptyText: { marginTop: 4, color: '#7f8c90', fontSize: 10, letterSpacing: 0 },
  modalBackdrop: { flex: 1, paddingHorizontal: 10, paddingBottom: 10, backgroundColor: 'rgba(0,0,0,0.68)', justifyContent: 'flex-end', alignItems: 'center' },
  modalCard: { width: '100%', maxWidth: 700, maxHeight: '88%', paddingHorizontal: 12, paddingBottom: 12, borderWidth: 1, borderColor: '#2b3a40', borderRadius: 8, backgroundColor: '#081115' },
  modalCardCompact: { maxHeight: '92%' },
  modalHandle: { alignSelf: 'center', width: 34, height: 3, marginTop: 8, borderRadius: 2, backgroundColor: '#46545a' },
  modalHeader: { minHeight: 62, paddingHorizontal: 4, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#223037' },
  modalHeaderCopy: { flex: 1, minWidth: 0 },
  modalTitle: { color: '#f1f3f3', fontSize: 16, fontWeight: '800', letterSpacing: 0 },
  modalSubtitle: { marginTop: 3, color: '#7f8c90', fontSize: 9, letterSpacing: 0 },
  modalClose: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#111c20', alignItems: 'center', justifyContent: 'center' },
  formScroll: { paddingTop: 12 },
  inputBox: { minHeight: 58, marginBottom: 11, borderWidth: 1, borderColor: '#223037', borderRadius: 8, backgroundColor: '#071014', paddingHorizontal: 11, paddingTop: 8 },
  notesBox: { minHeight: 126 },
  inputLabel: { color: '#8f9a9d', fontSize: 9, fontWeight: '700', letterSpacing: 0 },
  inputRow: { flex: 1, minHeight: 38, flexDirection: 'row', alignItems: 'center', gap: 8 },
  textInput: { flex: 1, minWidth: 0, color: '#f1f3f3', fontSize: 13, letterSpacing: 0, outlineStyle: 'none' },
  notesInput: { minHeight: 82, paddingTop: 8 },
  modalActions: { flexDirection: 'row', gap: 9, paddingTop: 10 },
  deleteButton: { minWidth: 92, height: 48, borderWidth: 1, borderColor: '#5a2525', borderRadius: 8, backgroundColor: 'rgba(255,82,82,0.08)', alignItems: 'center', justifyContent: 'center' },
  deleteButtonText: { color: '#ff6868', fontSize: 12, fontWeight: '700', letterSpacing: 0 },
  saveButton: { flex: 1, height: 48, borderRadius: 8, backgroundColor: ORANGE, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  saveButtonText: { color: '#fff', fontSize: 13, fontWeight: '700', letterSpacing: 0 },
  missingScreen: { flex: 1, backgroundColor: '#020709', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 24 },
  missingTitle: { color: '#dce1e2', fontSize: 16, fontWeight: '700', letterSpacing: 0 },
  primaryButton: { height: 44, marginTop: 8, paddingHorizontal: 18, borderRadius: 8, backgroundColor: ORANGE, alignItems: 'center', justifyContent: 'center' },
  primaryButtonText: { color: '#fff', fontSize: 13, fontWeight: '700', letterSpacing: 0 },
  pressed: { opacity: 0.72 },
});

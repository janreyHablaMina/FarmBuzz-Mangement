import { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
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
const CATEGORIES = [
  { key: 'all', label: 'All', icon: 'view-list-outline' },
  { key: 'Health', label: 'Health', icon: 'stethoscope' },
  { key: 'Behavior', label: 'Behavior', icon: 'eye-outline' },
  { key: 'Breeding', label: 'Breeding', icon: 'gender-male-female' },
  { key: 'General', label: 'General', icon: 'note-text-outline' },
];
const EMPTY_NOTE = { title: '', category: 'General', content: '', date: 'Sep 1, 2026', important: false };

function getFarmBuzzId(bird) {
  if (bird.farmBuzzId) return bird.farmBuzzId;
  const ring = bird.details?.find((detail) => detail.icon === 'tag-outline')?.text || bird.name;
  const digits = ring.replace(/\D/g, '').slice(-5) || '001';
  return `FBZ-${new Date().getFullYear()}-${digits.padStart(3, '0')}`;
}

function makeDefaultNotes(bird) {
  return [
    { id: 'note-health', title: 'Post-treatment follow-up', category: 'Health', content: 'Comb color and appetite are back to normal. Continue observing hydration for the next three days.', date: 'Aug 30, 2026', author: 'Carlo Santos', important: true },
    { id: 'note-behavior', title: 'Morning behavior', category: 'Behavior', content: 'Alert and active during the morning check. Normal feeding response and no signs of limping.', date: 'Aug 27, 2026', author: 'Miguel Dela Cruz', important: false },
    { id: 'note-breeding', title: 'Breeding readiness', category: 'Breeding', content: 'Good body condition and temperament. Ready for the next scheduled pairing assessment.', date: 'Aug 21, 2026', author: 'JU Gamefarm Admin', important: false },
    ...(bird.notes ? [{ id: 'note-original', title: 'Original bird note', category: 'General', content: bird.notes, date: 'Aug 18, 2026', author: 'JU Gamefarm Admin', important: false }] : []),
  ];
}

function HeaderButton({ icon, label, onPress }) {
  return <Pressable accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}><Ionicons name={icon} size={21} color="#eef1f2" /></Pressable>;
}

function NoteCard({ note, onPress }) {
  const category = CATEGORIES.find((item) => item.key === note.category) || CATEGORIES[4];
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.noteCard, note.important && styles.noteCardImportant, pressed && styles.cardPressed]}>
      <View style={styles.noteTopRow}>
        <View style={styles.categoryRow}><View style={styles.categoryIcon}><MaterialCommunityIcons name={category.icon} size={17} color={ORANGE} /></View><View style={styles.noteHeadingCopy}><View style={styles.noteTitleRow}><Text numberOfLines={1} style={styles.noteTitle}>{note.title}</Text>{note.important && <MaterialCommunityIcons name="pin" size={14} color={ORANGE} />}</View><Text style={styles.noteMeta}>{note.category} - {note.date}</Text></View></View>
        <Ionicons name="ellipsis-horizontal" size={20} color="#8d989b" />
      </View>
      <Text numberOfLines={3} style={styles.noteContent}>{note.content}</Text>
      <View style={styles.noteFooter}><View style={styles.authorAvatar}><Text style={styles.authorInitial}>{note.author.charAt(0)}</Text></View><Text style={styles.noteAuthor}>{note.author}</Text><Text style={styles.openLabel}>View or edit</Text><Ionicons name="chevron-forward" size={16} color={ORANGE} /></View>
    </Pressable>
  );
}

export default function BirdNotesScreen({ bird, notes, onNotesChange, onBack }) {
  const { width } = useWindowDimensions();
  const compact = width < 520;
  const narrow = width < 380;
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(EMPTY_NOTE);
  const records = useMemo(() => notes || makeDefaultNotes(bird || { notes: '' }), [bird, notes]);
  const visibleNotes = useMemo(() => records.filter((note) => {
    const matchesCategory = filter === 'all' || note.category === filter;
    const search = query.trim().toLowerCase();
    const matchesSearch = !search || `${note.title} ${note.content} ${note.author}`.toLowerCase().includes(search);
    return matchesCategory && matchesSearch;
  }), [filter, query, records]);

  if (!bird) return <View style={styles.missingScreen}><Text style={styles.missingTitle}>Bird record unavailable</Text><Pressable onPress={onBack} style={styles.primaryButton}><Text style={styles.primaryButtonText}>Back to Bird Profile</Text></Pressable></View>;

  const openNewNote = () => {
    setEditingId(null);
    setDraft(EMPTY_NOTE);
    setEditorOpen(true);
  };

  const openNote = (note) => {
    setEditingId(note.id);
    setDraft({ title: note.title, category: note.category, content: note.content, date: note.date, important: note.important });
    setEditorOpen(true);
  };

  const saveNote = () => {
    if (!draft.title.trim() || !draft.content.trim()) {
      Alert.alert('Missing information', 'Add a title and observation before saving.');
      return;
    }
    if (editingId) {
      onNotesChange?.(records.map((note) => note.id === editingId ? { ...note, ...draft, title: draft.title.trim(), content: draft.content.trim() } : note));
    } else {
      onNotesChange?.([{ id: `note-${Date.now()}`, ...draft, title: draft.title.trim(), content: draft.content.trim(), author: 'JU Gamefarm Admin' }, ...records]);
    }
    setEditorOpen(false);
  };

  const deleteNote = () => {
    onNotesChange?.(records.filter((note) => note.id !== editingId));
    setEditorOpen(false);
    Alert.alert('Observation deleted', 'The note was removed from this bird record.');
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.pageWrap}>
        <View style={styles.page}>
          <View style={[styles.hero, compact && styles.heroCompact]}>
            <Image source={bird.image || FLOCK_HERO_IMAGE} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="center" cachePolicy="memory-disk" />
            <LinearGradient colors={['rgba(2,7,9,0.16)', 'rgba(2,7,9,0.25)', 'rgba(2,7,9,0.9)', '#03090c']} locations={[0, 0.4, 0.8, 1]} style={StyleSheet.absoluteFill} />
            <SafeAreaView edges={['top']} style={styles.heroSafeArea}>
              <View style={styles.heroHeader}><View style={styles.heroHeaderLeft}><HeaderButton icon="arrow-back" label="Back to bird profile" onPress={onBack} /><Text style={styles.screenTitle}>Notes & Observations</Text></View><HeaderButton icon="add" label="Add observation" onPress={openNewNote} /></View>
              <View style={[styles.heroCopy, narrow && styles.heroCopyNarrow]}><View style={styles.notesBadge}><MaterialCommunityIcons name="note-edit-outline" size={15} color={ORANGE} /><Text style={styles.notesBadgeText}>BIRD JOURNAL</Text></View><Text style={styles.birdName}>{bird.name}</Text><Text style={styles.birdId}>{getFarmBuzzId(bird)}</Text></View>
            </SafeAreaView>
          </View>

          <View style={[styles.content, narrow && styles.contentNarrow]}>
            <View style={styles.summaryPanel}>
              <View style={styles.summaryItem}><MaterialCommunityIcons name="note-multiple-outline" size={23} color={ORANGE} /><Text style={styles.summaryValue}>{records.length}</Text><Text style={styles.summaryLabel}>Observations</Text></View>
              <View style={styles.summaryDivider} /><View style={styles.summaryItem}><MaterialCommunityIcons name="pin-outline" size={23} color={ORANGE} /><Text style={styles.summaryValue}>{records.filter((note) => note.important).length}</Text><Text style={styles.summaryLabel}>Important</Text></View>
              <View style={styles.summaryDivider} /><View style={styles.summaryItem}><MaterialCommunityIcons name="calendar-clock-outline" size={23} color={ORANGE} /><Text style={styles.summaryValue}>Aug 30</Text><Text style={styles.summaryLabel}>Latest Entry</Text></View>
            </View>

            <View style={styles.searchBox}><Ionicons name="search" size={20} color="#899397" /><TextInput value={query} onChangeText={setQuery} placeholder="Search observations..." placeholderTextColor="#657176" style={styles.searchInput} />{query ? <Pressable accessibilityLabel="Clear search" onPress={() => setQuery('')}><Ionicons name="close-circle" size={19} color="#7d898d" /></Pressable> : null}</View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>{CATEGORIES.map((item) => <Pressable key={item.key} onPress={() => setFilter(item.key)} style={[styles.filterButton, filter === item.key && styles.filterButtonActive]}><MaterialCommunityIcons name={item.icon} size={16} color={filter === item.key ? ORANGE : '#879296'} /><Text style={[styles.filterText, filter === item.key && styles.filterTextActive]}>{item.label}</Text></Pressable>)}</ScrollView>

            <View style={styles.sectionHeading}><View><Text style={styles.sectionTitle}>Observation Timeline</Text><Text style={styles.sectionSubtitle}>Newest entries appear first</Text></View><Text style={styles.itemCount}>{visibleNotes.length} entries</Text></View>
            <View style={styles.notesList}>{visibleNotes.map((note) => <NoteCard key={note.id} note={note} onPress={() => openNote(note)} />)}</View>
            {!visibleNotes.length && <View style={styles.emptyState}><MaterialCommunityIcons name="note-search-outline" size={34} color="#536065" /><Text style={styles.emptyTitle}>No observations found</Text><Text style={styles.emptyText}>Try another filter or add a new note.</Text></View>}

            <Pressable onPress={openNewNote} style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}><MaterialCommunityIcons name="note-plus-outline" size={21} color="#fff" /><Text style={styles.addButtonText}>Add Observation</Text></Pressable>
          </View>
        </View>
      </ScrollView>

      <Modal visible={editorOpen} transparent animationType="fade" onRequestClose={() => setEditorOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setEditorOpen(false)}>
          <Pressable style={[styles.modalCard, compact && styles.modalCardCompact]} onPress={() => {}}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}><View><Text style={styles.modalTitle}>{editingId ? 'Edit Observation' : 'Add Observation'}</Text><Text style={styles.modalSubtitle}>Record something important about {bird.name}</Text></View><Pressable accessibilityLabel="Close" onPress={() => setEditorOpen(false)} style={styles.modalClose}><Ionicons name="close" size={20} color="#c7cdcf" /></Pressable></View>
            <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <View style={styles.inputGroup}><Text style={styles.inputLabel}>Title *</Text><TextInput value={draft.title} onChangeText={(value) => setDraft((note) => ({ ...note, title: value }))} placeholder="Short observation title" placeholderTextColor="#566368" style={styles.input} /></View>
              <View style={styles.inputGroup}><Text style={styles.inputLabel}>Category</Text><View style={styles.categoryOptions}>{CATEGORIES.slice(1).map((item) => <Pressable key={item.key} onPress={() => setDraft((note) => ({ ...note, category: item.key }))} style={[styles.categoryOption, draft.category === item.key && styles.categoryOptionActive]}><MaterialCommunityIcons name={item.icon} size={15} color={draft.category === item.key ? ORANGE : '#7d898d'} /><Text style={[styles.categoryOptionText, draft.category === item.key && styles.categoryOptionTextActive]}>{item.label}</Text></Pressable>)}</View></View>
              <View style={styles.inputGroup}><Text style={styles.inputLabel}>Observation *</Text><TextInput value={draft.content} onChangeText={(value) => setDraft((note) => ({ ...note, content: value }))} placeholder="Write the observation..." placeholderTextColor="#566368" multiline style={[styles.input, styles.notesInput]} /></View>
              <View style={styles.inputGroup}><Text style={styles.inputLabel}>Date</Text><TextInput value={draft.date} onChangeText={(value) => setDraft((note) => ({ ...note, date: value }))} placeholder="Sep 1, 2026" placeholderTextColor="#566368" style={styles.input} /></View>
              <View style={styles.importantRow}><View style={styles.importantIcon}><MaterialCommunityIcons name="pin-outline" size={20} color={ORANGE} /></View><View style={styles.importantCopy}><Text style={styles.importantTitle}>Mark as Important</Text><Text style={styles.importantSubtitle}>Keep this observation easy to identify</Text></View><Switch value={draft.important} onValueChange={(value) => setDraft((note) => ({ ...note, important: value }))} trackColor={{ false: '#2f3c41', true: '#8a4b08' }} thumbColor={draft.important ? ORANGE : '#8b9699'} /></View>
            </ScrollView>
            <View style={styles.formActions}>{editingId ? <Pressable onPress={deleteNote} style={styles.deleteButton}><MaterialCommunityIcons name="trash-can-outline" size={18} color="#ff6a62" /><Text style={styles.deleteText}>Delete</Text></Pressable> : <Pressable onPress={() => setEditorOpen(false)} style={styles.cancelButton}><Text style={styles.cancelText}>Cancel</Text></Pressable>}<Pressable onPress={saveNote} style={({ pressed }) => [styles.saveButton, pressed && styles.pressed]}><MaterialCommunityIcons name="check-circle-outline" size={19} color="#fff" /><Text style={styles.saveText}>{editingId ? 'Save Changes' : 'Save Observation'}</Text></Pressable></View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#020709' }, pageWrap: { flexGrow: 1, alignItems: 'center', backgroundColor: '#020709' }, page: { width: '100%', maxWidth: 720, backgroundColor: '#020709' }, hero: { height: 330, overflow: 'hidden' }, heroCompact: { height: 300 }, heroSafeArea: { flex: 1 }, heroHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: Platform.OS === 'web' ? 10 : 3 }, heroHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 }, headerButton: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(190,204,208,0.35)', backgroundColor: 'rgba(2,8,11,0.65)', alignItems: 'center', justifyContent: 'center' }, screenTitle: { color: '#f1f3f3', fontSize: 17, fontWeight: '700' }, heroCopy: { marginTop: 'auto', paddingHorizontal: 18, paddingBottom: 28 }, heroCopyNarrow: { paddingHorizontal: 11 }, notesBadge: { alignSelf: 'flex-start', height: 27, paddingHorizontal: 9, borderWidth: 1, borderColor: '#67410f', borderRadius: 14, backgroundColor: 'rgba(255,122,0,0.07)', flexDirection: 'row', alignItems: 'center', gap: 5 }, notesBadgeText: { color: '#dda45e', fontSize: 7, fontWeight: '800' }, birdName: { marginTop: 9, color: '#f1f3f3', fontSize: 29, lineHeight: 35, fontWeight: '800' }, birdId: { marginTop: 4, color: '#a1abad', fontSize: 10 },
  content: { paddingHorizontal: 14, paddingTop: 14, paddingBottom: 30 }, contentNarrow: { paddingHorizontal: 9 }, summaryPanel: { minHeight: 96, marginBottom: 12, paddingVertical: 11, borderWidth: 1, borderColor: '#28353a', borderRadius: 8, backgroundColor: '#091216', flexDirection: 'row' }, summaryItem: { flex: 1, minWidth: 0, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 }, summaryDivider: { width: 1, backgroundColor: '#26343a' }, summaryValue: { marginTop: 5, color: '#eef1f2', fontSize: 13, fontWeight: '800', textAlign: 'center' }, summaryLabel: { marginTop: 3, color: '#7e898d', fontSize: 7, textAlign: 'center' }, searchBox: { height: 48, marginBottom: 10, paddingHorizontal: 12, borderWidth: 1, borderColor: '#2c3a40', borderRadius: 8, backgroundColor: '#081115', flexDirection: 'row', alignItems: 'center', gap: 9 }, searchInput: { flex: 1, height: '100%', color: '#e1e5e6', fontSize: 10 }, filters: { paddingBottom: 16, gap: 7 }, filterButton: { height: 36, paddingHorizontal: 11, borderWidth: 1, borderColor: '#2b393e', borderRadius: 7, backgroundColor: '#081115', flexDirection: 'row', alignItems: 'center', gap: 5 }, filterButtonActive: { borderColor: ORANGE, backgroundColor: 'rgba(255,122,0,0.06)' }, filterText: { color: '#879296', fontSize: 8, fontWeight: '600' }, filterTextActive: { color: ORANGE }, sectionHeading: { marginBottom: 9, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }, sectionTitle: { color: '#e7eaeb', fontSize: 14, fontWeight: '700' }, sectionSubtitle: { marginTop: 3, color: '#717d81', fontSize: 8 }, itemCount: { color: ORANGE, fontSize: 8, fontWeight: '700' }, notesList: { gap: 8, marginBottom: 14 }, noteCard: { minHeight: 142, padding: 11, borderWidth: 1, borderColor: '#28353a', borderRadius: 8, backgroundColor: '#091216' }, noteCardImportant: { borderColor: '#69430f', backgroundColor: 'rgba(255,122,0,0.035)' }, noteTopRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }, categoryRow: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 8 }, categoryIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,122,0,0.07)', alignItems: 'center', justifyContent: 'center' }, noteHeadingCopy: { flex: 1, minWidth: 0 }, noteTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 5 }, noteTitle: { flexShrink: 1, color: '#e6e9ea', fontSize: 11, fontWeight: '800' }, noteMeta: { marginTop: 4, color: '#7f8b8f', fontSize: 7 }, noteContent: { marginTop: 10, color: '#aab3b5', fontSize: 9, lineHeight: 14 }, noteFooter: { marginTop: 'auto', paddingTop: 10, borderTopWidth: 1, borderTopColor: '#233138', flexDirection: 'row', alignItems: 'center' }, authorAvatar: { width: 23, height: 23, borderRadius: 12, backgroundColor: 'rgba(255,122,0,0.1)', alignItems: 'center', justifyContent: 'center' }, authorInitial: { color: ORANGE, fontSize: 8, fontWeight: '800' }, noteAuthor: { flex: 1, marginLeft: 6, color: '#788589', fontSize: 7 }, openLabel: { color: ORANGE, fontSize: 7, fontWeight: '700' }, emptyState: { minHeight: 160, marginBottom: 14, borderWidth: 1, borderColor: '#28353a', borderRadius: 8, alignItems: 'center', justifyContent: 'center' }, emptyTitle: { marginTop: 8, color: '#bdc5c7', fontSize: 11, fontWeight: '700' }, emptyText: { marginTop: 4, color: '#687579', fontSize: 8 }, addButton: { height: 50, borderRadius: 8, backgroundColor: '#f66f00', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }, addButtonText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  modalBackdrop: { flex: 1, padding: 18, backgroundColor: 'rgba(0,0,0,0.76)', alignItems: 'center', justifyContent: 'center' }, modalCard: { width: '100%', maxWidth: 520, maxHeight: '88%', padding: 14, borderWidth: 1, borderColor: '#334147', borderRadius: 8, backgroundColor: '#081115' }, modalCardCompact: { maxHeight: '92%' }, modalHandle: { alignSelf: 'center', width: 36, height: 4, marginBottom: 11, borderRadius: 2, backgroundColor: '#3d484c' }, modalHeader: { marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, modalTitle: { color: '#edf0f1', fontSize: 16, fontWeight: '800' }, modalSubtitle: { marginTop: 3, color: '#7f8b8f', fontSize: 8 }, modalClose: { width: 36, height: 36, borderWidth: 1, borderColor: '#2f3c41', borderRadius: 18, alignItems: 'center', justifyContent: 'center' }, formScroll: { maxHeight: 530 }, inputGroup: { marginBottom: 12 }, inputLabel: { marginBottom: 6, color: '#aeb7ba', fontSize: 8, fontWeight: '700' }, input: { width: '100%', height: 46, paddingHorizontal: 12, borderWidth: 1, borderColor: '#334147', borderRadius: 7, backgroundColor: '#0a1519', color: '#edf0f1', fontSize: 10 }, notesInput: { height: 110, paddingTop: 11, textAlignVertical: 'top' }, categoryOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 }, categoryOption: { minHeight: 36, paddingHorizontal: 10, borderWidth: 1, borderColor: '#334147', borderRadius: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 }, categoryOptionActive: { borderColor: ORANGE, backgroundColor: 'rgba(255,122,0,0.07)' }, categoryOptionText: { color: '#7d898d', fontSize: 8 }, categoryOptionTextActive: { color: ORANGE, fontWeight: '700' }, importantRow: { minHeight: 62, marginBottom: 10, paddingHorizontal: 10, borderWidth: 1, borderColor: '#334147', borderRadius: 7, flexDirection: 'row', alignItems: 'center', gap: 9 }, importantIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,122,0,0.07)', alignItems: 'center', justifyContent: 'center' }, importantCopy: { flex: 1, minWidth: 0 }, importantTitle: { color: '#dce1e2', fontSize: 9, fontWeight: '700' }, importantSubtitle: { marginTop: 3, color: '#718085', fontSize: 7 }, formActions: { marginTop: 6, flexDirection: 'row', gap: 8 }, cancelButton: { flex: 0.8, height: 46, borderWidth: 1, borderColor: '#334147', borderRadius: 7, alignItems: 'center', justifyContent: 'center' }, cancelText: { color: '#b9c1c3', fontSize: 10, fontWeight: '700' }, deleteButton: { flex: 0.8, height: 46, borderWidth: 1, borderColor: '#61302d', borderRadius: 7, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 }, deleteText: { color: '#ff6a62', fontSize: 9, fontWeight: '700' }, saveButton: { flex: 1.3, height: 46, borderRadius: 7, backgroundColor: '#f66f00', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }, saveText: { color: '#fff', fontSize: 10, fontWeight: '800' }, pressed: { opacity: 0.72 }, cardPressed: { opacity: 0.76, transform: [{ scale: 0.995 }] }, missingScreen: { flex: 1, backgroundColor: '#020709', alignItems: 'center', justifyContent: 'center' }, missingTitle: { color: '#d8ddde', fontSize: 17, fontWeight: '700' }, primaryButton: { height: 44, marginTop: 18, paddingHorizontal: 18, borderRadius: 8, backgroundColor: '#f66f00', alignItems: 'center', justifyContent: 'center' }, primaryButtonText: { color: '#fff', fontSize: 11, fontWeight: '700' },
});

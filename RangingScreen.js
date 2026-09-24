import { useMemo, useState } from 'react';
import { Alert, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { daysSince } from './GrowingScreen';

const HERO_IMAGE = require('./assets/ranging-card.png');
const ORANGE = '#ff7900';
export const SELECTION_AGE_DAYS = 180;

function dateAfterDays(startDate, days) {
  const dueDate = new Date(startDate);
  if (Number.isNaN(dueDate.getTime())) return null;
  dueDate.setDate(dueDate.getDate() + days);
  return dueDate;
}

export const RANGING_BATCHES = [
  { id: 'RG-024', birds: 38, startingBirds: 40, hatchDate: '2026-05-01T12:00:00', rangingStartDate: '2026-09-01T12:00:00', location: 'Range Area 2', status: 'Ranging', nextAction: '', growingBatch: 'GR-024', sources: [{ name: 'Main Breeders', cross: 'Sweater x Kelso', birds: 17, marking: 'Red' }, { name: 'Group B', cross: 'Kelso', birds: 12, marking: 'Blue' }, { name: 'Group C', cross: 'Roundhead x Hatch', birds: 9, marking: '' }] },
  { id: 'RG-018', birds: 31, startingBirds: 32, hatchDate: '2026-03-18T12:00:00', rangingStartDate: '2026-07-18T12:00:00', location: 'North Range', status: 'Ready for Cordate', nextAction: 'Move to Cordate', growingBatch: 'GR-018', sources: [{ name: 'Main Breeders', cross: 'Sweater x Kelso', birds: 18, marking: 'Red' }, { name: 'Group C', cross: 'Roundhead x Hatch', birds: 13, marking: 'Yellow' }] },
];

export function birdAgeDays(batch) { return daysSince(batch.hatchDate); }
export function monthAge(days) { const months = Math.round((days / 30) * 10) / 10; return `Month ${Number.isInteger(months) ? months : months.toFixed(1)}`; }

function selectionCount(allocations, matcher) {
  return Object.entries(allocations || {}).reduce((sum, [name, count]) => matcher.test(name) ? sum + count : sum, 0);
}

export function buildRangingLocations(batches, lossesByBatch = {}, locationsByBatch = {}, selectionsByLocation = {}, readyDay = SELECTION_AGE_DAYS) {
  const grouped = new Map();
  batches.filter((batch) => batch.status !== 'Completed').forEach((batch) => {
    const location = locationsByBatch[batch.id] || batch.location || 'Unassigned Range';
    const losses = (lossesByBatch[batch.id] || []).reduce((sum, item) => sum + item.count, 0);
    const birds = Math.max(0, batch.birds - losses);
    const current = grouped.get(location) || { id: location, location, birds: 0, startingBirds: 0, batches: [], sources: [], ages: [], hatchDate: batch.hatchDate, rangingStartDate: batch.rangingStartDate };
    current.birds += birds;
    current.startingBirds += batch.startingBirds || batch.birds;
    current.batches.push(batch);
    current.sources.push(...(batch.sources || []).map((source) => ({ ...source, sourceBatch: batch.id })));
    current.ages.push(birdAgeDays(batch));
    if (new Date(batch.hatchDate) < new Date(current.hatchDate)) current.hatchDate = batch.hatchDate;
    grouped.set(location, current);
  });
  return [...grouped.values()].map((group) => {
    const selection = selectionsByLocation[group.location];
    const moved = selection?.moved ?? selectionCount(selection?.allocations, /proceed|ready/i);
    const removed = selection?.removed ?? selectionCount(selection?.allocations, /remove/i);
    const locationLosses = (lossesByBatch[group.location] || []).reduce((sum, item) => sum + item.count, 0);
    const birds = Math.max(0, group.birds - moved - removed - locationLosses);
    const minAge = Math.min(...group.ages);
    const maxAge = Math.max(...group.ages);
    const ready = maxAge >= readyDay;
    return { ...group, birds, status: ready ? 'Ready for Cordate' : 'Active', ageRange: minAge === maxAge ? monthAge(minAge) : `${monthAge(minAge)} - ${monthAge(maxAge)}`, lastSelectionDate: selection?.date || '', selection };
  }).filter((group) => group.birds > 0);
}

function LocationCard({ group, readyDay, taskSchedule, taskCompletions, onMarkTaskDone, onMoveToCording, onPress }) {
  const ageDays = Math.max(...group.ages);
  const ready = ageDays >= readyDay;
  const nextTask = taskSchedule.filter((task) => task.enabled !== false && !taskCompletions[task.id]).sort((a, b) => a.day - b.day)[0];
  const dueDate = dateAfterDays(group.hatchDate, nextTask?.day || ageDays);
  const dueMonth = dueDate ? dueDate.toLocaleString('en-US', { month: 'short' }).toUpperCase() : 'DAY';
  const dueDateNumber = dueDate ? dueDate.getDate() : nextTask?.day || ageDays;
  const daysRemaining = nextTask ? nextTask.day - ageDays : 0;
  const timing = daysRemaining === 0 ? 'Due today' : daysRemaining < 0 ? `${Math.abs(daysRemaining)} day${Math.abs(daysRemaining) === 1 ? '' : 's'} overdue` : `${daysRemaining} day${daysRemaining === 1 ? '' : 's'} remaining`;
  const familySources = group.sources.map((source) => {
    const parents = source.cross.split(/\s+x\s+/i);
    return { ...source, sire: parents[0], dam: parents[1] || source.cross };
  });
  const sire = familySources[0]?.sire || 'Not recorded';
  return (
    <View style={styles.batch}>
      <Pressable accessibilityLabel={`Open ranging location ${group.location}`} onPress={onPress} style={({ pressed }) => [styles.batchTop, pressed && styles.pressed]}>
        <View style={styles.identity}><View style={styles.batchIcon}><MaterialCommunityIcons name="bird" size={22} color={ORANGE} /></View><View><Text style={styles.batchId}>{group.location}</Text><Text style={styles.location}>{group.batches[0]?.id || 'Range batch'}</Text></View></View>
        <View style={styles.birdCount}><Text style={styles.birds}>{group.birds}</Text><Text style={styles.muted}>birds</Text></View>
      </Pressable>
      <View style={styles.familyTree}>
        <View style={[styles.familyNode, styles.sireNode]}><View style={styles.familyLabelRow}><MaterialCommunityIcons name="gender-male" size={14} color={ORANGE} /><Text style={styles.familyLabel}>SIRE</Text></View><Text style={styles.familyValue}>{sire}</Text></View>
        <View style={styles.treeConnector}><View style={styles.treeStem} /><View style={styles.treeTrunk} /></View>
        <View style={styles.damList}>{familySources.map((source, index) => <View key={`${group.location}-${source.name}-${index}`} style={styles.damBranch}><View style={styles.branchLine} /><View style={styles.familyNode}><View style={styles.familyLabelRow}><MaterialCommunityIcons name="gender-female" size={14} color={ORANGE} /><Text style={styles.familyLabel}>DAM {index + 1}</Text></View><Text style={styles.familyValue}>{source.dam}</Text></View></View>)}</View>
      </View>
      <View style={styles.nextTask}><View style={styles.taskDate}><Text style={styles.taskMonth}>{dueMonth}</Text><Text style={styles.taskDay}>{dueDateNumber}</Text></View><View style={styles.taskCopy}><Text style={styles.taskTitle}>{nextTask?.name || (ready ? 'Move to Cordate' : 'Daily Range Check')}</Text><View style={styles.taskTiming}><MaterialCommunityIcons name="clock-outline" size={12} color={ORANGE} /><Text style={styles.taskDetail}>{nextTask ? timing : 'Due today'}</Text></View></View><Pressable onPress={() => nextTask?.id === 'range-selection-6' ? onMoveToCording(group, nextTask.id) : onMarkTaskDone(nextTask?.id || `daily-${group.location}`)} style={styles.taskButton}><MaterialCommunityIcons name={nextTask?.id === 'range-selection-6' ? 'clipboard-edit-outline' : 'check'} size={14} color="#fff" /><Text style={styles.taskButtonText}>{nextTask?.id === 'range-selection-6' ? 'Record' : 'Mark Done'}</Text></Pressable></View>
    </View>
  );
}

export default function RangingScreen({ farm, batches = RANGING_BATCHES, lossesByBatch = {}, locationsByBatch = {}, selectionsByLocation = {}, taskSchedule = [], taskCompletionsByBatch = {}, readyDay = SELECTION_AGE_DAYS, nextCordingBirdNumber = 101, hasCordateTransfers = false, defaultCordateDestination = 'Cordate Area 1', onBack, onOpenSettings, onOpenBatch, onMarkTaskDone, onMoveToCording }) {
  const { width } = useWindowDimensions();
  const compact = width < 480;
  const [query, setQuery] = useState('');
  const [cordingEntry, setCordingEntry] = useState(null);
  const [bloodline, setBloodline] = useState('');
  const [bloodlineDropdownOpen, setBloodlineDropdownOpen] = useState(false);
  const [destination, setDestination] = useState(defaultCordateDestination);
  const [cordateNotes, setCordateNotes] = useState('');
  const [tpNumber, setTpNumber] = useState('');
  const farmBuzzId = `FB-${String(nextCordingBirdNumber).padStart(6, '0')}`;
  const damBloodlines = [...new Set((cordingEntry?.group.sources || []).map((source) => source.cross.split(/\s+x\s+/i)[1] || source.cross).filter(Boolean))];
  const openCordingEntry = (group, taskId) => { setBloodline(''); setBloodlineDropdownOpen(false); setDestination(defaultCordateDestination); setCordateNotes(''); setTpNumber(''); setCordingEntry({ group, taskId }); };
  const saveCordingEntry = () => {
    if (!bloodline || !tpNumber.trim()) return Alert.alert('Complete the record', 'Select the dam bloodline and enter the TP number.');
    if (!hasCordateTransfers && !destination.trim()) return Alert.alert('Complete the record', 'Enter where to put this first Cordate bird.');
    onMoveToCording({ location: cordingEntry.group.location, taskId: cordingEntry.taskId, farmBuzzId, bloodline, tpNumber: tpNumber.trim(), destination: hasCordateTransfers ? defaultCordateDestination : destination.trim(), notes: cordateNotes.trim() });
    setBloodlineDropdownOpen(false);
    setCordingEntry(null);
  };
  const locations = useMemo(() => buildRangingLocations(batches, lossesByBatch, locationsByBatch, selectionsByLocation, readyDay), [batches, lossesByBatch, locationsByBatch, selectionsByLocation, readyDay]);
  const shown = useMemo(() => { const search = query.trim().toLowerCase(); return search ? locations.filter((group) => group.location.toLowerCase().includes(search)) : locations; }, [locations, query]);
  return <View style={styles.screen}><StatusBar style="light" translucent backgroundColor="transparent" /><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.pageWrap}><View style={styles.page}><View style={[styles.hero, compact && styles.heroCompact]}><Image source={HERO_IMAGE} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="center" /><LinearGradient colors={['rgba(2,7,9,.12)', 'rgba(2,7,9,.25)', '#03090c']} locations={[0,.52,1]} style={StyleSheet.absoluteFill} /><SafeAreaView edges={['top']} style={styles.heroSafe}><View style={styles.header}><View style={styles.headerGroup}><Pressable accessibilityLabel="Back to farm" onPress={onBack} style={styles.back}><Ionicons name="arrow-back" size={21} color="#fff" /></Pressable><Text style={styles.headerTitle}>Range</Text></View><Pressable accessibilityLabel="Range settings" onPress={onOpenSettings} style={styles.back}><Ionicons name="settings-outline" size={21} color="#fff" /></Pressable></View><View style={styles.heroCopy}><Text style={styles.farmName}>{farm?.name || 'FB Farm'}</Text><Text style={styles.tagline}>Manage birds in range from entry through cordate.</Text><View style={styles.meta}><Ionicons name="location-outline" size={14} color="#dce2e4" /><Text style={styles.metaText}>{farm?.location || 'Pampanga, Philippines'}</Text><View style={styles.metaDivider} /><Ionicons name="calendar-outline" size={14} color="#dce2e4" /><Text style={styles.metaText}>Est. {farm?.established || '2020'}</Text></View></View></SafeAreaView></View><View style={[styles.content, compact && styles.contentCompact]}><View style={styles.search}><Ionicons name="search" size={22} color="#9aa4a8" /><TextInput value={query} onChangeText={setQuery} placeholder="Search birds or batches" placeholderTextColor="#879195" style={styles.searchInput} />{!!query && <Pressable onPress={() => setQuery('')}><Ionicons name="close-circle" size={18} color="#6c777b" /></Pressable>}</View><View style={styles.listHeading}><View><Text style={styles.overline}>ACTIVE BATCHES</Text><Text style={styles.listTitle}>Range batches</Text></View><Text style={styles.count}>{shown.length} active</Text></View><View style={styles.list}>{shown.map((group) => <LocationCard key={group.location} group={group} readyDay={readyDay} taskSchedule={taskSchedule} taskCompletions={taskCompletionsByBatch[group.location] || {}} onMarkTaskDone={(taskId) => onMarkTaskDone(group.location, taskId)} onMoveToCording={openCordingEntry} onPress={() => onOpenBatch(group.location)} />)}{!shown.length && <Text style={styles.empty}>No range batches found</Text>}</View></View></View></ScrollView><Modal visible={!!cordingEntry} transparent animationType="fade" onRequestClose={() => { setBloodlineDropdownOpen(false); setCordingEntry(null); }}><View style={styles.modalBackdrop}><Pressable style={StyleSheet.absoluteFill} onPress={() => { setBloodlineDropdownOpen(false); setCordingEntry(null); }} /><View style={styles.modalCard}><View style={styles.modalHeader}><View><Text style={styles.modalEyebrow}>CORDATE ENTRY</Text><Text style={styles.modalTitle}>Move to Cordate</Text></View><Pressable onPress={() => { setBloodlineDropdownOpen(false); setCordingEntry(null); }} style={styles.modalClose}><Ionicons name="close" size={20} color="#fff" /></Pressable></View><Text style={styles.fieldLabel}>FarmBuzz ID</Text><View style={styles.readOnlyField}><MaterialCommunityIcons name="identifier" size={18} color={ORANGE} /><Text style={styles.generatedId}>{farmBuzzId}</Text><Text style={styles.generatedLabel}>AUTO-GENERATED</Text></View>{!hasCordateTransfers && <><Text style={styles.fieldLabel}>Where to put?</Text><View style={styles.inputField}><MaterialCommunityIcons name="home-account" size={18} color={ORANGE} /><TextInput value={destination} onChangeText={setDestination} placeholder="Cordate Area 1" placeholderTextColor="#68777c" selectionColor={ORANGE} style={styles.modalInput} /></View><Text style={styles.fieldLabel}>Notes</Text><View style={[styles.inputField, styles.noteField]}><TextInput value={cordateNotes} onChangeText={setCordateNotes} placeholder="Add transfer notes" placeholderTextColor="#68777c" selectionColor={ORANGE} multiline style={[styles.modalInput, styles.noteInput]} /></View></>}<Text style={styles.fieldLabel}>Select Dam Bloodline</Text><View style={styles.dropdownWrap}><Pressable onPress={() => setBloodlineDropdownOpen((open) => !open)} style={[styles.dropdownField, bloodlineDropdownOpen && styles.dropdownFieldOpen]}><MaterialCommunityIcons name="dna" size={18} color={ORANGE} /><Text style={[styles.dropdownText, !bloodline && styles.dropdownPlaceholder]}>{bloodline || 'Choose dam bloodline'}</Text><Ionicons name={bloodlineDropdownOpen ? 'chevron-up' : 'chevron-down'} size={18} color="#dfe6e8" /></Pressable>{bloodlineDropdownOpen && <View style={styles.dropdownMenu}>{damBloodlines.map((option, index) => <Pressable key={`${option}-${index}`} onPress={() => { setBloodline(option); setBloodlineDropdownOpen(false); }} style={[styles.dropdownOption, bloodline === option && styles.dropdownOptionSelected]}><View style={styles.bloodlineCopy}><Text style={styles.bloodlineLabel}>DAM {index + 1}</Text><Text style={styles.bloodlineValue}>{option}</Text></View>{bloodline === option && <Ionicons name="checkmark" size={17} color={ORANGE} />}</Pressable>)}</View>}</View><Text style={styles.fieldLabel}>TP Number</Text><View style={styles.inputField}><MaterialCommunityIcons name="tag-outline" size={18} color={ORANGE} /><TextInput value={tpNumber} onChangeText={setTpNumber} placeholder="Enter TP number" placeholderTextColor="#68777c" selectionColor={ORANGE} autoCapitalize="characters" style={styles.modalInput} /></View><View style={styles.modalActions}><Pressable onPress={() => { setBloodlineDropdownOpen(false); setCordingEntry(null); }} style={styles.cancelButton}><Text style={styles.cancelText}>Cancel</Text></Pressable><Pressable onPress={saveCordingEntry} style={styles.saveButton}><Text style={styles.saveText}>Move to Cordate</Text></Pressable></View></View></View></Modal></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#020709' }, pageWrap: { flexGrow: 1, alignItems: 'center', backgroundColor: '#020709' }, page: { width: '100%', maxWidth: 720 },
  hero: { height: 252, overflow: 'hidden' }, heroCompact: { height: 230 }, heroSafe: { flex: 1 }, header: { paddingHorizontal: 16, paddingTop: Platform.OS === 'web' ? 10 : 3, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, headerGroup: { flexDirection: 'row', alignItems: 'center', gap: 10 }, back: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(190,204,208,.35)', backgroundColor: 'rgba(2,8,11,.65)', alignItems: 'center', justifyContent: 'center' }, headerTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },
  heroCopy: { marginTop: 'auto', paddingHorizontal: 20, paddingBottom: 22 }, farmName: { color: '#fff', fontSize: 34, lineHeight: 40, fontWeight: '800', fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', web: 'Georgia' }) }, tagline: { marginTop: 3, color: '#c2cbce', fontSize: 13 }, meta: { marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 6 }, metaText: { color: '#d3dade', fontSize: 10 }, metaDivider: { width: 1, height: 12, marginHorizontal: 5, backgroundColor: 'rgba(210,220,224,.35)' },
  content: { paddingHorizontal: 10, paddingBottom: 30 }, contentCompact: { paddingHorizontal: 8 }, search: { height: 54, borderRadius: 7, borderWidth: 1, borderColor: '#26373e', backgroundColor: '#081216', paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 8 }, searchInput: { flex: 1, height: 52, padding: 0, color: '#e7ebec', fontSize: 12, outlineStyle: 'none' },
  overline: { color: '#899397', fontSize: 10, fontWeight: '600' }, listHeading: { marginTop: 20, marginBottom: 9, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }, listTitle: { marginTop: 4, color: '#edf1f2', fontSize: 17, fontWeight: '800' }, count: { color: '#8e9a9e', fontSize: 10, fontWeight: '700' }, list: { gap: 9 },
  batch: { borderRadius: 7, borderWidth: 1, borderColor: '#223138', backgroundColor: '#091317', padding: 13 }, batchTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }, identity: { minWidth: 0, flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 }, batchIcon: { width: 40, height: 40, borderRadius: 7, backgroundColor: 'rgba(255,122,0,.1)', alignItems: 'center', justifyContent: 'center' }, batchId: { color: '#eef2f3', fontSize: 13, fontWeight: '800' }, location: { marginTop: 3, color: '#758287', fontSize: 9 }, birdCount: { alignItems: 'flex-end' }, birds: { color: '#fff', fontSize: 18, lineHeight: 20, fontWeight: '800' }, muted: { marginTop: 2, color: '#78868b', fontSize: 8 },
  familyTree: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#1b2a30', flexDirection: 'row', alignItems: 'center', minHeight: 178 }, familyNode: { flex: 1, minWidth: 0, minHeight: 48, borderRadius: 7, borderWidth: 1, borderColor: '#293a40', backgroundColor: '#0d191e', paddingHorizontal: 10, paddingVertical: 8, justifyContent: 'center' }, sireNode: { maxWidth: '36%', borderColor: 'rgba(255,122,0,.45)' }, familyLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 5 }, familyLabel: { color: '#77858a', fontSize: 8, fontWeight: '800' }, familyValue: { marginTop: 5, color: '#e5eaeb', fontSize: 12, fontWeight: '700' }, treeConnector: { width: 30, height: 158, position: 'relative' }, treeStem: { position: 'absolute', left: 0, right: 0, top: '50%', height: 1, backgroundColor: '#526168' }, treeTrunk: { position: 'absolute', right: 0, top: 24, bottom: 24, width: 1, backgroundColor: '#526168' }, damList: { flex: 1, gap: 7 }, damBranch: { flexDirection: 'row', alignItems: 'center' }, branchLine: { width: 12, height: 1, backgroundColor: '#526168' },
  nextTask: { minHeight: 88, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#293a40', flexDirection: 'row', alignItems: 'center', gap: 10 }, taskDate: { width: 44, height: 50, borderRadius: 6, borderWidth: 1, borderColor: '#8f500d', backgroundColor: 'rgba(255,121,0,.08)', alignItems: 'center', justifyContent: 'center' }, taskMonth: { color: ORANGE, fontSize: 7, lineHeight: 9, fontWeight: '800' }, taskDay: { marginTop: 2, color: '#fff', fontSize: 17, lineHeight: 18, fontWeight: '800' }, taskCopy: { flex: 1, minWidth: 0 }, taskTitle: { color: '#eef2f3', fontSize: 12, fontWeight: '800' }, taskTiming: { marginTop: 6, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 4 }, taskDetail: { flexShrink: 1, color: ORANGE, fontSize: 9, fontWeight: '700' }, taskButton: { minWidth: 94, height: 38, borderRadius: 6, backgroundColor: ORANGE, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 }, taskButtonText: { color: '#fff', fontSize: 9, fontWeight: '800' }, empty: { padding: 30, color: '#748187', textAlign: 'center' }, pressed: { opacity: .76, transform: [{ scale: .995 }] },
  modalBackdrop: { flex: 1, padding: 16, backgroundColor: 'rgba(0,4,6,.84)', alignItems: 'center', justifyContent: 'center' }, modalCard: { width: '100%', maxWidth: 430, borderRadius: 8, borderWidth: 1, borderColor: '#2c3d44', backgroundColor: '#071216', padding: 16 }, modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }, modalEyebrow: { color: ORANGE, fontSize: 8, fontWeight: '800' }, modalTitle: { marginTop: 4, color: '#fff', fontSize: 21, fontWeight: '800' }, modalClose: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: '#44535a', alignItems: 'center', justifyContent: 'center' }, fieldLabel: { marginTop: 15, marginBottom: 6, color: '#edf1f2', fontSize: 10, fontWeight: '700' }, readOnlyField: { height: 48, borderRadius: 7, borderWidth: 1, borderColor: '#304249', backgroundColor: '#0d1a1f', paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 9 }, generatedId: { flex: 1, color: '#fff', fontSize: 13, fontWeight: '800' }, generatedLabel: { color: '#758489', fontSize: 7, fontWeight: '700' }, dropdownWrap: { position: 'relative', zIndex: 2 }, dropdownField: { height: 48, borderRadius: 7, borderWidth: 1, borderColor: '#304249', backgroundColor: '#081519', paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 9 }, dropdownFieldOpen: { borderColor: '#9a560d' }, dropdownText: { flex: 1, color: '#fff', fontSize: 12, fontWeight: '700' }, dropdownPlaceholder: { color: '#68777c', fontWeight: '600' }, dropdownMenu: { marginTop: 6, overflow: 'hidden', borderRadius: 7, borderWidth: 1, borderColor: '#304249', backgroundColor: '#081519' }, dropdownOption: { minHeight: 48, paddingHorizontal: 12, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: '#17262b', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }, dropdownOptionSelected: { backgroundColor: 'rgba(255,121,0,.08)' }, bloodlineCopy: { flex: 1, minWidth: 0 }, bloodlineLabel: { color: ORANGE, fontSize: 7, fontWeight: '800' }, bloodlineValue: { marginTop: 4, color: '#fff', fontSize: 12, fontWeight: '700' }, inputField: { height: 48, borderRadius: 7, borderWidth: 1, borderColor: '#304249', backgroundColor: '#081519', paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 9 }, noteField: { height: 74, alignItems: 'flex-start', paddingTop: 10 }, modalInput: { flex: 1, height: 46, padding: 0, color: '#fff', fontSize: 12, outlineStyle: 'none' }, noteInput: { height: 58, textAlignVertical: 'top' }, modalActions: { marginTop: 18, flexDirection: 'row', gap: 8 }, cancelButton: { flex: 1, height: 44, borderRadius: 7, borderWidth: 1, borderColor: '#304249', alignItems: 'center', justifyContent: 'center' }, cancelText: { color: '#e4e9ea', fontSize: 10, fontWeight: '700' }, saveButton: { flex: 1.4, height: 44, borderRadius: 7, backgroundColor: ORANGE, alignItems: 'center', justifyContent: 'center' }, saveText: { color: '#fff', fontSize: 10, fontWeight: '800' },
});

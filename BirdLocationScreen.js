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
const PEN_TYPES = ['Individual pen', 'Breeding pen', 'Layer pen', 'Observation pen'];
const EMPTY_PEN = { name: '', area: '', type: 'Individual pen', capacity: '12', caretaker: '' };

export const DEFAULT_FARM_LOCATIONS = [
  { id: 'pen-1', name: 'Pen 1', area: 'Breeding House', type: 'Breeding pen', birds: 12, capacity: 16, caretaker: 'Miguel Dela Cruz' },
  { id: 'pen-2', name: 'Pen 2', area: 'Hen House', type: 'Layer pen', birds: 18, capacity: 24, caretaker: 'Ana Reyes' },
  { id: 'pen-3', name: 'Pen 3', area: 'North Flock House', type: 'Individual pen', birds: 14, capacity: 20, caretaker: 'Miguel Dela Cruz' },
  { id: 'pen-4', name: 'Pen 4', area: 'Care Area', type: 'Observation pen', birds: 2, capacity: 8, caretaker: 'Carlo Santos' },
  { id: 'brooder', name: 'Brooder 1', area: 'Brooder House', type: 'Young bird area', birds: 21, capacity: 30, caretaker: 'Ana Reyes' },
];

const INITIAL_HISTORY = [
  { id: 'move-1', location: 'Pen 3', area: 'North Flock House', date: 'Aug 20, 2026', reason: 'Returned after health observation', by: 'Miguel Dela Cruz' },
  { id: 'move-2', location: 'Pen 4', area: 'Care Area', date: 'Aug 14, 2026', reason: 'Routine health observation', by: 'Carlo Santos' },
  { id: 'move-3', location: 'Pen 1', area: 'Breeding House', date: 'Jul 28, 2026', reason: 'Breeding assignment completed', by: 'Miguel Dela Cruz' },
];

function getFarmBuzzId(bird) {
  if (bird.farmBuzzId) return bird.farmBuzzId;
  const ring = bird.details?.find((detail) => detail.icon === 'tag-outline')?.text || bird.name;
  const digits = ring.replace(/\D/g, '').slice(-5) || '001';
  return `FBZ-${new Date().getFullYear()}-${digits.padStart(3, '0')}`;
}

function HeaderButton({ icon, label, onPress }) {
  return (
    <Pressable accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}>
      <Ionicons name={icon} size={21} color="#eef1f2" />
    </Pressable>
  );
}

function LocationFact({ icon, label, value }) {
  return (
    <View style={styles.locationFact}>
      <MaterialCommunityIcons name={icon} size={19} color={ORANGE} />
      <View style={styles.locationFactCopy}>
        <Text style={styles.locationFactLabel}>{label}</Text>
        <Text numberOfLines={2} style={styles.locationFactValue}>{value}</Text>
      </View>
    </View>
  );
}

function FarmArea({ location, selected, compact, onPress }) {
  const available = location.capacity - location.birds;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${location.name}, ${location.area}`}
      onPress={onPress}
      style={({ pressed }) => [styles.areaCard, compact && styles.areaCardCompact, selected && styles.areaCardSelected, pressed && styles.cardPressed]}
    >
      <View style={[styles.areaIcon, selected && styles.areaIconSelected]}>
        <MaterialCommunityIcons name={location.id === 'brooder' ? 'home-variant-outline' : 'fence'} size={21} color={selected ? '#fff' : ORANGE} />
      </View>
      <View style={styles.areaCopy}>
        <View style={styles.areaTitleRow}>
          <Text style={styles.areaName}>{location.name}</Text>
          {selected && <View style={styles.currentBadge}><Text style={styles.currentBadgeText}>CURRENT</Text></View>}
        </View>
        <Text style={styles.areaLocation}>{location.area}</Text>
        <Text style={styles.areaCapacity}>{available} spaces available</Text>
      </View>
    </Pressable>
  );
}

function HistoryItem({ item, isLast }) {
  return (
    <View style={styles.historyItem}>
      <View style={styles.timelineColumn}>
        <View style={styles.timelineDot}><MaterialCommunityIcons name="map-marker" size={13} color={ORANGE} /></View>
        {!isLast && <View style={styles.timelineLine} />}
      </View>
      <View style={[styles.historyContent, !isLast && styles.historyDivider]}>
        <View style={styles.historyHeading}>
          <View style={styles.historyTitleCopy}>
            <Text style={styles.historyLocation}>{item.location}</Text>
            <Text style={styles.historyArea}>{item.area}</Text>
          </View>
          <Text style={styles.historyDate}>{item.date}</Text>
        </View>
        <Text style={styles.historyReason}>{item.reason}</Text>
        <Text style={styles.historyBy}>Moved by {item.by}</Text>
      </View>
    </View>
  );
}

export default function BirdLocationScreen({ bird, onBack, locations = DEFAULT_FARM_LOCATIONS, onLocationsChange }) {
  const { width } = useWindowDimensions();
  const compact = width < 520;
  const narrow = width < 380;
  const [currentId, setCurrentId] = useState('pen-3');
  const [history, setHistory] = useState(INITIAL_HISTORY);
  const [moveOpen, setMoveOpen] = useState(false);
  const [addPenOpen, setAddPenOpen] = useState(false);
  const [newPen, setNewPen] = useState(EMPTY_PEN);
  const currentLocation = useMemo(() => locations.find((location) => location.id === currentId) || locations[0], [currentId, locations]);

  if (!bird) {
    return <View style={styles.missingScreen}><Text style={styles.missingTitle}>Bird record unavailable</Text><Pressable onPress={onBack} style={styles.primaryButton}><Text style={styles.primaryButtonText}>Back to Bird Profile</Text></Pressable></View>;
  }

  const moveBird = (location) => {
    if (location.id === currentId) return;
    onLocationsChange?.((items) => items.map((item) => {
      if (item.id === currentId) return { ...item, birds: Math.max(0, item.birds - 1) };
      if (item.id === location.id) return { ...item, birds: Math.min(item.capacity, item.birds + 1) };
      return item;
    }));
    setCurrentId(location.id);
    setHistory((items) => [{ id: `move-${Date.now()}`, location: location.name, area: location.area, date: 'Sep 1, 2026', reason: 'Location changed from bird profile', by: 'JU Gamefarm Admin' }, ...items]);
    setMoveOpen(false);
    Alert.alert('Location updated', `${bird.name} is now assigned to ${location.name}, ${location.area}.`);
  };

  const createPen = () => {
    const capacity = Number.parseInt(newPen.capacity, 10);
    if (!newPen.name.trim() || !newPen.area.trim()) {
      Alert.alert('Missing information', 'Enter the pen name and farm area.');
      return;
    }
    if (!Number.isFinite(capacity) || capacity < 1) {
      Alert.alert('Invalid capacity', 'Capacity must be at least 1 bird.');
      return;
    }
    const location = {
      id: `pen-${Date.now()}`,
      name: newPen.name.trim(),
      area: newPen.area.trim(),
      type: newPen.type,
      birds: 0,
      capacity,
      caretaker: newPen.caretaker.trim() || 'Not assigned',
    };
    onLocationsChange?.((items) => [...items, location]);
    setNewPen(EMPTY_PEN);
    setAddPenOpen(false);
    Alert.alert('Pen created', `${location.name} is now available for bird assignments.`);
  };

  const openAddPen = () => {
    setMoveOpen(false);
    setAddPenOpen(true);
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.pageWrap}>
        <View style={styles.page}>
          <View style={[styles.hero, compact && styles.heroCompact]}>
            <Image source={bird.image || FLOCK_HERO_IMAGE} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="center" cachePolicy="memory-disk" />
            <LinearGradient colors={['rgba(2,7,9,0.16)', 'rgba(2,7,9,0.28)', 'rgba(2,7,9,0.9)', '#03090c']} locations={[0, 0.4, 0.8, 1]} style={StyleSheet.absoluteFill} />
            <SafeAreaView edges={['top']} style={styles.heroSafeArea}>
              <View style={styles.heroHeader}>
                <View style={styles.heroHeaderLeft}><HeaderButton icon="arrow-back" label="Back to bird profile" onPress={onBack} /><Text style={styles.screenTitle}>Bird Location</Text></View>
                <HeaderButton icon="ellipsis-horizontal" label="Location options" onPress={() => Alert.alert('Location options', 'Location actions will appear here.')} />
              </View>
              <View style={[styles.heroCopy, narrow && styles.heroCopyNarrow]}>
                <View style={styles.locationBadge}><MaterialCommunityIcons name="map-marker" size={15} color={ORANGE} /><Text style={styles.locationBadgeText}>CURRENT LOCATION</Text></View>
                <Text style={styles.birdName}>{bird.name}</Text>
                <Text style={styles.birdId}>{getFarmBuzzId(bird)}</Text>
              </View>
            </SafeAreaView>
          </View>

          <View style={[styles.content, narrow && styles.contentNarrow]}>
            <View style={styles.currentPanel}>
              <View style={styles.currentPanelTop}>
                <View style={styles.currentPin}><MaterialCommunityIcons name="map-marker-radius-outline" size={28} color={ORANGE} /></View>
                <View style={styles.currentCopy}><Text style={styles.currentEyebrow}>ASSIGNED LOCATION</Text><Text style={styles.currentName}>{currentLocation.name}</Text><Text style={styles.currentArea}>{currentLocation.area}</Text></View>
                <View style={styles.activeBadge}><View style={styles.activeDot} /><Text style={styles.activeText}>Active</Text></View>
              </View>
              <View style={[styles.factGrid, compact && styles.factGridCompact]}>
                <LocationFact icon="fence" label="Enclosure" value={currentLocation.type} />
                <LocationFact icon="account-outline" label="Caretaker" value={currentLocation.caretaker} />
                <LocationFact icon="calendar-month-outline" label="Assigned" value="Aug 20, 2026" />
                <LocationFact icon="bird" label="Occupancy" value={`${currentLocation.birds} of ${currentLocation.capacity} birds`} />
              </View>
            </View>

            <View style={styles.sectionHeading}><View><Text style={styles.sectionTitle}>Farm Areas</Text><Text style={styles.sectionSubtitle}>Your pens and bird housing</Text></View><View style={styles.sectionActions}><Text style={styles.sectionCount}>{locations.length} locations</Text><Pressable onPress={() => setAddPenOpen(true)} style={({ pressed }) => [styles.addPenButton, pressed && styles.pressed]}><Ionicons name="add" size={15} color={ORANGE} /><Text style={styles.addPenButtonText}>Add Pen</Text></Pressable></View></View>
            <View style={[styles.areaGrid, compact && styles.areaGridCompact]}>
              {locations.map((location) => <FarmArea key={location.id} location={location} selected={location.id === currentId} compact={compact} onPress={() => location.id === currentId ? Alert.alert('Current location', `${bird.name} is assigned here.`) : setMoveOpen(true)} />)}
            </View>

            <View style={styles.sectionHeading}><View><Text style={styles.sectionTitle}>Movement History</Text><Text style={styles.sectionSubtitle}>Previous location assignments</Text></View></View>
            <View style={styles.historyPanel}>{history.map((item, index) => <HistoryItem key={item.id} item={item} isLast={index === history.length - 1} />)}</View>

            <Pressable onPress={() => setMoveOpen(true)} style={({ pressed }) => [styles.moveButton, pressed && styles.pressed]}><MaterialCommunityIcons name="map-marker-path" size={21} color="#fff" /><Text style={styles.moveButtonText}>Move Bird</Text></Pressable>
          </View>
        </View>
      </ScrollView>

      <Modal visible={moveOpen} transparent animationType="fade" onRequestClose={() => setMoveOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setMoveOpen(false)}>
          <Pressable style={[styles.modalCard, compact && styles.modalCardCompact]} onPress={() => {}}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}><View><Text style={styles.modalTitle}>Move {bird.name}</Text><Text style={styles.modalSubtitle}>Choose a new available location</Text></View><Pressable accessibilityLabel="Close" onPress={() => setMoveOpen(false)} style={styles.modalClose}><Ionicons name="close" size={20} color="#c7cdcf" /></Pressable></View>
            <ScrollView style={styles.modalList} showsVerticalScrollIndicator={false}>
              {locations.map((location) => {
                const selected = location.id === currentId;
                return <Pressable key={location.id} disabled={selected} onPress={() => moveBird(location)} style={({ pressed }) => [styles.locationOption, selected && styles.locationOptionSelected, pressed && styles.cardPressed]}><View style={[styles.optionRadio, selected && styles.optionRadioSelected]}>{selected && <View style={styles.optionRadioDot} />}</View><View style={styles.optionCopy}><Text style={styles.optionName}>{location.name}</Text><Text style={styles.optionArea}>{location.area} - {location.capacity - location.birds} spaces available</Text></View>{selected ? <Text style={styles.optionCurrent}>CURRENT</Text> : <Ionicons name="chevron-forward" size={19} color="#8b9699" />}</Pressable>;
              })}
            </ScrollView>
            <Pressable onPress={openAddPen} style={({ pressed }) => [styles.addLocationOption, pressed && styles.pressed]}><View style={styles.addLocationIcon}><Ionicons name="add" size={20} color={ORANGE} /></View><View style={styles.optionCopy}><Text style={styles.optionName}>Add New Pen</Text><Text style={styles.optionArea}>Create another farm location</Text></View><Ionicons name="chevron-forward" size={19} color="#8b9699" /></Pressable>
            <Pressable onPress={() => setMoveOpen(false)} style={styles.cancelButton}><Text style={styles.cancelButtonText}>Cancel</Text></Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={addPenOpen} transparent animationType="fade" onRequestClose={() => setAddPenOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setAddPenOpen(false)}>
          <Pressable style={[styles.modalCard, compact && styles.modalCardCompact]} onPress={() => {}}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}><View><Text style={styles.modalTitle}>Add New Pen</Text><Text style={styles.modalSubtitle}>Create a location for future bird assignments</Text></View><Pressable accessibilityLabel="Close" onPress={() => setAddPenOpen(false)} style={styles.modalClose}><Ionicons name="close" size={20} color="#c7cdcf" /></Pressable></View>
            <ScrollView style={styles.penForm} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <View style={styles.inputGroup}><Text style={styles.inputLabel}>Pen Name *</Text><TextInput value={newPen.name} onChangeText={(value) => setNewPen((pen) => ({ ...pen, name: value }))} placeholder="Example: Pen 5" placeholderTextColor="#566368" style={styles.input} /></View>
              <View style={styles.inputGroup}><Text style={styles.inputLabel}>Farm Area *</Text><TextInput value={newPen.area} onChangeText={(value) => setNewPen((pen) => ({ ...pen, area: value }))} placeholder="Example: South Flock House" placeholderTextColor="#566368" style={styles.input} /></View>
              <View style={styles.inputGroup}><Text style={styles.inputLabel}>Enclosure Type</Text><View style={styles.typeOptions}>{PEN_TYPES.map((type) => <Pressable key={type} onPress={() => setNewPen((pen) => ({ ...pen, type }))} style={[styles.typeOption, newPen.type === type && styles.typeOptionSelected]}><Text style={[styles.typeOptionText, newPen.type === type && styles.typeOptionTextSelected]}>{type}</Text></Pressable>)}</View></View>
              <View style={[styles.formRow, compact && styles.formRowCompact]}>
                <View style={[styles.inputGroup, styles.formField]}><Text style={styles.inputLabel}>Capacity *</Text><TextInput value={newPen.capacity} onChangeText={(value) => setNewPen((pen) => ({ ...pen, capacity: value.replace(/\D/g, '') }))} keyboardType="number-pad" placeholder="12" placeholderTextColor="#566368" style={styles.input} /></View>
                <View style={[styles.inputGroup, styles.formField]}><Text style={styles.inputLabel}>Caretaker</Text><TextInput value={newPen.caretaker} onChangeText={(value) => setNewPen((pen) => ({ ...pen, caretaker: value }))} placeholder="Optional" placeholderTextColor="#566368" style={styles.input} /></View>
              </View>
            </ScrollView>
            <View style={styles.formActions}><Pressable onPress={() => setAddPenOpen(false)} style={styles.formCancelButton}><Text style={styles.cancelButtonText}>Cancel</Text></Pressable><Pressable onPress={createPen} style={({ pressed }) => [styles.formCreateButton, pressed && styles.pressed]}><Ionicons name="add-circle-outline" size={18} color="#fff" /><Text style={styles.formCreateText}>Create Pen</Text></Pressable></View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#020709' }, pageWrap: { flexGrow: 1, alignItems: 'center', backgroundColor: '#020709' }, page: { width: '100%', maxWidth: 720, backgroundColor: '#020709' }, hero: { height: 330, overflow: 'hidden' }, heroCompact: { height: 300 }, heroSafeArea: { flex: 1 }, heroHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: Platform.OS === 'web' ? 10 : 3 }, heroHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 }, headerButton: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(190,204,208,0.35)', backgroundColor: 'rgba(2,8,11,0.65)', alignItems: 'center', justifyContent: 'center' }, screenTitle: { color: '#f1f3f3', fontSize: 17, fontWeight: '700' }, heroCopy: { marginTop: 'auto', paddingHorizontal: 18, paddingBottom: 28 }, heroCopyNarrow: { paddingHorizontal: 11 }, locationBadge: { alignSelf: 'flex-start', height: 27, paddingHorizontal: 9, borderWidth: 1, borderColor: '#67410f', borderRadius: 14, backgroundColor: 'rgba(255,122,0,0.07)', flexDirection: 'row', alignItems: 'center', gap: 5 }, locationBadgeText: { color: '#dda45e', fontSize: 7, fontWeight: '800' }, birdName: { marginTop: 9, color: '#f1f3f3', fontSize: 29, lineHeight: 35, fontWeight: '800' }, birdId: { marginTop: 4, color: '#a1abad', fontSize: 10 },
  content: { paddingHorizontal: 14, paddingTop: 14, paddingBottom: 30 }, contentNarrow: { paddingHorizontal: 9 }, currentPanel: { marginBottom: 20, borderWidth: 1, borderColor: '#513a1d', borderRadius: 8, backgroundColor: '#091216', overflow: 'hidden' }, currentPanelTop: { minHeight: 92, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10 }, currentPin: { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(255,122,0,0.09)', alignItems: 'center', justifyContent: 'center' }, currentCopy: { flex: 1, minWidth: 0 }, currentEyebrow: { color: ORANGE, fontSize: 7, fontWeight: '800' }, currentName: { marginTop: 4, color: '#edf0f1', fontSize: 17, fontWeight: '800' }, currentArea: { marginTop: 3, color: '#8d989b', fontSize: 9 }, activeBadge: { height: 27, paddingHorizontal: 9, borderWidth: 1, borderColor: '#69410e', borderRadius: 14, flexDirection: 'row', alignItems: 'center', gap: 5 }, activeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: ORANGE }, activeText: { color: '#e09b48', fontSize: 7, fontWeight: '700' }, factGrid: { borderTopWidth: 1, borderTopColor: '#253239', padding: 10, flexDirection: 'row' }, factGridCompact: { flexWrap: 'wrap' }, locationFact: { flex: 1, minWidth: 120, minHeight: 48, paddingHorizontal: 8, flexDirection: 'row', alignItems: 'center', gap: 7 }, locationFactCopy: { flex: 1, minWidth: 0 }, locationFactLabel: { color: '#6f7c80', fontSize: 7 }, locationFactValue: { marginTop: 3, color: '#d7dcdd', fontSize: 8, fontWeight: '600' },
  sectionHeading: { marginBottom: 9, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }, sectionTitle: { color: '#e7eaeb', fontSize: 14, fontWeight: '700' }, sectionSubtitle: { marginTop: 3, color: '#717d81', fontSize: 8 }, sectionActions: { alignItems: 'flex-end', gap: 6 }, sectionCount: { color: ORANGE, fontSize: 8, fontWeight: '700' }, addPenButton: { height: 29, paddingHorizontal: 9, borderWidth: 1, borderColor: '#68410e', borderRadius: 6, flexDirection: 'row', alignItems: 'center', gap: 4 }, addPenButtonText: { color: ORANGE, fontSize: 8, fontWeight: '700' }, areaGrid: { marginBottom: 20, flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, areaGridCompact: { flexDirection: 'column' }, areaCard: { width: '48.8%', minHeight: 74, padding: 10, borderWidth: 1, borderColor: '#27353a', borderRadius: 8, backgroundColor: '#091216', flexDirection: 'row', alignItems: 'center', gap: 9 }, areaCardCompact: { width: '100%' }, areaCardSelected: { borderColor: '#774b14', backgroundColor: 'rgba(255,122,0,0.045)' }, areaIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,122,0,0.07)', alignItems: 'center', justifyContent: 'center' }, areaIconSelected: { backgroundColor: ORANGE }, areaCopy: { flex: 1, minWidth: 0 }, areaTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 }, areaName: { color: '#e1e5e6', fontSize: 10, fontWeight: '700' }, currentBadge: { paddingHorizontal: 5, paddingVertical: 2, borderRadius: 5, backgroundColor: 'rgba(255,122,0,0.12)' }, currentBadgeText: { color: ORANGE, fontSize: 5, fontWeight: '800' }, areaLocation: { marginTop: 3, color: '#879296', fontSize: 8 }, areaCapacity: { marginTop: 3, color: '#667377', fontSize: 7 },
  historyPanel: { marginBottom: 14, paddingHorizontal: 11, borderWidth: 1, borderColor: '#28353a', borderRadius: 8, backgroundColor: '#091216' }, historyItem: { flexDirection: 'row' }, timelineColumn: { width: 28, alignItems: 'center' }, timelineDot: { width: 24, height: 24, marginTop: 13, borderWidth: 1, borderColor: '#714713', borderRadius: 12, backgroundColor: '#11191b', alignItems: 'center', justifyContent: 'center', zIndex: 1 }, timelineLine: { position: 'absolute', top: 37, bottom: -13, width: 1, backgroundColor: '#394247' }, historyContent: { flex: 1, minWidth: 0, paddingVertical: 13, paddingLeft: 6 }, historyDivider: { borderBottomWidth: 1, borderBottomColor: '#253239' }, historyHeading: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }, historyTitleCopy: { flex: 1, minWidth: 0 }, historyLocation: { color: '#e2e6e7', fontSize: 10, fontWeight: '700' }, historyArea: { marginTop: 2, color: '#828e91', fontSize: 8 }, historyDate: { color: ORANGE, fontSize: 7, fontWeight: '600' }, historyReason: { marginTop: 7, color: '#a1aaad', fontSize: 8 }, historyBy: { marginTop: 4, color: '#637074', fontSize: 7 }, moveButton: { height: 50, borderRadius: 8, backgroundColor: '#f66f00', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }, moveButtonText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  modalBackdrop: { flex: 1, padding: 18, backgroundColor: 'rgba(0,0,0,0.76)', alignItems: 'center', justifyContent: 'center' }, modalCard: { width: '100%', maxWidth: 500, maxHeight: '82%', padding: 14, borderWidth: 1, borderColor: '#334147', borderRadius: 8, backgroundColor: '#081115' }, modalCardCompact: { maxHeight: '88%' }, modalHandle: { alignSelf: 'center', width: 36, height: 4, marginBottom: 11, borderRadius: 2, backgroundColor: '#3d484c' }, modalHeader: { marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, modalTitle: { color: '#edf0f1', fontSize: 16, fontWeight: '800' }, modalSubtitle: { marginTop: 3, color: '#7f8b8f', fontSize: 8 }, modalClose: { width: 36, height: 36, borderWidth: 1, borderColor: '#2f3c41', borderRadius: 18, alignItems: 'center', justifyContent: 'center' }, modalList: { maxHeight: 310 }, locationOption: { minHeight: 65, marginBottom: 7, paddingHorizontal: 10, borderWidth: 1, borderColor: '#2b393e', borderRadius: 7, flexDirection: 'row', alignItems: 'center', gap: 9 }, locationOptionSelected: { borderColor: '#69430f', backgroundColor: 'rgba(255,122,0,0.045)' }, optionRadio: { width: 20, height: 20, borderWidth: 1, borderColor: '#667377', borderRadius: 10, alignItems: 'center', justifyContent: 'center' }, optionRadioSelected: { borderColor: ORANGE }, optionRadioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: ORANGE }, optionCopy: { flex: 1, minWidth: 0 }, optionName: { color: '#dde2e3', fontSize: 10, fontWeight: '700' }, optionArea: { marginTop: 3, color: '#788589', fontSize: 8 }, optionCurrent: { color: ORANGE, fontSize: 6, fontWeight: '800' }, addLocationOption: { minHeight: 58, marginTop: 3, paddingHorizontal: 10, borderWidth: 1, borderColor: '#69430f', borderRadius: 7, backgroundColor: 'rgba(255,122,0,0.04)', flexDirection: 'row', alignItems: 'center', gap: 9 }, addLocationIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,122,0,0.1)', alignItems: 'center', justifyContent: 'center' }, cancelButton: { height: 44, marginTop: 7, borderWidth: 1, borderColor: '#334147', borderRadius: 7, alignItems: 'center', justifyContent: 'center' }, cancelButtonText: { color: '#b9c1c3', fontSize: 10, fontWeight: '700' }, penForm: { maxHeight: 420 }, inputGroup: { marginBottom: 12 }, inputLabel: { marginBottom: 6, color: '#aeb7ba', fontSize: 8, fontWeight: '700' }, input: { width: '100%', height: 46, paddingHorizontal: 12, borderWidth: 1, borderColor: '#334147', borderRadius: 7, backgroundColor: '#0a1519', color: '#edf0f1', fontSize: 10 }, typeOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 }, typeOption: { minHeight: 34, paddingHorizontal: 10, borderWidth: 1, borderColor: '#334147', borderRadius: 6, alignItems: 'center', justifyContent: 'center' }, typeOptionSelected: { borderColor: ORANGE, backgroundColor: 'rgba(255,122,0,0.07)' }, typeOptionText: { color: '#879397', fontSize: 8 }, typeOptionTextSelected: { color: ORANGE, fontWeight: '700' }, formRow: { flexDirection: 'row', gap: 9 }, formRowCompact: { flexDirection: 'column', gap: 0 }, formField: { flex: 1 }, formActions: { marginTop: 5, flexDirection: 'row', gap: 8 }, formCancelButton: { flex: 0.8, height: 46, borderWidth: 1, borderColor: '#334147', borderRadius: 7, alignItems: 'center', justifyContent: 'center' }, formCreateButton: { flex: 1.2, height: 46, borderRadius: 7, backgroundColor: '#f66f00', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }, formCreateText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  pressed: { opacity: 0.72 }, cardPressed: { opacity: 0.76, transform: [{ scale: 0.995 }] }, missingScreen: { flex: 1, backgroundColor: '#020709', alignItems: 'center', justifyContent: 'center' }, missingTitle: { color: '#d8ddde', fontSize: 17, fontWeight: '700' }, primaryButton: { height: 44, marginTop: 18, paddingHorizontal: 18, borderRadius: 8, backgroundColor: '#f66f00', alignItems: 'center', justifyContent: 'center' }, primaryButtonText: { color: '#fff', fontSize: 11, fontWeight: '700' },
});

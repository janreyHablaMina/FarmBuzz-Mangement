import { useState } from 'react';
import { Alert, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const HERO_IMAGE = require('./assets/brooding-card.png');
const ORANGE = '#ff7900';

function ThemeToggle({ value, onValueChange, label = 'Enabled' }) {
  return <Pressable accessibilityRole="switch" accessibilityLabel={label} accessibilityState={{ checked: value }} onPress={() => onValueChange(!value)} style={[styles.toggle, value && styles.toggleOn]}><View style={[styles.toggleThumb, value && styles.toggleThumbOn]} /></Pressable>;
}

export const DEFAULT_VACCINE_SCHEDULE = [
  { id: 'vac-newcastle', name: 'Newcastle', day: 2, note: 'Primary farm vaccination', enabled: true },
  { id: 'vac-gumboro', name: 'Gumboro / IBD', day: 14, note: '', enabled: true },
  { id: 'vac-newcastle-booster', name: 'Newcastle Booster', day: 28, note: 'Booster dose', enabled: true },
  { id: 'brooding-outcome', name: 'Record Mortality & Success Rate', day: 42, note: 'Final record before moving the batch to ranging', enabled: true },
];

export const DEFAULT_BROODING_SETTINGS = {
  readyDay: 42,
  vaccinationSchedule: DEFAULT_VACCINE_SCHEDULE,
};

function VaccineEditor({ visible, entry, onClose, onSave }) {
  const [name, setName] = useState(entry?.name || '');
  const [day, setDay] = useState(String(entry?.day || ''));
  const [note, setNote] = useState(entry?.note || '');
  const [enabled, setEnabled] = useState(entry?.enabled ?? true);

  const save = () => {
    const dueDay = Number.parseInt(day, 10);
    if (!name.trim() || !Number.isFinite(dueDay) || dueDay < 1) {
      Alert.alert('Check task entry', 'Enter a task name and a valid day after hatch.');
      return;
    }
    onSave({ id: entry?.id || `vac-${Date.now()}`, name: name.trim(), day: dueDay, note: note.trim(), enabled });
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}><View><Text style={styles.modalEyebrow}>BROODING TASK</Text><Text style={styles.modalTitle}>{entry ? 'Edit Task' : 'Add Task'}</Text></View><Pressable accessibilityLabel="Close" onPress={onClose} style={styles.iconButton}><Ionicons name="close" size={20} color="#fff" /></Pressable></View>
          <Text style={styles.fieldLabel}>Task Name</Text>
          <View style={styles.field}><MaterialCommunityIcons name="clipboard-check-outline" size={18} color={ORANGE} /><TextInput value={name} onChangeText={setName} placeholder="e.g. Weigh chicks" placeholderTextColor="#68777c" selectionColor={ORANGE} style={styles.fieldInput} /></View>
          <Text style={styles.fieldLabel}>Day Due After Hatch</Text>
          <View style={styles.field}><MaterialCommunityIcons name="calendar-clock" size={18} color={ORANGE} /><Text style={styles.dayPrefix}>Day</Text><TextInput value={day} onChangeText={setDay} keyboardType="number-pad" placeholder="2" placeholderTextColor="#68777c" selectionColor={ORANGE} style={styles.fieldInput} /></View>
          <Text style={styles.fieldLabel}>Note <Text style={styles.optional}>(optional)</Text></Text>
          <TextInput value={note} onChangeText={setNote} multiline placeholder="Add schedule notes" placeholderTextColor="#68777c" selectionColor={ORANGE} style={styles.noteInput} />
          <View style={styles.enableRow}><View><Text style={styles.enableTitle}>Enabled</Text><Text style={styles.enableDetail}>Apply this task to new brooding batches</Text></View><ThemeToggle value={enabled} onValueChange={setEnabled} label="Enable task" /></View>
          <View style={styles.modalActions}><Pressable onPress={onClose} style={styles.cancelButton}><Text style={styles.cancelText}>Cancel</Text></Pressable><Pressable onPress={save} style={styles.confirmButton}><Text style={styles.confirmText}>Save Task</Text></Pressable></View>
        </View>
      </View>
    </Modal>
  );
}

function VaccineRow({ item, index, total, onEdit, onToggle, onMove, onDelete }) {
  return (
    <View style={[styles.scheduleRow, index < total - 1 && styles.scheduleRowDivider, !item.enabled && styles.vaccineDisabled]}>
      <View style={styles.dayColumn}>
        <View style={[styles.dayMarker, item.enabled && styles.dayMarkerEnabled]}><Text style={styles.dayEyebrow}>DAY</Text><Text style={[styles.dayNumber, item.enabled && styles.dayNumberEnabled]}>{item.day}</Text></View>
      </View>
      <View style={styles.vaccineCopy}>
        <View style={styles.vaccineTop}><View style={styles.vaccineTitleCopy}><Text style={styles.vaccineName}>{item.name}</Text><Text style={styles.vaccineState}>{item.enabled ? 'Included in farm schedule' : 'Disabled'}</Text></View><ThemeToggle value={item.enabled} onValueChange={onToggle} label={`Enable ${item.name}`} /></View>
        {!!item.note && <Text style={styles.vaccineNote}>{item.note}</Text>}
        <View style={styles.rowActions}>
          <View style={styles.reorderActions}><Pressable accessibilityLabel="Move task up" disabled={index === 0} onPress={() => onMove(index, -1)} style={[styles.iconAction, index === 0 && styles.iconActionDisabled]}><Ionicons name="arrow-up" size={16} color="#9da9ac" /></Pressable><Pressable accessibilityLabel="Move task down" disabled={index === total - 1} onPress={() => onMove(index, 1)} style={[styles.iconAction, index === total - 1 && styles.iconActionDisabled]}><Ionicons name="arrow-down" size={16} color="#9da9ac" /></Pressable></View>
          <View style={styles.editActions}><Pressable accessibilityLabel={`Edit ${item.name}`} onPress={onEdit} style={styles.iconAction}><MaterialCommunityIcons name="pencil-outline" size={16} color="#c6d0d2" /></Pressable><Pressable accessibilityLabel={`Delete ${item.name}`} onPress={onDelete} style={styles.iconAction}><MaterialCommunityIcons name="trash-can-outline" size={16} color="#ef7568" /></Pressable></View>
        </View>
      </View>
    </View>
  );
}

export default function VaccinationScheduleScreen({ initialSettings, initialSchedule = DEFAULT_VACCINE_SCHEDULE, onBack, onSave }) {
  const startingSettings = Array.isArray(initialSettings)
    ? { readyDay: 42, vaccinationSchedule: initialSettings }
    : { ...DEFAULT_BROODING_SETTINGS, ...(initialSettings || {}), vaccinationSchedule: initialSettings?.vaccinationSchedule || initialSchedule };
  const [schedule, setSchedule] = useState(startingSettings.vaccinationSchedule);
  const [readyDayInput, setReadyDayInput] = useState(String(startingSettings.readyDay || 42));
  const [editor, setEditor] = useState(null);

  const saveEntry = (entry) => {
    setSchedule((current) => current.some((item) => item.id === entry.id) ? current.map((item) => item.id === entry.id ? entry : item) : [...current, entry]);
    setEditor(null);
  };
  const moveEntry = (index, direction) => setSchedule((current) => {
    const next = [...current];
    const target = index + direction;
    if (target < 0 || target >= next.length) return current;
    [next[index], next[target]] = [next[target], next[index]];
    return next;
  });
  const deleteEntry = (id) => Alert.alert('Delete task?', 'This task will be removed from the farm schedule.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: () => setSchedule((current) => current.filter((item) => item.id !== id)) }]);
  const settingsWithReadyDay = () => {
    const readyDay = Number.parseInt(readyDayInput, 10);
    if (!Number.isFinite(readyDay) || readyDay < 1) {
      Alert.alert('Check ranging transition day', 'Enter a valid day after hatch.');
      return null;
    }
    return { readyDay, vaccinationSchedule: schedule };
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.pageWrap}>
        <View style={styles.page}>
          <View style={styles.hero}><Image source={HERO_IMAGE} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="center" /><LinearGradient colors={['rgba(2,7,9,0.28)', 'rgba(2,7,9,0.44)', '#03090c']} locations={[0, 0.48, 1]} style={StyleSheet.absoluteFill} /><SafeAreaView edges={['top']} style={styles.heroSafe}><View style={styles.header}><Pressable accessibilityLabel="Back to brooding" onPress={onBack} style={styles.iconButton}><Ionicons name="arrow-back" size={21} color="#fff" /></Pressable><Text style={styles.headerTitle}>Brooding Settings</Text></View><View style={styles.heroCopy}><Text style={styles.title}>Brooding Task Schedule</Text><Text style={styles.subtitle}>A farm-defined task program applied to every new brooding batch.</Text></View></SafeAreaView></View>
          <View style={styles.content}>
            <Text style={styles.policyNote}>Your farm defines the tasks and timing. FarmBuzz schedules the program you save.</Text>
            <View style={styles.transitionSetting}><View style={styles.transitionSettingIcon}><MaterialCommunityIcons name="arrow-right-circle-outline" size={22} color={ORANGE} /></View><View style={styles.transitionSettingCopy}><Text style={styles.transitionSettingTitle}>Ready to Range After</Text><Text style={styles.transitionSettingDetail}>Brooding batches become ready to range automatically on this day.</Text></View><View style={styles.readyDayInputWrap}><TextInput accessibilityLabel="Ready to range day" value={readyDayInput} onChangeText={(value) => setReadyDayInput(value.replace(/[^0-9]/g, ''))} keyboardType="number-pad" maxLength={3} selectTextOnFocus selectionColor={ORANGE} style={styles.readyDayInput} /><Text style={styles.readyDaySuffix}>DAYS</Text></View></View>
            <View style={styles.sectionHeader}><View><Text style={styles.overline}>SCHEDULE</Text><Text style={styles.sectionTitle}>After hatch</Text></View><Pressable onPress={() => setEditor({ mode: 'new' })} style={({ pressed }) => [styles.headerAddButton, pressed && styles.pressed]}><Ionicons name="add" size={18} color="#fff" /><Text style={styles.headerAddText}>Add Task</Text></Pressable></View>
            <View style={styles.list}>{schedule.map((item, index) => <VaccineRow key={item.id} item={item} index={index} total={schedule.length} onEdit={() => setEditor(item)} onToggle={(enabled) => setSchedule((current) => current.map((entry) => entry.id === item.id ? { ...entry, enabled } : entry))} onMove={moveEntry} onDelete={() => deleteEntry(item.id)} />)}</View>
            <Pressable onPress={() => { const next = settingsWithReadyDay(); if (!next) return; onSave(next); Alert.alert('Settings saved', 'The brooding program will apply to new brooding batches.'); }} style={({ pressed }) => [styles.saveSchedule, pressed && styles.pressed]}><MaterialCommunityIcons name="content-save-check-outline" size={21} color="#fff" /><Text style={styles.saveScheduleText}>Save Settings</Text></Pressable>
          </View>
        </View>
      </ScrollView>
      {!!editor && <VaccineEditor key={editor.id || 'new'} visible entry={editor.mode === 'new' ? null : editor} onClose={() => setEditor(null)} onSave={saveEntry} />}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#020709' }, pageWrap: { flexGrow: 1, alignItems: 'center', backgroundColor: '#020709' }, page: { width: '100%', maxWidth: 720 }, hero: { height: 218, overflow: 'hidden', backgroundColor: '#101719' }, heroSafe: { flex: 1 }, header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingTop: Platform.OS === 'web' ? 10 : 3 }, iconButton: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(190,204,208,0.35)', backgroundColor: 'rgba(2,8,11,0.68)', alignItems: 'center', justifyContent: 'center' }, headerTitle: { color: '#f3f5f6', fontSize: 15, fontWeight: '800' }, heroCopy: { marginTop: 'auto', paddingHorizontal: 20, paddingBottom: 22 }, title: { color: '#fff', fontSize: 30, lineHeight: 36, fontWeight: '800', fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', web: 'Georgia' }) }, subtitle: { marginTop: 4, color: '#c1cbce', fontSize: 12 }, content: { padding: 16, paddingBottom: 30 },
  policyNote: { color: '#6f7d82', fontSize: 8, lineHeight: 13 }, sectionHeader: { marginTop: 20, marginBottom: 9, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }, overline: { color: '#7c898e', fontSize: 7, fontWeight: '800' }, sectionTitle: { marginTop: 3, color: '#eef2f3', fontSize: 16, fontWeight: '800' }, headerAddButton: { height: 36, borderRadius: 6, backgroundColor: ORANGE, paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center', gap: 5 }, headerAddText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  transitionSetting: { minHeight: 78, marginTop: 14, borderRadius: 7, borderWidth: 1, borderColor: '#3c301e', backgroundColor: '#091317', padding: 11, flexDirection: 'row', alignItems: 'center', gap: 10 }, transitionSettingIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,121,0,0.08)', alignItems: 'center', justifyContent: 'center' }, transitionSettingCopy: { flex: 1, minWidth: 0 }, transitionSettingTitle: { color: '#edf1f2', fontSize: 11, fontWeight: '800' }, transitionSettingDetail: { marginTop: 4, color: '#7c898e', fontSize: 8, lineHeight: 11 }, readyDayInputWrap: { width: 78, height: 44, borderRadius: 6, borderWidth: 1, borderColor: '#7a470f', backgroundColor: '#071115', alignItems: 'center', justifyContent: 'center' }, readyDayInput: { width: '100%', height: 26, padding: 0, color: ORANGE, fontSize: 15, fontWeight: '800', textAlign: 'center', outlineStyle: 'none' }, readyDaySuffix: { marginTop: -3, color: '#77858a', fontSize: 6, fontWeight: '800' },
  list: { borderRadius: 7, borderWidth: 1, borderColor: '#213139', backgroundColor: '#091317', overflow: 'hidden' }, scheduleRow: { minHeight: 118, flexDirection: 'row' }, scheduleRowDivider: { borderBottomWidth: 1, borderBottomColor: '#1b2a30' }, vaccineDisabled: { opacity: 0.48 }, dayColumn: { width: 70, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 15 }, dayMarker: { width: 46, height: 53, borderRadius: 6, borderWidth: 1, borderColor: '#34444a', backgroundColor: '#0d181c', alignItems: 'center', justifyContent: 'center' }, dayMarkerEnabled: { borderColor: '#8a4b0f', backgroundColor: 'rgba(255,121,0,0.08)' }, dayEyebrow: { color: '#77858a', fontSize: 6, fontWeight: '800' }, dayNumber: { marginTop: 2, color: '#a7b1b4', fontSize: 17, fontWeight: '800' }, dayNumberEnabled: { color: ORANGE }, vaccineCopy: { flex: 1, minWidth: 0, paddingTop: 13, paddingRight: 10, paddingBottom: 9 }, vaccineTop: { flexDirection: 'row', alignItems: 'center', gap: 9 }, vaccineTitleCopy: { flex: 1, minWidth: 0 }, vaccineName: { color: '#edf1f2', fontSize: 12, fontWeight: '800' }, vaccineState: { marginTop: 3, color: '#7f8c91', fontSize: 8 }, vaccineNote: { marginTop: 8, color: '#9aa5a8', fontSize: 8 }, rowActions: { marginTop: 9, paddingTop: 7, borderTopWidth: 1, borderTopColor: '#1b2a30', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, reorderActions: { flexDirection: 'row', gap: 4 }, editActions: { flexDirection: 'row', gap: 4 }, iconAction: { width: 30, height: 28, borderRadius: 5, backgroundColor: '#101c20', alignItems: 'center', justifyContent: 'center' }, iconActionDisabled: { opacity: 0.2 }, saveSchedule: { height: 50, marginTop: 12, borderRadius: 7, backgroundColor: ORANGE, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 }, saveScheduleText: { color: '#fff', fontSize: 11, fontWeight: '800' }, pressed: { opacity: 0.72 },
  toggle: { width: 42, height: 24, borderRadius: 12, padding: 3, backgroundColor: '#2b3a40', justifyContent: 'center' }, toggleOn: { backgroundColor: '#9a4d08' }, toggleThumb: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#9aa5a8' }, toggleThumbOn: { marginLeft: 18, backgroundColor: ORANGE },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.78)', alignItems: 'center', justifyContent: 'center', padding: 16 }, modalCard: { width: '100%', maxWidth: 440, borderRadius: 8, borderWidth: 1, borderColor: '#293a41', backgroundColor: '#081216', padding: 16 }, modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, modalEyebrow: { color: ORANGE, fontSize: 7, fontWeight: '800' }, modalTitle: { marginTop: 3, color: '#fff', fontSize: 20, fontWeight: '800' }, fieldLabel: { marginTop: 13, marginBottom: 5, color: '#cfd6d8', fontSize: 9, fontWeight: '700' }, optional: { color: '#6f7d82', fontWeight: '400' }, field: { height: 42, borderRadius: 6, borderWidth: 1, borderColor: '#293a41', backgroundColor: '#061014', paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 7 }, fieldInput: { flex: 1, height: 40, padding: 0, color: '#e7ebec', fontSize: 10, outlineStyle: 'none' }, dayPrefix: { color: '#9ca7aa', fontSize: 9 }, noteInput: { height: 68, borderRadius: 6, borderWidth: 1, borderColor: '#293a41', backgroundColor: '#061014', padding: 10, color: '#e7ebec', fontSize: 10, textAlignVertical: 'top', outlineStyle: 'none' }, enableRow: { minHeight: 54, marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, enableTitle: { color: '#e4e9ea', fontSize: 10, fontWeight: '700' }, enableDetail: { marginTop: 3, color: '#6f7d82', fontSize: 8 }, modalActions: { marginTop: 14, flexDirection: 'row', gap: 8 }, cancelButton: { flex: 1, height: 44, borderRadius: 6, borderWidth: 1, borderColor: '#2a3b42', alignItems: 'center', justifyContent: 'center' }, cancelText: { color: '#c8d0d2', fontSize: 10, fontWeight: '700' }, confirmButton: { flex: 1, height: 44, borderRadius: 6, backgroundColor: ORANGE, alignItems: 'center', justifyContent: 'center' }, confirmText: { color: '#fff', fontSize: 10, fontWeight: '800' },
});

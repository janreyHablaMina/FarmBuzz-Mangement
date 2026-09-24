import { useMemo, useState } from 'react';
import { Alert, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const HERO_IMAGE = require('./assets/eggs-incubation-hero.png');
const ORANGE = '#ff7900';

const DEFAULT_TASKS = [
  { id: 'inc-candling', day: 10, title: 'Candling', detail: 'Check fertility and embryo development.', enabled: true },
  { id: 'inc-lockdown', day: 18, title: 'Lockdown', detail: 'Stop turning and raise hatch humidity.', enabled: true },
  { id: 'inc-hatch', day: 21, title: 'Record Hatch', detail: 'Record hatched and unhatched eggs.', enabled: true },
];

function HeaderButton({ onPress }) {
  return (
    <Pressable accessibilityLabel="Back to eggs and incubation" onPress={onPress} style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}>
      <Ionicons name="arrow-back" size={21} color="#eef1f2" />
    </Pressable>
  );
}

function Toggle({ value, onChange }) {
  return (
    <Pressable accessibilityRole="switch" accessibilityState={{ checked: value }} onPress={() => onChange(!value)} style={[styles.toggle, value && styles.toggleOn]}>
      <View style={[styles.toggleThumb, value && styles.toggleThumbOn]} />
    </Pressable>
  );
}

export default function EggsIncubationSettingsScreen({ onBack, addedTasks = [] }) {
  const { width } = useWindowDimensions();
  const compact = width < 480;
  const [tasks, setTasks] = useState(DEFAULT_TASKS);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [taskDay, setTaskDay] = useState('');
  const [taskNote, setTaskNote] = useState('');
  const [taskEnabled, setTaskEnabled] = useState(true);
  const incubationTasks = useMemo(() => addedTasks.filter((task) => task.category === 'Incubation'), [addedTasks]);
  const visibleTasks = [
    ...tasks,
    ...incubationTasks.map((task) => ({
      id: task.id,
      day: task.day || 'Custom',
      title: task.title,
      detail: task.date || task.due || 'Custom incubation task',
      enabled: task.status !== 'Completed',
      custom: true,
    })),
  ];

  const updateTask = (id, updates) => setTasks((current) => current.map((task) => task.id === id ? { ...task, ...updates } : task));
  const moveTask = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= tasks.length) return;
    setTasks((current) => {
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };
  const closeAddModal = () => {
    setAddModalVisible(false);
    setTaskName('');
    setTaskDay('');
    setTaskNote('');
    setTaskEnabled(true);
  };
  const saveTask = () => {
    const day = Number(taskDay);
    if (!taskName.trim()) {
      Alert.alert('Task name required', 'Enter a name for this incubation task.');
      return;
    }
    if (!taskDay || !Number.isInteger(day) || day < 0 || day > 99) {
      Alert.alert('Check task day', 'Enter a whole-number day from 0 to 99.');
      return;
    }
    setTasks((current) => [...current, {
      id: `inc-task-${Date.now()}`,
      day,
      title: taskName.trim(),
      detail: taskNote.trim() || `Scheduled for day ${day}.`,
      enabled: taskEnabled,
    }]);
    closeAddModal();
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.pageWrap}>
        <View style={styles.page}>
          <View style={[styles.hero, compact && styles.heroCompact]}>
            <Image source={HERO_IMAGE} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="center" cachePolicy="memory-disk" />
            <LinearGradient colors={['rgba(2,7,9,0.34)', 'rgba(2,7,9,0.12)', '#03090c']} locations={[0, 0.45, 1]} style={StyleSheet.absoluteFill} />
            <SafeAreaView edges={['top']} style={styles.heroSafeArea}>
              <View style={styles.heroHeader}>
                <HeaderButton onPress={onBack} />
                <Text style={styles.screenTitle}>Eggs &amp; Incubation Settings</Text>
              </View>
              <View style={styles.heroCopy}>
                <Text style={[styles.heroTitle, compact && styles.heroTitleCompact]}>Incubation Task Schedule</Text>
                <Text style={styles.heroSubtitle}>A farm-defined program applied to every active egg batch.</Text>
              </View>
            </SafeAreaView>
          </View>

          <View style={[styles.content, compact && styles.contentCompact]}>

            <View style={styles.sectionHeader}>
              <View><Text style={styles.eyebrow}>SCHEDULE</Text><Text style={styles.sectionTitle}>After eggs are set</Text></View>
              <Pressable onPress={() => setAddModalVisible(true)} style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}>
                <Ionicons name="add" size={19} color="#ffffff" />
                <Text style={styles.addButtonText}>Add Task</Text>
              </Pressable>
            </View>

            <View style={styles.taskList}>
              {visibleTasks.map((task, index) => (
                <View key={task.id} style={[styles.taskRow, index < visibleTasks.length - 1 && styles.taskDivider]}>
                  <View style={styles.dayBox}><Text style={styles.dayLabel}>DAY</Text><Text adjustsFontSizeToFit numberOfLines={1} style={styles.dayValue}>{task.day}</Text></View>
                  <View style={styles.taskMain}>
                    <View style={styles.taskTop}>
                      <View style={styles.taskCopy}><Text style={styles.taskTitle}>{task.title}</Text><Text style={styles.taskDetail}>{task.detail}</Text></View>
                      <Toggle value={task.enabled} onChange={(enabled) => !task.custom && updateTask(task.id, { enabled })} />
                    </View>
                    {!task.custom && (
                      <View style={styles.taskActions}>
                        <Pressable disabled={index === 0} onPress={() => moveTask(index, -1)} style={({ pressed }) => [styles.iconAction, index === 0 && styles.iconActionDisabled, pressed && styles.pressed]}><Ionicons name="arrow-up" size={18} color="#9ba8ac" /></Pressable>
                        <Pressable disabled={index === tasks.length - 1} onPress={() => moveTask(index, 1)} style={({ pressed }) => [styles.iconAction, index === tasks.length - 1 && styles.iconActionDisabled, pressed && styles.pressed]}><Ionicons name="arrow-down" size={18} color="#9ba8ac" /></Pressable>
                        <View style={styles.actionSpacer} />
                        <Pressable onPress={() => Alert.alert('Edit task', `Edit ${task.title}.`)} style={({ pressed }) => [styles.iconAction, pressed && styles.pressed]}><MaterialCommunityIcons name="pencil-outline" size={18} color="#dce3e5" /></Pressable>
                        <Pressable onPress={() => setTasks((current) => current.filter((item) => item.id !== task.id))} style={({ pressed }) => [styles.iconAction, pressed && styles.pressed]}><MaterialCommunityIcons name="trash-can-outline" size={18} color="#ff5f55" /></Pressable>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>

            <Pressable onPress={() => Alert.alert('Settings saved', 'Incubation task schedule saved.')} style={({ pressed }) => [styles.saveButton, pressed && styles.pressed]}>
              <MaterialCommunityIcons name="content-save-check-outline" size={21} color="#ffffff" />
              <Text style={styles.saveButtonText}>Save Settings</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <Modal visible={addModalVisible} transparent animationType="fade" onRequestClose={closeAddModal}>
        <View style={styles.modalOverlay}>
          <Pressable accessibilityLabel="Close add task modal" onPress={closeAddModal} style={StyleSheet.absoluteFill} />
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalEyebrow}>INCUBATION TASK</Text>
                <Text style={styles.modalTitle}>Add Task</Text>
              </View>
              <Pressable accessibilityLabel="Close" onPress={closeAddModal} style={({ pressed }) => [styles.modalClose, pressed && styles.pressed]}>
                <Ionicons name="close" size={22} color="#ffffff" />
              </Pressable>
            </View>

            <Text style={styles.modalFieldLabel}>Task Name</Text>
            <View style={styles.modalInputShell}>
              <MaterialCommunityIcons name="clipboard-text-outline" size={19} color={ORANGE} />
              <TextInput autoFocus value={taskName} onChangeText={setTaskName} placeholder="e.g. Check humidity" placeholderTextColor="#66777d" selectionColor={ORANGE} style={styles.modalInput} />
            </View>

            <Text style={styles.modalFieldLabel}>Day Due After Eggs Set</Text>
            <View style={styles.modalInputShell}>
              <MaterialCommunityIcons name="calendar-clock-outline" size={19} color={ORANGE} />
              <Text style={styles.modalDayPrefix}>Day</Text>
              <TextInput value={taskDay} onChangeText={(value) => setTaskDay(value.replace(/[^0-9]/g, ''))} placeholder="10" placeholderTextColor="#66777d" selectionColor={ORANGE} keyboardType="number-pad" inputMode="numeric" maxLength={2} style={styles.modalInput} />
            </View>

            <Text style={styles.modalFieldLabel}>Note <Text style={styles.modalOptional}>(optional)</Text></Text>
            <View style={[styles.modalInputShell, styles.modalNoteShell]}>
              <TextInput value={taskNote} onChangeText={setTaskNote} placeholder="Add schedule notes" placeholderTextColor="#66777d" selectionColor={ORANGE} multiline textAlignVertical="top" style={[styles.modalInput, styles.modalNoteInput]} />
            </View>

            <View style={styles.modalEnabledRow}>
              <View><Text style={styles.modalEnabledTitle}>Enabled</Text><Text style={styles.modalEnabledDetail}>Apply this task to new incubation batches</Text></View>
              <Toggle value={taskEnabled} onChange={setTaskEnabled} />
            </View>

            <View style={styles.modalActions}>
              <Pressable onPress={closeAddModal} style={({ pressed }) => [styles.modalCancelButton, pressed && styles.pressed]}><Text style={styles.modalCancelText}>Cancel</Text></Pressable>
              <Pressable onPress={saveTask} style={({ pressed }) => [styles.modalSaveButton, pressed && styles.pressed]}><Text style={styles.modalSaveText}>Save Task</Text></Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#020709' },
  pageWrap: { flexGrow: 1, alignItems: 'center', backgroundColor: '#020709' },
  page: { width: '100%', maxWidth: 720, backgroundColor: '#020709' },
  hero: { height: 230, overflow: 'hidden', backgroundColor: '#101719' }, heroCompact: { height: 220 }, heroSafeArea: { flex: 1 },
  heroHeader: { paddingHorizontal: 12, paddingTop: Platform.OS === 'web' ? 10 : 3, flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerButton: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(190,204,208,0.35)', backgroundColor: 'rgba(2,8,11,0.65)', alignItems: 'center', justifyContent: 'center' },
  screenTitle: { flex: 1, color: '#f1f4f5', fontSize: 15, fontWeight: '800' },
  heroCopy: { marginTop: 'auto', paddingHorizontal: 14, paddingBottom: 24 },
  heroTitle: { color: '#ffffff', fontSize: 32, lineHeight: 38, fontWeight: '800', fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', web: 'Georgia' }) },
  heroTitleCompact: { fontSize: 27, lineHeight: 33 }, heroSubtitle: { marginTop: 5, color: '#c1c9cc', fontSize: 12, lineHeight: 18 },
  content: { paddingHorizontal: 11, paddingTop: 14, paddingBottom: 30 }, contentCompact: { paddingHorizontal: 9 },
  summaryCard: { minHeight: 78, borderRadius: 7, borderWidth: 1, borderColor: '#2a3b42', backgroundColor: '#0a1519', paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 11 },
  summaryIcon: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: '#8a4c0d', backgroundColor: 'rgba(255,121,0,0.08)', alignItems: 'center', justifyContent: 'center' },
  summaryCopy: { flex: 1, minWidth: 0 }, summaryTitle: { color: '#eef2f3', fontSize: 12, fontWeight: '800' }, summaryDetail: { marginTop: 4, color: '#75858a', fontSize: 8, lineHeight: 12 },
  summaryCount: { alignItems: 'center' }, summaryCountValue: { color: '#ffffff', fontSize: 20, fontWeight: '800' }, summaryCountLabel: { color: '#78868b', fontSize: 8 },
  helperText: { marginTop: 10, color: '#65747a', fontSize: 8, lineHeight: 13 },
  sectionHeader: { marginTop: 20, marginBottom: 9, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 10 },
  eyebrow: { color: '#89969a', fontSize: 8, fontWeight: '800' }, sectionTitle: { marginTop: 4, color: '#f0f3f4', fontSize: 18, fontWeight: '800' },
  addButton: { height: 40, borderRadius: 7, backgroundColor: ORANGE, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 }, addButtonText: { color: '#ffffff', fontSize: 10, fontWeight: '800' },
  taskList: { borderRadius: 7, borderWidth: 1, borderColor: '#27383f', backgroundColor: '#091418', overflow: 'hidden' },
  taskRow: { minHeight: 116, padding: 12, flexDirection: 'row', gap: 11 }, taskDivider: { borderBottomWidth: 1, borderBottomColor: '#213138' },
  dayBox: { width: 48, height: 58, borderRadius: 6, borderWidth: 1, borderColor: '#a65a0a', backgroundColor: '#11191b', alignItems: 'center', justifyContent: 'center' }, dayLabel: { color: '#718086', fontSize: 7, fontWeight: '800' }, dayValue: { marginTop: 4, maxWidth: 42, color: ORANGE, fontSize: 19, fontWeight: '800' },
  taskMain: { flex: 1, minWidth: 0 }, taskTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 }, taskCopy: { flex: 1, minWidth: 0 }, taskTitle: { color: '#eef2f3', fontSize: 12, fontWeight: '800' }, taskDetail: { marginTop: 4, color: '#728187', fontSize: 8, lineHeight: 12 },
  toggle: { width: 42, height: 25, borderRadius: 13, backgroundColor: '#26353b', padding: 3, justifyContent: 'center' }, toggleOn: { backgroundColor: '#b75505' }, toggleThumb: { width: 19, height: 19, borderRadius: 10, backgroundColor: '#758187' }, toggleThumbOn: { alignSelf: 'flex-end', backgroundColor: ORANGE },
  taskActions: { marginTop: 13, flexDirection: 'row', alignItems: 'center', gap: 7 }, iconAction: { width: 34, height: 32, borderRadius: 6, backgroundColor: '#0d1b20', alignItems: 'center', justifyContent: 'center' }, iconActionDisabled: { opacity: 0.25 }, actionSpacer: { flex: 1 },
  saveButton: { marginTop: 12, height: 52, borderRadius: 7, backgroundColor: ORANGE, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }, saveButtonText: { color: '#ffffff', fontSize: 12, fontWeight: '800' },
  modalOverlay: { flex: 1, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,4,6,0.84)' },
  modalCard: { width: '100%', maxWidth: 440, maxHeight: '92%', borderRadius: 8, borderWidth: 1, borderColor: '#2c3d44', backgroundColor: '#071216', padding: 16 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  modalEyebrow: { color: ORANGE, fontSize: 8, fontWeight: '800' },
  modalTitle: { marginTop: 5, color: '#ffffff', fontSize: 22, fontWeight: '800' },
  modalClose: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: '#44535a', alignItems: 'center', justifyContent: 'center' },
  modalFieldLabel: { marginTop: 15, marginBottom: 6, color: '#edf1f2', fontSize: 10, fontWeight: '700' },
  modalOptional: { color: '#829095', fontWeight: '400' },
  modalInputShell: { minHeight: 48, borderRadius: 7, borderWidth: 1, borderColor: '#304249', backgroundColor: '#081519', paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 9 },
  modalInput: { flex: 1, minWidth: 0, height: 46, paddingVertical: 0, color: '#ffffff', fontSize: 12, outlineStyle: 'none' },
  modalDayPrefix: { color: '#cfd6d8', fontSize: 11 },
  modalNoteShell: { height: 90, alignItems: 'flex-start', paddingVertical: 10 },
  modalNoteInput: { height: 68, textAlignVertical: 'top' },
  modalEnabledRow: { marginTop: 18, minHeight: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  modalEnabledTitle: { color: '#ffffff', fontSize: 11, fontWeight: '800' },
  modalEnabledDetail: { marginTop: 3, color: '#6f7e83', fontSize: 8 },
  modalActions: { marginTop: 18, flexDirection: 'row', gap: 8 },
  modalCancelButton: { flex: 1, height: 46, borderRadius: 7, borderWidth: 1, borderColor: '#304249', alignItems: 'center', justifyContent: 'center' },
  modalCancelText: { color: '#e4e9ea', fontSize: 11, fontWeight: '700' },
  modalSaveButton: { flex: 1.35, height: 46, borderRadius: 7, backgroundColor: ORANGE, alignItems: 'center', justifyContent: 'center' },
  modalSaveText: { color: '#ffffff', fontSize: 11, fontWeight: '800' },
  pressed: { opacity: 0.72 },
});

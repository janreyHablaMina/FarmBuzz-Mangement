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

const TASKS_HERO_IMAGE = require('./assets/tasks-hero.png');
const ORANGE = '#ff7a00';
const CATEGORIES = ['General', 'Flock Care', 'Breeding', 'Breeding Pair', 'Incubation', 'Treatment', 'Vaccination', 'Cleaning', 'Records'];
const TIMES = ['6:00 AM', '8:00 AM', '10:00 AM', '1:00 PM', '3:00 PM', '5:00 PM'];
const PRIORITIES = ['Low', 'Medium', 'High'];
const REPEAT_OPTIONS = ['Does not repeat', 'Every day', 'Every week', 'Every month'];
const CATEGORY_ICONS = { General: 'clipboard-text-outline', 'Flock Care': 'bird', Breeding: 'gender-male-female', 'Breeding Pair': 'gender-male-female', Incubation: 'egg-outline', Treatment: 'medical-bag', Vaccination: 'needle', Cleaning: 'broom', Records: 'file-document-outline' };

function normalizeDate(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getInitialDueDate(task) {
  const today = normalizeDate(new Date());
  if (!task) return today;
  if (task.due === 'Due Today') return today;
  if (task.due === 'Tomorrow') {
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    return tomorrow;
  }
  const parsed = new Date(task.date);
  if (!Number.isNaN(parsed.getTime())) return normalizeDate(parsed);
  const monthDay = task.date?.match(/^([A-Za-z]+\s+\d{1,2})/i)?.[1];
  if (monthDay) {
    const fallback = new Date(`${monthDay}, ${today.getFullYear()}`);
    if (!Number.isNaN(fallback.getTime())) return normalizeDate(fallback);
  }
  return today;
}

function getInitialTime(task) {
  if (!task?.date) return '8:00 AM';
  const match = task.date.match(/(\d{1,2}:\d{2}\s(?:AM|PM))$/i);
  return match?.[1] || '8:00 AM';
}

function HeaderButton({ onPress }) {
  return <Pressable accessibilityLabel="Back to tasks" onPress={onPress} style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}><Ionicons name="arrow-back" size={21} color="#eef1f2" /></Pressable>;
}

function formatDueLabel(date) {
  const today = normalizeDate(new Date());
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  if (date.getTime() === today.getTime()) return 'Due Today';
  if (date.getTime() === tomorrow.getTime()) return 'Tomorrow';
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}

function DropdownField({ icon, label, value, options, open, onToggle, onSelect, renderOption }) {
  return (
    <View style={[styles.fieldCard, open && styles.fieldCardOpen]}>
      <Pressable onPress={onToggle} style={({ pressed }) => [styles.fieldTrigger, pressed && styles.rowPressed]}>
        <View style={styles.fieldIcon}><MaterialCommunityIcons name={icon} size={20} color={ORANGE} /></View>
        <View style={styles.fieldCopy}><Text style={styles.fieldLabel}>{label}</Text><Text numberOfLines={1} style={[styles.fieldValue, !value && styles.placeholder]}>{value || `Select ${label.toLowerCase()}`}</Text></View>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color="#899397" />
      </Pressable>
      {open && <View style={styles.dropdownList}>{options.map((option) => {
        const optionValue = typeof option === 'string' ? option : option.name;
        return <Pressable key={typeof option === 'string' ? option : option.id} onPress={() => onSelect(option)} style={({ pressed }) => [styles.dropdownRow, pressed && styles.rowPressed]}>{renderOption ? renderOption(option) : <Text style={[styles.dropdownText, optionValue === value && styles.dropdownTextSelected]}>{optionValue}</Text>}{optionValue === value && <Ionicons name="checkmark" size={18} color={ORANGE} />}</Pressable>;
      })}</View>}
    </View>
  );
}

function DateField({ value, open, onToggle, onChange }) {
  const today = normalizeDate(new Date());
  const [month, setMonth] = useState(() => new Date(value.getFullYear(), value.getMonth(), 1));
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells = [...Array.from({ length: month.getDay() }, (_, index) => ({ key: `blank-${index}` })), ...Array.from({ length: days }, (_, index) => { const date = new Date(month.getFullYear(), month.getMonth(), index + 1); return { key: date.toISOString(), date }; })];
  const canGoBack = month.getTime() > new Date(today.getFullYear(), today.getMonth(), 1).getTime();
  return (
    <View style={[styles.fieldCard, open && styles.fieldCardOpen]}>
      <Pressable onPress={onToggle} style={({ pressed }) => [styles.fieldTrigger, pressed && styles.rowPressed]}>
        <View style={styles.fieldIcon}><MaterialCommunityIcons name="calendar-month-outline" size={20} color={ORANGE} /></View>
        <View style={styles.fieldCopy}><Text style={styles.fieldLabel}>Due Date</Text><Text style={styles.fieldValue}>{formatDueLabel(value)}</Text></View>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color="#899397" />
      </Pressable>
      {open && <View style={styles.calendarPanel}>
        <View style={styles.calendarHeader}><Pressable disabled={!canGoBack} onPress={() => setMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))} style={[styles.calendarNav, !canGoBack && styles.disabled]}><Ionicons name="chevron-back" size={18} color="#c2c9cb" /></Pressable><Text style={styles.calendarMonth}>{new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(month)}</Text><Pressable onPress={() => setMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))} style={styles.calendarNav}><Ionicons name="chevron-forward" size={18} color="#c2c9cb" /></Pressable></View>
        <View style={styles.weekdays}>{['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => <Text key={`${day}-${index}`} style={styles.weekday}>{day}</Text>)}</View>
        <View style={styles.calendarGrid}>{cells.map((cell) => {
          if (!cell.date) return <View key={cell.key} style={styles.dayCell} />;
          const disabled = cell.date < today; const selected = cell.date.getTime() === value.getTime();
          return <Pressable key={cell.key} disabled={disabled} onPress={() => { onChange(cell.date); onToggle(); }} style={[styles.dayCell, selected && styles.daySelected]}><Text style={[styles.dayText, disabled && styles.dayDisabled, selected && styles.dayTextSelected]}>{cell.date.getDate()}</Text></Pressable>;
        })}</View>
      </View>}
    </View>
  );
}

function TaskPreview({ title, category, dueDate, time, priority, assignee, recurrence }) {
  return (
    <View style={styles.preview}>
      <View style={styles.previewIcon}><MaterialCommunityIcons name={CATEGORY_ICONS[category] || 'clipboard-text-outline'} size={24} color={ORANGE} /></View>
      <View style={styles.previewCopy}><Text style={styles.previewEyebrow}>TASK PREVIEW</Text><Text numberOfLines={1} style={styles.previewTitle}>{title.trim() || 'New farm task'}</Text><Text numberOfLines={1} style={styles.previewMeta}>{formatDueLabel(dueDate)} - {time}{recurrence !== 'Does not repeat' ? ` - ${recurrence}` : ''}{assignee ? ` - ${assignee.name}` : ''}</Text></View>
      <View style={styles.previewPriority}><Text style={styles.previewPriorityText}>{priority}</Text></View>
    </View>
  );
}

export default function AddTaskScreen({ members = [], initialTask, onBack, onComplete }) {
  const { width } = useWindowDimensions();
  const compact = width < 480; const narrow = width < 390;
  const editing = !!initialTask;
  const initialAssignee = members.find((member) => member.id === initialTask?.assigneeId) || null;
  const [title, setTitle] = useState(initialTask?.title || ''); const [description, setDescription] = useState(initialTask?.description || ''); const [category, setCategory] = useState(initialTask?.category || 'General'); const [subject, setSubject] = useState(initialTask?.subject || '');
  const [assignee, setAssignee] = useState(initialAssignee); const [dueDate, setDueDate] = useState(() => getInitialDueDate(initialTask)); const [time, setTime] = useState(() => getInitialTime(initialTask)); const [recurrence, setRecurrence] = useState(initialTask?.recurrence || 'Does not repeat'); const [priority, setPriority] = useState(PRIORITIES.includes(initialTask?.priority) ? initialTask.priority : 'Medium'); const [reminder, setReminder] = useState(initialTask?.reminder ?? true); const [openField, setOpenField] = useState(null);
  const canCreate = title.trim() && category;
  const selectedDateText = useMemo(() => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(dueDate), [dueDate]);
  const createTask = () => {
    if (!canCreate) { Alert.alert('Task title required', 'Enter a title before creating the task.'); return; }
    const today = normalizeDate(new Date());
    const createdAt = initialTask?.createdAt || new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date());
    const completed = initialTask?.state === 'completed';
    onComplete({ ...initialTask, id: initialTask?.id || `task-${Date.now()}`, state: completed ? 'completed' : dueDate.getTime() > today.getTime() ? 'upcoming' : 'open', icon: completed ? 'check-circle-outline' : CATEGORY_ICONS[category], originalIcon: CATEGORY_ICONS[category], color: completed ? '#62df67' : ORANGE, title: title.trim(), description: description.trim() || 'No additional details.', subject: subject.trim() || assignee?.name || 'Farm Operations', category, due: completed ? 'Completed' : formatDueLabel(dueDate), date: `${selectedDateText}, ${time}`, priority: completed ? 'Done' : priority, recurrence, assigneeId: assignee?.id, assigneeName: assignee?.name, reminder, createdBy: initialTask?.createdBy || 'Maria Santos', createdAt });
  };
  const toggleField = (field) => setOpenField((current) => current === field ? null : field);

  return <View style={styles.screen}><StatusBar style="light" translucent backgroundColor="transparent" /><ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.pageWrap}><View style={styles.page}>
    <View style={[styles.hero, compact && styles.heroCompact]}><Image source={TASKS_HERO_IMAGE} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="center" cachePolicy="memory-disk" /><LinearGradient colors={['rgba(2,7,9,0.22)', 'rgba(2,7,9,0.38)', '#03090c']} locations={[0, 0.5, 1]} style={StyleSheet.absoluteFill} /><SafeAreaView edges={['top']} style={styles.heroSafeArea}><View style={styles.heroHeader}><HeaderButton onPress={onBack} /><Text style={styles.screenTitle}>{editing ? 'Edit Task' : 'Add Task'}</Text></View><View style={[styles.heroCopy, narrow && styles.heroCopyNarrow]}><Text style={[styles.farmName, narrow && styles.farmNameNarrow]}>FarmBuzz Farm</Text><Text style={styles.heroSubtitle}>{editing ? 'Update task details and assignment.' : 'Create clear work for the farm team.'}</Text></View></SafeAreaView></View>
    <View style={[styles.content, narrow && styles.contentNarrow]}><TaskPreview title={title} category={category} dueDate={dueDate} time={time} priority={priority} assignee={assignee} recurrence={recurrence} />
      <View style={styles.textCard}><View style={styles.fieldIcon}><MaterialCommunityIcons name="clipboard-edit-outline" size={20} color={ORANGE} /></View><View style={styles.textCopy}><View style={styles.requiredRow}><Text style={styles.fieldLabel}>Task Title</Text><Text style={styles.required}>*</Text></View><TextInput value={title} onChangeText={setTitle} maxLength={80} placeholder="What needs to be done?" placeholderTextColor="#6f7b7f" selectionColor={ORANGE} style={styles.titleInput} /></View></View>
      <View style={styles.descriptionCard}><Text style={styles.fieldLabel}>Description</Text><TextInput value={description} onChangeText={setDescription} multiline textAlignVertical="top" maxLength={300} placeholder="Add instructions or useful details..." placeholderTextColor="#6f7b7f" selectionColor={ORANGE} style={styles.descriptionInput} /></View>
      <DropdownField icon="shape-outline" label="Category" value={category} options={CATEGORIES} open={openField === 'category'} onToggle={() => toggleField('category')} onSelect={(value) => { setCategory(value); setOpenField(null); }} />
      <View style={styles.textCard}><View style={styles.fieldIcon}><MaterialCommunityIcons name="link-variant" size={20} color={ORANGE} /></View><View style={styles.textCopy}><Text style={styles.fieldLabel}>Related Bird, Batch, or Location</Text><TextInput value={subject} onChangeText={setSubject} maxLength={70} placeholder="Optional related record" placeholderTextColor="#6f7b7f" selectionColor={ORANGE} style={styles.titleInput} /></View></View>
      <DropdownField icon="account-outline" label="Assign To" value={assignee?.name} options={members} open={openField === 'assignee'} onToggle={() => toggleField('assignee')} onSelect={(member) => { setAssignee(member); setOpenField(null); }} renderOption={(member) => <View style={styles.personOption}><Image source={member.image} style={styles.personAvatar} contentFit="cover" cachePolicy="memory-disk" /><View><Text style={styles.dropdownText}>{member.name}</Text><Text style={styles.personRole}>{member.role}</Text></View></View>} />
      <View style={[styles.dateTimeRow, compact && styles.dateTimeRowCompact]}><View style={styles.dateColumn}><DateField value={dueDate} open={openField === 'date'} onToggle={() => toggleField('date')} onChange={setDueDate} /></View><View style={styles.timeColumn}><DropdownField icon="clock-outline" label="Due Time" value={time} options={TIMES} open={openField === 'time'} onToggle={() => toggleField('time')} onSelect={(value) => { setTime(value); setOpenField(null); }} /></View></View>
      <DropdownField icon="repeat" label="Repeat" value={recurrence} options={REPEAT_OPTIONS} open={openField === 'repeat'} onToggle={() => toggleField('repeat')} onSelect={(value) => { setRecurrence(value); setOpenField(null); }} />
      <View style={styles.priorityCard}><Text style={styles.fieldLabel}>Priority</Text><View style={styles.priorityOptions}>{PRIORITIES.map((item) => <Pressable key={item} onPress={() => setPriority(item)} style={[styles.priorityOption, priority === item && styles.priorityOptionActive]}><Text style={[styles.priorityOptionText, priority === item && styles.priorityOptionTextActive]}>{item}</Text></Pressable>)}</View></View>
      <Pressable accessibilityRole="switch" accessibilityState={{ checked: reminder }} onPress={() => setReminder((current) => !current)} style={styles.reminderRow}><View style={styles.fieldIcon}><MaterialCommunityIcons name="bell-outline" size={20} color={ORANGE} /></View><View style={styles.fieldCopy}><Text style={styles.fieldLabel}>Task Reminder</Text><Text style={styles.reminderText}>Notify the assignee before this task is due.</Text></View><View style={[styles.toggleTrack, reminder && styles.toggleTrackActive]}><View style={[styles.toggleThumb, reminder && styles.toggleThumbActive]} /></View></Pressable>
      <View style={styles.actions}><Pressable onPress={onBack} style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}><Text style={styles.cancelText}>Cancel</Text></Pressable><Pressable disabled={!canCreate} onPress={createTask} style={({ pressed }) => [styles.createButton, !canCreate && styles.createDisabled, pressed && canCreate && styles.pressed]}><MaterialCommunityIcons name={editing ? 'content-save-outline' : 'clipboard-plus-outline'} size={20} color="#fff" /><Text style={styles.createText}>{editing ? 'Save Changes' : 'Create Task'}</Text></Pressable></View>
    </View></View></ScrollView></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#020709' }, pageWrap: { flexGrow: 1, alignItems: 'center', backgroundColor: '#020709' }, page: { width: '100%', maxWidth: 720, backgroundColor: '#020709' }, hero: { height: 245, overflow: 'hidden', backgroundColor: '#101719' }, heroCompact: { height: 230 }, heroSafeArea: { flex: 1 }, heroHeader: { flexDirection: 'row', alignItems: 'center', gap: 13, paddingHorizontal: 16, paddingTop: Platform.OS === 'web' ? 10 : 3 }, headerButton: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(190,204,208,0.35)', backgroundColor: 'rgba(2,8,11,0.65)', alignItems: 'center', justifyContent: 'center' }, screenTitle: { color: '#f2f4f4', fontSize: 18, fontWeight: '700', letterSpacing: 0 }, heroCopy: { marginTop: 'auto', paddingHorizontal: 18, paddingBottom: 25 }, heroCopyNarrow: { paddingHorizontal: 11, paddingBottom: 20 }, farmName: { color: '#f5f6f6', fontSize: 32, lineHeight: 38, fontWeight: '800', letterSpacing: 0, fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', web: 'Georgia' }), textShadowColor: 'rgba(0,0,0,0.75)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 5 }, farmNameNarrow: { fontSize: 28, lineHeight: 33 }, heroSubtitle: { marginTop: 5, color: '#c0c7c9', fontSize: 13, letterSpacing: 0 },
  content: { paddingHorizontal: 14, paddingTop: 14, paddingBottom: 30, gap: 10 }, contentNarrow: { paddingHorizontal: 9 }, preview: { minHeight: 74, padding: 10, borderWidth: 1, borderColor: '#5b3b14', borderRadius: 8, backgroundColor: 'rgba(255,122,0,0.045)', flexDirection: 'row', alignItems: 'center', gap: 10 }, previewIcon: { width: 43, height: 43, borderRadius: 22, backgroundColor: 'rgba(255,122,0,0.1)', alignItems: 'center', justifyContent: 'center' }, previewCopy: { flex: 1, minWidth: 0 }, previewEyebrow: { color: ORANGE, fontSize: 7, fontWeight: '800' }, previewTitle: { marginTop: 3, color: '#edf0f1', fontSize: 13, fontWeight: '800', letterSpacing: 0 }, previewMeta: { marginTop: 3, color: '#839094', fontSize: 8, letterSpacing: 0 }, previewPriority: { paddingHorizontal: 8, paddingVertical: 5, borderWidth: 1, borderColor: '#66400e', borderRadius: 11 }, previewPriorityText: { color: ORANGE, fontSize: 8, fontWeight: '700' },
  fieldCard: { position: 'relative', zIndex: 1, borderWidth: 1, borderColor: '#26343a', borderRadius: 8, backgroundColor: '#0a1317', overflow: 'visible' }, fieldCardOpen: { zIndex: 100, elevation: 12, borderColor: '#69410e' }, fieldTrigger: { minHeight: 60, paddingHorizontal: 11, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 10 }, fieldIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,122,0,0.08)', alignItems: 'center', justifyContent: 'center' }, fieldCopy: { flex: 1, minWidth: 0 }, fieldLabel: { color: '#dfe3e4', fontSize: 10, fontWeight: '700', letterSpacing: 0 }, fieldValue: { marginTop: 4, color: '#c2c9cb', fontSize: 11, letterSpacing: 0 }, placeholder: { color: '#707c80' }, dropdownList: { position: 'absolute', top: 61, left: -1, right: -1, zIndex: 110, elevation: 14, borderWidth: 1, borderColor: '#36464d', borderRadius: 8, backgroundColor: '#081115', overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.42, shadowRadius: 14 }, dropdownRow: { minHeight: 45, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#1e2b31', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 9 }, dropdownText: { color: '#b7c0c2', fontSize: 11, letterSpacing: 0 }, dropdownTextSelected: { color: ORANGE, fontWeight: '700' }, rowPressed: { backgroundColor: '#111d22' },
  textCard: { minHeight: 66, paddingHorizontal: 11, borderWidth: 1, borderColor: '#26343a', borderRadius: 8, backgroundColor: '#0a1317', flexDirection: 'row', alignItems: 'center', gap: 10 }, textCopy: { flex: 1 }, requiredRow: { flexDirection: 'row', gap: 3 }, required: { color: '#ff5148', fontSize: 11, fontWeight: '700' }, titleInput: { height: 35, paddingVertical: 0, color: '#e5e9ea', fontSize: 11, outlineStyle: 'none' }, descriptionCard: { padding: 11, borderWidth: 1, borderColor: '#26343a', borderRadius: 8, backgroundColor: '#0a1317' }, descriptionInput: { minHeight: 82, marginTop: 7, padding: 9, borderWidth: 1, borderColor: '#223138', borderRadius: 7, color: '#e5e9ea', fontSize: 11, outlineStyle: 'none' },
  personOption: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }, personAvatar: { width: 33, height: 33, borderRadius: 17 }, personRole: { marginTop: 2, color: '#758084', fontSize: 8 }, dateTimeRow: { position: 'relative', zIndex: 2, flexDirection: 'row', alignItems: 'flex-start', gap: 10 }, dateTimeRowCompact: { flexDirection: 'column' }, dateColumn: { flex: 1, width: '100%', zIndex: 2 }, timeColumn: { flex: 1, width: '100%', zIndex: 1 }, calendarPanel: { position: 'absolute', top: 61, left: -1, right: -1, zIndex: 110, elevation: 14, padding: 10, borderWidth: 1, borderColor: '#36464d', borderRadius: 8, backgroundColor: '#081115', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.42, shadowRadius: 14 }, calendarHeader: { height: 36, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, calendarNav: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }, disabled: { opacity: 0.25 }, calendarMonth: { color: '#dce0e1', fontSize: 11, fontWeight: '700' }, weekdays: { flexDirection: 'row' }, weekday: { width: '14.2857%', paddingVertical: 5, color: '#718084', fontSize: 9, textAlign: 'center' }, calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' }, dayCell: { width: '14.2857%', aspectRatio: 1.25, borderRadius: 6, alignItems: 'center', justifyContent: 'center' }, daySelected: { backgroundColor: ORANGE }, dayText: { color: '#b9c1c3', fontSize: 10 }, dayDisabled: { color: '#3f4a4e' }, dayTextSelected: { color: '#fff', fontWeight: '800' },
  priorityCard: { padding: 11, borderWidth: 1, borderColor: '#26343a', borderRadius: 8, backgroundColor: '#0a1317' }, priorityOptions: { marginTop: 9, flexDirection: 'row', gap: 7 }, priorityOption: { flex: 1, height: 38, borderWidth: 1, borderColor: '#2c3a40', borderRadius: 7, alignItems: 'center', justifyContent: 'center' }, priorityOptionActive: { borderColor: ORANGE, backgroundColor: 'rgba(255,122,0,0.08)' }, priorityOptionText: { color: '#899599', fontSize: 10, fontWeight: '600' }, priorityOptionTextActive: { color: ORANGE }, reminderRow: { minHeight: 64, paddingHorizontal: 11, borderWidth: 1, borderColor: '#26343a', borderRadius: 8, backgroundColor: '#0a1317', flexDirection: 'row', alignItems: 'center', gap: 10 }, reminderText: { marginTop: 3, color: '#7d898c', fontSize: 8 }, toggleTrack: { width: 44, height: 25, padding: 3, borderRadius: 13, backgroundColor: '#344147' }, toggleTrackActive: { backgroundColor: ORANGE }, toggleThumb: { width: 19, height: 19, borderRadius: 10, backgroundColor: '#aeb7ba' }, toggleThumbActive: { backgroundColor: '#fff', transform: [{ translateX: 19 }] },
  actions: { flexDirection: 'row', gap: 8 }, cancelButton: { flex: 0.7, height: 50, borderWidth: 1, borderColor: '#2a383e', borderRadius: 8, alignItems: 'center', justifyContent: 'center' }, cancelText: { color: '#bac2c4', fontSize: 12, fontWeight: '600' }, createButton: { flex: 1.3, height: 50, borderRadius: 8, backgroundColor: '#f66f00', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 }, createDisabled: { backgroundColor: '#3b4143', opacity: 0.65 }, createText: { color: '#fff', fontSize: 12, fontWeight: '700' }, pressed: { opacity: 0.72 },
});

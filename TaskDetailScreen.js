import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
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

function HeaderButton({ icon, label, onPress }) {
  return <Pressable accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}><Ionicons name={icon} size={21} color="#eef1f2" /></Pressable>;
}

function Fact({ icon, label, value, isLast }) {
  return <View style={[styles.fact, !isLast && styles.factDivider]}><View style={styles.factIcon}><MaterialCommunityIcons name={icon} size={20} color={ORANGE} /></View><Text numberOfLines={2} style={styles.factValue}>{value}</Text><Text style={styles.factLabel}>{label}</Text></View>;
}

function DetailRow({ icon, label, value, isLast, onPress }) {
  const content = <><View style={styles.rowIcon}><MaterialCommunityIcons name={icon} size={20} color={ORANGE} /></View><View style={styles.rowCopy}><Text style={styles.rowLabel}>{label}</Text><Text numberOfLines={2} style={styles.rowValue}>{value}</Text></View>{onPress && <Ionicons name="chevron-forward" size={19} color="#899397" />}</>;
  if (onPress) return <Pressable onPress={onPress} style={({ pressed }) => [styles.detailRow, !isLast && styles.rowDivider, pressed && styles.rowPressed]}>{content}</Pressable>;
  return <View style={[styles.detailRow, !isLast && styles.rowDivider]}>{content}</View>;
}

function formatTaskId(id) {
  const suffix = id.replace(/[^a-z0-9]/gi, '').slice(-7).toUpperCase();
  return `TASK-${suffix || '001'}`;
}

function nextOccurrence(task) {
  const next = new Date();
  if (task.recurrence === 'Every week') next.setDate(next.getDate() + 7);
  else if (task.recurrence === 'Every month') next.setMonth(next.getMonth() + 1);
  else next.setDate(next.getDate() + 1);
  const time = task.date?.split(', ').at(-1) || '8:00 AM';
  const date = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(next);
  return { ...task, state: 'upcoming', due: task.recurrence === 'Every day' ? 'Tomorrow' : date, date: `${date}, ${time}`, lastCompleted: 'Completed today' };
}

export default function TaskDetailScreen({ task, members = [], onBack, onEdit, onUpdate }) {
  const { width } = useWindowDimensions();
  const compact = width < 480;
  const narrow = width < 390;

  if (!task) return <View style={styles.missingScreen}><MaterialCommunityIcons name="clipboard-alert-outline" size={42} color="#687478" /><Text style={styles.missingTitle}>Task record unavailable</Text><Pressable onPress={onBack} style={styles.missingButton}><Text style={styles.missingButtonText}>Back to Tasks</Text></Pressable></View>;

  const assignee = members.find((member) => member.id === task.assigneeId) || null;
  const recurring = task.recurrence && task.recurrence !== 'Does not repeat';
  const completed = task.state === 'completed';
  const status = completed ? 'Completed' : task.due === 'Overdue' ? 'Overdue' : task.state === 'upcoming' ? 'Upcoming' : 'Open';
  const statusColor = completed ? '#62df67' : task.due === 'Overdue' ? '#ff6258' : ORANGE;

  const completeTask = () => {
    if (recurring) { onUpdate(nextOccurrence(task)); return; }
    onUpdate({ ...task, state: 'completed', due: 'Completed', priority: 'Done', icon: 'check-circle-outline', color: '#62df67', lastCompleted: 'Completed today' });
  };
  const reopenTask = () => onUpdate({ ...task, state: 'open', due: 'Due Today', priority: task.priority === 'Done' ? 'Medium' : task.priority, icon: task.originalIcon || 'clipboard-text-outline', color: ORANGE });

  return <View style={styles.screen}><StatusBar style="light" translucent backgroundColor="transparent" /><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.pageWrap}><View style={styles.page}>
    <View style={[styles.hero, compact && styles.heroCompact]}><Image source={TASKS_HERO_IMAGE} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="center" cachePolicy="memory-disk" /><LinearGradient colors={['rgba(2,7,9,0.22)', 'rgba(2,7,9,0.34)', 'rgba(2,7,9,0.92)', '#03090c']} locations={[0, 0.42, 0.82, 1]} style={StyleSheet.absoluteFill} /><SafeAreaView edges={['top']} style={styles.heroSafeArea}><View style={styles.heroHeader}><View style={styles.heroHeaderLeft}><HeaderButton icon="arrow-back" label="Back to tasks" onPress={onBack} /><Text style={styles.screenTitle}>Task Details</Text></View><HeaderButton icon="ellipsis-horizontal" label="Task options" onPress={() => Alert.alert('Task options', `More actions for ${task.title} will appear here.`)} /></View><View style={[styles.heroCopy, narrow && styles.heroCopyNarrow]}><View style={styles.heroMeta}><View style={styles.categoryBadge}><MaterialCommunityIcons name={task.icon || 'clipboard-text-outline'} size={15} color={ORANGE} /><Text style={styles.categoryText}>{task.category}</Text></View><View style={[styles.statusBadge, { borderColor: `${statusColor}55`, backgroundColor: `${statusColor}10` }]}><View style={[styles.statusDot, { backgroundColor: statusColor }]} /><Text style={[styles.statusText, { color: statusColor }]}>{status}</Text></View></View><Text numberOfLines={3} style={[styles.taskTitle, narrow && styles.taskTitleNarrow]}>{task.title}</Text><Text style={styles.taskId}>{formatTaskId(task.id)}</Text></View></SafeAreaView></View>
    <View style={[styles.content, narrow && styles.contentNarrow]}>
      <View style={styles.assigneePanel}>{assignee ? <Image source={assignee.image} style={styles.assigneeImage} contentFit="cover" cachePolicy="memory-disk" /> : <View style={styles.assigneePlaceholder}><MaterialCommunityIcons name="account-outline" size={27} color="#707c80" /></View>}<View style={styles.assigneeCopy}><Text style={styles.eyebrow}>ASSIGNED TO</Text><Text style={styles.assigneeName}>{assignee?.name || 'Unassigned'}</Text><Text style={styles.assigneeRole}>{assignee?.role || 'Assign a team member to this task'}</Text></View><Pressable onPress={() => Alert.alert('Change assignee', 'Assignee selection will open here.')} style={styles.changeButton}><Text style={styles.changeButtonText}>{assignee ? 'Change' : 'Assign'}</Text></Pressable></View>
      <View style={styles.factsPanel}><Fact icon="calendar-month-outline" value={task.due} label="Due" /><Fact icon="clock-outline" value={task.date} label="Schedule" /><Fact icon="flag-outline" value={task.priority} label="Priority" isLast /></View>
      <Text style={styles.sectionTitle}>Task Instructions</Text><View style={styles.descriptionPanel}><View style={styles.descriptionIcon}><MaterialCommunityIcons name="text-box-outline" size={22} color={ORANGE} /></View><Text style={styles.descriptionText}>{task.description}</Text></View>
      <Text style={styles.sectionTitle}>Task Information</Text><View style={styles.detailsPanel}><DetailRow icon="link-variant" label="Related Record" value={task.subject || 'No related record'} onPress={() => Alert.alert('Related record', task.subject || 'No related record')} /><DetailRow icon="repeat" label="Repeat Schedule" value={task.recurrence || 'Does not repeat'} /><DetailRow icon="bell-outline" label="Reminder" value={task.reminder === false ? 'Disabled' : 'Enabled before due time'} /><DetailRow icon="account-edit-outline" label="Created By" value={`${task.createdBy || 'Farm Manager'}${task.createdAt ? ` - ${task.createdAt}` : ''}`} isLast /></View>
      {recurring && <View style={styles.recurringPanel}><View style={styles.recurringIcon}><MaterialCommunityIcons name="repeat" size={23} color={ORANGE} /></View><View style={styles.recurringCopy}><Text style={styles.recurringTitle}>Recurring task</Text><Text style={styles.recurringText}>Completing this occurrence automatically schedules the next one.</Text></View><View style={styles.recurrenceBadge}><Text style={styles.recurrenceText}>{task.recurrence}</Text></View></View>}
      <Text style={styles.sectionTitle}>Activity</Text><View style={styles.activityPanel}><View style={styles.activityRow}><View style={styles.activityTrack}><View style={styles.activityIcon}><MaterialCommunityIcons name="clipboard-plus-outline" size={16} color={ORANGE} /></View><View style={styles.activityLine} /></View><View style={styles.activityCopy}><Text style={styles.activityTitle}>Task created by {task.createdBy || 'Farm Manager'}</Text><Text style={styles.activityText}>{task.createdAt || `Added to ${task.category} work`}</Text></View></View>{assignee && <View style={styles.activityRow}><View style={styles.activityTrack}><View style={styles.activityIcon}><MaterialCommunityIcons name="account-check-outline" size={16} color={ORANGE} /></View>{task.lastCompleted && <View style={styles.activityLine} />}</View><View style={styles.activityCopy}><Text style={styles.activityTitle}>Assigned to {assignee.name}</Text><Text style={styles.activityText}>{assignee.role}</Text></View></View>}{task.lastCompleted && <View style={styles.activityRow}><View style={styles.activityTrack}><View style={styles.activityIcon}><MaterialCommunityIcons name="check" size={16} color={ORANGE} /></View></View><View style={styles.activityCopy}><Text style={styles.activityTitle}>Previous occurrence completed</Text><Text style={styles.activityText}>{task.lastCompleted}</Text></View></View>}</View>
      <View style={styles.actions}><Pressable onPress={onEdit} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}><MaterialCommunityIcons name="pencil-outline" size={20} color={ORANGE} /><Text style={styles.secondaryText}>Edit Task</Text></Pressable><Pressable onPress={completed ? reopenTask : completeTask} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}><MaterialCommunityIcons name={completed ? 'restore' : 'check-circle-outline'} size={20} color="#fff" /><Text style={styles.primaryText}>{completed ? 'Reopen Task' : recurring ? 'Complete Today' : 'Mark Complete'}</Text></Pressable></View>
    </View></View></ScrollView></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#020709' }, pageWrap: { flexGrow: 1, alignItems: 'center', backgroundColor: '#020709' }, page: { width: '100%', maxWidth: 720, backgroundColor: '#020709' }, hero: { height: 315, overflow: 'hidden', backgroundColor: '#101719' }, heroCompact: { height: 285 }, heroSafeArea: { flex: 1 }, heroHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: Platform.OS === 'web' ? 10 : 3 }, heroHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 }, headerButton: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(190,204,208,0.35)', backgroundColor: 'rgba(2,8,11,0.65)', alignItems: 'center', justifyContent: 'center' }, screenTitle: { color: '#f1f3f3', fontSize: 17, fontWeight: '700' }, heroCopy: { marginTop: 'auto', paddingHorizontal: 18, paddingBottom: 27 }, heroCopyNarrow: { paddingHorizontal: 11, paddingBottom: 22 }, heroMeta: { flexDirection: 'row', alignItems: 'center', gap: 7 }, categoryBadge: { height: 28, paddingHorizontal: 9, borderWidth: 1, borderColor: '#67410f', borderRadius: 14, backgroundColor: 'rgba(255,122,0,0.07)', flexDirection: 'row', alignItems: 'center', gap: 5 }, categoryText: { color: '#e1a35a', fontSize: 8, fontWeight: '700' }, statusBadge: { height: 28, paddingHorizontal: 9, borderWidth: 1, borderRadius: 14, flexDirection: 'row', alignItems: 'center', gap: 5 }, statusDot: { width: 6, height: 6, borderRadius: 3 }, statusText: { fontSize: 8, fontWeight: '700' }, taskTitle: { marginTop: 10, color: '#f2f4f4', fontSize: 29, lineHeight: 35, fontWeight: '800', letterSpacing: 0 }, taskTitleNarrow: { fontSize: 24, lineHeight: 29 }, taskId: { marginTop: 5, color: '#849094', fontSize: 9 },
  content: { paddingHorizontal: 14, paddingTop: 14, paddingBottom: 30 }, contentNarrow: { paddingHorizontal: 9 }, assigneePanel: { minHeight: 78, padding: 10, borderWidth: 1, borderColor: '#2b393f', borderRadius: 8, backgroundColor: '#0a1317', flexDirection: 'row', alignItems: 'center', gap: 10 }, assigneeImage: { width: 54, height: 54, borderRadius: 27, borderWidth: 1, borderColor: '#68430f' }, assigneePlaceholder: { width: 54, height: 54, borderRadius: 27, borderWidth: 1, borderColor: '#354248', alignItems: 'center', justifyContent: 'center' }, assigneeCopy: { flex: 1, minWidth: 0 }, eyebrow: { color: ORANGE, fontSize: 7, fontWeight: '800' }, assigneeName: { marginTop: 4, color: '#e8ebec', fontSize: 13, fontWeight: '800' }, assigneeRole: { marginTop: 3, color: '#849094', fontSize: 8 }, changeButton: { height: 32, paddingHorizontal: 10, borderWidth: 1, borderColor: '#69410e', borderRadius: 7, alignItems: 'center', justifyContent: 'center' }, changeButtonText: { color: ORANGE, fontSize: 9, fontWeight: '700' },
  factsPanel: { minHeight: 105, marginTop: 10, marginBottom: 18, paddingVertical: 12, borderWidth: 1, borderColor: '#28353a', borderRadius: 8, backgroundColor: '#0a1317', flexDirection: 'row' }, fact: { flex: 1, minWidth: 0, paddingHorizontal: 6, alignItems: 'center', justifyContent: 'center' }, factDivider: { borderRightWidth: 1, borderRightColor: '#26343a' }, factIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,122,0,0.07)', alignItems: 'center', justifyContent: 'center' }, factValue: { marginTop: 5, color: '#eef1f2', fontSize: 10, fontWeight: '800', textAlign: 'center' }, factLabel: { marginTop: 3, color: '#7e898d', fontSize: 8, textAlign: 'center' }, sectionTitle: { color: '#e7eaeb', fontSize: 14, fontWeight: '700', marginBottom: 8 }, descriptionPanel: { minHeight: 72, marginBottom: 18, padding: 11, borderWidth: 1, borderColor: '#28353a', borderRadius: 8, backgroundColor: '#0a1317', flexDirection: 'row', alignItems: 'flex-start', gap: 10 }, descriptionIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,122,0,0.07)', alignItems: 'center', justifyContent: 'center' }, descriptionText: { flex: 1, color: '#a1abad', fontSize: 10, lineHeight: 16 },
  detailsPanel: { marginBottom: 10, borderWidth: 1, borderColor: '#28353a', borderRadius: 8, backgroundColor: '#0a1317', overflow: 'hidden' }, detailRow: { minHeight: 62, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 10 }, rowDivider: { borderBottomWidth: 1, borderBottomColor: '#223037' }, rowPressed: { backgroundColor: '#111d22' }, rowIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,122,0,0.07)', alignItems: 'center', justifyContent: 'center' }, rowCopy: { flex: 1, minWidth: 0 }, rowLabel: { color: '#dfe3e4', fontSize: 10, fontWeight: '700' }, rowValue: { marginTop: 3, color: '#7e8a8e', fontSize: 8 }, recurringPanel: { minHeight: 72, marginBottom: 18, padding: 10, borderWidth: 1, borderColor: '#603c0e', borderRadius: 8, backgroundColor: 'rgba(255,122,0,0.05)', flexDirection: 'row', alignItems: 'center', gap: 10 }, recurringIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,122,0,0.1)', alignItems: 'center', justifyContent: 'center' }, recurringCopy: { flex: 1, minWidth: 0 }, recurringTitle: { color: '#e8ebec', fontSize: 10, fontWeight: '700' }, recurringText: { marginTop: 3, color: '#849094', fontSize: 8, lineHeight: 11 }, recurrenceBadge: { paddingHorizontal: 8, paddingVertical: 5, borderWidth: 1, borderColor: '#6d440e', borderRadius: 11 }, recurrenceText: { color: ORANGE, fontSize: 8, fontWeight: '700' },
  activityPanel: { marginBottom: 14, padding: 11, borderWidth: 1, borderColor: '#28353a', borderRadius: 8, backgroundColor: '#0a1317' }, activityRow: { minHeight: 53, flexDirection: 'row', gap: 10 }, activityTrack: { width: 31, alignItems: 'center' }, activityIcon: { width: 29, height: 29, borderRadius: 15, borderWidth: 1, borderColor: '#543712', backgroundColor: 'rgba(255,122,0,0.06)', alignItems: 'center', justifyContent: 'center' }, activityLine: { flex: 1, width: 1, backgroundColor: '#344146' }, activityCopy: { flex: 1, paddingTop: 2 }, activityTitle: { color: '#dfe3e4', fontSize: 10, fontWeight: '600' }, activityText: { marginTop: 4, color: '#7f8a8e', fontSize: 8 },
  actions: { flexDirection: 'row', gap: 8 }, secondaryButton: { flex: 0.85, height: 50, borderWidth: 1, borderColor: '#68400e', borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 }, secondaryText: { color: ORANGE, fontSize: 10, fontWeight: '700' }, primaryButton: { flex: 1.15, height: 50, paddingHorizontal: 8, borderRadius: 8, backgroundColor: '#f66f00', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 }, primaryText: { color: '#fff', fontSize: 10, fontWeight: '700' }, pressed: { opacity: 0.72 }, missingScreen: { flex: 1, padding: 24, backgroundColor: '#020709', alignItems: 'center', justifyContent: 'center' }, missingTitle: { marginTop: 12, color: '#d8ddde', fontSize: 17, fontWeight: '700' }, missingButton: { height: 44, marginTop: 18, paddingHorizontal: 18, borderRadius: 8, backgroundColor: '#f66f00', alignItems: 'center', justifyContent: 'center' }, missingButtonText: { color: '#fff', fontSize: 12, fontWeight: '700' },
});

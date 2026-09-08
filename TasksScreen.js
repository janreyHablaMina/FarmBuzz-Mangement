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

const TASK_SUMMARY = [
  { icon: 'clock-alert-outline', value: '5', label: 'Overdue', color: '#ff3b3b', tint: 'rgba(200, 40, 40, 0.13)' },
  { icon: 'calendar-month-outline', value: '8', label: 'Due Today', color: '#ff9a00', tint: 'rgba(190, 110, 20, 0.12)' },
  { icon: 'calendar-outline', value: '12', label: 'Upcoming', color: '#3294ff', tint: 'rgba(35, 105, 210, 0.13)' },
];

const FILTERS = [
  { id: 'open', label: 'Open', icon: 'circle-outline' },
  { id: 'upcoming', label: 'Upcoming', icon: 'calendar-month-outline' },
  { id: 'completed', label: 'Completed', icon: 'check-circle-outline' },
];

const TASKS = [
  {
    id: 'task-treatment', state: 'open', icon: 'clock-alert-outline', color: '#ff3b3b',
    title: "Check Blade's treatment", description: 'Review the current treatment and observe recovery progress.',
    subject: 'Blade 008', category: 'Treatment', due: 'Overdue', date: 'May 15, 9:00 AM', priority: 'High',
    assigneeId: 'ana-cruz', assigneeName: 'Ana Cruz', recurrence: 'Every day', reminder: true,
    createdBy: 'Maria Santos', createdAt: 'May 12, 2024, 2:30 PM', originalIcon: 'medical-bag',
  },
  {
    id: 'task-candling', state: 'open', icon: 'calendar-month-outline', color: '#ff9a00',
    title: 'Candle Batch B-021', description: 'Perform candling on day 14 of incubation.',
    subject: 'Batch B-021', category: 'Incubation', due: 'Due Today', date: 'May 18, 4:00 PM', priority: 'High',
    assigneeId: 'liza-manalo', assigneeName: 'Liza Manalo', recurrence: 'Does not repeat', reminder: true,
    createdBy: 'Carlo Reyes', createdAt: 'May 4, 2024, 10:15 AM', originalIcon: 'calendar-month-outline',
  },
  {
    id: 'task-feed', state: 'open', icon: 'food-variant', color: '#ff9a00',
    title: 'Refill feed containers', description: 'Check and refill all feed containers in Pen 3 and Pen 4.',
    subject: 'Pen 3, Pen 4', category: 'General', due: 'Due Today', date: 'May 18, 6:00 PM', priority: 'Medium',
    assigneeId: 'joel-dizon', assigneeName: 'Joel Dizon', recurrence: 'Every day', reminder: true,
    createdBy: 'Maria Santos', createdAt: 'May 1, 2024, 8:00 AM', originalIcon: 'food-variant',
  },
  {
    id: 'task-eggs', state: 'upcoming', icon: 'calendar-month-outline', color: '#ff9a00',
    title: 'Collect eggs', description: 'Collect eggs from Razor x Ruby pairing.',
    subject: 'Razor x Ruby', category: 'Breeding Pair', due: 'Tomorrow', date: 'May 19, 8:00 AM', priority: 'Medium',
    assigneeId: 'liza-manalo', assigneeName: 'Liza Manalo', recurrence: 'Every day', reminder: true,
    createdBy: 'Carlo Reyes', createdAt: 'May 10, 2024, 11:20 AM', originalIcon: 'calendar-month-outline',
  },
  {
    id: 'task-photos', state: 'upcoming', icon: 'camera-outline', color: '#ff9a00',
    title: 'Take new bird photos', description: 'Update profile photos for new birds.',
    subject: 'Multiple Birds', category: 'General', due: 'May 20, 2024', date: '10:00 AM', priority: 'Low',
    assigneeId: 'mark-villanueva', assigneeName: 'Mark Villanueva', recurrence: 'Does not repeat', reminder: false,
    createdBy: 'Maria Santos', createdAt: 'May 17, 2024, 4:45 PM', originalIcon: 'camera-outline',
  },
  {
    id: 'task-clean', state: 'completed', icon: 'check-circle-outline', color: '#45c86b',
    title: 'Clean brooder area', description: 'Sanitized bedding, feeders and waterers.',
    subject: 'Brooder 2', category: 'Cleaning', due: 'Completed', date: 'May 17, 3:30 PM', priority: 'Done',
    assigneeId: 'mark-villanueva', assigneeName: 'Mark Villanueva', recurrence: 'Every week', reminder: true,
    createdBy: 'Joel Dizon', createdAt: 'May 10, 2024, 7:30 AM', lastCompleted: 'May 17, 2024, 3:30 PM', originalIcon: 'broom',
  },
  {
    id: 'task-record', state: 'completed', icon: 'check-circle-outline', color: '#45c86b',
    title: 'Record morning weights', description: 'Updated growth records for the Hatch group.',
    subject: 'Hatch Group', category: 'Records', due: 'Completed', date: 'May 17, 9:15 AM', priority: 'Done',
    assigneeId: 'joel-dizon', assigneeName: 'Joel Dizon', recurrence: 'Every day', reminder: true,
    createdBy: 'Maria Santos', createdAt: 'May 1, 2024, 6:20 AM', lastCompleted: 'May 17, 2024, 9:15 AM', originalIcon: 'file-document-outline',
  },
];

function HeaderButton({ onPress }) {
  return (
    <Pressable
      accessibilityLabel="Back to management"
      onPress={onPress}
      style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}
    >
      <Ionicons name="arrow-back" size={21} color="#eef1f2" />
    </Pressable>
  );
}

function SummaryCard({ item, narrow }) {
  return (
    <View style={[styles.summaryCard, narrow && styles.summaryCardNarrow]}>
      <View style={styles.summaryValueRow}>
        <MaterialCommunityIcons name={item.icon} size={narrow ? 25 : 29} color={item.color} />
        <Text style={[styles.summaryValue, narrow && styles.summaryValueNarrow]}>{item.value}</Text>
      </View>
      <Text numberOfLines={1} style={styles.summaryName}>{item.label}</Text>
      <Text style={styles.summaryLabel}>Tasks</Text>
    </View>
  );
}

function FilterButton({ item, active, onPress, narrow }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.filterButton,
        narrow && styles.filterButtonNarrow,
        active && styles.filterButtonActive,
        pressed && styles.pressed,
      ]}
    >
      <MaterialCommunityIcons name={item.icon} size={16} color={active ? '#ff8a00' : '#899397'} />
      <Text style={[styles.filterText, active && styles.filterTextActive]}>{item.label}</Text>
    </Pressable>
  );
}

function MetaTag({ icon, label }) {
  return (
    <View style={styles.metaTag}>
      {!!icon && <MaterialCommunityIcons name={icon} size={13} color="#899397" />}
      <Text numberOfLines={1} style={styles.metaTagText}>{label}</Text>
    </View>
  );
}

function TaskCard({ task, narrow, onPress }) {
  const dueColor = task.due === 'Overdue'
    ? '#ff4040'
    : task.due === 'Completed'
      ? '#45c86b'
      : task.due === 'Tomorrow' || task.due.startsWith('May 20')
        ? '#3ca5ff'
        : '#ff9a00';
  return (
    <Pressable
      accessibilityLabel={`Open task ${task.title}`}
      onPress={onPress}
      style={({ pressed }) => [styles.taskCard, narrow && styles.taskCardNarrow, pressed && styles.cardPressed]}
    >
      <View style={[styles.taskIcon, narrow && styles.taskIconNarrow, { backgroundColor: `${task.color}12` }]}>
        <MaterialCommunityIcons name={task.icon} size={narrow ? 20 : 22} color={task.color} />
      </View>
      <View style={styles.taskMain}>
        <Text numberOfLines={2} style={styles.taskTitle}>{task.title}</Text>
        <View style={styles.taskContext}>
          <MaterialCommunityIcons name="link-variant" size={12} color="#78868a" />
          <Text numberOfLines={1} style={styles.taskContextText}>{task.subject || 'General task'}</Text>
        </View>
        <View style={styles.taskTags}>
          <MetaTag icon="bird" label={task.subject} />
          <Text style={styles.tagDot}>•</Text>
          <MetaTag label={task.category} />
          {task.recurrence && task.recurrence !== 'Does not repeat' && (
            <>
              <Text style={styles.tagDot}>-</Text>
              <MetaTag icon="repeat" label={task.recurrence} />
            </>
          )}
        </View>
      </View>
      <View style={[styles.taskSchedule, narrow && styles.taskScheduleNarrow]}>
        <Text numberOfLines={2} style={[styles.taskDue, { color: dueColor }]}>{task.due}</Text>
        <Text numberOfLines={2} style={styles.taskDate}>{task.date}</Text>
      </View>
    </Pressable>
  );
}

export default function TasksScreen({ onBack, onAddTask, onOpenTask, addedTasks = [], taskOverrides = {} }) {
  const { width } = useWindowDimensions();
  const compact = width < 480;
  const narrow = width < 390;
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('open');
  const effectiveAddedTasks = useMemo(() => addedTasks.map((task) => taskOverrides[task.id] || task), [addedTasks, taskOverrides]);
  const allTasks = useMemo(() => [...effectiveAddedTasks, ...TASKS.map((task) => taskOverrides[task.id] || task)], [effectiveAddedTasks, taskOverrides]);
  const summaryItems = useMemo(() => TASK_SUMMARY.map((item, index) => {
    const addedCount = index === 0
      ? effectiveAddedTasks.filter((task) => task.due === 'Overdue').length
      : index === 1
        ? effectiveAddedTasks.filter((task) => task.due === 'Due Today').length
        : effectiveAddedTasks.filter((task) => task.state === 'upcoming').length;
    return { ...item, value: String(Number.parseInt(item.value, 10) + addedCount) };
  }), [effectiveAddedTasks]);

  const visibleTasks = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return allTasks.filter((task) => {
      const matchesFilter = filter === 'open'
        ? task.state === 'open' || task.state === 'upcoming'
        : task.state === filter;
      const matchesQuery = `${task.title} ${task.description} ${task.subject} ${task.category}`
        .toLowerCase()
        .includes(normalized);
      return matchesFilter && matchesQuery;
    });
  }, [allTasks, filter, query]);

  return (
    <View style={styles.screen}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.pageWrap}>
        <View style={styles.page}>
          <View style={[styles.hero, compact && styles.heroCompact]}>
            <Image
              source={TASKS_HERO_IMAGE}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              contentPosition="center"
              cachePolicy="memory-disk"
            />
            <LinearGradient
              colors={['rgba(2, 7, 9, 0.24)', 'rgba(2, 7, 9, 0.12)', '#040a0d']}
              locations={[0, 0.43, 1]}
              style={StyleSheet.absoluteFill}
            />
            <SafeAreaView edges={['top']} style={styles.heroSafeArea}>
              <View style={styles.heroHeader}>
                <HeaderButton onPress={onBack} />
                <Text style={styles.screenTitle}>Tasks</Text>
              </View>
              <View style={[styles.heroCopy, narrow && styles.heroCopyNarrow]}>
                <Text style={[styles.farmName, narrow && styles.farmNameNarrow]}>FarmBuzz Farm</Text>
                <Text style={styles.farmTagline}>Raising quality gamefowl with strong bloodlines.</Text>
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
                  placeholder="Search tasks, birds, batches..."
                  placeholderTextColor="#879195"
                  selectionColor="#ff7900"
                  style={styles.searchInput}
                />
                {!!query && (
                  <Pressable accessibilityLabel="Clear search" onPress={() => setQuery('')} hitSlop={8}>
                    <Ionicons name="close-circle" size={18} color="#6c777b" />
                  </Pressable>
                )}
              </View>
              <Pressable
                onPress={onAddTask}
                accessibilityLabel="Add task"
                style={({ pressed }) => [styles.addButton, compact && styles.addButtonCompact, pressed && styles.pressed]}
              >
                <Ionicons name="add" size={27} color="#fff" />
                {!compact && <Text style={styles.addButtonText}>Add Task</Text>}
              </Pressable>
            </View>

            <View style={styles.summaryGrid}>
              {summaryItems.map((item) => <SummaryCard key={item.label} item={item} narrow={narrow} />)}
            </View>

            <View style={styles.filters}>
              {FILTERS.map((item) => (
                <FilterButton
                  key={item.id}
                  item={item}
                  active={filter === item.id}
                  narrow={narrow}
                  onPress={() => setFilter(item.id)}
                />
              ))}
            </View>

            <Text style={styles.listLabel}>TASKS ({visibleTasks.length})</Text>
            <View style={styles.taskList}>
              {visibleTasks.map((task) => <TaskCard key={task.id} task={task} narrow={narrow} onPress={() => onOpenTask(task)} />)}
              {!visibleTasks.length && (
                <View style={styles.emptyState}>
                  <MaterialCommunityIcons name="clipboard-check-outline" size={34} color="#5f6a6e" />
                  <Text style={styles.emptyText}>No tasks found</Text>
                </View>
              )}
            </View>
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
  hero: { height: 245, overflow: 'hidden', backgroundColor: '#101719' },
  heroCompact: { height: 240 },
  heroSafeArea: { flex: 1 },
  heroHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 13,
    paddingHorizontal: 16, paddingTop: Platform.OS === 'web' ? 10 : 3,
  },
  headerButton: {
    width: 40, height: 40, borderRadius: 20, borderWidth: 1,
    borderColor: 'rgba(190, 204, 208, 0.35)', backgroundColor: 'rgba(2, 8, 11, 0.65)',
    alignItems: 'center', justifyContent: 'center',
  },
  screenTitle: { color: '#f0f2f3', fontSize: 17, fontWeight: '700', letterSpacing: 0 },
  heroCopy: { marginTop: 'auto', maxWidth: 450, paddingHorizontal: 18, paddingBottom: 22 },
  heroCopyNarrow: { maxWidth: 330, paddingHorizontal: 12, paddingBottom: 17 },
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
  content: { paddingHorizontal: 14, paddingBottom: 20 },
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
    height: 52, minWidth: 140, paddingHorizontal: 20, borderRadius: 8,
    backgroundColor: '#d94b0b', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9,
  },
  addButtonCompact: { width: 52, minWidth: 52, paddingHorizontal: 0 },
  addButtonText: { color: '#fff', fontSize: 14, fontWeight: '700', letterSpacing: 0 },
  summaryGrid: { marginTop: 14, flexDirection: 'row', gap: 10 },
  summaryCard: {
    flex: 1, minWidth: 0, height: 112, paddingHorizontal: 5, borderRadius: 8,
    borderWidth: 1, borderColor: '#1c2a30', backgroundColor: '#0b1418',
    alignItems: 'center', justifyContent: 'center',
  },
  summaryCardNarrow: {
    height: 104,
  },
  summaryIcon: { width: 45, height: 45, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  summaryIconNarrow: { width: 34, height: 34, borderRadius: 17 },
  summaryNarrowValueRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  summaryCopy: { flex: 1, minWidth: 0 },
  summaryValueRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  summaryName: { marginTop: 8, color: '#d4d9db', fontSize: 12, fontWeight: '400', textAlign: 'center', letterSpacing: 0 },
  summaryValue: { color: '#f0f2f3', fontSize: 27, lineHeight: 30, fontWeight: '600', letterSpacing: 0 },
  summaryValueNarrow: { fontSize: 23, lineHeight: 26 },
  summaryLabel: { marginTop: 4, color: '#899397', fontSize: 10, textAlign: 'center', letterSpacing: 0 },
  filters: { marginTop: 13, flexDirection: 'row', gap: 8 },
  filterButton: {
    minHeight: 34, paddingHorizontal: 13, borderRadius: 8, borderWidth: 1,
    borderColor: '#202b30', backgroundColor: '#0b1418', flexDirection: 'row', alignItems: 'center', gap: 7,
  },
  filterButtonNarrow: { flex: 1, minWidth: 0, justifyContent: 'center', paddingHorizontal: 5, gap: 5 },
  filterButtonActive: { borderColor: '#d46b00', backgroundColor: 'rgba(110, 56, 0, 0.12)' },
  filterText: { color: '#939da0', fontSize: 11, letterSpacing: 0 },
  filterTextActive: { color: '#ff9a00' },
  listLabel: { marginTop: 14, marginBottom: 7, color: '#8d979a', fontSize: 11, fontWeight: '600', letterSpacing: 0 },
  taskList: { gap: 6 },
  taskCard: {
    minHeight: 78, paddingHorizontal: 11, paddingVertical: 9, borderRadius: 8, borderWidth: 1, borderColor: '#18262c',
    backgroundColor: '#0a1317', flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  taskCardNarrow: { minHeight: 74, paddingHorizontal: 8, gap: 7 },
  taskIcon: { width: 38, height: 38, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  taskIconNarrow: { width: 34, height: 34, borderRadius: 7 },
  taskMain: { flex: 1, minWidth: 0 },
  taskTitle: { color: '#e9eced', fontSize: 13, lineHeight: 17, fontWeight: '600', letterSpacing: 0 },
  taskContext: { marginTop: 6, flexDirection: 'row', alignItems: 'center', gap: 4 },
  taskContextText: { flex: 1, minWidth: 0, color: '#859195', fontSize: 9, letterSpacing: 0 },
  taskTags: { display: 'none' },
  metaTag: {
    maxWidth: '46%', minHeight: 24, paddingHorizontal: 7, borderRadius: 6, borderWidth: 1,
    borderColor: '#1b292e', flexDirection: 'row', alignItems: 'center', gap: 4,
  },
  metaTagText: { color: '#929c9f', fontSize: 9, letterSpacing: 0 },
  tagDot: { color: '#657074', fontSize: 9 },
  taskSchedule: { width: 112, alignSelf: 'stretch', alignItems: 'flex-end', justifyContent: 'center', gap: 5 },
  taskScheduleNarrow: { width: 78 },
  taskDue: { fontSize: 9, lineHeight: 12, fontWeight: '600', textAlign: 'right', letterSpacing: 0 },
  taskDate: { color: '#879397', fontSize: 8, lineHeight: 11, textAlign: 'right', letterSpacing: 0 },
  emptyState: { height: 190, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyText: { color: '#7f8a8e', fontSize: 12, letterSpacing: 0 },
  pressed: { opacity: 0.72 },
  cardPressed: { opacity: 0.76, transform: [{ scale: 0.995 }] },
});

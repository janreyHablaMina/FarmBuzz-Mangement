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
import { HOLDING_GROUPS } from './farmData';

const HERO_IMAGE = require('./assets/eggs-incubation-hero.png');
const ORANGE = '#ff7a00';
const READY_GROUPS = HOLDING_GROUPS.filter((group) => group.status === 'Ready to set');

function HeaderButton({ onPress }) {
  return (
    <Pressable
      accessibilityLabel="Back"
      onPress={onPress}
      style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}
    >
      <Ionicons name="arrow-back" size={21} color="#eef1f2" />
    </Pressable>
  );
}

function SelectionRow({ group, selected, onToggle, isLast }) {
  const available = group.status === 'Ready to set';

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected, disabled: !available }}
      accessibilityLabel={`${group.male} and ${group.female}, ${group.eggCount} eggs`}
      disabled={!available}
      onPress={onToggle}
      style={({ pressed }) => [
        styles.selectionRow,
        !isLast && styles.rowDivider,
        !available && styles.selectionRowDisabled,
        pressed && styles.rowPressed,
      ]}
    >
      <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
        {selected && <Ionicons name="checkmark" size={17} color="#fff" />}
      </View>
      <View style={styles.selectionCopy}>
        <Text numberOfLines={1} style={[styles.pairName, !available && styles.disabledText]}>
          {group.male} x {group.female}
        </Text>
        <Text style={styles.pairMeta}>{group.eggCount} eggs  -  oldest {group.oldestDays} days</Text>
      </View>
      <Text style={[styles.availability, available ? styles.readyText : styles.holdingText]}>
        {available ? 'Ready' : 'Holding'}
      </Text>
    </Pressable>
  );
}

function IncubatorDropdown({ value, onChange }) {
  const [options, setOptions] = useState(['Incubator 1', 'Incubator 2']);
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');

  const selectOption = (option) => {
    onChange(option);
    setOpen(false);
    setAdding(false);
    setNewName('');
  };

  const addIncubator = () => {
    const name = newName.trim();
    if (!name) {
      Alert.alert('Name required', 'Enter a name for the incubator.');
      return;
    }
    if (options.some((option) => option.toLowerCase() === name.toLowerCase())) {
      Alert.alert('Incubator already exists', 'Choose the existing incubator or enter a different name.');
      return;
    }

    setOptions((current) => [...current, name]);
    selectOption(name);
  };

  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>Incubator</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={`Selected incubator: ${value}`}
        onPress={() => setOpen((current) => !current)}
        style={({ pressed }) => [styles.dropdownTrigger, pressed && styles.pressed]}
      >
        <MaterialCommunityIcons name="thermometer" size={22} color={ORANGE} />
        <Text style={styles.dropdownValue}>{value}</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={19} color="#9ca6a9" />
      </Pressable>

      {open && (
        <View style={styles.dropdownMenu}>
          {options.map((option) => {
            const selected = option === value;
            return (
              <Pressable
                key={option}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                onPress={() => selectOption(option)}
                style={({ pressed }) => [styles.dropdownOption, pressed && styles.rowPressed]}
              >
                <Text style={[styles.dropdownOptionText, selected && styles.dropdownOptionSelected]}>
                  {option}
                </Text>
                {selected && <Ionicons name="checkmark" size={19} color={ORANGE} />}
              </Pressable>
            );
          })}

          {!adding ? (
            <Pressable
              onPress={() => setAdding(true)}
              style={({ pressed }) => [styles.addIncubatorOption, pressed && styles.rowPressed]}
            >
              <Ionicons name="add-circle-outline" size={20} color={ORANGE} />
              <Text style={styles.addIncubatorText}>Add Incubator</Text>
            </Pressable>
          ) : (
            <View style={styles.addIncubatorForm}>
              <TextInput
                value={newName}
                onChangeText={setNewName}
                autoFocus
                placeholder="Incubator name"
                placeholderTextColor="#758084"
                selectionColor={ORANGE}
                onSubmitEditing={addIncubator}
                style={styles.addIncubatorInput}
              />
              <Pressable
                accessibilityLabel="Cancel adding incubator"
                onPress={() => {
                  setAdding(false);
                  setNewName('');
                }}
                style={({ pressed }) => [styles.smallIconButton, pressed && styles.pressed]}
              >
                <Ionicons name="close" size={19} color="#aab3b6" />
              </Pressable>
              <Pressable
                accessibilityLabel="Add incubator"
                onPress={addIncubator}
                style={({ pressed }) => [styles.confirmAddButton, pressed && styles.pressed]}
              >
                <Ionicons name="checkmark" size={19} color="#fff" />
              </Pressable>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

function normalizeDate(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  }).format(date);
}

function DatePickerField({ value, onChange }) {
  const today = normalizeDate(new Date());
  const [open, setOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(value.getFullYear(), value.getMonth(), 1),
  );
  const firstWeekday = visibleMonth.getDay();
  const daysInMonth = new Date(
    visibleMonth.getFullYear(),
    visibleMonth.getMonth() + 1,
    0,
  ).getDate();
  const calendarCells = [
    ...Array.from({ length: firstWeekday }, (_, index) => ({ key: `empty-${index}` })),
    ...Array.from({ length: daysInMonth }, (_, index) => {
      const date = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), index + 1);
      return { key: date.toISOString(), date };
    }),
  ];
  const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const canGoBack = visibleMonth.getTime() > currentMonth.getTime();

  const moveMonth = (offset) => {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  };

  const selectDate = (date) => {
    onChange(date);
    setOpen(false);
  };

  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>Start Date</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={`Start date: ${formatDate(value)}`}
        onPress={() => setOpen((current) => !current)}
        style={({ pressed }) => [styles.dateTrigger, pressed && styles.pressed]}
      >
        <MaterialCommunityIcons name="calendar-month-outline" size={22} color={ORANGE} />
        <Text style={styles.dateValue}>{formatDate(value)}</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={19} color="#9ca6a9" />
      </Pressable>

      {open && (
        <View style={styles.calendarPanel}>
          <View style={styles.calendarHeader}>
            <Pressable
              accessibilityLabel="Previous month"
              disabled={!canGoBack}
              onPress={() => moveMonth(-1)}
              style={({ pressed }) => [
                styles.calendarNavButton,
                !canGoBack && styles.calendarNavDisabled,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons name="chevron-back" size={19} color="#c5ccce" />
            </Pressable>
            <Text style={styles.calendarMonth}>
              {new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(visibleMonth)}
            </Text>
            <Pressable
              accessibilityLabel="Next month"
              onPress={() => moveMonth(1)}
              style={({ pressed }) => [styles.calendarNavButton, pressed && styles.pressed]}
            >
              <Ionicons name="chevron-forward" size={19} color="#c5ccce" />
            </Pressable>
          </View>

          <View style={styles.weekdayRow}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
              <Text key={`${day}-${index}`} style={styles.weekdayText}>{day}</Text>
            ))}
          </View>
          <View style={styles.calendarGrid}>
            {calendarCells.map((cell) => {
              if (!cell.date) return <View key={cell.key} style={styles.dayCell} />;

              const disabled = cell.date.getTime() < today.getTime();
              const selected = cell.date.getTime() === value.getTime();
              const isToday = cell.date.getTime() === today.getTime();
              return (
                <View key={cell.key} style={styles.dayCell}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected, disabled }}
                    accessibilityLabel={formatDate(cell.date)}
                    disabled={disabled}
                    onPress={() => selectDate(cell.date)}
                    style={({ pressed }) => [
                      styles.dayButton,
                      isToday && styles.todayButton,
                      selected && styles.selectedDayButton,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={[
                      styles.dayText,
                      disabled && styles.disabledDayText,
                      selected && styles.selectedDayText,
                    ]}>
                      {cell.date.getDate()}
                    </Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}

function formatExpectedHatch(startDate) {
  const date = new Date(startDate);
  date.setDate(date.getDate() + 21);
  return formatDate(date);
}

export default function CreateBatchScreen({ onBack, onComplete }) {
  const { width } = useWindowDimensions();
  const compact = width < 480;
  const narrow = width < 390;
  const [batchId, setBatchId] = useState('B-003');
  const [selectedIds, setSelectedIds] = useState(() => READY_GROUPS.map((group) => group.id));
  const [incubator, setIncubator] = useState('Incubator 1');
  const [startDate, setStartDate] = useState(() => normalizeDate(new Date()));
  const [notes, setNotes] = useState('');

  const selectedGroups = useMemo(
    () => HOLDING_GROUPS.filter((group) => selectedIds.includes(group.id)),
    [selectedIds],
  );
  const selectedEggs = selectedGroups.reduce((total, group) => total + group.eggCount, 0);
  const expectedHatch = formatExpectedHatch(startDate);

  const toggleGroup = (id) => {
    setSelectedIds((current) => current.includes(id)
      ? current.filter((selectedId) => selectedId !== id)
      : [...current, id]);
  };

  const createBatch = () => {
    if (!batchId.trim()) {
      Alert.alert('Batch ID required', 'Enter a batch ID before continuing.');
      return;
    }
    if (!selectedEggs) {
      Alert.alert('Select eggs', 'Choose at least one ready holding group.');
      return;
    }

    Alert.alert(
      'Create incubation batch?',
      `${batchId.trim()} will start on ${formatDate(startDate)} with ${selectedEggs} eggs in ${incubator}.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Create Batch', onPress: onComplete },
      ],
    );
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.pageWrap}
      >
        <View style={styles.page}>
          <View style={[styles.hero, compact && styles.heroCompact]}>
            <Image
              source={HERO_IMAGE}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              contentPosition="center"
              cachePolicy="memory-disk"
            />
            <LinearGradient
              colors={['rgba(1, 5, 7, 0.2)', 'rgba(1, 5, 7, 0.08)', '#03090c']}
              locations={[0, 0.46, 1]}
              style={StyleSheet.absoluteFill}
            />
            <SafeAreaView edges={['top']} style={styles.heroSafeArea}>
              <View style={styles.heroHeader}>
                <HeaderButton onPress={onBack} />
                <Text style={styles.screenTitle}>Create Batch</Text>
              </View>
              <View style={[styles.heroCopy, narrow && styles.heroCopyNarrow]}>
                <Text style={[styles.farmName, narrow && styles.farmNameNarrow]}>FarmBuzz Farm</Text>
                <Text style={styles.farmTagline}>Move ready eggs into a new incubation batch.</Text>
              </View>
            </SafeAreaView>
          </View>

          <View style={[styles.content, narrow && styles.contentNarrow]}>
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>Batch ID</Text>
              <View style={styles.textField}>
                <MaterialCommunityIcons name="identifier" size={21} color={ORANGE} />
                <TextInput
                  value={batchId}
                  onChangeText={setBatchId}
                  autoCapitalize="characters"
                  placeholder="e.g. B-003"
                  placeholderTextColor="#758084"
                  selectionColor={ORANGE}
                  style={styles.textInput}
                />
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Select Ready Eggs</Text>
                <Text style={styles.sectionDetail}>Choose the holding groups for this batch.</Text>
              </View>
              <Text style={styles.selectedCount}>{selectedEggs} eggs</Text>
            </View>
            <View style={styles.selectionList}>
              {HOLDING_GROUPS.map((group, index) => (
                <SelectionRow
                  key={group.id}
                  group={group}
                  selected={selectedIds.includes(group.id)}
                  onToggle={() => toggleGroup(group.id)}
                  isLast={index === HOLDING_GROUPS.length - 1}
                />
              ))}
            </View>

            <IncubatorDropdown value={incubator} onChange={setIncubator} />
            <DatePickerField value={startDate} onChange={setStartDate} />

            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>Notes <Text style={styles.optionalText}>(optional)</Text></Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                placeholder="Add handling notes..."
                placeholderTextColor="#758084"
                selectionColor={ORANGE}
                style={styles.notesInput}
              />
            </View>

            <View style={styles.batchSummary}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{selectedEggs}</Text>
                <Text style={styles.summaryLabel}>Eggs</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{selectedGroups.length}</Text>
                <Text style={styles.summaryLabel}>Groups</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={[styles.summaryItem, styles.hatchSummary]}>
                <Text numberOfLines={1} style={styles.summaryValueSmall}>{expectedHatch}</Text>
                <Text style={styles.summaryLabel}>Expected Hatch</Text>
              </View>
            </View>

            <Pressable
              onPress={createBatch}
              style={({ pressed }) => [
                styles.createButton,
                !selectedEggs && styles.createButtonDisabled,
                pressed && styles.pressed,
              ]}
            >
              <MaterialCommunityIcons name="egg-outline" size={24} color="#fff" />
              <Text style={styles.createButtonText}>Create Batch</Text>
            </Pressable>
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
  hero: { height: 235, overflow: 'hidden', backgroundColor: '#101719' },
  heroCompact: { height: 224 },
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
  heroCopy: { marginTop: 'auto', paddingHorizontal: 18, paddingBottom: 23 },
  heroCopyNarrow: { paddingHorizontal: 12, paddingBottom: 18 },
  farmName: {
    color: '#f5f6f6', fontSize: 34, lineHeight: 40, fontWeight: '800', letterSpacing: 0,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', web: 'Georgia' }),
    textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 5,
  },
  farmNameNarrow: { fontSize: 29, lineHeight: 34 },
  farmTagline: { marginTop: 6, color: '#bac1c3', fontSize: 14, lineHeight: 20, letterSpacing: 0 },
  content: { paddingHorizontal: 10, paddingBottom: 22 },
  contentNarrow: { paddingHorizontal: 8 },
  fieldBlock: { marginTop: 18 },
  fieldLabel: { marginBottom: 7, color: '#dce1e2', fontSize: 13, fontWeight: '600', letterSpacing: 0 },
  optionalText: { color: '#7f898d', fontWeight: '400' },
  textField: {
    height: 50, paddingHorizontal: 14, borderRadius: 8, borderWidth: 1,
    borderColor: '#28343a', backgroundColor: '#0b1418', flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  textInput: { flex: 1, height: 48, paddingVertical: 0, color: '#e7ebec', fontSize: 14, letterSpacing: 0, outlineStyle: 'none' },
  sectionHeader: {
    marginTop: 22, marginBottom: 8, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12,
  },
  sectionTitle: { color: '#e5e9ea', fontSize: 16, fontWeight: '600', letterSpacing: 0 },
  sectionDetail: { marginTop: 3, color: '#818c90', fontSize: 10, letterSpacing: 0 },
  selectedCount: { color: ORANGE, fontSize: 13, fontWeight: '700', letterSpacing: 0 },
  selectionList: { borderRadius: 8, borderWidth: 1, borderColor: '#1c2a30', backgroundColor: '#0b1418', overflow: 'hidden' },
  selectionRow: { minHeight: 68, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 11 },
  selectionRowDisabled: { opacity: 0.52 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: '#1b292f' },
  checkbox: {
    width: 24, height: 24, borderRadius: 6, borderWidth: 1,
    borderColor: '#546064', backgroundColor: '#091115', alignItems: 'center', justifyContent: 'center',
  },
  checkboxSelected: { borderColor: ORANGE, backgroundColor: ORANGE },
  selectionCopy: { flex: 1, minWidth: 0 },
  pairName: { color: '#e9eced', fontSize: 13, fontWeight: '600', letterSpacing: 0 },
  disabledText: { color: '#a4adaf' },
  pairMeta: { marginTop: 4, color: '#899397', fontSize: 10, letterSpacing: 0 },
  availability: { minWidth: 46, fontSize: 10, fontWeight: '600', textAlign: 'right', letterSpacing: 0 },
  readyText: { color: ORANGE },
  holdingText: { color: '#919a9d' },
  dropdownTrigger: {
    height: 50, paddingHorizontal: 14, borderRadius: 8, borderWidth: 1,
    borderColor: '#28343a', backgroundColor: '#0b1418', flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  dropdownValue: { flex: 1, color: '#e7ebec', fontSize: 13, fontWeight: '600', letterSpacing: 0 },
  dropdownMenu: {
    marginTop: 5, borderRadius: 8, borderWidth: 1, borderColor: '#28343a',
    backgroundColor: '#0b1418', overflow: 'hidden',
  },
  dropdownOption: {
    minHeight: 46, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: '#1b292f',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10,
  },
  dropdownOptionText: { flex: 1, color: '#b9c0c2', fontSize: 12, letterSpacing: 0 },
  dropdownOptionSelected: { color: ORANGE, fontWeight: '700' },
  addIncubatorOption: {
    minHeight: 47, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 9,
  },
  addIncubatorText: { color: ORANGE, fontSize: 12, fontWeight: '600', letterSpacing: 0 },
  addIncubatorForm: {
    minHeight: 54, paddingHorizontal: 9, paddingVertical: 7, flexDirection: 'row', alignItems: 'center', gap: 7,
  },
  addIncubatorInput: {
    flex: 1, height: 40, paddingHorizontal: 11, borderRadius: 6, borderWidth: 1,
    borderColor: '#35434a', backgroundColor: '#071014', color: '#e7ebec', fontSize: 12,
    letterSpacing: 0, outlineStyle: 'none',
  },
  smallIconButton: {
    width: 38, height: 38, borderRadius: 6, borderWidth: 1, borderColor: '#35434a',
    alignItems: 'center', justifyContent: 'center',
  },
  confirmAddButton: {
    width: 38, height: 38, borderRadius: 6, backgroundColor: '#f66f00',
    alignItems: 'center', justifyContent: 'center',
  },
  dateTrigger: {
    height: 50, paddingHorizontal: 14, borderRadius: 8, borderWidth: 1,
    borderColor: '#28343a', backgroundColor: '#0b1418', flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  dateValue: { flex: 1, color: '#e7ebec', fontSize: 13, fontWeight: '600', letterSpacing: 0 },
  calendarPanel: {
    marginTop: 5, paddingHorizontal: 10, paddingTop: 9, paddingBottom: 12,
    borderRadius: 8, borderWidth: 1, borderColor: '#28343a', backgroundColor: '#0b1418',
  },
  calendarHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  calendarNavButton: {
    width: 36, height: 36, borderRadius: 6, alignItems: 'center', justifyContent: 'center',
  },
  calendarNavDisabled: { opacity: 0.25 },
  calendarMonth: { color: '#e6eaeb', fontSize: 13, fontWeight: '700', letterSpacing: 0 },
  weekdayRow: { marginTop: 5, flexDirection: 'row' },
  weekdayText: {
    width: '14.2857%', color: '#788387', fontSize: 10, fontWeight: '600',
    textAlign: 'center', letterSpacing: 0,
  },
  calendarGrid: { marginTop: 3, flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: '14.2857%', height: 38, alignItems: 'center', justifyContent: 'center' },
  dayButton: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  todayButton: { borderWidth: 1, borderColor: '#82501f' },
  selectedDayButton: { borderColor: ORANGE, backgroundColor: ORANGE },
  dayText: { color: '#cbd1d3', fontSize: 11, fontWeight: '500', letterSpacing: 0 },
  disabledDayText: { color: '#465156' },
  selectedDayText: { color: '#fff', fontWeight: '700' },
  notesInput: {
    minHeight: 82, paddingHorizontal: 13, paddingVertical: 11, borderRadius: 8, borderWidth: 1,
    borderColor: '#28343a', backgroundColor: '#0b1418', color: '#e7ebec', fontSize: 13,
    lineHeight: 18, letterSpacing: 0, outlineStyle: 'none',
  },
  batchSummary: {
    minHeight: 76, marginTop: 20, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1,
    borderColor: '#1c2a30', backgroundColor: '#0b1418', flexDirection: 'row', alignItems: 'center',
  },
  summaryItem: { flex: 1, minWidth: 0, alignItems: 'center' },
  hatchSummary: { flex: 1.5 },
  summaryValue: { color: '#f0f2f3', fontSize: 22, fontWeight: '700', letterSpacing: 0 },
  summaryValueSmall: { color: '#f0f2f3', fontSize: 13, fontWeight: '700', letterSpacing: 0 },
  summaryLabel: { marginTop: 4, color: '#899397', fontSize: 9, letterSpacing: 0 },
  summaryDivider: { width: 1, height: 36, backgroundColor: '#223036' },
  createButton: {
    minHeight: 52, marginTop: 11, paddingHorizontal: 18, borderRadius: 8,
    backgroundColor: '#f66f00', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9,
  },
  createButtonDisabled: { backgroundColor: '#75401a' },
  createButtonText: { color: '#fff', fontSize: 14, fontWeight: '700', letterSpacing: 0 },
  pressed: { opacity: 0.72 },
  rowPressed: { backgroundColor: '#101c21' },
});

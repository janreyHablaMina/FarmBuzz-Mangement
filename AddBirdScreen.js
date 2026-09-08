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
const TYPES = [
  { key: 'cock', label: 'Cock', icon: 'gender-male' },
  { key: 'hen', label: 'Hen', icon: 'gender-female' },
  { key: 'stag', label: 'Stag', icon: 'gender-male' },
  { key: 'pullet', label: 'Pullet', icon: 'gender-female' },
];
const TYPE_IMAGES = {
  cock: 'https://images.unsplash.com/photo-1730360037813-9777f13b88bb?auto=format&fit=crop&w=700&q=84',
  hen: 'https://images.unsplash.com/photo-1770221499235-11dd1041e181?auto=format&fit=crop&w=700&q=84',
  stag: 'https://images.unsplash.com/photo-1551127501-d4385c7484b4?auto=format&fit=crop&w=700&q=84',
  pullet: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=700&q=84',
};

function HeaderButton({ onPress }) {
  return (
    <Pressable
      accessibilityLabel="Back to flock"
      onPress={onPress}
      style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}
    >
      <Ionicons name="arrow-back" size={21} color="#eef1f2" />
    </Pressable>
  );
}

function BirdTypeSelector({ value, onChange, compact }) {
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>Bird Type</Text>
      <View style={[styles.typeGrid, compact && styles.typeGridCompact]}>
        {TYPES.map((type) => {
          const selected = value === type.key;
          return (
            <Pressable
              key={type.key}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              onPress={() => onChange(type.key)}
              style={({ pressed }) => [
                styles.typeOption,
                compact && styles.typeOptionCompact,
                selected && styles.typeOptionSelected,
                pressed && styles.pressed,
              ]}
            >
              <View style={[styles.typeIcon, selected && styles.typeIconSelected]}>
                <MaterialCommunityIcons name={type.icon} size={20} color={selected ? ORANGE : '#9aa4a7'} />
              </View>
              <Text style={[styles.typeText, selected && styles.typeTextSelected]}>{type.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function LabeledInput({ label, value, onChangeText, placeholder, multiline, icon, ...props }) {
  return (
    <View style={[styles.inputBox, multiline && styles.notesBox]}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputRow}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#727d81"
          selectionColor={ORANGE}
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
          style={[styles.textInput, multiline && styles.notesInput]}
          {...props}
        />
        {icon && <MaterialCommunityIcons name={icon} size={20} color="#aeb7ba" />}
      </View>
    </View>
  );
}

function parseDateKey(value) {
  if (!value) return null;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatHatchDate(value) {
  const date = parseDateKey(value);
  if (!date) return 'Select a date';
  return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(date);
}

function HatchDateModal({ visible, value, onChange, onClear, onClose }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const initialDate = parseDateKey(value) || today;
  const [month, setMonth] = useState(() => new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));
  const selectedDate = parseDateKey(value);
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells = [
    ...Array.from({ length: month.getDay() }, (_, index) => ({ key: `blank-${index}` })),
    ...Array.from({ length: days }, (_, index) => {
      const date = new Date(month.getFullYear(), month.getMonth(), index + 1);
      return { key: toDateKey(date), date };
    }),
  ];
  const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const canMoveForward = month.getTime() < currentMonth.getTime();
  const changeYear = (amount) => {
    const nextYear = Math.min(month.getFullYear() + amount, today.getFullYear());
    const nextMonth = nextYear === today.getFullYear() ? Math.min(month.getMonth(), today.getMonth()) : month.getMonth();
    setMonth(new Date(nextYear, nextMonth, 1));
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable style={styles.calendarSheet} onPress={(event) => event.stopPropagation()}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeading}>
            <View><Text style={styles.sheetTitle}>Hatched Date</Text><Text style={styles.sheetSubtitle}>Future dates cannot be selected</Text></View>
            <Pressable accessibilityLabel="Close date picker" onPress={onClose} style={styles.sheetClose}><Ionicons name="close" size={20} color="#d9ddde" /></Pressable>
          </View>
          <View style={styles.calendarHeader}>
            <Pressable accessibilityLabel="Previous year" onPress={() => changeYear(-1)} style={styles.calendarNav}><Ionicons name="play-back" size={16} color="#aeb7ba" /></Pressable>
            <Pressable accessibilityLabel="Previous month" onPress={() => setMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))} style={styles.calendarNav}><Ionicons name="chevron-back" size={18} color="#aeb7ba" /></Pressable>
            <Text style={styles.calendarMonth}>{new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(month)}</Text>
            <Pressable accessibilityLabel="Next month" disabled={!canMoveForward} onPress={() => setMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))} style={[styles.calendarNav, !canMoveForward && styles.calendarNavDisabled]}><Ionicons name="chevron-forward" size={18} color="#aeb7ba" /></Pressable>
            <Pressable accessibilityLabel="Next year" disabled={month.getFullYear() >= today.getFullYear()} onPress={() => changeYear(1)} style={[styles.calendarNav, month.getFullYear() >= today.getFullYear() && styles.calendarNavDisabled]}><Ionicons name="play-forward" size={16} color="#aeb7ba" /></Pressable>
          </View>
          <View style={styles.weekdays}>{['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => <Text key={`${day}-${index}`} style={styles.weekday}>{day}</Text>)}</View>
          <View style={styles.calendarGrid}>{cells.map((cell) => {
            if (!cell.date) return <View key={cell.key} style={styles.dayCell} />;
            const disabled = cell.date.getTime() > today.getTime();
            const selected = selectedDate && cell.date.getTime() === selectedDate.getTime();
            return <Pressable key={cell.key} disabled={disabled} onPress={() => { onChange(toDateKey(cell.date)); onClose(); }} style={[styles.dayCell, selected && styles.daySelected]}><Text style={[styles.dayText, disabled && styles.dayDisabled, selected && styles.dayTextSelected]}>{cell.date.getDate()}</Text></Pressable>;
          })}</View>
          <View style={styles.calendarActions}>
            <Pressable onPress={() => { onClear(); onClose(); }} style={({ pressed }) => [styles.clearDateButton, pressed && styles.pressed]}><Text style={styles.clearDateText}>Clear date</Text></Pressable>
            <Pressable onPress={() => { onChange(toDateKey(today)); onClose(); }} style={({ pressed }) => [styles.todayButton, pressed && styles.pressed]}><Text style={styles.todayText}>Today</Text></Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function getAge(hatchDate) {
  if (!hatchDate.trim()) return null;
  const parsed = new Date(`${hatchDate}T00:00:00`);
  if (Number.isNaN(parsed.getTime()) || parsed > new Date()) return null;
  const now = new Date();
  let months = (now.getFullYear() - parsed.getFullYear()) * 12 + now.getMonth() - parsed.getMonth();
  if (now.getDate() < parsed.getDate()) months -= 1;
  if (months < 1) return 'Less than 1 month';
  if (months < 24) return `${months} month${months === 1 ? '' : 's'}`;
  const years = Math.floor(months / 12);
  return `${years} year${years === 1 ? '' : 's'}`;
}

function getBirdDetail(bird, icon) {
  return bird?.details?.find((detail) => detail.icon === icon)?.text || '';
}

function getEditableBloodline(bird) {
  if (!bird?.bloodline || bird.bloodline === 'Bloodline unknown') return '';
  return bird.bloodline.replace(/\s+Bloodline$/i, '');
}

export default function AddBirdScreen({ onBack, onComplete, initialBird = null }) {
  const { width } = useWindowDimensions();
  const compact = width < 430;
  const editing = !!initialBird;
  const initialRing = getBirdDetail(initialBird, 'tag-outline').replace(/^Ring\s*#?/i, '').trim();
  const initialAge = getBirdDetail(initialBird, 'calendar-month-outline');
  const [name, setName] = useState(initialBird?.name || '');
  const [ringNumber, setRingNumber] = useState(initialRing.toLowerCase() === 'unavailable' ? '' : initialRing);
  const [type, setType] = useState(initialBird?.filter || 'cock');
  const [hatchDate, setHatchDate] = useState(initialBird?.hatchedDate || '');
  const [approximateDate, setApproximateDate] = useState(initialBird?.hatchDateApproximate || false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [bloodline, setBloodline] = useState(getEditableBloodline(initialBird));
  const [notes, setNotes] = useState(initialBird?.notes || '');
  const [photoAdded, setPhotoAdded] = useState(!!initialBird?.image);
  const age = useMemo(() => getAge(hatchDate), [hatchDate]);

  const saveBird = () => {
    if (!name.trim() || (!editing && !ringNumber.trim())) {
      Alert.alert('Complete required fields', editing ? 'Enter the bird name.' : 'Enter the bird name and ring number.');
      return;
    }
    if (hatchDate.trim() && !age) {
      Alert.alert('Check hatched date', 'Choose a valid date, or leave this optional field empty.');
      return;
    }

    const typeDetails = TYPES.find((item) => item.key === type);
    const details = [];
    if (age) details.push({ icon: 'calendar-month-outline', text: age });
    else if (editing && initialAge) details.push({ icon: 'calendar-month-outline', text: initialAge });
    const cleanRing = ringNumber.trim().replace(/^#/, '');
    details.push({ icon: 'tag-outline', text: cleanRing ? `Ring #${cleanRing}` : 'Ring unavailable' });
    if (editing) {
      details.push(...initialBird.details.filter(
        (detail) => detail.icon !== 'calendar-month-outline' && detail.icon !== 'tag-outline',
      ));
    }

    const generatedIdPart = cleanRing || name.trim().replace(/\D/g, '').slice(-5) || '001';

    onComplete({
      ...initialBird,
      name: name.trim(),
      type: typeDetails.label,
      filter: type,
      bloodline: bloodline.trim() ? `${bloodline.trim()} Bloodline` : 'Bloodline unknown',
      details,
      status: initialBird?.status || (type === 'stag' || type === 'pullet' ? 'Growing' : 'Healthy'),
      statusColor: initialBird?.statusColor || '#ff9a1f',
      statusBackground: initialBird?.statusBackground || 'rgba(255, 122, 0, 0.13)',
      image: initialBird?.image || TYPE_IMAGES[type],
      notes: notes.trim(),
      hatchedDate: hatchDate.trim() || null,
      hatchDateApproximate: !!hatchDate && approximateDate,
      farmBuzzId: initialBird?.farmBuzzId || `FBZ-${new Date().getFullYear()}-${generatedIdPart.padStart(3, '0')}`,
      _recordKey: initialBird?._recordKey,
    });
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
              source={FLOCK_HERO_IMAGE}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              contentPosition="center"
              cachePolicy="memory-disk"
            />
            <LinearGradient
              colors={['rgba(2, 7, 9, 0.18)', 'rgba(2, 7, 9, 0.28)', '#03090c']}
              locations={[0, 0.48, 1]}
              style={StyleSheet.absoluteFill}
            />
            <SafeAreaView edges={['top']} style={styles.heroSafeArea}>
              <View style={styles.heroHeader}>
                <HeaderButton onPress={onBack} />
                <Text style={styles.screenTitle}>{editing ? 'Edit Bird' : 'Add Bird'}</Text>
              </View>
              <View style={[styles.heroCopy, compact && styles.heroCopyCompact]}>
                <Text style={[styles.farmName, compact && styles.farmNameCompact]}>FarmBuzz Farm</Text>
                <Text style={styles.heroSubtitle}>
                  {editing ? 'Update this bird record.' : 'Register a new bird in this flock.'}
                </Text>
                <View style={styles.farmMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="location-outline" size={16} color="#c0c7c9" />
                    <Text style={styles.metaText}>Pampanga, Philippines</Text>
                  </View>
                  <Text style={styles.metaDot}>•</Text>
                  <View style={styles.metaItem}>
                    <Ionicons name="calendar-outline" size={16} color="#c0c7c9" />
                    <Text style={styles.metaText}>Est. 2020</Text>
                  </View>
                </View>
              </View>
            </SafeAreaView>
          </View>

          <View style={[styles.content, compact && styles.contentCompact]}>
            <View style={styles.formPanel}>
              <Text style={styles.sectionTitle}>Bird Information</Text>

              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Main Photo</Text>
                <Pressable
                  accessibilityLabel={photoAdded ? 'Change main bird photo' : 'Add main bird photo'}
                  onPress={() => setPhotoAdded((current) => !current)}
                  style={({ pressed }) => [styles.photoDrop, pressed && styles.pressed]}
                >
                  {photoAdded ? (
                    <>
                      <Image source={TYPE_IMAGES[type]} style={StyleSheet.absoluteFill} contentFit="cover" />
                      <LinearGradient colors={['transparent', 'rgba(2,7,9,0.82)']} style={StyleSheet.absoluteFill} />
                      <View style={styles.photoSelectedCopy}>
                        <Ionicons name="camera-outline" size={24} color={ORANGE} />
                        <Text style={styles.photoTitle}>Change Main Photo</Text>
                      </View>
                    </>
                  ) : (
                    <View style={styles.photoEmptyCopy}>
                      <MaterialCommunityIcons name="camera-plus-outline" size={42} color={ORANGE} />
                      <Text style={styles.photoTitle}>Add Main Photo</Text>
                      <Text style={styles.photoHint}>Tap to upload</Text>
                    </View>
                  )}
                </Pressable>
              </View>

              <BirdTypeSelector value={type} onChange={setType} compact={compact} />

              <View style={[styles.twoColumn, compact && styles.oneColumn]}>
                <LabeledInput label="Bird Name" value={name} onChangeText={setName} placeholder="Enter bird name" />
                <LabeledInput label="Ring #" value={ringNumber} onChangeText={setRingNumber} placeholder="Enter ring number" />
              </View>

              <View style={styles.dateBlock}>
                <Text style={styles.fieldLabel}>Hatched Date (Optional)</Text>
                <Pressable accessibilityLabel="Choose hatched date" onPress={() => setDatePickerVisible(true)} style={({ pressed }) => [styles.dateField, pressed && styles.pressed]}>
                  <View style={styles.dateIcon}><MaterialCommunityIcons name="calendar-month-outline" size={21} color={ORANGE} /></View>
                  <View style={styles.dateCopy}>
                    <Text style={[styles.dateValue, !hatchDate && styles.datePlaceholder]}>{formatHatchDate(hatchDate)}</Text>
                    <Text style={styles.dateHelper}>{hatchDate ? (approximateDate ? 'Recorded as an approximate date' : 'Recorded as the exact hatch date') : 'Tap to choose from the calendar'}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#8d989c" />
                </Pressable>
                <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: approximateDate }} disabled={!hatchDate} onPress={() => setApproximateDate((current) => !current)} style={({ pressed }) => [styles.approximateRow, !hatchDate && styles.approximateRowDisabled, pressed && hatchDate && styles.pressed]}>
                  <View style={[styles.checkbox, approximateDate && styles.checkboxSelected]}>{approximateDate && <Ionicons name="checkmark" size={14} color="#fff" />}</View>
                  <View><Text style={styles.approximateTitle}>Approximate date</Text><Text style={styles.approximateText}>Use this when the exact hatch date is unknown.</Text></View>
                </Pressable>
              </View>
              <LabeledInput label="Bloodline" value={bloodline} onChangeText={setBloodline} placeholder="Enter bloodline" />
              <LabeledInput
                label="Notes"
                value={notes}
                onChangeText={setNotes}
                placeholder="Add any notes about this bird..."
                multiline
              />

              <Pressable onPress={saveBird} style={({ pressed }) => [styles.saveButton, pressed && styles.pressed]}>
                <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                <Text style={styles.saveText}>{editing ? 'Save Changes' : 'Save Bird'}</Text>
              </Pressable>
              <Pressable onPress={onBack} style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
      <HatchDateModal key={hatchDate || 'empty-date'} visible={datePickerVisible} value={hatchDate} onChange={setHatchDate} onClear={() => { setHatchDate(''); setApproximateDate(false); }} onClose={() => setDatePickerVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#020709' },
  pageWrap: { flexGrow: 1, alignItems: 'center', backgroundColor: '#020709' },
  page: { width: '100%', maxWidth: 720, backgroundColor: '#020709' },
  hero: { height: 285, overflow: 'hidden', backgroundColor: '#101719' },
  heroCompact: { height: 270 },
  heroSafeArea: { flex: 1 },
  heroHeader: { flexDirection: 'row', alignItems: 'center', gap: 13, paddingHorizontal: 16, paddingTop: Platform.OS === 'web' ? 10 : 3 },
  headerButton: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(190, 204, 208, 0.35)', backgroundColor: 'rgba(2, 8, 11, 0.65)', alignItems: 'center', justifyContent: 'center' },
  screenTitle: { color: '#f2f4f4', fontSize: 19, fontWeight: '600', letterSpacing: 0 },
  heroCopy: { marginTop: 'auto', paddingHorizontal: 18, paddingBottom: 28 },
  heroCopyCompact: { paddingHorizontal: 13, paddingBottom: 22 },
  farmName: { color: '#f5f6f6', fontSize: 34, lineHeight: 40, fontWeight: '800', letterSpacing: 0, fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', web: 'Georgia' }), textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 5 },
  farmNameCompact: { fontSize: 29, lineHeight: 34 },
  heroSubtitle: { marginTop: 5, color: '#c1c7c9', fontSize: 14, letterSpacing: 0 },
  farmMeta: { marginTop: 15, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 7 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { color: '#bec5c7', fontSize: 12, letterSpacing: 0 },
  metaDot: { color: '#aeb6b8', fontSize: 12 },
  content: { paddingHorizontal: 10, paddingTop: 0, paddingBottom: 22 },
  contentCompact: { paddingHorizontal: 7 },
  formPanel: { borderWidth: 1, borderColor: '#26343a', borderRadius: 8, backgroundColor: '#091216', padding: 18 },
  sectionTitle: { color: '#eef1f2', fontSize: 18, fontWeight: '700', letterSpacing: 0, marginBottom: 17 },
  fieldBlock: { width: '100%', marginBottom: 17 },
  fieldLabel: { color: '#c8ced0', fontSize: 12, fontWeight: '500', letterSpacing: 0, marginBottom: 8 },
  photoDrop: { height: 160, overflow: 'hidden', borderWidth: 1, borderStyle: 'dashed', borderColor: '#536067', borderRadius: 8, backgroundColor: '#0c161b', alignItems: 'center', justifyContent: 'center' },
  photoEmptyCopy: { alignItems: 'center', justifyContent: 'center' },
  photoSelectedCopy: { position: 'absolute', left: 0, right: 0, bottom: 16, alignItems: 'center', gap: 3 },
  photoTitle: { marginTop: 7, color: '#e3e7e8', fontSize: 14, fontWeight: '500', letterSpacing: 0 },
  photoHint: { marginTop: 6, color: '#8d979a', fontSize: 12, letterSpacing: 0 },
  typeGrid: { flexDirection: 'row', gap: 10 },
  typeGridCompact: { flexWrap: 'wrap' },
  typeOption: { flex: 1, minWidth: 0, height: 48, borderWidth: 1, borderColor: '#2a383e', borderRadius: 8, backgroundColor: '#0d171c', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  typeOptionCompact: { flexBasis: '46%', flexGrow: 1 },
  typeOptionSelected: { borderColor: ORANGE, backgroundColor: 'rgba(255,122,0,0.08)' },
  typeIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#162126', alignItems: 'center', justifyContent: 'center' },
  typeIconSelected: { backgroundColor: 'rgba(255,122,0,0.14)' },
  typeText: { color: '#c0c7c9', fontSize: 13, fontWeight: '500', letterSpacing: 0 },
  typeTextSelected: { color: '#f2f4f4' },
  twoColumn: { flexDirection: 'row', gap: 12 },
  oneColumn: { flexDirection: 'column', gap: 0 },
  inputBox: { flex: 1, width: '100%', minHeight: 67, marginBottom: 11, paddingHorizontal: 12, paddingTop: 9, borderWidth: 1, borderColor: '#2a383e', borderRadius: 8, backgroundColor: '#0c151a' },
  inputLabel: { color: '#d3d8d9', fontSize: 12, fontWeight: '500', letterSpacing: 0 },
  inputRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  textInput: { flex: 1, minWidth: 0, height: 37, paddingVertical: 0, color: '#f0f2f2', fontSize: 13, letterSpacing: 0, outlineStyle: 'none' },
  dateBlock: { width: '100%', marginBottom: 11 },
  dateField: { minHeight: 67, paddingHorizontal: 12, borderWidth: 1, borderColor: '#2a383e', borderRadius: 8, backgroundColor: '#0c151a', flexDirection: 'row', alignItems: 'center', gap: 10 },
  dateIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,122,0,0.09)', alignItems: 'center', justifyContent: 'center' },
  dateCopy: { flex: 1, minWidth: 0 },
  dateValue: { color: '#eef1f2', fontSize: 13, fontWeight: '600' },
  datePlaceholder: { color: '#727d81', fontWeight: '400' },
  dateHelper: { marginTop: 4, color: '#758185', fontSize: 9 },
  approximateRow: { minHeight: 52, paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center', gap: 9 },
  approximateRowDisabled: { opacity: 0.4 },
  checkbox: { width: 21, height: 21, borderRadius: 5, borderWidth: 1, borderColor: '#46545a', alignItems: 'center', justifyContent: 'center' },
  checkboxSelected: { borderColor: ORANGE, backgroundColor: ORANGE },
  approximateTitle: { color: '#cbd1d3', fontSize: 10, fontWeight: '600' },
  approximateText: { marginTop: 3, color: '#737f83', fontSize: 8 },
  notesBox: { height: 82, paddingBottom: 9 },
  notesInput: { height: 48, paddingTop: 7, lineHeight: 18 },
  saveButton: { height: 48, marginTop: 2, borderRadius: 8, backgroundColor: '#f66f00', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  saveText: { color: '#fff', fontSize: 14, fontWeight: '600', letterSpacing: 0 },
  cancelButton: { height: 40, marginTop: 8, borderWidth: 1, borderColor: '#2a383e', borderRadius: 8, backgroundColor: '#0d171c', alignItems: 'center', justifyContent: 'center' },
  cancelText: { color: '#bac2c4', fontSize: 13, fontWeight: '500', letterSpacing: 0 },
  modalBackdrop: { flex: 1, padding: 14, backgroundColor: 'rgba(0,0,0,0.74)', justifyContent: 'flex-end', alignItems: 'center' },
  calendarSheet: { width: '100%', maxWidth: 520, paddingHorizontal: 13, paddingTop: 8, paddingBottom: 14, borderWidth: 1, borderColor: '#334249', borderRadius: 8, backgroundColor: '#081115', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.45, shadowRadius: 18, elevation: 18 },
  sheetHandle: { width: 38, height: 4, marginBottom: 9, borderRadius: 2, backgroundColor: '#435057', alignSelf: 'center' },
  sheetHeading: { minHeight: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sheetTitle: { color: '#eef1f2', fontSize: 16, fontWeight: '700' },
  sheetSubtitle: { marginTop: 3, color: '#778488', fontSize: 9 },
  sheetClose: { width: 35, height: 35, borderRadius: 18, backgroundColor: '#111d22', alignItems: 'center', justifyContent: 'center' },
  calendarHeader: { height: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  calendarNav: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  calendarNavDisabled: { opacity: 0.25 },
  calendarMonth: { flex: 1, color: '#e2e6e7', fontSize: 12, fontWeight: '700', textAlign: 'center' },
  weekdays: { flexDirection: 'row' },
  weekday: { width: '14.2857%', paddingVertical: 6, color: '#738085', fontSize: 9, textAlign: 'center' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: '14.2857%', aspectRatio: 1.25, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  daySelected: { backgroundColor: ORANGE },
  dayText: { color: '#c0c8ca', fontSize: 10 },
  dayDisabled: { color: '#414c50' },
  dayTextSelected: { color: '#fff', fontWeight: '800' },
  calendarActions: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#1f2d33', flexDirection: 'row', gap: 8 },
  clearDateButton: { flex: 1, height: 40, borderWidth: 1, borderColor: '#2d3a40', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  clearDateText: { color: '#aeb7ba', fontSize: 10, fontWeight: '700' },
  todayButton: { flex: 1, height: 40, borderRadius: 8, backgroundColor: ORANGE, alignItems: 'center', justifyContent: 'center' },
  todayText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  pressed: { opacity: 0.72 },
});

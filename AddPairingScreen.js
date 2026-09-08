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
import { BREEDING_HERO_IMAGE } from './constants';

const ORANGE = '#ff7a00';

function HeaderButton({ onPress }) {
  return (
    <Pressable
      accessibilityLabel="Back to breeding"
      onPress={onPress}
      style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}
    >
      <Ionicons name="arrow-back" size={21} color="#eef1f2" />
    </Pressable>
  );
}

function getRing(bird) {
  return bird.details?.find((detail) => detail.icon === 'tag-outline')?.text || 'Ring not recorded';
}

function getFarmBuzzId(bird) {
  if (bird.farmBuzzId) return bird.farmBuzzId;
  const digits = getRing(bird).replace(/\D/g, '').slice(-5)
    || bird.name.replace(/\D/g, '').slice(-5)
    || '001';
  return `FBZ-${new Date().getFullYear()}-${digits.padStart(3, '0')}`;
}

function BirdRow({ bird, selected, onPress, isLast, gender }) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={`Select ${bird.name}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.birdRow,
        selected && styles.birdRowSelected,
        !isLast && styles.rowDivider,
        pressed && styles.rowPressed,
      ]}
    >
      <Image source={bird.image} style={styles.birdImage} contentFit="cover" cachePolicy="memory-disk" />
      <View style={styles.birdCopy}>
        <View style={styles.birdNameRow}>
          <Text numberOfLines={1} style={styles.birdName}>{bird.name}</Text>
          <MaterialCommunityIcons
            name={gender === 'male' ? 'gender-male' : 'gender-female'}
            size={17}
            color={ORANGE}
          />
        </View>
        <Text numberOfLines={1} style={styles.bloodline}>{bird.bloodline}</Text>
        <Text numberOfLines={1} style={styles.ring}>{getRing(bird)}</Text>
      </View>
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected && <View style={styles.radioDot} />}
      </View>
    </Pressable>
  );
}

function BirdSelector({
  title,
  subtitle,
  icon,
  birds,
  selectedBird,
  onSelect,
  gender,
  open,
  onToggle,
}) {
  const [query, setQuery] = useState('');
  const visibleBirds = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return birds;
    return birds.filter((bird) => (
      `${bird.name} ${bird.bloodline} ${getRing(bird)}`.toLowerCase().includes(normalized)
    ));
  }, [birds, query]);

  return (
    <View style={[styles.selectorCard, open && styles.selectorCardOpen]}>
      <View style={styles.selectorHeading}>
        <View style={styles.selectorTitleRow}>
          <View style={styles.selectorIcon}>
            <MaterialCommunityIcons name={icon} size={21} color={ORANGE} />
          </View>
          <View style={styles.selectorHeadingCopy}>
            <View style={styles.requiredTitleRow}>
              <Text style={styles.selectorTitle}>{title}</Text>
              <Text style={styles.requiredMark}>*</Text>
            </View>
            <Text numberOfLines={1} style={[
              styles.selectorSubtitle,
              selectedBird && styles.selectorSubtitleSelected,
            ]}>
              {selectedBird ? `${selectedBird.name} - ${selectedBird.bloodline}` : subtitle}
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#8e999d" />
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={onToggle}
        style={({ pressed }) => [styles.selectAction, pressed && styles.rowPressed]}
      >
        <Text style={styles.selectActionText}>
          {selectedBird ? `Change ${gender === 'male' ? 'Cock' : 'Hen'}` : `Select ${gender === 'male' ? 'Cock' : 'Hen'}`}
        </Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={17} color={ORANGE} />
      </Pressable>

      {open && (
        <View style={styles.selectorBody}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={19} color="#8e999d" />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={`Search ${title.toLowerCase()}`}
              placeholderTextColor="#737f83"
              selectionColor={ORANGE}
              style={styles.searchInput}
            />
            {!!query && (
              <Pressable accessibilityLabel="Clear search" onPress={() => setQuery('')} hitSlop={8}>
                <Ionicons name="close-circle" size={17} color="#697579" />
              </Pressable>
            )}
          </View>

          <View style={styles.birdList}>
            {visibleBirds.map((bird, index) => (
              <BirdRow
                key={bird._recordKey || bird.farmBuzzId || bird.name}
                bird={bird}
                gender={gender}
                selected={selectedBird === bird}
                onPress={() => onSelect(bird)}
                isLast={index === visibleBirds.length - 1}
              />
            ))}
            {!visibleBirds.length && (
              <View style={styles.emptyList}>
                <MaterialCommunityIcons name="bird" size={28} color="#657175" />
                <Text style={styles.emptyTitle}>No eligible birds found</Text>
                <Text style={styles.emptyText}>Add an eligible bird to the Flock first.</Text>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

function PairPreview({ cock, hen }) {
  const complete = !!cock && !!hen;

  return (
    <View style={styles.pairPreview}>
      <View style={styles.previewCopy}>
        <Text style={styles.previewTitle}>Pair Preview</Text>
        <Text style={styles.previewText}>
          {complete ? `${cock.name} paired with ${hen.name}` : 'Preview appears after both birds are selected.'}
        </Text>
      </View>
      <View style={styles.previewBirds}>
        <View style={[styles.previewAvatar, cock && styles.previewAvatarSelected]}>
          {cock ? (
            <Image source={cock.image} style={styles.previewImage} contentFit="cover" cachePolicy="memory-disk" />
          ) : (
            <MaterialCommunityIcons name="gender-male" size={20} color="#697579" />
          )}
        </View>
        <MaterialCommunityIcons name="close" size={17} color={ORANGE} />
        <View style={[styles.previewAvatar, hen && styles.previewAvatarSelected]}>
          {hen ? (
            <Image source={hen.image} style={styles.previewImage} contentFit="cover" cachePolicy="memory-disk" />
          ) : (
            <MaterialCommunityIcons name="gender-female" size={20} color="#697579" />
          )}
        </View>
      </View>
    </View>
  );
}

function normalizeDate(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatDate(date) {
  const today = normalizeDate(new Date());
  if (date.getTime() === today.getTime()) return 'Today';
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}

function DatePickerField({ value, onChange, open, onToggle }) {
  const today = normalizeDate(new Date());
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(value.getFullYear(), value.getMonth(), 1));
  const firstWeekday = visibleMonth.getDay();
  const daysInMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate();
  const cells = [
    ...Array.from({ length: firstWeekday }, (_, index) => ({ key: `empty-${index}` })),
    ...Array.from({ length: daysInMonth }, (_, index) => {
      const date = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), index + 1);
      return { key: date.toISOString(), date };
    }),
  ];
  const canGoBack = visibleMonth.getTime() > new Date(today.getFullYear(), today.getMonth(), 1).getTime();

  return (
    <View>
      <Pressable onPress={onToggle} style={({ pressed }) => [styles.detailRow, pressed && styles.rowPressed]}>
        <MaterialCommunityIcons name="calendar-month-outline" size={19} color={ORANGE} />
        <Text style={styles.detailLabel}>Start Date <Text style={styles.requiredMark}>*</Text></Text>
        <Text style={styles.detailValue}>{formatDate(value)}</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-forward'} size={17} color="#899498" />
      </Pressable>
      {open && (
        <View style={styles.calendarPanel}>
          <View style={styles.calendarHeader}>
            <Pressable disabled={!canGoBack} onPress={() => setVisibleMonth((month) => new Date(month.getFullYear(), month.getMonth() - 1, 1))} style={[styles.calendarNav, !canGoBack && styles.calendarNavDisabled]}>
              <Ionicons name="chevron-back" size={18} color="#c0c8ca" />
            </Pressable>
            <Text style={styles.calendarMonth}>{new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(visibleMonth)}</Text>
            <Pressable onPress={() => setVisibleMonth((month) => new Date(month.getFullYear(), month.getMonth() + 1, 1))} style={styles.calendarNav}>
              <Ionicons name="chevron-forward" size={18} color="#c0c8ca" />
            </Pressable>
          </View>
          <View style={styles.weekdays}>{['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => <Text key={`${day}-${index}`} style={styles.weekday}>{day}</Text>)}</View>
          <View style={styles.calendarGrid}>
            {cells.map((cell) => {
              if (!cell.date) return <View key={cell.key} style={styles.dayCell} />;
              const disabled = cell.date < today;
              const selected = cell.date.getTime() === value.getTime();
              return (
                <Pressable key={cell.key} disabled={disabled} onPress={() => { onChange(cell.date); onToggle(); }} style={[styles.dayCell, selected && styles.daySelected]}>
                  <Text style={[styles.dayText, disabled && styles.dayDisabled, selected && styles.dayTextSelected]}>{cell.date.getDate()}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}

function PairingTypeField({ value, onChange, open, onToggle }) {
  const options = ['Not Recorded', 'Natural Pairing', 'Pen Pairing'];
  return (
    <View>
      <Pressable onPress={onToggle} style={({ pressed }) => [styles.detailRow, styles.detailRowLast, pressed && styles.rowPressed]}>
        <MaterialCommunityIcons name="tag-outline" size={19} color={ORANGE} />
        <Text style={styles.detailLabel}>Pairing Type</Text>
        <View style={styles.typePill}><Text style={styles.typePillText}>{value}</Text></View>
        <Ionicons name={open ? 'chevron-up' : 'chevron-forward'} size={17} color="#899498" />
      </Pressable>
      {open && (
        <View style={styles.optionList}>
          {options.map((option) => (
            <Pressable key={option} onPress={() => { onChange(option); onToggle(); }} style={({ pressed }) => [styles.optionRow, pressed && styles.rowPressed]}>
              <Text style={[styles.optionText, value === option && styles.optionTextSelected]}>{option}</Text>
              {value === option && <Ionicons name="checkmark" size={18} color={ORANGE} />}
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

export default function AddPairingScreen({ birds = [], initialBird = null, onBack, onComplete }) {
  const { width } = useWindowDimensions();
  const compact = width < 600;
  const narrow = width < 390;
  const cocks = useMemo(() => birds.filter((bird) => bird.filter === 'cock'), [birds]);
  const hens = useMemo(() => birds.filter((bird) => bird.filter === 'hen'), [birds]);
  const [selectedCock, setSelectedCock] = useState(() => initialBird?.filter === 'cock' ? cocks.find((bird) => bird.name === initialBird.name) || initialBird : null);
  const [selectedHen, setSelectedHen] = useState(() => initialBird?.filter === 'hen' ? hens.find((bird) => bird.name === initialBird.name) || initialBird : null);
  const [openSelector, setOpenSelector] = useState(null);
  const [startDate, setStartDate] = useState(() => normalizeDate(new Date()));
  const [pairingType, setPairingType] = useState('Not Recorded');
  const [notes, setNotes] = useState('');
  const [openDetail, setOpenDetail] = useState(null);
  const pairComplete = !!selectedCock && !!selectedHen;

  const createPairing = () => {
    if (!pairComplete) {
      Alert.alert('Select both birds', 'Choose one cock and one hen to create the pairing.');
      return;
    }

    const started = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(startDate);
    const maleBloodline = selectedCock.bloodline.replace(/\s+Bloodline$/i, '');
    const femaleBloodline = selectedHen.bloodline.replace(/\s+Bloodline$/i, '');

    onComplete({
      male: selectedCock.name,
      female: selectedHen.name,
      maleImage: selectedCock.image,
      femaleImage: selectedHen.image,
      maleId: getFarmBuzzId(selectedCock),
      femaleId: getFarmBuzzId(selectedHen),
      bloodline: `${maleBloodline} Cock · ${femaleBloodline} Hen`,
      id: `BR-${String(Date.now()).slice(-4)}`,
      started,
      pairingType,
      notes: notes.trim(),
      eggs: '0 eggs',
      oldestEgg: 'No eggs',
      status: 'Active',
      statusColor: '#5eea78',
      statusBackground: 'rgba(29, 126, 66, 0.15)',
    });
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.pageWrap}>
        <View style={styles.page}>
          <View style={[styles.hero, compact && styles.heroCompact]}>
            <Image source={BREEDING_HERO_IMAGE} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="center" cachePolicy="memory-disk" />
            <LinearGradient
              colors={['rgba(2,7,9,0.2)', 'rgba(2,7,9,0.28)', '#03090c']}
              locations={[0, 0.48, 1]}
              style={StyleSheet.absoluteFill}
            />
            <SafeAreaView edges={['top']} style={styles.heroSafeArea}>
              <View style={styles.heroHeader}>
                <HeaderButton onPress={onBack} />
                <Text style={styles.screenTitle}>Add Pairing</Text>
              </View>
              <View style={[styles.heroCopy, narrow && styles.heroCopyNarrow]}>
                <Text style={[styles.farmName, narrow && styles.farmNameNarrow]}>FarmBuzz Farm</Text>
                <Text style={styles.heroSubtitle}>Select a cock and hen from your flock.</Text>
              </View>
            </SafeAreaView>
          </View>

          <View style={[styles.content, narrow && styles.contentNarrow]}>
            <PairPreview cock={selectedCock} hen={selectedHen} />

            <View style={styles.selectors}>
              <BirdSelector
                title="Cock / Sire"
                subtitle="Select a cock from your flock"
                icon="gender-male"
                gender="male"
                birds={cocks}
                selectedBird={selectedCock}
                open={openSelector === 'cock'}
                onToggle={() => {
                  setOpenDetail(null);
                  setOpenSelector((current) => current === 'cock' ? null : 'cock');
                }}
                onSelect={(bird) => {
                  setSelectedCock(bird);
                  setOpenSelector('hen');
                }}
              />
              <BirdSelector
                title="Hen / Dam"
                subtitle="Select a hen from your flock"
                icon="gender-female"
                gender="female"
                birds={hens}
                selectedBird={selectedHen}
                open={openSelector === 'hen'}
                onToggle={() => {
                  setOpenDetail(null);
                  setOpenSelector((current) => current === 'hen' ? null : 'hen');
                }}
                onSelect={(bird) => {
                  setSelectedHen(bird);
                  setOpenSelector(null);
                }}
              />
            </View>

            <View style={styles.detailsCard}>
              <DatePickerField
                value={startDate}
                onChange={setStartDate}
                open={openDetail === 'date'}
                onToggle={() => {
                  setOpenSelector(null);
                  setOpenDetail((current) => current === 'date' ? null : 'date');
                }}
              />
              <PairingTypeField
                value={pairingType}
                onChange={setPairingType}
                open={openDetail === 'type'}
                onToggle={() => {
                  setOpenSelector(null);
                  setOpenDetail((current) => current === 'type' ? null : 'type');
                }}
              />
            </View>

            <View style={styles.notesCard}>
              <View style={styles.notesHeading}>
                <MaterialCommunityIcons name="message-text-outline" size={19} color={ORANGE} />
                <View style={styles.notesCopy}>
                  <Text style={styles.notesTitle}>Notes</Text>
                  <Text style={styles.notesSubtitle}>Add notes about this pairing (optional)</Text>
                </View>
              </View>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                multiline
                textAlignVertical="top"
                maxLength={300}
                placeholder="Write something..."
                placeholderTextColor="#6f7b7f"
                selectionColor={ORANGE}
                style={styles.notesInput}
              />
            </View>

            <View style={styles.actions}>
              <Pressable onPress={onBack} style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                accessibilityState={{ disabled: !pairComplete }}
                disabled={!pairComplete}
                onPress={createPairing}
                style={({ pressed }) => [
                  styles.createButton,
                  !pairComplete && styles.createButtonDisabled,
                  pressed && pairComplete && styles.pressed,
                ]}
              >
                <MaterialCommunityIcons name="link-variant-plus" size={21} color="#fff" />
                <Text style={styles.createText}>Create Pairing</Text>
              </Pressable>
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
  heroCompact: { height: 230 },
  heroSafeArea: { flex: 1 },
  heroHeader: { flexDirection: 'row', alignItems: 'center', gap: 13, paddingHorizontal: 16, paddingTop: Platform.OS === 'web' ? 10 : 3 },
  headerButton: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(190,204,208,0.35)', backgroundColor: 'rgba(2,8,11,0.65)', alignItems: 'center', justifyContent: 'center' },
  screenTitle: { color: '#f2f4f4', fontSize: 18, fontWeight: '700', letterSpacing: 0 },
  heroCopy: { marginTop: 'auto', paddingHorizontal: 18, paddingBottom: 25 },
  heroCopyNarrow: { paddingHorizontal: 12, paddingBottom: 20 },
  farmName: { color: '#f5f6f6', fontSize: 32, lineHeight: 38, fontWeight: '800', letterSpacing: 0, fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', web: 'Georgia' }), textShadowColor: 'rgba(0,0,0,0.75)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 5 },
  farmNameNarrow: { fontSize: 28, lineHeight: 33 },
  heroSubtitle: { marginTop: 5, color: '#c0c7c9', fontSize: 14, letterSpacing: 0 },
  content: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 30 },
  contentNarrow: { paddingHorizontal: 9 },
  selectors: { marginTop: 10, gap: 10 },
  selectorCard: { width: '100%', padding: 9, borderWidth: 1, borderColor: '#26343a', borderRadius: 8, backgroundColor: '#0a1317' },
  selectorCardOpen: { borderColor: '#6b3c0f' },
  selectorHeading: { minHeight: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectorTitleRow: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 9 },
  selectorIcon: { width: 34, height: 34, borderRadius: 17, borderWidth: 1, borderColor: '#4c351d', backgroundColor: 'rgba(255,122,0,0.06)', alignItems: 'center', justifyContent: 'center' },
  selectorHeadingCopy: { flex: 1, minWidth: 0 },
  requiredTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  requiredMark: { color: '#ff5047', fontSize: 11, fontWeight: '700', letterSpacing: 0 },
  selectorTitle: { color: '#e4e8e9', fontSize: 13, fontWeight: '700', letterSpacing: 0 },
  selectorSubtitle: { marginTop: 2, color: '#7f8b8f', fontSize: 9, letterSpacing: 0 },
  selectorSubtitleSelected: { color: '#c2c9cb', fontWeight: '600' },
  selectAction: { height: 38, marginTop: 5, paddingHorizontal: 12, borderWidth: 1, borderColor: '#26343a', borderRadius: 7, backgroundColor: '#0b1519', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  selectActionText: { color: ORANGE, fontSize: 11, fontWeight: '700', letterSpacing: 0 },
  selectorBody: { marginTop: 8 },
  searchBox: { height: 44, paddingHorizontal: 12, borderWidth: 1, borderColor: '#26343a', borderRadius: 8, backgroundColor: '#0a1317', flexDirection: 'row', alignItems: 'center', gap: 8 },
  searchInput: { flex: 1, height: 42, paddingVertical: 0, color: '#e6eaeb', fontSize: 12, letterSpacing: 0, outlineStyle: 'none' },
  birdList: { marginTop: 7, borderWidth: 1, borderColor: '#26343a', borderRadius: 8, backgroundColor: '#0a1317', overflow: 'hidden' },
  birdRow: { minHeight: 76, padding: 8, flexDirection: 'row', alignItems: 'center', gap: 9 },
  birdRowSelected: { backgroundColor: 'rgba(255,122,0,0.07)' },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: '#223037' },
  rowPressed: { backgroundColor: '#111d22' },
  birdImage: { width: 54, height: 54, borderRadius: 7, backgroundColor: '#152126' },
  birdCopy: { flex: 1, minWidth: 0 },
  birdNameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  birdName: { flexShrink: 1, color: '#e9eced', fontSize: 13, fontWeight: '700', letterSpacing: 0 },
  bloodline: { marginTop: 3, color: '#8f9a9d', fontSize: 9, letterSpacing: 0 },
  ring: { marginTop: 4, color: '#747f83', fontSize: 9, letterSpacing: 0 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 1, borderColor: '#506067', alignItems: 'center', justifyContent: 'center' },
  radioSelected: { borderColor: ORANGE },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: ORANGE },
  emptyList: { minHeight: 130, padding: 16, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { marginTop: 7, color: '#aab3b6', fontSize: 11, fontWeight: '600', letterSpacing: 0 },
  emptyText: { marginTop: 3, color: '#727e82', fontSize: 9, letterSpacing: 0, textAlign: 'center' },
  detailsCard: { marginTop: 10, borderWidth: 1, borderColor: '#26343a', borderRadius: 8, backgroundColor: '#0a1317', overflow: 'hidden' },
  detailRow: { minHeight: 48, paddingHorizontal: 11, borderBottomWidth: 1, borderBottomColor: '#223037', flexDirection: 'row', alignItems: 'center', gap: 9 },
  detailRowLast: { borderBottomWidth: 0 },
  detailLabel: { flex: 1, color: '#d9ddde', fontSize: 11, fontWeight: '600', letterSpacing: 0 },
  detailValue: { color: '#929da0', fontSize: 10, letterSpacing: 0 },
  typePill: { maxWidth: 130, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: '#523810', borderRadius: 10, backgroundColor: 'rgba(255,122,0,0.05)' },
  typePillText: { color: '#e7a13f', fontSize: 9, fontWeight: '600', letterSpacing: 0 },
  calendarPanel: { padding: 10, borderTopWidth: 1, borderTopColor: '#223037', backgroundColor: '#081115' },
  calendarHeader: { height: 36, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  calendarNav: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  calendarNavDisabled: { opacity: 0.25 },
  calendarMonth: { color: '#dce0e1', fontSize: 11, fontWeight: '700', letterSpacing: 0 },
  weekdays: { flexDirection: 'row' },
  weekday: { width: '14.2857%', paddingVertical: 5, color: '#718084', fontSize: 9, textAlign: 'center', letterSpacing: 0 },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: '14.2857%', aspectRatio: 1.25, alignItems: 'center', justifyContent: 'center', borderRadius: 6 },
  daySelected: { backgroundColor: ORANGE },
  dayText: { color: '#b9c1c3', fontSize: 10, letterSpacing: 0 },
  dayDisabled: { color: '#3f4a4e' },
  dayTextSelected: { color: '#fff', fontWeight: '800' },
  optionList: { borderTopWidth: 1, borderTopColor: '#223037', backgroundColor: '#081115' },
  optionRow: { minHeight: 42, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  optionText: { color: '#aab3b6', fontSize: 11, letterSpacing: 0 },
  optionTextSelected: { color: ORANGE, fontWeight: '700' },
  notesCard: { marginTop: 10, padding: 10, borderWidth: 1, borderColor: '#26343a', borderRadius: 8, backgroundColor: '#0a1317' },
  notesHeading: { flexDirection: 'row', alignItems: 'flex-start', gap: 9 },
  notesCopy: { flex: 1 },
  notesTitle: { color: '#dfe3e4', fontSize: 12, fontWeight: '600', letterSpacing: 0 },
  notesSubtitle: { marginTop: 2, color: '#7e898d', fontSize: 9, letterSpacing: 0 },
  notesInput: { minHeight: 88, marginTop: 8, padding: 10, borderWidth: 1, borderColor: '#223138', borderRadius: 7, color: '#e2e6e7', fontSize: 11, letterSpacing: 0, outlineStyle: 'none' },
  pairPreview: { minHeight: 66, paddingHorizontal: 11, borderWidth: 1, borderColor: '#26343a', borderRadius: 8, backgroundColor: '#0a1317', flexDirection: 'row', alignItems: 'center', gap: 10 },
  previewCopy: { flex: 1, minWidth: 0 },
  previewTitle: { color: '#dfe3e4', fontSize: 11, fontWeight: '600', letterSpacing: 0 },
  previewText: { marginTop: 3, color: '#798589', fontSize: 8, letterSpacing: 0 },
  previewBirds: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  previewAvatar: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderStyle: 'dashed', borderColor: '#8a510e', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  previewAvatarSelected: { borderStyle: 'solid', borderColor: ORANGE },
  previewImage: { width: '100%', height: '100%' },
  actions: { marginTop: 10, flexDirection: 'row', gap: 8 },
  cancelButton: { flex: 0.7, height: 50, minWidth: 0, paddingHorizontal: 12, borderWidth: 1, borderColor: '#2a383e', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  cancelText: { color: '#bac2c4', fontSize: 13, fontWeight: '600', letterSpacing: 0 },
  createButton: { flex: 1.3, height: 50, minWidth: 0, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#f66f00', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  createButtonDisabled: { backgroundColor: '#3b4143', opacity: 0.65 },
  createText: { color: '#fff', fontSize: 13, fontWeight: '700', letterSpacing: 0 },
  pressed: { opacity: 0.72 },
});

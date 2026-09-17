import { useMemo, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BREEDING_HERO_IMAGE } from './constants';

const ORANGE = '#ff7900';
const BLOODLINES = ['Sweater', 'Kelso', 'Roundhead', 'Hatch', 'Claret', 'Albany'];

function FieldLabel({ children, required }) {
  return <Text style={styles.fieldLabel}>{children}{required && <Text style={styles.required}> *</Text>}</Text>;
}

function BloodlineSelect({ label, value, icon, open, onToggle, onChange }) {
  return (
    <View style={styles.fieldGroup}>
      <FieldLabel required>{label}</FieldLabel>
      <Pressable onPress={onToggle} style={({ pressed }) => [styles.inputShell, pressed && styles.pressed]}>
        <MaterialCommunityIcons name={icon} size={20} color={ORANGE} />
        <Text style={styles.selectValue}>{value}</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color="#75858b" />
      </Pressable>
      {open && (
        <View style={styles.optionMenu}>
          {BLOODLINES.map((option) => (
            <Pressable key={option} onPress={() => { onChange(option); onToggle(); }} style={({ pressed }) => [styles.optionRow, pressed && styles.pressed]}>
              <Text style={[styles.optionText, value === option && styles.optionTextActive]}>{option}</Text>
              {value === option && <Ionicons name="checkmark" size={17} color={ORANGE} />}
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

function TextField({ label, value, onChangeText, placeholder, icon, optional, multiline }) {
  return (
    <View style={styles.fieldGroup}>
      <FieldLabel>{label}{optional ? ' (Optional)' : ''}</FieldLabel>
      <View style={[styles.inputShell, multiline && styles.multilineShell]}>
        <MaterialCommunityIcons name={icon} size={19} color={ORANGE} style={multiline && styles.multilineIcon} />
        <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor="#66777d" selectionColor={ORANGE} multiline={multiline} textAlignVertical={multiline ? 'top' : 'center'} style={[styles.textInput, multiline && styles.multilineInput]} />
      </View>
    </View>
  );
}

function Stepper({ label, value, onChange, icon }) {
  return (
    <View style={[styles.fieldGroup, styles.stepperField]}>
      <FieldLabel required>{label}</FieldLabel>
      <View style={styles.stepperShell}>
        <MaterialCommunityIcons name={icon} size={20} color={ORANGE} />
        <Pressable accessibilityLabel={`Decrease ${label}`} onPress={() => onChange(Math.max(1, value - 1))} style={styles.stepButton}><Ionicons name="remove" size={18} color="#a5b0b4" /></Pressable>
        <Text style={styles.stepValue}>{value}</Text>
        <Pressable accessibilityLabel={`Increase ${label}`} onPress={() => onChange(value + 1)} style={styles.stepButton}><Ionicons name="add" size={18} color="#d8dddf" /></Pressable>
      </View>
    </View>
  );
}

export default function AddPairingScreen({ onBack, onComplete }) {
  const { width } = useWindowDimensions();
  const compact = width < 600;
  const [sire, setSire] = useState('Sweater');
  const [dam, setDam] = useState('Kelso');
  const [openSelect, setOpenSelect] = useState(null);
  const [customLabel, setCustomLabel] = useState('');
  const [groupName, setGroupName] = useState('');
  const [cocks, setCocks] = useState(1);
  const [hens, setHens] = useState(1);
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [notes, setNotes] = useState('');
  const generatedLabel = useMemo(() => `${sire} x ${dam}`, [sire, dam]);
  const displayLabel = customLabel.trim() || generatedLabel;

  const saveGroup = () => {
    if (!sire || !dam) {
      Alert.alert('Select bloodlines', 'Choose both sire and dam bloodlines to continue.');
      return;
    }
    onComplete({
      male: displayLabel, female: '', groupName: displayLabel, groupLabel: groupName.trim(),
      composition: `${cocks} ${cocks === 1 ? 'cock' : 'cocks'} - ${hens} ${hens === 1 ? 'hen' : 'hens'}`,
      bloodline: `${sire} sire - ${dam} dam`, id: `BG-${String(Date.now()).slice(-3)}`,
      started: startDate.trim() || new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date()),
      location: location.trim(), notes: notes.trim(), eggs: 0, oldestEgg: '--', status: 'Active', statusColor: '#5eea78',
    });
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.pageWrap}>
        <View style={styles.page}>
          <View style={[styles.hero, compact && styles.heroCompact]}>
            <Image source={BREEDING_HERO_IMAGE} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="center" cachePolicy="memory-disk" />
            <LinearGradient colors={['rgba(2,7,9,0.18)', 'rgba(2,7,9,0.35)', '#03090c']} locations={[0, 0.52, 1]} style={StyleSheet.absoluteFill} />
            <SafeAreaView edges={['top']} style={styles.heroSafeArea}>
              <View style={styles.heroHeader}>
                <Pressable accessibilityLabel="Back to breeding" onPress={onBack} style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}><Ionicons name="arrow-back" size={21} color="#eef1f2" /></Pressable>
                <Text style={styles.screenTitle}>Add Group</Text>
              </View>
              <View style={styles.heroCopy}>
                <Text style={[styles.farmName, compact && styles.farmNameCompact]}>FarmBuzz Farm</Text>
                <Text style={styles.heroSubtitle}>Create a breeding group for your flock.</Text>
                <View style={styles.farmMeta}><Ionicons name="location-outline" size={14} color="#dce2e4" /><Text style={styles.farmMetaText}>Pampanga, Philippines</Text><View style={styles.metaDivider} /><MaterialCommunityIcons name="calendar-month-outline" size={14} color="#dce2e4" /><Text style={styles.farmMetaText}>Est. 2020</Text></View>
              </View>
            </SafeAreaView>
          </View>

          <View style={[styles.form, compact && styles.formCompact]}>
            <View style={styles.formIntro}>
              <View style={styles.formIntroCopy}>
                <Text style={styles.eyebrow}>NEW BREEDING GROUP</Text>
                <Text style={styles.formTitle}>Build your group</Text>
                <Text style={styles.formDescription}>Define the bloodline, flock composition, and where this group is housed.</Text>
              </View>
              <View style={styles.activePill}><View style={styles.activeDot} /><Text style={styles.activeText}>Active</Text></View>
            </View>

            <View style={styles.sectionLabelRow}>
              <View style={styles.sectionNumber}><Text style={styles.sectionNumberText}>1</Text></View>
              <View><Text style={styles.sectionLabel}>Choose the lineage</Text><Text style={styles.sectionHint}>Select the sire and dam bloodlines.</Text></View>
            </View>

            <View style={styles.lineageSection}>
              <View style={[styles.twoColumn, compact && styles.twoColumnCompact]}>
                <BloodlineSelect label="Sire Bloodline" value={sire} icon="gender-male" open={openSelect === 'sire'} onToggle={() => setOpenSelect(openSelect === 'sire' ? null : 'sire')} onChange={setSire} />
                <BloodlineSelect label="Dam Bloodline" value={dam} icon="gender-female" open={openSelect === 'dam'} onToggle={() => setOpenSelect(openSelect === 'dam' ? null : 'dam')} onChange={setDam} />
              </View>
            </View>

            <View style={styles.identityBand}>
              <View style={styles.identityIcon}><MaterialCommunityIcons name="link-variant" size={23} color={ORANGE} /></View>
              <View style={styles.identityCopy}>
                <Text style={styles.identityEyebrow}>GROUP IDENTITY</Text>
                <TextInput value={customLabel} onChangeText={setCustomLabel} placeholder={generatedLabel} placeholderTextColor="#f2f5f6" selectionColor={ORANGE} style={styles.identityInput} />
                <Text style={styles.identityHint}>Automatically generated, but you can rename it.</Text>
              </View>
            </View>

            <View style={styles.sectionLabelRow}>
              <View style={styles.sectionNumber}><Text style={styles.sectionNumberText}>2</Text></View>
              <View><Text style={styles.sectionLabel}>Set up the group</Text><Text style={styles.sectionHint}>Add the flock count and management details.</Text></View>
            </View>

            <View style={[styles.setupGrid, compact && styles.setupGridCompact]}>
              <View style={styles.setupColumn}>
                <TextField label="Group Name" optional value={groupName} onChangeText={setGroupName} placeholder="e.g. Main Breeders" icon="tag-outline" />
                <View style={styles.stepperRow}><Stepper label="Cocks" value={cocks} onChange={setCocks} icon="gender-male" /><Stepper label="Hens" value={hens} onChange={setHens} icon="gender-female" /></View>
              </View>
              <View style={styles.setupColumn}>
                <TextField label="Location / House / Section" optional value={location} onChangeText={setLocation} placeholder="e.g. House A" icon="map-marker-outline" />
                <TextField label="Start Date" value={startDate} onChangeText={setStartDate} placeholder="Today" icon="calendar-month-outline" />
              </View>
            </View>

            <View style={styles.notesSection}><TextField label="Notes" optional value={notes} onChangeText={setNotes} placeholder="Setup notes, bloodline details, or other information..." icon="note-text-outline" multiline /></View>

            <View style={styles.saveNote}><MaterialCommunityIcons name="information-outline" size={17} color="#87959a" /><Text style={styles.saveNoteText}>The group starts as Active. Egg collection begins from its records.</Text></View>
            <View style={styles.actions}>
              <Pressable onPress={onBack} style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}><Text style={styles.cancelText}>Cancel</Text></Pressable>
              <Pressable onPress={saveGroup} style={({ pressed }) => [styles.saveButton, pressed && styles.pressed]}><MaterialCommunityIcons name="check" size={19} color="#fff" /><Text style={styles.saveText}>Save Group</Text></Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#020709' }, pageWrap: { flexGrow: 1, alignItems: 'center', backgroundColor: '#020709' }, page: { width: '100%', maxWidth: 720, backgroundColor: '#020709' },
  hero: { height: 272, overflow: 'hidden', backgroundColor: '#101719' }, heroCompact: { height: 248 }, heroSafeArea: { flex: 1 },
  heroHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingTop: Platform.OS === 'web' ? 10 : 3 },
  headerButton: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(190,204,208,0.35)', backgroundColor: 'rgba(2,8,11,0.65)', alignItems: 'center', justifyContent: 'center' },
  screenTitle: { color: '#f4f6f7', fontSize: 15, fontWeight: '800' }, heroCopy: { marginTop: 'auto', paddingHorizontal: 20, paddingBottom: 22 },
  farmName: { color: '#fff', fontSize: 34, lineHeight: 40, fontWeight: '800', fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', web: 'Georgia' }) }, farmNameCompact: { fontSize: 29, lineHeight: 34 },
  heroSubtitle: { marginTop: 3, color: '#c2cbce', fontSize: 13, lineHeight: 18 }, farmMeta: { marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 6 }, farmMetaText: { color: '#d3dade', fontSize: 10 }, metaDivider: { width: 1, height: 12, marginHorizontal: 5, backgroundColor: 'rgba(210,220,224,0.35)' },
  form: { paddingHorizontal: 20, paddingTop: 22, paddingBottom: 32, gap: 18 }, formCompact: { paddingHorizontal: 12, paddingTop: 17, gap: 16 },
  formIntro: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, paddingBottom: 3 },
  formIntroCopy: { flex: 1, minWidth: 0 },
  eyebrow: { color: ORANGE, fontSize: 9, fontWeight: '800' },
  formTitle: { marginTop: 4, color: '#f1f4f5', fontSize: 21, lineHeight: 26, fontWeight: '800' },
  formDescription: { marginTop: 4, maxWidth: 440, color: '#869398', fontSize: 11, lineHeight: 16 },
  activePill: { height: 24, paddingHorizontal: 9, borderRadius: 12, backgroundColor: 'rgba(35,110,63,0.22)', flexDirection: 'row', alignItems: 'center', gap: 5 }, activeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#5eea78' }, activeText: { color: '#7de596', fontSize: 9, fontWeight: '700' },
  sectionLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingTop: 2 },
  sectionNumber: { width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: '#7c430d', backgroundColor: 'rgba(255,121,0,0.09)', alignItems: 'center', justifyContent: 'center' },
  sectionNumberText: { color: ORANGE, fontSize: 11, fontWeight: '800' },
  sectionLabel: { color: '#e4e9ea', fontSize: 13, lineHeight: 17, fontWeight: '800' },
  sectionHint: { marginTop: 1, color: '#748288', fontSize: 9, lineHeight: 13 },
  lineageSection: { zIndex: 4 },
  twoColumn: { flexDirection: 'row', gap: 12 }, twoColumnCompact: { gap: 8 }, fieldGroup: { flex: 1, minWidth: 0 }, fieldLabel: { marginBottom: 6, color: '#aeb9bc', fontSize: 10, fontWeight: '700' }, required: { color: ORANGE },
  inputShell: { minHeight: 46, borderRadius: 6, borderWidth: 1, borderColor: '#1c333c', backgroundColor: '#071216', paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 9 }, selectValue: { flex: 1, color: '#dce2e4', fontSize: 12 },
  optionMenu: { marginTop: 5, borderRadius: 7, borderWidth: 1, borderColor: '#263c44', backgroundColor: '#0c191e', overflow: 'hidden' }, optionRow: { minHeight: 38, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#1a2b31' }, optionText: { color: '#aab4b7', fontSize: 11 }, optionTextActive: { color: '#fff', fontWeight: '700' },
  textInput: { flex: 1, minWidth: 0, height: 44, padding: 0, color: '#e5e9ea', fontSize: 11, outlineStyle: 'none' },
  identityBand: { position: 'relative', minHeight: 78, borderRadius: 7, borderWidth: 1, borderColor: '#263137', backgroundColor: '#101719', paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 12, overflow: 'hidden' },
  identityIcon: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: '#7c430d', backgroundColor: 'rgba(255,121,0,0.08)', alignItems: 'center', justifyContent: 'center' },
  identityCopy: { flex: 1, minWidth: 0 }, identityEyebrow: { color: '#7f8d92', fontSize: 8, fontWeight: '800' },
  identityInput: { height: 28, padding: 0, color: '#f2f5f6', fontSize: 16, fontWeight: '800', outlineStyle: 'none' },
  identityHint: { color: '#748187', fontSize: 8, lineHeight: 12 },
  setupGrid: { flexDirection: 'row', alignItems: 'flex-start', gap: 18 }, setupGridCompact: { flexDirection: 'column', gap: 13 },
  setupColumn: { flex: 1, width: '100%', gap: 13 },
  stepperRow: { flexDirection: 'row', gap: 10 }, stepperField: { flex: 1 }, stepperShell: { height: 46, borderRadius: 6, borderWidth: 1, borderColor: '#1c333c', backgroundColor: '#071216', paddingLeft: 10, paddingRight: 5, flexDirection: 'row', alignItems: 'center', gap: 6 }, stepButton: { width: 32, height: 32, borderRadius: 5, borderWidth: 1, borderColor: '#263b44', backgroundColor: '#0d1b21', alignItems: 'center', justifyContent: 'center' }, stepValue: { flex: 1, textAlign: 'center', color: '#f3f5f6', fontSize: 12, fontWeight: '800' },
  multilineShell: { minHeight: 76, alignItems: 'flex-start', paddingTop: 12 }, multilineIcon: { marginTop: 1 }, multilineInput: { height: 58, lineHeight: 17 },
  notesSection: {},
  saveNote: { flexDirection: 'row', alignItems: 'center', gap: 8 }, saveNoteText: { flex: 1, color: '#7e8b90', fontSize: 9, lineHeight: 13 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 0 }, cancelButton: { flex: 1, height: 48, borderRadius: 6, borderWidth: 1, borderColor: '#26373e', backgroundColor: '#071115', alignItems: 'center', justifyContent: 'center' }, cancelText: { color: '#dce2e4', fontSize: 12, fontWeight: '700' }, saveButton: { flex: 1.15, height: 48, borderRadius: 6, backgroundColor: ORANGE, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 }, saveText: { color: '#fff', fontSize: 12, fontWeight: '800' }, pressed: { opacity: 0.72 },
});

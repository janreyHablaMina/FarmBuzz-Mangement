import { useState } from 'react';
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
import { DASHBOARD_HERO_IMAGE } from './constants';

const ORANGE = '#ff7a00';

function HeaderButton({ onPress }) {
  return (
    <Pressable accessibilityLabel="Back to management" onPress={onPress} style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}>
      <Ionicons name="arrow-back" size={21} color="#eef1f2" />
    </Pressable>
  );
}

function SectionHeader({ title, subtitle }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
    </View>
  );
}

function SettingInput({ icon, label, value, onChangeText, placeholder, keyboardType }) {
  return (
    <View style={styles.inputRow}>
      <View style={styles.rowIcon}><MaterialCommunityIcons name={icon} size={20} color={ORANGE} /></View>
      <View style={styles.inputCopy}>
        <Text style={styles.rowLabel}>{label}</Text>
        <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor="#6f7b7f" selectionColor={ORANGE} keyboardType={keyboardType} style={styles.input} />
      </View>
    </View>
  );
}

function ToggleRow({ icon, label, description, value, onValueChange, isLast }) {
  return (
    <View style={[styles.settingRow, !isLast && styles.rowDivider]}>
      <View style={styles.rowIcon}><MaterialCommunityIcons name={icon} size={20} color={ORANGE} /></View>
      <View style={styles.rowCopy}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowDescription}>{description}</Text>
      </View>
      <Pressable
        accessibilityRole="switch"
        accessibilityState={{ checked: value }}
        accessibilityLabel={label}
        onPress={() => onValueChange(!value)}
        style={({ pressed }) => [
          styles.toggleTrack,
          value && styles.toggleTrackActive,
          pressed && styles.pressed,
        ]}
      >
        <View style={[styles.toggleThumb, value && styles.toggleThumbActive]} />
      </Pressable>
    </View>
  );
}

function StepperRow({ icon, label, description, value, suffix, min, max, step = 1, precision = 0, onChange, isLast }) {
  const displayValue = precision ? Number(value).toFixed(precision) : value;
  return (
    <View style={[styles.settingRow, !isLast && styles.rowDivider]}>
      <View style={styles.rowIcon}><MaterialCommunityIcons name={icon} size={20} color={ORANGE} /></View>
      <View style={styles.rowCopy}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowDescription}>{description}</Text>
      </View>
      <View style={styles.stepper}>
        <Pressable accessibilityLabel={`Decrease ${label}`} disabled={value <= min} onPress={() => onChange(Number((value - step).toFixed(precision)))} style={({ pressed }) => [styles.stepperButton, value <= min && styles.stepperDisabled, pressed && styles.pressed]}><Ionicons name="remove" size={16} color="#dce1e2" /></Pressable>
        <Text style={styles.stepperValue}>{displayValue}{suffix}</Text>
        <Pressable accessibilityLabel={`Increase ${label}`} disabled={value >= max} onPress={() => onChange(Number((value + step).toFixed(precision)))} style={({ pressed }) => [styles.stepperButton, value >= max && styles.stepperDisabled, pressed && styles.pressed]}><Ionicons name="add" size={16} color="#dce1e2" /></Pressable>
      </View>
    </View>
  );
}

function ChoiceRow({ icon, label, description, value, onPress, isLast }) {
  return <Pressable accessibilityLabel={`Choose ${label}`} onPress={onPress} style={({ pressed }) => [styles.settingRow, !isLast && styles.rowDivider, pressed && styles.rowPressed]}><View style={styles.rowIcon}><MaterialCommunityIcons name={icon} size={20} color={ORANGE} /></View><View style={styles.rowCopy}><Text style={styles.rowLabel}>{label}</Text><Text style={styles.rowDescription}>{description}</Text></View><View style={styles.choiceValue}><Text numberOfLines={1} style={styles.choiceValueText}>{value}</Text><Ionicons name="chevron-down" size={15} color="#899397" /></View></Pressable>;
}

function ActionRow({ icon, label, description, onPress, isLast, danger }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.settingRow, !isLast && styles.rowDivider, pressed && styles.rowPressed]}>
      <View style={[styles.rowIcon, danger && styles.dangerIcon]}><MaterialCommunityIcons name={icon} size={20} color={danger ? '#ff6258' : ORANGE} /></View>
      <View style={styles.rowCopy}><Text style={[styles.rowLabel, danger && styles.dangerText]}>{label}</Text><Text style={styles.rowDescription}>{description}</Text></View>
      <Ionicons name="chevron-forward" size={19} color="#899397" />
    </Pressable>
  );
}

function ModuleSettingsRow({ icon, title, summary, open, onToggle, children, isLast }) {
  return (
    <View style={[styles.moduleItem, !isLast && styles.moduleDivider, open && styles.moduleItemOpen]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={onToggle}
        style={({ pressed }) => [styles.moduleHeader, pressed && styles.rowPressed]}
      >
        <View style={styles.moduleIcon}><MaterialCommunityIcons name={icon} size={23} color={ORANGE} /></View>
        <View style={styles.moduleCopy}>
          <Text style={styles.moduleTitle}>{title}</Text>
          <Text numberOfLines={1} style={styles.moduleSummary}>{summary}</Text>
        </View>
        <Ionicons name={open ? 'chevron-up' : 'chevron-forward'} size={19} color={open ? ORANGE : '#899397'} />
      </Pressable>
      {open && <View style={styles.moduleBody}>{children}</View>}
    </View>
  );
}

export default function ManagementSettingsScreen({ initialSettings, onBack, onSave }) {
  const { width } = useWindowDimensions();
  const compact = width < 480;
  const narrow = width < 390;
  const [farmName, setFarmName] = useState(initialSettings.farmName);
  const [location, setLocation] = useState(initialSettings.location);
  const [establishedYear, setEstablishedYear] = useState(initialSettings.establishedYear);
  const [incubationDays, setIncubationDays] = useState(initialSettings.incubationDays);
  const [candlingDay, setCandlingDay] = useState(initialSettings.candlingDay);
  const [notifications, setNotifications] = useState(initialSettings.notifications);
  const [openModule, setOpenModule] = useState(null);
  const [choicePicker, setChoicePicker] = useState(null);
  const moduleDefaults = {
    general: { temperatureUnit: 'Celsius', weightUnit: 'Kilograms' },
    flock: { showInactive: false, careReviewDays: 7, birdIdPrefix: 'FBZ' },
    breeding: { holdingLimitDays: 7, trackFirstEgg: true, pairingReminders: true },
    health: { vaccineLeadDays: 3, requireTreatmentNotes: true, healthReviewDays: 30 },
    incubation: { recommendedTemperature: 37.5, lockdownHumidity: 65, defaultIncubator: 'Incubator 1' },
    tasks: { dailySummary: true, requireAssignee: false, defaultPriority: 'Medium', defaultRepeat: 'Does not repeat' },
    team: { approvalRequired: true, defaultRole: 'Farm Worker' },
  };
  const [modules, setModules] = useState(() => Object.fromEntries(Object.entries(moduleDefaults).map(([key, defaults]) => [key, { ...defaults, ...(initialSettings.modules?.[key] || {}) }])));

  const setNotification = (key, value) => setNotifications((current) => ({ ...current, [key]: value }));
  const setModuleValue = (module, key, value) => setModules((current) => ({
    ...current,
    [module]: { ...current[module], [key]: value },
  }));
  const toggleModule = (module) => setOpenModule((current) => current === module ? null : module);
  const openChoice = (title, options, value, onSelect) => setChoicePicker({ title, options, value, onSelect });
  const choose = (value) => { choicePicker.onSelect(value); setChoicePicker(null); };
  const save = () => {
    if (!farmName.trim() || !location.trim()) {
      Alert.alert('Farm information required', 'Enter the farm name and location before saving.');
      return;
    }
    onSave({ farmName: farmName.trim(), location: location.trim(), establishedYear: establishedYear.trim(), incubationDays, candlingDay, notifications, modules });
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.pageWrap}>
        <View style={styles.page}>
          <View style={[styles.hero, compact && styles.heroCompact]}>
            <Image source={DASHBOARD_HERO_IMAGE} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="center" cachePolicy="memory-disk" />
            <LinearGradient colors={['rgba(2,7,9,0.25)', 'rgba(2,7,9,0.42)', '#03090c']} locations={[0, 0.5, 1]} style={StyleSheet.absoluteFill} />
            <SafeAreaView edges={['top']} style={styles.heroSafeArea}>
              <View style={styles.heroHeader}><HeaderButton onPress={onBack} /><Text style={styles.screenTitle}>Management Settings</Text></View>
              <View style={[styles.heroCopy, narrow && styles.heroCopyNarrow]}>
                <Text style={[styles.farmName, narrow && styles.farmNameNarrow]}>{farmName || 'FarmBuzz Farm'}</Text>
                <Text style={styles.heroSubtitle}>Farm profile, workflow defaults, alerts, and access.</Text>
              </View>
            </SafeAreaView>
          </View>

          <View style={[styles.content, narrow && styles.contentNarrow]}>
            <SectionHeader title="Farm Profile" subtitle="Information shown across farm records." />
            <View style={styles.panel}>
              <SettingInput icon="barn" label="Farm Name" value={farmName} onChangeText={setFarmName} placeholder="Enter farm name" />
              <View style={styles.rowDivider} />
              <SettingInput icon="map-marker-outline" label="Location" value={location} onChangeText={setLocation} placeholder="City, province" />
              <View style={styles.rowDivider} />
              <SettingInput icon="calendar-outline" label="Established Year" value={establishedYear} onChangeText={setEstablishedYear} placeholder="2020" keyboardType="number-pad" />
            </View>

            <SectionHeader title="Module Settings" subtitle="Open a module only when you need its detailed defaults." />
            <View style={styles.modulesPanel}>
              <ModuleSettingsRow icon="cog-outline" title="General" summary={`${modules.general.temperatureUnit} - ${modules.general.weightUnit}`} open={openModule === 'general'} onToggle={() => toggleModule('general')}>
                <ChoiceRow icon="thermometer" label="Temperature Unit" description="Used for incubation conditions and alerts." value={modules.general.temperatureUnit} onPress={() => openChoice('Temperature Unit', ['Celsius', 'Fahrenheit'], modules.general.temperatureUnit, (value) => setModuleValue('general', 'temperatureUnit', value))} />
                <ChoiceRow icon="weight-kilogram" label="Weight Unit" description="Used for bird measurements and reports." value={modules.general.weightUnit} onPress={() => openChoice('Weight Unit', ['Kilograms', 'Pounds'], modules.general.weightUnit, (value) => setModuleValue('general', 'weightUnit', value))} isLast />
              </ModuleSettingsRow>
              <ModuleSettingsRow icon="bird" title="Bird & Flock" summary={`Care review every ${modules.flock.careReviewDays} days`} open={openModule === 'flock'} onToggle={() => toggleModule('flock')}>
                <ToggleRow icon="eye-outline" label="Show Inactive Birds" description="Include inactive records in Flock searches." value={modules.flock.showInactive} onValueChange={(value) => setModuleValue('flock', 'showInactive', value)} />
                <StepperRow icon="calendar-refresh-outline" label="Care Review Interval" description="Prompt routine flock reviews." value={modules.flock.careReviewDays} suffix=" days" min={1} max={30} onChange={(value) => setModuleValue('flock', 'careReviewDays', value)} />
                <View style={styles.inlineInputRow}><View style={styles.rowIcon}><MaterialCommunityIcons name="identifier" size={20} color={ORANGE} /></View><View style={styles.inputCopy}><Text style={styles.rowLabel}>Bird ID Prefix</Text><TextInput value={modules.flock.birdIdPrefix} onChangeText={(value) => setModuleValue('flock', 'birdIdPrefix', value.toUpperCase().slice(0, 6))} placeholder="FBZ" placeholderTextColor="#6f7b7f" autoCapitalize="characters" selectionColor={ORANGE} style={styles.input} /></View></View>
              </ModuleSettingsRow>
              <ModuleSettingsRow icon="gender-male-female" title="Breeding" summary={`Egg holding limit ${modules.breeding.holdingLimitDays} days`} open={openModule === 'breeding'} onToggle={() => toggleModule('breeding')}>
                <ToggleRow icon="egg-outline" label="Track First Egg" description="Flag the first egg recorded for a new pairing." value={modules.breeding.trackFirstEgg} onValueChange={(value) => setModuleValue('breeding', 'trackFirstEgg', value)} />
                <ToggleRow icon="bell-ring-outline" label="Pairing Reminders" description="Remind the team about pairing reviews and egg checks." value={modules.breeding.pairingReminders} onValueChange={(value) => setModuleValue('breeding', 'pairingReminders', value)} />
                <StepperRow icon="timer-sand" label="Egg Holding Limit" description="Warn when eggs should move to incubation." value={modules.breeding.holdingLimitDays} suffix=" days" min={3} max={10} onChange={(value) => setModuleValue('breeding', 'holdingLimitDays', value)} isLast />
              </ModuleSettingsRow>
              <ModuleSettingsRow icon="shield-cross-outline" title="Health & Care" summary={`Vaccination notice ${modules.health.vaccineLeadDays} days before`} open={openModule === 'health'} onToggle={() => toggleModule('health')}>
                <ToggleRow icon="note-check-outline" label="Require Treatment Notes" description="Require notes when a treatment is completed." value={modules.health.requireTreatmentNotes} onValueChange={(value) => setModuleValue('health', 'requireTreatmentNotes', value)} />
                <StepperRow icon="calendar-heart" label="Routine Health Review" description="Default interval between routine health checks." value={modules.health.healthReviewDays} suffix=" days" min={7} max={90} onChange={(value) => setModuleValue('health', 'healthReviewDays', value)} />
                <StepperRow icon="needle" label="Vaccination Notice" description="Notify before a vaccination is due." value={modules.health.vaccineLeadDays} suffix=" days" min={1} max={14} onChange={(value) => setModuleValue('health', 'vaccineLeadDays', value)} isLast />
              </ModuleSettingsRow>
              <ModuleSettingsRow icon="egg-outline" title="Eggs & Incubation" summary={`${incubationDays}-day cycle - Candling Day ${candlingDay}`} open={openModule === 'incubation'} onToggle={() => toggleModule('incubation')}>
                <StepperRow icon="egg-outline" label="Incubation Cycle" description="Expected hatch cycle for chicken eggs." value={incubationDays} suffix=" days" min={18} max={24} onChange={setIncubationDays} />
                <StepperRow icon="flashlight" label="Candling Day" description="Day when candling becomes available." value={candlingDay} suffix="" min={5} max={18} onChange={setCandlingDay} />
                <StepperRow icon="thermometer" label="Recommended Temperature" description="Displayed during the normal incubation period." value={modules.incubation.recommendedTemperature} suffix=" C" min={36} max={39} step={0.1} precision={1} onChange={(value) => setModuleValue('incubation', 'recommendedTemperature', value)} />
                <StepperRow icon="water-percent" label="Lockdown Humidity" description="Recommended humidity from Day 18 to hatch." value={modules.incubation.lockdownHumidity} suffix="%" min={55} max={75} onChange={(value) => setModuleValue('incubation', 'lockdownHumidity', value)} />
                <ChoiceRow icon="fan" label="Default Incubator" description="Preselected when a new batch is created." value={modules.incubation.defaultIncubator} onPress={() => openChoice('Default Incubator', ['Incubator 1', 'Incubator 2'], modules.incubation.defaultIncubator, (value) => setModuleValue('incubation', 'defaultIncubator', value))} isLast />
              </ModuleSettingsRow>
              <ModuleSettingsRow icon="clipboard-check-outline" title="Tasks" summary={modules.tasks.dailySummary ? 'Daily summary enabled' : 'Daily summary disabled'} open={openModule === 'tasks'} onToggle={() => toggleModule('tasks')}>
                <ToggleRow icon="text-box-check-outline" label="Daily Task Summary" description="Show a daily overview of open farm work." value={modules.tasks.dailySummary} onValueChange={(value) => setModuleValue('tasks', 'dailySummary', value)} />
                <ToggleRow icon="account-check-outline" label="Require Assignee" description="Tasks must have a responsible team member." value={modules.tasks.requireAssignee} onValueChange={(value) => setModuleValue('tasks', 'requireAssignee', value)} />
                <ChoiceRow icon="flag-outline" label="Default Priority" description="Preselected priority for new tasks." value={modules.tasks.defaultPriority} onPress={() => openChoice('Default Task Priority', ['Low', 'Medium', 'High'], modules.tasks.defaultPriority, (value) => setModuleValue('tasks', 'defaultPriority', value))} />
                <ChoiceRow icon="repeat" label="Default Repeat" description="Preselected schedule for routine farm work." value={modules.tasks.defaultRepeat} onPress={() => openChoice('Default Task Repeat', ['Does not repeat', 'Every day', 'Every week', 'Every month'], modules.tasks.defaultRepeat, (value) => setModuleValue('tasks', 'defaultRepeat', value))} isLast />
              </ModuleSettingsRow>
              <ModuleSettingsRow icon="account-group-outline" title="Team & Access" summary="Roles, permissions, and approvals" open={openModule === 'team'} onToggle={() => toggleModule('team')} isLast>
                <ToggleRow icon="account-key-outline" label="Approval Required" description="Require approval before changing team access." value={modules.team.approvalRequired} onValueChange={(value) => setModuleValue('team', 'approvalRequired', value)} />
                <ChoiceRow icon="badge-account-outline" label="Default New Member Role" description="Role assigned when a team member is added." value={modules.team.defaultRole} onPress={() => openChoice('Default Team Role', ['Farm Worker', 'Caretaker', 'Manager', 'View Only'], modules.team.defaultRole, (value) => setModuleValue('team', 'defaultRole', value))} />
                <ActionRow icon="account-lock-outline" label="Roles & Permissions" description="Open a team member to adjust detailed access." onPress={() => Alert.alert('Roles & Permissions', 'Use Team > Member Details > Edit Role & Permissions for individual access.')} isLast />
              </ModuleSettingsRow>
            </View>

            <SectionHeader title="Notifications" subtitle="Choose which farm events need attention." />
            <View style={styles.panel}>
              <ToggleRow icon="alert-outline" label="Bird Health Alerts" description="Injuries, sickness, and care reviews." value={notifications.health} onValueChange={(value) => setNotification('health', value)} />
              <ToggleRow icon="clipboard-clock-outline" label="Task Reminders" description="Due, overdue, and upcoming tasks." value={notifications.tasks} onValueChange={(value) => setNotification('tasks', value)} />
              <ToggleRow icon="egg-outline" label="Incubation Alerts" description="Candling, lockdown, and hatch dates." value={notifications.incubation} onValueChange={(value) => setNotification('incubation', value)} />
              <ToggleRow icon="needle" label="Vaccination Reminders" description="Upcoming and overdue vaccinations." value={notifications.vaccinations} onValueChange={(value) => setNotification('vaccinations', value)} isLast />
            </View>

            <SectionHeader title="Data & Records" subtitle="Export or review historical farm information." />
            <View style={styles.panel}>
              <ActionRow icon="database-export-outline" label="Export Farm Records" description="Prepare a copy of farm data." onPress={() => Alert.alert('Export Farm Records', 'Your export will be prepared here.')} />
              <ActionRow icon="archive-outline" label="Archived Records" description="View inactive birds, pairings, and batches." onPress={() => Alert.alert('Archived Records', 'Archived farm records will open here.')} isLast />
            </View>

            <View style={styles.actions}>
              <Pressable onPress={onBack} style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}><Text style={styles.cancelText}>Cancel</Text></Pressable>
              <Pressable onPress={save} style={({ pressed }) => [styles.saveButton, pressed && styles.pressed]}><Ionicons name="checkmark-circle-outline" size={20} color="#fff" /><Text style={styles.saveText}>Save Changes</Text></Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
      <Modal visible={!!choicePicker} transparent animationType="fade" onRequestClose={() => setChoicePicker(null)}><Pressable style={styles.modalBackdrop} onPress={() => setChoicePicker(null)}><Pressable style={styles.modalCard} onPress={(event) => event.stopPropagation?.()}><View style={styles.modalHandle} /><Text style={styles.modalTitle}>{choicePicker?.title}</Text><Text style={styles.modalSubtitle}>Choose the default used across FarmBuzz Farm.</Text>{choicePicker?.options.map((option) => { const selected = option === choicePicker.value; return <Pressable key={option} onPress={() => choose(option)} style={({ pressed }) => [styles.modalOption, selected && styles.modalOptionSelected, pressed && styles.pressed]}><Text style={[styles.modalOptionText, selected && styles.modalOptionTextSelected]}>{option}</Text>{selected && <Ionicons name="checkmark" size={18} color={ORANGE} />}</Pressable>; })}</Pressable></Pressable></Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#020709' }, pageWrap: { flexGrow: 1, alignItems: 'center', backgroundColor: '#020709' }, page: { width: '100%', maxWidth: 720, backgroundColor: '#020709' },
  hero: { height: 245, overflow: 'hidden', backgroundColor: '#101719' }, heroCompact: { height: 230 }, heroSafeArea: { flex: 1 }, heroHeader: { flexDirection: 'row', alignItems: 'center', gap: 13, paddingHorizontal: 16, paddingTop: Platform.OS === 'web' ? 10 : 3 },
  headerButton: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(190,204,208,0.35)', backgroundColor: 'rgba(2,8,11,0.65)', alignItems: 'center', justifyContent: 'center' }, screenTitle: { color: '#f2f4f4', fontSize: 18, fontWeight: '700', letterSpacing: 0 },
  heroCopy: { marginTop: 'auto', paddingHorizontal: 18, paddingBottom: 25 }, heroCopyNarrow: { paddingHorizontal: 11, paddingBottom: 20 }, farmName: { color: '#f5f6f6', fontSize: 32, lineHeight: 38, fontWeight: '800', letterSpacing: 0, fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', web: 'Georgia' }), textShadowColor: 'rgba(0,0,0,0.75)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 5 }, farmNameNarrow: { fontSize: 28, lineHeight: 33 }, heroSubtitle: { marginTop: 5, color: '#c0c7c9', fontSize: 13, letterSpacing: 0 },
  content: { paddingHorizontal: 14, paddingTop: 14, paddingBottom: 30 }, contentNarrow: { paddingHorizontal: 9 }, sectionHeader: { marginTop: 15, marginBottom: 8 }, sectionTitle: { color: '#e8ebec', fontSize: 14, fontWeight: '700', letterSpacing: 0 }, sectionSubtitle: { marginTop: 3, color: '#7f8b8f', fontSize: 9, letterSpacing: 0 },
  panel: { borderWidth: 1, borderColor: '#26343a', borderRadius: 8, backgroundColor: '#0a1317', overflow: 'hidden' }, inputRow: { minHeight: 66, paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center', gap: 10 }, rowIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,122,0,0.08)', alignItems: 'center', justifyContent: 'center' }, dangerIcon: { backgroundColor: 'rgba(255,98,88,0.08)' }, inputCopy: { flex: 1 }, input: { height: 34, paddingVertical: 0, color: '#e4e8e9', fontSize: 11, letterSpacing: 0, outlineStyle: 'none' },
  settingRow: { minHeight: 66, paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center', gap: 10 }, inlineInputRow: { minHeight: 66, paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center', gap: 10 }, rowDivider: { borderBottomWidth: 1, borderBottomColor: '#223037' }, rowCopy: { flex: 1, minWidth: 0 }, rowLabel: { color: '#dfe3e4', fontSize: 11, fontWeight: '700', letterSpacing: 0 }, rowDescription: { marginTop: 3, color: '#7d898c', fontSize: 8, lineHeight: 11, letterSpacing: 0 }, dangerText: { color: '#ff736b' }, rowPressed: { backgroundColor: '#111d22' }, choiceValue: { maxWidth: 130, minWidth: 70, minHeight: 32, paddingHorizontal: 8, borderWidth: 1, borderColor: '#344147', borderRadius: 7, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 5 }, choiceValueText: { flexShrink: 1, color: ORANGE, fontSize: 8, fontWeight: '700', textAlign: 'right' },
  toggleTrack: { width: 44, height: 25, flexShrink: 0, padding: 3, borderRadius: 13, backgroundColor: '#344147', justifyContent: 'center' },
  toggleTrackActive: { backgroundColor: ORANGE },
  toggleThumb: { width: 19, height: 19, borderRadius: 10, backgroundColor: '#aeb7ba', transform: [{ translateX: 0 }] },
  toggleThumbActive: { backgroundColor: '#fff', transform: [{ translateX: 19 }] },
  modulesPanel: { borderWidth: 1, borderColor: '#26343a', borderRadius: 8, backgroundColor: '#081115', overflow: 'hidden' },
  moduleItem: { backgroundColor: '#0a1317' },
  moduleItemOpen: { backgroundColor: '#0b1519' },
  moduleDivider: { borderBottomWidth: 1, borderBottomColor: '#223037' },
  moduleHeader: { minHeight: 70, paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center', gap: 11 },
  moduleIcon: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, borderColor: '#513611', backgroundColor: 'rgba(255,122,0,0.07)', alignItems: 'center', justifyContent: 'center' },
  moduleCopy: { flex: 1, minWidth: 0 },
  moduleTitle: { color: '#e5e9ea', fontSize: 12, fontWeight: '700', letterSpacing: 0 },
  moduleSummary: { marginTop: 4, color: '#7f8b8f', fontSize: 9, letterSpacing: 0 },
  moduleBody: { borderTopWidth: 1, borderTopColor: '#2b393f', backgroundColor: '#071014' },
  stepper: { height: 34, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#344147', borderRadius: 7, overflow: 'hidden' }, stepperButton: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', backgroundColor: '#111c21' }, stepperDisabled: { opacity: 0.3 }, stepperValue: { minWidth: 58, color: '#e4e8e9', fontSize: 10, fontWeight: '700', textAlign: 'center', letterSpacing: 0 },
  actions: { marginTop: 16, flexDirection: 'row', gap: 8 }, cancelButton: { flex: 0.7, height: 50, borderWidth: 1, borderColor: '#2a383e', borderRadius: 8, alignItems: 'center', justifyContent: 'center' }, cancelText: { color: '#bac2c4', fontSize: 12, fontWeight: '600', letterSpacing: 0 }, saveButton: { flex: 1.3, height: 50, borderRadius: 8, backgroundColor: '#f66f00', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 }, saveText: { color: '#fff', fontSize: 12, fontWeight: '700', letterSpacing: 0 }, modalBackdrop: { flex: 1, padding: 18, backgroundColor: 'rgba(0,0,0,0.78)', alignItems: 'center', justifyContent: 'center' }, modalCard: { width: '100%', maxWidth: 440, padding: 13, borderWidth: 1, borderColor: '#344249', borderRadius: 8, backgroundColor: '#081115' }, modalHandle: { width: 34, height: 3, marginBottom: 12, borderRadius: 2, backgroundColor: '#465258', alignSelf: 'center' }, modalTitle: { color: '#eef1f2', fontSize: 16, fontWeight: '800' }, modalSubtitle: { marginTop: 4, marginBottom: 10, color: '#788589', fontSize: 9 }, modalOption: { height: 48, paddingHorizontal: 10, borderTopWidth: 1, borderTopColor: '#223037', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, modalOptionSelected: { backgroundColor: 'rgba(255,122,0,0.06)' }, modalOptionText: { color: '#aab4b7', fontSize: 10, fontWeight: '600' }, modalOptionTextSelected: { color: ORANGE, fontWeight: '800' }, pressed: { opacity: 0.72 },
});

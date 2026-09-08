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
import { FARMS } from './TeamScreen';

const HERO_IMAGE = require('./assets/team-hero.png');
const ORANGE = '#ff7a00';
const ROLES = ['Farm Manager', 'Farm Worker', 'Flock Care Lead', 'Breeding Specialist', 'Poultry Health Aide', 'Hatchery Assistant'];
const SHIFTS = ['5:00 AM - 2:00 PM', '6:00 AM - 3:00 PM', '7:00 AM - 4:00 PM', '8:00 AM - 5:00 PM', 'Flexible schedule'];
const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=300&q=82';

function HeaderButton({ onPress }) {
  return <Pressable accessibilityLabel="Back to team" onPress={onPress} style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}><Ionicons name="arrow-back" size={21} color="#eef1f2" /></Pressable>;
}

function InputField({ icon, label, value, onChangeText, placeholder, keyboardType = 'default' }) {
  return (
    <View style={styles.inputCard}>
      <View style={styles.fieldIcon}><MaterialCommunityIcons name={icon} size={20} color={ORANGE} /></View>
      <View style={styles.inputCopy}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor="#687579" keyboardType={keyboardType} selectionColor={ORANGE} style={styles.input} />
      </View>
    </View>
  );
}

function SelectField({ icon, label, value, placeholder, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.inputCard, pressed && styles.rowPressed]}>
      <View style={styles.fieldIcon}><MaterialCommunityIcons name={icon} size={20} color={ORANGE} /></View>
      <View style={styles.inputCopy}><Text style={styles.fieldLabel}>{label}</Text><Text numberOfLines={1} style={[styles.selectValue, !value && styles.placeholder]}>{value || placeholder}</Text></View>
      <Ionicons name="chevron-down" size={18} color="#849095" />
    </Pressable>
  );
}

function OptionModal({ visible, title, subtitle, options, selected, onSelect, onClose }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable style={styles.optionSheet} onPress={(event) => event.stopPropagation()}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}><View><Text style={styles.sheetTitle}>{title}</Text><Text style={styles.sheetSubtitle}>{subtitle}</Text></View><Pressable accessibilityLabel="Close" onPress={onClose} style={styles.sheetClose}><Ionicons name="close" size={20} color="#d8dddf" /></Pressable></View>
          {options.map((option, index) => (
            <Pressable key={option} onPress={() => onSelect(option)} style={({ pressed }) => [styles.optionRow, index < options.length - 1 && styles.divider, pressed && styles.rowPressed]}>
              <Text style={[styles.optionText, selected === option && styles.optionTextSelected]}>{option}</Text>
              {selected === option && <Ionicons name="checkmark-circle" size={20} color={ORANGE} />}
            </Pressable>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default function AddTeamMemberScreen({ onBack, onComplete }) {
  const { width } = useWindowDimensions();
  const compact = width < 480;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('Farm Worker');
  const [shift, setShift] = useState('6:00 AM - 3:00 PM');
  const [farmIds, setFarmIds] = useState(['main']);
  const [picker, setPicker] = useState(null);
  const farmOptions = FARMS.filter((farm) => farm.id !== 'all');
  const selectedFarmNames = farmOptions.filter((farm) => farmIds.includes(farm.id)).map((farm) => farm.name);

  const toggleFarm = (farmId) => {
    setFarmIds((current) => current.includes(farmId) ? current.filter((id) => id !== farmId) : [...current, farmId]);
  };

  const addMember = () => {
    if (!name.trim() || !role || !farmIds.length) {
      Alert.alert('Complete required fields', 'Enter the member name, choose a role, and assign at least one farm.');
      return;
    }
    const farmLabel = selectedFarmNames.length === farmOptions.length ? 'All Farms' : selectedFarmNames.length > 1 ? `${selectedFarmNames.length} farms` : selectedFarmNames[0];
    onComplete({
      id: `member-${Date.now()}`,
      name: name.trim(),
      role,
      team: farmLabel,
      farm: farmLabel,
      farmIds,
      image: DEFAULT_AVATAR,
      status: 'Available',
      statusColor: ORANGE,
      shift,
      tasks: 'No tasks assigned',
      email: email.trim(),
      phone: phone.trim(),
    });
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.pageWrap}>
        <View style={styles.page}>
          <View style={[styles.hero, compact && styles.heroCompact]}>
            <Image source={HERO_IMAGE} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="center" cachePolicy="memory-disk" />
            <LinearGradient colors={['rgba(2,7,9,0.2)', 'rgba(2,7,9,0.35)', '#03090c']} locations={[0, 0.5, 1]} style={StyleSheet.absoluteFill} />
            <SafeAreaView edges={['top']} style={styles.heroSafeArea}>
              <View style={styles.heroHeader}><HeaderButton onPress={onBack} /><Text style={styles.screenTitle}>Add Team Member</Text></View>
              <View style={styles.heroCopy}><Text style={[styles.farmName, compact && styles.farmNameCompact]}>FarmBuzz Farm</Text><Text style={styles.heroSubtitle}>Give a trusted person access to the farms and work they manage.</Text></View>
            </SafeAreaView>
          </View>

          <View style={[styles.content, compact && styles.contentCompact]}>
            <View style={styles.preview}>
              <View style={styles.previewAvatar}><MaterialCommunityIcons name="account-plus-outline" size={30} color={ORANGE} /></View>
              <View style={styles.previewCopy}><Text style={styles.previewEyebrow}>NEW MEMBER</Text><Text numberOfLines={1} style={styles.previewName}>{name.trim() || 'Team member name'}</Text><Text numberOfLines={1} style={styles.previewMeta}>{role} - {selectedFarmNames.length || 0} farm{selectedFarmNames.length === 1 ? '' : 's'}</Text></View>
            </View>

            <Text style={styles.sectionTitle}>Member Information</Text>
            <InputField icon="account-outline" label="Full Name *" value={name} onChangeText={setName} placeholder="Enter full name" />
            <SelectField icon="badge-account-outline" label="Role *" value={role} onPress={() => setPicker('role')} />
            <InputField icon="email-outline" label="Email" value={email} onChangeText={setEmail} placeholder="name@example.com" keyboardType="email-address" />
            <InputField icon="phone-outline" label="Phone Number" value={phone} onChangeText={setPhone} placeholder="Enter phone number" keyboardType="phone-pad" />

            <View style={styles.sectionHeading}><View><Text style={styles.sectionTitle}>Assigned Farms *</Text><Text style={styles.sectionSubtitle}>A member can work in more than one farm</Text></View><Text style={styles.selectedCount}>{farmIds.length} selected</Text></View>
            <View style={styles.farmPanel}>
              {farmOptions.map((farm, index) => {
                const selected = farmIds.includes(farm.id);
                return (
                  <Pressable key={farm.id} accessibilityRole="checkbox" accessibilityState={{ checked: selected }} onPress={() => toggleFarm(farm.id)} style={({ pressed }) => [styles.farmRow, index < farmOptions.length - 1 && styles.divider, pressed && styles.rowPressed]}>
                    <View style={[styles.farmIcon, selected && styles.farmIconSelected]}><MaterialCommunityIcons name="barn" size={20} color={selected ? ORANGE : '#829095'} /></View>
                    <View style={styles.farmCopy}><Text style={styles.farmRowName}>{farm.name}</Text><Text style={styles.farmLocation}>{farm.location}</Text></View>
                    <View style={[styles.checkbox, selected && styles.checkboxSelected]}>{selected && <Ionicons name="checkmark" size={15} color="#fff" />}</View>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.sectionTitle}>Work Schedule</Text>
            <SelectField icon="clock-outline" label="Default Shift" value={shift} onPress={() => setPicker('shift')} />
            <View style={styles.accessNote}><MaterialCommunityIcons name="shield-account-outline" size={22} color={ORANGE} /><View style={styles.accessCopy}><Text style={styles.accessTitle}>Role-based access</Text><Text style={styles.accessText}>You can review module permissions and task access from the member's detail screen after adding them.</Text></View></View>

            <View style={styles.actions}><Pressable onPress={onBack} style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}><Text style={styles.cancelText}>Cancel</Text></Pressable><Pressable onPress={addMember} style={({ pressed }) => [styles.saveButton, pressed && styles.pressed]}><MaterialCommunityIcons name="account-check-outline" size={20} color="#fff" /><Text style={styles.saveText}>Add Member</Text></Pressable></View>
          </View>
        </View>
      </ScrollView>
      <OptionModal visible={picker === 'role'} title="Choose Role" subtitle="Sets the member's default access" options={ROLES} selected={role} onClose={() => setPicker(null)} onSelect={(value) => { setRole(value); setPicker(null); }} />
      <OptionModal visible={picker === 'shift'} title="Choose Shift" subtitle="Default working schedule" options={SHIFTS} selected={shift} onClose={() => setPicker(null)} onSelect={(value) => { setShift(value); setPicker(null); }} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#020709' },
  pageWrap: { flexGrow: 1, alignItems: 'center', backgroundColor: '#020709' },
  page: { width: '100%', maxWidth: 720, backgroundColor: '#020709' },
  hero: { height: 260, overflow: 'hidden', backgroundColor: '#101719' },
  heroCompact: { height: 245 },
  heroSafeArea: { flex: 1 },
  heroHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: Platform.OS === 'web' ? 10 : 3 },
  headerButton: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(190,204,208,0.35)', backgroundColor: 'rgba(2,8,11,0.65)', alignItems: 'center', justifyContent: 'center' },
  screenTitle: { color: '#f1f3f3', fontSize: 17, fontWeight: '700' },
  heroCopy: { marginTop: 'auto', paddingHorizontal: 18, paddingBottom: 22 },
  farmName: { color: '#f5f6f6', fontSize: 32, lineHeight: 38, fontWeight: '800', fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', web: 'Georgia' }), textShadowColor: 'rgba(0,0,0,0.75)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 5 },
  farmNameCompact: { fontSize: 28, lineHeight: 34 },
  heroSubtitle: { maxWidth: 460, marginTop: 5, color: '#b9c1c3', fontSize: 13, lineHeight: 19 },
  content: { paddingHorizontal: 12, paddingBottom: 28 },
  contentCompact: { paddingHorizontal: 8 },
  preview: { minHeight: 76, marginTop: 10, padding: 11, borderWidth: 1, borderColor: '#60400f', borderRadius: 8, backgroundColor: 'rgba(255,122,0,0.055)', flexDirection: 'row', alignItems: 'center', gap: 11 },
  previewAvatar: { width: 48, height: 48, borderRadius: 24, borderWidth: 1, borderColor: '#69430d', backgroundColor: '#15180f', alignItems: 'center', justifyContent: 'center' },
  previewCopy: { flex: 1, minWidth: 0 }, previewEyebrow: { color: ORANGE, fontSize: 7, fontWeight: '800' }, previewName: { marginTop: 4, color: '#edf0f1', fontSize: 15, fontWeight: '700' }, previewMeta: { marginTop: 4, color: '#849095', fontSize: 9 },
  sectionTitle: { marginTop: 19, marginBottom: 7, color: '#e6eaeb', fontSize: 14, fontWeight: '700' },
  sectionHeading: { marginTop: 2, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  sectionSubtitle: { marginTop: -3, marginBottom: 7, color: '#758185', fontSize: 8 },
  selectedCount: { marginBottom: 7, color: ORANGE, fontSize: 8, fontWeight: '700' },
  inputCard: { minHeight: 62, marginBottom: 7, paddingHorizontal: 11, borderWidth: 1, borderColor: '#26343a', borderRadius: 8, backgroundColor: '#0a1317', flexDirection: 'row', alignItems: 'center', gap: 10 },
  fieldIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,122,0,0.08)', alignItems: 'center', justifyContent: 'center' },
  inputCopy: { flex: 1, minWidth: 0 }, fieldLabel: { color: '#aab4b7', fontSize: 8, fontWeight: '700' },
  input: { height: 29, paddingVertical: 0, color: '#edf0f1', fontSize: 11, outlineStyle: 'none' },
  selectValue: { marginTop: 4, color: '#e7ebec', fontSize: 11 }, placeholder: { color: '#687579' },
  farmPanel: { borderWidth: 1, borderColor: '#26343a', borderRadius: 8, backgroundColor: '#0a1317', overflow: 'hidden' },
  farmRow: { minHeight: 66, padding: 10, flexDirection: 'row', alignItems: 'center', gap: 10 }, divider: { borderBottomWidth: 1, borderBottomColor: '#223037' },
  farmIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#111d22', alignItems: 'center', justifyContent: 'center' }, farmIconSelected: { backgroundColor: 'rgba(255,122,0,0.09)' },
  farmCopy: { flex: 1, minWidth: 0 }, farmRowName: { color: '#dfe4e5', fontSize: 11, fontWeight: '700' }, farmLocation: { marginTop: 3, color: '#778387', fontSize: 8 },
  checkbox: { width: 22, height: 22, borderRadius: 5, borderWidth: 1, borderColor: '#455258', alignItems: 'center', justifyContent: 'center' }, checkboxSelected: { borderColor: ORANGE, backgroundColor: ORANGE },
  accessNote: { minHeight: 70, marginTop: 8, padding: 11, borderWidth: 1, borderColor: '#433414', borderRadius: 8, backgroundColor: '#12130e', flexDirection: 'row', alignItems: 'center', gap: 10 },
  accessCopy: { flex: 1 }, accessTitle: { color: '#e6e9ea', fontSize: 10, fontWeight: '700' }, accessText: { marginTop: 4, color: '#808b8e', fontSize: 8, lineHeight: 12 },
  actions: { marginTop: 14, flexDirection: 'row', gap: 8 }, cancelButton: { flex: 0.8, height: 52, borderWidth: 1, borderColor: '#2a373d', borderRadius: 8, alignItems: 'center', justifyContent: 'center' }, cancelText: { color: '#aeb7ba', fontSize: 11, fontWeight: '700' }, saveButton: { flex: 1.2, height: 52, borderRadius: 8, backgroundColor: '#f66f00', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 }, saveText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  modalBackdrop: { flex: 1, padding: 14, backgroundColor: 'rgba(0,0,0,0.72)', justifyContent: 'flex-end', alignItems: 'center' },
  optionSheet: { width: '100%', maxWidth: 700, paddingHorizontal: 12, paddingTop: 8, paddingBottom: 17, borderRadius: 8, borderWidth: 1, borderColor: '#2b3940', backgroundColor: '#091216' },
  sheetHandle: { width: 38, height: 4, borderRadius: 2, backgroundColor: '#435057', alignSelf: 'center', marginBottom: 10 }, sheetHeader: { minHeight: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, sheetTitle: { color: '#edf0f1', fontSize: 16, fontWeight: '700' }, sheetSubtitle: { marginTop: 3, color: '#7f8b8f', fontSize: 9 }, sheetClose: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#111d22', alignItems: 'center', justifyContent: 'center' },
  optionRow: { minHeight: 53, paddingHorizontal: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, optionText: { color: '#c8d0d2', fontSize: 11 }, optionTextSelected: { color: ORANGE, fontWeight: '700' },
  rowPressed: { backgroundColor: 'rgba(255,255,255,0.025)' }, pressed: { opacity: 0.72 },
});

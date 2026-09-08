import { useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const ORANGE = '#ff7a00';
const MODULES = ['Flock', 'Breeding', 'Health & Care', 'Eggs & Incubation', 'Tasks', 'Team'];
const LEVELS = ['None', 'View', 'Manage'];
const ROLES = ['Farm Manager', 'Farm Worker', 'Flock Care Lead', 'Breeding Specialist', 'Poultry Health Aide', 'Hatchery Assistant', 'Farm Assistant'];

const buildAccess = (manage = [], view = []) => Object.fromEntries(MODULES.map((module) => [module, manage.includes(module) ? 'Manage' : view.includes(module) ? 'View' : 'None']));

export const DEFAULT_MEMBER_ACCESS = {
  'Farm Manager': buildAccess(MODULES),
  'Flock Care Lead': buildAccess(['Flock', 'Tasks'], ['Health & Care', 'Team']),
  'Breeding Specialist': buildAccess(['Breeding', 'Eggs & Incubation', 'Tasks'], ['Flock']),
  'Poultry Health Aide': buildAccess(['Health & Care', 'Tasks'], ['Flock']),
  'Hatchery Assistant': buildAccess(['Eggs & Incubation', 'Tasks'], ['Breeding', 'Flock']),
  'Farm Worker': buildAccess(['Tasks'], ['Flock']),
  'Farm Assistant': buildAccess(['Tasks'], ['Flock']),
};

function HeaderButton({ onPress }) {
  return <Pressable accessibilityLabel="Back to member" onPress={onPress} style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}><Ionicons name="arrow-back" size={21} color="#eef1f2" /></Pressable>;
}

function PermissionRow({ module, value, onChange }) {
  const icon = module === 'Flock' ? 'bird' : module === 'Breeding' ? 'gender-male-female' : module === 'Health & Care' ? 'shield-cross-outline' : module === 'Eggs & Incubation' ? 'egg-outline' : module === 'Tasks' ? 'clipboard-check-outline' : 'account-group-outline';
  return <View style={styles.permissionRow}><View style={styles.permissionHeading}><View style={styles.permissionIcon}><MaterialCommunityIcons name={icon} size={19} color={ORANGE} /></View><View><Text style={styles.permissionModule}>{module}</Text><Text style={styles.permissionDescription}>{value === 'Manage' ? 'Create and update records' : value === 'View' ? 'View records only' : 'Module hidden'}</Text></View></View><View style={styles.levels}>{LEVELS.map((level) => <Pressable key={level} onPress={() => onChange(level)} style={[styles.level, value === level && styles.levelActive]}><Text style={[styles.levelText, value === level && styles.levelTextActive]}>{level}</Text></Pressable>)}</View></View>;
}

function ToggleRow({ icon, title, detail, value, onPress }) {
  return <Pressable accessibilityRole="switch" accessibilityState={{ checked: value }} onPress={onPress} style={styles.toggleRow}><View style={styles.toggleIcon}><MaterialCommunityIcons name={icon} size={19} color={ORANGE} /></View><View style={styles.toggleCopy}><Text style={styles.toggleTitle}>{title}</Text><Text style={styles.toggleDetail}>{detail}</Text></View><View style={[styles.switchTrack, value && styles.switchTrackActive]}><View style={[styles.switchThumb, value && styles.switchThumbActive]} /></View></Pressable>;
}

export default function EditMemberAccessScreen({ member, onBack, onSave }) {
  const { width } = useWindowDimensions();
  const compact = width < 480;
  const narrow = width < 380;
  const [role, setRole] = useState(member?.role || 'Farm Assistant');
  const [permissions, setPermissions] = useState({ ...(DEFAULT_MEMBER_ACCESS[member?.role] || DEFAULT_MEMBER_ACCESS['Farm Assistant']), ...(member?.permissions || {}) });
  const [canApprove, setCanApprove] = useState(member?.canApprove || false);
  const [canManageTeam, setCanManageTeam] = useState(member?.canManageTeam || member?.role === 'Farm Manager');
  const [roleOpen, setRoleOpen] = useState(false);
  if (!member) return null;

  const selectRole = (nextRole) => {
    setRole(nextRole);
    setPermissions(DEFAULT_MEMBER_ACCESS[nextRole]);
    setCanManageTeam(nextRole === 'Farm Manager' || nextRole.includes('Lead'));
    setRoleOpen(false);
  };

  const save = () => onSave({ ...member, role, permissions, canApprove, canManageTeam });

  return <View style={styles.screen}><StatusBar style="light" translucent backgroundColor="transparent" /><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.pageWrap}><View style={styles.page}>
    <View style={[styles.hero, compact && styles.heroCompact]}><Image source={member.image} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="center" cachePolicy="memory-disk" /><LinearGradient colors={['rgba(2,7,9,0.12)', 'rgba(2,7,9,0.38)', '#03090c']} locations={[0, 0.5, 1]} style={StyleSheet.absoluteFill} /><SafeAreaView edges={['top']} style={styles.heroSafeArea}><View style={styles.heroHeader}><HeaderButton onPress={onBack} /><Text style={styles.screenTitle}>Edit Role & Permissions</Text></View><View style={[styles.heroCopy, narrow && styles.heroCopyNarrow]}><Text numberOfLines={1} style={styles.memberName}>{member.name}</Text><Text style={styles.memberMeta}>{member.team} - {role}</Text></View></SafeAreaView></View>
    <View style={[styles.content, narrow && styles.contentNarrow]}>
      <Text style={styles.sectionTitle}>Member Role</Text><Pressable onPress={() => setRoleOpen(true)} style={styles.roleField}><View style={styles.roleIcon}><MaterialCommunityIcons name="badge-account-outline" size={20} color={ORANGE} /></View><View style={styles.roleCopy}><Text style={styles.fieldLabel}>ROLE</Text><Text style={styles.roleValue}>{role}</Text></View><Ionicons name="chevron-down" size={19} color="#8d999c" /></Pressable>
      <View style={styles.notice}><MaterialCommunityIcons name="information-outline" size={17} color={ORANGE} /><Text style={styles.noticeText}>Changing the role applies its recommended permissions. You can customize each module below.</Text></View>

      <View style={styles.sectionHeading}><Text style={styles.sectionTitle}>Module Access</Text><Text style={styles.sectionCount}>{Object.values(permissions).filter((level) => level !== 'None').length} enabled</Text></View>
      <View style={styles.permissions}>{MODULES.map((module) => <PermissionRow key={module} module={module} value={permissions[module]} onChange={(level) => setPermissions((current) => ({ ...current, [module]: level }))} />)}</View>

      <Text style={styles.sectionTitleWithMargin}>Additional Authority</Text><View style={styles.toggles}><ToggleRow icon="check-decagram-outline" title="Approve sensitive actions" detail="Approve transfers, health actions, and record changes." value={canApprove} onPress={() => setCanApprove((value) => !value)} /><ToggleRow icon="account-cog-outline" title="Manage team members" detail="Assign members, roles, schedules, and permissions." value={canManageTeam} onPress={() => setCanManageTeam((value) => !value)} /></View>

      <View style={styles.actions}><Pressable onPress={onBack} style={styles.cancelButton}><Text style={styles.cancelText}>Cancel</Text></Pressable><Pressable onPress={save} style={({ pressed }) => [styles.saveButton, pressed && styles.pressed]}><MaterialCommunityIcons name="content-save-check-outline" size={19} color="#fff" /><Text style={styles.saveText}>Save Changes</Text></Pressable></View>
    </View>
  </View></ScrollView>
  <Modal visible={roleOpen} transparent animationType="fade" onRequestClose={() => setRoleOpen(false)}><Pressable style={styles.modalBackdrop} onPress={() => setRoleOpen(false)}><Pressable style={styles.modalCard} onPress={() => {}}><View style={styles.modalHandle} /><Text style={styles.modalTitle}>Select Member Role</Text><Text style={styles.modalSubtitle}>Recommended permissions are applied automatically.</Text>{ROLES.map((item) => <Pressable key={item} onPress={() => selectRole(item)} style={[styles.roleOption, role === item && styles.roleOptionActive]}><View style={[styles.radio, role === item && styles.radioActive]}>{role === item && <View style={styles.radioCenter} />}</View><Text style={[styles.roleOptionText, role === item && styles.roleOptionTextActive]}>{item}</Text></Pressable>)}</Pressable></Pressable></Modal>
  </View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#020709' }, pageWrap: { flexGrow: 1, alignItems: 'center', backgroundColor: '#020709' }, page: { width: '100%', maxWidth: 720, backgroundColor: '#020709' }, hero: { height: 270, overflow: 'hidden', backgroundColor: '#101719' }, heroCompact: { height: 250 }, heroSafeArea: { flex: 1 }, heroHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: Platform.OS === 'web' ? 10 : 3 }, headerButton: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(190,204,208,0.35)', backgroundColor: 'rgba(2,8,11,0.65)', alignItems: 'center', justifyContent: 'center' }, screenTitle: { flex: 1, color: '#f1f3f3', fontSize: 17, fontWeight: '700' }, heroCopy: { marginTop: 'auto', paddingHorizontal: 18, paddingBottom: 24 }, heroCopyNarrow: { paddingHorizontal: 11, paddingBottom: 19 }, memberName: { color: '#f3f5f5', fontSize: 29, lineHeight: 35, fontWeight: '800' }, memberMeta: { marginTop: 4, color: '#b6bec1', fontSize: 11 },
  content: { paddingHorizontal: 12, paddingTop: 12, paddingBottom: 30 }, contentNarrow: { paddingHorizontal: 8 }, sectionTitle: { color: '#e7eaeb', fontSize: 14, fontWeight: '700' }, roleField: { height: 66, marginTop: 8, paddingHorizontal: 10, borderWidth: 1, borderColor: '#314047', borderRadius: 8, backgroundColor: '#0a1317', flexDirection: 'row', alignItems: 'center', gap: 10 }, roleIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,122,0,0.08)', alignItems: 'center', justifyContent: 'center' }, roleCopy: { flex: 1 }, fieldLabel: { color: '#747f83', fontSize: 7, fontWeight: '700' }, roleValue: { marginTop: 4, color: '#e2e6e7', fontSize: 11, fontWeight: '700' }, notice: { minHeight: 48, marginTop: 8, padding: 9, borderRadius: 7, backgroundColor: 'rgba(255,122,0,0.055)', flexDirection: 'row', alignItems: 'center', gap: 8 }, noticeText: { flex: 1, color: '#869296', fontSize: 8, lineHeight: 12 }, sectionHeading: { minHeight: 58, paddingTop: 18, paddingBottom: 8, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }, sectionCount: { color: ORANGE, fontSize: 8, fontWeight: '700' }, permissions: { borderWidth: 1, borderColor: '#26343a', borderRadius: 8, backgroundColor: '#0a1317', overflow: 'hidden' }, permissionRow: { minHeight: 92, padding: 10, borderBottomWidth: 1, borderBottomColor: '#223037' }, permissionHeading: { flexDirection: 'row', alignItems: 'center', gap: 9 }, permissionIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,122,0,0.08)', alignItems: 'center', justifyContent: 'center' }, permissionModule: { color: '#dfe3e4', fontSize: 10, fontWeight: '700' }, permissionDescription: { marginTop: 3, color: '#788488', fontSize: 7 }, levels: { height: 34, marginTop: 9, flexDirection: 'row', gap: 5 }, level: { flex: 1, borderWidth: 1, borderColor: '#344249', borderRadius: 6, alignItems: 'center', justifyContent: 'center' }, levelActive: { borderColor: ORANGE, backgroundColor: 'rgba(255,122,0,0.08)' }, levelText: { color: '#7e8a8e', fontSize: 8, fontWeight: '700' }, levelTextActive: { color: ORANGE }, sectionTitleWithMargin: { marginTop: 20, marginBottom: 8, color: '#e7eaeb', fontSize: 14, fontWeight: '700' }, toggles: { borderWidth: 1, borderColor: '#26343a', borderRadius: 8, backgroundColor: '#0a1317', overflow: 'hidden' }, toggleRow: { minHeight: 70, padding: 10, borderBottomWidth: 1, borderBottomColor: '#223037', flexDirection: 'row', alignItems: 'center', gap: 9 }, toggleIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,122,0,0.08)', alignItems: 'center', justifyContent: 'center' }, toggleCopy: { flex: 1 }, toggleTitle: { color: '#dfe3e4', fontSize: 10, fontWeight: '700' }, toggleDetail: { marginTop: 3, color: '#788488', fontSize: 7, lineHeight: 11 }, switchTrack: { width: 40, height: 23, padding: 3, borderRadius: 12, backgroundColor: '#2b373c', justifyContent: 'center' }, switchTrackActive: { backgroundColor: ORANGE }, switchThumb: { width: 17, height: 17, borderRadius: 9, backgroundColor: '#899397' }, switchThumbActive: { alignSelf: 'flex-end', backgroundColor: '#fff' }, actions: { marginTop: 15, flexDirection: 'row', gap: 8 }, cancelButton: { flex: 0.8, height: 50, borderWidth: 1, borderColor: '#344249', borderRadius: 8, alignItems: 'center', justifyContent: 'center' }, cancelText: { color: '#b6bec1', fontSize: 10, fontWeight: '700' }, saveButton: { flex: 1.2, height: 50, borderRadius: 8, backgroundColor: '#f66f00', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }, saveText: { color: '#fff', fontSize: 10, fontWeight: '800' }, pressed: { opacity: 0.72 },
  modalBackdrop: { flex: 1, padding: 18, backgroundColor: 'rgba(0,0,0,0.78)', alignItems: 'center', justifyContent: 'center' }, modalCard: { width: '100%', maxWidth: 500, padding: 13, borderWidth: 1, borderColor: '#344249', borderRadius: 8, backgroundColor: '#081115' }, modalHandle: { alignSelf: 'center', width: 38, height: 4, marginBottom: 12, borderRadius: 2, backgroundColor: '#3c484d' }, modalTitle: { color: '#edf0f1', fontSize: 17, fontWeight: '800' }, modalSubtitle: { marginTop: 4, marginBottom: 10, color: '#7f8b8f', fontSize: 8 }, roleOption: { minHeight: 48, paddingHorizontal: 9, borderTopWidth: 1, borderTopColor: '#223037', flexDirection: 'row', alignItems: 'center', gap: 10 }, roleOptionActive: { backgroundColor: 'rgba(255,122,0,0.05)' }, radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 1, borderColor: '#536167', alignItems: 'center', justifyContent: 'center' }, radioActive: { borderColor: ORANGE }, radioCenter: { width: 8, height: 8, borderRadius: 4, backgroundColor: ORANGE }, roleOptionText: { color: '#aab4b7', fontSize: 10 }, roleOptionTextActive: { color: ORANGE, fontWeight: '700' },
});

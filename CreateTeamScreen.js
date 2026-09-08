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

const TEAM_HERO_IMAGE = require('./assets/team-hero.png');
const ORANGE = '#ff7a00';
const FOCUSES = ['General Operations', 'Flock Care', 'Breeding', 'Health & Care', 'Incubation'];
const SCHEDULES = ['Morning Shift', 'Day Shift', 'Night Shift', 'Flexible'];

function HeaderButton({ onPress }) {
  return (
    <Pressable accessibilityLabel="Back to team" onPress={onPress} style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}>
      <Ionicons name="arrow-back" size={21} color="#eef1f2" />
    </Pressable>
  );
}

function DropdownField({ icon, label, value, options, open, onToggle, onSelect, renderOption }) {
  return (
    <View style={[styles.fieldCard, open && styles.fieldCardOpen]}>
      <Pressable onPress={onToggle} style={({ pressed }) => [styles.fieldTrigger, pressed && styles.rowPressed]}>
        <View style={styles.fieldIcon}><MaterialCommunityIcons name={icon} size={20} color={ORANGE} /></View>
        <View style={styles.fieldCopy}>
          <Text style={styles.fieldLabel}>{label}</Text>
          <Text numberOfLines={1} style={[styles.fieldValue, !value && styles.fieldPlaceholder]}>{value || `Select ${label.toLowerCase()}`}</Text>
        </View>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color="#8b969a" />
      </Pressable>
      {open && (
        <View style={styles.dropdownList}>
          {options.map((option) => {
            const optionValue = typeof option === 'string' ? option : option.name;
            const selected = value === optionValue;
            return (
              <Pressable key={typeof option === 'string' ? option : option.id} onPress={() => onSelect(option)} style={({ pressed }) => [styles.dropdownRow, pressed && styles.rowPressed]}>
                {renderOption ? renderOption(option) : <Text style={[styles.dropdownText, selected && styles.dropdownTextSelected]}>{option}</Text>}
                {selected && <Ionicons name="checkmark" size={18} color={ORANGE} />}
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

function MemberOption({ member, selected, onToggle }) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      onPress={onToggle}
      style={({ pressed }) => [styles.memberRow, selected && styles.memberRowSelected, pressed && styles.rowPressed]}
    >
      <Image source={member.image} style={styles.memberAvatar} contentFit="cover" cachePolicy="memory-disk" />
      <View style={styles.memberCopy}>
        <Text style={styles.memberName}>{member.name}</Text>
        <Text numberOfLines={1} style={styles.memberRole}>{member.role}</Text>
      </View>
      <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
        {selected && <Ionicons name="checkmark" size={15} color="#fff" />}
      </View>
    </Pressable>
  );
}

function TeamPreview({ name, focus, lead, selectedMembers }) {
  const previewMembers = lead
    ? [lead, ...selectedMembers.filter((member) => member.id !== lead.id)].slice(0, 4)
    : selectedMembers.slice(0, 4);

  return (
    <View style={styles.preview}>
      <View style={styles.previewIcon}><MaterialCommunityIcons name="account-group-outline" size={27} color={ORANGE} /></View>
      <View style={styles.previewCopy}>
        <Text style={styles.previewEyebrow}>TEAM PREVIEW</Text>
        <Text numberOfLines={1} style={styles.previewName}>{name.trim() || 'New Team'}</Text>
        <Text numberOfLines={1} style={styles.previewMeta}>{focus || 'Choose a team focus'}{lead ? ` - Led by ${lead.name}` : ''}</Text>
      </View>
      <View style={styles.previewAvatars}>
        {previewMembers.map((member, index) => (
          <Image key={member.id} source={member.image} style={[styles.previewAvatar, index > 0 && styles.previewAvatarTrailing]} contentFit="cover" cachePolicy="memory-disk" />
        ))}
        {!previewMembers.length && <Text style={styles.previewCount}>0</Text>}
      </View>
    </View>
  );
}

export default function CreateTeamScreen({ members = [], onBack, onComplete }) {
  const { width } = useWindowDimensions();
  const compact = width < 480;
  const narrow = width < 390;
  const [name, setName] = useState('');
  const [focus, setFocus] = useState('');
  const [lead, setLead] = useState(null);
  const [memberIds, setMemberIds] = useState([]);
  const [schedule, setSchedule] = useState('Day Shift');
  const [responsibilities, setResponsibilities] = useState('');
  const [openField, setOpenField] = useState(null);
  const selectedMembers = useMemo(() => members.filter((member) => memberIds.includes(member.id)), [memberIds, members]);
  const canCreate = name.trim() && focus && lead;

  const toggleMember = (member) => {
    setMemberIds((current) => current.includes(member.id)
      ? current.filter((id) => id !== member.id)
      : [...current, member.id]);
  };

  const createTeam = () => {
    if (!canCreate) {
      Alert.alert('Complete required fields', 'Enter a team name, choose its focus, and assign a team lead.');
      return;
    }
    const finalMemberIds = Array.from(new Set([lead.id, ...memberIds]));
    onComplete({
      id: `team-${Date.now()}`,
      name: name.trim(),
      focus,
      leadId: lead.id,
      leadName: lead.name,
      memberIds: finalMemberIds,
      memberImages: members.filter((member) => finalMemberIds.includes(member.id)).map((member) => member.image),
      schedule,
      responsibilities: responsibilities.trim(),
    });
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.pageWrap}>
        <View style={styles.page}>
          <View style={[styles.hero, compact && styles.heroCompact]}>
            <Image source={TEAM_HERO_IMAGE} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="center" cachePolicy="memory-disk" />
            <LinearGradient colors={['rgba(2,7,9,0.2)', 'rgba(2,7,9,0.35)', '#03090c']} locations={[0, 0.5, 1]} style={StyleSheet.absoluteFill} />
            <SafeAreaView edges={['top']} style={styles.heroSafeArea}>
              <View style={styles.heroHeader}>
                <HeaderButton onPress={onBack} />
                <Text style={styles.screenTitle}>Create Team</Text>
              </View>
              <View style={[styles.heroCopy, narrow && styles.heroCopyNarrow]}>
                <Text style={[styles.farmName, narrow && styles.farmNameNarrow]}>FarmBuzz Farm</Text>
                <Text style={styles.heroSubtitle}>Organize people around a clear farm responsibility.</Text>
              </View>
            </SafeAreaView>
          </View>

          <View style={[styles.content, narrow && styles.contentNarrow]}>
            <TeamPreview name={name} focus={focus} lead={lead} selectedMembers={selectedMembers} />

            <View style={styles.nameCard}>
              <View style={styles.fieldIcon}><MaterialCommunityIcons name="account-group-outline" size={20} color={ORANGE} /></View>
              <View style={styles.nameFieldCopy}>
                <View style={styles.requiredRow}><Text style={styles.fieldLabel}>Team Name</Text><Text style={styles.required}>*</Text></View>
                <TextInput value={name} onChangeText={setName} maxLength={45} placeholder="e.g. Flock Care Team" placeholderTextColor="#6f7b7f" selectionColor={ORANGE} style={styles.nameInput} />
              </View>
            </View>

            <DropdownField
              icon="target"
              label="Team Focus"
              value={focus}
              options={FOCUSES}
              open={openField === 'focus'}
              onToggle={() => setOpenField((current) => current === 'focus' ? null : 'focus')}
              onSelect={(value) => { setFocus(value); setOpenField(null); }}
            />
            <DropdownField
              icon="account-star-outline"
              label="Team Lead"
              value={lead?.name}
              options={members}
              open={openField === 'lead'}
              onToggle={() => setOpenField((current) => current === 'lead' ? null : 'lead')}
              onSelect={(member) => { setLead(member); setOpenField(null); }}
              renderOption={(member) => (
                <View style={styles.leadOption}>
                  <Image source={member.image} style={styles.leadAvatar} contentFit="cover" cachePolicy="memory-disk" />
                  <View><Text style={styles.dropdownText}>{member.name}</Text><Text style={styles.leadRole}>{member.role}</Text></View>
                </View>
              )}
            />

            <View style={styles.membersCard}>
              <View style={styles.membersHeading}>
                <View>
                  <Text style={styles.membersTitle}>Team Members</Text>
                  <Text style={styles.membersSubtitle}>Select people to include in this team.</Text>
                </View>
                <View style={styles.memberCountBadge}><Text style={styles.memberCountText}>{memberIds.length} selected</Text></View>
              </View>
              <View style={styles.memberList}>
                {members.map((member) => <MemberOption key={member.id} member={member} selected={memberIds.includes(member.id)} onToggle={() => toggleMember(member)} />)}
              </View>
            </View>

            <DropdownField
              icon="clock-outline"
              label="Default Schedule"
              value={schedule}
              options={SCHEDULES}
              open={openField === 'schedule'}
              onToggle={() => setOpenField((current) => current === 'schedule' ? null : 'schedule')}
              onSelect={(value) => { setSchedule(value); setOpenField(null); }}
            />

            <View style={styles.notesCard}>
              <View style={styles.notesHeading}><MaterialCommunityIcons name="clipboard-text-outline" size={20} color={ORANGE} /><Text style={styles.notesTitle}>Responsibilities</Text></View>
              <TextInput value={responsibilities} onChangeText={setResponsibilities} multiline textAlignVertical="top" maxLength={300} placeholder="Describe what this team is responsible for..." placeholderTextColor="#6f7b7f" selectionColor={ORANGE} style={styles.notesInput} />
            </View>

            <View style={styles.actions}>
              <Pressable onPress={onBack} style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}><Text style={styles.cancelText}>Cancel</Text></Pressable>
              <Pressable disabled={!canCreate} onPress={createTeam} style={({ pressed }) => [styles.createButton, !canCreate && styles.createButtonDisabled, pressed && canCreate && styles.pressed]}>
                <MaterialCommunityIcons name="account-multiple-plus-outline" size={20} color="#fff" />
                <Text style={styles.createText}>Create Team</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#020709' }, pageWrap: { flexGrow: 1, alignItems: 'center', backgroundColor: '#020709' }, page: { width: '100%', maxWidth: 720, backgroundColor: '#020709' },
  hero: { height: 245, overflow: 'hidden', backgroundColor: '#101719' }, heroCompact: { height: 230 }, heroSafeArea: { flex: 1 },
  heroHeader: { flexDirection: 'row', alignItems: 'center', gap: 13, paddingHorizontal: 16, paddingTop: Platform.OS === 'web' ? 10 : 3 },
  headerButton: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(190,204,208,0.35)', backgroundColor: 'rgba(2,8,11,0.65)', alignItems: 'center', justifyContent: 'center' },
  screenTitle: { color: '#f2f4f4', fontSize: 18, fontWeight: '700', letterSpacing: 0 }, heroCopy: { marginTop: 'auto', paddingHorizontal: 18, paddingBottom: 25 }, heroCopyNarrow: { paddingHorizontal: 11, paddingBottom: 20 },
  farmName: { color: '#f5f6f6', fontSize: 32, lineHeight: 38, fontWeight: '800', letterSpacing: 0, fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', web: 'Georgia' }), textShadowColor: 'rgba(0,0,0,0.75)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 5 }, farmNameNarrow: { fontSize: 28, lineHeight: 33 },
  heroSubtitle: { marginTop: 5, color: '#c0c7c9', fontSize: 13, letterSpacing: 0 }, content: { paddingHorizontal: 14, paddingTop: 14, paddingBottom: 30, gap: 10 }, contentNarrow: { paddingHorizontal: 9 },
  preview: { minHeight: 76, padding: 11, borderWidth: 1, borderColor: '#5b3b14', borderRadius: 8, backgroundColor: 'rgba(255,122,0,0.045)', flexDirection: 'row', alignItems: 'center', gap: 10 }, previewIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,122,0,0.1)', alignItems: 'center', justifyContent: 'center' }, previewCopy: { flex: 1, minWidth: 0 }, previewEyebrow: { color: ORANGE, fontSize: 7, fontWeight: '800', letterSpacing: 0 }, previewName: { marginTop: 3, color: '#edf0f1', fontSize: 14, fontWeight: '800', letterSpacing: 0 }, previewMeta: { marginTop: 3, color: '#879296', fontSize: 8, letterSpacing: 0 }, previewAvatars: { minWidth: 34, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }, previewAvatar: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: '#172126' }, previewAvatarTrailing: { marginLeft: -10 }, previewCount: { color: '#738084', fontSize: 11 },
  fieldCard: { borderWidth: 1, borderColor: '#26343a', borderRadius: 8, backgroundColor: '#0a1317', overflow: 'hidden' }, fieldCardOpen: { borderColor: '#69410e' }, fieldTrigger: { minHeight: 58, paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center', gap: 10 }, fieldIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,122,0,0.08)', alignItems: 'center', justifyContent: 'center' }, fieldCopy: { flex: 1, minWidth: 0 }, fieldLabel: { color: '#dfe3e4', fontSize: 10, fontWeight: '700', letterSpacing: 0 }, fieldValue: { marginTop: 4, color: '#c2c9cb', fontSize: 11, letterSpacing: 0 }, fieldPlaceholder: { color: '#707c80' },
  nameCard: { minHeight: 68, paddingHorizontal: 11, borderWidth: 1, borderColor: '#26343a', borderRadius: 8, backgroundColor: '#0a1317', flexDirection: 'row', alignItems: 'center', gap: 10 }, nameFieldCopy: { flex: 1 }, requiredRow: { flexDirection: 'row', alignItems: 'center', gap: 3 }, required: { color: '#ff5047', fontSize: 11, fontWeight: '700' }, nameInput: { height: 35, paddingVertical: 0, color: '#e6eaeb', fontSize: 12, letterSpacing: 0, outlineStyle: 'none' },
  dropdownList: { borderTopWidth: 1, borderTopColor: '#223037' }, dropdownRow: { minHeight: 46, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }, dropdownText: { color: '#b7c0c2', fontSize: 11, letterSpacing: 0 }, dropdownTextSelected: { color: ORANGE, fontWeight: '700' }, leadOption: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 9 }, leadAvatar: { width: 34, height: 34, borderRadius: 17 }, leadRole: { marginTop: 2, color: '#758084', fontSize: 8, letterSpacing: 0 },
  membersCard: { padding: 10, borderWidth: 1, borderColor: '#26343a', borderRadius: 8, backgroundColor: '#0a1317' }, membersHeading: { minHeight: 42, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }, membersTitle: { color: '#dfe3e4', fontSize: 12, fontWeight: '700', letterSpacing: 0 }, membersSubtitle: { marginTop: 3, color: '#788488', fontSize: 8, letterSpacing: 0 }, memberCountBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, backgroundColor: 'rgba(255,122,0,0.08)' }, memberCountText: { color: ORANGE, fontSize: 8, fontWeight: '700', letterSpacing: 0 }, memberList: { borderWidth: 1, borderColor: '#223037', borderRadius: 7, overflow: 'hidden' }, memberRow: { minHeight: 54, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: '#223037', flexDirection: 'row', alignItems: 'center', gap: 9 }, memberRowSelected: { backgroundColor: 'rgba(255,122,0,0.04)' }, memberAvatar: { width: 36, height: 36, borderRadius: 18 }, memberCopy: { flex: 1, minWidth: 0 }, memberName: { color: '#dce1e2', fontSize: 10, fontWeight: '600', letterSpacing: 0 }, memberRole: { marginTop: 2, color: '#778286', fontSize: 8, letterSpacing: 0 }, checkbox: { width: 21, height: 21, borderRadius: 5, borderWidth: 1, borderColor: '#4a585e', alignItems: 'center', justifyContent: 'center' }, checkboxSelected: { borderColor: ORANGE, backgroundColor: ORANGE },
  notesCard: { padding: 10, borderWidth: 1, borderColor: '#26343a', borderRadius: 8, backgroundColor: '#0a1317' }, notesHeading: { flexDirection: 'row', alignItems: 'center', gap: 8 }, notesTitle: { color: '#dfe3e4', fontSize: 11, fontWeight: '700', letterSpacing: 0 }, notesInput: { minHeight: 86, marginTop: 8, padding: 10, borderWidth: 1, borderColor: '#223138', borderRadius: 7, color: '#e2e6e7', fontSize: 11, letterSpacing: 0, outlineStyle: 'none' },
  actions: { flexDirection: 'row', gap: 8 }, cancelButton: { flex: 0.7, height: 50, borderWidth: 1, borderColor: '#2a383e', borderRadius: 8, alignItems: 'center', justifyContent: 'center' }, cancelText: { color: '#bac2c4', fontSize: 12, fontWeight: '600', letterSpacing: 0 }, createButton: { flex: 1.3, height: 50, minWidth: 0, paddingHorizontal: 10, borderRadius: 8, backgroundColor: '#f66f00', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 }, createButtonDisabled: { backgroundColor: '#3b4143', opacity: 0.65 }, createText: { color: '#fff', fontSize: 12, fontWeight: '700', letterSpacing: 0 },
  rowPressed: { backgroundColor: '#111d22' }, pressed: { opacity: 0.72 },
});

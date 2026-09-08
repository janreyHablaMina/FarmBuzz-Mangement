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

const TEAM_HERO_IMAGE = require('./assets/team-hero.png');
const ORANGE = '#ff7a00';

const ACCESS_BY_FOCUS = {
  'General Operations': [
    { module: 'Flock', icon: 'bird', level: 'Manage' },
    { module: 'Tasks', icon: 'clipboard-check-outline', level: 'Manage' },
    { module: 'Team', icon: 'account-group-outline', level: 'View' },
    { module: 'Ownership History', icon: 'swap-horizontal', level: 'View' },
  ],
  'Flock Care': [
    { module: 'Flock', icon: 'bird', level: 'Manage' },
    { module: 'Health & Care', icon: 'shield-cross-outline', level: 'View' },
    { module: 'Tasks', icon: 'clipboard-check-outline', level: 'Manage' },
  ],
  Breeding: [
    { module: 'Breeding', icon: 'gender-male-female', level: 'Manage' },
    { module: 'Eggs & Incubation', icon: 'egg-outline', level: 'Manage' },
    { module: 'Flock', icon: 'bird', level: 'View' },
    { module: 'Tasks', icon: 'clipboard-check-outline', level: 'Manage' },
  ],
  'Health & Care': [
    { module: 'Health & Care', icon: 'shield-cross-outline', level: 'Manage' },
    { module: 'Flock', icon: 'bird', level: 'View' },
    { module: 'Tasks', icon: 'clipboard-check-outline', level: 'Manage' },
  ],
  Incubation: [
    { module: 'Eggs & Incubation', icon: 'egg-outline', level: 'Manage' },
    { module: 'Breeding', icon: 'gender-male-female', level: 'View' },
    { module: 'Tasks', icon: 'clipboard-check-outline', level: 'Manage' },
  ],
};

function HeaderButton({ icon, label, onPress }) {
  return (
    <Pressable accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}>
      <Ionicons name={icon} size={21} color="#eef1f2" />
    </Pressable>
  );
}

function Fact({ icon, label, value, isLast }) {
  return (
    <View style={[styles.fact, !isLast && styles.factDivider]}>
      <View style={styles.factIcon}><MaterialCommunityIcons name={icon} size={20} color={ORANGE} /></View>
      <Text style={styles.factValue}>{value}</Text>
      <Text style={styles.factLabel}>{label}</Text>
    </View>
  );
}

function MemberRow({ member, isLead, isLast, onPress }) {
  return (
    <Pressable
      accessibilityLabel={`Open team member ${member.name}`}
      onPress={onPress}
      style={({ pressed }) => [styles.memberRow, !isLast && styles.rowDivider, pressed && styles.rowPressed]}
    >
      <View style={styles.avatarWrap}>
        <Image source={member.image} style={styles.avatar} contentFit="cover" cachePolicy="memory-disk" />
        <View style={[styles.presenceDot, { backgroundColor: member.statusColor }]} />
      </View>
      <View style={styles.memberCopy}>
        <View style={styles.memberNameRow}>
          <Text numberOfLines={1} style={styles.memberName}>{member.name}</Text>
          {isLead && <View style={styles.leadBadge}><Text style={styles.leadBadgeText}>Lead</Text></View>}
        </View>
        <Text numberOfLines={1} style={styles.memberRole}>{member.role}</Text>
        <View style={styles.memberMeta}>
          <MaterialCommunityIcons name="clock-outline" size={13} color="#758185" />
          <Text numberOfLines={1} style={styles.memberMetaText}>{member.shift}</Text>
        </View>
      </View>
      <View style={styles.memberAside}>
        <Text style={[styles.memberStatus, { color: member.statusColor }]}>{member.status}</Text>
        <Text numberOfLines={1} style={styles.memberTasks}>{member.tasks}</Text>
      </View>
      <Ionicons name="chevron-forward" size={19} color="#899397" />
    </Pressable>
  );
}

function AccessRow({ item, isLast }) {
  const canManage = item.level === 'Manage';
  return (
    <View style={[styles.accessRow, !isLast && styles.rowDivider]}>
      <View style={styles.accessIcon}><MaterialCommunityIcons name={item.icon} size={20} color={ORANGE} /></View>
      <View style={styles.accessCopy}>
        <Text style={styles.accessModule}>{item.module}</Text>
        <Text style={styles.accessDescription}>{canManage ? 'Create, update, and manage records' : 'View records without making changes'}</Text>
      </View>
      <View style={[styles.accessBadge, canManage && styles.accessBadgeManage]}>
        <MaterialCommunityIcons name={canManage ? 'pencil-outline' : 'eye-outline'} size={13} color={canManage ? ORANGE : '#9ba6a9'} />
        <Text style={[styles.accessBadgeText, canManage && styles.accessBadgeTextManage]}>{item.level}</Text>
      </View>
    </View>
  );
}

function formatTeamId(id) {
  const knownIds = { operations: 'OPS', 'flock-care': 'FLC', breeding: 'BRD' };
  const suffix = knownIds[id] || id.replace(/[^a-z0-9]/gi, '').slice(-6).toUpperCase();
  return `TEAM-${suffix || '001'}`;
}

export default function TeamDetailScreen({ team, members = [], onBack, onOpenMember }) {
  const { width } = useWindowDimensions();
  const compact = width < 480;
  const narrow = width < 390;

  if (!team) {
    return (
      <View style={styles.missingScreen}>
        <MaterialCommunityIcons name="account-group-outline" size={42} color="#687478" />
        <Text style={styles.missingTitle}>Team record unavailable</Text>
        <Pressable onPress={onBack} style={styles.missingButton}><Text style={styles.missingButtonText}>Back to Team</Text></Pressable>
      </View>
    );
  }

  const teamMembers = members.filter((member) => team.memberIds.includes(member.id));
  const lead = teamMembers.find((member) => member.id === team.leadId)
    || teamMembers.find((member) => member.name === team.leadName)
    || null;
  const onDuty = teamMembers.filter((member) => member.status !== 'Off duty').length;
  const responsibilities = team.responsibilities || 'No responsibilities have been added for this team.';
  const access = team.access || ACCESS_BY_FOCUS[team.focus] || ACCESS_BY_FOCUS['General Operations'];

  return (
    <View style={styles.screen}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.pageWrap}>
        <View style={styles.page}>
          <View style={[styles.hero, compact && styles.heroCompact]}>
            <Image source={TEAM_HERO_IMAGE} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="center" cachePolicy="memory-disk" />
            <LinearGradient colors={['rgba(2,7,9,0.22)', 'rgba(2,7,9,0.28)', 'rgba(2,7,9,0.9)', '#03090c']} locations={[0, 0.4, 0.82, 1]} style={StyleSheet.absoluteFill} />
            <SafeAreaView edges={['top']} style={styles.heroSafeArea}>
              <View style={styles.heroHeader}>
                <View style={styles.heroHeaderLeft}><HeaderButton icon="arrow-back" label="Back to teams" onPress={onBack} /><Text style={styles.screenTitle}>Team Details</Text></View>
                <HeaderButton icon="ellipsis-horizontal" label="Team options" onPress={() => Alert.alert('Team options', `More actions for ${team.name} will appear here.`)} />
              </View>
              <View style={[styles.heroCopy, narrow && styles.heroCopyNarrow]}>
                <View style={styles.heroBadge}><MaterialCommunityIcons name="account-group-outline" size={16} color={ORANGE} /><Text style={styles.heroBadgeText}>{formatTeamId(team.id)}</Text></View>
                <Text numberOfLines={2} style={[styles.teamName, narrow && styles.teamNameNarrow]}>{team.name}</Text>
                <Text style={styles.teamFocus}>{team.focus}</Text>
              </View>
            </SafeAreaView>
          </View>

          <View style={[styles.content, narrow && styles.contentNarrow]}>
            <View style={styles.leadPanel}>
              {lead ? <Image source={lead.image} style={styles.leadImage} contentFit="cover" cachePolicy="memory-disk" /> : <View style={styles.leadPlaceholder}><MaterialCommunityIcons name="account-outline" size={29} color="#707c80" /></View>}
              <View style={styles.leadCopy}>
                <Text style={styles.eyebrow}>TEAM LEAD</Text>
                <Text style={styles.leadName}>{team.leadName}</Text>
                <Text style={styles.leadRole}>{lead?.role || 'Team Lead'}</Text>
              </View>
              <View style={styles.leadActions}>
                <Pressable accessibilityLabel="Call team lead" onPress={() => Alert.alert('Call', `Call ${team.leadName}`)} style={styles.iconAction}><Ionicons name="call-outline" size={17} color={ORANGE} /></Pressable>
                <Pressable accessibilityLabel="Message team lead" onPress={() => Alert.alert('Message', `Message ${team.leadName}`)} style={styles.iconAction}><Ionicons name="chatbubble-outline" size={17} color={ORANGE} /></Pressable>
              </View>
            </View>

            <View style={styles.factsPanel}>
              <Fact icon="account-multiple-outline" value={String(teamMembers.length)} label="Members" />
              <Fact icon="account-check-outline" value={String(onDuty)} label="Available" />
              <Fact icon="clock-outline" value={team.schedule} label="Schedule" isLast />
            </View>

            <Text style={styles.sectionTitle}>Responsibilities</Text>
            <View style={styles.responsibilityPanel}>
              <View style={styles.responsibilityIcon}><MaterialCommunityIcons name="clipboard-text-outline" size={22} color={ORANGE} /></View>
              <Text style={styles.responsibilityText}>{responsibilities}</Text>
            </View>

            <View style={styles.sectionHeading}>
              <Text style={styles.sectionTitle}>Team Members</Text>
              <Text style={styles.sectionCount}>{teamMembers.length} people</Text>
            </View>
            <View style={styles.membersPanel}>
              {teamMembers.map((member, index) => <MemberRow key={member.id} member={member} isLead={member.id === lead?.id} isLast={index === teamMembers.length - 1} onPress={() => onOpenMember(member)} />)}
              {!teamMembers.length && <View style={styles.emptyMembers}><Text style={styles.emptyText}>No members assigned</Text></View>}
            </View>

            <View style={styles.accessHeading}>
              <View>
                <Text style={styles.sectionTitle}>Access & Permissions</Text>
                <Text style={styles.accessSubtitle}>Applied to every member of this team.</Text>
              </View>
              <Pressable onPress={() => Alert.alert('Edit permissions', `Update access for ${team.name}.`)} hitSlop={8}>
                <Text style={styles.editAccess}>Edit access</Text>
              </Pressable>
            </View>
            <View style={styles.accessPanel}>
              {access.map((item, index) => <AccessRow key={item.module} item={item} isLast={index === access.length - 1} />)}
            </View>

            <View style={styles.coveragePanel}>
              <View style={styles.coverageIcon}><MaterialCommunityIcons name="shield-check-outline" size={23} color={ORANGE} /></View>
              <View style={styles.coverageCopy}><Text style={styles.coverageTitle}>Current Coverage</Text><Text style={styles.coverageText}>{onDuty} of {teamMembers.length} team members are currently available.</Text></View>
              <View style={styles.coverageCount}><Text style={styles.coverageCountText}>{onDuty}/{teamMembers.length}</Text></View>
            </View>

            <View style={styles.actions}>
              <Pressable onPress={() => Alert.alert('Edit team', `Edit ${team.name}.`)} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}><MaterialCommunityIcons name="pencil-outline" size={20} color={ORANGE} /><Text style={styles.secondaryText}>Edit Team</Text></Pressable>
              <Pressable onPress={() => Alert.alert('Assign task', `Create a task for ${team.name}.`)} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}><MaterialCommunityIcons name="clipboard-plus-outline" size={20} color="#fff" /><Text style={styles.primaryText}>Assign Task</Text></Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#020709' }, pageWrap: { flexGrow: 1, alignItems: 'center', backgroundColor: '#020709' }, page: { width: '100%', maxWidth: 720, backgroundColor: '#020709' },
  hero: { height: 305, overflow: 'hidden', backgroundColor: '#101719' }, heroCompact: { height: 280 }, heroSafeArea: { flex: 1 }, heroHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: Platform.OS === 'web' ? 10 : 3 }, heroHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerButton: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(190,204,208,0.35)', backgroundColor: 'rgba(2,8,11,0.65)', alignItems: 'center', justifyContent: 'center' }, screenTitle: { color: '#f1f3f3', fontSize: 17, fontWeight: '700', letterSpacing: 0 },
  heroCopy: { marginTop: 'auto', paddingHorizontal: 18, paddingBottom: 27 }, heroCopyNarrow: { paddingHorizontal: 11, paddingBottom: 22 }, heroBadge: { alignSelf: 'flex-start', height: 27, paddingHorizontal: 9, borderWidth: 1, borderColor: '#67410f', borderRadius: 14, backgroundColor: 'rgba(255,122,0,0.07)', flexDirection: 'row', alignItems: 'center', gap: 6 }, heroBadgeText: { color: '#e1a35a', fontSize: 8, fontWeight: '700', letterSpacing: 0 }, teamName: { marginTop: 9, color: '#f2f4f4', fontSize: 31, lineHeight: 37, fontWeight: '800', letterSpacing: 0 }, teamNameNarrow: { fontSize: 26, lineHeight: 31 }, teamFocus: { marginTop: 4, color: '#aab4b7', fontSize: 12, letterSpacing: 0 },
  content: { paddingHorizontal: 14, paddingTop: 14, paddingBottom: 30 }, contentNarrow: { paddingHorizontal: 9 }, leadPanel: { minHeight: 82, padding: 11, borderWidth: 1, borderColor: '#2b393f', borderRadius: 8, backgroundColor: '#0a1317', flexDirection: 'row', alignItems: 'center', gap: 10 }, leadImage: { width: 58, height: 58, borderRadius: 29, borderWidth: 1, borderColor: '#68430f' }, leadPlaceholder: { width: 58, height: 58, borderRadius: 29, borderWidth: 1, borderColor: '#354248', alignItems: 'center', justifyContent: 'center' }, leadCopy: { flex: 1, minWidth: 0 }, eyebrow: { color: ORANGE, fontSize: 7, fontWeight: '800', letterSpacing: 0 }, leadName: { marginTop: 4, color: '#e8ebec', fontSize: 14, fontWeight: '800', letterSpacing: 0 }, leadRole: { marginTop: 3, color: '#849094', fontSize: 9, letterSpacing: 0 }, leadActions: { flexDirection: 'row', gap: 6 }, iconAction: { width: 34, height: 34, borderWidth: 1, borderColor: '#3c331f', borderRadius: 17, backgroundColor: 'rgba(255,122,0,0.05)', alignItems: 'center', justifyContent: 'center' },
  factsPanel: { minHeight: 103, marginTop: 10, marginBottom: 18, paddingVertical: 12, borderWidth: 1, borderColor: '#28353a', borderRadius: 8, backgroundColor: '#0a1317', flexDirection: 'row' }, fact: { flex: 1, minWidth: 0, paddingHorizontal: 6, alignItems: 'center', justifyContent: 'center' }, factDivider: { borderRightWidth: 1, borderRightColor: '#26343a' }, factIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,122,0,0.07)', alignItems: 'center', justifyContent: 'center' }, factValue: { marginTop: 5, color: '#eef1f2', fontSize: 12, fontWeight: '800', textAlign: 'center', letterSpacing: 0 }, factLabel: { marginTop: 3, color: '#7e898d', fontSize: 8, textAlign: 'center', letterSpacing: 0 },
  sectionTitle: { color: '#e7eaeb', fontSize: 14, fontWeight: '700', letterSpacing: 0, marginBottom: 8 }, responsibilityPanel: { minHeight: 66, marginBottom: 18, padding: 11, borderWidth: 1, borderColor: '#28353a', borderRadius: 8, backgroundColor: '#0a1317', flexDirection: 'row', alignItems: 'center', gap: 10 }, responsibilityIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,122,0,0.07)', alignItems: 'center', justifyContent: 'center' }, responsibilityText: { flex: 1, color: '#a1abad', fontSize: 10, lineHeight: 15, letterSpacing: 0 }, sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, sectionCount: { marginBottom: 8, color: '#839094', fontSize: 9, letterSpacing: 0 },
  membersPanel: { borderWidth: 1, borderColor: '#28353a', borderRadius: 8, backgroundColor: '#0a1317', overflow: 'hidden' }, memberRow: { minHeight: 77, padding: 9, flexDirection: 'row', alignItems: 'center', gap: 9 }, rowDivider: { borderBottomWidth: 1, borderBottomColor: '#223037' }, rowPressed: { backgroundColor: '#111d22' }, avatarWrap: { position: 'relative' }, avatar: { width: 48, height: 48, borderRadius: 24 }, presenceDot: { position: 'absolute', right: 0, bottom: 1, width: 11, height: 11, borderRadius: 6, borderWidth: 2, borderColor: '#0a1317' }, memberCopy: { flex: 1, minWidth: 0 }, memberNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 }, memberName: { flexShrink: 1, color: '#e4e8e9', fontSize: 11, fontWeight: '700', letterSpacing: 0 }, leadBadge: { paddingHorizontal: 6, paddingVertical: 3, borderRadius: 8, backgroundColor: 'rgba(255,122,0,0.1)' }, leadBadgeText: { color: ORANGE, fontSize: 7, fontWeight: '700', letterSpacing: 0 }, memberRole: { marginTop: 3, color: '#859195', fontSize: 8, letterSpacing: 0 }, memberMeta: { marginTop: 5, flexDirection: 'row', alignItems: 'center', gap: 4 }, memberMetaText: { color: '#748085', fontSize: 8, letterSpacing: 0 }, memberAside: { maxWidth: 105, alignItems: 'flex-end', gap: 5 }, memberStatus: { fontSize: 8, fontWeight: '700', letterSpacing: 0 }, memberTasks: { color: '#798589', fontSize: 8, letterSpacing: 0 }, emptyMembers: { height: 90, alignItems: 'center', justifyContent: 'center' }, emptyText: { color: '#758084', fontSize: 10, letterSpacing: 0 },
  accessHeading: { marginTop: 18, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }, accessSubtitle: { marginTop: -4, marginBottom: 8, color: '#7d898d', fontSize: 8, letterSpacing: 0 }, editAccess: { marginBottom: 8, color: ORANGE, fontSize: 9, fontWeight: '700', letterSpacing: 0 }, accessPanel: { borderWidth: 1, borderColor: '#28353a', borderRadius: 8, backgroundColor: '#0a1317', overflow: 'hidden' }, accessRow: { minHeight: 65, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 10 }, accessIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,122,0,0.07)', alignItems: 'center', justifyContent: 'center' }, accessCopy: { flex: 1, minWidth: 0 }, accessModule: { color: '#dfe3e4', fontSize: 10, fontWeight: '700', letterSpacing: 0 }, accessDescription: { marginTop: 3, color: '#758185', fontSize: 8, letterSpacing: 0 }, accessBadge: { minWidth: 58, height: 28, paddingHorizontal: 7, borderWidth: 1, borderColor: '#344147', borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 }, accessBadgeManage: { borderColor: '#65400e', backgroundColor: 'rgba(255,122,0,0.06)' }, accessBadgeText: { color: '#9ba6a9', fontSize: 8, fontWeight: '700', letterSpacing: 0 }, accessBadgeTextManage: { color: ORANGE },
  coveragePanel: { minHeight: 70, marginTop: 10, padding: 10, borderWidth: 1, borderColor: '#563811', borderRadius: 8, backgroundColor: 'rgba(255,122,0,0.045)', flexDirection: 'row', alignItems: 'center', gap: 10 }, coverageIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,122,0,0.09)', alignItems: 'center', justifyContent: 'center' }, coverageCopy: { flex: 1, minWidth: 0 }, coverageTitle: { color: '#e5e9ea', fontSize: 10, fontWeight: '700', letterSpacing: 0 }, coverageText: { marginTop: 3, color: '#869296', fontSize: 8, letterSpacing: 0 }, coverageCount: { minWidth: 42, height: 30, paddingHorizontal: 7, borderRadius: 15, borderWidth: 1, borderColor: '#71460f', alignItems: 'center', justifyContent: 'center' }, coverageCountText: { color: ORANGE, fontSize: 10, fontWeight: '800', letterSpacing: 0 },
  actions: { marginTop: 10, flexDirection: 'row', gap: 8 }, secondaryButton: { flex: 0.9, height: 50, borderWidth: 1, borderColor: '#68400e', borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 }, secondaryText: { color: ORANGE, fontSize: 11, fontWeight: '700', letterSpacing: 0 }, primaryButton: { flex: 1.1, height: 50, borderRadius: 8, backgroundColor: '#f66f00', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 }, primaryText: { color: '#fff', fontSize: 11, fontWeight: '700', letterSpacing: 0 }, pressed: { opacity: 0.72 },
  missingScreen: { flex: 1, padding: 24, backgroundColor: '#020709', alignItems: 'center', justifyContent: 'center' }, missingTitle: { marginTop: 12, color: '#d8ddde', fontSize: 17, fontWeight: '700', letterSpacing: 0 }, missingButton: { height: 44, marginTop: 18, paddingHorizontal: 18, borderRadius: 8, backgroundColor: '#f66f00', alignItems: 'center', justifyContent: 'center' }, missingButtonText: { color: '#fff', fontSize: 12, fontWeight: '700', letterSpacing: 0 },
});

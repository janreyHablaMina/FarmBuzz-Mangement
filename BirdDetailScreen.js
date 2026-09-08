import { useState } from 'react';
import {
  Alert,
  Modal,
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
import { FLOCK_HERO_IMAGE } from './constants';

const ORANGE = '#ff7a00';

const PROFILE_SECTIONS = [
  { key: 'health', title: 'Health & Care', subtitle: 'Health records, treatments and vaccinations', icon: 'stethoscope' },
  { key: 'breeding', title: 'Breeding', subtitle: 'Pairing and breeding history', icon: 'gender-male-female' },
  { key: 'pedigree', title: 'Pedigree & Bloodline', subtitle: 'View parents and lineage', icon: 'dna' },
  { key: 'location', title: 'Location', subtitle: 'Current location and movement history', icon: 'map-marker-outline' },
  { key: 'ownership', title: 'Ownership', subtitle: 'Current owner and transfer history', icon: 'account-outline' },
  { key: 'notes', title: 'Notes & Observations', subtitle: 'Notes and observations about this bird', icon: 'note-edit-outline' },
  { key: 'media', title: 'Media', subtitle: 'Photos and videos', icon: 'image-multiple-outline' },
  { key: 'documents', title: 'Documents & Attachments', subtitle: 'Certificates, records and supporting files', icon: 'folder-multiple-outline' },
];

function HeaderButton({ icon, label, onPress, transparent = false }) {
  return (
    <Pressable
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.headerButton, transparent && styles.headerButtonTransparent, pressed && styles.pressed]}
    >
      <Ionicons name={icon} size={21} color="#eef1f2" />
    </Pressable>
  );
}

function ProfileMetric({ fact, compact, isLast }) {
  return (
    <View style={[
      styles.profileMetric,
      compact && styles.profileMetricCompact,
      !isLast && styles.profileMetricDivider,
    ]}>
      <View style={styles.metricHeading}>
        <MaterialCommunityIcons name={fact.icon} size={compact ? 17 : 19} color={ORANGE} />
        <Text numberOfLines={1} style={styles.metricLabel}>{fact.label}</Text>
      </View>
      <Text numberOfLines={2} style={[styles.metricValue, compact && styles.metricValueCompact]}>{fact.value}</Text>
      <Text numberOfLines={1} style={styles.metricDetail}>{fact.detail}</Text>
    </View>
  );
}

function BirdAction({ icon, label, detail, destructive, onPress }) {
  const color = destructive ? '#ff5252' : ORANGE;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.menuAction, pressed && styles.menuActionPressed]}
    >
      <View style={[styles.menuActionIcon, destructive && styles.menuActionIconDestructive]}>
        <MaterialCommunityIcons name={icon} size={21} color={color} />
      </View>
      <View style={styles.menuActionCopy}>
        <Text style={[styles.menuActionLabel, destructive && styles.menuActionLabelDestructive]}>{label}</Text>
        <Text numberOfLines={1} style={styles.menuActionDetail}>{detail}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#718084" />
    </Pressable>
  );
}

function ProfileSection({ section, isLast, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${section.title}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.sectionRow,
        !isLast && styles.rowDivider,
        pressed && styles.sectionRowPressed,
      ]}
    >
      <View style={styles.sectionIcon}>
        <MaterialCommunityIcons name={section.icon} size={20} color={ORANGE} />
      </View>
      <View style={styles.sectionCopy}>
        <Text style={styles.sectionTitle}>{section.title}</Text>
        <Text numberOfLines={2} style={styles.sectionSubtitle}>{section.subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#9ba5a8" />
    </Pressable>
  );
}

function formatSavedDate(value) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  }).format(date);
}

function estimateHatchedDate(ageText) {
  if (!ageText) return 'Not recorded';
  if (ageText.toLowerCase().includes('less than')) return 'Approx. this month';
  const amount = Number.parseInt(ageText, 10);
  if (!Number.isFinite(amount)) return 'Not recorded';

  const estimated = new Date();
  if (ageText.toLowerCase().includes('year')) estimated.setFullYear(estimated.getFullYear() - amount);
  else estimated.setMonth(estimated.getMonth() - amount);

  return `Approx. ${new Intl.DateTimeFormat('en-US', {
    month: 'short', year: 'numeric',
  }).format(estimated)}`;
}

function makeFarmBuzzId(bird, ringText) {
  if (bird.farmBuzzId) return bird.farmBuzzId;
  const digits = (ringText || bird.name).replace(/\D/g, '').slice(-5) || '001';
  return `FBZ-${new Date().getFullYear()}-${digits.padStart(3, '0')}`;
}

export default function BirdDetailScreen({ bird, onBack, onEdit, onOpenPedigree, onOpenHealthCare, onOpenBreeding, onOpenLocation, onOpenOwnership, onOpenMedia, onOpenDocuments, onOpenNotes }) {
  const { width } = useWindowDimensions();
  const [moreVisible, setMoreVisible] = useState(false);
  const compact = width < 520;
  const narrow = width < 380;

  if (!bird) {
    return (
      <View style={styles.missingScreen}>
        <MaterialCommunityIcons name="bird" size={40} color="#687478" />
        <Text style={styles.missingTitle}>Bird record unavailable</Text>
        <Pressable onPress={onBack} style={({ pressed }) => [styles.missingButton, pressed && styles.pressed]}>
          <Text style={styles.missingButtonText}>Back to Flock</Text>
        </Pressable>
      </View>
    );
  }

  const female = bird.filter === 'hen' || bird.filter === 'pullet';
  const profileSections = PROFILE_SECTIONS.map((section) => {
    if (section.key !== 'breeding') return section;
    if (bird.filter === 'hen') return { ...section, title: 'Egg Production & Breeding', subtitle: 'Laying records, pairings and hatch results', icon: 'egg-outline' };
    if (bird.filter === 'pullet') return { ...section, title: 'Egg Production', subtitle: 'Laying readiness and future breeding record', icon: 'egg-outline' };
    return { ...section, title: 'Breeding Performance', subtitle: bird.filter === 'stag' ? 'Pairing eligibility and future sire record' : 'Pairings, fertility and offspring history', icon: 'gender-male' };
  });
  const ring = bird.details.find((detail) => detail.icon === 'tag-outline');
  const age = bird.details.find((detail) => detail.icon === 'calendar-month-outline');
  const hatched = formatSavedDate(bird.hatchedDate) || estimateHatchedDate(age?.text);
  const farmBuzzId = makeFarmBuzzId(bird, ring?.text);
  const ringFromName = bird.name.match(/ring\s*(#[a-z0-9-]+)/i)?.[1];
  const ringValue = ring?.text && !ring.text.toLowerCase().includes('unavailable') ? ring.text.replace(/^ring\s*/i, '') : ringFromName || 'Not assigned';
  const profileMetrics = [
    { label: 'Age & Hatch', value: age?.text || 'Not recorded', detail: hatched, icon: 'calendar-clock-outline' },
    { label: 'Current Pen', value: bird.currentLocation || 'Pen 3', detail: bird.currentArea || 'North Flock House', icon: 'map-marker-outline' },
  ];

  const openSection = (section) => {
    if (section.key === 'pedigree') {
      onOpenPedigree?.();
      return;
    }
    if (section.key === 'health') {
      onOpenHealthCare?.();
      return;
    }
    if (section.key === 'breeding') {
      onOpenBreeding?.();
      return;
    }
    if (section.key === 'location') {
      onOpenLocation?.();
      return;
    }
    if (section.key === 'ownership') {
      onOpenOwnership?.();
      return;
    }
    if (section.key === 'media') {
      onOpenMedia?.();
      return;
    }
    if (section.key === 'documents') {
      onOpenDocuments?.();
      return;
    }
    if (section.key === 'notes') {
      onOpenNotes?.();
      return;
    }
    Alert.alert(section.title, `${section.title} for ${bird.name} will open here.`);
  };

  const closeMore = () => setMoreVisible(false);
  const openEdit = () => {
    closeMore();
    onEdit?.();
  };
  const shareQrProfile = () => {
    closeMore();
    Alert.alert('Share QR Profile', `${bird.name}'s QR profile (${farmBuzzId}) is ready to share.`);
  };
  const confirmRecordAction = (title, message, confirmLabel) => {
    closeMore();
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel' },
      { text: confirmLabel, style: 'destructive' },
    ]);
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.pageWrap}>
        <View style={styles.page}>
          <View style={[styles.hero, compact && styles.heroCompact]}>
            <Image
              source={FLOCK_HERO_IMAGE}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              contentPosition="center 42%"
              cachePolicy="memory-disk"
              transition={250}
            />
            <LinearGradient
              colors={['rgba(2,7,9,0.12)', 'rgba(2,7,9,0.28)', 'rgba(2,7,9,0.88)', '#03090c']}
              locations={[0, 0.4, 0.76, 1]}
              style={StyleSheet.absoluteFill}
            />
            <SafeAreaView edges={['top']} style={styles.heroSafeArea}>
              <View style={styles.heroHeader}>
                <View style={styles.heroHeaderLeft}>
                  <HeaderButton icon="arrow-back" label="Back to flock" onPress={onBack} />
                  <Text style={styles.screenTitle}>Bird Profile</Text>
                </View>
                <HeaderButton
                  icon="ellipsis-horizontal"
                  label="Bird options"
                  transparent
                  onPress={() => setMoreVisible(true)}
                />
              </View>

              <View style={[styles.heroCopy, compact && styles.heroCopyCompact, narrow && styles.heroCopyNarrow]}>
                <View style={[styles.heroPortrait, compact && styles.heroPortraitCompact]}>
                  <Image
                    source={bird.image || FLOCK_HERO_IMAGE}
                    style={StyleSheet.absoluteFill}
                    contentFit="cover"
                    contentPosition="center"
                    cachePolicy="memory-disk"
                    transition={250}
                  />
                </View>
                <View style={styles.heroIdentity}>
                  <Text numberOfLines={2} style={[styles.birdName, compact && styles.birdNameCompact, narrow && styles.birdNameNarrow]}>{bird.name}</Text>
                  <View style={styles.birdMetaRow}>
                    <Text numberOfLines={1} style={styles.bloodline}>{bird.bloodline}</Text>
                    <View style={styles.metaDivider} />
                    <MaterialCommunityIcons name={female ? 'gender-female' : 'gender-male'} size={16} color={ORANGE} />
                    <Text style={styles.typeText}>{bird.type}</Text>
                  </View>
                  <View style={[
                    styles.statusBadge,
                    { borderColor: `${bird.statusColor}55`, backgroundColor: bird.statusBackground },
                  ]}>
                    <View style={[styles.statusDot, { backgroundColor: bird.statusColor }]} />
                    <Text style={[styles.statusText, { color: bird.statusColor }]}>{bird.status}</Text>
                  </View>
                </View>
              </View>
            </SafeAreaView>
          </View>

          <View style={[styles.content, narrow && styles.contentNarrow]}>
            <View style={[styles.identityCard, !compact && styles.identityCardWide]}>
              <View style={[styles.identityHeader, !compact && styles.identityHeaderWide]}>
                <View style={styles.identityIcon}>
                  <MaterialCommunityIcons name="qrcode-scan" size={23} color={ORANGE} />
                </View>
                <View style={styles.identityCopy}>
                  <Text style={styles.identityLabel}>FarmBuzz ID</Text>
                  <Text numberOfLines={1} style={styles.identityValue}>{farmBuzzId}</Text>
                </View>
                <View style={styles.ringBadge}>
                  <MaterialCommunityIcons name="tag-outline" size={15} color={ORANGE} />
                  <View style={styles.ringCopy}>
                    <Text style={styles.ringLabel}>Ring</Text>
                    <Text numberOfLines={1} style={styles.ringValue}>{ringValue}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.profileMetrics}>
                {profileMetrics.map((fact, index) => (
                  <ProfileMetric
                    key={fact.label}
                    fact={fact}
                    compact={compact}
                    isLast={index === profileMetrics.length - 1}
                  />
                ))}
              </View>
            </View>

            <View style={styles.sectionsPanel}>
              {profileSections.map((section, index) => (
                <ProfileSection
                  key={section.key}
                  section={section}
                  isLast={index === profileSections.length - 1}
                  onPress={() => openSection(section)}
                />
              ))}
            </View>

            <View style={[styles.actions, narrow && styles.actionsNarrow]}>
              <Pressable
                onPress={onEdit}
                style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
              >
                <MaterialCommunityIcons name="pencil-outline" size={21} color={ORANGE} />
                <Text style={[styles.actionText, narrow && styles.actionTextNarrow]}>Edit Details</Text>
              </Pressable>
              <Pressable
                onPress={onOpenOwnership}
                style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
              >
                <MaterialCommunityIcons name="swap-horizontal" size={23} color={ORANGE} />
                <Text style={[styles.actionText, narrow && styles.actionTextNarrow]}>Transfer Bird</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>

      <Modal
        transparent
        visible={moreVisible}
        animationType="fade"
        statusBarTranslucent
        onRequestClose={closeMore}
      >
        <View style={styles.menuOverlay}>
          <Pressable accessibilityLabel="Close bird actions" onPress={closeMore} style={StyleSheet.absoluteFill} />
          <View style={styles.menuSheet}>
            <View style={styles.menuHandle} />
            <View style={styles.menuHeader}>
              <View style={styles.menuHeaderCopy}>
                <Text style={styles.menuTitle}>Bird Actions</Text>
                <Text numberOfLines={1} style={styles.menuSubtitle}>{bird.name} · {farmBuzzId}</Text>
              </View>
              <Pressable accessibilityLabel="Close" onPress={closeMore} style={({ pressed }) => [styles.menuClose, pressed && styles.pressed]}>
                <Ionicons name="close" size={20} color="#dce1e2" />
              </Pressable>
            </View>

            <View style={styles.menuActions}>
              <BirdAction icon="pencil-outline" label="Edit Details" detail="Update this bird's profile" onPress={openEdit} />
              <BirdAction icon="qrcode-scan" label="Share QR Profile" detail="Share its FarmBuzz record" onPress={shareQrProfile} />
              <BirdAction
                icon="archive-outline"
                label="Archive Bird"
                detail="Hide from the active flock"
                onPress={() => confirmRecordAction('Archive Bird', `Archive ${bird.name}? You can restore this record later.`, 'Archive')}
              />
              <BirdAction
                icon="heart-off-outline"
                label="Mark as Deceased"
                detail="Close the bird's active record"
                onPress={() => confirmRecordAction('Mark as Deceased', `Mark ${bird.name} as deceased? This will remove the bird from the active flock.`, 'Confirm')}
              />
              <View style={styles.menuDangerDivider} />
              <BirdAction
                icon="trash-can-outline"
                label="Delete Record"
                detail="Permanently remove this record"
                destructive
                onPress={() => confirmRecordAction('Delete Record', `Permanently delete ${bird.name}'s record? This cannot be undone.`, 'Delete')}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#020709' },
  pageWrap: { flexGrow: 1, alignItems: 'center', backgroundColor: '#020709' },
  page: { width: '100%', maxWidth: 720, backgroundColor: '#020709' },
  hero: { height: 350, overflow: 'hidden', backgroundColor: '#101719' },
  heroCompact: { height: 305 },
  heroSafeArea: { flex: 1 },
  heroHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: Platform.OS === 'web' ? 10 : 3 },
  heroHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  headerButton: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(190,204,208,0.35)', backgroundColor: 'rgba(2,8,11,0.65)', alignItems: 'center', justifyContent: 'center' },
  headerButtonTransparent: { borderColor: 'transparent', backgroundColor: 'transparent' },
  screenTitle: { color: '#f3f5f5', fontSize: 18, fontWeight: '700', letterSpacing: 0 },
  heroCopy: { marginTop: 'auto', paddingHorizontal: 18, paddingBottom: 24, flexDirection: 'row', alignItems: 'flex-end', gap: 16 },
  heroCopyCompact: { paddingBottom: 18, gap: 12 },
  heroCopyNarrow: { paddingHorizontal: 12 },
  heroPortrait: { width: 104, height: 104, borderRadius: 8, borderWidth: 2, borderColor: ORANGE, overflow: 'hidden', backgroundColor: '#11191c', shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.45, shadowRadius: 9, elevation: 7 },
  heroPortraitCompact: { width: 82, height: 82, borderRadius: 7 },
  heroIdentity: { flex: 1, minWidth: 0 },
  birdMetaRow: { marginTop: 5, flexDirection: 'row', alignItems: 'center', gap: 5 },
  typeText: { color: '#e0e4e5', fontSize: 13, fontWeight: '600', letterSpacing: 0 },
  metaDivider: { width: 3, height: 3, marginHorizontal: 2, borderRadius: 2, backgroundColor: '#758085' },
  birdName: { marginTop: 5, color: '#fff', fontSize: 36, lineHeight: 42, fontWeight: '800', letterSpacing: 0, textShadowColor: 'rgba(0,0,0,0.75)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 5 },
  birdNameCompact: { fontSize: 29, lineHeight: 34 },
  birdNameNarrow: { fontSize: 26, lineHeight: 31 },
  bloodline: { maxWidth: '62%', minWidth: 0, color: '#c1c7c9', fontSize: 13, letterSpacing: 0 },
  statusBadge: { alignSelf: 'flex-start', minHeight: 27, marginTop: 9, paddingHorizontal: 10, borderRadius: 14, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: 11, fontWeight: '700', letterSpacing: 0 },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 30 },
  contentNarrow: { paddingHorizontal: 9 },
  identityCard: { borderWidth: 1, borderColor: '#26343a', borderRadius: 8, backgroundColor: '#0a1317', overflow: 'hidden' },
  identityCardWide: { flexDirection: 'row', minHeight: 112 },
  identityHeader: { minHeight: 68, paddingHorizontal: 13, paddingVertical: 11, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#223037' },
  identityHeaderWide: { width: '38%', borderBottomWidth: 0, borderRightWidth: 1, borderRightColor: '#223037' },
  identityIcon: { width: 36, height: 36, borderRadius: 7, backgroundColor: 'rgba(255,122,0,0.09)', alignItems: 'center', justifyContent: 'center' },
  identityCopy: { flex: 1, minWidth: 0, marginLeft: 10 },
  identityLabel: { color: '#8f9a9d', fontSize: 9, letterSpacing: 0 },
  identityValue: { marginTop: 3, color: '#f2f4f4', fontSize: 14, fontWeight: '800', letterSpacing: 0 },
  ringBadge: { maxWidth: '38%', minHeight: 38, paddingHorizontal: 9, borderWidth: 1, borderColor: '#59401f', borderRadius: 7, backgroundColor: 'rgba(255,122,0,0.05)', flexDirection: 'row', alignItems: 'center', gap: 6 },
  ringCopy: { minWidth: 0 },
  ringLabel: { color: '#8f9a9d', fontSize: 7, letterSpacing: 0 },
  ringValue: { marginTop: 1, color: '#f0f2f2', fontSize: 11, fontWeight: '700', letterSpacing: 0 },
  profileMetrics: { flex: 1, flexDirection: 'row' },
  profileMetric: { flex: 1, minWidth: 0, paddingHorizontal: 13, paddingVertical: 15, justifyContent: 'center' },
  profileMetricCompact: { minHeight: 84, paddingVertical: 10 },
  profileMetricDivider: { borderRightWidth: 1, borderRightColor: '#223037' },
  metricHeading: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metricLabel: { flex: 1, color: '#8f9a9d', fontSize: 9, letterSpacing: 0 },
  metricValue: { marginTop: 8, color: '#f0f2f2', fontSize: 13, lineHeight: 17, fontWeight: '700', letterSpacing: 0 },
  metricValueCompact: { marginTop: 6, fontSize: 11, lineHeight: 14 },
  metricDetail: { marginTop: 3, color: '#687579', fontSize: 7, lineHeight: 10, letterSpacing: 0 },
  sectionsPanel: { marginTop: 16, borderWidth: 1, borderColor: '#26343a', borderRadius: 8, backgroundColor: '#0a1317', overflow: 'hidden' },
  sectionRow: { minHeight: 76, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 11 },
  sectionRowPressed: { backgroundColor: '#111d22' },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: '#223037' },
  sectionIcon: { width: 40, height: 40, borderRadius: 7, backgroundColor: 'rgba(255,122,0,0.07)', alignItems: 'center', justifyContent: 'center' },
  sectionCopy: { flex: 1, minWidth: 0 },
  sectionTitle: { color: '#e7eaeb', fontSize: 14, fontWeight: '600', letterSpacing: 0 },
  sectionSubtitle: { marginTop: 4, color: '#8f9a9d', fontSize: 10, lineHeight: 14, letterSpacing: 0 },
  actions: { marginTop: 14, flexDirection: 'row', gap: 9 },
  actionsNarrow: { gap: 6 },
  actionButton: { flex: 1, minWidth: 0, height: 50, paddingHorizontal: 8, borderWidth: 1, borderColor: '#70400f', borderRadius: 8, backgroundColor: '#0a1317', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  actionText: { color: '#dce1e2', fontSize: 12, fontWeight: '600', letterSpacing: 0 },
  actionTextNarrow: { fontSize: 10 },
  menuOverlay: { flex: 1, paddingHorizontal: 10, paddingBottom: 10, backgroundColor: 'rgba(0,0,0,0.68)', justifyContent: 'flex-end', alignItems: 'center' },
  menuSheet: { width: '100%', maxWidth: 700, paddingHorizontal: 12, paddingBottom: 12, borderWidth: 1, borderColor: '#2b3a40', borderRadius: 8, backgroundColor: '#081115' },
  menuHandle: { alignSelf: 'center', width: 34, height: 3, marginTop: 8, borderRadius: 2, backgroundColor: '#46545a' },
  menuHeader: { minHeight: 62, paddingHorizontal: 4, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#223037' },
  menuHeaderCopy: { flex: 1, minWidth: 0 },
  menuTitle: { color: '#f1f3f3', fontSize: 16, fontWeight: '800', letterSpacing: 0 },
  menuSubtitle: { marginTop: 3, color: '#7f8c90', fontSize: 9, letterSpacing: 0 },
  menuClose: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#111c20', alignItems: 'center', justifyContent: 'center' },
  menuActions: { paddingTop: 5 },
  menuAction: { minHeight: 58, paddingHorizontal: 5, flexDirection: 'row', alignItems: 'center', gap: 11, borderRadius: 7 },
  menuActionPressed: { backgroundColor: '#111d22' },
  menuActionIcon: { width: 38, height: 38, borderRadius: 7, backgroundColor: 'rgba(255,122,0,0.08)', alignItems: 'center', justifyContent: 'center' },
  menuActionIconDestructive: { backgroundColor: 'rgba(255,82,82,0.08)' },
  menuActionCopy: { flex: 1, minWidth: 0 },
  menuActionLabel: { color: '#e8ebec', fontSize: 12, fontWeight: '700', letterSpacing: 0 },
  menuActionLabelDestructive: { color: '#ff6868' },
  menuActionDetail: { marginTop: 3, color: '#778589', fontSize: 9, letterSpacing: 0 },
  menuDangerDivider: { height: 1, marginVertical: 5, backgroundColor: '#32262a' },
  missingScreen: { flex: 1, backgroundColor: '#020709', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 24 },
  missingTitle: { color: '#dce1e2', fontSize: 16, fontWeight: '700', letterSpacing: 0 },
  missingButton: { height: 44, marginTop: 8, paddingHorizontal: 18, borderRadius: 8, backgroundColor: ORANGE, alignItems: 'center', justifyContent: 'center' },
  missingButtonText: { color: '#fff', fontSize: 13, fontWeight: '700', letterSpacing: 0 },
  pressed: { opacity: 0.72 },
});

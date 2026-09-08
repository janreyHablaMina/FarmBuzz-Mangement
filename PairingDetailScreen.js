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
import { BREEDING_HERO_IMAGE } from './constants';
import { OFFSPRING_RECORDS } from './OffspringScreen';

const ORANGE = '#ff7a00';

function getTodayValue() {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${today.getFullYear()}-${month}-${day}`;
}

function formatCollectionDate(value) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}

function getFarmBuzzId(name, savedId) {
  if (savedId) return savedId;
  const digits = name.replace(/\D/g, '').slice(-5) || '001';
  return `FBZ-${new Date().getFullYear()}-${digits.padStart(3, '0')}`;
}

function HeaderButton({ icon, label, onPress }) {
  return (
    <Pressable
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}
    >
      <Ionicons name={icon} size={21} color="#eef1f2" />
    </Pressable>
  );
}

function BirdMember({ label, name, image, gender, id, bloodline, compact }) {
  const farmBuzzId = getFarmBuzzId(name, id);

  return (
    <View style={[styles.member, compact && styles.memberCompact]}>
      <View style={styles.memberImageWrap}>
        <Image source={image} style={[styles.memberImage, compact && styles.memberImageCompact]} contentFit="cover" cachePolicy="memory-disk" />
      </View>
      <View style={styles.memberCopy}>
        <Text style={styles.memberLabel}>{label}</Text>
        <View style={styles.memberNameRow}>
          <Text numberOfLines={1} style={[styles.memberName, compact && styles.memberNameCompact]}>{name}</Text>
          <MaterialCommunityIcons
            name={gender === 'male' ? 'gender-male' : 'gender-female'}
            size={compact ? 17 : 20}
            color={gender === 'male' ? '#3898ff' : '#ff4f87'}
          />
        </View>
        <Text numberOfLines={1} style={styles.memberBloodline}>{bloodline}</Text>
        <View style={styles.memberIdBadge}>
          <Text numberOfLines={1} style={styles.memberId}>{farmBuzzId}</Text>
        </View>
      </View>
    </View>
  );
}

function Fact({ icon, label, value, isLast }) {
  return (
    <View style={[styles.fact, !isLast && styles.factDivider]}>
      <View style={styles.factIcon}>
        <MaterialCommunityIcons name={icon} size={19} color={ORANGE} />
      </View>
      <Text style={styles.factLabel}>{label}</Text>
      <Text numberOfLines={2} style={styles.factValue}>{value}</Text>
    </View>
  );
}

function ProductionMetric({ icon, value, label, isLast }) {
  return (
    <View style={[styles.metric, !isLast && styles.metricDivider]}>
      <View style={styles.metricIcon}>
        <MaterialCommunityIcons name={icon} size={21} color={ORANGE} />
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function TimelineRow({ icon, title, detail, isLast }) {
  return (
    <View style={styles.timelineRow}>
      <View style={styles.timelineTrack}>
        <View style={styles.timelineIcon}>
          <MaterialCommunityIcons name={icon} size={17} color={ORANGE} />
        </View>
        {!isLast && <View style={styles.timelineLine} />}
      </View>
      <View style={styles.timelineCopy}>
        <Text style={styles.timelineTitle}>{title}</Text>
        <Text style={styles.timelineDetail}>{detail}</Text>
      </View>
    </View>
  );
}

export default function PairingDetailScreen({ pairing, collections = [], onCollectionsChange, onBack, onOpenOffspring }) {
  const { width } = useWindowDimensions();
  const [collectionVisible, setCollectionVisible] = useState(false);
  const [collectionCount, setCollectionCount] = useState(1);
  const [collectionDate, setCollectionDate] = useState(getTodayValue());
  const [collectionNotes, setCollectionNotes] = useState('');
  const compact = width < 480;
  const narrow = width < 380;

  if (!pairing) {
    return (
      <View style={styles.missingScreen}>
        <MaterialCommunityIcons name="link-variant-off" size={42} color="#687478" />
        <Text style={styles.missingTitle}>Pairing record unavailable</Text>
        <Pressable onPress={onBack} style={styles.missingButton}>
          <Text style={styles.missingButtonText}>Back to Breeding</Text>
        </Pressable>
      </View>
    );
  }

  const recordedEggCount = collections.reduce((total, collection) => total + collection.count, 0);
  const eggCount = (Number.parseInt(pairing.eggs, 10) || 0) + recordedEggCount;
  const pairingType = pairing.pairingType || 'Not recorded';
  const notes = pairing.notes || 'No notes have been added for this pairing.';
  const offspringCount = OFFSPRING_RECORDS.filter((item) => item.pairingId === pairing.id).length;
  const maleBloodline = pairing.bloodline.match(/^(.+?)\s+Cock/i)?.[1] || 'Bloodline not recorded';
  const femaleBloodline = pairing.bloodline.match(/[\u00b7-]\s*(.*?)\s+Hen/i)?.[1] || 'Bloodline not recorded';
  const timeline = [
    { icon: 'link-variant', title: 'Pairing started', detail: pairing.started },
    ...collections.slice(0, 2).map((collection) => ({
      icon: 'egg-plus-outline',
      title: `${collection.count} ${collection.count === 1 ? 'egg' : 'eggs'} collected`,
      detail: formatCollectionDate(collection.date),
    })),
    eggCount > 0
      ? { icon: 'egg-outline', title: `${eggCount} eggs currently holding`, detail: `Oldest egg: ${pairing.oldestEgg}` }
      : { icon: 'egg-outline', title: 'Waiting for first egg collection', detail: 'No eggs recorded yet' },
    { icon: 'clipboard-check-outline', title: 'Record remains active', detail: 'Add collections as eggs are gathered' },
  ];

  const openCollectionForm = () => {
    setCollectionCount(1);
    setCollectionDate(getTodayValue());
    setCollectionNotes('');
    setCollectionVisible(true);
  };

  const saveCollection = () => {
    const parsedDate = new Date(`${collectionDate}T00:00:00`);
    if (Number.isNaN(parsedDate.getTime())) {
      Alert.alert('Check collection date', 'Enter the date as YYYY-MM-DD.');
      return;
    }
    const collection = {
      id: `egg-collection-${Date.now()}`,
      count: collectionCount,
      date: collectionDate,
      notes: collectionNotes.trim(),
    };
    onCollectionsChange?.([collection, ...collections]);
    setCollectionVisible(false);
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.pageWrap}>
        <View style={styles.page}>
          <View style={[styles.hero, compact && styles.heroCompact]}>
            <Image source={BREEDING_HERO_IMAGE} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="center" cachePolicy="memory-disk" />
            <LinearGradient
              colors={['rgba(2,7,9,0.25)', 'rgba(2,7,9,0.35)', 'rgba(2,7,9,0.92)', '#03090c']}
              locations={[0, 0.42, 0.82, 1]}
              style={StyleSheet.absoluteFill}
            />
            <SafeAreaView edges={['top']} style={styles.heroSafeArea}>
              <View style={styles.heroHeader}>
                <View style={styles.heroHeaderLeft}>
                  <HeaderButton icon="arrow-back" label="Back to breeding" onPress={onBack} />
                  <Text style={styles.screenTitle}>Pairing Details</Text>
                </View>
                <HeaderButton
                  icon="ellipsis-horizontal"
                  label="Pairing options"
                  onPress={() => Alert.alert('Pairing options', 'Edit or end this pairing from the actions below.')}
                />
              </View>
              <View style={[styles.heroCopy, narrow && styles.heroCopyNarrow]}>
                <View style={styles.heroIdRow}>
                  <Text style={styles.heroId}>{pairing.id}</Text>
                  <View style={[styles.statusBadge, { borderColor: `${pairing.statusColor}55`, backgroundColor: pairing.statusBackground }]}>
                    <View style={[styles.statusDot, { backgroundColor: pairing.statusColor }]} />
                    <Text style={[styles.statusText, { color: pairing.statusColor }]}>{pairing.status}</Text>
                  </View>
                </View>
                <Text numberOfLines={2} style={[styles.pairTitle, narrow && styles.pairTitleNarrow]}>
                  {pairing.male} <Text style={styles.cross}>x</Text> {pairing.female}
                </Text>
                <Text numberOfLines={2} style={styles.bloodline}>{pairing.bloodline}</Text>
              </View>
            </SafeAreaView>
          </View>

          <View style={[styles.content, narrow && styles.contentNarrow]}>
            <View style={styles.sectionIntro}>
              <View>
                <Text style={styles.sectionEyebrow}>BREEDING PAIR</Text>
                <Text style={styles.sectionTitleLarge}>Pair Members</Text>
              </View>
              <View style={styles.activeRecordBadge}>
                <MaterialCommunityIcons name="check-decagram-outline" size={15} color={ORANGE} />
                <Text style={styles.activeRecordText}>Active record</Text>
              </View>
            </View>
            <View style={[styles.membersPanel, compact && styles.membersPanelCompact]}>
              <BirdMember
                label="Cock / Sire"
                name={pairing.male}
                image={pairing.maleImage}
                gender="male"
                id={pairing.maleId}
                bloodline={`${maleBloodline} Cock`}
                compact={compact}
              />
              <View style={styles.memberLink}>
                <View style={styles.memberLinkLine} />
                <View style={styles.memberLinkIcon}><MaterialCommunityIcons name="heart" size={20} color="#ff633f" /></View>
                <View style={styles.memberLinkLine} />
              </View>
              <BirdMember
                label="Hen / Dam"
                name={pairing.female}
                image={pairing.femaleImage}
                gender="female"
                id={pairing.femaleId}
                bloodline={`${femaleBloodline} Hen`}
                compact={compact}
              />
            </View>

            <View style={styles.factsPanel}>
              <Fact icon="identifier" label="Pairing ID" value={pairing.id} />
              <Fact icon="calendar-month-outline" label="Started" value={pairing.started} />
              <Fact icon="tag-outline" label="Pairing Type" value={pairingType} isLast />
            </View>

            <View style={styles.sectionHeadingRow}>
              <Text style={styles.sectionTitle}>Egg Production</Text>
              <Pressable onPress={openCollectionForm} hitSlop={8}>
                <Text style={styles.sectionAction}>Add collection</Text>
              </Pressable>
            </View>
            <View style={styles.productionPanel}>
              <ProductionMetric icon="egg-outline" value={String(eggCount)} label="Eggs Holding" />
              <ProductionMetric icon="clock-outline" value={pairing.oldestEgg} label="Oldest Egg" />
              <ProductionMetric icon="calendar-check-outline" value={eggCount ? 'Review' : 'Waiting'} label="Next Step" isLast />
            </View>

            {collections.length > 0 && (
              <View style={styles.collectionsPanel}>
                <View style={styles.collectionsHeader}>
                  <Text style={styles.collectionsTitle}>Recent Collections</Text>
                  <Text style={styles.collectionsCount}>{collections.length} recorded</Text>
                </View>
                {collections.slice(0, 3).map((collection, index) => (
                  <View key={collection.id} style={[styles.collectionRow, index > 0 && styles.collectionRowDivider]}>
                    <View style={styles.collectionIcon}>
                      <MaterialCommunityIcons name="egg-outline" size={17} color={ORANGE} />
                    </View>
                    <View style={styles.collectionCopy}>
                      <Text style={styles.collectionValue}>{collection.count} {collection.count === 1 ? 'egg' : 'eggs'}</Text>
                      <Text style={styles.collectionDate}>{formatCollectionDate(collection.date)}</Text>
                    </View>
                    {collection.notes ? <Text numberOfLines={1} style={styles.collectionNote}>{collection.notes}</Text> : null}
                  </View>
                ))}
              </View>
            )}

            {offspringCount > 0 && (
              <>
                <View style={styles.sectionHeadingRow}>
                  <Text style={styles.sectionTitle}>Offspring</Text>
                  <Text style={styles.sectionAction}>{offspringCount} records</Text>
                </View>
                <Pressable accessibilityLabel="Open offspring records" onPress={onOpenOffspring} style={({ pressed }) => [styles.offspringCard, pressed && styles.pressed]}>
                  <View style={styles.offspringIcon}><MaterialCommunityIcons name="bird" size={24} color={ORANGE} /></View>
                  <View style={styles.offspringCopy}><Text style={styles.offspringTitle}>{offspringCount} recorded offspring</Text><Text style={styles.offspringText}>View hatch batches, FarmBuzz IDs, and registration status.</Text></View>
                  <Ionicons name="chevron-forward" size={20} color="#8e999c" />
                </Pressable>
              </>
            )}

            <View style={styles.nextAction}>
              <View style={styles.nextActionIcon}>
                <MaterialCommunityIcons name="egg-plus-outline" size={24} color={ORANGE} />
              </View>
              <View style={styles.nextActionCopy}>
                <Text style={styles.nextActionEyebrow}>NEXT ACTION</Text>
                <Text style={styles.nextActionTitle}>{eggCount ? 'Update egg collection' : 'Record the first egg collection'}</Text>
                <Text style={styles.nextActionText}>Keep the holding count and collection age accurate.</Text>
              </View>
              <Pressable
                accessibilityLabel="Record egg collection"
                onPress={openCollectionForm}
                style={({ pressed }) => [styles.nextActionButton, pressed && styles.pressed]}
              >
                <Ionicons name="add" size={21} color="#fff" />
              </Pressable>
            </View>

            <Text style={styles.sectionTitle}>Pairing Activity</Text>
            <View style={styles.timelinePanel}>
              {timeline.map((item, index) => (
                <TimelineRow key={item.title} {...item} isLast={index === timeline.length - 1} />
              ))}
            </View>

            <Text style={styles.sectionTitle}>Notes</Text>
            <View style={styles.notesPanel}>
              <MaterialCommunityIcons name="note-text-outline" size={21} color={ORANGE} />
              <Text style={styles.notesText}>{notes}</Text>
            </View>

            <View style={styles.actions}>
              <Pressable
                onPress={() => Alert.alert('Edit pairing', `Edit details for ${pairing.id}.`)}
                style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
              >
                <MaterialCommunityIcons name="pencil-outline" size={20} color={ORANGE} />
                <Text style={styles.secondaryButtonText}>Edit Pairing</Text>
              </Pressable>
              <Pressable
                onPress={() => Alert.alert('End pairing', `End ${pairing.male} x ${pairing.female}?`)}
                style={({ pressed }) => [styles.endButton, pressed && styles.pressed]}
              >
                <MaterialCommunityIcons name="link-variant-off" size={20} color="#ff6258" />
                <Text style={styles.endButtonText}>End Pairing</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>

      <Modal
        transparent
        visible={collectionVisible}
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setCollectionVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable accessibilityLabel="Close egg collection form" onPress={() => setCollectionVisible(false)} style={StyleSheet.absoluteFill} />
          <View style={styles.collectionSheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetTitle}>Add Egg Collection</Text>
                <Text style={styles.sheetSubtitle}>{pairing.male} x {pairing.female}</Text>
              </View>
              <Pressable accessibilityLabel="Close" onPress={() => setCollectionVisible(false)} style={({ pressed }) => [styles.sheetClose, pressed && styles.pressed]}>
                <Ionicons name="close" size={20} color="#dce1e2" />
              </Pressable>
            </View>

            <Text style={styles.fieldLabel}>Eggs collected</Text>
            <View style={styles.countControl}>
              <Pressable accessibilityLabel="Remove one egg" onPress={() => setCollectionCount((count) => Math.max(1, count - 1))} style={({ pressed }) => [styles.countButton, pressed && styles.pressed]}>
                <Ionicons name="remove" size={21} color={ORANGE} />
              </Pressable>
              <View style={styles.countValueWrap}>
                <Text style={styles.countValue}>{collectionCount}</Text>
                <Text style={styles.countUnit}>{collectionCount === 1 ? 'egg' : 'eggs'}</Text>
              </View>
              <Pressable accessibilityLabel="Add one egg" onPress={() => setCollectionCount((count) => Math.min(99, count + 1))} style={({ pressed }) => [styles.countButton, pressed && styles.pressed]}>
                <Ionicons name="add" size={21} color={ORANGE} />
              </Pressable>
            </View>

            <Text style={styles.fieldLabel}>Collection date</Text>
            <View style={styles.inputWrap}>
              <MaterialCommunityIcons name="calendar-month-outline" size={19} color={ORANGE} />
              <TextInput
                value={collectionDate}
                onChangeText={setCollectionDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#607075"
                maxLength={10}
                style={styles.fieldInput}
              />
            </View>

            <Text style={styles.fieldLabel}>Notes (optional)</Text>
            <TextInput
              value={collectionNotes}
              onChangeText={setCollectionNotes}
              placeholder="Condition, shell quality, or observations"
              placeholderTextColor="#607075"
              multiline
              maxLength={160}
              style={[styles.fieldInput, styles.notesInput]}
            />

            <View style={styles.sheetActions}>
              <Pressable onPress={() => setCollectionVisible(false)} style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable onPress={saveCollection} style={({ pressed }) => [styles.saveButton, pressed && styles.pressed]}>
                <MaterialCommunityIcons name="egg-plus-outline" size={19} color="#fff" />
                <Text style={styles.saveButtonText}>Save Collection</Text>
              </Pressable>
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
  hero: { height: 310, overflow: 'hidden', backgroundColor: '#101719' },
  heroCompact: { height: 285 },
  heroSafeArea: { flex: 1 },
  heroHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: Platform.OS === 'web' ? 10 : 3 },
  heroHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerButton: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(190,204,208,0.35)', backgroundColor: 'rgba(2,8,11,0.65)', alignItems: 'center', justifyContent: 'center' },
  screenTitle: { color: '#f1f3f3', fontSize: 17, fontWeight: '700', letterSpacing: 0 },
  heroCopy: { marginTop: 'auto', paddingHorizontal: 18, paddingBottom: 28 },
  heroCopyNarrow: { paddingHorizontal: 11, paddingBottom: 22 },
  heroIdRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  heroId: { color: ORANGE, fontSize: 11, fontWeight: '800', letterSpacing: 0 },
  statusBadge: { minHeight: 26, paddingHorizontal: 9, borderWidth: 1, borderRadius: 13, flexDirection: 'row', alignItems: 'center', gap: 5 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 9, fontWeight: '700', letterSpacing: 0 },
  pairTitle: { marginTop: 9, color: '#f2f4f4', fontSize: 30, lineHeight: 36, fontWeight: '800', letterSpacing: 0 },
  pairTitleNarrow: { fontSize: 25, lineHeight: 30 },
  cross: { color: ORANGE },
  bloodline: { marginTop: 5, color: '#aeb7ba', fontSize: 12, lineHeight: 17, letterSpacing: 0 },
  content: { paddingHorizontal: 14, paddingTop: 16, paddingBottom: 30 },
  contentNarrow: { paddingHorizontal: 9 },
  sectionTitle: { color: '#e7eaeb', fontSize: 14, fontWeight: '700', letterSpacing: 0, marginBottom: 9 },
  sectionIntro: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 10 },
  sectionEyebrow: { color: ORANGE, fontSize: 8, fontWeight: '800', letterSpacing: 0 },
  sectionTitleLarge: { marginTop: 3, color: '#f0f2f2', fontSize: 18, fontWeight: '800', letterSpacing: 0 },
  activeRecordBadge: { height: 28, paddingHorizontal: 9, borderWidth: 1, borderColor: '#563711', borderRadius: 14, backgroundColor: 'rgba(255,122,0,0.05)', flexDirection: 'row', alignItems: 'center', gap: 5 },
  activeRecordText: { color: '#d9a35f', fontSize: 8, fontWeight: '700', letterSpacing: 0 },
  offspringCard: { minHeight: 76, marginBottom: 16, paddingHorizontal: 11, borderWidth: 1, borderColor: '#314047', borderRadius: 8, backgroundColor: '#0a1317', flexDirection: 'row', alignItems: 'center', gap: 10 },
  offspringIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,122,0,0.09)', alignItems: 'center', justifyContent: 'center' },
  offspringCopy: { flex: 1, minWidth: 0 }, offspringTitle: { color: '#e7eaeb', fontSize: 11, fontWeight: '800' }, offspringText: { marginTop: 4, color: '#7e8a8e', fontSize: 8, lineHeight: 12 },
  membersPanel: { minHeight: 142, padding: 13, borderWidth: 1, borderColor: '#314047', borderRadius: 8, backgroundColor: '#0a1317', flexDirection: 'row', alignItems: 'stretch', gap: 10, overflow: 'hidden' },
  membersPanelCompact: { minHeight: 128, paddingHorizontal: 7, paddingVertical: 11, gap: 5 },
  member: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 12 },
  memberCompact: { gap: 7 },
  memberImageWrap: { flexShrink: 0 },
  memberImage: { width: 88, height: 88, borderRadius: 44, borderWidth: 2, borderColor: ORANGE, backgroundColor: '#172126' },
  memberImageCompact: { width: 64, height: 64, borderRadius: 32 },
  memberCopy: { flex: 1, minWidth: 0, alignItems: 'flex-start' },
  memberLabel: { color: ORANGE, fontSize: 10, fontWeight: '800', letterSpacing: 0 },
  memberNameRow: { width: '100%', marginTop: 7, flexDirection: 'row', alignItems: 'center', gap: 5 },
  memberName: { flexShrink: 1, color: '#edf0f1', fontSize: 19, fontWeight: '700', letterSpacing: 0 },
  memberNameCompact: { fontSize: 13 },
  memberBloodline: { width: '100%', marginTop: 6, color: '#9ca6a9', fontSize: 10, letterSpacing: 0 },
  memberIdBadge: { maxWidth: '100%', marginTop: 8, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: '#69410e', borderRadius: 5, backgroundColor: 'rgba(255,122,0,0.05)' },
  memberId: { color: ORANGE, fontSize: 9, fontWeight: '700', letterSpacing: 0 },
  memberLink: { width: 40, alignItems: 'center', justifyContent: 'center' },
  memberLinkLine: { flex: 1, width: 1, backgroundColor: '#28383f' },
  memberLinkIcon: { width: 36, height: 36, marginVertical: 7, borderRadius: 18, borderWidth: 1, borderColor: '#3b484d', backgroundColor: '#111a1e', alignItems: 'center', justifyContent: 'center' },
  factsPanel: { minHeight: 105, marginTop: 10, marginBottom: 18, paddingVertical: 12, borderWidth: 1, borderColor: '#28353a', borderRadius: 8, backgroundColor: '#0a1317', flexDirection: 'row', overflow: 'hidden' },
  fact: { flex: 1, minWidth: 0, paddingHorizontal: 7, alignItems: 'center', justifyContent: 'center' },
  factDivider: { borderRightWidth: 1, borderRightColor: '#26343a' },
  factIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,122,0,0.07)', alignItems: 'center', justifyContent: 'center' },
  factLabel: { marginTop: 5, color: '#7f8b8e', fontSize: 8, textAlign: 'center', letterSpacing: 0 },
  factValue: { marginTop: 3, color: '#e0e4e5', fontSize: 10, fontWeight: '700', textAlign: 'center', letterSpacing: 0 },
  sectionHeadingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionAction: { marginBottom: 9, color: ORANGE, fontSize: 10, fontWeight: '700', letterSpacing: 0 },
  productionPanel: { minHeight: 112, paddingVertical: 13, borderWidth: 1, borderColor: '#28353a', borderRadius: 8, backgroundColor: '#0a1317', flexDirection: 'row' },
  metric: { flex: 1, minWidth: 0, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  metricDivider: { borderRightWidth: 1, borderRightColor: '#26343a' },
  metricIcon: { width: 38, height: 38, borderRadius: 19, borderWidth: 1, borderColor: '#4f3515', backgroundColor: 'rgba(255,122,0,0.06)', alignItems: 'center', justifyContent: 'center' },
  metricValue: { marginTop: 5, color: '#f0f2f2', fontSize: 14, fontWeight: '800', textAlign: 'center', letterSpacing: 0 },
  metricLabel: { marginTop: 3, color: '#859094', fontSize: 8, textAlign: 'center', letterSpacing: 0 },
  collectionsPanel: { marginTop: 8, marginBottom: 2, paddingHorizontal: 11, borderWidth: 1, borderColor: '#28353a', borderRadius: 8, backgroundColor: '#081115', overflow: 'hidden' },
  collectionsHeader: { minHeight: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  collectionsTitle: { color: '#dfe3e4', fontSize: 10, fontWeight: '700', letterSpacing: 0 },
  collectionsCount: { color: ORANGE, fontSize: 8, fontWeight: '700', letterSpacing: 0 },
  collectionRow: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 9 },
  collectionRowDivider: { borderTopWidth: 1, borderTopColor: '#223037' },
  collectionIcon: { width: 30, height: 30, borderRadius: 7, backgroundColor: 'rgba(255,122,0,0.08)', alignItems: 'center', justifyContent: 'center' },
  collectionCopy: { minWidth: 72 },
  collectionValue: { color: '#e6e9ea', fontSize: 10, fontWeight: '700', letterSpacing: 0 },
  collectionDate: { marginTop: 2, color: '#778589', fontSize: 7, letterSpacing: 0 },
  collectionNote: { flex: 1, minWidth: 0, color: '#899599', fontSize: 8, textAlign: 'right', letterSpacing: 0 },
  nextAction: { minHeight: 76, marginTop: 9, marginBottom: 18, padding: 10, borderWidth: 1, borderColor: '#603c0e', borderRadius: 8, backgroundColor: 'rgba(255,122,0,0.055)', flexDirection: 'row', alignItems: 'center', gap: 10 },
  nextActionIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,122,0,0.1)', alignItems: 'center', justifyContent: 'center' },
  nextActionCopy: { flex: 1, minWidth: 0 },
  nextActionEyebrow: { color: ORANGE, fontSize: 7, fontWeight: '800', letterSpacing: 0 },
  nextActionTitle: { marginTop: 3, color: '#e9eced', fontSize: 10, fontWeight: '700', letterSpacing: 0 },
  nextActionText: { marginTop: 3, color: '#899397', fontSize: 8, lineHeight: 11, letterSpacing: 0 },
  nextActionButton: { width: 38, height: 38, borderRadius: 8, backgroundColor: '#f66f00', alignItems: 'center', justifyContent: 'center' },
  timelinePanel: { marginBottom: 17, padding: 12, borderWidth: 1, borderColor: '#28353a', borderRadius: 8, backgroundColor: '#0a1317' },
  timelineRow: { minHeight: 58, flexDirection: 'row', gap: 11 },
  timelineTrack: { width: 32, alignItems: 'center' },
  timelineIcon: { width: 30, height: 30, borderRadius: 15, borderWidth: 1, borderColor: '#543712', backgroundColor: 'rgba(255,122,0,0.06)', alignItems: 'center', justifyContent: 'center' },
  timelineLine: { flex: 1, width: 1, backgroundColor: '#344146' },
  timelineCopy: { flex: 1, paddingTop: 2 },
  timelineTitle: { color: '#dfe3e4', fontSize: 11, fontWeight: '600', letterSpacing: 0 },
  timelineDetail: { marginTop: 4, color: '#7f8a8e', fontSize: 9, letterSpacing: 0 },
  notesPanel: { minHeight: 64, marginBottom: 14, padding: 12, borderWidth: 1, borderColor: '#28353a', borderRadius: 8, backgroundColor: '#0a1317', flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  notesText: { flex: 1, color: '#a5afb2', fontSize: 10, lineHeight: 15, letterSpacing: 0 },
  actions: { flexDirection: 'row', gap: 8 },
  secondaryButton: { flex: 1, height: 48, minWidth: 0, borderWidth: 1, borderColor: '#70400f', borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  secondaryButtonText: { color: ORANGE, fontSize: 11, fontWeight: '700', letterSpacing: 0 },
  endButton: { flex: 1, height: 48, minWidth: 0, borderWidth: 1, borderColor: '#5c2524', borderRadius: 8, backgroundColor: 'rgba(130,30,27,0.08)', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  endButtonText: { color: '#ff6258', fontSize: 11, fontWeight: '700', letterSpacing: 0 },
  modalOverlay: { flex: 1, paddingHorizontal: 10, paddingBottom: 10, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end', alignItems: 'center' },
  collectionSheet: { width: '100%', maxWidth: 700, paddingHorizontal: 13, paddingBottom: 13, borderWidth: 1, borderColor: '#2b3a40', borderRadius: 8, backgroundColor: '#081115' },
  sheetHandle: { alignSelf: 'center', width: 34, height: 3, marginTop: 8, borderRadius: 2, backgroundColor: '#46545a' },
  sheetHeader: { minHeight: 65, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#223037' },
  sheetTitle: { color: '#f1f3f3', fontSize: 16, fontWeight: '800', letterSpacing: 0 },
  sheetSubtitle: { marginTop: 3, color: '#7f8c90', fontSize: 9, letterSpacing: 0 },
  sheetClose: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#111c20', alignItems: 'center', justifyContent: 'center' },
  fieldLabel: { marginTop: 13, marginBottom: 6, color: '#9ca7aa', fontSize: 9, fontWeight: '700', letterSpacing: 0 },
  countControl: { height: 58, paddingHorizontal: 8, borderWidth: 1, borderColor: '#2b3a40', borderRadius: 8, backgroundColor: '#0a1519', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  countButton: { width: 38, height: 38, borderRadius: 7, borderWidth: 1, borderColor: '#5b3a12', backgroundColor: 'rgba(255,122,0,0.06)', alignItems: 'center', justifyContent: 'center' },
  countValueWrap: { alignItems: 'center' },
  countValue: { color: '#f2f4f4', fontSize: 20, lineHeight: 23, fontWeight: '800', letterSpacing: 0 },
  countUnit: { color: '#7f8c90', fontSize: 7, letterSpacing: 0 },
  inputWrap: { minHeight: 48, paddingHorizontal: 11, borderWidth: 1, borderColor: '#2b3a40', borderRadius: 8, backgroundColor: '#0a1519', flexDirection: 'row', alignItems: 'center', gap: 9 },
  fieldInput: { flex: 1, minWidth: 0, minHeight: 46, paddingVertical: 0, color: '#e7eaeb', fontSize: 11, letterSpacing: 0, outlineStyle: 'none' },
  notesInput: { flex: 0, height: 76, paddingHorizontal: 11, paddingTop: 11, paddingBottom: 11, borderWidth: 1, borderColor: '#2b3a40', borderRadius: 8, backgroundColor: '#0a1519', textAlignVertical: 'top' },
  sheetActions: { marginTop: 14, flexDirection: 'row', gap: 8 },
  cancelButton: { flex: 0.75, height: 46, borderWidth: 1, borderColor: '#334248', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  cancelButtonText: { color: '#aab3b6', fontSize: 11, fontWeight: '700', letterSpacing: 0 },
  saveButton: { flex: 1.25, height: 46, borderRadius: 8, backgroundColor: '#f66f00', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  saveButtonText: { color: '#fff', fontSize: 11, fontWeight: '800', letterSpacing: 0 },
  pressed: { opacity: 0.72 },
  missingScreen: { flex: 1, padding: 24, backgroundColor: '#020709', alignItems: 'center', justifyContent: 'center' },
  missingTitle: { marginTop: 12, color: '#d8ddde', fontSize: 17, fontWeight: '700', letterSpacing: 0 },
  missingButton: { height: 44, marginTop: 18, paddingHorizontal: 18, borderRadius: 8, backgroundColor: '#f66f00', alignItems: 'center', justifyContent: 'center' },
  missingButtonText: { color: '#fff', fontSize: 12, fontWeight: '700', letterSpacing: 0 },
});

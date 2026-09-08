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
const TRANSFER_TYPES = ['Transferred', 'Sold', 'Gifted'];
const EMPTY_TRANSFER = { owner: '', contact: '', type: 'Transferred', price: '', date: 'Sep 1, 2026', notes: '' };

function getFarmBuzzId(bird) {
  if (bird.farmBuzzId) return bird.farmBuzzId;
  const ring = bird.details?.find((detail) => detail.icon === 'tag-outline')?.text || bird.name;
  const digits = ring.replace(/\D/g, '').slice(-5) || '001';
  return `FBZ-${new Date().getFullYear()}-${digits.padStart(3, '0')}`;
}

function makeDefaultOwnership(bird) {
  const externalOrigin = bird.name === 'Razor 014';
  return {
    owner: 'JU Gamefarm',
    ownerType: 'Farm-owned',
    contact: 'Pampanga, Philippines',
    since: externalOrigin ? 'Sep 2, 2024' : 'Aug 18, 2024',
    acquiredBy: externalOrigin ? 'Purchased' : 'Farm bred',
    status: 'Active ownership',
    origin: externalOrigin
      ? {
          source: 'Golden Spur Gamefarm',
          place: 'San Fernando, Pampanga',
          breeder: 'Ramon Villanueva',
          registered: 'Aug 12, 2024',
        }
      : {
          source: 'Bred at JU Gamefarm',
          place: 'Pampanga, Philippines',
          breeder: 'JU breeding program',
          registered: 'Aug 18, 2024',
        },
    history: externalOrigin
      ? [
          { id: 'purchase', from: 'Golden Spur Gamefarm', to: 'JU Gamefarm', type: 'Purchased', price: '32,000', date: 'Sep 2, 2024', detail: 'Purchased with pedigree and health records.' },
          { id: 'origin', from: 'Golden Spur breeding record', to: 'Golden Spur Gamefarm', type: 'Registered', date: 'Aug 12, 2024', detail: `${bird.name} was registered by breeder Ramon Villanueva.` },
        ]
      : [
          { id: 'origin', from: 'Farm breeding record', to: 'JU Gamefarm', type: 'Registered', date: 'Aug 18, 2024', detail: `${bird.name} entered the farm registry.` },
        ],
  };
}

function HeaderButton({ icon, label, onPress }) {
  return <Pressable accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}><Ionicons name={icon} size={21} color="#eef1f2" /></Pressable>;
}

function OwnerFact({ icon, label, value, isLast }) {
  return <View style={[styles.ownerFact, !isLast && styles.ownerFactDivider]}><MaterialCommunityIcons name={icon} size={20} color={ORANGE} /><Text style={styles.ownerFactLabel}>{label}</Text><Text numberOfLines={2} style={styles.ownerFactValue}>{value}</Text></View>;
}

function OriginItem({ icon, label, value }) {
  return <View style={styles.originItem}><View style={styles.originIcon}><MaterialCommunityIcons name={icon} size={19} color={ORANGE} /></View><View style={styles.originCopy}><Text style={styles.originLabel}>{label}</Text><Text numberOfLines={2} style={styles.originValue}>{value}</Text></View></View>;
}

function HistoryItem({ item, isLast }) {
  return (
    <View style={styles.historyItem}>
      <View style={styles.timelineColumn}><View style={styles.timelineDot}><MaterialCommunityIcons name={item.type === 'Sold' ? 'cash-check' : 'swap-horizontal'} size={14} color={ORANGE} /></View>{!isLast && <View style={styles.timelineLine} />}</View>
      <View style={[styles.historyContent, !isLast && styles.rowDivider]}>
        <View style={styles.historyHeading}><View style={styles.historyTitleRow}><Text style={styles.historyType}>{item.type}</Text>{item.price ? <View style={styles.priceBadge}><Text style={styles.priceBadgeText}>PHP {item.price}</Text></View> : null}</View><Text style={styles.historyDate}>{item.date}</Text></View>
        <Text style={styles.historyRoute}>{item.from} <Text style={styles.routeArrow}>to</Text> {item.to}</Text>
        <Text style={styles.historyDetail}>{item.detail}</Text>
      </View>
    </View>
  );
}

function DocumentRow({ icon, title, detail, status, isLast }) {
  return <Pressable onPress={() => Alert.alert(title, detail)} style={({ pressed }) => [styles.documentRow, !isLast && styles.rowDivider, pressed && styles.rowPressed]}><View style={styles.documentIcon}><MaterialCommunityIcons name={icon} size={21} color={ORANGE} /></View><View style={styles.documentCopy}><Text style={styles.documentTitle}>{title}</Text><Text style={styles.documentDetail}>{detail}</Text></View><View style={styles.documentStatus}><Text style={styles.documentStatusText}>{status}</Text></View><Ionicons name="chevron-forward" size={18} color="#899397" /></Pressable>;
}

export default function BirdOwnershipScreen({ bird, ownership, onOwnershipChange, onBack }) {
  const { width } = useWindowDimensions();
  const compact = width < 520;
  const narrow = width < 380;
  const [transferOpen, setTransferOpen] = useState(false);
  const [transfer, setTransfer] = useState(EMPTY_TRANSFER);
  const record = useMemo(() => ownership || makeDefaultOwnership(bird || { name: 'Bird', details: [] }), [bird, ownership]);
  const initials = record.owner.split(/\s+/).map((word) => word[0]).join('').slice(0, 2).toUpperCase();

  if (!bird) return <View style={styles.missingScreen}><Text style={styles.missingTitle}>Bird record unavailable</Text><Pressable onPress={onBack} style={styles.primaryButton}><Text style={styles.primaryButtonText}>Back to Bird Profile</Text></Pressable></View>;

  const submitTransfer = () => {
    if (!transfer.owner.trim()) {
      Alert.alert('New owner required', 'Enter the person or farm receiving this bird.');
      return;
    }
    if (transfer.type === 'Sold' && !transfer.price.trim()) {
      Alert.alert('Sale price required', 'Enter the agreed price for this ownership transfer.');
      return;
    }
    const entry = {
      id: `ownership-${Date.now()}`,
      from: record.owner,
      to: transfer.owner.trim(),
      type: transfer.type,
      price: transfer.type === 'Sold' ? transfer.price.trim() : '',
      date: transfer.date.trim() || 'Sep 1, 2026',
      detail: transfer.notes.trim() || `${bird.name} ownership was ${transfer.type.toLowerCase()}.`,
    };
    const nextRecord = {
      ...record,
      owner: entry.to,
      ownerType: transfer.type === 'Sold' ? 'Buyer' : 'External owner',
      contact: transfer.contact.trim() || 'Not recorded',
      since: entry.date,
      acquiredBy: transfer.type,
      status: transfer.type === 'Sold' ? 'Sold and transferred' : 'Transferred',
      history: [entry, ...record.history],
    };
    onOwnershipChange?.(nextRecord);
    setTransfer(EMPTY_TRANSFER);
    setTransferOpen(false);
    Alert.alert('Ownership updated', `${bird.name} is now registered to ${entry.to}.`);
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.pageWrap}>
        <View style={styles.page}>
          <View style={[styles.hero, compact && styles.heroCompact]}>
            <Image source={bird.image || FLOCK_HERO_IMAGE} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="center" cachePolicy="memory-disk" />
            <LinearGradient colors={['rgba(2,7,9,0.16)', 'rgba(2,7,9,0.25)', 'rgba(2,7,9,0.9)', '#03090c']} locations={[0, 0.4, 0.8, 1]} style={StyleSheet.absoluteFill} />
            <SafeAreaView edges={['top']} style={styles.heroSafeArea}>
              <View style={styles.heroHeader}><View style={styles.heroHeaderLeft}><HeaderButton icon="arrow-back" label="Back to bird profile" onPress={onBack} /><Text style={styles.screenTitle}>Ownership</Text></View><HeaderButton icon="ellipsis-horizontal" label="Ownership options" onPress={() => Alert.alert('Ownership options', 'Ownership actions will appear here.')} /></View>
              <View style={[styles.heroCopy, narrow && styles.heroCopyNarrow]}><View style={styles.ownerBadge}><MaterialCommunityIcons name="account-check-outline" size={15} color={ORANGE} /><Text style={styles.ownerBadgeText}>OWNERSHIP RECORD</Text></View><Text style={styles.birdName}>{bird.name}</Text><Text style={styles.birdId}>{getFarmBuzzId(bird)}</Text></View>
            </SafeAreaView>
          </View>

          <View style={[styles.content, narrow && styles.contentNarrow]}>
            <View style={styles.currentOwnerPanel}>
              <View style={styles.ownerAvatar}><Text style={styles.ownerInitials}>{initials}</Text></View>
              <View style={styles.ownerCopy}><Text style={styles.currentEyebrow}>CURRENT OWNER</Text><Text style={styles.ownerName}>{record.owner}</Text><Text style={styles.ownerContact}>{record.contact}</Text></View>
              <View style={styles.statusBadge}><View style={styles.statusDot} /><Text style={styles.statusText}>{record.status}</Text></View>
            </View>

            <View style={[styles.factsPanel, compact && styles.factsPanelCompact]}>
              <OwnerFact icon="calendar-month-outline" label="Owner Since" value={record.since} />
              <OwnerFact icon="handshake-outline" label="Acquired By" value={record.acquiredBy} />
              <OwnerFact icon="account-outline" label="Owner Type" value={record.ownerType} />
              <OwnerFact icon="shield-check-outline" label="Record" value="Verified" isLast />
            </View>

            <View style={styles.sectionHeading}><View><Text style={styles.sectionTitle}>Bird Origin</Text><Text style={styles.sectionSubtitle}>Where this bird originally came from</Text></View><View style={styles.originBadge}><MaterialCommunityIcons name="map-marker-check-outline" size={14} color={ORANGE} /><Text style={styles.originBadgeText}>VERIFIED</Text></View></View>
            <View style={styles.originPanel}>
              <View style={[styles.originGrid, compact && styles.originGridCompact]}>
                <OriginItem icon="barn" label="Source" value={record.origin?.source || 'Not recorded'} />
                <OriginItem icon="map-marker-outline" label="Place of Origin" value={record.origin?.place || 'Not recorded'} />
                <OriginItem icon="account-star-outline" label="Breeder / Source" value={record.origin?.breeder || 'Not recorded'} />
                <OriginItem icon="calendar-check-outline" label="First Registered" value={record.origin?.registered || 'Not recorded'} />
              </View>
              <View style={styles.originNote}><MaterialCommunityIcons name="information-outline" size={16} color={ORANGE} /><Text style={styles.originNoteText}>Origin remains part of the bird's permanent record even when ownership changes.</Text></View>
            </View>

            <View style={styles.sectionHeading}><View><Text style={styles.sectionTitle}>Ownership History</Text><Text style={styles.sectionSubtitle}>Registration and transfer records</Text></View><Text style={styles.sectionCount}>{record.history.length} records</Text></View>
            <View style={styles.historyPanel}>{record.history.map((item, index) => <HistoryItem key={item.id} item={item} isLast={index === record.history.length - 1} />)}</View>

            <Text style={styles.sectionTitleStandalone}>Documents</Text>
            <View style={styles.documentsPanel}><DocumentRow icon="file-certificate-outline" title="Proof of Ownership" detail={`Registered to ${record.owner}`} status="Verified" /><DocumentRow icon="qrcode-scan" title="FarmBuzz Registration" detail={getFarmBuzzId(bird)} status="Active" /><DocumentRow icon="file-sign" title="Transfer Documents" detail={`${Math.max(0, record.history.length - 1)} completed transfers`} status={record.history.length > 1 ? 'Available' : 'None'} isLast /></View>

            <Pressable onPress={() => setTransferOpen(true)} style={({ pressed }) => [styles.transferButton, pressed && styles.pressed]}><MaterialCommunityIcons name="swap-horizontal" size={22} color="#fff" /><Text style={styles.transferButtonText}>Transfer Ownership</Text></Pressable>
          </View>
        </View>
      </ScrollView>

      <Modal visible={transferOpen} transparent animationType="fade" onRequestClose={() => setTransferOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setTransferOpen(false)}>
          <Pressable style={[styles.modalCard, compact && styles.modalCardCompact]} onPress={() => {}}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}><View><Text style={styles.modalTitle}>Transfer Ownership</Text><Text style={styles.modalSubtitle}>Register the new owner of {bird.name}</Text></View><Pressable accessibilityLabel="Close" onPress={() => setTransferOpen(false)} style={styles.modalClose}><Ionicons name="close" size={20} color="#c7cdcf" /></Pressable></View>
            <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <View style={styles.transferFrom}><View style={styles.transferFromIcon}><MaterialCommunityIcons name="account-arrow-right-outline" size={22} color={ORANGE} /></View><View><Text style={styles.transferFromLabel}>TRANSFER FROM</Text><Text style={styles.transferFromName}>{record.owner}</Text></View></View>
              <View style={styles.inputGroup}><Text style={styles.inputLabel}>New Owner *</Text><TextInput value={transfer.owner} onChangeText={(value) => setTransfer((item) => ({ ...item, owner: value }))} placeholder="Person or farm name" placeholderTextColor="#566368" style={styles.input} /></View>
              <View style={styles.inputGroup}><Text style={styles.inputLabel}>Contact Information</Text><TextInput value={transfer.contact} onChangeText={(value) => setTransfer((item) => ({ ...item, contact: value }))} placeholder="Phone, email, or address" placeholderTextColor="#566368" style={styles.input} /></View>
              <View style={styles.inputGroup}><Text style={styles.inputLabel}>Transfer Type</Text><View style={styles.typeOptions}>{TRANSFER_TYPES.map((type) => <Pressable key={type} onPress={() => setTransfer((item) => ({ ...item, type }))} style={[styles.typeOption, transfer.type === type && styles.typeOptionSelected]}><Text style={[styles.typeOptionText, transfer.type === type && styles.typeOptionTextSelected]}>{type}</Text></Pressable>)}</View></View>
              {transfer.type === 'Sold' && <View style={styles.inputGroup}><Text style={styles.inputLabel}>Sale Price (PHP) *</Text><TextInput value={transfer.price} onChangeText={(value) => setTransfer((item) => ({ ...item, price: value.replace(/[^\d,]/g, '') }))} keyboardType="number-pad" placeholder="Example: 28,000" placeholderTextColor="#566368" style={styles.input} /></View>}
              <View style={styles.inputGroup}><Text style={styles.inputLabel}>Transfer Date</Text><TextInput value={transfer.date} onChangeText={(value) => setTransfer((item) => ({ ...item, date: value }))} placeholder="Sep 1, 2026" placeholderTextColor="#566368" style={styles.input} /></View>
              <View style={styles.inputGroup}><Text style={styles.inputLabel}>Notes</Text><TextInput value={transfer.notes} onChangeText={(value) => setTransfer((item) => ({ ...item, notes: value }))} placeholder="Reason or transfer details" placeholderTextColor="#566368" multiline style={[styles.input, styles.notesInput]} /></View>
            </ScrollView>
            <View style={styles.formActions}><Pressable onPress={() => setTransferOpen(false)} style={styles.formCancelButton}><Text style={styles.formCancelText}>Cancel</Text></Pressable><Pressable onPress={submitTransfer} style={({ pressed }) => [styles.formSubmitButton, pressed && styles.pressed]}><MaterialCommunityIcons name="check-circle-outline" size={19} color="#fff" /><Text style={styles.formSubmitText}>Complete Transfer</Text></Pressable></View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#020709' }, pageWrap: { flexGrow: 1, alignItems: 'center', backgroundColor: '#020709' }, page: { width: '100%', maxWidth: 720, backgroundColor: '#020709' }, hero: { height: 330, overflow: 'hidden' }, heroCompact: { height: 300 }, heroSafeArea: { flex: 1 }, heroHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: Platform.OS === 'web' ? 10 : 3 }, heroHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 }, headerButton: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(190,204,208,0.35)', backgroundColor: 'rgba(2,8,11,0.65)', alignItems: 'center', justifyContent: 'center' }, screenTitle: { color: '#f1f3f3', fontSize: 17, fontWeight: '700' }, heroCopy: { marginTop: 'auto', paddingHorizontal: 18, paddingBottom: 28 }, heroCopyNarrow: { paddingHorizontal: 11 }, ownerBadge: { alignSelf: 'flex-start', height: 27, paddingHorizontal: 9, borderWidth: 1, borderColor: '#67410f', borderRadius: 14, backgroundColor: 'rgba(255,122,0,0.07)', flexDirection: 'row', alignItems: 'center', gap: 5 }, ownerBadgeText: { color: '#dda45e', fontSize: 7, fontWeight: '800' }, birdName: { marginTop: 9, color: '#f1f3f3', fontSize: 29, lineHeight: 35, fontWeight: '800' }, birdId: { marginTop: 4, color: '#a1abad', fontSize: 10 },
  content: { paddingHorizontal: 14, paddingTop: 14, paddingBottom: 30 }, contentNarrow: { paddingHorizontal: 9 }, currentOwnerPanel: { minHeight: 100, marginBottom: 10, padding: 12, borderWidth: 1, borderColor: '#5b3b14', borderRadius: 8, backgroundColor: 'rgba(255,122,0,0.045)', flexDirection: 'row', alignItems: 'center', gap: 10 }, ownerAvatar: { width: 60, height: 60, borderWidth: 2, borderColor: ORANGE, borderRadius: 30, backgroundColor: '#1c1710', alignItems: 'center', justifyContent: 'center' }, ownerInitials: { color: ORANGE, fontSize: 17, fontWeight: '800' }, ownerCopy: { flex: 1, minWidth: 0 }, currentEyebrow: { color: ORANGE, fontSize: 7, fontWeight: '800' }, ownerName: { marginTop: 4, color: '#edf0f1', fontSize: 15, fontWeight: '800' }, ownerContact: { marginTop: 3, color: '#879397', fontSize: 8 }, statusBadge: { maxWidth: 112, paddingHorizontal: 8, paddingVertical: 6, borderWidth: 1, borderColor: '#69410e', borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 5 }, statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: ORANGE }, statusText: { flexShrink: 1, color: '#e0a35b', fontSize: 7, fontWeight: '700' }, factsPanel: { minHeight: 94, marginBottom: 20, borderWidth: 1, borderColor: '#28353a', borderRadius: 8, backgroundColor: '#091216', flexDirection: 'row', alignItems: 'stretch' }, factsPanelCompact: { flexWrap: 'wrap' }, ownerFact: { flex: 1, minWidth: 120, padding: 10, alignItems: 'center', justifyContent: 'center' }, ownerFactDivider: { borderRightWidth: 1, borderRightColor: '#253239' }, ownerFactLabel: { marginTop: 5, color: '#748085', fontSize: 7 }, ownerFactValue: { marginTop: 4, color: '#dce1e2', fontSize: 9, fontWeight: '700', textAlign: 'center' },
  sectionHeading: { marginBottom: 9, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }, sectionTitle: { color: '#e7eaeb', fontSize: 14, fontWeight: '700' }, sectionSubtitle: { marginTop: 3, color: '#717d81', fontSize: 8 }, sectionCount: { color: ORANGE, fontSize: 8, fontWeight: '700' }, sectionTitleStandalone: { marginBottom: 8, color: '#e7eaeb', fontSize: 14, fontWeight: '700' }, originBadge: { height: 25, paddingHorizontal: 8, borderWidth: 1, borderColor: '#68410e', borderRadius: 13, flexDirection: 'row', alignItems: 'center', gap: 4 }, originBadgeText: { color: ORANGE, fontSize: 6, fontWeight: '800' }, originPanel: { marginBottom: 20, padding: 11, borderWidth: 1, borderColor: '#28353a', borderRadius: 8, backgroundColor: '#091216' }, originGrid: { flexDirection: 'row' }, originGridCompact: { flexWrap: 'wrap' }, originItem: { flex: 1, minWidth: 125, minHeight: 62, paddingHorizontal: 8, flexDirection: 'row', alignItems: 'center', gap: 8 }, originIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,122,0,0.07)', alignItems: 'center', justifyContent: 'center' }, originCopy: { flex: 1, minWidth: 0 }, originLabel: { color: '#707c80', fontSize: 7 }, originValue: { marginTop: 4, color: '#dce1e2', fontSize: 8, fontWeight: '700' }, originNote: { minHeight: 37, marginTop: 7, paddingHorizontal: 9, borderRadius: 7, backgroundColor: 'rgba(255,122,0,0.045)', flexDirection: 'row', alignItems: 'center', gap: 7 }, originNoteText: { flex: 1, color: '#899397', fontSize: 8 }, historyPanel: { marginBottom: 20, paddingHorizontal: 11, borderWidth: 1, borderColor: '#28353a', borderRadius: 8, backgroundColor: '#091216' }, historyItem: { flexDirection: 'row' }, timelineColumn: { width: 29, alignItems: 'center' }, timelineDot: { width: 25, height: 25, marginTop: 13, borderWidth: 1, borderColor: '#714713', borderRadius: 13, backgroundColor: '#11191b', alignItems: 'center', justifyContent: 'center', zIndex: 1 }, timelineLine: { position: 'absolute', top: 38, bottom: -13, width: 1, backgroundColor: '#394247' }, historyContent: { flex: 1, minWidth: 0, paddingVertical: 13, paddingLeft: 7 }, rowDivider: { borderBottomWidth: 1, borderBottomColor: '#253239' }, historyHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }, historyTitleRow: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 6 }, historyType: { color: '#e2e6e7', fontSize: 10, fontWeight: '700' }, priceBadge: { paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6, backgroundColor: 'rgba(255,122,0,0.09)' }, priceBadgeText: { color: ORANGE, fontSize: 7, fontWeight: '700' }, historyDate: { color: ORANGE, fontSize: 7, fontWeight: '600' }, historyRoute: { marginTop: 6, color: '#c7cdcf', fontSize: 9, fontWeight: '600' }, routeArrow: { color: ORANGE }, historyDetail: { marginTop: 4, color: '#727f83', fontSize: 8 }, documentsPanel: { marginBottom: 14, borderWidth: 1, borderColor: '#28353a', borderRadius: 8, backgroundColor: '#091216', overflow: 'hidden' }, documentRow: { minHeight: 65, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 9 }, rowPressed: { backgroundColor: '#111d22' }, documentIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,122,0,0.07)', alignItems: 'center', justifyContent: 'center' }, documentCopy: { flex: 1, minWidth: 0 }, documentTitle: { color: '#dfe3e4', fontSize: 10, fontWeight: '700' }, documentDetail: { marginTop: 3, color: '#758185', fontSize: 8 }, documentStatus: { paddingHorizontal: 7, paddingVertical: 4, borderWidth: 1, borderColor: '#69410e', borderRadius: 10 }, documentStatusText: { color: ORANGE, fontSize: 7, fontWeight: '700' }, transferButton: { height: 50, borderRadius: 8, backgroundColor: '#f66f00', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }, transferButtonText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  modalBackdrop: { flex: 1, padding: 18, backgroundColor: 'rgba(0,0,0,0.76)', alignItems: 'center', justifyContent: 'center' }, modalCard: { width: '100%', maxWidth: 500, maxHeight: '88%', padding: 14, borderWidth: 1, borderColor: '#334147', borderRadius: 8, backgroundColor: '#081115' }, modalCardCompact: { maxHeight: '92%' }, modalHandle: { alignSelf: 'center', width: 36, height: 4, marginBottom: 11, borderRadius: 2, backgroundColor: '#3d484c' }, modalHeader: { marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, modalTitle: { color: '#edf0f1', fontSize: 16, fontWeight: '800' }, modalSubtitle: { marginTop: 3, color: '#7f8b8f', fontSize: 8 }, modalClose: { width: 36, height: 36, borderWidth: 1, borderColor: '#2f3c41', borderRadius: 18, alignItems: 'center', justifyContent: 'center' }, formScroll: { maxHeight: 500 }, transferFrom: { minHeight: 63, marginBottom: 13, paddingHorizontal: 10, borderWidth: 1, borderColor: '#5e3d15', borderRadius: 7, backgroundColor: 'rgba(255,122,0,0.04)', flexDirection: 'row', alignItems: 'center', gap: 9 }, transferFromIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,122,0,0.08)', alignItems: 'center', justifyContent: 'center' }, transferFromLabel: { color: ORANGE, fontSize: 7, fontWeight: '800' }, transferFromName: { marginTop: 3, color: '#e2e6e7', fontSize: 10, fontWeight: '700' }, inputGroup: { marginBottom: 12 }, inputLabel: { marginBottom: 6, color: '#aeb7ba', fontSize: 8, fontWeight: '700' }, input: { width: '100%', height: 46, paddingHorizontal: 12, borderWidth: 1, borderColor: '#334147', borderRadius: 7, backgroundColor: '#0a1519', color: '#edf0f1', fontSize: 10 }, notesInput: { height: 78, paddingTop: 11, textAlignVertical: 'top' }, typeOptions: { flexDirection: 'row', gap: 7 }, typeOption: { flex: 1, height: 38, borderWidth: 1, borderColor: '#334147', borderRadius: 6, alignItems: 'center', justifyContent: 'center' }, typeOptionSelected: { borderColor: ORANGE, backgroundColor: 'rgba(255,122,0,0.07)' }, typeOptionText: { color: '#879397', fontSize: 8 }, typeOptionTextSelected: { color: ORANGE, fontWeight: '700' }, formActions: { marginTop: 6, flexDirection: 'row', gap: 8 }, formCancelButton: { flex: 0.8, height: 46, borderWidth: 1, borderColor: '#334147', borderRadius: 7, alignItems: 'center', justifyContent: 'center' }, formCancelText: { color: '#b9c1c3', fontSize: 10, fontWeight: '700' }, formSubmitButton: { flex: 1.35, height: 46, borderRadius: 7, backgroundColor: '#f66f00', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }, formSubmitText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  pressed: { opacity: 0.72 }, missingScreen: { flex: 1, backgroundColor: '#020709', alignItems: 'center', justifyContent: 'center' }, missingTitle: { color: '#d8ddde', fontSize: 17, fontWeight: '700' }, primaryButton: { height: 44, marginTop: 18, paddingHorizontal: 18, borderRadius: 8, backgroundColor: '#f66f00', alignItems: 'center', justifyContent: 'center' }, primaryButtonText: { color: '#fff', fontSize: 11, fontWeight: '700' },
});

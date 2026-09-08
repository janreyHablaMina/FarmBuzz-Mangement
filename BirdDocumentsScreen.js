import { useMemo, useState } from 'react';
import {
  Alert,
  Linking,
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
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FLOCK_HERO_IMAGE } from './constants';

const ORANGE = '#ff7a00';
const SAMPLE_PDF = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
const CATEGORIES = [
  { key: 'all', label: 'All', icon: 'folder-multiple-outline' },
  { key: 'Pedigree', label: 'Pedigree', icon: 'file-tree-outline' },
  { key: 'Health', label: 'Health', icon: 'file-document-plus-outline' },
  { key: 'Ownership', label: 'Ownership', icon: 'file-sign' },
  { key: 'Other', label: 'Other', icon: 'paperclip' },
];

function getFarmBuzzId(bird) {
  if (bird.farmBuzzId) return bird.farmBuzzId;
  const ring = bird.details?.find((detail) => detail.icon === 'tag-outline')?.text || bird.name;
  const digits = ring.replace(/\D/g, '').slice(-5) || '001';
  return `FBZ-${new Date().getFullYear()}-${digits.padStart(3, '0')}`;
}

function makeDefaultDocuments(bird) {
  return [
    { id: 'doc-pedigree', name: `${bird.name} Pedigree Certificate.pdf`, category: 'Pedigree', mimeType: 'application/pdf', size: 438000, date: 'Aug 28, 2026', uploadedBy: 'JU Gamefarm Admin', status: 'Verified', uri: SAMPLE_PDF },
    { id: 'doc-vaccine', name: 'Vaccination Record 2026.pdf', category: 'Health', mimeType: 'application/pdf', size: 296000, date: 'Aug 22, 2026', uploadedBy: 'Carlo Santos', status: 'Verified', uri: SAMPLE_PDF },
    { id: 'doc-owner', name: 'Purchase and Transfer Record.jpg', category: 'Ownership', mimeType: 'image/jpeg', size: 1240000, date: 'Sep 2, 2024', uploadedBy: 'JU Gamefarm Admin', status: 'On file', uri: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1000&q=86' },
    { id: 'doc-health', name: 'Health Examination Report.pdf', category: 'Health', mimeType: 'application/pdf', size: 512000, date: 'Aug 14, 2026', uploadedBy: 'Carlo Santos', status: 'Reviewed', uri: SAMPLE_PDF },
  ];
}

function formatSize(bytes = 0) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(document) {
  if (document.mimeType?.startsWith('image/')) return 'file-image-outline';
  if (document.mimeType?.includes('pdf')) return 'file-pdf-box';
  if (document.mimeType?.includes('word')) return 'file-word-outline';
  return 'file-outline';
}

function HeaderButton({ icon, label, onPress }) {
  return <Pressable accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}><Ionicons name={icon} size={21} color="#eef1f2" /></Pressable>;
}

function DocumentRow({ document, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.documentRow, pressed && styles.rowPressed]}>
      <View style={styles.fileIcon}><MaterialCommunityIcons name={getFileIcon(document)} size={25} color={ORANGE} /></View>
      <View style={styles.documentCopy}><Text numberOfLines={1} style={styles.documentName}>{document.name}</Text><View style={styles.documentMeta}><Text style={styles.documentCategory}>{document.category}</Text><View style={styles.metaDot} /><Text style={styles.documentDetail}>{formatSize(document.size)}</Text><View style={styles.metaDot} /><Text style={styles.documentDetail}>{document.date}</Text></View><Text style={styles.uploadedBy}>Added by {document.uploadedBy}</Text></View>
      <View style={styles.documentEnd}><View style={styles.statusBadge}><Text style={styles.statusText}>{document.status}</Text></View><Ionicons name="chevron-forward" size={18} color="#899397" /></View>
    </Pressable>
  );
}

export default function BirdDocumentsScreen({ bird, documents, onDocumentsChange, onBack }) {
  const { width } = useWindowDimensions();
  const compact = width < 520;
  const narrow = width < 380;
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const records = useMemo(() => documents || makeDefaultDocuments(bird || { name: 'Bird' }), [bird, documents]);
  const visibleDocuments = useMemo(() => records.filter((document) => {
    const matchesCategory = filter === 'all' || document.category === filter;
    const search = query.trim().toLowerCase();
    return matchesCategory && (!search || `${document.name} ${document.category} ${document.uploadedBy}`.toLowerCase().includes(search));
  }), [filter, query, records]);

  if (!bird) return <View style={styles.missingScreen}><Text style={styles.missingTitle}>Bird record unavailable</Text><Pressable onPress={onBack} style={styles.primaryButton}><Text style={styles.primaryButtonText}>Back to Bird Profile</Text></Pressable></View>;

  const addAttachment = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (result.canceled) return;
      const asset = result.assets[0];
      const document = {
        id: `doc-${Date.now()}`,
        name: asset.name || 'New attachment',
        category: 'Other',
        mimeType: asset.mimeType || 'application/octet-stream',
        size: asset.size || 0,
        date: 'Sep 1, 2026',
        uploadedBy: 'JU Gamefarm Admin',
        status: 'New',
        uri: asset.uri,
      };
      onDocumentsChange?.([document, ...records]);
      setSelected(document);
    } catch (error) {
      Alert.alert('Unable to attach file', error.message || 'Please try again.');
    }
  };

  const updateCategory = (category) => {
    const updated = { ...selected, category };
    setSelected(updated);
    onDocumentsChange?.(records.map((document) => document.id === updated.id ? updated : document));
  };

  const openDocument = async () => {
    if (!selected?.uri) return;
    try {
      await Linking.openURL(selected.uri);
    } catch {
      Alert.alert('Unable to open file', 'This attachment cannot be opened on the current device.');
    }
  };

  const deleteDocument = () => {
    onDocumentsChange?.(records.filter((document) => document.id !== selected.id));
    setSelected(null);
    Alert.alert('Attachment deleted', 'The file was removed from this bird record.');
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
              <View style={styles.heroHeader}><View style={styles.heroHeaderLeft}><HeaderButton icon="arrow-back" label="Back to bird profile" onPress={onBack} /><Text style={styles.screenTitle}>Documents & Attachments</Text></View><HeaderButton icon="add" label="Add attachment" onPress={addAttachment} /></View>
              <View style={[styles.heroCopy, narrow && styles.heroCopyNarrow]}><View style={styles.documentsBadge}><MaterialCommunityIcons name="folder-account-outline" size={15} color={ORANGE} /><Text style={styles.documentsBadgeText}>BIRD FILES</Text></View><Text style={styles.birdName}>{bird.name}</Text><Text style={styles.birdId}>{getFarmBuzzId(bird)}</Text></View>
            </SafeAreaView>
          </View>

          <View style={[styles.content, narrow && styles.contentNarrow]}>
            <View style={styles.summaryPanel}>
              <View style={styles.summaryItem}><MaterialCommunityIcons name="file-multiple-outline" size={23} color={ORANGE} /><Text style={styles.summaryValue}>{records.length}</Text><Text style={styles.summaryLabel}>Files</Text></View>
              <View style={styles.summaryDivider} /><View style={styles.summaryItem}><MaterialCommunityIcons name="shield-check-outline" size={23} color={ORANGE} /><Text style={styles.summaryValue}>{records.filter((item) => item.status === 'Verified').length}</Text><Text style={styles.summaryLabel}>Verified</Text></View>
              <View style={styles.summaryDivider} /><View style={styles.summaryItem}><MaterialCommunityIcons name="harddisk" size={23} color={ORANGE} /><Text style={styles.summaryValue}>{formatSize(records.reduce((total, item) => total + (item.size || 0), 0))}</Text><Text style={styles.summaryLabel}>Storage Used</Text></View>
            </View>

            <View style={styles.searchBox}><Ionicons name="search" size={20} color="#899397" /><TextInput value={query} onChangeText={setQuery} placeholder="Search files..." placeholderTextColor="#657176" style={styles.searchInput} />{query ? <Pressable accessibilityLabel="Clear search" onPress={() => setQuery('')}><Ionicons name="close-circle" size={19} color="#7d898d" /></Pressable> : null}</View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>{CATEGORIES.map((item) => <Pressable key={item.key} onPress={() => setFilter(item.key)} style={[styles.filterButton, filter === item.key && styles.filterButtonActive]}><MaterialCommunityIcons name={item.icon} size={16} color={filter === item.key ? ORANGE : '#879296'} /><Text style={[styles.filterText, filter === item.key && styles.filterTextActive]}>{item.label}</Text></Pressable>)}</ScrollView>

            <View style={styles.sectionHeading}><View><Text style={styles.sectionTitle}>Attached Files</Text><Text style={styles.sectionSubtitle}>Certificates, records, and supporting files</Text></View><Text style={styles.itemCount}>{visibleDocuments.length} files</Text></View>
            <View style={styles.documentsPanel}>{visibleDocuments.map((document) => <DocumentRow key={document.id} document={document} onPress={() => setSelected(document)} />)}</View>
            {!visibleDocuments.length && <View style={styles.emptyState}><MaterialCommunityIcons name="file-search-outline" size={34} color="#536065" /><Text style={styles.emptyTitle}>No attachments found</Text><Text style={styles.emptyText}>Try another filter or attach a new file.</Text></View>}
            <Pressable onPress={addAttachment} style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}><MaterialCommunityIcons name="paperclip" size={21} color="#fff" /><Text style={styles.addButtonText}>Add Attachment</Text></Pressable>
          </View>
        </View>
      </ScrollView>

      <Modal visible={Boolean(selected)} transparent animationType="fade" onRequestClose={() => setSelected(null)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setSelected(null)}>
          <Pressable style={[styles.modalCard, compact && styles.modalCardCompact]} onPress={() => {}}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}><View><Text style={styles.modalTitle}>Attachment Details</Text><Text style={styles.modalSubtitle}>Review or update this bird file</Text></View><Pressable accessibilityLabel="Close" onPress={() => setSelected(null)} style={styles.modalClose}><Ionicons name="close" size={20} color="#c7cdcf" /></Pressable></View>
            {selected?.mimeType?.startsWith('image/') ? <Image source={selected.uri} style={styles.imagePreview} contentFit="cover" cachePolicy="memory-disk" /> : <View style={styles.filePreview}><MaterialCommunityIcons name={selected ? getFileIcon(selected) : 'file-outline'} size={48} color={ORANGE} /><Text style={styles.previewType}>{selected?.mimeType?.includes('pdf') ? 'PDF DOCUMENT' : 'ATTACHED FILE'}</Text></View>}
            <Text numberOfLines={2} style={styles.detailName}>{selected?.name}</Text>
            <View style={styles.detailGrid}><View style={styles.detailItem}><Text style={styles.detailLabel}>Size</Text><Text style={styles.detailValue}>{formatSize(selected?.size)}</Text></View><View style={styles.detailItem}><Text style={styles.detailLabel}>Added</Text><Text style={styles.detailValue}>{selected?.date}</Text></View><View style={styles.detailItem}><Text style={styles.detailLabel}>Status</Text><Text style={styles.detailValue}>{selected?.status}</Text></View><View style={styles.detailItem}><Text style={styles.detailLabel}>Added By</Text><Text style={styles.detailValue}>{selected?.uploadedBy}</Text></View></View>
            <Text style={styles.categoryLabel}>Category</Text><View style={styles.categoryOptions}>{CATEGORIES.slice(1).map((item) => <Pressable key={item.key} onPress={() => updateCategory(item.key)} style={[styles.categoryOption, selected?.category === item.key && styles.categoryOptionActive]}><Text style={[styles.categoryOptionText, selected?.category === item.key && styles.categoryOptionTextActive]}>{item.label}</Text></Pressable>)}</View>
            <View style={styles.modalActions}><Pressable onPress={deleteDocument} style={styles.deleteButton}><MaterialCommunityIcons name="trash-can-outline" size={18} color="#ff6a62" /><Text style={styles.deleteText}>Delete</Text></Pressable><Pressable onPress={openDocument} style={({ pressed }) => [styles.openButton, pressed && styles.pressed]}><MaterialCommunityIcons name="open-in-new" size={18} color="#fff" /><Text style={styles.openText}>Open File</Text></Pressable></View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#020709' }, pageWrap: { flexGrow: 1, alignItems: 'center', backgroundColor: '#020709' }, page: { width: '100%', maxWidth: 720, backgroundColor: '#020709' }, hero: { height: 330, overflow: 'hidden' }, heroCompact: { height: 300 }, heroSafeArea: { flex: 1 }, heroHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: Platform.OS === 'web' ? 10 : 3 }, heroHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 }, headerButton: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(190,204,208,0.35)', backgroundColor: 'rgba(2,8,11,0.65)', alignItems: 'center', justifyContent: 'center' }, screenTitle: { color: '#f1f3f3', fontSize: 16, fontWeight: '700' }, heroCopy: { marginTop: 'auto', paddingHorizontal: 18, paddingBottom: 28 }, heroCopyNarrow: { paddingHorizontal: 11 }, documentsBadge: { alignSelf: 'flex-start', height: 27, paddingHorizontal: 9, borderWidth: 1, borderColor: '#67410f', borderRadius: 14, backgroundColor: 'rgba(255,122,0,0.07)', flexDirection: 'row', alignItems: 'center', gap: 5 }, documentsBadgeText: { color: '#dda45e', fontSize: 7, fontWeight: '800' }, birdName: { marginTop: 9, color: '#f1f3f3', fontSize: 29, lineHeight: 35, fontWeight: '800' }, birdId: { marginTop: 4, color: '#a1abad', fontSize: 10 },
  content: { paddingHorizontal: 14, paddingTop: 14, paddingBottom: 30 }, contentNarrow: { paddingHorizontal: 9 }, summaryPanel: { minHeight: 96, marginBottom: 12, paddingVertical: 11, borderWidth: 1, borderColor: '#28353a', borderRadius: 8, backgroundColor: '#091216', flexDirection: 'row' }, summaryItem: { flex: 1, minWidth: 0, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 }, summaryDivider: { width: 1, backgroundColor: '#26343a' }, summaryValue: { marginTop: 5, color: '#eef1f2', fontSize: 12, fontWeight: '800', textAlign: 'center' }, summaryLabel: { marginTop: 3, color: '#7e898d', fontSize: 7, textAlign: 'center' }, searchBox: { height: 48, marginBottom: 10, paddingHorizontal: 12, borderWidth: 1, borderColor: '#2c3a40', borderRadius: 8, backgroundColor: '#081115', flexDirection: 'row', alignItems: 'center', gap: 9 }, searchInput: { flex: 1, height: '100%', color: '#e1e5e6', fontSize: 10 }, filters: { paddingBottom: 16, gap: 7 }, filterButton: { height: 36, paddingHorizontal: 11, borderWidth: 1, borderColor: '#2b393e', borderRadius: 7, backgroundColor: '#081115', flexDirection: 'row', alignItems: 'center', gap: 5 }, filterButtonActive: { borderColor: ORANGE, backgroundColor: 'rgba(255,122,0,0.06)' }, filterText: { color: '#879296', fontSize: 8, fontWeight: '600' }, filterTextActive: { color: ORANGE }, sectionHeading: { marginBottom: 9, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }, sectionTitle: { color: '#e7eaeb', fontSize: 14, fontWeight: '700' }, sectionSubtitle: { marginTop: 3, color: '#717d81', fontSize: 8 }, itemCount: { color: ORANGE, fontSize: 8, fontWeight: '700' }, documentsPanel: { marginBottom: 14, borderWidth: 1, borderColor: '#28353a', borderRadius: 8, backgroundColor: '#091216', overflow: 'hidden' }, documentRow: { minHeight: 82, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: '#253239', flexDirection: 'row', alignItems: 'center', gap: 9 }, rowPressed: { backgroundColor: '#111d22' }, fileIcon: { width: 44, height: 44, borderRadius: 7, backgroundColor: 'rgba(255,122,0,0.07)', alignItems: 'center', justifyContent: 'center' }, documentCopy: { flex: 1, minWidth: 0 }, documentName: { color: '#e2e6e7', fontSize: 10, fontWeight: '700' }, documentMeta: { marginTop: 5, flexDirection: 'row', alignItems: 'center', gap: 5 }, documentCategory: { color: ORANGE, fontSize: 7, fontWeight: '700' }, metaDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: '#566368' }, documentDetail: { color: '#788589', fontSize: 7 }, uploadedBy: { marginTop: 4, color: '#657277', fontSize: 7 }, documentEnd: { alignItems: 'flex-end', gap: 8 }, statusBadge: { paddingHorizontal: 7, paddingVertical: 4, borderWidth: 1, borderColor: '#69410e', borderRadius: 9 }, statusText: { color: ORANGE, fontSize: 6, fontWeight: '700' }, emptyState: { minHeight: 160, marginBottom: 14, borderWidth: 1, borderColor: '#28353a', borderRadius: 8, alignItems: 'center', justifyContent: 'center' }, emptyTitle: { marginTop: 8, color: '#bdc5c7', fontSize: 11, fontWeight: '700' }, emptyText: { marginTop: 4, color: '#687579', fontSize: 8 }, addButton: { height: 50, borderRadius: 8, backgroundColor: '#f66f00', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }, addButtonText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  modalBackdrop: { flex: 1, padding: 18, backgroundColor: 'rgba(0,0,0,0.78)', alignItems: 'center', justifyContent: 'center' }, modalCard: { width: '100%', maxWidth: 520, maxHeight: '90%', padding: 14, borderWidth: 1, borderColor: '#334147', borderRadius: 8, backgroundColor: '#081115' }, modalCardCompact: { maxHeight: '94%' }, modalHandle: { alignSelf: 'center', width: 36, height: 4, marginBottom: 11, borderRadius: 2, backgroundColor: '#3d484c' }, modalHeader: { marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, modalTitle: { color: '#edf0f1', fontSize: 16, fontWeight: '800' }, modalSubtitle: { marginTop: 3, color: '#7f8b8f', fontSize: 8 }, modalClose: { width: 36, height: 36, borderWidth: 1, borderColor: '#2f3c41', borderRadius: 18, alignItems: 'center', justifyContent: 'center' }, imagePreview: { width: '100%', height: 150, marginBottom: 12, borderRadius: 7, backgroundColor: '#0b1519' }, filePreview: { height: 120, marginBottom: 12, borderWidth: 1, borderColor: '#2d3a40', borderRadius: 7, backgroundColor: '#0a1519', alignItems: 'center', justifyContent: 'center' }, previewType: { marginTop: 7, color: '#778488', fontSize: 7, fontWeight: '700' }, detailName: { color: '#e4e8e9', fontSize: 12, lineHeight: 17, fontWeight: '800' }, detailGrid: { marginTop: 12, marginBottom: 13, padding: 9, borderWidth: 1, borderColor: '#2b393e', borderRadius: 7, flexDirection: 'row', flexWrap: 'wrap' }, detailItem: { width: '50%', minHeight: 42, paddingHorizontal: 6, justifyContent: 'center' }, detailLabel: { color: '#6e7b7f', fontSize: 7 }, detailValue: { marginTop: 4, color: '#d5dadb', fontSize: 8, fontWeight: '700' }, categoryLabel: { marginBottom: 7, color: '#aeb7ba', fontSize: 8, fontWeight: '700' }, categoryOptions: { marginBottom: 14, flexDirection: 'row', flexWrap: 'wrap', gap: 6 }, categoryOption: { height: 34, paddingHorizontal: 10, borderWidth: 1, borderColor: '#334147', borderRadius: 6, alignItems: 'center', justifyContent: 'center' }, categoryOptionActive: { borderColor: ORANGE, backgroundColor: 'rgba(255,122,0,0.07)' }, categoryOptionText: { color: '#7d898d', fontSize: 8 }, categoryOptionTextActive: { color: ORANGE, fontWeight: '700' }, modalActions: { flexDirection: 'row', gap: 8 }, deleteButton: { flex: 0.8, height: 46, borderWidth: 1, borderColor: '#61302d', borderRadius: 7, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 }, deleteText: { color: '#ff6a62', fontSize: 9, fontWeight: '700' }, openButton: { flex: 1.2, height: 46, borderRadius: 7, backgroundColor: '#f66f00', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }, openText: { color: '#fff', fontSize: 10, fontWeight: '800' }, pressed: { opacity: 0.72 }, missingScreen: { flex: 1, backgroundColor: '#020709', alignItems: 'center', justifyContent: 'center' }, missingTitle: { color: '#d8ddde', fontSize: 17, fontWeight: '700' }, primaryButton: { height: 44, marginTop: 18, paddingHorizontal: 18, borderRadius: 8, backgroundColor: '#f66f00', alignItems: 'center', justifyContent: 'center' }, primaryButtonText: { color: '#fff', fontSize: 11, fontWeight: '700' },
});

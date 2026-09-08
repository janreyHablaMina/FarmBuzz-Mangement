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

const SALES_HERO_IMAGE = require('./assets/sales-hero.png');
const ORANGE = '#ff7a00';
const RELEASE_OPTIONS = [
  {
    id: 'immediate',
    label: 'Get Immediately',
    detail: 'Buyer can take the chicken after payment confirmation.',
    icon: 'truck-fast-outline',
  },
  {
    id: 'reservation',
    label: 'Reserve Until Ready',
    detail: 'Hold the chicken for pickup before the ready date.',
    icon: 'calendar-clock-outline',
  },
];
const READY_WINDOWS = ['Today', 'Tomorrow', 'Sep 8, 2026', 'Sep 12, 2026'];

function getBirdKey(bird) {
  return bird?._recordKey || bird?.farmBuzzId || bird?.name;
}

function getBirdCategory(bird) {
  const bloodline = bird?.bloodline?.replace(' Bloodline', '') || 'Gamefowl';
  return `${bloodline} ${bird?.type || 'Bird'}`;
}

function formatToday() {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date());
}

function HeaderButton({ onPress }) {
  return (
    <Pressable accessibilityLabel="Back to sales" onPress={onPress} style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}>
      <Ionicons name="arrow-back" size={21} color="#eef1f2" />
    </Pressable>
  );
}

function OptionCard({ option, active, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [styles.optionCard, active && styles.optionCardActive, pressed && styles.pressed]}
    >
      <View style={[styles.optionIcon, active && styles.optionIconActive]}>
        <MaterialCommunityIcons name={option.icon} size={23} color={active ? '#fff' : ORANGE} />
      </View>
      <View style={styles.optionCopy}>
        <Text style={[styles.optionTitle, active && styles.optionTitleActive]}>{option.label}</Text>
        <Text style={styles.optionDetail}>{option.detail}</Text>
      </View>
      <Ionicons name={active ? 'checkmark-circle' : 'ellipse-outline'} size={20} color={active ? ORANGE : '#617075'} />
    </Pressable>
  );
}

function BirdPicker({ birds, selectedBird, open, onToggle, onSelect }) {
  return (
    <View style={[styles.fieldCard, open && styles.fieldCardOpen]}>
      <Pressable onPress={onToggle} style={({ pressed }) => [styles.fieldTrigger, pressed && styles.rowPressed]}>
        <View style={styles.fieldIcon}><MaterialCommunityIcons name="bird" size={20} color={ORANGE} /></View>
        <View style={styles.fieldCopy}>
          <Text style={styles.fieldLabel}>Chicken</Text>
          <Text numberOfLines={1} style={[styles.fieldValue, !selectedBird && styles.placeholder]}>{selectedBird?.name || 'Select chicken for sale'}</Text>
        </View>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color="#899397" />
      </Pressable>
      {open && (
        <View style={styles.dropdownList}>
          {birds.map((bird) => (
            <Pressable key={getBirdKey(bird)} onPress={() => onSelect(bird)} style={({ pressed }) => [styles.birdRow, pressed && styles.rowPressed]}>
              <Image source={bird.image} style={styles.birdThumb} contentFit="cover" cachePolicy="memory-disk" />
              <View style={styles.birdCopy}>
                <Text numberOfLines={1} style={styles.birdName}>{bird.name}</Text>
                <Text numberOfLines={1} style={styles.birdMeta}>{getBirdCategory(bird)} - {bird.status}</Text>
              </View>
              {getBirdKey(selectedBird) === getBirdKey(bird) && <Ionicons name="checkmark" size={18} color={ORANGE} />}
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

function ReadyWindowPicker({ value, open, onToggle, onSelect }) {
  return (
    <View style={[styles.fieldCard, open && styles.fieldCardOpen]}>
      <Pressable onPress={onToggle} style={({ pressed }) => [styles.fieldTrigger, pressed && styles.rowPressed]}>
        <View style={styles.fieldIcon}><MaterialCommunityIcons name="calendar-check-outline" size={20} color={ORANGE} /></View>
        <View style={styles.fieldCopy}>
          <Text style={styles.fieldLabel}>Ready / Pickup Before</Text>
          <Text style={styles.fieldValue}>{value}</Text>
        </View>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color="#899397" />
      </Pressable>
      {open && (
        <View style={styles.dropdownList}>
          {READY_WINDOWS.map((item) => (
            <Pressable key={item} onPress={() => onSelect(item)} style={({ pressed }) => [styles.dropdownRow, pressed && styles.rowPressed]}>
              <Text style={[styles.dropdownText, item === value && styles.dropdownTextSelected]}>{item}</Text>
              {item === value && <Ionicons name="checkmark" size={18} color={ORANGE} />}
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

export default function ChickenPurchaseScreen({ birds = [], onBack, onComplete }) {
  const { width } = useWindowDimensions();
  const compact = width < 480;
  const narrow = width < 390;
  const availableBirds = useMemo(() => birds.filter((bird) => !['Sold', 'Transferred'].includes(bird.status)), [birds]);
  const [selectedBird, setSelectedBird] = useState(availableBirds[0] || null);
  const [buyerName, setBuyerName] = useState('');
  const [buyerContact, setBuyerContact] = useState('');
  const [price, setPrice] = useState('');
  const [releaseType, setReleaseType] = useState('immediate');
  const [readyWindow, setReadyWindow] = useState('Sep 8, 2026');
  const [notes, setNotes] = useState('');
  const [openField, setOpenField] = useState(null);

  const selectedOption = RELEASE_OPTIONS.find((option) => option.id === releaseType);
  const canSubmit = selectedBird && buyerName.trim() && price.trim();
  const submitLabel = releaseType === 'immediate' ? 'Confirm Sale' : 'Reserve Chicken';

  const submitPurchase = () => {
    if (!canSubmit) {
      Alert.alert('Missing sale details', 'Select a chicken, buyer name, and price before continuing.');
      return;
    }
    onComplete({
      id: `purchase-${Date.now()}`,
      bird: selectedBird,
      birdKey: getBirdKey(selectedBird),
      buyerName: buyerName.trim(),
      buyerContact: buyerContact.trim() || 'Contact not recorded',
      price: price.trim(),
      releaseType,
      readyWindow: releaseType === 'reservation' ? readyWindow : 'Today',
      notes: notes.trim(),
      createdAt: formatToday(),
    });
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.pageWrap}>
        <View style={styles.page}>
          <View style={[styles.hero, compact && styles.heroCompact]}>
            <Image source={SALES_HERO_IMAGE} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="center" cachePolicy="memory-disk" />
            <LinearGradient colors={['rgba(2,7,9,0.22)', 'rgba(2,7,9,0.38)', '#03090c']} locations={[0, 0.5, 1]} style={StyleSheet.absoluteFill} />
            <SafeAreaView edges={['top']} style={styles.heroSafeArea}>
              <View style={styles.heroHeader}>
                <HeaderButton onPress={onBack} />
                <Text style={styles.screenTitle}>Buy Chicken</Text>
              </View>
              <View style={[styles.heroCopy, narrow && styles.heroCopyNarrow]}>
                <Text style={[styles.farmName, narrow && styles.farmNameNarrow]}>FarmBuzz Farm</Text>
                <Text style={styles.heroSubtitle}>Choose immediate release or reserve before the chicken is ready.</Text>
              </View>
            </SafeAreaView>
          </View>

          <View style={[styles.content, narrow && styles.contentNarrow]}>
            <View style={styles.preview}>
              <Image source={selectedBird?.image || SALES_HERO_IMAGE} style={styles.previewImage} contentFit="cover" cachePolicy="memory-disk" />
              <View style={styles.previewCopy}>
                <Text style={styles.previewEyebrow}>{selectedOption?.label}</Text>
                <Text numberOfLines={1} style={styles.previewTitle}>{selectedBird?.name || 'No chicken selected'}</Text>
                <Text numberOfLines={1} style={styles.previewMeta}>{selectedBird ? getBirdCategory(selectedBird) : 'Select a bird to continue'} - {releaseType === 'immediate' ? 'Release today' : `Pickup before ${readyWindow}`}</Text>
              </View>
            </View>

            <BirdPicker
              birds={availableBirds}
              selectedBird={selectedBird}
              open={openField === 'bird'}
              onToggle={() => setOpenField((current) => current === 'bird' ? null : 'bird')}
              onSelect={(bird) => {
                setSelectedBird(bird);
                setOpenField(null);
              }}
            />

            <View style={[styles.optionGrid, compact && styles.optionGridCompact]}>
              {RELEASE_OPTIONS.map((option) => (
                <OptionCard key={option.id} option={option} active={releaseType === option.id} onPress={() => setReleaseType(option.id)} />
              ))}
            </View>

            {releaseType === 'reservation' && (
              <ReadyWindowPicker
                value={readyWindow}
                open={openField === 'ready'}
                onToggle={() => setOpenField((current) => current === 'ready' ? null : 'ready')}
                onSelect={(value) => {
                  setReadyWindow(value);
                  setOpenField(null);
                }}
              />
            )}

            <View style={styles.textCard}>
              <View style={styles.fieldIcon}><MaterialCommunityIcons name="account-outline" size={20} color={ORANGE} /></View>
              <View style={styles.textCopy}>
                <Text style={styles.fieldLabel}>Buyer Name</Text>
                <TextInput value={buyerName} onChangeText={setBuyerName} maxLength={70} placeholder="Enter buyer name" placeholderTextColor="#6f7b7f" selectionColor={ORANGE} style={styles.titleInput} />
              </View>
            </View>
            <View style={styles.textCard}>
              <View style={styles.fieldIcon}><MaterialCommunityIcons name="phone-outline" size={20} color={ORANGE} /></View>
              <View style={styles.textCopy}>
                <Text style={styles.fieldLabel}>Buyer Contact</Text>
                <TextInput value={buyerContact} onChangeText={setBuyerContact} maxLength={90} placeholder="Phone or location" placeholderTextColor="#6f7b7f" selectionColor={ORANGE} style={styles.titleInput} />
              </View>
            </View>
            <View style={styles.textCard}>
              <View style={styles.fieldIcon}><MaterialCommunityIcons name="cash" size={20} color={ORANGE} /></View>
              <View style={styles.textCopy}>
                <Text style={styles.fieldLabel}>Sale Price</Text>
                <TextInput value={price} onChangeText={setPrice} keyboardType="numeric" maxLength={12} placeholder="PHP amount" placeholderTextColor="#6f7b7f" selectionColor={ORANGE} style={styles.titleInput} />
              </View>
            </View>
            <View style={styles.descriptionCard}>
              <Text style={styles.fieldLabel}>Notes</Text>
              <TextInput value={notes} onChangeText={setNotes} multiline textAlignVertical="top" maxLength={220} placeholder="Deposit, pickup terms, or release notes..." placeholderTextColor="#6f7b7f" selectionColor={ORANGE} style={styles.descriptionInput} />
            </View>

            <View style={styles.actions}>
              <Pressable onPress={onBack} style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable disabled={!canSubmit} onPress={submitPurchase} style={({ pressed }) => [styles.createButton, !canSubmit && styles.createDisabled, pressed && canSubmit && styles.pressed]}>
                <MaterialCommunityIcons name={releaseType === 'immediate' ? 'cash-check' : 'calendar-plus'} size={20} color="#fff" />
                <Text style={styles.createText}>{submitLabel}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#020709' },
  pageWrap: { flexGrow: 1, alignItems: 'center', backgroundColor: '#020709' },
  page: { width: '100%', maxWidth: 720, backgroundColor: '#020709' },
  hero: { height: 245, overflow: 'hidden', backgroundColor: '#101719' },
  heroCompact: { height: 230 },
  heroSafeArea: { flex: 1 },
  heroHeader: { flexDirection: 'row', alignItems: 'center', gap: 13, paddingHorizontal: 16, paddingTop: Platform.OS === 'web' ? 10 : 3 },
  headerButton: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(190,204,208,0.35)', backgroundColor: 'rgba(2,8,11,0.65)', alignItems: 'center', justifyContent: 'center' },
  screenTitle: { color: '#f2f4f4', fontSize: 18, fontWeight: '700', letterSpacing: 0 },
  heroCopy: { marginTop: 'auto', paddingHorizontal: 18, paddingBottom: 25 },
  heroCopyNarrow: { paddingHorizontal: 11, paddingBottom: 20 },
  farmName: { color: '#f5f6f6', fontSize: 32, lineHeight: 38, fontWeight: '800', letterSpacing: 0, fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', web: 'Georgia' }), textShadowColor: 'rgba(0,0,0,0.75)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 5 },
  farmNameNarrow: { fontSize: 28, lineHeight: 33 },
  heroSubtitle: { marginTop: 5, color: '#c0c7c9', fontSize: 13, letterSpacing: 0 },
  content: { paddingHorizontal: 14, paddingTop: 14, paddingBottom: 30, gap: 10 },
  contentNarrow: { paddingHorizontal: 9 },
  preview: { minHeight: 78, padding: 10, borderWidth: 1, borderColor: '#5b3b14', borderRadius: 8, backgroundColor: 'rgba(255,122,0,0.045)', flexDirection: 'row', alignItems: 'center', gap: 10 },
  previewImage: { width: 54, height: 54, borderRadius: 7, borderWidth: 1, borderColor: '#70450d' },
  previewCopy: { flex: 1, minWidth: 0 },
  previewEyebrow: { color: ORANGE, fontSize: 7, fontWeight: '800', letterSpacing: 0 },
  previewTitle: { marginTop: 3, color: '#edf0f1', fontSize: 14, fontWeight: '800', letterSpacing: 0 },
  previewMeta: { marginTop: 4, color: '#839094', fontSize: 9, letterSpacing: 0 },
  fieldCard: { position: 'relative', zIndex: 1, borderWidth: 1, borderColor: '#26343a', borderRadius: 8, backgroundColor: '#0a1317', overflow: 'visible' },
  fieldCardOpen: { zIndex: 100, elevation: 12, borderColor: '#69410e' },
  fieldTrigger: { minHeight: 60, paddingHorizontal: 11, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 10 },
  fieldIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,122,0,0.08)', alignItems: 'center', justifyContent: 'center' },
  fieldCopy: { flex: 1, minWidth: 0 },
  fieldLabel: { color: '#dfe3e4', fontSize: 10, fontWeight: '700', letterSpacing: 0 },
  fieldValue: { marginTop: 4, color: '#c2c9cb', fontSize: 11, letterSpacing: 0 },
  placeholder: { color: '#707c80' },
  dropdownList: { position: 'absolute', top: 61, left: -1, right: -1, zIndex: 110, elevation: 14, borderWidth: 1, borderColor: '#36464d', borderRadius: 8, backgroundColor: '#081115', overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.42, shadowRadius: 14 },
  birdRow: { minHeight: 62, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: '#1e2b31', flexDirection: 'row', alignItems: 'center', gap: 9 },
  birdThumb: { width: 42, height: 42, borderRadius: 7 },
  birdCopy: { flex: 1, minWidth: 0 },
  birdName: { color: '#e4e8e9', fontSize: 11, fontWeight: '700', letterSpacing: 0 },
  birdMeta: { marginTop: 3, color: '#748084', fontSize: 8, letterSpacing: 0 },
  dropdownRow: { minHeight: 45, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#1e2b31', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 9 },
  dropdownText: { color: '#b7c0c2', fontSize: 11, letterSpacing: 0 },
  dropdownTextSelected: { color: ORANGE, fontWeight: '700' },
  rowPressed: { backgroundColor: '#111d22' },
  optionGrid: { flexDirection: 'row', gap: 9 },
  optionGridCompact: { flexDirection: 'column' },
  optionCard: { flex: 1, minHeight: 91, padding: 11, borderRadius: 8, borderWidth: 1, borderColor: '#26343a', backgroundColor: '#0a1317', flexDirection: 'row', alignItems: 'center', gap: 9 },
  optionCardActive: { borderColor: ORANGE, backgroundColor: 'rgba(255,122,0,0.08)' },
  optionIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,122,0,0.08)', alignItems: 'center', justifyContent: 'center' },
  optionIconActive: { backgroundColor: ORANGE },
  optionCopy: { flex: 1, minWidth: 0 },
  optionTitle: { color: '#dfe4e5', fontSize: 11, fontWeight: '800', letterSpacing: 0 },
  optionTitleActive: { color: '#fff' },
  optionDetail: { marginTop: 4, color: '#7b878b', fontSize: 8, lineHeight: 12, letterSpacing: 0 },
  textCard: { minHeight: 66, paddingHorizontal: 11, borderWidth: 1, borderColor: '#26343a', borderRadius: 8, backgroundColor: '#0a1317', flexDirection: 'row', alignItems: 'center', gap: 10 },
  textCopy: { flex: 1, minWidth: 0 },
  titleInput: { height: 35, paddingVertical: 0, color: '#e5e9ea', fontSize: 11, outlineStyle: 'none' },
  descriptionCard: { padding: 11, borderWidth: 1, borderColor: '#26343a', borderRadius: 8, backgroundColor: '#0a1317' },
  descriptionInput: { minHeight: 78, marginTop: 7, padding: 9, borderWidth: 1, borderColor: '#223138', borderRadius: 7, color: '#e5e9ea', fontSize: 11, outlineStyle: 'none' },
  actions: { flexDirection: 'row', gap: 8 },
  cancelButton: { flex: 0.75, height: 50, borderWidth: 1, borderColor: '#2a383e', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  cancelText: { color: '#bac2c4', fontSize: 12, fontWeight: '600', letterSpacing: 0 },
  createButton: { flex: 1.35, height: 50, borderRadius: 8, backgroundColor: '#f66f00', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  createDisabled: { backgroundColor: '#3b4143', opacity: 0.65 },
  createText: { color: '#fff', fontSize: 12, fontWeight: '700', letterSpacing: 0 },
  pressed: { opacity: 0.72 },
});

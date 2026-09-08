import { useMemo, useState } from 'react';
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
import { INCUBATION_BATCHES } from './farmData';

const HERO_IMAGE = require('./assets/eggs-incubation-hero.png');
const ORANGE = '#ff7a00';

function HeaderButton({ onPress }) {
  return (
    <Pressable accessibilityLabel="Back to batch detail" onPress={onPress} style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}>
      <Ionicons name="arrow-back" size={21} color="#eef1f2" />
    </Pressable>
  );
}

function SummaryCard({ icon, value, label, emphasized, compact }) {
  return (
    <View style={[styles.summaryCard, compact && styles.summaryCardCompact]}>
      <MaterialCommunityIcons name={icon} size={22} color={emphasized ? '#ef6b55' : ORANGE} />
      <Text style={[styles.summaryValue, emphasized && styles.summaryValueEmphasized]}>{value}</Text>
      <Text numberOfLines={2} style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function CounterRow({ icon, title, detail, value, onDecrease, onIncrease, isLast }) {
  return (
    <View style={[styles.counterRow, !isLast && styles.rowDivider]}>
      <View style={styles.counterIcon}>
        <MaterialCommunityIcons name={icon} size={24} color={ORANGE} />
      </View>
      <View style={styles.counterCopy}>
        <Text style={styles.counterTitle}>{title}</Text>
        <Text style={styles.counterDetail}>{detail}</Text>
      </View>
      <View style={styles.stepper}>
        <Pressable accessibilityLabel={`Decrease ${title}`} onPress={onDecrease} style={({ pressed }) => [styles.stepperButton, pressed && styles.pressed]}>
          <Ionicons name="remove" size={19} color="#c8ced0" />
        </Pressable>
        <Text style={styles.stepperValue}>{value}</Text>
        <Pressable accessibilityLabel={`Increase ${title}`} onPress={onIncrease} style={({ pressed }) => [styles.stepperButton, pressed && styles.pressed]}>
          <Ionicons name="add" size={19} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
}

export default function CandlingScreen({ batchId, initialResults, onBack, onSave }) {
  const { width } = useWindowDimensions();
  const compact = width < 480;
  const narrow = width < 390;
  const batch = useMemo(
    () => INCUBATION_BATCHES.find((item) => item.id === batchId) ?? INCUBATION_BATCHES[0],
    [batchId],
  );
  const [rejected, setRejected] = useState(initialResults?.rejected ?? 0);
  const [recheck, setRecheck] = useState(initialResults?.recheck ?? 0);
  const developing = batch.eggCount - rejected - recheck;

  const changeRejected = (amount) => {
    setRejected((current) => Math.max(0, Math.min(current + amount, batch.eggCount - recheck)));
  };

  const changeRecheck = (amount) => {
    setRecheck((current) => Math.max(0, Math.min(current + amount, batch.eggCount - rejected)));
  };

  const saveResults = () => {
    const results = { total: batch.eggCount, developing, rejected, recheck, saved: true };
    Alert.alert(
      'Save candling totals?',
      `${developing} developing, ${rejected} rejected, and ${recheck} to recheck.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Save Results', onPress: () => onSave(results) },
      ],
    );
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.pageWrap}>
        <View style={styles.page}>
          <View style={[styles.hero, compact && styles.heroCompact]}>
            <Image source={HERO_IMAGE} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="center" cachePolicy="memory-disk" />
            <LinearGradient colors={['rgba(1, 5, 7, 0.24)', 'rgba(1, 5, 7, 0.08)', '#03090c']} locations={[0, 0.46, 1]} style={StyleSheet.absoluteFill} />
            <SafeAreaView edges={['top']} style={styles.heroSafeArea}>
              <View style={styles.heroHeader}>
                <HeaderButton onPress={onBack} />
                <Text style={styles.screenTitle}>Candling - {batch.id}</Text>
              </View>
              <View style={styles.heroCopy}>
                <Text style={[styles.farmName, narrow && styles.farmNameNarrow]}>FarmBuzz Farm</Text>
                <Text style={styles.farmTagline}>Record the candling totals for this batch.</Text>
              </View>
            </SafeAreaView>
          </View>

          <View style={[styles.content, narrow && styles.contentNarrow]}>
            <View style={styles.summaryGrid}>
              <SummaryCard icon="egg-outline" value={batch.eggCount} label="Total Eggs" compact={narrow} />
              <SummaryCard icon="check-circle-outline" value={developing} label="Developing" compact={narrow} />
              <SummaryCard icon="archive-remove-outline" value={rejected} label="Rejected" emphasized compact={narrow} />
              <SummaryCard icon="clock-outline" value={recheck} label="Recheck" compact={narrow} />
            </View>

            <Text style={styles.sectionTitle}>Candling Totals</Text>
            <View style={styles.counterList}>
              <CounterRow
                icon="archive-remove-outline"
                title="Rejected"
                detail="Clear or stopped eggs"
                value={rejected}
                onDecrease={() => changeRejected(-1)}
                onIncrease={() => changeRejected(1)}
              />
              <CounterRow
                icon="clock-outline"
                title="Recheck"
                detail="Uncertain eggs to check again"
                value={recheck}
                onDecrease={() => changeRecheck(-1)}
                onIncrease={() => changeRecheck(1)}
                isLast
              />
            </View>

            <View style={styles.calculationBand}>
              <MaterialCommunityIcons name="check-decagram-outline" size={24} color={ORANGE} />
              <View style={styles.calculationCopy}>
                <Text style={styles.calculationTitle}>{developing} developing eggs</Text>
                <Text style={styles.calculationDetail}>Total eggs minus rejected and recheck</Text>
              </View>
            </View>

            {!!rejected && (
              <View style={styles.removedBand}>
                <MaterialCommunityIcons name="archive-remove-outline" size={23} color="#ef6b55" />
                <View style={styles.removedCopy}>
                  <Text style={styles.removedTitle}>{rejected} eggs will be removed</Text>
                  <Text style={styles.removedDetail}>Recorded as rejected in this candling check</Text>
                </View>
              </View>
            )}

            <Pressable onPress={saveResults} style={({ pressed }) => [styles.saveButton, pressed && styles.pressed]}>
              <MaterialCommunityIcons name="content-save-check-outline" size={23} color="#fff" />
              <Text style={styles.saveButtonText}>Save Candling Totals</Text>
            </Pressable>
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
  hero: { height: 220, overflow: 'hidden', backgroundColor: '#101719' },
  heroCompact: { height: 210 },
  heroSafeArea: { flex: 1 },
  heroHeader: { flexDirection: 'row', alignItems: 'center', gap: 13, paddingHorizontal: 16, paddingTop: Platform.OS === 'web' ? 10 : 3 },
  headerButton: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(190, 204, 208, 0.35)', backgroundColor: 'rgba(2, 8, 11, 0.65)', alignItems: 'center', justifyContent: 'center' },
  screenTitle: { color: '#f0f2f3', fontSize: 17, fontWeight: '700', letterSpacing: 0 },
  heroCopy: { marginTop: 'auto', paddingHorizontal: 18, paddingBottom: 22 },
  farmName: { color: '#f5f6f6', fontSize: 32, lineHeight: 38, fontWeight: '800', letterSpacing: 0, fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', web: 'Georgia' }), textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 5 },
  farmNameNarrow: { fontSize: 28, lineHeight: 34 },
  farmTagline: { marginTop: 5, color: '#bac1c3', fontSize: 13, lineHeight: 18, letterSpacing: 0 },
  content: { paddingHorizontal: 10, paddingBottom: 22 },
  contentNarrow: { paddingHorizontal: 8 },
  summaryGrid: { marginTop: 12, flexDirection: 'row', gap: 8 },
  summaryCard: { flex: 1, minWidth: 0, height: 86, paddingHorizontal: 5, borderRadius: 8, borderWidth: 1, borderColor: '#1c2a30', backgroundColor: '#0b1418', alignItems: 'center', justifyContent: 'center' },
  summaryCardCompact: { height: 80 },
  summaryValue: { marginTop: 3, color: '#f1f3f3', fontSize: 20, fontWeight: '700', letterSpacing: 0 },
  summaryValueEmphasized: { color: '#ef6b55' },
  summaryLabel: { marginTop: 3, color: '#899397', fontSize: 9, textAlign: 'center', letterSpacing: 0 },
  sectionTitle: { marginTop: 22, marginBottom: 8, color: '#e5e9ea', fontSize: 16, fontWeight: '600', letterSpacing: 0 },
  counterList: { borderRadius: 8, borderWidth: 1, borderColor: '#1c2a30', backgroundColor: '#0b1418', overflow: 'hidden' },
  counterRow: { minHeight: 78, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: '#1b292f' },
  counterIcon: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, borderColor: '#6a3d12', backgroundColor: 'rgba(255, 122, 0, 0.08)', alignItems: 'center', justifyContent: 'center' },
  counterCopy: { flex: 1, minWidth: 0 },
  counterTitle: { color: '#e8ebec', fontSize: 13, fontWeight: '600', letterSpacing: 0 },
  counterDetail: { marginTop: 3, color: '#7f8a8e', fontSize: 9, letterSpacing: 0 },
  stepper: { height: 40, borderRadius: 7, borderWidth: 1, borderColor: '#304047', backgroundColor: '#081115', flexDirection: 'row', alignItems: 'center', overflow: 'hidden' },
  stepperButton: { width: 39, height: 40, alignItems: 'center', justifyContent: 'center' },
  stepperValue: { minWidth: 38, color: '#f1f3f3', fontSize: 16, fontWeight: '700', textAlign: 'center', letterSpacing: 0 },
  calculationBand: { minHeight: 64, marginTop: 11, paddingHorizontal: 14, borderRadius: 8, borderWidth: 1, borderColor: '#51320f', backgroundColor: 'rgba(91, 48, 7, 0.15)', flexDirection: 'row', alignItems: 'center', gap: 12 },
  calculationCopy: { flex: 1 },
  calculationTitle: { color: '#e9eced', fontSize: 13, fontWeight: '600', letterSpacing: 0 },
  calculationDetail: { marginTop: 3, color: '#8f999d', fontSize: 9, letterSpacing: 0 },
  removedBand: { minHeight: 60, marginTop: 9, paddingHorizontal: 14, borderRadius: 8, borderWidth: 1, borderColor: '#422725', backgroundColor: '#100f10', flexDirection: 'row', alignItems: 'center', gap: 12 },
  removedCopy: { flex: 1 },
  removedTitle: { color: '#e3e6e7', fontSize: 12, fontWeight: '600', letterSpacing: 0 },
  removedDetail: { marginTop: 3, color: '#967d79', fontSize: 9, letterSpacing: 0 },
  saveButton: { minHeight: 52, marginTop: 14, paddingHorizontal: 18, borderRadius: 8, backgroundColor: '#f66f00', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  saveButtonText: { color: '#fff', fontSize: 13, fontWeight: '700', letterSpacing: 0 },
  pressed: { opacity: 0.72 },
});

import { useMemo, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { INCUBATION_BATCHES } from './farmData';

const HERO_IMAGE = require('./assets/eggs-incubation-hero.png');
const ORANGE = '#ff7900';

export default function RecordHatchScreen({ batchId, activeEggCount, initialResult, batchOverride, sourcesOverride, onBack, onSave }) {
  const batch = useMemo(() => batchOverride || INCUBATION_BATCHES.find((item) => item.id === batchId) || INCUBATION_BATCHES[0], [batchId, batchOverride]);
  const hatchEggs = activeEggCount || batch.eggCount;
  const sources = useMemo(() => {
    if (!sourcesOverride) return batch.sources || [{ groupName: 'Breeding Group', cross: batch.source, eggs: hatchEggs }];
    const sourceEggTotal = sourcesOverride.reduce((sum, source) => sum + source.eggs, 0) || sourcesOverride.length;
    let assignedEggs = 0;
    return sourcesOverride.map((source, index) => {
      const eggs = index === sourcesOverride.length - 1
        ? hatchEggs - assignedEggs
        : Math.floor((source.eggs / sourceEggTotal) * hatchEggs);
      assignedEggs += eggs;
      return { ...source, eggs };
    });
  }, [batch, hatchEggs, sourcesOverride]);
  
  const [mode, setMode] = useState('overall'); // 'source' or 'overall'
  const [hatchDate, setHatchDate] = useState(() => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date()));
  const [counts, setCounts] = useState(() => Object.fromEntries(sources.map((source) => [source.groupName, initialResult?.sources?.find((item) => item.groupName === source.groupName)?.hatched ?? 0])));
  const [markings, setMarkings] = useState(() => Object.fromEntries(sources.map((source) => [source.groupName, initialResult?.sources?.find((item) => item.groupName === source.groupName)?.marking || ''])));
  
  const [overallHatched, setOverallHatched] = useState(0);
  const [overallNotes, setOverallNotes] = useState('');

  const hatched = mode === 'source' ? Object.values(counts).reduce((sum, count) => sum + count, 0) : overallHatched;
  const unhatched = Math.max(0, hatchEggs - hatched);
  const hatchRate = hatchEggs ? Math.round((hatched / hatchEggs) * 100) : 0;

  const changeCount = (source, amount) => setCounts((current) => ({ ...current, [source.groupName]: Math.max(0, Math.min(source.eggs, current[source.groupName] + amount)) }));
  const enterCount = (source, value) => {
    const digits = value.replace(/[^0-9]/g, '');
    const count = digits ? Math.min(source.eggs, Number(digits)) : 0;
    setCounts((current) => ({ ...current, [source.groupName]: count }));
  };
  
  const changeOverallCount = (amount) => setOverallHatched((current) => Math.max(0, Math.min(hatchEggs, current + amount)));
  const enterOverallCount = (value) => {
    const digits = value.replace(/[^0-9]/g, '');
    const count = digits ? Math.min(hatchEggs, Number(digits)) : 0;
    setOverallHatched(count);
  };

  const save = () => {
    Alert.alert('Save hatch result?', `${hatched} chicks hatched from ${hatchEggs} eggs.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Save Hatch', onPress: () => {
          const finalSources = mode === 'source' 
            ? sources.map((source) => ({ ...source, hatched: counts[source.groupName], marking: markings[source.groupName].trim() }))
            : [{ groupName: 'All Sources', cross: 'Mixed', eggs: hatchEggs, hatched: overallHatched, marking: overallNotes.trim() }];
            
          onSave({ saved: true, batchId, hatchDate, eggsAtHatch: hatchEggs, hatched, unhatched, hatchRate, sources: finalSources });
        }
      }
    ]);
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.pageWrap}>
        <View style={styles.page}>
          <View style={styles.hero}>
            <Image source={HERO_IMAGE} style={StyleSheet.absoluteFill} contentFit="cover" />
            <LinearGradient colors={['rgba(2,7,9,0.2)', 'rgba(2,7,9,0.22)', '#03090c']} locations={[0, 0.45, 1]} style={StyleSheet.absoluteFill} />
            <SafeAreaView edges={['top']} style={styles.safe}>
              <View style={styles.header}>
                <Pressable onPress={onBack} style={styles.back}><Ionicons name="arrow-back" size={21} color="#fff" /></Pressable>
                <Text style={styles.headerTitle}>Record Hatch</Text>
              </View>
              <View style={styles.heroCopy}>
                <Text style={styles.farmName}>FarmBuzz Farm</Text>
                <Text style={styles.tagline}>Complete {batch.id} and create its brooding batch.</Text>
              </View>
            </SafeAreaView>
          </View>
          <View style={styles.content}>
            <View style={styles.batchBand}>
              <View><Text style={styles.eyebrow}>BATCH ID</Text><Text style={styles.batchId}>{batch.id}</Text></View>
              <View><Text style={styles.eyebrow}>EGGS AT HATCH</Text><Text style={styles.batchValue}>{hatchEggs} eggs</Text></View>
              <View><Text style={styles.eyebrow}>HATCH DATE</Text><TextInput value={hatchDate} onChangeText={setHatchDate} style={styles.dateInput} /></View>
            </View>
            
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Hatch Record</Text>
              <View style={styles.modeTabs}>
                <Pressable onPress={() => setMode('overall')} style={[styles.modeTab, mode === 'overall' && styles.modeTabActive]}>
                  <Text style={[styles.modeTabText, mode === 'overall' && styles.modeTabTextActive]}>Overall</Text>
                </Pressable>
                <Pressable onPress={() => setMode('source')} style={[styles.modeTab, mode === 'source' && styles.modeTabActive]}>
                  <Text style={[styles.modeTabText, mode === 'source' && styles.modeTabTextActive]}>By Source</Text>
                </Pressable>
              </View>
            </View>

            {mode === 'source' ? (
              <View style={styles.sourceList}>
                {sources.map((source, index) => (
                  <View key={source.groupName} style={[styles.sourceRow, index > 0 && styles.divider]}>
                    <View style={styles.sourceTop}>
                      <View>
                        <Text style={styles.sourceName}>{source.groupName}</Text>
                        <Text style={styles.sourceCross}>{source.cross}</Text>
                      </View>
                      <Text style={styles.sourceEggs}>{source.eggs} eggs</Text>
                    </View>
                    <View style={styles.sourceControls}>
                      <Text style={styles.controlLabel}>Chicks Hatched</Text>
                      <View style={styles.stepper}>
                        <Pressable onPress={() => changeCount(source, -1)} style={styles.stepButton}><Ionicons name="remove" size={17} color="#abb6b9" /></Pressable>
                        <TextInput value={String(counts[source.groupName])} onChangeText={(value) => enterCount(source, value)} keyboardType="number-pad" inputMode="numeric" selectTextOnFocus maxLength={3} style={styles.stepValue} />
                        <Pressable onPress={() => changeCount(source, 1)} style={styles.stepButton}><Ionicons name="add" size={17} color="#fff" /></Pressable>
                      </View>
                    </View>
                    <View style={styles.markingField}>
                      <MaterialCommunityIcons name="tag-outline" size={17} color={ORANGE} />
                      <TextInput value={markings[source.groupName]} onChangeText={(value) => setMarkings((current) => ({ ...current, [source.groupName]: value }))} placeholder="Optional chick marking" placeholderTextColor="#68777c" style={styles.markingInput} />
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.overallContainer}>
                <View style={styles.sourceControls}>
                  <Text style={styles.controlLabel}>Total Chicks Hatched</Text>
                  <View style={styles.stepper}>
                    <Pressable onPress={() => changeOverallCount(-1)} style={styles.stepButton}><Ionicons name="remove-circle-outline" size={17} color="#abb6b9" /></Pressable>
                    <TextInput value={String(overallHatched)} onChangeText={enterOverallCount} keyboardType="number-pad" inputMode="numeric" selectTextOnFocus maxLength={4} style={[styles.stepValue, { width: 50 }]} />
                    <Pressable onPress={() => changeOverallCount(1)} style={styles.stepButton}><Ionicons name="add-circle-outline" size={17} color="#fff" /></Pressable>
                  </View>
                </View>
                <View style={[styles.markingField, styles.notesField]}>
                  <MaterialCommunityIcons name="text-box-outline" size={17} color={ORANGE} style={{ marginTop: 2 }} />
                  <TextInput value={overallNotes} onChangeText={setOverallNotes} placeholder="Add notes or markings (e.g. Day 1: Hatched 100)" placeholderTextColor="#68777c" multiline style={[styles.markingInput, styles.notesInput]} />
                </View>
              </View>
            )}

            <View style={styles.summary}>
              <View><Text style={styles.summaryValue}>{hatched}</Text><Text style={styles.summaryLabel}>Chicks Hatched</Text></View>
              <View><Text style={styles.summaryValue}>{unhatched}</Text><Text style={styles.summaryLabel}>Unhatched</Text></View>
              <View><Text style={styles.summaryValue}>{hatchRate}%</Text><Text style={styles.summaryLabel}>Hatch Rate</Text></View>
            </View>
            <Pressable onPress={save} style={({ pressed }) => [styles.saveButton, pressed && styles.pressed]}>
              <MaterialCommunityIcons name="content-save-check-outline" size={21} color="#fff" />
              <Text style={styles.saveText}>Save Hatch</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#020709' },
  pageWrap: { flexGrow: 1, alignItems: 'center' },
  page: { width: '100%', maxWidth: 720 },
  hero: { height: 220, overflow: 'hidden' },
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingTop: Platform.OS === 'web' ? 10 : 3 },
  back: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(190,204,208,0.35)', backgroundColor: 'rgba(2,8,11,0.65)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#fff', fontSize: 15, fontWeight: '800' },
  heroCopy: { marginTop: 'auto', padding: 18, paddingBottom: 20 },
  farmName: { color: '#fff', fontSize: 29, lineHeight: 35, fontWeight: '800', fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', web: 'Georgia' }) },
  tagline: { marginTop: 3, color: '#bdc6c9', fontSize: 12 },
  content: { padding: 10, paddingBottom: 28 },
  batchBand: { minHeight: 66, borderRadius: 7, borderWidth: 1, borderColor: '#1e2e34', backgroundColor: '#091317', paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  eyebrow: { color: '#69787d', fontSize: 7, fontWeight: '800' },
  batchId: { marginTop: 3, color: ORANGE, fontSize: 13, fontWeight: '800' },
  batchValue: { marginTop: 3, color: '#e9edef', fontSize: 11, fontWeight: '700' },
  dateInput: { marginTop: 2, width: 94, height: 24, padding: 0, color: '#dce2e4', fontSize: 9, outlineStyle: 'none' },
  
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 18, marginBottom: 8 },
  sectionTitle: { color: '#e9edef', fontSize: 14, fontWeight: '800' },
  modeTabs: { flexDirection: 'row', backgroundColor: '#131e24', borderRadius: 6, padding: 2 },
  modeTab: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 4 },
  modeTabActive: { backgroundColor: '#2a3d46' },
  modeTabText: { color: '#7a8b92', fontSize: 10, fontWeight: '700' },
  modeTabTextActive: { color: '#fff' },
  
  overallContainer: { borderRadius: 7, borderWidth: 1, borderColor: '#1e2e34', backgroundColor: '#091317', padding: 14 },
  notesField: { height: 72, alignItems: 'flex-start', paddingTop: 8 },
  notesInput: { height: 56, textAlignVertical: 'top' },

  sourceList: { borderRadius: 7, borderWidth: 1, borderColor: '#1e2e34', backgroundColor: '#091317', paddingHorizontal: 11 },
  sourceRow: { paddingVertical: 12 },
  divider: { borderTopWidth: 1, borderTopColor: '#1b2a30' },
  sourceTop: { flexDirection: 'row', justifyContent: 'space-between' },
  sourceName: { color: '#edf1f2', fontSize: 12, fontWeight: '800' },
  sourceCross: { marginTop: 3, color: '#7c898e', fontSize: 9 },
  sourceEggs: { color: ORANGE, fontSize: 9, fontWeight: '700' },
  sourceControls: { marginTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  controlLabel: { color: '#9ca7aa', fontSize: 9 },
  stepper: { height: 34, borderRadius: 6, borderWidth: 1, borderColor: '#2b3c43', flexDirection: 'row', alignItems: 'center' },
  stepButton: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  stepValue: { width: 42, height: 32, padding: 0, color: '#fff', fontSize: 12, fontWeight: '800', textAlign: 'center', outlineStyle: 'none' },
  markingField: { height: 38, marginTop: 9, borderRadius: 6, borderWidth: 1, borderColor: '#23343b', paddingHorizontal: 9, flexDirection: 'row', alignItems: 'center', gap: 7 },
  markingInput: { flex: 1, height: 36, padding: 0, color: '#e1e6e7', fontSize: 9, outlineStyle: 'none' },
  summary: { minHeight: 70, marginTop: 10, borderRadius: 7, borderWidth: 1, borderColor: '#1e2e34', backgroundColor: '#091317', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  summaryValue: { color: '#fff', fontSize: 17, fontWeight: '800', textAlign: 'center' },
  summaryLabel: { marginTop: 3, color: '#77858a', fontSize: 8, textAlign: 'center' },
  saveButton: { height: 48, marginTop: 10, borderRadius: 7, backgroundColor: ORANGE, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  saveText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  pressed: { opacity: 0.72 },
});

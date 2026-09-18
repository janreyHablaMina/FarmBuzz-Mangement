import { useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { daysSince } from './GrowingScreen';

const HERO_IMAGE = require('./assets/ranging-card.png');
const ORANGE = '#ff7900';
export const SELECTION_AGE_DAYS = 180;

export const RANGING_BATCHES = [
  { id: 'RG-024', birds: 38, startingBirds: 40, hatchDate: '2026-05-01T12:00:00', rangingStartDate: '2026-09-01T12:00:00', location: 'Range Area 2', status: 'Ranging', nextAction: '', growingBatch: 'GR-024', sources: [{ name: 'Main Breeders', cross: 'Sweater x Kelso', birds: 17, marking: 'Red' }, { name: 'Group B', cross: 'Kelso', birds: 12, marking: 'Blue' }, { name: 'Group C', cross: 'Roundhead x Hatch', birds: 9, marking: '' }] },
  { id: 'RG-018', birds: 31, startingBirds: 32, hatchDate: '2026-03-18T12:00:00', rangingStartDate: '2026-07-18T12:00:00', location: 'North Range', status: 'Ready for Selection', nextAction: 'Begin Selection', growingBatch: 'GR-018', sources: [{ name: 'Main Breeders', cross: 'Sweater x Kelso', birds: 18, marking: 'Red' }, { name: 'Group C', cross: 'Roundhead x Hatch', birds: 13, marking: 'Yellow' }] },
];

export function birdAgeDays(batch) { return daysSince(batch.hatchDate); }
export function monthAge(days) { const months = Math.round((days / 30) * 10) / 10; return `Month ${Number.isInteger(months) ? months : months.toFixed(1)}`; }

function Summary({ icon, value, label, detail, compact }) {
  return <View style={[styles.summary, compact && styles.summaryCompact]}><View style={styles.summaryTop}><MaterialCommunityIcons name={icon} size={24} color={ORANGE} /><Text style={styles.summaryValue}>{value}</Text></View><Text style={styles.summaryLabel}>{label}</Text><Text style={styles.summaryDetail}>{detail}</Text></View>;
}

function selectionCount(allocations, matcher) {
  return Object.entries(allocations || {}).reduce((sum, [name, count]) => matcher.test(name) ? sum + count : sum, 0);
}

export function buildRangingLocations(batches, lossesByBatch = {}, locationsByBatch = {}, selectionsByLocation = {}, readyDay = SELECTION_AGE_DAYS) {
  const grouped = new Map();
  batches.filter((batch) => batch.status !== 'Completed').forEach((batch) => {
    const location = locationsByBatch[batch.id] || batch.location || 'Unassigned Range';
    const losses = (lossesByBatch[batch.id] || []).reduce((sum, item) => sum + item.count, 0);
    const birds = Math.max(0, batch.birds - losses);
    const current = grouped.get(location) || { id: location, location, birds: 0, startingBirds: 0, batches: [], sources: [], ages: [], hatchDate: batch.hatchDate, rangingStartDate: batch.rangingStartDate };
    current.birds += birds;
    current.startingBirds += batch.startingBirds || batch.birds;
    current.batches.push(batch);
    current.sources.push(...(batch.sources || []).map((source) => ({ ...source, sourceBatch: batch.id })));
    current.ages.push(birdAgeDays(batch));
    if (new Date(batch.hatchDate) < new Date(current.hatchDate)) current.hatchDate = batch.hatchDate;
    grouped.set(location, current);
  });
  return [...grouped.values()].map((group) => {
    const selection = selectionsByLocation[group.location];
    const moved = selection?.moved ?? selectionCount(selection?.allocations, /proceed|ready/i);
    const removed = selection?.removed ?? selectionCount(selection?.allocations, /remove/i);
    const locationLosses = (lossesByBatch[group.location] || []).reduce((sum, item) => sum + item.count, 0);
    const birds = Math.max(0, group.birds - moved - removed - locationLosses);
    const minAge = Math.min(...group.ages);
    const maxAge = Math.max(...group.ages);
    const ready = maxAge >= readyDay;
    return { ...group, birds, status: ready ? 'Ready for Selection' : 'Active', ageRange: minAge === maxAge ? monthAge(minAge) : `${monthAge(minAge)} - ${monthAge(maxAge)}`, lastSelectionDate: selection?.date || '', selection };
  }).filter((group) => group.birds > 0);
}

function LocationCard({ group, readyDay, onPress }) {
  const ageDays = Math.max(...group.ages);
  const ready = ageDays >= readyDay;
  const progress = Math.max(0, Math.min(100, Math.round(((ageDays - 120) / Math.max(1, readyDay - 120)) * 100)));
  const status = ready ? 'Ready for Selection' : 'Active';
  const tone = status === 'Ready for Selection' ? '#ffba56' : status === 'Needs Attention' ? '#ef7568' : '#6ee58c';
  return <Pressable accessibilityLabel={`Open ranging location ${group.location}`} onPress={onPress} style={({ pressed }) => [styles.batch, pressed && styles.pressed]}><View style={styles.batchTop}><View style={styles.identity}><View style={styles.batchIcon}><MaterialCommunityIcons name="map-marker-radius-outline" size={22} color={ORANGE} /></View><View><Text style={styles.batchId}>{group.location}</Text><Text style={styles.location}>{group.batches.length} source {group.batches.length === 1 ? 'batch' : 'batches'}</Text></View></View><View style={[styles.status, { backgroundColor: `${tone}22` }]}><View style={[styles.dot, { backgroundColor: tone }]} /><Text style={[styles.statusText, { color: tone }]}>{status}</Text></View></View><View style={styles.metrics}><View><Text style={styles.birds}>{group.birds}</Text><Text style={styles.muted}>current birds</Text></View><View style={styles.age}><Text style={styles.ageValue}>{group.ageRange}</Text><Text style={styles.muted}>{group.lastSelectionDate ? `Last selection ${group.lastSelectionDate}` : `Day ${ageDays} - ${progress}% ready`}</Text></View></View><View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${progress}%` }]} /></View><View style={styles.footer}><View style={styles.action}><MaterialCommunityIcons name="account-search-outline" size={15} color={ORANGE} /><Text style={styles.actionText}>Record Selection</Text></View><Ionicons name="chevron-forward" size={17} color="#67767b" /></View></Pressable>;
}

export default function RangingScreen({ batches = RANGING_BATCHES, lossesByBatch = {}, locationsByBatch = {}, selectionsByLocation = {}, readyDay = SELECTION_AGE_DAYS, onBack, onOpenSettings, onOpenBatch }) {
  const { width } = useWindowDimensions();
  const compact = width < 480;
  const [query, setQuery] = useState('');
  const locations = useMemo(() => buildRangingLocations(batches, lossesByBatch, locationsByBatch, selectionsByLocation, readyDay), [batches, lossesByBatch, locationsByBatch, selectionsByLocation, readyDay]);
  const shown = useMemo(() => { const search = query.trim().toLowerCase(); return search ? locations.filter((group) => group.location.toLowerCase().includes(search)) : locations; }, [locations, query]);
  const totalBirds = locations.reduce((sum, group) => sum + group.birds, 0);
  const ready = locations.filter((group) => group.status === 'Ready for Selection').length;
  const alerts = batches.filter((batch) => batch.status === 'Needs Attention' || batch.nextAction?.toLowerCase().includes('overdue')).length;
  const summaries = [{ icon: 'map-marker-multiple-outline', value: locations.length, label: 'Active Locations', detail: 'currently ranging' }, { icon: 'bird', value: totalBirds, label: 'Total Birds', detail: 'across all locations' }, { icon: 'alert-circle-outline', value: alerts, label: 'Tasks Due / Alerts', detail: 'requires review' }, { icon: 'account-search-outline', value: ready, label: 'Ready for Selection', detail: `from day ${readyDay}` }];
  return <View style={styles.screen}><StatusBar style="light" translucent backgroundColor="transparent" /><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.pageWrap}><View style={styles.page}><View style={[styles.hero, compact && styles.heroCompact]}><Image source={HERO_IMAGE} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="center" /><LinearGradient colors={['rgba(2,7,9,.12)', 'rgba(2,7,9,.25)', '#03090c']} locations={[0,.52,1]} style={StyleSheet.absoluteFill} /><SafeAreaView edges={['top']} style={styles.heroSafe}><View style={styles.header}><View style={styles.headerGroup}><Pressable accessibilityLabel="Back to farm" onPress={onBack} style={styles.back}><Ionicons name="arrow-back" size={21} color="#fff" /></Pressable><Text style={styles.headerTitle}>Ranging</Text></View><Pressable accessibilityLabel="Ranging settings" onPress={onOpenSettings} style={styles.back}><Ionicons name="settings-outline" size={21} color="#fff" /></Pressable></View><View style={styles.heroCopy}><Text style={styles.farmName}>FarmBuzz Farm</Text><Text style={styles.tagline}>Manage ranging birds by their current farm location.</Text></View></SafeAreaView></View><View style={[styles.content, compact && styles.contentCompact]}><View style={styles.search}><Ionicons name="search" size={19} color="#879499" /><TextInput value={query} onChangeText={setQuery} placeholder="Search range locations" placeholderTextColor="#748187" style={styles.searchInput} /></View><Text style={styles.overline}>RANGING DASHBOARD</Text><View style={styles.summaryGrid}>{summaries.map((item) => <Summary key={item.label} {...item} compact={compact} />)}</View><View style={styles.listHeading}><View><Text style={styles.overline}>RANGE LOCATIONS</Text><Text style={styles.listTitle}>Active locations</Text></View><Text style={styles.count}>{shown.length} active</Text></View><View style={styles.list}>{shown.map((group) => <LocationCard key={group.location} group={group} readyDay={readyDay} onPress={() => onOpenBatch(group.location)} />)}{!shown.length && <Text style={styles.empty}>No ranging locations found</Text>}</View></View></View></ScrollView></View>;
}

const styles = StyleSheet.create({
  screen:{flex:1,backgroundColor:'#020709'},pageWrap:{flexGrow:1,alignItems:'center'},page:{width:'100%',maxWidth:720},hero:{height:272,overflow:'hidden'},heroCompact:{height:248},heroSafe:{flex:1},header:{paddingHorizontal:16,paddingTop:Platform.OS==='web'?10:3,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},headerGroup:{flexDirection:'row',alignItems:'center',gap:10},back:{width:40,height:40,borderRadius:20,borderWidth:1,borderColor:'rgba(190,204,208,.35)',backgroundColor:'rgba(2,8,11,.65)',alignItems:'center',justifyContent:'center'},headerTitle:{color:'#fff',fontSize:15,fontWeight:'800'},heroCopy:{marginTop:'auto',padding:20},farmName:{color:'#fff',fontSize:34,lineHeight:40,fontWeight:'800',fontFamily:Platform.select({ios:'Georgia',android:'serif',web:'Georgia'})},tagline:{marginTop:3,color:'#c2cbce',fontSize:13},content:{padding:16,paddingBottom:30},contentCompact:{paddingHorizontal:10},search:{height:48,borderRadius:7,borderWidth:1,borderColor:'#26373e',backgroundColor:'#081216',paddingHorizontal:12,flexDirection:'row',alignItems:'center',gap:8},searchInput:{flex:1,height:46,color:'#e7ebec',fontSize:11,outlineStyle:'none'},overline:{marginTop:18,color:'#879499',fontSize:8,fontWeight:'800'},summaryGrid:{marginTop:8,flexDirection:'row',flexWrap:'wrap',gap:8},summary:{flex:1,minWidth:0,height:112,borderRadius:7,borderWidth:1,borderColor:'#26373e',backgroundColor:'#091317',alignItems:'center',justifyContent:'center',padding:7},summaryCompact:{flexBasis:'48%',height:98},summaryTop:{flexDirection:'row',alignItems:'center',gap:9},summaryValue:{color:'#f1f4f5',fontSize:19,fontWeight:'800'},summaryLabel:{marginTop:8,color:'#e1e6e7',fontSize:10,textAlign:'center'},summaryDetail:{marginTop:4,color:'#6f7d82',fontSize:7},listHeading:{marginTop:20,marginBottom:9,flexDirection:'row',alignItems:'flex-end',justifyContent:'space-between'},listTitle:{marginTop:3,color:'#edf1f2',fontSize:16,fontWeight:'800'},count:{color:'#839095',fontSize:8,borderWidth:1,borderColor:'#1c2d33',borderRadius:12,paddingHorizontal:9,paddingVertical:7},list:{gap:8},batch:{borderRadius:7,borderWidth:1,borderColor:'#1c2c32',backgroundColor:'#091317',padding:12},batchTop:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:8},identity:{flexDirection:'row',alignItems:'center',gap:10},batchIcon:{width:42,height:42,borderRadius:7,borderWidth:1,borderColor:'#4a3218',backgroundColor:'rgba(255,121,0,.08)',alignItems:'center',justifyContent:'center'},batchId:{color:'#eef2f3',fontSize:13,fontWeight:'800'},location:{marginTop:3,color:'#78868b',fontSize:8},status:{minHeight:23,maxWidth:140,paddingHorizontal:8,borderRadius:12,flexDirection:'row',alignItems:'center',gap:5},dot:{width:5,height:5,borderRadius:3},statusText:{flexShrink:1,fontSize:8,fontWeight:'700'},metrics:{marginTop:13,flexDirection:'row',alignItems:'flex-end',justifyContent:'space-between'},birds:{color:'#fff',fontSize:21,fontWeight:'800'},muted:{marginTop:2,color:'#748187',fontSize:8},age:{alignItems:'flex-end'},ageValue:{color:'#dce2e4',fontSize:11,fontWeight:'800'},progressTrack:{height:4,marginTop:10,borderRadius:2,backgroundColor:'#1c2a30',overflow:'hidden'},progressFill:{height:4,borderRadius:2,backgroundColor:ORANGE},footer:{minHeight:29,marginTop:8,paddingTop:8,borderTopWidth:1,borderTopColor:'#1b2a30',flexDirection:'row',alignItems:'center',justifyContent:'space-between'},action:{flexDirection:'row',alignItems:'center',gap:6},actionText:{color:ORANGE,fontSize:8,fontWeight:'700'},empty:{padding:30,color:'#748187',textAlign:'center'},pressed:{opacity:.76,transform:[{scale:.995}]},
});

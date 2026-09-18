import { useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const HERO_IMAGE = require('./assets/growing-card.png');
const ORANGE = '#ff7900';
const DEFAULT_GROUPS = ['Male', 'Female'];

function Shell({ title, subtitle, children, onBack }) {
  return <View style={styles.screen}><StatusBar style="light" translucent backgroundColor="transparent" /><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.pageWrap}><View style={styles.page}><View style={styles.hero}><Image source={HERO_IMAGE} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="center" /><LinearGradient colors={['rgba(2,7,9,.25)','rgba(2,7,9,.45)','#03090c']} locations={[0,.5,1]} style={StyleSheet.absoluteFill} /><SafeAreaView edges={['top']} style={styles.heroSafe}><View style={styles.header}><Pressable accessibilityLabel="Back" onPress={onBack} style={styles.back}><Ionicons name="arrow-back" size={21} color="#fff" /></Pressable><Text style={styles.headerTitle}>{title}</Text></View><View style={styles.heroCopy}><Text style={styles.heroTitle}>{title}</Text><Text style={styles.heroSubtitle}>{subtitle}</Text></View></SafeAreaView></View>{children}</View></ScrollView></View>;
}

export default function GrowingSettingsScreen({ settings, onBack, onOpenSeparation, onOpenTasks }) {
  const enabledTasks = settings.tasks.filter((task) => task.enabled).length;
  const groupCount = (settings.separationOptions || DEFAULT_GROUPS).length;
  const items = [
    { title: 'Sex Separation', detail: 'Configure the groups used to separate male and female birds', icon: 'gender-male-female', value: `${groupCount} groups`, onPress: onOpenSeparation },
    { title: 'Tasks', detail: 'Checks, vaccines, reminders, and due dates', icon: 'clipboard-check-outline', value: `${enabledTasks} enabled`, onPress: onOpenTasks },
  ];
  return <Shell title="Growing Settings" subtitle="Configure growing batches before they move to ranging." onBack={onBack}><View style={styles.content}><Text style={styles.overline}>GROWING PROGRAM</Text><Text style={styles.sectionTitle}>Settings</Text><View style={styles.list}>{items.map((item,index) => <Pressable key={item.title} accessibilityLabel={`Open ${item.title} settings`} onPress={item.onPress} style={({pressed}) => [styles.row,index < items.length-1 && styles.divider,pressed && styles.pressed]}><View style={styles.rowIcon}><MaterialCommunityIcons name={item.icon} size={23} color={ORANGE} /></View><View style={styles.rowCopy}><Text style={styles.rowTitle}>{item.title}</Text><Text style={styles.rowDetail}>{item.detail}</Text></View><View style={styles.rowMeta}><Text style={styles.rowValue}>{item.value}</Text><Ionicons name="chevron-forward" size={18} color="#69777c" /></View></Pressable>)}</View></View></Shell>;
}

export function GrowingSeparationSettingsScreen({ settings, onBack, onSave }) {
  const [groups, setGroups] = useState(settings.separationOptions || DEFAULT_GROUPS);
  const [newGroup, setNewGroup] = useState('');
  const addGroup = () => {
    const name = newGroup.trim();
    if (!name) return;
    if (groups.some((group) => group.toLowerCase() === name.toLowerCase())) return Alert.alert('Group already added', `${name} is already in the separation list.`);
    setGroups((current) => [...current, name]);
    setNewGroup('');
  };
  const removeGroup = (group) => {
    if (groups.length === 1) return Alert.alert('Group required', 'Keep at least one separation group.');
    setGroups((current) => current.filter((item) => item !== group));
  };
  return <Shell title="Sex Separation" subtitle="Define the groups used when separating a growing batch." onBack={onBack}><View style={styles.content}><View style={styles.notice}><MaterialCommunityIcons name="gender-male-female" size={24} color={ORANGE} /><View style={styles.noticeCopy}><Text style={styles.noticeTitle}>Separation groups</Text><Text style={styles.noticeDetail}>These options will be shown when birds are separated from a growing batch.</Text></View><Text style={styles.count}>{groups.length}</Text></View><View style={styles.groupList}>{groups.map((group,index) => <View key={group} style={[styles.groupRow,index < groups.length-1 && styles.divider]}><View style={styles.groupIcon}><MaterialCommunityIcons name={group.toLowerCase() === 'male' ? 'gender-male' : group.toLowerCase() === 'female' ? 'gender-female' : 'bird'} size={19} color={ORANGE} /></View><Text style={styles.groupName}>{group}</Text><Pressable accessibilityLabel={`Remove ${group}`} onPress={() => removeGroup(group)} style={styles.remove}><MaterialCommunityIcons name="trash-can-outline" size={17} color="#ef7568" /></Pressable></View>)}</View><View style={styles.addRow}><TextInput accessibilityLabel="New separation group" value={newGroup} onChangeText={setNewGroup} onSubmitEditing={addGroup} returnKeyType="done" maxLength={40} placeholder="Add separation group" placeholderTextColor="#68777c" selectionColor={ORANGE} style={styles.input} /><Pressable accessibilityLabel="Add separation group" onPress={addGroup} style={styles.addButton}><Ionicons name="add" size={21} color="#fff" /></Pressable></View><Pressable onPress={() => onSave({ ...settings, separationOptions: groups })} style={styles.save}><MaterialCommunityIcons name="content-save-check-outline" size={21} color="#fff" /><Text style={styles.saveText}>Save Separation Settings</Text></Pressable></View></Shell>;
}

const styles = StyleSheet.create({
  screen:{flex:1,backgroundColor:'#020709'},pageWrap:{flexGrow:1,alignItems:'center'},page:{width:'100%',maxWidth:720},hero:{height:218,overflow:'hidden'},heroSafe:{flex:1},header:{paddingHorizontal:16,paddingTop:Platform.OS==='web'?10:3,flexDirection:'row',alignItems:'center',gap:10},back:{width:40,height:40,borderRadius:20,borderWidth:1,borderColor:'rgba(190,204,208,.35)',backgroundColor:'rgba(2,8,11,.68)',alignItems:'center',justifyContent:'center'},headerTitle:{color:'#f3f5f6',fontSize:15,fontWeight:'800'},heroCopy:{marginTop:'auto',paddingHorizontal:20,paddingBottom:22},heroTitle:{color:'#fff',fontSize:30,lineHeight:36,fontWeight:'800',fontFamily:Platform.select({ios:'Georgia',android:'serif',web:'Georgia'})},heroSubtitle:{marginTop:4,color:'#c1cbce',fontSize:12},content:{padding:16,paddingBottom:30},overline:{color:'#7c898e',fontSize:7,fontWeight:'800'},sectionTitle:{marginTop:4,marginBottom:10,color:'#eef2f3',fontSize:17,fontWeight:'800'},list:{borderRadius:7,borderWidth:1,borderColor:'#26373e',backgroundColor:'#091317',overflow:'hidden'},row:{minHeight:86,paddingHorizontal:12,flexDirection:'row',alignItems:'center',gap:11},divider:{borderBottomWidth:1,borderBottomColor:'#1d2d33'},rowIcon:{width:44,height:44,borderRadius:22,borderWidth:1,borderColor:'#70400f',backgroundColor:'rgba(255,121,0,.08)',alignItems:'center',justifyContent:'center'},rowCopy:{flex:1,minWidth:0},rowTitle:{color:'#edf1f2',fontSize:12,fontWeight:'800'},rowDetail:{marginTop:4,color:'#7c898e',fontSize:8,lineHeight:12},rowMeta:{alignItems:'flex-end',gap:7},rowValue:{color:ORANGE,fontSize:9,fontWeight:'800'},pressed:{opacity:.72},notice:{minHeight:78,borderRadius:7,borderWidth:1,borderColor:'#74410e',backgroundColor:'#091317',padding:12,flexDirection:'row',alignItems:'center',gap:10},noticeCopy:{flex:1,minWidth:0},noticeTitle:{color:'#edf1f2',fontSize:12,fontWeight:'800'},noticeDetail:{marginTop:4,color:'#7c898e',fontSize:8,lineHeight:12},count:{color:ORANGE,fontSize:18,fontWeight:'800'},groupList:{marginTop:14,borderRadius:7,borderWidth:1,borderColor:'#26373e',backgroundColor:'#091317',overflow:'hidden'},groupRow:{minHeight:58,paddingHorizontal:11,flexDirection:'row',alignItems:'center',gap:10},groupIcon:{width:34,height:34,borderRadius:17,backgroundColor:'rgba(255,121,0,.08)',alignItems:'center',justifyContent:'center'},groupName:{flex:1,color:'#e8edef',fontSize:11,fontWeight:'700'},remove:{width:34,height:34,borderRadius:6,backgroundColor:'#101c20',alignItems:'center',justifyContent:'center'},addRow:{height:46,marginTop:8,borderRadius:7,borderWidth:1,borderColor:'#293a41',backgroundColor:'#061014',paddingLeft:11,flexDirection:'row',alignItems:'center',overflow:'hidden'},input:{flex:1,height:44,padding:0,color:'#e7ebec',fontSize:10,outlineStyle:'none'},addButton:{width:46,height:46,backgroundColor:ORANGE,alignItems:'center',justifyContent:'center'},save:{height:50,marginTop:14,borderRadius:7,backgroundColor:ORANGE,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:7},saveText:{color:'#fff',fontSize:11,fontWeight:'800'},
});

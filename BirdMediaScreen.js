import { useMemo, useState } from 'react';
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
import { VideoView, useVideoPlayer } from 'expo-video';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FLOCK_HERO_IMAGE } from './constants';

const ORANGE = '#ff7a00';
const ROOSTER_VIDEO = 'https://archive.org/download/ChickensHaveBeenGettingBiggerBreedingTheNewestBreedsHaveBeenGeneticallyAltered/ChickensHaveBeenGettingBiggerBreedingTheNewestBreedsHaveBeenGeneticallyAltered.mp4';
const VIDEO_THUMBNAIL = 'https://archive.org/download/ChickensHaveBeenGettingBiggerBreedingTheNewestBreedsHaveBeenGeneticallyAltered/__ia_thumb.jpg';

const MEDIA_ITEMS = [
  { id: 'video-1', type: 'video', title: 'Growth and condition clip', date: 'Aug 28, 2026', duration: '0:06', source: ROOSTER_VIDEO, thumbnail: VIDEO_THUMBNAIL, featured: true },
  { id: 'photo-1', type: 'photo', title: 'Profile - right side', date: 'Aug 28, 2026', source: 'https://images.unsplash.com/photo-1730360037813-9777f13b88bb?auto=format&fit=crop&w=1000&q=88' },
  { id: 'photo-2', type: 'photo', title: 'Outdoor condition check', date: 'Aug 20, 2026', source: 'https://images.unsplash.com/photo-1551127501-d4385c7484b4?auto=format&fit=crop&w=1000&q=88' },
  { id: 'photo-3', type: 'photo', title: 'Flock house record', date: 'Aug 12, 2026', source: 'https://images.unsplash.com/photo-1624295886848-623d4d12c1d6?auto=format&fit=crop&w=1000&q=88' },
  { id: 'photo-4', type: 'photo', title: 'Breeding profile', date: 'Jul 29, 2026', source: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=1000&q=88' },
  { id: 'photo-5', type: 'photo', title: 'Health observation', date: 'Jul 18, 2026', source: 'https://images.unsplash.com/photo-1770221499235-11dd1041e181?auto=format&fit=crop&w=1000&q=88' },
];

const FILTERS = [
  { key: 'all', label: 'All Media', icon: 'view-grid-outline' },
  { key: 'photo', label: 'Photos', icon: 'image-outline' },
  { key: 'video', label: 'Videos', icon: 'video-outline' },
];

function getFarmBuzzId(bird) {
  if (bird.farmBuzzId) return bird.farmBuzzId;
  const ring = bird.details?.find((detail) => detail.icon === 'tag-outline')?.text || bird.name;
  const digits = ring.replace(/\D/g, '').slice(-5) || '001';
  return `FBZ-${new Date().getFullYear()}-${digits.padStart(3, '0')}`;
}

function HeaderButton({ icon, label, onPress }) {
  return <Pressable accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}><Ionicons name={icon} size={21} color="#eef1f2" /></Pressable>;
}

function MediaCard({ item, compact, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.mediaCard, item.featured && styles.featuredCard, compact && !item.featured && styles.mediaCardCompact, pressed && styles.cardPressed]}>
      <Image source={item.thumbnail || item.source} style={StyleSheet.absoluteFill} contentFit="cover" cachePolicy="memory-disk" />
      <LinearGradient colors={['rgba(2,7,9,0.02)', 'rgba(2,7,9,0.12)', 'rgba(2,7,9,0.88)']} locations={[0, 0.48, 1]} style={StyleSheet.absoluteFill} />
      {item.type === 'video' && <View style={styles.playButton}><Ionicons name="play" size={22} color="#fff" /></View>}
      <View style={styles.typeBadge}><MaterialCommunityIcons name={item.type === 'video' ? 'video-outline' : 'image-outline'} size={13} color={ORANGE} /><Text style={styles.typeBadgeText}>{item.type.toUpperCase()}</Text></View>
      {item.duration && <View style={styles.durationBadge}><Text style={styles.durationText}>{item.duration}</Text></View>}
      <View style={styles.mediaCopy}><Text numberOfLines={2} style={styles.mediaTitle}>{item.title}</Text><Text style={styles.mediaDate}>{item.date}</Text></View>
    </Pressable>
  );
}

export default function BirdMediaScreen({ bird, onBack }) {
  const { width } = useWindowDimensions();
  const compact = width < 520;
  const narrow = width < 380;
  const [filter, setFilter] = useState('all');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [videoOpen, setVideoOpen] = useState(false);
  const player = useVideoPlayer(ROOSTER_VIDEO, (instance) => {
    instance.loop = true;
  });
  const visibleMedia = useMemo(() => filter === 'all' ? MEDIA_ITEMS : MEDIA_ITEMS.filter((item) => item.type === filter), [filter]);

  if (!bird) return <View style={styles.missingScreen}><Text style={styles.missingTitle}>Bird record unavailable</Text><Pressable onPress={onBack} style={styles.primaryButton}><Text style={styles.primaryButtonText}>Back to Bird Profile</Text></Pressable></View>;

  const openMedia = (item) => {
    if (item.type === 'video') {
      setVideoOpen(true);
      player.play();
      return;
    }
    setSelectedPhoto(item);
  };

  const closeVideo = () => {
    player.pause();
    setVideoOpen(false);
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.pageWrap}>
        <View style={styles.page}>
          <View style={[styles.hero, compact && styles.heroCompact]}>
            <Image source={bird.image || FLOCK_HERO_IMAGE} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="center" cachePolicy="memory-disk" />
            <LinearGradient colors={['rgba(2,7,9,0.16)', 'rgba(2,7,9,0.24)', 'rgba(2,7,9,0.9)', '#03090c']} locations={[0, 0.4, 0.8, 1]} style={StyleSheet.absoluteFill} />
            <SafeAreaView edges={['top']} style={styles.heroSafeArea}>
              <View style={styles.heroHeader}><View style={styles.heroHeaderLeft}><HeaderButton icon="arrow-back" label="Back to bird profile" onPress={onBack} /><Text style={styles.screenTitle}>Bird Media</Text></View><HeaderButton icon="add" label="Add media" onPress={() => Alert.alert('Add media', 'Choose a photo or video from your device.')} /></View>
              <View style={[styles.heroCopy, narrow && styles.heroCopyNarrow]}><View style={styles.mediaBadge}><MaterialCommunityIcons name="image-multiple-outline" size={15} color={ORANGE} /><Text style={styles.mediaBadgeText}>MEDIA LIBRARY</Text></View><Text style={styles.birdName}>{bird.name}</Text><Text style={styles.birdId}>{getFarmBuzzId(bird)}</Text></View>
            </SafeAreaView>
          </View>

          <View style={[styles.content, narrow && styles.contentNarrow]}>
            <View style={styles.summaryPanel}>
              <View style={styles.summaryItem}><MaterialCommunityIcons name="image-outline" size={23} color={ORANGE} /><Text style={styles.summaryValue}>5</Text><Text style={styles.summaryLabel}>Photos</Text></View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}><MaterialCommunityIcons name="video-outline" size={23} color={ORANGE} /><Text style={styles.summaryValue}>1</Text><Text style={styles.summaryLabel}>Video</Text></View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}><MaterialCommunityIcons name="calendar-clock-outline" size={23} color={ORANGE} /><Text style={styles.summaryValue}>Aug 28</Text><Text style={styles.summaryLabel}>Latest Update</Text></View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
              {FILTERS.map((item) => <Pressable key={item.key} onPress={() => setFilter(item.key)} style={[styles.filterButton, filter === item.key && styles.filterButtonActive]}><MaterialCommunityIcons name={item.icon} size={17} color={filter === item.key ? ORANGE : '#879296'} /><Text style={[styles.filterText, filter === item.key && styles.filterTextActive]}>{item.label}</Text></Pressable>)}
            </ScrollView>

            <View style={styles.galleryHeading}><View><Text style={styles.sectionTitle}>{filter === 'all' ? 'All Media' : filter === 'photo' ? 'Photos' : 'Videos'}</Text><Text style={styles.sectionSubtitle}>Tap an item to view it</Text></View><Text style={styles.itemCount}>{visibleMedia.length} items</Text></View>
            <View style={styles.galleryGrid}>{visibleMedia.map((item) => <MediaCard key={item.id} item={item} compact={compact} onPress={() => openMedia(item)} />)}</View>

            <Pressable onPress={() => Alert.alert('Add media', 'Choose a photo or video from your device.')} style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}><Ionicons name="add-circle-outline" size={21} color="#fff" /><Text style={styles.addButtonText}>Add Photo or Video</Text></Pressable>
          </View>
        </View>
      </ScrollView>

      <Modal visible={Boolean(selectedPhoto)} transparent animationType="fade" onRequestClose={() => setSelectedPhoto(null)}>
        <View style={styles.viewerBackdrop}>
          <View style={styles.viewerHeader}><View><Text style={styles.viewerTitle}>{selectedPhoto?.title}</Text><Text style={styles.viewerDate}>{selectedPhoto?.date}</Text></View><Pressable accessibilityLabel="Close photo" onPress={() => setSelectedPhoto(null)} style={styles.viewerClose}><Ionicons name="close" size={22} color="#fff" /></Pressable></View>
          <Image source={selectedPhoto?.source} style={styles.fullPhoto} contentFit="contain" cachePolicy="memory-disk" />
        </View>
      </Modal>

      <Modal visible={videoOpen} transparent animationType="fade" onRequestClose={closeVideo}>
        <View style={styles.viewerBackdrop}>
          <View style={styles.viewerHeader}><View><Text style={styles.viewerTitle}>Growth and condition clip</Text><Text style={styles.viewerDate}>Aug 28, 2026</Text></View><Pressable accessibilityLabel="Close video" onPress={closeVideo} style={styles.viewerClose}><Ionicons name="close" size={22} color="#fff" /></Pressable></View>
          <View style={styles.videoFrame}><VideoView player={player} style={styles.videoPlayer} nativeControls contentFit="contain" allowsFullscreen allowsPictureInPicture /></View>
          <Text style={styles.videoCaption}>Razor 014 - growth and physical condition record</Text>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#020709' }, pageWrap: { flexGrow: 1, alignItems: 'center', backgroundColor: '#020709' }, page: { width: '100%', maxWidth: 720, backgroundColor: '#020709' }, hero: { height: 330, overflow: 'hidden' }, heroCompact: { height: 300 }, heroSafeArea: { flex: 1 }, heroHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: Platform.OS === 'web' ? 10 : 3 }, heroHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 }, headerButton: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(190,204,208,0.35)', backgroundColor: 'rgba(2,8,11,0.65)', alignItems: 'center', justifyContent: 'center' }, screenTitle: { color: '#f1f3f3', fontSize: 17, fontWeight: '700' }, heroCopy: { marginTop: 'auto', paddingHorizontal: 18, paddingBottom: 28 }, heroCopyNarrow: { paddingHorizontal: 11 }, mediaBadge: { alignSelf: 'flex-start', height: 27, paddingHorizontal: 9, borderWidth: 1, borderColor: '#67410f', borderRadius: 14, backgroundColor: 'rgba(255,122,0,0.07)', flexDirection: 'row', alignItems: 'center', gap: 5 }, mediaBadgeText: { color: '#dda45e', fontSize: 7, fontWeight: '800' }, birdName: { marginTop: 9, color: '#f1f3f3', fontSize: 29, lineHeight: 35, fontWeight: '800' }, birdId: { marginTop: 4, color: '#a1abad', fontSize: 10 },
  content: { paddingHorizontal: 14, paddingTop: 14, paddingBottom: 30 }, contentNarrow: { paddingHorizontal: 9 }, summaryPanel: { minHeight: 96, marginBottom: 14, paddingVertical: 11, borderWidth: 1, borderColor: '#28353a', borderRadius: 8, backgroundColor: '#091216', flexDirection: 'row' }, summaryItem: { flex: 1, minWidth: 0, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 }, summaryDivider: { width: 1, backgroundColor: '#26343a' }, summaryValue: { marginTop: 5, color: '#eef1f2', fontSize: 13, fontWeight: '800', textAlign: 'center' }, summaryLabel: { marginTop: 3, color: '#7e898d', fontSize: 7, textAlign: 'center' }, filters: { paddingBottom: 16, gap: 7 }, filterButton: { height: 38, paddingHorizontal: 12, borderWidth: 1, borderColor: '#2b393e', borderRadius: 7, backgroundColor: '#081115', flexDirection: 'row', alignItems: 'center', gap: 6 }, filterButtonActive: { borderColor: ORANGE, backgroundColor: 'rgba(255,122,0,0.06)' }, filterText: { color: '#879296', fontSize: 9, fontWeight: '600' }, filterTextActive: { color: ORANGE }, galleryHeading: { marginBottom: 9, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }, sectionTitle: { color: '#e7eaeb', fontSize: 14, fontWeight: '700' }, sectionSubtitle: { marginTop: 3, color: '#717d81', fontSize: 8 }, itemCount: { color: ORANGE, fontSize: 8, fontWeight: '700' }, galleryGrid: { marginBottom: 14, flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, mediaCard: { width: '48.8%', aspectRatio: 1.15, borderWidth: 1, borderColor: '#2b393e', borderRadius: 8, backgroundColor: '#0a1317', overflow: 'hidden' }, featuredCard: { width: '100%', aspectRatio: 2.05 }, mediaCardCompact: { width: '48.6%', aspectRatio: 0.96 }, typeBadge: { position: 'absolute', left: 8, top: 8, height: 24, paddingHorizontal: 7, borderWidth: 1, borderColor: 'rgba(255,122,0,0.55)', borderRadius: 12, backgroundColor: 'rgba(3,9,12,0.8)', flexDirection: 'row', alignItems: 'center', gap: 4 }, typeBadgeText: { color: '#e4aa62', fontSize: 6, fontWeight: '800' }, durationBadge: { position: 'absolute', right: 8, top: 8, paddingHorizontal: 7, paddingVertical: 5, borderRadius: 5, backgroundColor: 'rgba(3,9,12,0.82)' }, durationText: { color: '#e7eaeb', fontSize: 7, fontWeight: '700' }, playButton: { position: 'absolute', left: '50%', top: '50%', width: 52, height: 52, marginLeft: -26, marginTop: -26, borderWidth: 1, borderColor: 'rgba(255,255,255,0.6)', borderRadius: 26, backgroundColor: 'rgba(255,122,0,0.82)', alignItems: 'center', justifyContent: 'center', paddingLeft: 3 }, mediaCopy: { position: 'absolute', left: 9, right: 9, bottom: 9 }, mediaTitle: { color: '#f0f2f2', fontSize: 10, fontWeight: '800' }, mediaDate: { marginTop: 3, color: '#9ba5a8', fontSize: 7 }, addButton: { height: 50, borderRadius: 8, backgroundColor: '#f66f00', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }, addButtonText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  viewerBackdrop: { flex: 1, padding: 16, backgroundColor: 'rgba(0,4,6,0.97)', alignItems: 'center', justifyContent: 'center' }, viewerHeader: { position: 'absolute', left: 16, right: 16, top: Platform.OS === 'web' ? 18 : 48, zIndex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, viewerTitle: { color: '#eef1f2', fontSize: 14, fontWeight: '800' }, viewerDate: { marginTop: 3, color: '#8f9a9d', fontSize: 8 }, viewerClose: { width: 40, height: 40, borderWidth: 1, borderColor: '#465156', borderRadius: 20, backgroundColor: 'rgba(5,12,15,0.82)', alignItems: 'center', justifyContent: 'center' }, fullPhoto: { width: '100%', height: '82%', maxWidth: 980 }, videoFrame: { width: '100%', maxWidth: 900, aspectRatio: 16 / 9, borderWidth: 1, borderColor: '#38464b', borderRadius: 8, backgroundColor: '#000', overflow: 'hidden' }, videoPlayer: { width: '100%', height: '100%' }, videoCaption: { width: '100%', maxWidth: 900, marginTop: 10, color: '#9ba5a8', fontSize: 9 }, pressed: { opacity: 0.72 }, cardPressed: { opacity: 0.76, transform: [{ scale: 0.995 }] }, missingScreen: { flex: 1, backgroundColor: '#020709', alignItems: 'center', justifyContent: 'center' }, missingTitle: { color: '#d8ddde', fontSize: 17, fontWeight: '700' }, primaryButton: { height: 44, marginTop: 18, paddingHorizontal: 18, borderRadius: 8, backgroundColor: '#f66f00', alignItems: 'center', justifyContent: 'center' }, primaryButtonText: { color: '#fff', fontSize: 11, fontWeight: '700' },
});

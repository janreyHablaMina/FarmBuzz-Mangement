import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
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
const SET_EGG_IMAGE = require('./assets/incubation-stage-set.png');
const DEVELOPING_EGG_IMAGE = require('./assets/incubation-stage-developing.png');
const CANDLING_EGG_IMAGE = require('./assets/incubation-stage-candling.png');
const HATCHING_EGG_IMAGE = require('./assets/incubation-egg.png');
const HATCHED_CHICK_IMAGE = require('./assets/incubation-stage-hatched.png');
const NEST_IMAGE = require('./assets/incubation-nest.png');
const ORANGE = '#ff7a00';

const STAGES = [
  { day: 0, label: 'Set', icon: 'egg-outline', image: SET_EGG_IMAGE },
  { day: 7, label: 'Developing', icon: 'egg', image: DEVELOPING_EGG_IMAGE },
  { day: 14, label: 'Candling', icon: 'flashlight', image: CANDLING_EGG_IMAGE },
  { day: 18, label: 'Hatching', icon: 'progress-clock', image: HATCHING_EGG_IMAGE },
  { day: 21, label: 'Hatched', icon: 'bird', image: HATCHED_CHICK_IMAGE },
];

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

function getCurrentStage(dayNumber) {
  return STAGES.reduce(
    (current, stage, index) => (dayNumber >= stage.day ? index : current),
    0,
  );
}

function getStageMessage(stageIndex) {
  return [
    'Batch started',
    'Developing well',
    'Ready for candling',
    'Hatching soon',
    'Hatch completed',
  ][stageIndex];
}

function getPreviewMessage(stageIndex) {
  return [
    'Eggs are settled and incubation has begun.',
    'The embryo is growing steadily inside the egg.',
    'Check development with the candling light.',
    'The chick is positioning and preparing to hatch.',
    'The hatch cycle is complete.',
  ][stageIndex];
}

function AnimatedPreview({ batch, narrow, onProgressDayChange }) {
  const pulse = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(0)).current;
  const timelineProgress = useRef(new Animated.Value(getCurrentStage(batch.dayNumber) * 20)).current;
  const stageTransition = useRef(new Animated.Value(1)).current;
  const actualStage = getCurrentStage(batch.dayNumber);
  const [previewStage, setPreviewStage] = useState(actualStage);
  const selectedStage = STAGES[previewStage];
  const previewDay = previewStage === actualStage ? batch.dayNumber : selectedStage.day;
  const previewProgress = previewStage === actualStage
    ? batch.progress
    : Math.round((selectedStage.day / 21) * 100);
  const previewDaysLeft = Math.max(0, 21 - previewDay);

  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    pulseLoop.start();

    return () => pulseLoop.stop();
  }, [pulse]);

  useEffect(() => {
    setPreviewStage(actualStage);
  }, [actualStage, batch.id]);

  useEffect(() => {
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: previewProgress,
      duration: 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [previewProgress, progress]);

  useEffect(() => {
    Animated.timing(timelineProgress, {
      toValue: previewStage * 20,
      duration: 520,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [previewStage, timelineProgress]);

  const selectStage = (index) => {
    setPreviewStage(index);
    onProgressDayChange(index === actualStage ? batch.dayNumber : STAGES[index].day);
    stageTransition.setValue(0);
    Animated.spring(stageTransition, {
      toValue: 1,
      friction: 6,
      tension: 75,
      useNativeDriver: true,
    }).start();
  };

  const pulseScales = [1.008, 1.025, 1.018, 1.012, 1.015];
  const pulseScale = pulseScales[previewStage];
  const rotateAmount = previewStage === 3 ? 1.6 : 0;
  const bounceAmount = previewStage === 4 ? -5 : previewStage === 3 ? -1 : 0;
  const eggScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, pulseScale] });
  const eggRotate = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [`-${rotateAmount}deg`, `${rotateAmount}deg`],
  });
  const stageBounce = pulse.interpolate({ inputRange: [0, 1], outputRange: [0, bounceAmount] });
  const nestScaleX = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 0.992] });
  const nestScaleY = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.012] });
  const progressWidth = progress.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] });
  const timelineWidth = timelineProgress.interpolate({ inputRange: [0, 80], outputRange: ['0%', '80%'] });
  const transitionScale = stageTransition.interpolate({ inputRange: [0, 1], outputRange: [0.82, 1] });
  const transitionOpacity = stageTransition.interpolate({ inputRange: [0, 1], outputRange: [0.28, 1] });

  return (
    <View style={styles.previewCard}>
      <View style={[styles.previewMain, narrow && styles.previewMainNarrow]}>
        <View style={[styles.eggStage, narrow && styles.eggStageNarrow]}>
          <Animated.Image
            source={NEST_IMAGE}
            resizeMode="contain"
            style={[
              styles.nestImage,
              narrow && styles.nestImageNarrow,
              {
                opacity: transitionOpacity,
                transform: [
                  { scaleX: nestScaleX },
                  { scaleY: nestScaleY },
                  { scale: transitionScale },
                ],
              },
            ]}
          />
          <Animated.Image
            source={selectedStage.image}
            resizeMode="contain"
            style={[
              styles.eggImage,
              narrow && styles.eggImageNarrow,
              previewStage === 4 && styles.hatchedImage,
              {
                opacity: transitionOpacity,
                transform: [
                  { scale: eggScale },
                  { rotate: eggRotate },
                  { translateY: stageBounce },
                  { scale: transitionScale },
                ],
              },
            ]}
          />
        </View>

        <View style={styles.previewCopy}>
          <View style={styles.dayRow}>
            <Text style={styles.dayValue}>Day {previewDay}</Text>
            <Text style={styles.dayTotal}>of 21</Text>
          </View>
          <Text style={styles.developmentStatus}>{getStageMessage(previewStage)}</Text>
          <Text style={styles.previewMessage}>{getPreviewMessage(previewStage)}</Text>

          <View style={styles.hatchRow}>
            <View>
              <Text style={styles.hatchLabel}>Estimated Hatch</Text>
              <Text style={styles.hatchDate}>{batch.estimatedHatch}</Text>
            </View>
            <Text style={styles.daysLeft}>
              {previewDaysLeft ? `${previewDaysLeft} days left` : 'Completed'}
            </Text>
          </View>

          <View style={styles.progressRow}>
            <View style={styles.progressTrack}>
              <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
            </View>
            <Text style={styles.progressText}>{previewProgress}%</Text>
          </View>
        </View>
      </View>

      <View style={styles.timeline}>
        <View style={styles.timelineTrack} />
        <Animated.View style={[styles.timelineTrackActive, { width: timelineWidth }]} />
        {STAGES.map((stage, index) => {
          const active = index === previewStage;
          const complete = index < previewStage;
          return (
            <Pressable
              key={stage.label}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`Preview ${stage.label} stage`}
              onPress={() => selectStage(index)}
              style={({ pressed }) => [styles.stageItem, pressed && styles.stageItemPressed]}
            >
              <Animated.View style={[
                styles.stageCircle,
                complete && styles.stageCircleComplete,
                active && styles.stageCircleActive,
                active && {
                  transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }) }],
                },
              ]}>
                <Animated.Image
                  source={stage.image}
                  resizeMode="contain"
                  style={[
                    styles.stageThumbnail,
                    active && styles.stageThumbnailActive,
                    !active && !complete && styles.stageThumbnailUpcoming,
                    active && {
                      transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.1] }) }],
                    },
                  ]}
                />
              </Animated.View>
              <Text numberOfLines={1} style={[styles.stageLabel, active && styles.stageLabelActive]}>
                {stage.label}
              </Text>
              <Text style={styles.stageDay}>{stage.day === 0 ? batch.startDate.slice(0, 6) : `Day ${stage.day}`}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function Metric({ icon, value, label, isLast }) {
  return (
    <View style={[styles.metric, !isLast && styles.metricDivider]}>
      <MaterialCommunityIcons name={icon} size={23} color={ORANGE} />
      <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.72} style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

export default function IncubationBatchDetailScreen({ batchId, candlingResults, onBack, onOpenCandling }) {
  const { width } = useWindowDimensions();
  const compact = width < 480;
  const narrow = width < 360;
  const batch = useMemo(
    () => INCUBATION_BATCHES.find((item) => item.id === batchId) ?? INCUBATION_BATCHES[0],
    [batchId],
  );
  const [progressDay, setProgressDay] = useState(batch.dayNumber);

  useEffect(() => {
    setProgressDay(batch.dayNumber);
  }, [batch.dayNumber, batch.id]);

  const savedResults = candlingResults ?? {};
  const removedCount = savedResults.rejected ?? 0;
  const developingCount = savedResults.developing ?? 0;
  const recheckCount = savedResults.recheck ?? 0;
  const candlingComplete = savedResults.saved === true;
  const candlingAvailable = progressDay >= batch.candlingDueDay;
  const activeEggCount = batch.eggCount - removedCount;
  const lockdown = progressDay >= 18;
  const recommendedTemperature = lockdown ? '37.2-37.5 C' : '37.5 C';
  const recommendedHumidity = lockdown ? '65-70%' : '58-60%';

  return (
    <View style={styles.screen}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.pageWrap}>
        <View style={styles.page}>
          <View style={[styles.hero, compact && styles.heroCompact]}>
            <Image
              source={HERO_IMAGE}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              contentPosition="center"
              cachePolicy="memory-disk"
            />
            <LinearGradient
              colors={['rgba(1, 5, 7, 0.24)', 'rgba(1, 5, 7, 0.08)', '#03090c']}
              locations={[0, 0.45, 1]}
              style={StyleSheet.absoluteFill}
            />
            <SafeAreaView edges={['top']} style={styles.heroSafeArea}>
              <View style={styles.heroHeader}>
                <View style={styles.heroHeaderLeft}>
                  <HeaderButton icon="arrow-back" label="Back to incubation batches" onPress={onBack} />
                  <Text style={styles.screenTitle}>Batch {batch.id}</Text>
                </View>
                <HeaderButton
                  icon="ellipsis-horizontal"
                  label="Batch actions"
                  onPress={() => Alert.alert('Batch actions', 'Edit, archive, or cancel this batch.')}
                />
              </View>
              <View style={styles.heroCopy}>
                <Text style={styles.farmName}>FarmBuzz Farm</Text>
                <Text style={styles.farmTagline}>{batch.eggs} in {batch.incubator}</Text>
              </View>
            </SafeAreaView>
          </View>

          <View style={[styles.content, compact && styles.contentCompact]}>
            <AnimatedPreview batch={batch} narrow={narrow} onProgressDayChange={setProgressDay} />

            <Text style={styles.sectionTitle}>Recommended Conditions</Text>
            <View style={styles.metricsCard}>
              <Metric icon="thermometer" value={recommendedTemperature} label="Temperature Target" />
              <Metric icon="water-percent" value={recommendedHumidity} label="Humidity Target" />
              <Metric icon="egg-outline" value={activeEggCount} label="Active Eggs" isLast />
            </View>

            <Text style={styles.sectionTitle}>Next Action</Text>
            <View style={styles.actionCard}>
              <View style={styles.actionIcon}>
                <MaterialCommunityIcons name="flashlight" size={25} color={ORANGE} />
              </View>
              <View style={styles.actionCopy}>
                <Text style={styles.actionTitle}>{candlingComplete ? 'Candling Complete' : batch.eventLabel}</Text>
                <Text style={styles.actionDetail}>
                  {candlingComplete
                    ? `${developingCount} developing - ${removedCount} removed - ${recheckCount} recheck`
                    : candlingAvailable
                      ? 'Ready now'
                      : `In ${batch.candlingDueDay - progressDay} days`}
                </Text>
              </View>
              <Pressable
                accessibilityState={{ disabled: !candlingComplete && !candlingAvailable }}
                disabled={!candlingComplete && !candlingAvailable}
                onPress={onOpenCandling}
                style={({ pressed }) => [
                  styles.actionButton,
                  !candlingComplete && !candlingAvailable && styles.actionButtonDisabled,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.actionButtonText}>
                  {candlingComplete
                    ? 'View Results'
                    : candlingAvailable
                      ? 'Start Candling'
                      : `Available Day ${batch.candlingDueDay}`}
                </Text>
              </Pressable>
            </View>

            <View style={styles.infoBand}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Egg Sources</Text>
                <Text style={styles.infoValue}>{batch.source}</Text>
              </View>
              <View style={styles.infoDivider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Notes</Text>
                <Text style={styles.infoValue}>{batch.note}</Text>
              </View>
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
  hero: { height: 220, overflow: 'hidden', backgroundColor: '#101719' },
  heroCompact: { height: 210 },
  heroSafeArea: { flex: 1 },
  heroHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: Platform.OS === 'web' ? 10 : 3,
  },
  heroHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  headerButton: {
    width: 40, height: 40, borderRadius: 20, borderWidth: 1,
    borderColor: 'rgba(190, 204, 208, 0.35)', backgroundColor: 'rgba(2, 8, 11, 0.65)',
    alignItems: 'center', justifyContent: 'center',
  },
  screenTitle: { color: '#f0f2f3', fontSize: 17, fontWeight: '700', letterSpacing: 0 },
  heroCopy: { marginTop: 'auto', paddingHorizontal: 18, paddingBottom: 22 },
  farmName: {
    color: '#f5f6f6', fontSize: 32, lineHeight: 38, fontWeight: '800', letterSpacing: 0,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', web: 'Georgia' }),
    textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 5,
  },
  farmTagline: { marginTop: 5, color: '#bac1c3', fontSize: 13, lineHeight: 18, letterSpacing: 0 },
  content: { paddingHorizontal: 10, paddingBottom: 22 },
  contentCompact: { paddingHorizontal: 8 },
  previewCard: {
    marginTop: 12, padding: 14, borderRadius: 8, borderWidth: 1,
    borderColor: '#26343a', backgroundColor: '#081115', overflow: 'hidden',
  },
  previewMain: { minHeight: 220, flexDirection: 'row', alignItems: 'center', gap: 18 },
  previewMainNarrow: { flexDirection: 'column', gap: 8 },
  eggStage: { width: 180, height: 205, alignItems: 'center', justifyContent: 'center' },
  eggStageNarrow: { width: '100%', height: 170 },
  nestImage: { position: 'absolute', zIndex: 1, bottom: -2, width: 205, height: 96 },
  nestImageNarrow: { width: 178, height: 84 },
  eggImage: { zIndex: 2, width: 142, height: 190 },
  eggImageNarrow: { width: 112, height: 155 },
  hatchedImage: { width: 168 },
  previewCopy: { flex: 1, minWidth: 0 },
  dayRow: { flexDirection: 'row', alignItems: 'baseline', gap: 5 },
  dayValue: { color: '#f1f3f3', fontSize: 22, fontWeight: '700', letterSpacing: 0 },
  dayTotal: { color: '#858f93', fontSize: 11, letterSpacing: 0 },
  developmentStatus: { marginTop: 5, color: ORANGE, fontSize: 14, fontWeight: '700', letterSpacing: 0 },
  previewMessage: { marginTop: 5, color: '#9ba5a8', fontSize: 11, lineHeight: 16, letterSpacing: 0 },
  hatchRow: { marginTop: 18, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 10 },
  hatchLabel: { color: '#7f898d', fontSize: 9, letterSpacing: 0 },
  hatchDate: { marginTop: 3, color: '#d9ddde', fontSize: 12, fontWeight: '600', letterSpacing: 0 },
  daysLeft: { color: ORANGE, fontSize: 10, fontWeight: '600', letterSpacing: 0 },
  progressRow: { marginTop: 15, flexDirection: 'row', alignItems: 'center', gap: 10 },
  progressTrack: { flex: 1, height: 7, borderRadius: 4, backgroundColor: '#182328', overflow: 'hidden' },
  progressFill: { height: 7, borderRadius: 4, backgroundColor: ORANGE },
  progressText: { width: 35, color: ORANGE, fontSize: 12, fontWeight: '700', textAlign: 'right', letterSpacing: 0 },
  timeline: { marginTop: 20, paddingTop: 4, paddingBottom: 2, flexDirection: 'row', position: 'relative' },
  timelineTrack: {
    position: 'absolute', top: 25, left: '10%', right: '10%', height: 3,
    borderRadius: 2, backgroundColor: '#202e34',
  },
  timelineTrackActive: {
    position: 'absolute', top: 25, left: '10%', height: 3,
    borderRadius: 2, backgroundColor: ORANGE,
  },
  stageItem: { flex: 1, minWidth: 0, minHeight: 70, alignItems: 'center', zIndex: 1 },
  stageItemPressed: { opacity: 0.68 },
  stageCircle: {
    width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: '#344147',
    backgroundColor: '#0e181c', alignItems: 'center', justifyContent: 'center',
  },
  stageCircleComplete: { borderColor: '#a9580f', backgroundColor: '#17140f' },
  stageCircleActive: {
    borderWidth: 2, borderColor: ORANGE, backgroundColor: '#21170e',
    shadowColor: ORANGE, shadowOpacity: 0.32, shadowRadius: 7, shadowOffset: { width: 0, height: 0 },
  },
  stageThumbnail: { width: 31, height: 34, opacity: 0.76 },
  stageThumbnailActive: { width: 34, height: 37, opacity: 1 },
  stageThumbnailUpcoming: { opacity: 0.34 },
  stageLabel: { marginTop: 7, color: '#879195', fontSize: 9, textAlign: 'center', letterSpacing: 0 },
  stageLabelActive: { color: ORANGE, fontWeight: '700' },
  stageDay: { marginTop: 3, color: '#626d71', fontSize: 8, textAlign: 'center', letterSpacing: 0 },
  sectionTitle: { marginTop: 22, marginBottom: 8, color: '#e5e9ea', fontSize: 16, fontWeight: '600', letterSpacing: 0 },
  metricsCard: {
    minHeight: 92, borderRadius: 8, borderWidth: 1, borderColor: '#1c2a30',
    backgroundColor: '#0b1418', flexDirection: 'row', alignItems: 'center',
  },
  metric: { flex: 1, minWidth: 0, alignItems: 'center', paddingHorizontal: 5 },
  metricDivider: { borderRightWidth: 1, borderRightColor: '#223036' },
  metricValue: { marginTop: 5, color: '#e9eced', fontSize: 16, fontWeight: '700', letterSpacing: 0 },
  metricLabel: { marginTop: 3, color: '#7f898d', fontSize: 9, textAlign: 'center', letterSpacing: 0 },
  actionCard: {
    minHeight: 74, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1,
    borderColor: '#53340f', backgroundColor: 'rgba(101, 54, 8, 0.16)', flexDirection: 'row', alignItems: 'center', gap: 11,
  },
  actionIcon: {
    width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255, 122, 0, 0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  actionCopy: { flex: 1, minWidth: 0 },
  actionTitle: { color: '#e7ebec', fontSize: 13, fontWeight: '600', letterSpacing: 0 },
  actionDetail: { marginTop: 3, color: ORANGE, fontSize: 10, letterSpacing: 0 },
  actionButton: {
    minHeight: 34, paddingHorizontal: 11, borderRadius: 6, backgroundColor: '#f66f00',
    alignItems: 'center', justifyContent: 'center',
  },
  actionButtonDisabled: { backgroundColor: '#3b4143', opacity: 0.7 },
  actionButtonText: { color: '#fff', fontSize: 9, fontWeight: '700', letterSpacing: 0 },
  infoBand: { marginTop: 12, paddingHorizontal: 4 },
  infoRow: { paddingVertical: 12, flexDirection: 'row', gap: 16 },
  infoLabel: { width: 78, color: '#818c90', fontSize: 10, fontWeight: '600', letterSpacing: 0 },
  infoValue: { flex: 1, color: '#c3cacc', fontSize: 11, lineHeight: 16, letterSpacing: 0 },
  infoDivider: { height: 1, backgroundColor: '#172329' },
  pressed: { opacity: 0.72 },
});

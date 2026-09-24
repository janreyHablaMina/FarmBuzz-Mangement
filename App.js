import { useEffect, useRef, useState } from 'react';
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
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import FlockScreen, { BIRDS } from './FlockScreen';
import BreedingScreen from './BreedingScreen';
import HealthCareScreen from './HealthCareScreen';
import EggsIncubationScreen from './EggsIncubationScreen';
import EggHoldingScreen from './EggHoldingScreen';
import CreateBatchScreen from './CreateBatchScreen';
import IncubationBatchDetailScreen from './IncubationBatchDetailScreen';
import FamilyBatchDetailScreen from './FamilyBatchDetailScreen';
import EggsIncubationSettingsScreen from './EggsIncubationSettingsScreen';
import IncubationHistoryScreen from './IncubationHistoryScreen';
import CandlingScreen from './CandlingScreen';
import RecordHatchScreen from './RecordHatchScreen';
import BroodingScreen from './BroodingScreen';
import BroodingBatchDetailScreen from './BroodingBatchDetailScreen';
import VaccinationScheduleScreen, { DEFAULT_BROODING_SETTINGS } from './VaccinationScheduleScreen';
import GrowingScreen from './GrowingScreen';
import GrowingBatchDetailScreen from './GrowingBatchDetailScreen';
import GrowingScheduleSettingsScreen, { DEFAULT_CORDATE_SETTINGS, DEFAULT_GROWING_SETTINGS, DEFAULT_RANGING_SETTINGS, DEFAULT_STAG_SETTINGS } from './GrowingScheduleSettingsScreen';
import GrowingSettingsScreen, { GrowingSeparationSettingsScreen } from './GrowingSettingsScreen';
import MaturingScreen from './MaturingScreen';
import PulletScreen, { PULLET_BATCHES, PulletBatchDetailScreen } from './PulletScreen';
import RangingScreen, { buildRangingLocations, RANGING_BATCHES } from './RangingScreen';
import RangingAreaDetailScreen from './RangingAreaDetailScreen';
import RangingSettingsScreen, { RangingSelectionSettingsScreen } from './RangingSettingsScreen';
import StagMaintenanceScreen, { DEFAULT_STAG_AREAS, StagMaintenanceAreaDetail } from './StagMaintenanceScreen';
import CordingScreen from './CordingScreen';
import { INCUBATION_BATCHES } from './farmData';
import TasksScreen from './TasksScreen';
import TeamScreen, { MEMBERS } from './TeamScreen';
import SalesScreen from './SalesScreen';
import ChickenPurchaseScreen from './ChickenPurchaseScreen';
import AddBirdScreen from './AddBirdScreen';
import BirdDetailScreen from './BirdDetailScreen';
import PedigreeBloodlineScreen from './PedigreeBloodlineScreen';
import BirdLocationScreen, { DEFAULT_FARM_LOCATIONS } from './BirdLocationScreen';
import BirdOwnershipScreen from './BirdOwnershipScreen';
import BirdMediaScreen from './BirdMediaScreen';
import BirdNotesScreen from './BirdNotesScreen';
import BirdDocumentsScreen from './BirdDocumentsScreen';
import BirdHealthCareScreen from './BirdHealthCareScreen';
import BirdAchievementsScreen from './BirdAchievementsScreen';
import BirdBreedingScreen, { DEFAULT_EGG_RECORDS } from './BirdBreedingScreen';
import OffspringScreen from './OffspringScreen';
import AddPairingScreen from './AddPairingScreen';
import PairingDetailScreen from './PairingDetailScreen';
import AddTeamMemberScreen from './AddTeamMemberScreen';
import ManagementSettingsScreen from './ManagementSettingsScreen';
import TeamMemberDetailScreen from './TeamMemberDetailScreen';
import EditMemberAccessScreen from './EditMemberAccessScreen';
import AddTaskScreen from './AddTaskScreen';
import TaskDetailScreen from './TaskDetailScreen';
import AddHealthRecordScreen from './AddHealthRecordScreen';
import HealthRecordDetailScreen from './HealthRecordDetailScreen';
import VaccinationManagementScreen, { DEFAULT_VACCINATIONS } from './VaccinationManagementScreen';
import WeightHistoryScreen, { DEFAULT_WEIGHT_RECORDS } from './WeightHistoryScreen';
import NeedsAttentionScreen from './NeedsAttentionScreen';
import ActiveTreatmentsScreen, { DEFAULT_TREATMENTS } from './ActiveTreatmentsScreen';
import HealthRecordsScreen from './HealthRecordsScreen';
import { DASHBOARD_HERO_IMAGE } from './constants';

const THEME_ORANGE = '#ff7a00';
const THEME_ORANGE_TINT = 'rgba(255, 122, 0, 0.14)';
const FLOCK_BADGE_IMAGE = require('./assets/flock-badge-illustration.png');
const TASKS_BADGE_IMAGE = require('./assets/badge-tasks.png');
const ATTENTION_BADGE_IMAGE = require('./assets/badge-attention.png');
const BREEDING_BADGE_IMAGE = require('./assets/badge-breeding.png');
const INCUBATION_BADGE_IMAGE = require('./assets/badge-incubation.png');
const HEALTH_BADGE_IMAGE = require('./assets/badge-health.png');
const TEAM_BADGE_IMAGE = require('./assets/badge-team.png');
const TRANSFERS_BADGE_IMAGE = require('./assets/badge-transfers.png');
const FLOCK_HERO_IMAGE = require('./assets/flock-hero.png');
const BREEDING_HERO_IMAGE = require('./assets/breeding-hero.png');
const HARDENING_CARD_IMAGE = require('./assets/hardening-card.png');
const CORDING_CARD_IMAGE = require('./assets/cording-card.png');
const GROWING_HERO_IMAGE = require('./assets/growing-card.png');
const EGGS_INCUBATION_HERO_IMAGE = require('./assets/eggs-incubation-hero.png');
const HEALTH_CARE_HERO_IMAGE = require('./assets/health-care-hero.png');
const SALES_DASHBOARD_HERO_IMAGE = require('./assets/sales-dashboard-hero.png');
const COLLECTIONS_DASHBOARD_HERO_IMAGE = require('./assets/sales-hero.png');
const SHOWCASE_IMAGE = require('./assets/Showcase.png');
const BROODING_CARD_IMAGE = require('./assets/brooding-card.png');
const RANGING_CARD_IMAGE = require('./assets/ranging-card.png');

const ACTIVE_CHICKEN_BATCHES = [
  { id: 'CB-001', incubationBatchId: 'INC-024', name: 'North House Batch', count: 100, sire: 'Sweater', dams: ['Kelso', 'Hatch', 'Roundhead'], nextTask: { month: 'SEP', day: '13', title: 'Candling', timing: '4 days overdue', action: 'candling' } },
];
const BATCH_BLOODLINES = ['Sweater', 'Kelso', 'Roundhead', 'Hatch', 'Claret', 'Albany'];

const MODULES = [
  {
    title: 'Flock',
    subtitle: '24 active birds',
    badgeImage: FLOCK_BADGE_IMAGE,
    color: THEME_ORANGE,
    tint: THEME_ORANGE_TINT,
    image: FLOCK_HERO_IMAGE,
  },
  {
    title: 'Breeding',
    subtitle: '3 active pairings',
    badgeImage: BREEDING_BADGE_IMAGE,
    color: THEME_ORANGE,
    tint: THEME_ORANGE_TINT,
    image:
      'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=700&q=80',
  },
  {
    title: 'Eggs & Incubation',
    subtitle: '18 holding · 2 batches',
    badgeImage: INCUBATION_BADGE_IMAGE,
    color: THEME_ORANGE,
    tint: THEME_ORANGE_TINT,
    image:
      'https://images.unsplash.com/photo-1774598051542-7f691bd4aac7?auto=format&fit=crop&w=700&q=80',
  },
  {
    title: 'Health & Care',
    subtitle: 'Health, treatments and vaccinations',
    badgeImage: HEALTH_BADGE_IMAGE,
    color: THEME_ORANGE,
    tint: THEME_ORANGE_TINT,
    image: HEALTH_CARE_HERO_IMAGE,
  },
  {
    title: 'Tasks',
    subtitle: '4 due today',
    detail: '· 1 overdue',
    badgeImage: TASKS_BADGE_IMAGE,
    color: THEME_ORANGE,
    tint: THEME_ORANGE_TINT,
    image:
      'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=700&q=80',
  },
  {
    title: 'Team',
    subtitle: 'Manage people across 3 farms',
    badgeImage: TEAM_BADGE_IMAGE,
    color: THEME_ORANGE,
    tint: THEME_ORANGE_TINT,
    image:
      'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=700&q=80',
  },
  {
    title: 'Sales',
    subtitle: 'Payments & sold records',
    badgeImage: TRANSFERS_BADGE_IMAGE,
    color: THEME_ORANGE,
    tint: THEME_ORANGE_TINT,
    image: SALES_DASHBOARD_HERO_IMAGE,
  },
  {
    title: 'Collections',
    subtitle: 'Birds, eggs & chicks',
    icon: 'view-grid-outline',
    color: THEME_ORANGE,
    tint: THEME_ORANGE_TINT,
    image: COLLECTIONS_DASHBOARD_HERO_IMAGE,
  },
];

const PROCESS_STAGES = [
  {
    title: 'Breeding & Hatchery',
    subtitle: 'Pairing, egg marking, candling and hatch',
    badgeImage: INCUBATION_BADGE_IMAGE,
    color: THEME_ORANGE,
    tint: THEME_ORANGE_TINT,
    image:
      'https://images.unsplash.com/photo-1774598051542-7f691bd4aac7?auto=format&fit=crop&w=700&q=80',
  },
];

const HATCHERY_SUMMARY = [
  { value: '3', label: 'Active Pairings' },
  { value: '18', label: 'Eggs Collected' },
  { value: '2', label: 'Incubating' },
  { value: '1', label: 'Due to Hatch' },
];

const HATCHERY_TOOLS = [
  { title: 'Pairing Records', subtitle: 'Cock, hen, bloodline and breeding notes', icon: 'gender-male-female' },
  { title: 'Egg Collection & Marking', subtitle: 'Collected eggs, egg codes and batch labels', icon: 'egg-outline' },
  { title: 'Incubation & Candling', subtitle: 'Set date, fertile eggs and removed eggs', icon: 'lightbulb-on-outline' },
  { title: 'Hatching Results', subtitle: 'Hatched chicks, failed eggs and hatch rate', icon: 'egg-easter' },
];

const STATS = [
  { value: '24', label: 'Active Birds', badgeImage: FLOCK_BADGE_IMAGE, color: THEME_ORANGE },
  { value: '7', label: 'Needs Attention', badgeImage: ATTENTION_BADGE_IMAGE, color: THEME_ORANGE },
  { value: '0', label: 'Total Wins', icon: 'trophy-outline', color: THEME_ORANGE },
  { value: '4', label: 'Tasks Due', badgeImage: TASKS_BADGE_IMAGE, color: THEME_ORANGE },
];

const SOCIAL_FOLLOWERS = [
  { id: 'nad', name: 'Nad', image: MEMBERS[0].image },
  { id: 'ryan', name: 'Ryan', image: MEMBERS[2].image },
  { id: 'mia', name: 'Mia', image: MEMBERS[3].image },
];

const MOCK_OWNERSHIP_BY_BIRD = {
  'Razor 014': {
    owner: 'Miguel Dela Cruz',
    ownerType: 'Buyer',
    contact: 'San Fernando, Pampanga',
    since: 'Sep 3, 2026',
    acquiredBy: 'Sold',
    status: 'Sold and transferred',
    history: [
      {
        id: 'ownership-mock-1042',
        from: 'JU Gamefarm',
        to: 'Miguel Dela Cruz',
        type: 'Sold',
        price: '28,000',
        date: 'Sep 3, 2026',
        detail: 'Razor 014 was sold with complete ownership documents.',
      },
    ],
  },
  'Ruby 052': {
    owner: 'Erwin Ramos',
    ownerType: 'Buyer',
    contact: 'Angeles City, Pampanga',
    since: 'Sep 1, 2026',
    acquiredBy: 'Sold',
    status: 'Sold and transferred',
    history: [
      {
        id: 'ownership-mock-1041',
        from: 'JU Gamefarm',
        to: 'Erwin Ramos',
        type: 'Sold',
        price: '12,000',
        date: 'Sep 1, 2026',
        detail: 'Ruby 052 was released after buyer confirmation.',
      },
    ],
  },
  'Comet 031': {
    owner: 'Ramon Garcia',
    ownerType: 'External owner',
    contact: 'Mabalacat, Pampanga',
    since: 'Aug 29, 2026',
    acquiredBy: 'Transferred',
    status: 'Transferred',
    history: [
      {
        id: 'ownership-mock-1040',
        from: 'JU Gamefarm',
        to: 'Ramon Garcia',
        type: 'Transferred',
        price: '',
        date: 'Aug 29, 2026',
        detail: 'Comet 031 was transferred without a sale price.',
      },
    ],
  },
};

const RECENT_ACTIVITY = [
  { id: 'health-razor', icon: 'stethoscope', title: 'Health check recorded', detail: 'Razor 014 - Maria Santos', time: '12 min', destination: 'health' },
  { id: 'batch-018', icon: 'egg-outline', title: 'Batch B-018 completed', detail: '10 of 12 eggs hatched', time: '1 hr', destination: 'incubation' },
  { id: 'task-feed', icon: 'clipboard-check-outline', title: 'Morning feeding completed', detail: 'Joel Dizon - Main flock', time: '2 hrs', destination: 'tasks' },
];

function getBirdWins(bird) {
  const winDetail = bird?.details?.find((detail) => /win/i.test(detail.text || ''));
  if (!winDetail) return 0;
  const wins = Number((winDetail.text || '').match(/\d+/)?.[0] || 0);
  return Number.isFinite(wins) ? wins : 0;
}

function IconButton({ icon, label, onPress, compact }) {
  return (
    <Pressable
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconButton,
        compact && styles.iconButtonCompact,
        pressed && styles.pressed,
      ]}
    >
      <Ionicons name={icon} size={compact ? 18 : 21} color="#e9edef" />
    </Pressable>
  );
}

function AnimatedBadge({ source, icon, color, size }) {
  if (!source) {
    return <MaterialCommunityIcons name={icon} size={size} color={color} />;
  }

  return (
    <View style={styles.badgeMotion}>
      <Image source={source} contentFit="contain" style={styles.badgeImage} />
    </View>
  );
}

function Stat({ item, isLast, compact, onPress }) {
  return (
    <Pressable accessibilityRole={onPress ? 'button' : undefined} accessibilityLabel={onPress ? `Open ${item.label}` : undefined} disabled={!onPress} onPress={onPress} style={({ pressed }) => [styles.stat, compact && styles.statCompact, !isLast && styles.statDivider, pressed && onPress && styles.statPressed]}>
      <View style={[styles.statIcon, compact && styles.statIconCompact, { borderColor: `${item.color}70` }]}>
        <AnimatedBadge
          source={item.badgeImage}
          icon={item.icon}
          size={compact ? 23 : 27}
          color={item.color}
        />
      </View>
      <View style={[styles.statCopy, compact && styles.statCopyCompact]}>
        <Text style={[styles.statValue, compact && styles.statValueCompact]}>{item.value}</Text>
        <Text numberOfLines={2} style={[styles.statLabel, compact && styles.statLabelCompact]}>
          {item.label}
        </Text>
      </View>
    </Pressable>
  );
}

function ModuleCard({ item, compact, onPress }) {
  const textOnly = item.variant === 'textOnly';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${item.title}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.moduleCard,
        compact && styles.moduleCardCompact,
        item.wide && styles.moduleWide,
        textOnly && styles.moduleCardTextOnly,
        { borderColor: textOnly ? '#ffffff55' : `${item.color}55` },
        pressed && styles.cardPressed,
      ]}
    >
      {!textOnly && (
        <>
          <Image
            source={item.image}
            style={styles.moduleImage}
            contentFit="cover"
            contentPosition="center"
            transition={250}
            cachePolicy="memory-disk"
          />
          <View
            pointerEvents="none"
            style={[StyleSheet.absoluteFill, styles.moduleTintOverlay, { backgroundColor: item.tint }]}
          />
          <LinearGradient
            colors={[
              'rgba(6, 15, 19, 0.78)',
              'rgba(6, 15, 19, 0.58)',
              'rgba(6, 15, 19, 0.26)',
              'rgba(6, 15, 19, 0.06)',
            ]}
            locations={[0, 0.38, 0.74, 1]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />
        </>
      )}

      {!textOnly && (
        <View style={[
          styles.moduleIcon,
          compact && styles.moduleIconCompact,
          { borderColor: `${item.color}70`, backgroundColor: item.tint },
        ]}>
          <AnimatedBadge
            source={item.badgeImage}
            icon={item.icon}
            size={compact ? 24 : 28}
            color={item.color}
          />
        </View>
      )}
      <View style={[styles.moduleCopy, compact && styles.moduleCopyCompact, textOnly && styles.moduleCopyTextOnly]}>
        <Text numberOfLines={2} style={[styles.moduleTitle, textOnly && styles.moduleTitleTextOnly, compact && styles.moduleTitleCompact]}>
          {item.title}
        </Text>
        {!!item.subtitle && (
          <Text numberOfLines={2} style={styles.moduleSubtitle}>
            {item.subtitle}
            {item.detail && <Text style={styles.overdue}> {item.detail}</Text>}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

function ActivityRow({ item, isLast, onPress }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={`Open ${item.title}`} onPress={onPress} style={({ pressed }) => [styles.activityRow, !isLast && styles.activityDivider, pressed && styles.activityPressed]}><View style={styles.activityIcon}><MaterialCommunityIcons name={item.icon} size={19} color={THEME_ORANGE} /></View><View style={styles.activityCopy}><Text numberOfLines={1} style={styles.activityTitle}>{item.title}</Text><Text numberOfLines={1} style={styles.activityDetail}>{item.detail}</Text></View><Text style={styles.activityTime}>{item.time}</Text></Pressable>;
}

function HatcheryToolRow({ item, isLast }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${item.title}`}
      onPress={() => Alert.alert(item.title, `${item.title} selected.`)}
      style={({ pressed }) => [styles.hatcheryToolRow, !isLast && styles.activityDivider, pressed && styles.activityPressed]}
    >
      <View style={styles.activityIcon}>
        <MaterialCommunityIcons name={item.icon} size={19} color={THEME_ORANGE} />
      </View>
      <View style={styles.activityCopy}>
        <Text numberOfLines={1} style={styles.activityTitle}>{item.title}</Text>
        <Text numberOfLines={2} style={styles.activityDetail}>{item.subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#7f8b8f" />
    </Pressable>
  );
}

function WorkspaceTabs({ activeTab, compact, onOpenShowcase, onOpenManagement, onOpenProcess }) {
  const tabs = [
    { id: 'showcase', label: 'Showcase', icon: 'images-outline', onPress: onOpenShowcase },
    { id: 'management', label: 'Management Tool', icon: 'grid-outline', onPress: onOpenManagement },
    { id: 'process', label: 'Process', icon: 'cog-outline', onPress: onOpenProcess },
  ];

  return (
    <View style={[styles.workspaceTabs, compact && styles.workspaceTabsCompact]}>
      {tabs.map((tab) => {
        const active = activeTab === tab.id;
        return (
          <Pressable
            key={tab.id}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={`Open ${tab.label}`}
            onPress={tab.onPress}
            style={({ pressed }) => [
              styles.workspaceTab,
              active && styles.workspaceTabActive,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name={tab.icon} size={16} color={active ? '#ffffff' : '#d6dddf'} />
            <Text numberOfLines={1} style={[styles.workspaceTabText, active && styles.workspaceTabTextActive]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function FarmBanner({ farmName, location, establishedYear, onOpenShowcase, onOpenManagement, onOpenSettings }) {
  const { width } = useWindowDimensions();
  const compact = width < 480;
  const narrow = width < 390;

  return (
    <View style={[styles.hero, compact && styles.heroCompact, narrow && styles.heroNarrow]}>
      <Image
        source={DASHBOARD_HERO_IMAGE}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        contentPosition="center"
        transition={350}
        cachePolicy="memory-disk"
      />
      <LinearGradient
        colors={['rgba(2, 7, 9, 0.24)', 'rgba(2, 7, 9, 0.12)', '#040a0d']}
        locations={[0, 0.43, 1]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView edges={['top']} style={styles.heroSafeArea}>
        <View style={[styles.topBar, narrow && styles.topBarNarrow]}>
          <View style={styles.topBarSpacer} />
          <IconButton
            icon="settings-outline"
            label="Settings"
            compact={narrow}
            onPress={onOpenSettings}
          />
        </View>
        <View style={[styles.heroCopy, compact && styles.heroCopyCompact, narrow && styles.heroCopyNarrow]}>
          <Text style={styles.heroEyebrow}>MANAGEMENT TOOLS</Text>
          <Text style={[styles.brand, compact && styles.brandCompact, narrow && styles.brandNarrow]}>
            {farmName}
          </Text>
          <Text style={[styles.tagline, narrow && styles.taglineNarrow]}>
            Your central hub for flock care, breeding, incubation, and daily farm operations.
          </Text>
          <View style={[styles.farmMeta, narrow && styles.farmMetaNarrow]}><View style={styles.farmMetaItem}><Ionicons name="location-outline" size={narrow ? 13 : 15} color="#c4cbcd" /><Text numberOfLines={1} style={styles.farmMetaText}>{location}</Text></View><View style={styles.farmMetaDivider} /><View style={styles.farmMetaItem}><Ionicons name="calendar-outline" size={narrow ? 13 : 15} color="#c4cbcd" /><Text style={styles.farmMetaText}>Est. {establishedYear}</Text></View></View>
          <View
            accessibilityLabel="Nad, Ryan and 100 more people follow this farm"
            style={[styles.socialProof, narrow && styles.socialProofNarrow]}
          >
            <View style={styles.socialAvatars}>
              {SOCIAL_FOLLOWERS.map((follower, index) => (
                <View
                  key={follower.id}
                  style={[styles.socialAvatarWrap, index > 0 && styles.socialAvatarOverlap]}
                >
                  <Image
                    source={follower.image}
                    style={styles.socialAvatar}
                    contentFit="cover"
                    transition={220}
                    cachePolicy="memory-disk"
                  />
                </View>
              ))}
            </View>
            <Text numberOfLines={1} style={[styles.socialProofText, narrow && styles.socialProofTextNarrow]}>
              Nad, Ryan and <Text style={styles.socialProofStrong}>100+ more</Text> follow this farm
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

function ShowcaseScreen({ farmName, location, establishedYear, onOpenShowcase, onOpenManagement, onOpenProcess, onOpenSettings }) {
  const { width } = useWindowDimensions();
  const compact = width < 480;
  const narrow = width < 390;

  return (
    <View style={styles.screen}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.showcaseScrollContent}>
        <View style={styles.page}>
          <FarmBanner
            farmName={farmName}
            location={location}
            establishedYear={establishedYear}
            onOpenShowcase={onOpenShowcase}
            onOpenManagement={onOpenManagement}
            onOpenSettings={onOpenSettings}
          />
          <View style={[styles.content, narrow && styles.contentNarrow]}>
            <WorkspaceTabs
              activeTab="showcase"
              compact={compact}
              onOpenShowcase={onOpenShowcase}
              onOpenManagement={onOpenManagement}
              onOpenProcess={onOpenProcess}
            />
            <Image
              source={SHOWCASE_IMAGE}
              style={styles.showcaseImage}
              contentFit="contain"
              transition={300}
              cachePolicy="memory-disk"
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function LandingScreen({ onSetup, onExisting, onFarms }) {
  const { width } = useWindowDimensions();
  const compact = width < 480;
  const narrow = width < 390;

  return (
    <View style={styles.screen}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <Image
        source={DASHBOARD_HERO_IMAGE}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        contentPosition="center"
        transition={350}
        cachePolicy="memory-disk"
      />
      <LinearGradient
        colors={['rgba(2, 7, 9, 0.45)', 'rgba(2, 7, 9, 0.68)', '#020709']}
        locations={[0, 0.48, 1]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView edges={['top', 'bottom']} style={styles.landingSafeArea}>
        <View style={[styles.landingContent, compact && styles.landingContentCompact]}>
          <Text style={styles.heroEyebrow}>FARMBUZZ</Text>
          <Text style={[styles.landingTitle, compact && styles.landingTitleCompact, narrow && styles.landingTitleNarrow]}>
            Management Tools
          </Text>
          <Text style={[styles.landingSubtitle, narrow && styles.landingSubtitleNarrow]}>
            Start a new farm setup, open an existing workspace, or browse your farms.
          </Text>
          <View style={styles.landingActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Setup new farm"
              onPress={onSetup}
              style={({ pressed }) => [styles.landingPrimaryButton, pressed && styles.pressed]}
            >
              <Ionicons name="construct-outline" size={18} color="#ffffff" />
              <Text style={styles.landingPrimaryText}>Setup</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open existing farm"
              onPress={onExisting}
              style={({ pressed }) => [styles.landingSecondaryButton, pressed && styles.pressed]}
            >
              <Ionicons name="folder-open-outline" size={18} color={THEME_ORANGE} />
              <Text style={styles.landingSecondaryText}>Existing</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="View farms"
              onPress={onFarms}
              style={({ pressed }) => [styles.landingSecondaryButton, pressed && styles.pressed]}
            >
              <MaterialCommunityIcons name="barn" size={18} color={THEME_ORANGE} />
              <Text style={styles.landingSecondaryText}>Farms</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

function FarmsScreen({ onBack, onOpenFarm, onAddFarm }) {
  const { width } = useWindowDimensions();
  const compact = width < 480;
  const narrow = width < 390;
  const [query, setQuery] = useState('');
  const farmCards = [
    { id: 'fb', name: 'FB Farm', location: 'Pampanga, Philippines', status: 'Published', established: '2020', members: 3, image: DASHBOARD_HERO_IMAGE },
    { id: 'ju', name: 'JU Gamefarm', location: 'Tarlac, Philippines', status: 'Published', established: '2022', members: 2, image: FLOCK_HERO_IMAGE },
    { id: 'golden', name: 'Golden Rooster Yard', location: 'Angeles City, Philippines', status: 'Draft', established: '2024', members: 1, image: HEALTH_CARE_HERO_IMAGE },
    { id: 'north', name: 'North Ridge Farm', location: 'Bulacan, Philippines', status: 'Published', established: '2021', members: 4, image: BREEDING_HERO_IMAGE },
  ];
  const publishedCount = farmCards.filter((farm) => farm.status === 'Published').length;
  const draftCount = farmCards.filter((farm) => farm.status === 'Draft').length;
  const visibleFarms = farmCards.filter((farm) => {
    const needle = query.trim().toLowerCase();
    if (!needle) return true;
    return `${farm.name} ${farm.location} ${farm.status}`.toLowerCase().includes(needle);
  });
  const farmsSummary = [
    { label: 'Farm Workspaces', compactLabel: 'Farms', value: farmCards.length, detail: 'managed farms', icon: 'barn' },
    { label: 'Published', compactLabel: 'Published', value: publishedCount, detail: 'visible farms', icon: 'check-circle-outline' },
    { label: 'Draft', compactLabel: 'Draft', value: draftCount, detail: 'setup drafts', icon: 'file-document-outline' },
  ];

  return (
    <View style={styles.screen}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.farmsPage}>
          <View style={[styles.farmsHero, compact && styles.farmsHeroCompact]}>
            <Image source={DASHBOARD_HERO_IMAGE} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="center" cachePolicy="memory-disk" />
            <LinearGradient
              colors={['rgba(2, 7, 9, 0.14)', 'rgba(2, 7, 9, 0.48)', '#020709']}
              locations={[0, 0.52, 1]}
              style={StyleSheet.absoluteFill}
            />
            <SafeAreaView edges={['top']} style={styles.heroSafeArea}>
              <View style={[styles.topBar, narrow && styles.topBarNarrow]}>
                <IconButton icon="arrow-back" label="Back" compact={narrow} onPress={onBack} />
                <View style={styles.topBarSpacer} />
              </View>
              <View style={[styles.farmsHeroCopy, narrow && styles.farmsHeroCopyNarrow]}>
                <Text style={[styles.farmsTitle, narrow && styles.farmsTitleNarrow]}>Manage Farms</Text>
                <Text style={[styles.farmsSubtitle, narrow && styles.farmsSubtitleNarrow]}>Oversee every farm workspace, team, and publishing status.</Text>
              </View>
            </SafeAreaView>
          </View>

          <View style={[styles.farmsContent, narrow && styles.contentNarrow]}>
            <View style={[styles.farmsActionRow, compact && styles.farmsActionRowCompact]}>
              <View style={styles.farmsSearchBox}>
                <Ionicons name="search" size={22} color="#9aa4a8" />
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Search by farm or location"
                  placeholderTextColor="#879195"
                  selectionColor={THEME_ORANGE}
                  style={styles.farmsSearchInput}
                />
                {!!query && (
                  <Pressable accessibilityLabel="Clear search" onPress={() => setQuery('')} hitSlop={8}>
                    <Ionicons name="close-circle" size={18} color="#6c777b" />
                  </Pressable>
                )}
              </View>
              <Pressable
                onPress={onAddFarm}
                accessibilityLabel="Add farm"
                style={({ pressed }) => [styles.farmsAddPrimary, compact && styles.farmsAddPrimaryCompact, pressed && styles.pressed]}
              >
                <Ionicons name="add" size={27} color="#ffffff" />
                {!compact && <Text style={styles.farmsAddPrimaryText}>Add Farm</Text>}
              </Pressable>
            </View>

            <Text style={[styles.farmsEyebrow, styles.farmsSummaryHeading]}>FARMS SUMMARY</Text>
            <View style={styles.farmsSummaryPanel}>
              <View style={styles.farmsSummaryMetrics}>
                {farmsSummary.map((item) => (
                  <FarmSummaryMetric key={item.label} item={item} />
                ))}
              </View>
            </View>

            <View style={styles.farmsListHeader}>
              <Text style={styles.farmsEyebrow}>ACTIVE FARMS</Text>
              <View style={styles.farmsCountPill}>
                <Text style={styles.farmsCountText}>{visibleFarms.length} shown</Text>
              </View>
            </View>

            <View style={styles.farmCardGrid}>
              {visibleFarms.map((farm) => (
                <FarmWorkspaceCard key={farm.id} farm={farm} onPress={() => onOpenFarm(farm)} />
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function FarmSummaryMetric({ item }) {
  return (
    <View style={styles.farmsSummaryMetric}>
      <View style={styles.farmsSummaryValueRow}>
        <MaterialCommunityIcons name={item.icon} size={26} color={THEME_ORANGE} />
        <Text style={styles.farmsSummaryValue}>{item.value}</Text>
      </View>
      <Text numberOfLines={2} style={styles.farmsSummaryLabel}>{item.compactLabel}</Text>
      <Text numberOfLines={1} style={styles.farmsSummaryDetail}>{item.detail}</Text>
    </View>
  );
}

function FarmWorkspaceCard({ farm, onPress }) {
  const published = farm.status === 'Published';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${farm.name}`}
      onPress={onPress}
      style={({ pressed }) => [styles.farmWorkspaceCard, pressed && styles.cardPressed]}
    >
      <Image source={farm.image} style={StyleSheet.absoluteFill} contentFit="cover" cachePolicy="memory-disk" />
      <LinearGradient
        colors={['rgba(2,7,9,0.04)', 'rgba(2,7,9,0.24)', 'rgba(2,7,9,0.96)']}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.farmCardStatus, !published && styles.farmCardStatusDraft]}>
        <View style={[styles.farmStatusDot, !published && styles.farmStatusDotDraft]} />
        <Text style={styles.farmCardStatusText}>{farm.status}</Text>
      </View>
      <View style={styles.farmCardBody}>
        <View style={styles.farmCardTitleRow}>
          <Text numberOfLines={1} style={styles.farmCardName}>{farm.name}</Text>
          <Ionicons name="chevron-forward" size={16} color="#8a9699" />
        </View>
        <View style={styles.farmWorkspaceMeta}>
          <Ionicons name="location-outline" size={12} color="#9aa5a8" />
          <Text numberOfLines={1} style={styles.farmWorkspaceMetaText}>{farm.location}</Text>
        </View>
        <View style={styles.farmCardFooter}>
          <View style={styles.farmWorkspaceMeta}>
            <Ionicons name="calendar-outline" size={12} color="#9aa5a8" />
            <Text style={styles.farmWorkspaceSmallText}>Est. {farm.established}</Text>
          </View>
          <View style={styles.farmWorkspaceMeta}>
            <Ionicons name="people" size={12} color="#9aa5a8" />
            <Text style={styles.farmWorkspaceSmallText}>{farm.members}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function FarmDetailScreen({ farm, metrics, onBack, onOpenBreeding, onOpenIncubation, onOpenBlankIncubation, onOpenBrooding, onOpenGrowing, onOpenMaturing, onOpenHardening, onOpenCording, onOpenCordate, onOpenSettings }) {
  const { width } = useWindowDimensions();
  const compact = width < 480;
  const narrow = width < 390;
  const farmName = farm?.name || 'FB Farm';
  const location = farm?.location || 'Pampanga, Philippines';
  const establishedYear = farm?.established || '2020';
  const heroImage = farm?.image || DASHBOARD_HERO_IMAGE;
  const eggsIncubationTextModule = {
    title: 'Eggs & Incubation',
    subtitle: '2 active batches, 18 holding eggs',
    icon: 'egg-outline',
    color: THEME_ORANGE,
    tint: THEME_ORANGE_TINT,
    image: EGGS_INCUBATION_HERO_IMAGE,
  };
  const broodingModule = {
    title: 'Brooding',
    subtitle: '1 active batch, 38 chicks',
    icon: 'bird',
    color: THEME_ORANGE,
    tint: THEME_ORANGE_TINT,
    image: BROODING_CARD_IMAGE,
  };
  const maturingModule = {
    title: 'Range',
    subtitle: '3 active batches, 42 birds',
    icon: 'leaf',
    color: THEME_ORANGE,
    tint: THEME_ORANGE_TINT,
    image: RANGING_CARD_IMAGE,
  };
  const cordateModule = {
    title: 'Cordate',
    subtitle: '2 areas, 14 stags',
    icon: 'home-variant',
    color: THEME_ORANGE,
    tint: THEME_ORANGE_TINT,
    image: CORDING_CARD_IMAGE,
  };

  const defaultMetrics = [
    { label: 'Incubating', value: '2', icon: 'egg-outline', color: THEME_ORANGE },
    { label: 'Brooding', value: '1', icon: 'bird', color: THEME_ORANGE },
    { label: 'Ranging', value: '3', icon: 'leaf', color: THEME_ORANGE },
    { label: 'Cordate', value: '14', icon: 'home-variant', color: THEME_ORANGE },
  ];
  const stats = metrics || defaultMetrics;

  return (
    <View style={styles.screen}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.page}>
          <View style={[styles.farmDetailHero, compact && styles.farmDetailHeroCompact, narrow && styles.farmDetailHeroNarrow]}>
            <Image source={heroImage} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="center" cachePolicy="memory-disk" />
            <LinearGradient
              colors={['rgba(2, 7, 9, 0.14)', 'rgba(2, 7, 9, 0.46)', '#040a0d']}
              locations={[0, 0.48, 1]}
              style={StyleSheet.absoluteFill}
            />
            <SafeAreaView edges={['top']} style={styles.heroSafeArea}>
              <View style={[styles.topBar, narrow && styles.topBarNarrow]}>
                <IconButton icon="arrow-back" label="Back to farms" compact={narrow} onPress={onBack} />
                <IconButton icon="settings-outline" label="Settings" compact={narrow} onPress={onOpenSettings} />
              </View>
              <View style={[styles.heroCopy, compact && styles.heroCopyCompact, narrow && styles.heroCopyNarrow]}>
                <Text style={styles.heroEyebrow}>FARM MANAGEMENT</Text>
                <Text style={[styles.brand, compact && styles.brandCompact, narrow && styles.brandNarrow]}>
                  {farmName}
                </Text>
                <Text style={[styles.tagline, narrow && styles.taglineNarrow]}>
                  Breeding workspace for pairings, eggs, and upcoming hatch work.
                </Text>
                <View style={[styles.farmMeta, narrow && styles.farmMetaNarrow]}>
                  <View style={styles.farmMetaItem}>
                    <Ionicons name="location-outline" size={narrow ? 13 : 15} color="#c4cbcd" />
                    <Text numberOfLines={1} style={styles.farmMetaText}>{location}</Text>
                  </View>
                  <View style={styles.farmMetaDivider} />
                  <View style={styles.farmMetaItem}>
                    <Ionicons name="calendar-outline" size={narrow ? 13 : 15} color="#c4cbcd" />
                    <Text style={styles.farmMetaText}>Est. {establishedYear}</Text>
                  </View>
                </View>
              </View>
            </SafeAreaView>
          </View>

          <View style={[styles.content, narrow && styles.contentNarrow]}>
            <View style={[styles.statsPanel, compact && styles.statsPanelCompact]}>
              {stats.map((item, index) => (
                <Stat
                  key={item.label}
                  item={item}
                  compact={compact}
                  isLast={index === stats.length - 1}
                />
              ))}
            </View>

            <View style={styles.sectionHeading}>
              <Text style={[styles.sectionTitle, narrow && styles.sectionTitleNarrow]}>Management Tool</Text>
              <Text style={styles.sectionMeta}>4 modules</Text>
            </View>
            <View style={[styles.moduleGrid, compact && styles.moduleGridCompact]}>
              <ModuleCard item={eggsIncubationTextModule} compact={compact} onPress={onOpenBlankIncubation} />
              <ModuleCard item={broodingModule} compact={compact} onPress={onOpenBrooding} />
              <ModuleCard item={maturingModule} compact={compact} onPress={onOpenMaturing} />
              <ModuleCard item={cordateModule} compact={compact} onPress={onOpenCordate} />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function CordateScreen({ farm, areas = [], birds = [], onBack, onOpenBatch, onOpenSettings }) {
  const cordateBatches = areas.map((area, index) => {
    const areaBirds = birds.filter((bird) => bird.location === area.name);
    return {
      id: `CD-${String(index + 1).padStart(3, '0')}`,
      name: area.name,
      count: area.count,
      bloodline: areaBirds[0]?.bloodline || 'No birds transferred',
      source: areaBirds[0]?.cordingEntry?.fromArea || 'Range',
      birds: areaBirds,
    };
  });

  return (
    <View style={styles.cordateScreen}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.cordateScroll}>
        <View style={styles.cordatePage}>
          <View style={styles.cordateBanner}>
            <Image source={CORDING_CARD_IMAGE} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="center" />
            <LinearGradient colors={['rgba(0,0,0,.12)', 'rgba(0,0,0,.44)', '#000000']} locations={[0, .52, 1]} style={StyleSheet.absoluteFill} />
            <SafeAreaView edges={['top']} style={styles.cordateBannerSafe}>
              <View style={[styles.cordateHeader, styles.cordateHeaderWithSettings]}>
                <View style={styles.cordateHeaderLeft}>
                  <Pressable accessibilityRole="button" accessibilityLabel="Back to farm" onPress={onBack} style={styles.cordateBackButton}>
                    <Ionicons name="arrow-back" size={22} color="#ffffff" />
                  </Pressable>
                  <Text style={styles.cordateHeaderTitle}>Cordate</Text>
                </View>
                <Pressable accessibilityRole="button" accessibilityLabel="Cordate settings" onPress={onOpenSettings} style={styles.cordateBackButton}>
                  <Ionicons name="settings-outline" size={21} color="#ffffff" />
                </Pressable>
              </View>
              <View style={styles.cordateHeroCopy}>
                <Text style={styles.cordateFarmName}>{farm?.name || 'FB Farm'}</Text>
                <Text style={styles.cordateSubtitle}>Manage cordate batches and assigned birds.</Text>
                <View style={styles.cordateMeta}>
                  <Ionicons name="location-outline" size={14} color="#dce2e4" />
                  <Text style={styles.cordateMetaText}>{farm?.location || 'Pampanga, Philippines'}</Text>
                  <View style={styles.cordateMetaDivider} />
                  <Ionicons name="calendar-outline" size={14} color="#dce2e4" />
                  <Text style={styles.cordateMetaText}>Est. {farm?.established || '2020'}</Text>
                </View>
              </View>
            </SafeAreaView>
          </View>
          <View style={styles.cordateListWrap}>
            <View style={styles.cordateListHeading}>
              <View>
                <Text style={styles.cordateOverline}>ACTIVE BATCHES</Text>
                <Text style={styles.cordateListTitle}>Cordate batches</Text>
              </View>
              <Text style={styles.cordateCount}>{cordateBatches.length} active</Text>
            </View>
            <View style={styles.cordateBatchList}>
              {cordateBatches.map((batch) => (
                <View key={batch.id} style={styles.cordateBatchCard}>
                  <Pressable accessibilityRole="button" accessibilityLabel={`Open ${batch.name}`} onPress={() => onOpenBatch(batch.name)} style={({ pressed }) => [styles.cordateBatchTop, pressed && styles.pressed]}>
                  <View style={styles.cordateBatchIcon}>
                    <MaterialCommunityIcons name="home-account" size={22} color={THEME_ORANGE} />
                  </View>
                  <View style={styles.cordateBatchCopy}>
                    <Text style={styles.cordateBatchName}>{batch.name}</Text>
                    <Text style={styles.cordateBatchMeta}>{batch.id} · From {batch.source}</Text>
                    <Text style={styles.cordateBatchBloodline}>{batch.bloodline}</Text>
                  </View>
                  <View style={styles.cordateBatchCount}>
                    <Text style={styles.cordateBatchNumber}>{batch.count}</Text>
                    <Text style={styles.cordateBatchUnit}>birds</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#7f8b8f" />
                  </Pressable>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function CordateBatchDetailScreen({ areaName, birds = [], onBack }) {
  const [query, setQuery] = useState('');
  const [bloodlineFilter, setBloodlineFilter] = useState('All');
  const [bloodlineOpen, setBloodlineOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [statusOpen, setStatusOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [bulkSelect, setBulkSelect] = useState(false);
  const [bulkTargetStatus, setBulkTargetStatus] = useState('Conditioning');
  const [selectedBirds, setSelectedBirds] = useState({});
  const [statusByBird, setStatusByBird] = useState({});
  const bulkStatusOptions = ['Conditioning', 'Standby', 'Ready', 'Sold', 'Loss'];
  const mockBirds = [
    { farmBuzzId: 'FB-000101', physicalId: 'TP-101', bloodline: 'Kelso', status: 'Conditioning', location: areaName },
    { farmBuzzId: 'FB-000102', physicalId: 'TP-102', bloodline: 'Hatch', status: 'Standby', location: areaName },
    { farmBuzzId: 'FB-000103', physicalId: 'TP-103', bloodline: 'Roundhead', status: 'Standby', location: areaName },
    { farmBuzzId: 'FB-000104', physicalId: 'TP-104', bloodline: 'Kelso', status: 'Conditioning', location: areaName },
    { farmBuzzId: 'FB-000105', physicalId: 'TP-105', bloodline: 'Sweater', status: 'Standby', location: areaName },
  ];
  const sourceBirds = birds.filter((bird) => bird.location === areaName);
  const areaBirds = sourceBirds.length ? sourceBirds : mockBirds;
  const getBirdKey = (bird) => bird._recordKey || bird.farmBuzzId || bird.physicalId || bird.name;
  const displayBirds = areaBirds.map((bird) => ({ ...bird, status: statusByBird[getBirdKey(bird)] || bird.status }));
  const selectedCount = Object.values(selectedBirds).filter(Boolean).length;
  const bloodlines = ['All', ...new Set(displayBirds.map((bird) => bird.bloodline).filter(Boolean))];
  const statusOptions = ['All', ...new Set(displayBirds.map((bird) => bird.status).filter(Boolean))];
  const visibleBirds = displayBirds.filter((bird) => {
    const search = query.trim().toLowerCase();
    const matchesSearch = !search || [bird.physicalId, bird.name, bird.farmBuzzId, bird.bloodline].some((value) => String(value || '').toLowerCase().includes(search));
    const matchesBloodline = bloodlineFilter === 'All' || bird.bloodline === bloodlineFilter;
    const matchesStatus = statusFilter === 'All' || bird.status === statusFilter;
    return matchesSearch && matchesBloodline && matchesStatus;
  });
  const startBulkSelect = (status) => { setBulkTargetStatus(status); setBulkSelect(true); setSelectedBirds({}); setMenuOpen(false); };
  const cancelBulkSelect = () => { setBulkSelect(false); setSelectedBirds({}); };
  const toggleBirdSelection = (bird) => {
    if (!bulkSelect) return;
    const key = getBirdKey(bird);
    setSelectedBirds((current) => ({ ...current, [key]: !current[key] }));
  };
  const selectVisibleBirds = () => {
    setSelectedBirds((current) => {
      const next = { ...current };
      visibleBirds.forEach((bird) => { next[getBirdKey(bird)] = true; });
      return next;
    });
  };
  const applyBulkStatus = (status) => {
    if (!selectedCount) return Alert.alert('Select birds', 'Choose one or more birds before changing status.');
    setStatusByBird((current) => {
      const next = { ...current };
      Object.entries(selectedBirds).forEach(([key, selected]) => {
        if (selected) next[key] = status;
      });
      return next;
    });
    cancelBulkSelect();
  };

  return (
    <View style={styles.cordateScreen}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.cordateScroll}>
        <View style={styles.cordatePage}>
          <View style={styles.cordateDetailBanner}>
            <Image source={CORDING_CARD_IMAGE} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="center" />
            <LinearGradient colors={['rgba(0,0,0,.18)', 'rgba(0,0,0,.55)', '#000000']} locations={[0, .55, 1]} style={StyleSheet.absoluteFill} />
            <SafeAreaView edges={['top']} style={styles.cordateBannerSafe}>
              <View style={[styles.cordateHeader, styles.cordateHeaderWithSettings]}>
                <View style={styles.cordateHeaderLeft}>
                  <Pressable accessibilityRole="button" accessibilityLabel="Back to cordate" onPress={onBack} style={styles.cordateBackButton}>
                    <Ionicons name="arrow-back" size={22} color="#ffffff" />
                  </Pressable>
                  <Text style={styles.cordateHeaderTitle}>Cordate</Text>
                </View>
                <Pressable accessibilityRole="button" accessibilityLabel="Cordate actions" onPress={() => setMenuOpen((open) => !open)} style={styles.cordateBackButton}>
                  <Ionicons name="ellipsis-horizontal" size={22} color="#ffffff" />
                </Pressable>
                {menuOpen && (
                  <View style={styles.cordateActionMenu}>
                    {bulkStatusOptions.map((status) => (
                      <Pressable key={status} onPress={() => startBulkSelect(status)} style={styles.cordateActionMenuItem}>
                        <Ionicons name="albums-outline" size={16} color={THEME_ORANGE} />
                        <Text style={styles.cordateActionMenuText}>{status}</Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
              <View style={styles.cordateHeroCopy}>
                <Text style={styles.cordateOverline}>BIRD LIST</Text>
                <Text style={styles.cordateFarmName}>{areaName || 'Cordate Area'}</Text>
                <Text style={styles.cordateSubtitle}>{areaBirds.length} assigned bird{areaBirds.length === 1 ? '' : 's'}</Text>
              </View>
            </SafeAreaView>
          </View>
          <View style={styles.cordateDetailBody}>
            <View style={styles.cordateSearch}>
              <Ionicons name="search" size={20} color="#9aa4a8" />
              <TextInput value={query} onChangeText={setQuery} placeholder="Search birds or bloodline" placeholderTextColor="#879195" style={styles.cordateSearchInput} />
              {!!query && <Pressable onPress={() => setQuery('')}><Ionicons name="close-circle" size={18} color="#6c777b" /></Pressable>}
            </View>
            <View style={styles.cordateDropdownRow}>
              <View style={styles.cordateDropdownWrap}>
                <Pressable onPress={() => { setBloodlineOpen((open) => !open); setStatusOpen(false); }} style={styles.cordateDropdownField}>
                  <Text style={styles.cordateDropdownLabel}>Bloodline</Text>
                  <Text numberOfLines={1} style={styles.cordateDropdownValue}>{bloodlineFilter}</Text>
                  <Ionicons name={bloodlineOpen ? 'chevron-up' : 'chevron-down'} size={16} color="#dfe6e8" />
                </Pressable>
                {bloodlineOpen && (
                  <View style={styles.cordateDropdownMenu}>
                    {bloodlines.map((bloodline) => (
                      <Pressable key={bloodline} onPress={() => { setBloodlineFilter(bloodline); setBloodlineOpen(false); }} style={[styles.cordateDropdownOption, bloodlineFilter === bloodline && styles.cordateDropdownOptionActive]}>
                        <Text style={[styles.cordateDropdownOptionText, bloodlineFilter === bloodline && styles.cordateDropdownOptionTextActive]}>{bloodline}</Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
              <View style={styles.cordateDropdownWrap}>
                <Pressable onPress={() => { setStatusOpen((open) => !open); setBloodlineOpen(false); }} style={styles.cordateDropdownField}>
                  <Text style={styles.cordateDropdownLabel}>Status</Text>
                  <Text numberOfLines={1} style={styles.cordateDropdownValue}>{statusFilter}</Text>
                  <Ionicons name={statusOpen ? 'chevron-up' : 'chevron-down'} size={16} color="#dfe6e8" />
                </Pressable>
                {statusOpen && (
                  <View style={styles.cordateDropdownMenu}>
                    {statusOptions.map((status) => (
                      <Pressable key={status} onPress={() => { setStatusFilter(status); setStatusOpen(false); }} style={[styles.cordateDropdownOption, statusFilter === status && styles.cordateDropdownOptionActive]}>
                        <Text style={[styles.cordateDropdownOptionText, statusFilter === status && styles.cordateDropdownOptionTextActive]}>{status}</Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            </View>
            {bulkSelect && (
              <View style={styles.cordateBulkPanel}>
                <View style={styles.cordateBulkHeader}>
                  <View>
                    <Text style={styles.cordateBulkLabel}>CHANGE TO</Text>
                    <Text style={styles.cordateBulkTitle}>{bulkTargetStatus}</Text>
                  </View>
                  <Text style={styles.cordateBulkCount}>{selectedCount} selected</Text>
                  <View style={styles.cordateBulkHeaderActions}>
                    <Pressable onPress={selectVisibleBirds} style={styles.cordateBulkSmallButton}>
                      <Text style={styles.cordateBulkSmallText}>Select All</Text>
                    </Pressable>
                    <Pressable onPress={cancelBulkSelect} style={styles.cordateBulkSmallButton}>
                      <Text style={styles.cordateBulkSmallText}>Cancel</Text>
                    </Pressable>
                  </View>
                </View>
                <Pressable onPress={() => applyBulkStatus(bulkTargetStatus)} style={styles.cordateBulkApplyButton}>
                  <Text style={styles.cordateBulkApplyText}>Apply to selected birds</Text>
                </Pressable>
              </View>
            )}
            <View style={styles.cordateBirdListScreen}>
              {visibleBirds.length ? visibleBirds.map((bird, index) => (
                <Pressable key={getBirdKey(bird)} onPress={() => toggleBirdSelection(bird)} style={[styles.cordateBirdRow, selectedBirds[getBirdKey(bird)] && styles.cordateBirdRowSelected]}>
                  <View style={[styles.cordateBirdMarker, selectedBirds[getBirdKey(bird)] && styles.cordateBirdMarkerSelected, !bulkSelect && { borderWidth: 0 }]}>
                    {bulkSelect && selectedBirds[getBirdKey(bird)] ? (
                      <Ionicons name="checkmark" size={24} color="#ffffff" />
                    ) : index < 2 ? (
                      <Image source={{ uri: index === 0 ? BIRDS[0].image : BIRDS[2].image }} style={{ width: '100%', height: '100%', borderRadius: 8 }} contentFit="cover" />
                    ) : (
                      <Image source={FLOCK_BADGE_IMAGE} style={{ width: '100%', height: '100%', borderRadius: 8 }} contentFit="cover" />
                    )}
                  </View>
                  <View style={styles.cordateBirdCopy}>
                    <View style={styles.cordateBirdTitleRow}>
                      <Text numberOfLines={1} style={styles.cordateBirdName}>{bird.physicalId || bird.name || bird.farmBuzzId}</Text>
                      {bird.status === 'Conditioning' && <Text numberOfLines={1} style={styles.cordateBirdStatus}>Conditioning</Text>}
                    </View>
                    <Text numberOfLines={1} style={styles.cordateBirdMeta}>{bird.farmBuzzId || 'Pending'}</Text>
                    <Text numberOfLines={1} style={styles.cordateBirdBloodline}>{bird.bloodline || 'Unassigned bloodline'}</Text>
                  </View>
                </Pressable>
              )) : <Text style={styles.cordateEmptyBirds}>No birds match this view</Text>}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function BatchCountControl({ label, value, icon, onChange }) {
  return (
    <View style={styles.batchSetupCountCard}>
      <View style={styles.batchSetupCountLabel}>
        <MaterialCommunityIcons name={icon} size={19} color={THEME_ORANGE} />
        <Text style={styles.batchSetupCountTitle}>{label}</Text>
      </View>
      <View style={styles.batchSetupStepper}>
        <Pressable accessibilityLabel={`Remove ${label}`} onPress={() => onChange(Math.max(1, value - 1))} style={({ pressed }) => [styles.batchSetupStepButton, pressed && styles.pressed]}>
          <Ionicons name="remove" size={18} color="#aeb8bb" />
        </Pressable>
        <Text style={styles.batchSetupCountValue}>{value}</Text>
        <Pressable accessibilityLabel={`Add ${label}`} onPress={() => onChange(Math.min(6, value + 1))} style={({ pressed }) => [styles.batchSetupStepButton, pressed && styles.pressed]}>
          <Ionicons name="add" size={18} color="#ffffff" />
        </Pressable>
      </View>
    </View>
  );
}

function BatchBloodlineSelect({ label, value, icon, open, emphasized, onToggle, onChange }) {
  return (
    <View style={styles.batchSetupField}>
      <Pressable onPress={onToggle} style={({ pressed }) => [styles.batchSetupSelect, emphasized && styles.batchSetupSireNodeSelect, open && styles.batchSetupSelectOpen, pressed && styles.pressed]}>
        <View style={styles.batchSetupSelectCopy}>
          <View style={styles.batchSetupSelectLabelRow}>
            <MaterialCommunityIcons name={icon} size={14} color={THEME_ORANGE} />
            <Text style={styles.batchSetupSelectLabel}>{label.toUpperCase()}</Text>
          </View>
          <Text style={styles.batchSetupSelectValue}>{value}</Text>
        </View>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color="#7d898e" />
      </Pressable>
      {open && (
        <View style={styles.batchSetupOptions}>
          {BATCH_BLOODLINES.map((bloodline) => (
            <Pressable key={bloodline} onPress={() => { onChange(bloodline); onToggle(); }} style={({ pressed }) => [styles.batchSetupOption, pressed && styles.pressed]}>
              <Text style={[styles.batchSetupOptionText, value === bloodline && styles.batchSetupOptionTextActive]}>{bloodline}</Text>
              {value === bloodline && <Ionicons name="checkmark" size={17} color={THEME_ORANGE} />}
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

function AddFamilyBatchScreen({ farm, onBack }) {
  const { width } = useWindowDimensions();
  const compact = width < 480;
  const [batchName, setBatchName] = useState('');
  const [eggCount, setEggCount] = useState('');
  const [sires, setSires] = useState(['Sweater']);
  const [dams, setDams] = useState(['Kelso', 'Hatch', 'Roundhead']);
  const [openSelect, setOpenSelect] = useState(null);

  const resizeBloodlines = (setter, count) => {
    setter((current) => Array.from({ length: count }, (_, index) => current[index] || BATCH_BLOODLINES[index % BATCH_BLOODLINES.length]));
    setOpenSelect(null);
  };

  const saveBatch = () => {
    const name = batchName.trim();
    const eggs = Number.parseInt(eggCount, 10);
    if (!name) {
      Alert.alert('Batch name required', 'Enter a batch name before saving.');
      return;
    }
    if (!eggs || eggs < 1) {
      Alert.alert('Egg count required', 'Enter how many eggs are in this batch.');
      return;
    }

    Alert.alert(
      'Batch saved',
      `${name} was saved with ${eggs} eggs.`,
      [{ text: 'OK', onPress: onBack }],
    );
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.page}>
          <View style={[styles.batchSetupHero, compact && styles.batchSetupHeroCompact]}>
            <Image source={EGGS_INCUBATION_HERO_IMAGE} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="center" cachePolicy="memory-disk" />
            <LinearGradient colors={['rgba(2,7,9,0.2)', 'rgba(2,7,9,0.35)', '#020709']} locations={[0, 0.52, 1]} style={StyleSheet.absoluteFill} />
            <SafeAreaView edges={['top']} style={styles.heroSafeArea}>
              <View style={styles.blankIncubationHeader}>
                <IconButton icon="arrow-back" label="Back to egg batches" onPress={onBack} />
                <Text style={styles.blankIncubationScreenTitle}>Add Batch</Text>
              </View>
              <View style={styles.batchSetupHeroCopy}>
                <Text style={[styles.blankIncubationFarmName, compact && styles.blankIncubationFarmNameNarrow]}>{farm?.name || 'FB Farm'}</Text>
                <Text style={styles.blankIncubationTagline}>Set the family structure and bloodlines for this egg batch.</Text>
              </View>
            </SafeAreaView>
          </View>

          <View style={[styles.batchSetupForm, compact && styles.batchSetupFormCompact]}>
            <Text style={styles.blankIncubationEyebrow}>BATCH FAMILY</Text>
            <Text style={styles.batchSetupTitle}>Parents in this batch</Text>
            <Text style={styles.batchSetupDescription}>Choose how many sires and dams are included, then assign each bird's bloodline.</Text>

            <View style={styles.batchSetupDetailsSection}>
              <Text style={styles.batchSetupSectionTitle}>Batch details</Text>
              <View style={styles.batchSetupDetailsRow}>
                <View style={styles.batchSetupTextField}>
                  <Text style={styles.batchSetupFieldLabel}>BATCH NAME</Text>
                  <View style={styles.batchSetupInputShell}>
                    <MaterialCommunityIcons name="tag-outline" size={18} color={THEME_ORANGE} />
                    <TextInput
                      value={batchName}
                      onChangeText={setBatchName}
                      placeholder="e.g. North House"
                      placeholderTextColor="#69777c"
                      selectionColor={THEME_ORANGE}
                      style={styles.batchSetupTextInput}
                    />
                  </View>
                </View>
                <View style={styles.batchSetupTextField}>
                  <Text style={styles.batchSetupFieldLabel}>EGG COUNT</Text>
                  <View style={styles.batchSetupInputShell}>
                    <MaterialCommunityIcons name="egg-outline" size={18} color={THEME_ORANGE} />
                    <TextInput
                      value={eggCount}
                      onChangeText={(value) => setEggCount(value.replace(/[^0-9]/g, ''))}
                      placeholder="e.g. 100"
                      placeholderTextColor="#69777c"
                      selectionColor={THEME_ORANGE}
                      keyboardType="number-pad"
                      inputMode="numeric"
                      maxLength={5}
                      style={styles.batchSetupTextInput}
                    />
                    <Text style={styles.batchSetupInputSuffix}>eggs</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.batchSetupCountRow}>
              <BatchCountControl label="Sires" value={sires.length} icon="gender-male" onChange={(count) => resizeBloodlines(setSires, count)} />
              <BatchCountControl label="Dams" value={dams.length} icon="gender-female" onChange={(count) => resizeBloodlines(setDams, count)} />
            </View>

            <View style={styles.batchSetupTreeSection}>
              <Text style={styles.batchSetupSectionTitle}>Family tree</Text>
              <Text style={styles.batchSetupTreeHint}>Tap a parent node to choose its bloodline.</Text>
              <View style={styles.batchSetupTreeEditor}>
                <View style={styles.batchSetupSireList}>
                  {sires.map((bloodline, index) => (
                    <View key={`sire-${index}`} style={styles.batchSetupSireBranch}>
                      <View style={styles.batchSetupSireNode}>
                        <BatchBloodlineSelect
                          label={`Sire ${index + 1}`}
                          value={bloodline}
                          icon="gender-male"
                          emphasized
                          open={openSelect === `sire-${index}`}
                          onToggle={() => setOpenSelect(openSelect === `sire-${index}` ? null : `sire-${index}`)}
                          onChange={(value) => setSires((current) => current.map((item, itemIndex) => itemIndex === index ? value : item))}
                        />
                      </View>
                      <View style={styles.batchSetupNodeLine} />
                    </View>
                  ))}
                </View>

                <View style={styles.batchSetupTreeConnector}>
                  <View style={styles.batchSetupTreeStem} />
                  <View style={styles.batchSetupTreeTrunk} />
                </View>

                <View style={styles.batchSetupDamList}>
                  {dams.map((bloodline, index) => (
                    <View key={`dam-${index}`} style={styles.batchSetupDamBranch}>
                      <View style={styles.batchSetupNodeLine} />
                      <View style={styles.batchSetupDamNode}>
                        <BatchBloodlineSelect
                          label={`Dam ${index + 1}`}
                          value={bloodline}
                          icon="gender-female"
                          open={openSelect === `dam-${index}`}
                          onToggle={() => setOpenSelect(openSelect === `dam-${index}` ? null : `dam-${index}`)}
                          onChange={(value) => setDams((current) => current.map((item, itemIndex) => itemIndex === index ? value : item))}
                        />
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            <Pressable accessibilityRole="button" accessibilityLabel="Save egg batch" onPress={saveBatch} style={({ pressed }) => [styles.batchSetupSaveButton, pressed && styles.pressed]}>
              <MaterialCommunityIcons name="content-save-outline" size={20} color="#ffffff" />
              <Text style={styles.batchSetupSaveText}>Save Batch</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function BlankIncubationScreen({ farm, onBack, onAddBatch, onOpenBatch, onAddTask }) {
  const { width } = useWindowDimensions();
  const compact = width < 480;
  const narrow = width < 390;
  const [query, setQuery] = useState('');
  const [candlingBatch, setCandlingBatch] = useState(null);
  const [candlingRejected, setCandlingRejected] = useState(0);
  const [candlingRecheck, setCandlingRecheck] = useState(0);
  const normalizedQuery = query.trim().toLowerCase();
  const visibleBatches = ACTIVE_CHICKEN_BATCHES.filter((batch) => (
    !normalizedQuery || `${batch.id} ${batch.name} ${batch.sire} ${batch.dams.join(' ')}`.toLowerCase().includes(normalizedQuery)
  ));
  const candlingTotal = candlingBatch?.count || 0;
  const candlingDeveloping = Math.max(0, candlingTotal - candlingRejected - candlingRecheck);
  const openCandlingModal = (batch) => {
    setCandlingBatch(batch);
    setCandlingRejected(0);
    setCandlingRecheck(0);
  };
  const changeCandlingRejected = (amount) => setCandlingRejected((current) => Math.max(0, Math.min(current + amount, candlingTotal - candlingRecheck)));
  const changeCandlingRecheck = (amount) => setCandlingRecheck((current) => Math.max(0, Math.min(current + amount, candlingTotal - candlingRejected)));
  const saveCandling = () => {
    Alert.alert('Candling recorded', `${candlingDeveloping} developing, ${candlingRejected} rejected, ${candlingRecheck} to recheck.`);
    setCandlingBatch(null);
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.page}>
          <View style={[styles.hero, compact && styles.heroCompact, narrow && styles.heroNarrow]}>
            <Image source={EGGS_INCUBATION_HERO_IMAGE} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="center" cachePolicy="memory-disk" />
            <LinearGradient
              colors={['rgba(2, 7, 9, 0.2)', 'rgba(2, 7, 9, 0.18)', '#020709']}
              locations={[0, 0.46, 1]}
              style={StyleSheet.absoluteFill}
            />
            <SafeAreaView edges={['top']} style={styles.heroSafeArea}>
              <View style={[styles.blankIncubationHeader, styles.blankIncubationHeaderBetween]}>
                <View style={styles.blankIncubationHeaderLeft}>
                  <IconButton icon="arrow-back" label="Back to farm" onPress={onBack} />
                  <Text style={styles.blankIncubationScreenTitle}>Eggs &amp; Incubation</Text>
                </View>
                <IconButton icon="settings-outline" label="Add new task" onPress={onAddTask} />
              </View>
              <View style={[styles.blankIncubationHeroCopy, narrow && styles.blankIncubationHeroCopyNarrow]}>
                <Text style={[styles.blankIncubationFarmName, narrow && styles.blankIncubationFarmNameNarrow]}>
                  {farm?.name || 'FB Farm'}
                </Text>
                <Text style={styles.blankIncubationTagline}>Manage eggs and incubation from setting to hatch.</Text>
                <View style={styles.blankIncubationMeta}>
                  <View style={styles.blankIncubationMetaItem}>
                    <Ionicons name="location-outline" size={16} color="#c0c7c9" />
                    <Text style={styles.blankIncubationMetaText}>{farm?.location || 'Pampanga, Philippines'}</Text>
                  </View>
                  <View style={styles.blankIncubationMetaDivider} />
                  <View style={styles.blankIncubationMetaItem}>
                    <Ionicons name="calendar-outline" size={16} color="#c0c7c9" />
                    <Text style={styles.blankIncubationMetaText}>Est. {farm?.established || '2020'}</Text>
                  </View>
                </View>
              </View>
            </SafeAreaView>
          </View>

          <View style={[styles.blankIncubationContent, narrow && styles.blankIncubationContentNarrow]}>
            <View style={[styles.blankIncubationActionRow, compact && styles.blankIncubationActionRowCompact]}>
              <View style={styles.blankIncubationSearchBox}>
                <Ionicons name="search" size={22} color="#9aa4a8" />
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Search eggs or batches"
                  placeholderTextColor="#879195"
                  selectionColor={THEME_ORANGE}
                  style={styles.blankIncubationSearchInput}
                />
                {!!query && (
                  <Pressable accessibilityLabel="Clear search" onPress={() => setQuery('')} hitSlop={8}>
                    <Ionicons name="close-circle" size={18} color="#6c777b" />
                  </Pressable>
                )}
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Add incubation batch"
                onPress={onAddBatch}
                style={({ pressed }) => [styles.blankIncubationAddButton, compact && styles.blankIncubationAddButtonCompact, pressed && styles.pressed]}
              >
                <Ionicons name="add" size={24} color="#ffffff" />
                <Text style={styles.blankIncubationAddButtonText}>Add Batch</Text>
              </Pressable>
            </View>

            <View style={styles.blankIncubationListHeading}>
              <View>
                <Text style={styles.blankIncubationEyebrow}>ACTIVE BATCHES</Text>
                <Text style={styles.blankIncubationListTitle}>Egg batches</Text>
              </View>
              <Text style={styles.blankIncubationBatchCount}>{visibleBatches.length} active</Text>
            </View>

            <View style={styles.blankIncubationBatchList}>
              {visibleBatches.map((batch) => (
                <Pressable
                  key={batch.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Open ${batch.name}`}
                  onPress={() => onOpenBatch(batch.id)}
                  style={({ pressed }) => [styles.blankIncubationBatchCard, pressed && styles.pressed]}
                >
                  <View style={styles.blankIncubationBatchHeader}>
                    <View style={styles.blankIncubationBatchIdentity}>
                      <View style={styles.blankIncubationBatchIcon}>
                        <MaterialCommunityIcons name="egg-outline" size={21} color={THEME_ORANGE} />
                      </View>
                      <View>
                        <Text style={styles.blankIncubationBatchName}>{batch.name}</Text>
                        <Text style={styles.blankIncubationBatchId}>{batch.id}</Text>
                      </View>
                    </View>
                    <View style={styles.blankIncubationChickenCount}>
                      <Text style={styles.blankIncubationChickenCountValue}>{batch.count}</Text>
                      <Text style={styles.blankIncubationChickenCountLabel}>eggs</Text>
                    </View>
                  </View>

                  <View style={styles.blankIncubationFamilyTree}>
                    <View style={[styles.blankIncubationFamilyNode, styles.blankIncubationSireNode]}>
                      <View style={styles.blankIncubationLineageLabelRow}>
                        <MaterialCommunityIcons name="gender-male" size={15} color={THEME_ORANGE} />
                        <Text style={styles.blankIncubationLineageLabel}>SIRE</Text>
                      </View>
                      <Text style={styles.blankIncubationLineageValue}>{batch.sire}</Text>
                    </View>
                    <View style={styles.blankIncubationTreeConnector}>
                      <View style={styles.blankIncubationTreeStem} />
                      <View style={styles.blankIncubationTreeTrunk} />
                    </View>
                    <View style={styles.blankIncubationDamList}>
                      {batch.dams.map((dam, index) => (
                        <View key={`${batch.id}-${dam}`} style={styles.blankIncubationDamBranch}>
                          <View style={styles.blankIncubationDamBranchLine} />
                          <View style={styles.blankIncubationFamilyNode}>
                            <View style={styles.blankIncubationLineageLabelRow}>
                              <MaterialCommunityIcons name="gender-female" size={14} color={THEME_ORANGE} />
                              <Text style={styles.blankIncubationLineageLabel}>DAM {index + 1}</Text>
                            </View>
                            <Text style={styles.blankIncubationLineageValue}>{dam}</Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>

                </Pressable>
              ))}
              {!visibleBatches.length && <Text style={styles.blankIncubationEmptyText}>No batches found</Text>}
            </View>
          </View>
        </View>
      </ScrollView>
      <Modal visible={!!candlingBatch} transparent animationType="fade" onRequestClose={() => setCandlingBatch(null)}>
        <View style={styles.blankIncubationModalBackdrop}>
          <Pressable accessibilityLabel="Close record candling modal" onPress={() => setCandlingBatch(null)} style={StyleSheet.absoluteFill} />
          <View style={styles.blankIncubationCandlingModal}>
            <View style={styles.blankIncubationModalHeader}>
              <View>
                <Text style={styles.blankIncubationModalEyebrow}>NEXT ACTION</Text>
                <Text style={styles.blankIncubationModalTitle}>Record Candling</Text>
              </View>
              <Pressable accessibilityLabel="Close" onPress={() => setCandlingBatch(null)} style={styles.blankIncubationModalClose}>
                <Ionicons name="close" size={20} color="#ffffff" />
              </Pressable>
            </View>
            <View style={styles.blankIncubationModalBatch}>
              <Text style={styles.blankIncubationModalBatchName}>{candlingBatch?.name}</Text>
              <Text style={styles.blankIncubationModalBatchCount}>{candlingTotal} eggs</Text>
            </View>
            <View style={styles.blankIncubationCandlingSummary}>
              <View style={styles.blankIncubationCandlingMetric}><Text style={styles.blankIncubationCandlingValue}>{candlingDeveloping}</Text><Text style={styles.blankIncubationCandlingLabel}>Developing</Text></View>
              <View style={styles.blankIncubationCandlingDivider} />
              <View style={styles.blankIncubationCandlingMetric}><Text style={styles.blankIncubationCandlingValue}>{candlingRejected}</Text><Text style={styles.blankIncubationCandlingLabel}>Rejected</Text></View>
              <View style={styles.blankIncubationCandlingDivider} />
              <View style={styles.blankIncubationCandlingMetric}><Text style={styles.blankIncubationCandlingValue}>{candlingRecheck}</Text><Text style={styles.blankIncubationCandlingLabel}>Recheck</Text></View>
            </View>
            <View style={styles.blankIncubationCounterList}>
              <View style={styles.blankIncubationCounterRow}>
                <View style={styles.blankIncubationCounterCopy}><Text style={styles.blankIncubationCounterTitle}>Rejected</Text><Text style={styles.blankIncubationCounterDetail}>Clear or stopped eggs</Text></View>
                <View style={styles.blankIncubationCounterStepper}><Pressable onPress={() => changeCandlingRejected(-1)} style={styles.blankIncubationCounterButton}><Ionicons name="remove" size={18} color="#c8ced0" /></Pressable><Text style={styles.blankIncubationCounterValue}>{candlingRejected}</Text><Pressable onPress={() => changeCandlingRejected(1)} style={styles.blankIncubationCounterButton}><Ionicons name="add" size={18} color="#ffffff" /></Pressable></View>
              </View>
              <View style={[styles.blankIncubationCounterRow, styles.blankIncubationCounterRowLast]}>
                <View style={styles.blankIncubationCounterCopy}><Text style={styles.blankIncubationCounterTitle}>Recheck</Text><Text style={styles.blankIncubationCounterDetail}>Uncertain eggs to check again</Text></View>
                <View style={styles.blankIncubationCounterStepper}><Pressable onPress={() => changeCandlingRecheck(-1)} style={styles.blankIncubationCounterButton}><Ionicons name="remove" size={18} color="#c8ced0" /></Pressable><Text style={styles.blankIncubationCounterValue}>{candlingRecheck}</Text><Pressable onPress={() => changeCandlingRecheck(1)} style={styles.blankIncubationCounterButton}><Ionicons name="add" size={18} color="#ffffff" /></Pressable></View>
              </View>
            </View>
            <View style={styles.blankIncubationModalActions}>
              <Pressable onPress={() => setCandlingBatch(null)} style={styles.blankIncubationModalCancel}><Text style={styles.blankIncubationModalCancelText}>Cancel</Text></Pressable>
              <Pressable onPress={saveCandling} style={styles.blankIncubationModalSave}><MaterialCommunityIcons name="content-save-check-outline" size={17} color="#ffffff" /><Text style={styles.blankIncubationModalSaveText}>Save Candling</Text></Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function SetupField({ icon, label, value, onChangeText, placeholder, keyboardType, trailingIcon, wide }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[styles.setupField, wide && styles.setupFieldWide]}>
      <Text style={styles.setupFieldLabel}>{label}</Text>
      <View style={[styles.setupFieldCopy, focused && styles.setupFieldFocused]}>
        <MaterialCommunityIcons name={icon} size={19} color={focused ? THEME_ORANGE : '#ff8a16'} />
        <TextInput
          accessibilityLabel={label}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#6f7b7f"
          keyboardType={keyboardType}
          selectionColor={THEME_ORANGE}
          style={styles.setupInput}
        />
        {!!trailingIcon && <Ionicons name={trailingIcon} size={16} color="#7f8a8d" />}
      </View>
    </View>
  );
}

function VisibilityOption({ icon, title, description, selected, onPress }) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={`${title} farm visibility`}
      onPress={onPress}
      style={({ pressed }) => [styles.visibilityOption, selected && styles.visibilityOptionActive, pressed && styles.pressed]}
    >
      <View style={[styles.visibilityRadio, selected && styles.visibilityRadioActive]} />
      <View style={styles.visibilityIcon}>
        <MaterialCommunityIcons name={icon} size={20} color={selected ? THEME_ORANGE : '#b9c1c4'} />
      </View>
      <View style={styles.visibilityCopy}>
        <Text style={styles.visibilityTitle}>{title}</Text>
        <Text numberOfLines={2} style={styles.visibilityDescription}>{description}</Text>
      </View>
    </Pressable>
  );
}

function FarmSetupScreen({ onBack }) {
  const { width } = useWindowDimensions();
  const compact = width < 480;
  const narrow = width < 390;
  const [farmName, setFarmName] = useState('');
  const [location, setLocation] = useState('');
  const [establishedYear, setEstablishedYear] = useState('');
  const [bannerUri, setBannerUri] = useState(null);
  const [bannerError, setBannerError] = useState('');
  const [visibility, setVisibility] = useState('published');
  const assignedMembers = [MEMBERS[2], MEMBERS[0]];

  const chooseBanner = async () => {
    setBannerError('');
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.9 });
      if (!result.canceled && result.assets?.[0]?.uri) {
        setBannerUri(result.assets[0].uri);
      }
    } catch {
      setBannerError('Unable to open this photo. Please try again.');
    }
  };

  const saveDraft = () => Alert.alert('Draft saved', 'Your farm setup draft is ready to continue later.');
  const createFarm = () => Alert.alert('Create farm', 'We will connect this farm setup flow later.');

  return (
    <View style={[styles.screen, styles.setupScreen]}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.setupPage}>
          <View style={[styles.setupHeroShell, compact && styles.setupHeroCompact]}>
            <Image source={DASHBOARD_HERO_IMAGE} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="center" cachePolicy="memory-disk" />
            <LinearGradient
              colors={['rgba(2,7,9,0.18)', 'rgba(2,7,9,0.44)', 'rgba(2,7,9,0.96)']}
              locations={[0, 0.42, 1]}
              style={StyleSheet.absoluteFill}
            />
            <SafeAreaView edges={['top']} style={styles.setupHeroContent}>
              <View style={[styles.setupHeroHeader, narrow && styles.setupHeroHeaderNarrow]}>
                <IconButton icon="arrow-back" label="Back" compact={narrow} onPress={onBack} />
                <View style={styles.topBarSpacer} />
              </View>
              <View style={[styles.setupIntro, narrow && styles.setupIntroNarrow]}>
                <Text style={styles.heroEyebrow}>FARM SETUP</Text>
                <Text style={[styles.setupIntroTitle, compact && styles.setupIntroTitleCompact, narrow && styles.setupIntroTitleNarrow]}>Set Up Your Farm</Text>
                <Text style={[styles.setupIntroText, narrow && styles.setupIntroTextNarrow]}>Create your farm profile. You can save it as a draft and finish it later.</Text>
              </View>
            </SafeAreaView>
          </View>

          <View style={[styles.setupBody, narrow && styles.contentNarrow]}>
            <View style={styles.setupPanel}>
              <View style={styles.setupSectionHeader}>
                <View>
                  <Text style={styles.setupSectionKicker}>Identity</Text>
                  <Text style={styles.setupSectionTitle}>Farm Banner</Text>
                </View>
                <Text style={styles.setupOptional}>1280 x 720 recommended</Text>
              </View>

              <View style={styles.setupBannerPreview}>
                <Image
                  source={bannerUri ? { uri: bannerUri } : DASHBOARD_HERO_IMAGE}
                  style={StyleSheet.absoluteFill}
                  contentFit="cover"
                  contentPosition="center"
                  transition={300}
                  cachePolicy="memory-disk"
                  onError={() => {
                    setBannerUri(null);
                    setBannerError('This photo could not be displayed. Please choose another.');
                  }}
                />
                <LinearGradient
                  colors={['rgba(2, 7, 9, 0.2)', 'rgba(2,7,9,0.86)']}
                  style={StyleSheet.absoluteFill}
                />
                <Pressable accessibilityRole="button" accessibilityLabel={bannerUri ? 'Change farm banner' : 'Upload farm banner'} onPress={chooseBanner} style={({ pressed }) => [styles.setupBannerUpload, pressed && styles.pressed]}>
                  <View style={styles.setupBannerUploadIcon}>
                    <MaterialCommunityIcons name="image-plus" size={26} color={THEME_ORANGE} />
                  </View>
                  <Text style={styles.setupBannerUploadTitle}>{bannerUri ? 'Change farm banner' : 'Upload farm banner'}</Text>
                  <Text style={styles.setupBannerUploadMeta}>JPG, PNG up to 5MB</Text>
                </Pressable>
                {bannerUri && (
                  <Pressable accessibilityRole="button" accessibilityLabel="Remove banner" onPress={() => { setBannerUri(null); setBannerError(''); }} style={({ pressed }) => [styles.setupRemoveBanner, pressed && styles.pressed]}>
                    <Ionicons name="close" size={17} color="#ffffff" />
                  </Pressable>
                )}
              </View>
              {!!bannerError && <Text accessibilityRole="alert" style={styles.setupBannerError}>{bannerError}</Text>}
            </View>

            <View style={styles.setupPanel}>
              <View style={styles.setupSectionHeader}>
                <View>
                  <Text style={styles.setupSectionKicker}>Basics</Text>
                  <Text style={styles.setupSectionTitle}>Farm Details</Text>
                </View>
              </View>
              <View style={styles.setupFieldGrid}>
                <SetupField icon="home-outline" label="Farm Name" value={farmName} onChangeText={setFarmName} placeholder="Enter farm name" wide />
                <SetupField icon="map-marker-outline" label="Location" value={location} onChangeText={setLocation} placeholder="City / Province / Country" wide />
                <SetupField icon="calendar-blank-outline" label="Established" value={establishedYear} onChangeText={setEstablishedYear} placeholder="Select year" keyboardType="number-pad" trailingIcon="chevron-down" wide />
              </View>
            </View>

            <View style={styles.setupPanel}>
              <View style={styles.setupSectionHeader}>
                <View>
                  <Text style={styles.setupSectionKicker}>Access</Text>
                  <Text style={styles.setupSectionTitle}>Assign Team</Text>
                </View>
              </View>
              <Pressable accessibilityRole="button" accessibilityLabel="Assign team members" onPress={() => Alert.alert('Assign team', 'Team member assignment will be connected later.')} style={({ pressed }) => [styles.assignTeamBox, pressed && styles.pressed]}>
                <View style={styles.assignTeamTop}>
                  <View style={styles.assignTeamIcon}>
                    <MaterialCommunityIcons name="account-group" size={20} color={THEME_ORANGE} />
                  </View>
                  <View style={styles.assignTeamCopy}>
                    <Text style={styles.assignTeamTitle}>Assign team members</Text>
                    <Text style={styles.assignTeamSubtitle}>Choose people who can manage this farm</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#8a9699" />
                </View>
                <View style={styles.assignedPills}>
                  {assignedMembers.map((member) => (
                    <View key={member.id} style={styles.memberPill}>
                      <Image source={member.image} style={styles.memberPillImage} contentFit="cover" cachePolicy="memory-disk" />
                      <Text numberOfLines={1} style={styles.memberPillText}>{member.name.split(' ')[0]}</Text>
                      <Ionicons name="close" size={12} color="#aeb8bb" />
                    </View>
                  ))}
                </View>
              </Pressable>
            </View>

            <View style={styles.setupPanel}>
              <View style={styles.setupSectionHeader}>
                <View>
                  <Text style={styles.setupSectionKicker}>Publishing</Text>
                  <Text style={styles.setupSectionTitle}>Farm Visibility</Text>
                </View>
              </View>
              <View style={styles.visibilityGrid}>
                <VisibilityOption
                  icon="lock"
                  title="Draft"
                  description="Only you and your team can access it"
                  selected={visibility === 'draft'}
                  onPress={() => setVisibility('draft')}
                />
                <VisibilityOption
                  icon="account-group"
                  title="Published"
                  description="Showcase is visible to FarmBuzz users"
                  selected={visibility === 'published'}
                  onPress={() => setVisibility('published')}
                />
              </View>
            </View>

            <View style={styles.setupActions}>
              <Pressable accessibilityRole="button" accessibilityLabel="Save as draft" onPress={saveDraft} style={({ pressed }) => [styles.setupSecondaryButton, pressed && styles.pressed]}>
                <Text style={styles.setupSecondaryText}>Save as Draft</Text>
              </Pressable>
              <Pressable accessibilityRole="button" accessibilityLabel="Create farm" onPress={createFarm} style={({ pressed }) => [styles.setupPrimaryButton, pressed && styles.pressed]}>
                <Text style={styles.setupPrimaryText}>Create Farm</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function ProcessScreen({ farmName, location, establishedYear, onOpenShowcase, onOpenManagement, onOpenProcess, onOpenBreedingHatchery, onOpenSettings }) {
  const { width } = useWindowDimensions();
  const compact = width < 480;
  const narrow = width < 390;

  return (
    <View style={styles.screen}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.page}>
          <FarmBanner
            farmName={farmName}
            location={location}
            establishedYear={establishedYear}
            onOpenShowcase={onOpenShowcase}
            onOpenManagement={onOpenManagement}
            onOpenSettings={onOpenSettings}
          />
          <View style={[styles.content, narrow && styles.contentNarrow]}>
            <WorkspaceTabs
              activeTab="process"
              compact={compact}
              onOpenShowcase={onOpenShowcase}
              onOpenManagement={onOpenManagement}
              onOpenProcess={onOpenProcess}
            />
            <View style={styles.sectionHeading}><Text style={[styles.sectionTitle, narrow && styles.sectionTitleNarrow]}>Process Stages</Text><Text style={styles.sectionMeta}>1 stage</Text></View>
            <View style={[styles.moduleGrid, compact && styles.moduleGridCompact]}>
              {PROCESS_STAGES.map((item) => (
                <ModuleCard
                  key={item.title}
                  item={item}
                  compact={compact}
                  onPress={onOpenBreedingHatchery}
                />
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function BreedingHatcheryProcessScreen({ farmName, location, establishedYear, onBack, onOpenShowcase, onOpenManagement, onOpenProcess, onOpenSettings }) {
  const { width } = useWindowDimensions();
  const compact = width < 480;
  const narrow = width < 390;

  return (
    <View style={styles.screen}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.page}>
          <FarmBanner
            farmName={farmName}
            location={location}
            establishedYear={establishedYear}
            onOpenShowcase={onOpenShowcase}
            onOpenManagement={onOpenManagement}
            onOpenSettings={onOpenSettings}
          />
          <View style={[styles.content, narrow && styles.contentNarrow]}>
            <WorkspaceTabs
              activeTab="process"
              compact={compact}
              onOpenShowcase={onOpenShowcase}
              onOpenManagement={onOpenManagement}
              onOpenProcess={onOpenProcess}
            />
            <Pressable accessibilityRole="button" accessibilityLabel="Back to Process" onPress={onBack} style={({ pressed }) => [styles.processBackButton, pressed && styles.pressed]}>
              <Ionicons name="arrow-back" size={15} color={THEME_ORANGE} />
              <Text style={styles.processBackText}>Process</Text>
            </Pressable>
            <View style={styles.processDetailHeader}>
              <Text style={[styles.sectionTitle, narrow && styles.sectionTitleNarrow]}>Breeding & Hatchery</Text>
              <Text style={styles.processDetailSubtitle}>Manage pairing, egg collection, marking, incubation, candling and hatching in one place.</Text>
            </View>
            <View style={styles.hatcherySummaryGrid}>
              {HATCHERY_SUMMARY.map((item) => (
                <View key={item.label} style={styles.hatcherySummaryCard}>
                  <Text style={styles.hatcherySummaryValue}>{item.value}</Text>
                  <Text numberOfLines={2} style={styles.hatcherySummaryLabel}>{item.label}</Text>
                </View>
              ))}
            </View>
            <View style={styles.sectionHeading}><Text style={[styles.sectionTitle, narrow && styles.sectionTitleNarrow]}>Tools</Text><Text style={styles.sectionMeta}>4 steps</Text></View>
            <View style={styles.activityList}>
              {HATCHERY_TOOLS.map((item, index) => (
                <HatcheryToolRow key={item.title} item={item} isLast={index === HATCHERY_TOOLS.length - 1} />
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function Dashboard({ farmName, location, establishedYear, totalWins, onOpenShowcase, onOpenProcess, onOpenSettings, onOpenNeedsAttention, onOpenFlock, onOpenBreeding, onOpenHealthCare, onOpenEggsIncubation, onOpenTasks, onOpenTeam, onOpenSales }) {
  const { width } = useWindowDimensions();
  const compact = width < 480;
  const narrow = width < 390;
  const dashboardStats = STATS.map((item) => (
    item.label === 'Total Wins' ? { ...item, value: String(totalWins) } : item
  ));

  return (
    <View style={styles.screen}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.page}>
          <FarmBanner
            farmName={farmName}
            location={location}
            establishedYear={establishedYear}
            onOpenShowcase={onOpenShowcase}
            onOpenManagement={() => {}}
            onOpenSettings={onOpenSettings}
          />
          <View style={[styles.content, narrow && styles.contentNarrow]}>
            <WorkspaceTabs
              activeTab="management"
              compact={compact}
              onOpenShowcase={onOpenShowcase}
              onOpenManagement={() => {}}
              onOpenProcess={onOpenProcess}
            />
            <View style={[styles.statsPanel, compact && styles.statsPanelCompact]}>
              {dashboardStats.map((item, index) => (
                <Stat
                  key={item.label}
                  item={item}
                  compact={compact}
                  isLast={index === dashboardStats.length - 1}
                  onPress={item.label === 'Active Birds' ? onOpenFlock : item.label === 'Needs Attention' ? onOpenNeedsAttention : item.label === 'Tasks Due' ? onOpenTasks : undefined}
                />
              ))}
            </View>

            <View style={styles.sectionHeading}><Text style={[styles.sectionTitle, narrow && styles.sectionTitleNarrow]}>Management Tools</Text><Text style={styles.sectionMeta}>8 modules</Text></View>
            <View style={[styles.moduleGrid, compact && styles.moduleGridCompact]}>
              {MODULES.map((item) => (
                <ModuleCard
                  key={item.title}
                  item={item}
                  compact={compact}
                  onPress={() => {
                    if (item.title === 'Flock') {
                      onOpenFlock();
                      return;
                    }
                    if (item.title === 'Breeding') {
                      onOpenBreeding();
                      return;
                    }
                    if (item.title === 'Health & Care') {
                      onOpenHealthCare();
                      return;
                    }
                    if (item.title === 'Eggs & Incubation') {
                      onOpenEggsIncubation();
                      return;
                    }
                    if (item.title === 'Tasks') {
                      onOpenTasks();
                      return;
                    }
                    if (item.title === 'Team') {
                      onOpenTeam();
                      return;
                    }
                    if (item.title === 'Sales') {
                      onOpenSales();
                      return;
                    }
                    if (item.title === 'Collections') {
                      onOpenSales();
                      return;
                    }
                    Alert.alert(item.title, `${item.title} module selected.`);
                  }}
                />
              ))}
            </View>

            <View style={styles.activityHeading}><View><Text style={styles.activitySectionTitle}>Recent Activity</Text><Text style={styles.activitySectionSubtitle}>Latest updates across the farm</Text></View><Text style={styles.activityToday}>Today</Text></View>
            <View style={styles.activityList}>{RECENT_ACTIVITY.map((item, index) => <ActivityRow key={item.id} item={item} isLast={index === RECENT_ACTIVITY.length - 1} onPress={item.destination === 'health' ? onOpenHealthCare : item.destination === 'incubation' ? onOpenEggsIncubation : onOpenTasks} />)}</View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

export default function App() {
  const [screen, setScreen] = useState('landing');
  const [selectedFarm, setSelectedFarm] = useState(null);
  const [settingsReturn, setSettingsReturn] = useState('dashboard');
  const [createBatchReturn, setCreateBatchReturn] = useState('eggs-incubation');
  const [selectedBatchId, setSelectedBatchId] = useState('INC-024');
  const [candlingResultsByBatch, setCandlingResultsByBatch] = useState({});
  const [hatchResultsByBatch, setHatchResultsByBatch] = useState({});
  const [selectedBroodingBatchId, setSelectedBroodingBatchId] = useState('BR-024');
  const [addedBroodingBatches, setAddedBroodingBatches] = useState([]);
  const [broodingLossesByBatch, setBroodingLossesByBatch] = useState({});
  const [broodingSettings, setBroodingSettings] = useState(DEFAULT_BROODING_SETTINGS);
  const [vaccineCompletionsByBatch, setVaccineCompletionsByBatch] = useState({});
  const [selectedGrowingBatchId, setSelectedGrowingBatchId] = useState('GR-024');
  const [growingLossesByBatch, setGrowingLossesByBatch] = useState({});
  const [growingLocationsByBatch, setGrowingLocationsByBatch] = useState({});
  const [growingTasksByBatch, setGrowingTasksByBatch] = useState({});
  const [growingSeparationsByBatch, setGrowingSeparationsByBatch] = useState({});
  const [growingSettings, setGrowingSettings] = useState(DEFAULT_GROWING_SETTINGS);
  const [addedRangingBatches, setAddedRangingBatches] = useState([]);
  const [addedPulletBatches, setAddedPulletBatches] = useState([]);
  const [stagAreas, setStagAreas] = useState(DEFAULT_STAG_AREAS);
  const [selectedStagArea, setSelectedStagArea] = useState('Hardening Area 1');
  const [stagSettings, setStagSettings] = useState(DEFAULT_STAG_SETTINGS);
  const [cordingAreas, setCordingAreas] = useState([{ name: 'Cordate Area 1', count: 0 }, { name: 'Cordate Area 2', count: 0 }]);
  const [cordingBirds, setCordingBirds] = useState([]);
  const nextCordingBirdNumber = useRef(101);
  const [selectedCordateArea, setSelectedCordateArea] = useState('Cordate Area 1');
  const [cordateSettings, setCordateSettings] = useState(DEFAULT_CORDATE_SETTINGS);
  const [selectedRangingBatchId, setSelectedRangingBatchId] = useState('Range Area 2');
  const [rangingLossesByBatch, setRangingLossesByBatch] = useState({});
  const [rangingLocationsByBatch, setRangingLocationsByBatch] = useState({});
  const [rangingTasksByBatch, setRangingTasksByBatch] = useState({});
  const [rangingSelectionsByLocation, setRangingSelectionsByLocation] = useState({});
  const [rangingSettings, setRangingSettings] = useState(DEFAULT_RANGING_SETTINGS);
  useEffect(() => {
    const previousDefaults = ['Keep / Continue', 'Future Breeder', 'Sell / Transfer', 'Remove from Program'];
    setRangingSettings((current) => {
      const options = current.selectionOptions || [];
      const usesPreviousDefaults = options.length === previousDefaults.length && options.every((option, index) => option === previousDefaults[index]);
      return usesPreviousDefaults ? { ...current, selectionOptions: ['Proceed', 'Recheck', 'Remove'] } : current;
    });
  }, []);
  const [completedRangingBatchIds, setCompletedRangingBatchIds] = useState([]);
  const [selectedPulletBatchId, setSelectedPulletBatchId] = useState('PL-024');
  const [pulletLossesByBatch, setPulletLossesByBatch] = useState({});
  const [pulletLocationsByBatch, setPulletLocationsByBatch] = useState({});
  const [pulletChecksByBatch, setPulletChecksByBatch] = useState({});
  const [pulletEvaluationsByBatch, setPulletEvaluationsByBatch] = useState({});
  const [addedBirds, setAddedBirds] = useState([]);
  const [selectedBird, setSelectedBird] = useState(null);
  const [birdOverrides, setBirdOverrides] = useState({});
  const [addedPairings, setAddedPairings] = useState([]);
  const [selectedPairing, setSelectedPairing] = useState(null);
  const [eggCollectionsByPairing, setEggCollectionsByPairing] = useState({});
  const [pairingReturn, setPairingReturn] = useState('breeding');
  const [offspringReturn, setOffspringReturn] = useState('bird-breeding');
  const [offspringPairing, setOffspringPairing] = useState(null);
  const [addPairingReturn, setAddPairingReturn] = useState('breeding');
  const [addedMembers, setAddedMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberReturn, setMemberReturn] = useState('team');
  const [memberOverrides, setMemberOverrides] = useState({});
  const [addedTasks, setAddedTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [addTaskReturn, setAddTaskReturn] = useState('tasks');
  const [taskOverrides, setTaskOverrides] = useState({});
  const [healthRecords, setHealthRecords] = useState([]);
  const [attentionReturn, setAttentionReturn] = useState('dashboard');
  const [healthRecordReturn, setHealthRecordReturn] = useState('health-care');
  const [healthDetailReturn, setHealthDetailReturn] = useState('bird-health-care');
  const [healthRecordsReturn, setHealthRecordsReturn] = useState('health-care');
  const [healthRecordsBird, setHealthRecordsBird] = useState(null);
  const [selectedHealthRecord, setSelectedHealthRecord] = useState(null);
  const [healthRecordOverrides, setHealthRecordOverrides] = useState({});
  const [deletedHealthRecordIds, setDeletedHealthRecordIds] = useState([]);
  const [vaccinations, setVaccinations] = useState(DEFAULT_VACCINATIONS);
  const [treatments, setTreatments] = useState(DEFAULT_TREATMENTS);
  const [treatmentReturn, setTreatmentReturn] = useState('health-care');
  const [treatmentBird, setTreatmentBird] = useState(null);
  const [vaccinationReturn, setVaccinationReturn] = useState('health-care');
  const [vaccinationBird, setVaccinationBird] = useState(null);
  const [weightsByBird, setWeightsByBird] = useState({});
  const [achievementsByBird, setAchievementsByBird] = useState({});
  const [eggRecordsByBird, setEggRecordsByBird] = useState({});
  const [farmLocations, setFarmLocations] = useState(DEFAULT_FARM_LOCATIONS);
  const [ownershipByBird, setOwnershipByBird] = useState(MOCK_OWNERSHIP_BY_BIRD);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [notesByBird, setNotesByBird] = useState({});
  const [documentsByBird, setDocumentsByBird] = useState({});
  const [managementSettings, setManagementSettings] = useState({
    farmName: 'FB Farm',
    location: 'Pampanga, Philippines',
    establishedYear: '2020',
    incubationDays: 21,
    candlingDay: 7,
    notifications: { health: true, tasks: true, incubation: true, vaccinations: true },
    modules: {
      general: { temperatureUnit: 'Celsius', weightUnit: 'Kilograms' },
      flock: { showInactive: false, careReviewDays: 7, birdIdPrefix: 'FBZ' },
      breeding: { holdingLimitDays: 7, trackFirstEgg: true, pairingReminders: true },
      health: { vaccineLeadDays: 3, requireTreatmentNotes: true, healthReviewDays: 30 },
      incubation: { recommendedTemperature: 37.5, lockdownHumidity: 65, defaultIncubator: 'Incubator 1' },
      tasks: { dailySummary: true, requireAssignee: false, defaultPriority: 'Medium', defaultRepeat: 'Does not repeat' },
      team: { approvalRequired: true, defaultRole: 'Farm Worker' },
    },
  });

  const openCreateBatch = (returnScreen) => {
    setCreateBatchReturn(returnScreen);
    setScreen('create-batch');
  };

  const updateHealthRecord = (record) => {
    setHealthRecords((current) => current.map((item) => item.id === record.id ? record : item));
    setHealthRecordOverrides((current) => ({ ...current, [record.id]: record }));
    setSelectedHealthRecord(record);
  };

  const teamMembers = [...addedMembers, ...MEMBERS].map((member) => memberOverrides[member.id] || member);
  const flockBirds = [...addedBirds, ...BIRDS].map((bird) => birdOverrides[bird._recordKey || bird.farmBuzzId || bird.name] || bird);
  const totalWins = flockBirds.reduce((sum, bird) => sum + getBirdWins(bird), 0);
  const rangingBatches = [...addedRangingBatches, ...RANGING_BATCHES].filter((batch, index, items) => items.findIndex((item) => item.id === batch.id) === index);
  const rangingLocations = buildRangingLocations(rangingBatches, rangingLossesByBatch, rangingLocationsByBatch, rangingSelectionsByLocation, rangingSettings.readyDay);
  const selectedRangingLocation = rangingLocations.find((group) => group.location === selectedRangingBatchId) || rangingLocations[0];
  const pulletBatches = [...addedPulletBatches, ...PULLET_BATCHES].filter((batch, index, items) => items.findIndex((item) => item.id === batch.id) === index);

  return (
    <SafeAreaProvider>
      {screen === 'landing' ? (
        <LandingScreen
          onSetup={() => setScreen('farm-setup')}
          onExisting={() => {
            setSelectedFarm(null);
            setScreen('dashboard');
          }}
          onFarms={() => setScreen('farms')}
        />
      ) : screen === 'farm-setup' ? (
        <FarmSetupScreen
          onBack={() => setScreen('landing')}
        />
      ) : screen === 'farms' ? (
        <FarmsScreen
          onBack={() => setScreen('landing')}
          onOpenFarm={(farm) => {
            setSelectedFarm(farm);
            setScreen('farm-detail');
          }}
          onAddFarm={() => setScreen('farm-setup')}
        />
      ) : screen === 'farm-detail' ? (
        <FarmDetailScreen
          farm={selectedFarm}
          metrics={[
            { label: 'Incubating', detail: 'active batches', value: String(ACTIVE_CHICKEN_BATCHES.length), icon: 'egg-outline', color: THEME_ORANGE },
            { label: 'Brooding', detail: 'active chicks', value: String(addedBroodingBatches.length + 1), icon: 'bird', color: THEME_ORANGE },
            { label: 'Ranging', detail: 'active batches', value: String(rangingBatches.length), icon: 'leaf', color: THEME_ORANGE },
            { label: 'Cordate', detail: 'stags housed', value: String(cordingBirds.length), icon: 'home-variant', color: THEME_ORANGE },
          ]}
          onBack={() => setScreen('farms')}
          onOpenBreeding={() => setScreen('breeding')}
          onOpenIncubation={() => setScreen('eggs-incubation')}
          onOpenBlankIncubation={() => setScreen('blank-incubation')}
          onOpenBrooding={() => setScreen('brooding')}
          onOpenGrowing={() => setScreen('growing')}
          onOpenMaturing={() => setScreen('ranging')}
          onOpenHardening={() => setScreen('stag-maintenance')}
          onOpenCording={() => setScreen('cording')}
          onOpenCordate={() => setScreen('cordate')}
          onOpenSettings={() => {
            setSettingsReturn('farm-detail');
            setScreen('management-settings');
          }}
        />
      ) : screen === 'blank-incubation' ? (
        <BlankIncubationScreen
          farm={selectedFarm}
          onBack={() => setScreen('farm-detail')}
          onAddBatch={() => setScreen('add-family-batch')}
          onOpenBatch={(batchId) => {
            setSelectedBatchId(batchId);
            setScreen('family-batch-detail');
          }}
          onAddTask={() => {
            setScreen('eggs-incubation-settings');
          }}
        />
      ) : screen === 'eggs-incubation-settings' ? (
      <EggsIncubationSettingsScreen
        addedTasks={addedTasks}
        onBack={() => setScreen('blank-incubation')}
      />
      ) : screen === 'add-family-batch' ? (
        <AddFamilyBatchScreen farm={selectedFarm} onBack={() => setScreen('blank-incubation')} />
      ) : screen === 'family-batch-detail' ? (
        <FamilyBatchDetailScreen
          batchId={selectedBatchId}
          candlingResults={candlingResultsByBatch[selectedBatchId]}
          hatchResults={hatchResultsByBatch[selectedBatchId]}
          onBack={() => setScreen('blank-incubation')}
          onOpenCandling={() => {}}
          onSaveCandling={(results) => setCandlingResultsByBatch((current) => ({ ...current, [selectedBatchId]: results }))}
          onOpenHatch={() => setScreen('record-family-hatch')}
        />
      ) : screen === 'record-family-hatch' ? (
        <RecordHatchScreen
          batchId={selectedBatchId}
          batchOverride={{ id: selectedBatchId, eggCount: 100 }}
          activeEggCount={100 - (candlingResultsByBatch[selectedBatchId]?.rejected || 0)}
          sourcesOverride={[
            { groupName: 'Pairing 1', cross: 'Sweater x Kelso', eggs: 34 },
            { groupName: 'Pairing 2', cross: 'Sweater x Hatch', eggs: 33 },
            { groupName: 'Pairing 3', cross: 'Sweater x Roundhead', eggs: 33 },
          ]}
          initialResult={hatchResultsByBatch[selectedBatchId]}
          onBack={() => setScreen('family-batch-detail')}
          onSave={(result) => {
            setHatchResultsByBatch((current) => ({ ...current, [selectedBatchId]: result }));
            const broodingBatchId = `BR-${selectedBatchId.replace(/\D/g, '') || '001'}`;
            const broodingBatch = {
              id: broodingBatchId,
              chicks: result.hatched,
              startingChicks: result.hatched,
              age: 'Day 1',
              ageDays: 1,
              location: 'Brooder House',
              status: 'Brooding',
              note: 'Newly moved from incubation',
              incubationBatch: selectedBatchId,
              hatchDate: result.hatchDate,
              sources: result.sources.map((source) => ({
                groupName: source.groupName,
                cross: source.cross,
                chicks: source.hatched,
                marking: source.marking,
              })),
            };
            setAddedBroodingBatches((current) => [broodingBatch, ...current.filter((batch) => batch.id !== broodingBatchId)]);
            setSelectedBroodingBatchId(broodingBatchId);
            setScreen('brooding');
          }}
        />
      ) : screen === 'maturing' ? (
        <MaturingScreen
          onBack={() => setScreen('farm-detail')}
          onOpenRanging={() => setScreen('ranging')}
          onOpenFemale={() => setScreen('pullets')}
        />
      ) : screen === 'stag-maintenance' ? (
        <StagMaintenanceScreen
          areas={stagAreas}
          onBack={() => setScreen('farm-detail')}
          onOpenSettings={() => setScreen('stag-maintenance-settings')}
          onOpenArea={(location) => {
            setSelectedStagArea(location);
            setScreen('stag-maintenance-detail');
          }}
        />
      ) : screen === 'cording' ? (
        <CordingScreen
          areas={cordingAreas}
          birds={cordingBirds}
          onBack={() => setScreen('farm-detail')}
        />
      ) : screen === 'cordate' ? (
        <CordateScreen
          farm={selectedFarm}
          areas={cordingAreas}
          birds={cordingBirds}
          onBack={() => setScreen('farm-detail')}
          onOpenBatch={(areaName) => {
            setSelectedCordateArea(areaName);
            setScreen('cordate-detail');
          }}
          onOpenSettings={() => setScreen('cordate-task-settings')}
        />
      ) : screen === 'cordate-detail' ? (
        <CordateBatchDetailScreen
          areaName={selectedCordateArea}
          birds={cordingBirds}
          onBack={() => setScreen('cordate')}
        />
      ) : screen === 'cordate-task-settings' ? (
        <GrowingScheduleSettingsScreen
          variant="cordate"
          initialSettings={cordateSettings}
          onBack={() => setScreen('cordate')}
          onSave={(settings) => {
            setCordateSettings(settings);
            setScreen('cordate');
          }}
        />
      ) : screen === 'stag-maintenance-settings' ? (
        <GrowingScheduleSettingsScreen
          variant="stag"
          initialSettings={stagSettings}
          onBack={() => setScreen('stag-maintenance')}
          onSave={(settings) => {
            setStagSettings(settings);
            setScreen('stag-maintenance');
          }}
        />
      ) : screen === 'stag-maintenance-detail' ? (
        <StagMaintenanceAreaDetail
          area={stagAreas.find((area) => area.location === selectedStagArea) || stagAreas[0]}
          cordingAreas={cordingAreas.map((area) => area.name)}
          nextBirdNumber={nextCordingBirdNumber.current}
          existingPhysicalIds={cordingBirds.map((bird) => bird.physicalId)}
          onBack={() => setScreen('stag-maintenance')}
          onMove={(record) => {
            setStagAreas((current) => {
              const source = current.find((area) => area.location === selectedStagArea);
              const destination = current.find((area) => area.location === record.destination);
              const reduced = current.map((area) => area.location === selectedStagArea ? { ...area, birds: area.birds - record.count, history: [{ date: record.date, text: `${record.count} moved to ${record.destination}` }, ...area.history] } : area);
              if (destination) return reduced.map((area) => area.location === record.destination ? { ...area, birds: area.birds + record.count, startingBirds: area.startingBirds + record.count, history: [{ date: record.date, text: `${record.count} entered from ${selectedStagArea}` }, ...area.history] } : area);
              return [...reduced, { ...source, location: record.destination, birds: record.count, startingBirds: record.count, movedForward: 0, removed: 0, history: [{ date: record.date, text: `${record.count} entered from ${selectedStagArea}` }] }];
            });
            setScreen('stag-maintenance');
          }}
          onLoss={(record) => {
            setStagAreas((current) => current.map((area) => area.location === selectedStagArea ? { ...area, birds: area.birds - record.count, removed: (area.removed || 0) + record.count, history: [{ date: record.date, text: `${record.count} loss / adjustment${record.note ? ` - ${record.note}` : ''}` }, ...area.history] } : area));
            setScreen('stag-maintenance');
          }}
          onHealth={() => setStagAreas((current) => current.map((area) => area.location === selectedStagArea ? { ...area, nextTask: area.nextTask ? { ...area.nextTask, completed: true, status: 'Completed' } : null, history: [{ date: new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date()), text: 'Health / vaccination task completed' }, ...area.history] } : area))}
          onMoveToCording={(record) => {
            const individualBirds = record.birds.map((bird) => ({
              ...bird,
              _recordKey: bird.farmBuzzId,
              name: bird.physicalId,
              type: 'Stag',
              filter: 'stag',
              bloodline: 'Not individually assigned',
              status: 'Cording',
              location: record.destination,
              image: CORDING_CARD_IMAGE,
              details: [{ icon: 'tag-outline', text: `${bird.identificationType}: ${bird.physicalId}` }, { icon: 'map-marker-outline', text: record.destination }],
              cordingEntry: { fromArea: selectedStagArea, destination: record.destination, movedAt: record.moveDate },
            }));
            setStagAreas((current) => current.map((area) => area.location === selectedStagArea ? { ...area, birds: area.birds - record.quantity, movedForward: (area.movedForward || 0) + record.quantity, status: area.birds === record.quantity ? 'Completed' : area.status, history: [{ date: record.moveDate, text: `${record.quantity} moved to ${record.destination}` }, ...area.history] } : area));
            setCordingBirds((current) => [...individualBirds, ...current]);
            setAddedBirds((current) => [...individualBirds, ...current]);
            setCordingAreas((current) => current.map((area) => area.name === record.destination ? { ...area, count: area.count + record.quantity } : area));
            nextCordingBirdNumber.current += record.quantity;
            setScreen('stag-maintenance');
          }}
        />
      ) : screen === 'pullets' ? (
        <PulletScreen
          batches={pulletBatches}
          lossesByBatch={pulletLossesByBatch}
          locationsByBatch={pulletLocationsByBatch}
          evaluationsByBatch={pulletEvaluationsByBatch}
          onBack={() => setScreen('maturing')}
          onOpenBatch={(batchId) => {
            setSelectedPulletBatchId(batchId);
            setScreen('pullet-batch-detail');
          }}
        />
      ) : screen === 'pullet-batch-detail' ? (
        <PulletBatchDetailScreen
          batchId={selectedPulletBatchId}
          batches={pulletBatches}
          losses={pulletLossesByBatch[selectedPulletBatchId] || []}
          locationOverride={pulletLocationsByBatch[selectedPulletBatchId]}
          checkRecord={pulletChecksByBatch[selectedPulletBatchId]}
          evaluationRecord={pulletEvaluationsByBatch[selectedPulletBatchId]}
          onBack={() => setScreen('pullets')}
          onSaveLoss={(record) => setPulletLossesByBatch((current) => ({ ...current, [selectedPulletBatchId]: [record, ...(current[selectedPulletBatchId] || [])] }))}
          onChangeLocation={(location) => setPulletLocationsByBatch((current) => ({ ...current, [selectedPulletBatchId]: location }))}
          onCompleteCheck={(record) => setPulletChecksByBatch((current) => ({ ...current, [selectedPulletBatchId]: record }))}
          onCompleteEvaluation={(record) => {
            setPulletEvaluationsByBatch((current) => ({ ...current, [selectedPulletBatchId]: record }));
            Alert.alert('Evaluation Completed', `${selectedPulletBatchId} has been assigned by outcome.`);
            setScreen('pullets');
          }}
        />
      ) : screen === 'growing' ? (
        <GrowingScreen
          onBack={() => setScreen('farm-detail')}
          readyDay={growingSettings.readyDay}
          onOpenSettings={() => {
            setScreen('growing-settings');
          }}
          onOpenBatch={(batchId) => {
            setSelectedGrowingBatchId(batchId);
            setScreen('growing-batch-detail');
          }}
        />
      ) : screen === 'growing-settings' ? (
        <GrowingSettingsScreen
          settings={growingSettings}
          onBack={() => setScreen('growing')}
          onOpenSeparation={() => setScreen('growing-separation-settings')}
          onOpenTasks={() => setScreen('growing-task-settings')}
        />
      ) : screen === 'growing-separation-settings' ? (
        <GrowingSeparationSettingsScreen
          settings={growingSettings}
          onBack={() => setScreen('growing-settings')}
          onSave={(settings) => {
            setGrowingSettings(settings);
            setScreen('growing-settings');
          }}
        />
      ) : screen === 'growing-task-settings' ? (
        <GrowingScheduleSettingsScreen
          initialSettings={growingSettings}
          onBack={() => setScreen('growing-settings')}
          onSave={(settings) => {
            setGrowingSettings(settings);
            setScreen('growing-settings');
          }}
        />
      ) : screen === 'growing-batch-detail' ? (
        <GrowingBatchDetailScreen
          batchId={selectedGrowingBatchId}
          losses={growingLossesByBatch[selectedGrowingBatchId] || []}
          completed={growingTasksByBatch[selectedGrowingBatchId] || {}}
          locationOverride={growingLocationsByBatch[selectedGrowingBatchId]}
          readyDay={growingSettings.readyDay}
          scheduledTasks={growingSettings.tasks}
          separationOptions={growingSettings.separationOptions}
          separationRecord={growingSeparationsByBatch[selectedGrowingBatchId]}
          onBack={() => setScreen('growing')}
          onSaveLoss={(record) => setGrowingLossesByBatch((current) => ({ ...current, [selectedGrowingBatchId]: [record, ...(current[selectedGrowingBatchId] || [])] }))}
          onChangeLocation={(location) => setGrowingLocationsByBatch((current) => ({ ...current, [selectedGrowingBatchId]: location }))}
          onCompleteTask={(task) => setGrowingTasksByBatch((current) => ({ ...current, [selectedGrowingBatchId]: { ...(current[selectedGrowingBatchId] || {}), [task]: true } }))}
          onSaveSeparation={(record) => setGrowingSeparationsByBatch((current) => ({ ...current, [selectedGrowingBatchId]: record }))}
          onMoveToRanging={(rangingBatch, pulletBatch) => {
            if (rangingBatch.birds > 0) setAddedRangingBatches((current) => [rangingBatch, ...current.filter((item) => item.id !== rangingBatch.id)]);
            if (pulletBatch.pullets > 0) setAddedPulletBatches((current) => [pulletBatch, ...current.filter((item) => item.id !== pulletBatch.id)]);
            if (rangingBatch.birds > 0) {
              setSelectedRangingBatchId(rangingBatch.location);
              setScreen('ranging-batch-detail');
            } else {
              setSelectedPulletBatchId(pulletBatch.id);
              setScreen('pullet-batch-detail');
            }
          }}
        />
      ) : screen === 'ranging' ? (
        <RangingScreen
          farm={selectedFarm}
          batches={rangingBatches.map((batch) => completedRangingBatchIds.includes(batch.id) ? { ...batch, status: 'Completed' } : batch)}
          lossesByBatch={rangingLossesByBatch}
          locationsByBatch={rangingLocationsByBatch}
          selectionsByLocation={rangingSelectionsByLocation}
          taskSchedule={rangingSettings.tasks}
          taskCompletionsByBatch={rangingTasksByBatch}
          readyDay={rangingSettings.readyDay}
          nextCordingBirdNumber={nextCordingBirdNumber.current}
          hasCordateTransfers={cordingBirds.length > 0}
          defaultCordateDestination={(cordingAreas.find((area) => area.count > 0) || cordingAreas[0])?.name || 'Cordate Area 1'}
          onBack={() => setScreen('farm-detail')}
          onOpenSettings={() => setScreen('ranging-task-settings')}
          onMarkTaskDone={(location, taskId) => setRangingTasksByBatch((current) => ({
            ...current,
            [location]: {
              ...(current[location] || {}),
              [taskId]: { completedAt: new Date().toISOString() },
            },
          }))}
          onMoveToCording={(record) => {
            const destination = record.destination || (cordingAreas.find((area) => area.count > 0) || cordingAreas[0])?.name || 'Cordate Area 1';
            const bird = {
              farmBuzzId: record.farmBuzzId,
              _recordKey: record.farmBuzzId,
              name: record.tpNumber,
              type: 'Stag',
              filter: 'stag',
              bloodline: record.bloodline,
              status: 'Cordate',
              location: destination,
              identificationType: 'TP Number',
              physicalId: record.tpNumber,
              image: CORDING_CARD_IMAGE,
              details: [{ icon: 'tag-outline', text: `TP Number: ${record.tpNumber}` }, { icon: 'dna', text: record.bloodline }, { icon: 'map-marker-outline', text: destination }],
              cordingEntry: { fromArea: record.location, destination, notes: record.notes, movedAt: new Date().toISOString() },
            };
            setCordingBirds((current) => [bird, ...current]);
            setAddedBirds((current) => [bird, ...current]);
            setCordingAreas((current) => current.some((area) => area.name === destination) ? current.map((area) => area.name === destination ? { ...area, count: area.count + 1 } : area) : [{ name: destination, count: 1 }, ...current]);
            setRangingTasksByBatch((current) => ({ ...current, [record.location]: { ...(current[record.location] || {}), [record.taskId]: { completedAt: new Date().toISOString() } } }));
            nextCordingBirdNumber.current += 1;
          }}
          onOpenBatch={(location) => {
            setSelectedRangingBatchId(location);
            setScreen('ranging-batch-detail');
          }}
        />
      ) : screen === 'ranging-settings' ? (
        <RangingSettingsScreen
          settings={rangingSettings}
          onBack={() => setScreen('ranging')}
          onOpenSelection={() => setScreen('ranging-selection-settings')}
          onOpenTasks={() => setScreen('ranging-task-settings')}
        />
      ) : screen === 'ranging-selection-settings' ? (
        <RangingSelectionSettingsScreen
          settings={rangingSettings}
          onBack={() => setScreen('ranging-settings')}
          onSave={(settings) => {
            setRangingSettings(settings);
            setScreen('ranging-settings');
          }}
        />
      ) : screen === 'ranging-task-settings' ? (
        <GrowingScheduleSettingsScreen
          variant="ranging"
          initialSettings={rangingSettings}
          onBack={() => setScreen('ranging')}
          onSave={setRangingSettings}
        />
      ) : screen === 'ranging-batch-detail' ? (
        <RangingAreaDetailScreen
          area={selectedRangingLocation}
          vaccine={rangingSettings.tasks.find((task) => task.enabled && /vaccine|health/i.test(task.name))}
          readyDay={rangingSettings.readyDay}
          vaccinationDone={Boolean(rangingTasksByBatch[selectedRangingBatchId]?.vaccination)}
          onBack={() => setScreen('ranging')}
          onRecordSelection={(selection) => {
            setRangingSelectionsByLocation((current) => {
              const previous = current[selectedRangingBatchId] || {};
              const events = [selection.ready > 0 && { date: selection.date, text: `${selection.ready} moved to ${selection.destination}` }, selection.removed > 0 && { date: selection.date, text: `${selection.removed} removed` }].filter(Boolean);
              const record = {
                allocations: { Proceed: selection.ready, Recheck: selection.remain, Remove: selection.removed },
                hardeningArea: selection.destination,
                moved: (previous.moved || 0) + selection.ready,
                removed: (previous.removed || 0) + selection.removed,
                date: selection.date,
                history: [...events, ...(previous.history || [])],
              };
              return { ...current, [selectedRangingBatchId]: record };
            });
            if (selection.ready > 0) {
              setStagAreas((current) => {
                const existing = current.find((area) => area.location === selection.destination);
                const sourceRows = selectedRangingLocation.sources || [];
                const sourceTotal = sourceRows.reduce((sum, source) => sum + (source.birds || 0), 0) || 1;
                let sourceAssigned = 0;
                const sources = sourceRows.map((source, index) => {
                  const birds = index === sourceRows.length - 1 ? selection.ready - sourceAssigned : Math.round(((source.birds || 0) / sourceTotal) * selection.ready);
                  sourceAssigned += birds;
                  return { marking: source.marking || 'No marking', name: source.cross || source.name, birds };
                });
                const event = { date: selection.date, text: `${selection.ready} stags entered from ${selectedRangingBatchId}` };
                if (existing) return current.map((area) => area.location === selection.destination ? { ...area, birds: area.birds + selection.ready, startingBirds: area.startingBirds + selection.ready, sources: [...area.sources, ...sources], history: [event, ...area.history] } : area);
                return [...current, { location: selection.destination, birds: selection.ready, startingBirds: selection.ready, movedForward: 0, removed: 0, ageRange: selectedRangingLocation.ageRange, status: 'Maintenance', nextTask: null, sources, history: [event] }];
              });
            }
            setScreen('ranging');
          }}
          onMoveBirds={(record) => {
            const movedBatch = { ...selectedRangingLocation.batches[0], id: `RG-MOVE-${Date.now()}`, birds: record.count, startingBirds: record.count, location: record.destination, rangingStartDate: new Date().toISOString(), sources: selectedRangingLocation.sources };
            setAddedRangingBatches((current) => [movedBatch, ...current]);
            setRangingLossesByBatch((current) => ({ ...current, [selectedRangingBatchId]: [{ id: `MOVE-${Date.now()}`, count: record.count, date: record.date, note: `Moved to ${record.destination}` }, ...(current[selectedRangingBatchId] || [])] }));
            setRangingSelectionsByLocation((current) => ({ ...current, [selectedRangingBatchId]: { ...(current[selectedRangingBatchId] || {}), history: [{ date: record.date, text: `${record.count} moved to ${record.destination}` }, ...(current[selectedRangingBatchId]?.history || [])] } }));
            setScreen('ranging');
          }}
          onRecordLoss={(record) => {
            setRangingLossesByBatch((current) => ({ ...current, [selectedRangingBatchId]: [{ id: `LOSS-${Date.now()}`, ...record }, ...(current[selectedRangingBatchId] || [])] }));
            setRangingSelectionsByLocation((current) => ({ ...current, [selectedRangingBatchId]: { ...(current[selectedRangingBatchId] || {}), history: [{ date: record.date, text: `${record.count} lost / adjusted${record.note ? ` - ${record.note}` : ''}` }, ...(current[selectedRangingBatchId]?.history || [])] } }));
            setScreen('ranging');
          }}
          onRecordVaccination={() => setRangingTasksByBatch((current) => ({ ...current, [selectedRangingBatchId]: { ...(current[selectedRangingBatchId] || {}), vaccination: true } }))}
          onChangeArea={(record) => {
            setRangingLocationsByBatch((current) => ({ ...current, ...Object.fromEntries((selectedRangingLocation?.batches || []).map((batch) => [batch.id, record.destination])) }));
            setRangingSelectionsByLocation((current) => { const existing = current[selectedRangingBatchId]; if (!existing) return current; const next = { ...current, [record.destination]: existing }; delete next[selectedRangingBatchId]; return next; });
            setRangingLossesByBatch((current) => { const existing = current[selectedRangingBatchId]; if (!existing) return current; const next = { ...current, [record.destination]: existing }; delete next[selectedRangingBatchId]; return next; });
            setSelectedRangingBatchId(record.destination);
            setScreen('ranging');
          }}
        />
      ) : screen === 'brooding' ? (
        <BroodingScreen
          farm={selectedFarm}
          addedBatches={addedBroodingBatches}
          lossRecordsByBatch={broodingLossesByBatch}
          vaccineCompletionsByBatch={vaccineCompletionsByBatch}
          vaccinationSchedule={broodingSettings.vaccinationSchedule}
          readyDay={broodingSettings.readyDay}
          onBack={() => setScreen('farm-detail')}
          onOpenSettings={() => setScreen('vaccination-schedule')}
          onMarkTaskDone={(batchId, taskId, details = {}) => setVaccineCompletionsByBatch((current) => ({
            ...current,
            [batchId]: {
              ...(current[batchId] || {}),
              [taskId]: { completedAt: new Date().toISOString(), ...details },
            },
          }))}
          onOpenBatch={(batchId) => {
            setSelectedBroodingBatchId(batchId);
            setScreen('brooding-batch-detail');
          }}
        />
      ) : screen === 'brooding-batch-detail' ? (
        <BroodingBatchDetailScreen
          batchId={selectedBroodingBatchId}
          batchOverride={addedBroodingBatches.find((batch) => batch.id === selectedBroodingBatchId)}
          lossRecords={broodingLossesByBatch[selectedBroodingBatchId] || []}
          vaccinationSchedule={broodingSettings.vaccinationSchedule}
          vaccineCompletions={vaccineCompletionsByBatch[selectedBroodingBatchId] || {}}
          readyDay={broodingSettings.readyDay}
          onBack={() => setScreen('brooding')}
          onSaveLoss={(record) => setBroodingLossesByBatch((current) => ({
            ...current,
            [selectedBroodingBatchId]: [record, ...(current[selectedBroodingBatchId] || [])],
          }))}
          onMarkVaccineCompleted={(vaccineId) => setVaccineCompletionsByBatch((current) => ({
            ...current,
            [selectedBroodingBatchId]: {
              ...(current[selectedBroodingBatchId] || {}),
              [vaccineId]: { completedAt: new Date().toISOString() },
            },
          }))}
        />
      ) : screen === 'vaccination-schedule' ? (
        <VaccinationScheduleScreen
          initialSettings={broodingSettings}
          onBack={() => setScreen('brooding')}
          onSave={setBroodingSettings}
        />
      ) : screen === 'showcase' ? (
        <ShowcaseScreen
          farmName={managementSettings.farmName}
          location={managementSettings.location}
          establishedYear={managementSettings.establishedYear}
          onOpenShowcase={() => {}}
          onOpenManagement={() => setScreen('dashboard')}
          onOpenProcess={() => setScreen('process')}
          onOpenSettings={() => {
            setSettingsReturn('showcase');
            setScreen('management-settings');
          }}
        />
      ) : screen === 'process' ? (
        <ProcessScreen
          farmName={managementSettings.farmName}
          location={managementSettings.location}
          establishedYear={managementSettings.establishedYear}
          onOpenShowcase={() => setScreen('showcase')}
          onOpenManagement={() => setScreen('dashboard')}
          onOpenProcess={() => {}}
          onOpenBreedingHatchery={() => setScreen('breeding-hatchery-process')}
          onOpenSettings={() => {
            setSettingsReturn('process');
            setScreen('management-settings');
          }}
        />
      ) : screen === 'breeding-hatchery-process' ? (
        <BreedingHatcheryProcessScreen
          farmName={managementSettings.farmName}
          location={managementSettings.location}
          establishedYear={managementSettings.establishedYear}
          onBack={() => setScreen('process')}
          onOpenShowcase={() => setScreen('showcase')}
          onOpenManagement={() => setScreen('dashboard')}
          onOpenProcess={() => setScreen('process')}
          onOpenSettings={() => {
            setSettingsReturn('breeding-hatchery-process');
            setScreen('management-settings');
          }}
        />
      ) : screen === 'management-settings' ? (
        <ManagementSettingsScreen
          initialSettings={managementSettings}
          onBack={() => setScreen(settingsReturn)}
          onSave={(settings) => {
            setManagementSettings(settings);
            setScreen(settingsReturn);
            Alert.alert('Settings saved', 'Management settings have been updated.');
          }}
        />
      ) : screen === 'flock' ? (
        <FlockScreen
          onBack={() => setScreen('dashboard')}
          onAddBird={() => setScreen('add-bird')}
          onOpenBird={(bird) => {
            setSelectedBird({
              ...bird,
              _recordKey: bird._recordKey || bird.farmBuzzId || bird.name,
            });
            setScreen('bird-detail');
          }}
          addedBirds={addedBirds}
          birdOverrides={birdOverrides}
        />
      ) : screen === 'bird-detail' ? (
        <BirdDetailScreen
          bird={selectedBird}
          onBack={() => setScreen('flock')}
          onEdit={() => setScreen('edit-bird')}
          onOpenPedigree={() => setScreen('pedigree-bloodline')}
          onOpenHealthCare={() => setScreen('bird-health-care')}
          onOpenAchievements={() => setScreen('bird-achievements')}
          onOpenBreeding={() => setScreen('bird-breeding')}
          onOpenLocation={() => setScreen('bird-location')}
          onOpenOwnership={() => setScreen('bird-ownership')}
          onOpenMedia={() => setScreen('bird-media')}
          onOpenNotes={() => setScreen('bird-notes')}
          onOpenDocuments={() => setScreen('bird-documents')}
        />
      ) : screen === 'pedigree-bloodline' ? (
        <PedigreeBloodlineScreen
          bird={selectedBird}
          onBack={() => setScreen('bird-detail')}
        />
      ) : screen === 'bird-health-care' ? (
        <BirdHealthCareScreen
          bird={selectedBird}
          records={healthRecords}
          weightRecords={selectedBird?.healthRecordsMode === 'empty' ? [] : weightsByBird[selectedBird?._recordKey || selectedBird?.farmBuzzId || selectedBird?.name] || DEFAULT_WEIGHT_RECORDS}
          recordOverrides={healthRecordOverrides}
          deletedRecordIds={deletedHealthRecordIds}
          onBack={() => setScreen('bird-detail')}
          onAddRecord={() => {
            setHealthRecordReturn('bird-health-care');
            setScreen('add-health-record');
          }}
          onOpenRecord={(record) => {
            setSelectedHealthRecord(record);
            setHealthDetailReturn('bird-health-care');
            setScreen('health-record-detail');
          }}
          onOpenHealthRecords={() => {
            setHealthRecordsBird(selectedBird);
            setHealthRecordsReturn('bird-health-care');
            setScreen('health-records');
          }}
          onOpenTreatments={() => {
            setTreatmentBird(selectedBird);
            setTreatmentReturn('bird-health-care');
            setScreen('active-treatments');
          }}
          onOpenVaccinations={() => {
            setVaccinationBird(selectedBird);
            setVaccinationReturn('bird-health-care');
            setScreen('vaccination-management');
          }}
          onOpenWeightHistory={() => setScreen('weight-history')}
        />
      ) : screen === 'bird-achievements' ? (
        <BirdAchievementsScreen
          bird={selectedBird}
          achievement={achievementsByBird[selectedBird?._recordKey || selectedBird?.farmBuzzId || selectedBird?.name]}
          onBack={() => setScreen('bird-detail')}
          onAchievementChange={(record) => {
            const recordKey = selectedBird?._recordKey || selectedBird?.farmBuzzId || selectedBird?.name;
            const nextDetails = [
              ...(selectedBird?.details || []).filter((detail) => !/win/i.test(detail.text || '')),
              { icon: 'trophy-outline', text: `${record.wins} win${record.wins === '1' ? '' : 's'}` },
            ];
            const updatedBird = { ...selectedBird, details: nextDetails, _recordKey: recordKey };
            setAchievementsByBird((current) => ({ ...current, [recordKey]: record }));
            setSelectedBird(updatedBird);
            setBirdOverrides((current) => ({ ...current, [recordKey]: updatedBird }));
          }}
        />
      ) : screen === 'weight-history' ? (
        <WeightHistoryScreen
          bird={selectedBird}
          records={weightsByBird[selectedBird?._recordKey || selectedBird?.farmBuzzId || selectedBird?.name] || DEFAULT_WEIGHT_RECORDS}
          onRecordsChange={(records) => {
            const recordKey = selectedBird?._recordKey || selectedBird?.farmBuzzId || selectedBird?.name;
            setWeightsByBird((current) => ({ ...current, [recordKey]: records }));
          }}
          onBack={() => setScreen('bird-health-care')}
        />
      ) : screen === 'health-records' ? (
        <HealthRecordsScreen
          records={healthRecords}
          recordOverrides={healthRecordOverrides}
          deletedRecordIds={deletedHealthRecordIds}
          bird={healthRecordsBird}
          onBack={() => setScreen(healthRecordsReturn)}
          onAddRecord={() => {
            setHealthRecordReturn('health-records');
            setScreen('add-health-record');
          }}
          onOpenRecord={(record) => {
            const birds = [...addedBirds, ...BIRDS].map((bird) => birdOverrides[bird._recordKey || bird.farmBuzzId || bird.name] || bird);
            setSelectedBird(birds.find((bird) => bird.name === record.name || bird._recordKey === record.birdId || bird.farmBuzzId === record.birdId) || null);
            setSelectedHealthRecord(record);
            setHealthDetailReturn('health-records');
            setScreen('health-record-detail');
          }}
        />
      ) : screen === 'health-record-detail' ? (
        <HealthRecordDetailScreen
          bird={selectedBird}
          record={selectedHealthRecord}
          onBack={() => setScreen(healthDetailReturn)}
          onEdit={() => setScreen('edit-health-record')}
          onResolve={() => updateHealthRecord({
            ...selectedHealthRecord,
            status: 'Resolved',
            followUp: false,
            reminder: false,
            needsAttention: false,
            resolvedDate: 'Sep 1, 2026',
          })}
          onDelete={() => {
            const recordId = selectedHealthRecord?.id;
            setHealthRecords((current) => current.filter((record) => record.id !== recordId));
            setDeletedHealthRecordIds((current) => current.includes(recordId) ? current : [...current, recordId]);
            setScreen(healthDetailReturn);
          }}
        />
      ) : screen === 'edit-health-record' ? (
        <AddHealthRecordScreen
          birds={[...addedBirds, ...BIRDS].map(
            (bird) => birdOverrides[bird._recordKey || bird.farmBuzzId || bird.name] || bird,
          )}
          initialBird={selectedBird}
          initialRecord={selectedHealthRecord}
          onBack={() => setScreen('health-record-detail')}
          onComplete={(record) => {
            updateHealthRecord(record);
            setScreen('health-record-detail');
          }}
        />
      ) : screen === 'bird-breeding' ? (
        <BirdBreedingScreen
          bird={selectedBird}
          addedPairings={addedPairings}
          eggRecords={eggRecordsByBird[selectedBird?._recordKey || selectedBird?.farmBuzzId || selectedBird?.name] || (selectedBird?.name === 'Ring #027' ? DEFAULT_EGG_RECORDS : [])}
          onEggRecordsChange={(records) => {
            const recordKey = selectedBird?._recordKey || selectedBird?.farmBuzzId || selectedBird?.name;
            setEggRecordsByBird((current) => ({ ...current, [recordKey]: records }));
          }}
          onBack={() => setScreen('bird-detail')}
          onOpenPairing={(pairing) => {
            setSelectedPairing(pairing);
            setPairingReturn('bird-breeding');
            setScreen('pairing-detail');
          }}
          onOpenOffspring={() => {
            setOffspringPairing(null);
            setOffspringReturn('bird-breeding');
            setScreen('offspring');
          }}
          onAddPairing={() => {
            setAddPairingReturn('bird-breeding');
            setScreen('add-pairing');
          }}
        />
      ) : screen === 'offspring' ? (
        <OffspringScreen
          bird={offspringPairing ? null : selectedBird}
          pairing={offspringPairing}
          onBack={() => setScreen(offspringReturn)}
        />
      ) : screen === 'bird-location' ? (
        <BirdLocationScreen
          bird={selectedBird}
          onBack={() => setScreen('bird-detail')}
          locations={farmLocations}
          onLocationsChange={setFarmLocations}
        />
      ) : screen === 'bird-ownership' ? (
        <BirdOwnershipScreen
          bird={selectedBird}
          ownership={ownershipByBird[selectedBird?._recordKey || selectedBird?.farmBuzzId || selectedBird?.name]}
          onOwnershipChange={(record) => {
            const recordKey = selectedBird?._recordKey || selectedBird?.farmBuzzId || selectedBird?.name;
            setOwnershipByBird((current) => ({ ...current, [recordKey]: record }));
          }}
          onBack={() => setScreen('bird-detail')}
        />
      ) : screen === 'bird-media' ? (
        <BirdMediaScreen
          bird={selectedBird}
          onBack={() => setScreen('bird-detail')}
        />
      ) : screen === 'bird-notes' ? (
        <BirdNotesScreen
          bird={selectedBird}
          notes={notesByBird[selectedBird?._recordKey || selectedBird?.farmBuzzId || selectedBird?.name]}
          onNotesChange={(records) => {
            const recordKey = selectedBird?._recordKey || selectedBird?.farmBuzzId || selectedBird?.name;
            setNotesByBird((current) => ({ ...current, [recordKey]: records }));
          }}
          onBack={() => setScreen('bird-detail')}
        />
      ) : screen === 'bird-documents' ? (
        <BirdDocumentsScreen
          bird={selectedBird}
          documents={documentsByBird[selectedBird?._recordKey || selectedBird?.farmBuzzId || selectedBird?.name]}
          onDocumentsChange={(records) => {
            const recordKey = selectedBird?._recordKey || selectedBird?.farmBuzzId || selectedBird?.name;
            setDocumentsByBird((current) => ({ ...current, [recordKey]: records }));
          }}
          onBack={() => setScreen('bird-detail')}
        />
      ) : screen === 'edit-bird' ? (
        <AddBirdScreen
          initialBird={selectedBird}
          onBack={() => setScreen('bird-detail')}
          onComplete={(bird) => {
            const recordKey = selectedBird._recordKey || selectedBird.farmBuzzId || selectedBird.name;
            const updatedBird = { ...bird, _recordKey: recordKey };
            setBirdOverrides((current) => ({ ...current, [recordKey]: updatedBird }));
            setSelectedBird(updatedBird);
            setScreen('bird-detail');
          }}
        />
      ) : screen === 'add-bird' ? (
        <AddBirdScreen
          onBack={() => setScreen('flock')}
          onComplete={(bird) => {
            setAddedBirds((current) => [bird, ...current]);
            setScreen('flock');
          }}
        />
      ) : screen === 'breeding' ? (
        <BreedingScreen
          onBack={() => setScreen(selectedFarm ? 'farm-detail' : 'dashboard')}
          onAddPairing={() => {
            setAddPairingReturn('breeding');
            setScreen('add-pairing');
          }}
          onOpenPairing={(pairing) => {
            setSelectedPairing(pairing);
            setPairingReturn('breeding');
            setScreen('pairing-detail');
          }}
          addedPairings={addedPairings}
          eggCollectionsByPairing={eggCollectionsByPairing}
        />
      ) : screen === 'pairing-detail' ? (
        <PairingDetailScreen
          pairing={selectedPairing}
          collections={eggCollectionsByPairing[selectedPairing?.id] || []}
          onCollectionsChange={(collections) => {
            if (!selectedPairing?.id) return;
            setEggCollectionsByPairing((current) => ({ ...current, [selectedPairing.id]: collections }));
          }}
          onBack={() => setScreen(pairingReturn)}
          onOpenOffspring={() => {
            setOffspringPairing(selectedPairing);
            setOffspringReturn('pairing-detail');
            setScreen('offspring');
          }}
        />
      ) : screen === 'add-pairing' ? (
        <AddPairingScreen
          birds={[...addedBirds, ...BIRDS].map(
            (bird) => birdOverrides[bird._recordKey || bird.farmBuzzId || bird.name] || bird,
          )}
          initialBird={addPairingReturn === 'bird-breeding' ? selectedBird : null}
          onBack={() => setScreen(addPairingReturn)}
          onComplete={(pairing) => {
            setAddedPairings((current) => [pairing, ...current]);
            setScreen(addPairingReturn);
          }}
        />
      ) : screen === 'active-treatments' ? (
        <ActiveTreatmentsScreen
          treatments={treatments}
          healthRecords={healthRecords}
          bird={treatmentBird}
          onTreatmentsChange={setTreatments}
          onBack={() => setScreen(treatmentReturn)}
          onAddTreatment={() => {
            setHealthRecordReturn('active-treatments');
            setScreen('add-health-record');
          }}
        />
      ) : screen === 'needs-attention' ? (
        <NeedsAttentionScreen
          healthRecords={healthRecords}
          onBack={() => setScreen(attentionReturn)}
          onOpenHealthCare={() => setScreen('health-care')}
          onOpenTasks={() => setScreen('tasks')}
          onOpenIncubation={() => setScreen('eggs-incubation')}
        />
      ) : screen === 'health-care' ? (
        <HealthCareScreen
          onBack={() => setScreen('dashboard')}
          onAddHealthRecord={() => {
            setHealthRecordReturn('health-care');
            setScreen('add-health-record');
          }}
          onOpenVaccinations={() => {
            setVaccinationBird(null);
            setVaccinationReturn('health-care');
            setScreen('vaccination-management');
          }}
          onOpenHealthRecords={() => {
            setHealthRecordsBird(null);
            setHealthRecordsReturn('health-care');
            setScreen('health-records');
          }}
          onOpenTreatments={() => {
            setTreatmentBird(null);
            setTreatmentReturn('health-care');
            setScreen('active-treatments');
          }}
          onOpenNeedsAttention={() => {
            setAttentionReturn('health-care');
            setScreen('needs-attention');
          }}
          addedHealthRecords={healthRecords}
        />
      ) : screen === 'vaccination-management' ? (
        <VaccinationManagementScreen
          vaccinations={vaccinations}
          addedHealthRecords={healthRecords}
          initialBird={vaccinationBird}
          onVaccinationsChange={setVaccinations}
          onBack={() => setScreen(vaccinationReturn)}
          onRecordVaccination={() => {
            setHealthRecordReturn('vaccination-management');
            setScreen('add-health-record');
          }}
        />
      ) : screen === 'add-health-record' ? (
        <AddHealthRecordScreen
          birds={[...addedBirds, ...BIRDS].map(
            (bird) => birdOverrides[bird._recordKey || bird.farmBuzzId || bird.name] || bird,
          )}
          initialBird={healthRecordReturn === 'bird-health-care' ? selectedBird : healthRecordReturn === 'vaccination-management' ? vaccinationBird : healthRecordReturn === 'active-treatments' ? treatmentBird : healthRecordReturn === 'health-records' ? healthRecordsBird : null}
          initialType={healthRecordReturn === 'vaccination-management' ? 'Vaccination' : healthRecordReturn === 'active-treatments' ? 'Treatment' : 'Health Check'}
          onBack={() => setScreen(healthRecordReturn)}
          onComplete={(record) => {
            setHealthRecords((current) => [record, ...current]);
            setScreen(healthRecordReturn);
          }}
        />
      ) : screen === 'eggs-incubation' ? (
        <EggsIncubationScreen
          onBack={() => setScreen(selectedFarm ? 'farm-detail' : 'dashboard')}
          onOpenEggHolding={() => setScreen('egg-holding')}
          onCreateBatch={() => openCreateBatch('eggs-incubation')}
          onOpenHistory={() => setScreen('incubation-history')}
          onOpenBatch={(batchId) => {
            setSelectedBatchId(batchId);
            setScreen('incubation-batch-detail');
          }}
        />
      ) : screen === 'incubation-history' ? (
        <IncubationHistoryScreen onBack={() => setScreen('eggs-incubation')} />
      ) : screen === 'egg-holding' ? (
        <EggHoldingScreen
          onBack={() => setScreen('eggs-incubation')}
          onCreateBatch={() => openCreateBatch('egg-holding')}
        />
      ) : screen === 'create-batch' ? (
        <CreateBatchScreen
          onBack={() => setScreen(createBatchReturn)}
          onComplete={() => setScreen('eggs-incubation')}
        />
      ) : screen === 'incubation-batch-detail' ? (
        <IncubationBatchDetailScreen
          batchId={selectedBatchId}
          candlingResults={candlingResultsByBatch[selectedBatchId]}
          hatchResults={hatchResultsByBatch[selectedBatchId]}
          onBack={() => setScreen('eggs-incubation')}
          onOpenCandling={() => setScreen('candling')}
          onOpenHatch={() => setScreen('record-hatch')}
        />
      ) : screen === 'candling' ? (
        <CandlingScreen
          batchId={selectedBatchId}
          initialResults={candlingResultsByBatch[selectedBatchId]}
          onBack={() => setScreen('incubation-batch-detail')}
          onSave={(results) => {
            setCandlingResultsByBatch((current) => ({ ...current, [selectedBatchId]: results }));
            setScreen('incubation-batch-detail');
          }}
        />
      ) : screen === 'record-hatch' ? (
        <RecordHatchScreen
          batchId={selectedBatchId}
          activeEggCount={(INCUBATION_BATCHES.find((batch) => batch.id === selectedBatchId)?.eggCount || 0) - (candlingResultsByBatch[selectedBatchId]?.rejected || 0)}
          initialResult={hatchResultsByBatch[selectedBatchId]}
          onBack={() => setScreen('incubation-batch-detail')}
          onSave={(result) => {
            setHatchResultsByBatch((current) => ({ ...current, [selectedBatchId]: result }));
            setScreen('incubation-batch-detail');
          }}
        />
      ) : screen === 'tasks' ? (
        <TasksScreen
          onBack={() => setScreen('dashboard')}
          onAddTask={() => {
            setAddTaskReturn('tasks');
            setScreen('add-task');
          }}
          onOpenTask={(task) => {
            setSelectedTask(task);
            setScreen('task-detail');
          }}
          addedTasks={addedTasks}
          taskOverrides={taskOverrides}
        />
      ) : screen === 'task-detail' ? (
        <TaskDetailScreen
          task={selectedTask}
          members={teamMembers}
          onBack={() => setScreen('tasks')}
          onEdit={() => setScreen('edit-task')}
          onUpdate={(task) => {
            setTaskOverrides((current) => ({ ...current, [task.id]: task }));
            setSelectedTask(task);
          }}
        />
      ) : screen === 'edit-task' ? (
        <AddTaskScreen
          members={teamMembers}
          initialTask={selectedTask}
          onBack={() => setScreen('task-detail')}
          onComplete={(task) => {
            setTaskOverrides((current) => ({ ...current, [task.id]: task }));
            setSelectedTask(task);
            setScreen('task-detail');
          }}
        />
      ) : screen === 'add-task' ? (
        <AddTaskScreen
          members={teamMembers}
          onBack={() => setScreen(addTaskReturn)}
          onComplete={(task) => {
            setAddedTasks((current) => [task, ...current]);
            setScreen(addTaskReturn);
          }}
        />
      ) : screen === 'team' ? (
        <TeamScreen
          onBack={() => setScreen('dashboard')}
          onAddMember={() => setScreen('add-team-member')}
          onOpenMember={(member) => {
            setSelectedMember(member);
            setMemberReturn('team');
            setScreen('team-member-detail');
          }}
          members={teamMembers}
        />
      ) : screen === 'team-member-detail' ? (
        <TeamMemberDetailScreen
          member={selectedMember}
          onBack={() => setScreen(memberReturn)}
          onEditAccess={() => setScreen('edit-member-access')}
        />
      ) : screen === 'edit-member-access' ? (
        <EditMemberAccessScreen
          member={selectedMember}
          onBack={() => setScreen('team-member-detail')}
          onSave={(member) => {
            setMemberOverrides((current) => ({ ...current, [member.id]: member }));
            setSelectedMember(member);
            setScreen('team-member-detail');
            Alert.alert('Access updated', `${member.name}'s role and permissions have been saved.`);
          }}
        />
      ) : screen === 'add-team-member' ? (
        <AddTeamMemberScreen
          onBack={() => setScreen('team')}
          onComplete={(member) => {
            setAddedMembers((current) => [member, ...current]);
            setSelectedMember(member);
            setMemberReturn('team');
            setScreen('team-member-detail');
          }}
        />
      ) : screen === 'sales' ? (
        <SalesScreen
          onBack={() => setScreen('dashboard')}
          onOpenPurchase={() => setScreen('chicken-purchase')}
          birds={flockBirds}
          ownershipByBird={ownershipByBird}
          purchaseOrders={purchaseOrders}
        />
      ) : screen === 'chicken-purchase' ? (
        <ChickenPurchaseScreen
          birds={flockBirds}
          onBack={() => setScreen('sales')}
          onComplete={(order) => {
            setPurchaseOrders((current) => [order, ...current]);
            if (order.releaseType === 'immediate') {
              const existing = ownershipByBird[order.birdKey];
              const priceValue = Number(String(order.price || '').replace(/[^\d]/g, '')) || 0;
              setOwnershipByBird((current) => ({
                ...current,
                [order.birdKey]: {
                  ...existing,
                  owner: order.buyerName,
                  ownerType: 'Buyer',
                  contact: order.buyerContact,
                  since: order.createdAt,
                  acquiredBy: 'Sold',
                  status: 'Sold and transferred',
                  history: [
                    {
                      id: `ownership-${Date.now()}`,
                      from: 'JU Gamefarm',
                      to: order.buyerName,
                      type: 'Sold',
                      price: priceValue ? String(priceValue) : order.price,
                      date: order.createdAt,
                      detail: order.notes || `${order.bird.name} was released to ${order.buyerName}.`,
                    },
                    ...(existing?.history || []),
                  ],
                },
              }));
            }
            setScreen('sales');
            Alert.alert(
              order.releaseType === 'immediate' ? 'Sale confirmed' : 'Reservation saved',
              order.releaseType === 'immediate'
                ? `${order.bird.name} is ready for immediate release to ${order.buyerName}.`
                : `${order.bird.name} is reserved for ${order.buyerName} before ${order.readyWindow}.`,
            );
          }}
        />
      ) : (
        <Dashboard
          farmName={managementSettings.farmName}
          location={managementSettings.location}
          establishedYear={managementSettings.establishedYear}
          totalWins={totalWins}
          onOpenShowcase={() => setScreen('showcase')}
          onOpenProcess={() => setScreen('process')}
          onOpenSettings={() => {
            setSettingsReturn('dashboard');
            setScreen('management-settings');
          }}
          onOpenNeedsAttention={() => {
            setAttentionReturn('dashboard');
            setScreen('needs-attention');
          }}
          onOpenFlock={() => setScreen('flock')}
          onOpenBreeding={() => {
            setSelectedFarm(null);
            setScreen('breeding');
          }}
          onOpenHealthCare={() => setScreen('health-care')}
          onOpenEggsIncubation={() => setScreen('eggs-incubation')}
          onOpenTasks={() => setScreen('tasks')}
          onOpenTeam={() => setScreen('team')}
          onOpenSales={() => setScreen('sales')}
        />
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#020709' },
  showcaseScrollContent: { flexGrow: 1, alignItems: 'center', backgroundColor: '#020709' },
  showcaseImage: { width: '100%', aspectRatio: 0.52, backgroundColor: '#061014' },
  scrollContent: { flexGrow: 1, alignItems: 'center', backgroundColor: '#020709' },
  page: { width: '100%', maxWidth: 720, backgroundColor: '#020709' },
  hero: { height: 272, overflow: 'hidden', backgroundColor: '#11191b' },
  heroCompact: { height: 248 },
  heroNarrow: { height: 230 },
  heroSafeArea: { flex: 1 },
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 13,
    paddingTop: Platform.OS === 'web' ? 14 : 4,
  },
  topBarNarrow: { paddingHorizontal: 10, paddingTop: Platform.OS === 'web' ? 10 : 3 },
  topBarSpacer: { width: 40, height: 40 },
  iconButton: {
    width: 40, height: 40, borderRadius: 20, borderWidth: 1,
    borderColor: 'rgba(190, 204, 208, 0.36)', backgroundColor: 'rgba(2, 8, 11, 0.62)',
    alignItems: 'center', justifyContent: 'center',
  },
  iconButtonCompact: { width: 34, height: 34, borderRadius: 17 },
  pressed: { opacity: 0.72 },
  heroCopy: { marginTop: 'auto', paddingHorizontal: 14, paddingBottom: 24, maxWidth: 535 },
  heroCopyCompact: { paddingBottom: 20 },
  heroCopyNarrow: { paddingHorizontal: 11, paddingBottom: 16 },
  blankIncubationHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingTop: Platform.OS === 'web' ? 10 : 3,
  },
  blankIncubationHeaderBetween: { justifyContent: 'space-between' },
  blankIncubationHeaderLeft: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 10 },
  blankIncubationScreenTitle: { color: '#f0f2f3', fontSize: 17, fontWeight: '700', letterSpacing: 0 },
  blankIncubationHeroCopy: { marginTop: 'auto', paddingHorizontal: 18, paddingBottom: 24 },
  blankIncubationHeroCopyNarrow: { paddingHorizontal: 12, paddingBottom: 18 },
  blankIncubationFarmName: {
    color: '#f5f6f6', fontSize: 34, lineHeight: 40, fontWeight: '800', letterSpacing: 0,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', web: 'Georgia' }),
    textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 5,
  },
  blankIncubationFarmNameNarrow: { fontSize: 29, lineHeight: 34 },
  blankIncubationTagline: { marginTop: 6, color: '#bac1c3', fontSize: 14, lineHeight: 20, letterSpacing: 0 },
  blankIncubationMeta: { marginTop: 16, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 10 },
  blankIncubationMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  blankIncubationMetaText: { color: '#b8c0c2', fontSize: 12, letterSpacing: 0 },
  blankIncubationMetaDivider: { width: 1, height: 14, backgroundColor: '#6d777a' },
  blankIncubationContent: { paddingHorizontal: 10, paddingBottom: 18 },
  blankIncubationContentNarrow: { paddingHorizontal: 8 },
  blankIncubationActionRow: { flexDirection: 'row', gap: 10 },
  blankIncubationActionRowCompact: { gap: 8 },
  blankIncubationSearchBox: {
    flex: 1, height: 52, flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, borderColor: '#28343a',
    backgroundColor: '#0b1418',
  },
  blankIncubationSearchInput: {
    flex: 1, height: 50, paddingVertical: 0, color: '#e7ebec', fontSize: 14,
    letterSpacing: 0, outlineStyle: 'none',
  },
  blankIncubationAddButton: {
    height: 52, minWidth: 103, paddingHorizontal: 12, borderRadius: 8,
    backgroundColor: '#f66f00', flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 7,
  },
  blankIncubationAddButtonCompact: { minWidth: 96, paddingHorizontal: 10 },
  blankIncubationAddButtonText: { color: '#ffffff', fontSize: 11, fontWeight: '800', letterSpacing: 0 },
  blankIncubationListHeading: {
    marginTop: 20, marginBottom: 9, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between',
  },
  blankIncubationEyebrow: { color: '#899397', fontSize: 10, fontWeight: '600', letterSpacing: 0 },
  blankIncubationListTitle: { marginTop: 4, color: '#edf1f2', fontSize: 17, fontWeight: '800', letterSpacing: 0 },
  blankIncubationBatchCount: { color: '#8e9a9e', fontSize: 10, fontWeight: '700' },
  blankIncubationBatchList: { gap: 9 },
  blankIncubationBatchCard: {
    borderRadius: 7, borderWidth: 1, borderColor: '#223138', backgroundColor: '#091317', padding: 13,
  },
  blankIncubationBatchHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  blankIncubationBatchIdentity: { minWidth: 0, flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  blankIncubationBatchIcon: {
    width: 40, height: 40, borderRadius: 7, backgroundColor: 'rgba(255, 122, 0, 0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  blankIncubationBatchName: { color: '#eef2f3', fontSize: 13, fontWeight: '800', letterSpacing: 0 },
  blankIncubationBatchId: { marginTop: 3, color: '#758287', fontSize: 9, letterSpacing: 0 },
  blankIncubationChickenCount: { alignItems: 'flex-end' },
  blankIncubationChickenCountValue: { color: '#ffffff', fontSize: 18, lineHeight: 20, fontWeight: '800' },
  blankIncubationChickenCountLabel: { marginTop: 2, color: '#78868b', fontSize: 8 },
  blankIncubationFamilyTree: {
    marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#1b2a30',
    flexDirection: 'row', alignItems: 'center', minHeight: 178,
  },
  blankIncubationFamilyNode: {
    flex: 1, minWidth: 0, minHeight: 48, borderRadius: 7, borderWidth: 1,
    borderColor: '#293a40', backgroundColor: '#0d191e', paddingHorizontal: 10, paddingVertical: 8,
    justifyContent: 'center',
  },
  blankIncubationSireNode: { maxWidth: '36%', borderColor: 'rgba(255, 122, 0, 0.45)' },
  blankIncubationTreeConnector: { width: 30, height: 158, position: 'relative' },
  blankIncubationTreeStem: {
    position: 'absolute', left: 0, right: 0, top: '50%', height: 1, backgroundColor: '#526168',
  },
  blankIncubationTreeTrunk: {
    position: 'absolute', right: 0, top: 24, bottom: 24, width: 1, backgroundColor: '#526168',
  },
  blankIncubationDamList: { flex: 1, gap: 7 },
  blankIncubationDamBranch: { flexDirection: 'row', alignItems: 'center' },
  blankIncubationDamBranchLine: { width: 12, height: 1, backgroundColor: '#526168' },
  blankIncubationLineageLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  blankIncubationLineageLabel: { color: '#77858a', fontSize: 8, fontWeight: '800', letterSpacing: 0 },
  blankIncubationLineageValue: { marginTop: 5, color: '#e5eaeb', fontSize: 12, fontWeight: '700', letterSpacing: 0 },
  blankIncubationNextTask: {
    minHeight: 88, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#293a40',
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  blankIncubationTaskDate: {
    width: 44, height: 50, borderRadius: 6, borderWidth: 1, borderColor: '#8f500d',
    backgroundColor: 'rgba(255, 122, 0, 0.08)', alignItems: 'center', justifyContent: 'center',
  },
  blankIncubationTaskMonth: { color: THEME_ORANGE, fontSize: 7, lineHeight: 9, fontWeight: '800' },
  blankIncubationTaskDay: { marginTop: 2, color: '#ffffff', fontSize: 17, lineHeight: 18, fontWeight: '800' },
  blankIncubationTaskCopy: { flex: 1, minWidth: 0 },
  blankIncubationTaskTitle: { color: '#eef2f3', fontSize: 12, fontWeight: '800', letterSpacing: 0 },
  blankIncubationTaskTiming: { marginTop: 6, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 4 },
  blankIncubationTaskDetail: { flexShrink: 1, color: THEME_ORANGE, fontSize: 9, fontWeight: '700', letterSpacing: 0 },
  blankIncubationTaskButton: {
    height: 38, minWidth: 116, borderRadius: 6, backgroundColor: THEME_ORANGE,
    paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
  },
  blankIncubationTaskButtonText: { color: '#ffffff', fontSize: 9, fontWeight: '800', letterSpacing: 0 },
  blankIncubationModalBackdrop: {
    flex: 1, paddingHorizontal: 16, backgroundColor: 'rgba(0, 4, 6, 0.84)',
    alignItems: 'center', justifyContent: 'center',
  },
  blankIncubationCandlingModal: {
    width: '100%', maxWidth: 430, borderRadius: 8, borderWidth: 1,
    borderColor: '#2c3d44', backgroundColor: '#071216', padding: 16,
  },
  blankIncubationModalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  blankIncubationModalEyebrow: { color: THEME_ORANGE, fontSize: 8, fontWeight: '800', letterSpacing: 0 },
  blankIncubationModalTitle: { marginTop: 5, color: '#ffffff', fontSize: 21, fontWeight: '800', letterSpacing: 0 },
  blankIncubationModalClose: {
    width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: '#44535a',
    alignItems: 'center', justifyContent: 'center',
  },
  blankIncubationModalBatch: {
    minHeight: 45, marginTop: 16, borderRadius: 6, backgroundColor: '#0d1a1f',
    paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10,
  },
  blankIncubationModalBatchName: { flex: 1, color: THEME_ORANGE, fontSize: 11, fontWeight: '800' },
  blankIncubationModalBatchCount: { color: '#9ba7aa', fontSize: 9 },
  blankIncubationCandlingSummary: {
    minHeight: 72, marginTop: 12, borderRadius: 7, borderWidth: 1, borderColor: '#263940',
    backgroundColor: '#091519', flexDirection: 'row', alignItems: 'center',
  },
  blankIncubationCandlingMetric: { flex: 1, alignItems: 'center' },
  blankIncubationCandlingValue: { color: '#ffffff', fontSize: 18, fontWeight: '800' },
  blankIncubationCandlingLabel: { marginTop: 4, color: '#7f8c91', fontSize: 8 },
  blankIncubationCandlingDivider: { width: 1, height: 36, backgroundColor: '#263940' },
  blankIncubationCounterList: {
    marginTop: 12, borderRadius: 8, borderWidth: 1, borderColor: '#263940',
    backgroundColor: '#081216', overflow: 'hidden',
  },
  blankIncubationCounterRow: {
    minHeight: 72, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#1b292f',
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  blankIncubationCounterRowLast: { borderBottomWidth: 0 },
  blankIncubationCounterCopy: { flex: 1, minWidth: 0 },
  blankIncubationCounterTitle: { color: '#e8ebec', fontSize: 13, fontWeight: '700' },
  blankIncubationCounterDetail: { marginTop: 3, color: '#7f8a8e', fontSize: 9 },
  blankIncubationCounterStepper: {
    height: 38, borderRadius: 7, borderWidth: 1, borderColor: '#304047',
    backgroundColor: '#081115', flexDirection: 'row', alignItems: 'center', overflow: 'hidden',
  },
  blankIncubationCounterButton: { width: 37, height: 38, alignItems: 'center', justifyContent: 'center' },
  blankIncubationCounterValue: { minWidth: 36, color: '#f1f3f3', fontSize: 15, fontWeight: '800', textAlign: 'center' },
  blankIncubationModalActions: { marginTop: 16, flexDirection: 'row', gap: 8 },
  blankIncubationModalCancel: {
    flex: 1, height: 44, borderRadius: 7, borderWidth: 1, borderColor: '#304249',
    alignItems: 'center', justifyContent: 'center',
  },
  blankIncubationModalCancelText: { color: '#e4e9ea', fontSize: 10, fontWeight: '700' },
  blankIncubationModalSave: {
    flex: 1.4, height: 44, borderRadius: 7, backgroundColor: THEME_ORANGE,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  blankIncubationModalSaveText: { color: '#ffffff', fontSize: 10, fontWeight: '800' },
  blankIncubationEmptyText: { paddingVertical: 28, color: '#748187', fontSize: 11, textAlign: 'center' },
  batchSetupHero: { height: 242, overflow: 'hidden', backgroundColor: '#101719' },
  batchSetupHeroCompact: { height: 224 },
  batchSetupHeroCopy: { marginTop: 'auto', paddingHorizontal: 18, paddingBottom: 22 },
  batchSetupForm: { paddingHorizontal: 14, paddingTop: 18, paddingBottom: 32 },
  batchSetupFormCompact: { paddingHorizontal: 10 },
  batchSetupTitle: { marginTop: 5, color: '#edf1f2', fontSize: 20, fontWeight: '800', letterSpacing: 0 },
  batchSetupDescription: { marginTop: 6, color: '#89969a', fontSize: 12, lineHeight: 18, letterSpacing: 0 },
  batchSetupDetailsSection: { marginTop: 20, gap: 9 },
  batchSetupDetailsRow: { flexDirection: 'row', gap: 9 },
  batchSetupTextField: { flex: 1, minWidth: 0, gap: 6 },
  batchSetupInputShell: {
    height: 48, borderRadius: 7, borderWidth: 1, borderColor: '#283940', backgroundColor: '#0b161a',
    paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  batchSetupTextInput: {
    flex: 1, minWidth: 0, height: 46, paddingVertical: 0, color: '#e8eced', fontSize: 12,
    letterSpacing: 0, outlineStyle: 'none',
  },
  batchSetupInputSuffix: { color: '#78868b', fontSize: 9 },
  batchSetupCountRow: { marginTop: 18, flexDirection: 'row', gap: 9 },
  batchSetupCountCard: {
    flex: 1, minWidth: 0, minHeight: 78, borderRadius: 7, borderWidth: 1,
    borderColor: '#27373d', backgroundColor: '#0a1519', padding: 11, gap: 10,
  },
  batchSetupCountLabel: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  batchSetupCountTitle: { color: '#dfe5e7', fontSize: 11, fontWeight: '700' },
  batchSetupStepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  batchSetupStepButton: {
    width: 30, height: 30, borderRadius: 6, borderWidth: 1, borderColor: '#304047',
    backgroundColor: '#111e23', alignItems: 'center', justifyContent: 'center',
  },
  batchSetupCountValue: { color: '#ffffff', fontSize: 18, fontWeight: '800' },
  batchSetupSectionTitle: { color: '#e7ebec', fontSize: 14, fontWeight: '800', letterSpacing: 0 },
  batchSetupField: { width: '100%', gap: 5 },
  batchSetupFieldLabel: { color: '#8d999d', fontSize: 9, fontWeight: '700', letterSpacing: 0 },
  batchSetupSelect: {
    minHeight: 58, borderRadius: 7, borderWidth: 1, borderColor: '#283940', backgroundColor: '#0b161a',
    paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 9,
  },
  batchSetupSelectOpen: { borderColor: 'rgba(255, 122, 0, 0.65)' },
  batchSetupSelectCopy: { flex: 1, minWidth: 0 },
  batchSetupSelectLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  batchSetupSelectLabel: { color: '#819095', fontSize: 8, fontWeight: '800', letterSpacing: 0 },
  batchSetupSelectValue: { marginTop: 5, color: '#eef2f3', fontSize: 12, fontWeight: '800' },
  batchSetupOptions: {
    borderRadius: 7, borderWidth: 1, borderColor: '#2a3a40', backgroundColor: '#0d181d', overflow: 'hidden',
  },
  batchSetupOption: {
    minHeight: 40, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#1d2b30',
  },
  batchSetupOptionText: { color: '#a4b0b4', fontSize: 11 },
  batchSetupOptionTextActive: { color: '#ffffff', fontWeight: '800' },
  batchSetupTreeSection: { marginTop: 22 },
  batchSetupTreeHint: { marginTop: 4, color: '#758388', fontSize: 10, lineHeight: 15 },
  batchSetupTreeEditor: {
    marginTop: 12, minHeight: 200, borderRadius: 7, borderWidth: 1, borderColor: '#22343b',
    backgroundColor: '#071115', paddingVertical: 14, paddingHorizontal: 10,
    flexDirection: 'row', alignItems: 'center', overflow: 'visible',
  },
  batchSetupSireList: { flex: 1, minWidth: 0, gap: 8, justifyContent: 'center' },
  batchSetupSireBranch: { flexDirection: 'row', alignItems: 'center' },
  batchSetupSireNode: { flex: 1, minWidth: 0 },
  batchSetupTreeConnector: { width: 26, minHeight: 174, alignSelf: 'stretch', position: 'relative' },
  batchSetupTreeStem: {
    position: 'absolute', left: 0, right: 0, top: '50%', height: 1, backgroundColor: '#526168',
  },
  batchSetupTreeTrunk: {
    position: 'absolute', right: 0, top: 30, bottom: 30, width: 1, backgroundColor: '#526168',
  },
  batchSetupDamList: { flex: 1.35, minWidth: 0, gap: 8, justifyContent: 'center' },
  batchSetupDamBranch: { flexDirection: 'row', alignItems: 'center' },
  batchSetupDamNode: { flex: 1, minWidth: 0 },
  batchSetupNodeLine: { width: 10, height: 1, backgroundColor: '#526168' },
  batchSetupSireNodeSelect: { borderColor: 'rgba(255, 122, 0, 0.72)' },
  batchSetupSaveButton: {
    minHeight: 50, marginTop: 14, borderRadius: 8, backgroundColor: THEME_ORANGE,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingHorizontal: 14,
  },
  batchSetupSaveText: { color: '#ffffff', fontSize: 13, lineHeight: 18, fontWeight: '800' },
  heroEyebrow: { marginBottom: 5, color: THEME_ORANGE, fontSize: 9, fontWeight: '800', letterSpacing: 0 },
  brand: {
    color: '#f5f4f0', fontSize: 38, lineHeight: 44, fontWeight: '800',
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', web: 'Georgia' }),
    letterSpacing: 0, textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 6,
  },
  brandCompact: { fontSize: 33, lineHeight: 39 },
  brandNarrow: { fontSize: 29, lineHeight: 34 },
  tagline: {
    marginTop: 6, color: '#b8bec1', fontSize: 13, lineHeight: 19,
    letterSpacing: 0, maxWidth: 490,
  },
  taglineNarrow: { fontSize: 11, lineHeight: 16, marginTop: 5 },
  landingSafeArea: { flex: 1, justifyContent: 'flex-end' },
  landingContent: { width: '100%', maxWidth: 720, alignSelf: 'center', paddingHorizontal: 18, paddingBottom: 38 },
  landingContentCompact: { paddingHorizontal: 14, paddingBottom: 28 },
  landingTitle: {
    color: '#f5f4f0', fontSize: 38, lineHeight: 44, fontWeight: '800',
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', web: 'Georgia' }),
    letterSpacing: 0, textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 6,
  },
  landingTitleCompact: { fontSize: 34, lineHeight: 40 },
  landingTitleNarrow: { fontSize: 30, lineHeight: 35 },
  landingSubtitle: { marginTop: 7, color: '#c4cbcd', fontSize: 13, lineHeight: 19, maxWidth: 390 },
  landingSubtitleNarrow: { fontSize: 11, lineHeight: 16 },
  landingActions: { marginTop: 20, gap: 10 },
  landingPrimaryButton: {
    minHeight: 48, borderRadius: 8, backgroundColor: THEME_ORANGE,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingHorizontal: 16,
  },
  landingSecondaryButton: {
    minHeight: 48, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255, 122, 0, 0.55)',
    backgroundColor: 'rgba(4, 10, 13, 0.76)', flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 16,
  },
  landingPrimaryText: { color: '#ffffff', fontSize: 14, lineHeight: 18, fontWeight: '800' },
  landingSecondaryText: { color: '#f2f5f6', fontSize: 14, lineHeight: 18, fontWeight: '800' },
  farmsPage: { width: '100%', maxWidth: 720, minHeight: '100%', backgroundColor: '#020709' },
  farmsHero: { height: 252, overflow: 'hidden', backgroundColor: '#101719' },
  farmsHeroCompact: { height: 235 },
  farmsHeroCopy: { marginTop: 'auto', paddingHorizontal: 18, paddingBottom: 24 },
  farmsHeroCopyNarrow: { paddingHorizontal: 12, paddingBottom: 18 },
  farmsTitle: {
    color: '#f5f4f0', fontSize: 38, lineHeight: 44, fontWeight: '800',
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', web: 'Georgia' }),
    letterSpacing: 0, textShadowColor: 'rgba(0, 0, 0, 0.78)',
    textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 6,
  },
  farmsTitleNarrow: { fontSize: 30, lineHeight: 35 },
  farmsSubtitle: { marginTop: 7, color: '#c4cbcd', fontSize: 13, lineHeight: 19, maxWidth: 390 },
  farmsSubtitleNarrow: { fontSize: 11, lineHeight: 16 },
  farmsContent: { paddingHorizontal: 10, paddingBottom: 34 },
  farmsActionRow: { flexDirection: 'row', gap: 10, marginTop: 0 },
  farmsActionRowCompact: { gap: 8 },
  farmsSearchBox: {
    flex: 1, height: 52, flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, borderColor: '#28343a',
    backgroundColor: '#0b1418',
  },
  farmsSearchInput: {
    flex: 1, height: 50, paddingVertical: 0, color: '#e7ebec', fontSize: 14,
    letterSpacing: 0, outlineStyle: 'none',
  },
  farmsAddPrimary: {
    height: 52, minWidth: 155, paddingHorizontal: 20, borderRadius: 8,
    backgroundColor: THEME_ORANGE, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 9,
  },
  farmsAddPrimaryCompact: { width: 52, minWidth: 52, paddingHorizontal: 0 },
  farmsAddPrimaryText: { color: '#ffffff', fontSize: 15, lineHeight: 19, fontWeight: '800' },
  farmsEyebrow: { color: '#9da8ab', fontSize: 9, lineHeight: 12, fontWeight: '800', letterSpacing: 0 },
  farmsSummaryHeading: { marginTop: 14 },
  farmsSummaryPanel: { marginTop: 14 },
  farmsSummaryMetrics: { flexDirection: 'row', gap: 10 },
  farmsSummaryMetric: {
    flex: 1, minWidth: 0, height: 112, paddingHorizontal: 5, borderRadius: 8,
    borderWidth: 1, borderColor: '#1c2a30', backgroundColor: '#0b1418',
    alignItems: 'center', justifyContent: 'center',
  },
  farmsSummaryValueRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  farmsSummaryValue: { color: '#f0f2f3', fontSize: 27, fontWeight: '600', letterSpacing: 0 },
  farmsSummaryLabel: { marginTop: 8, color: '#d4d9db', fontSize: 12, textAlign: 'center', letterSpacing: 0 },
  farmsSummaryDetail: { marginTop: 4, color: '#899397', fontSize: 10, letterSpacing: 0 },
  farmsListHeader: { marginTop: 22, marginBottom: 9, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  farmsCountPill: {
    minHeight: 26, paddingHorizontal: 14, borderRadius: 13, borderWidth: 1,
    borderColor: '#1c2a30', backgroundColor: '#0b1418', alignItems: 'center', justifyContent: 'center',
  },
  farmsCountText: { color: '#b8c0c2', fontSize: 9, lineHeight: 12, fontWeight: '700' },
  farmStatusBadgeDraft: { backgroundColor: 'rgba(71, 80, 84, 0.92)' },
  farmStatusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#61df67' },
  farmStatusDotDraft: { backgroundColor: '#c4cbcd' },
  farmStatusText: { color: '#ffffff', fontSize: 9, lineHeight: 12, fontWeight: '700' },
  farmCardGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  farmWorkspaceCard: {
    flexBasis: '47%', flexGrow: 1, maxWidth: '49%', minHeight: 214,
    borderRadius: 8, borderWidth: 1, borderColor: '#172329',
    backgroundColor: '#0a1317', overflow: 'hidden', justifyContent: 'flex-end',
  },
  farmCardStatus: {
    position: 'absolute', top: 8, right: 8, minHeight: 21, borderRadius: 11,
    backgroundColor: 'rgba(0, 119, 68, 0.88)', flexDirection: 'row',
    alignItems: 'center', gap: 4, paddingHorizontal: 7, zIndex: 2,
  },
  farmCardStatusDraft: { backgroundColor: 'rgba(71, 80, 84, 0.92)' },
  farmCardStatusText: { color: '#ffffff', fontSize: 9, lineHeight: 12, fontWeight: '700' },
  farmCardBody: { zIndex: 1, paddingHorizontal: 10, paddingBottom: 11 },
  farmCardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 5, minWidth: 0 },
  farmCardName: {
    flex: 1, minWidth: 0, color: '#f5f4f0', fontSize: 15, lineHeight: 19, fontWeight: '800',
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', web: 'Georgia' }),
    textShadowColor: 'rgba(0,0,0,0.7)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4,
  },
  farmCardFooter: { marginTop: 11, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 7 },
  farmWorkspaceMeta: { minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 4 },
  farmWorkspaceMetaText: { flex: 1, minWidth: 0, color: '#b7c0c2', fontSize: 11, lineHeight: 15 },
  farmWorkspaceSmallText: { color: '#9aa5a8', fontSize: 10, lineHeight: 13 },
  farmFooterBanner: {
    minHeight: 82, borderRadius: 8, borderWidth: 1, borderColor: '#172329',
    backgroundColor: '#091216', overflow: 'hidden', flexDirection: 'row',
    alignItems: 'center', paddingHorizontal: 16, gap: 13,
  },
  farmFooterIcon: {
    width: 52, height: 52, borderRadius: 8, backgroundColor: 'rgba(255,122,0,0.1)',
    alignItems: 'center', justifyContent: 'center', zIndex: 1,
  },
  farmFooterCopy: { zIndex: 1 },
  farmFooterTitle: { color: '#dfe4e5', fontSize: 13, lineHeight: 17, fontWeight: '700' },
  farmFooterAccent: { color: THEME_ORANGE, fontSize: 15, lineHeight: 20, fontWeight: '900' },
  farmDetailHero: { height: 286, overflow: 'hidden', backgroundColor: '#101719' },
  farmDetailHeroCompact: { height: 266 },
  farmDetailHeroNarrow: { height: 248 },
  farmMeta: { marginTop: 11, flexDirection: 'row', alignItems: 'center', gap: 9 }, farmMetaNarrow: { marginTop: 8, gap: 7 }, farmMetaItem: { minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 4 }, farmMetaDivider: { width: 1, height: 13, backgroundColor: 'rgba(196,203,205,0.45)' }, farmMetaText: { flexShrink: 1, color: '#c4cbcd', fontSize: 10, fontWeight: '500' },
  socialProof: {
    marginTop: 12, alignSelf: 'flex-start', minHeight: 34, maxWidth: '100%',
    borderWidth: 1, borderColor: 'rgba(255, 122, 0, 0.28)', borderRadius: 17,
    backgroundColor: 'rgba(4, 10, 13, 0.7)', flexDirection: 'row',
    alignItems: 'center', paddingLeft: 5, paddingRight: 12,
  },
  socialProofNarrow: { marginTop: 9, minHeight: 31, borderRadius: 16, paddingRight: 9 },
  socialAvatars: { width: 70, flexDirection: 'row', alignItems: 'center' },
  socialAvatarWrap: {
    width: 26, height: 26, borderRadius: 13, borderWidth: 2,
    borderColor: '#071014', backgroundColor: '#11191b', overflow: 'hidden',
  },
  socialAvatarOverlap: { marginLeft: -8 },
  socialAvatar: { width: '100%', height: '100%' },
  socialProofText: { flexShrink: 1, color: '#d7dddf', fontSize: 10, lineHeight: 14, fontWeight: '600' },
  socialProofTextNarrow: { fontSize: 9, lineHeight: 13 },
  socialProofStrong: { color: THEME_ORANGE, fontWeight: '800' },
  workspaceTabs: {
    minHeight: 39, marginTop: 10, marginBottom: 10, borderRadius: 8,
    borderWidth: 1, borderColor: 'rgba(255, 122, 0, 0.34)',
    backgroundColor: '#071014', flexDirection: 'row', padding: 4, gap: 4,
  },
  workspaceTabsCompact: { minHeight: 37, marginTop: 8, marginBottom: 9 },
  workspaceTab: {
    flex: 1, minWidth: 0, borderRadius: 6, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 8,
  },
  workspaceTabActive: { backgroundColor: THEME_ORANGE },
  workspaceTabText: { color: '#d6dddf', fontSize: 11, lineHeight: 14, fontWeight: '500', letterSpacing: 0 },
  workspaceTabTextActive: { color: '#ffffff' },
  content: { paddingHorizontal: 10, paddingBottom: 34 },
  contentNarrow: { paddingHorizontal: 8 },
  setupScreen: { backgroundColor: '#020709' },
  setupPage: { width: '100%', maxWidth: 720, minHeight: '100%', backgroundColor: '#020709', paddingHorizontal: 10, paddingBottom: 34 },
  setupHeroShell: {
    height: 252, marginTop: 10, borderRadius: 8, borderWidth: 1,
    borderColor: '#26343a', overflow: 'hidden', backgroundColor: '#101719',
  },
  setupHeroCompact: { height: 235 },
  setupHeroContent: { flex: 1 },
  setupHeroHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 13, paddingTop: Platform.OS === 'web' ? 12 : 4,
  },
  setupHeroHeaderNarrow: { paddingHorizontal: 10, paddingTop: Platform.OS === 'web' ? 10 : 3 },
  setupIntro: { marginTop: 'auto', paddingHorizontal: 18, paddingBottom: 24 },
  setupIntroNarrow: { paddingHorizontal: 12, paddingBottom: 18 },
  setupIntroTitle: {
    color: '#f5f4f0', fontSize: 36, lineHeight: 42, fontWeight: '800',
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', web: 'Georgia' }),
    letterSpacing: 0, textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 6,
  },
  setupIntroTitleCompact: { fontSize: 32, lineHeight: 38 },
  setupIntroTitleNarrow: { fontSize: 29, lineHeight: 35 },
  setupIntroText: { marginTop: 7, color: '#c4cbcd', fontSize: 13, lineHeight: 19, maxWidth: 390 },
  setupIntroTextNarrow: { fontSize: 11, lineHeight: 16 },
  setupBody: { paddingHorizontal: 10, paddingBottom: 34, gap: 12, marginTop: 14 },
  statsPanel: {
    minHeight: 90, marginTop: 12, borderWidth: 1, borderColor: '#18242a',
    borderRadius: 8, backgroundColor: '#0a1317', flexDirection: 'row',
    alignItems: 'center', paddingVertical: 13,
  },
  statsPanelCompact: { minHeight: 88, paddingVertical: 10 },
  stat: {
    flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8, paddingHorizontal: 7,
  },
  statCompact: { flexDirection: 'column', gap: 3, paddingHorizontal: 3 },
  statPressed: { backgroundColor: 'rgba(255,122,0,0.06)' },
  statDivider: { borderRightWidth: 1, borderRightColor: '#1e2a30' },
  statIcon: {
    width: 42, height: 42, borderRadius: 21, borderWidth: 1,
    backgroundColor: '#10191d', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  statIconCompact: { width: 34, height: 34, borderRadius: 17 },
  statCopy: { minWidth: 0 },
  statCopyCompact: { width: '100%', alignItems: 'center' },
  statValue: { color: '#f4f5f5', fontSize: 23, lineHeight: 27, fontWeight: '700', letterSpacing: 0 },
  statValueCompact: { fontSize: 18, lineHeight: 21 },
  statLabel: { color: '#929ca0', fontSize: 9, lineHeight: 12, letterSpacing: 0 },
  statLabelCompact: { fontSize: 8, lineHeight: 10, textAlign: 'center' },
  sectionHeading: { marginTop: 21, marginBottom: 10, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  sectionTitle: {
    color: '#e7ebec', fontSize: 18,
    fontWeight: '700', letterSpacing: 0,
  },
  sectionTitleNarrow: { fontSize: 16 },
  sectionMeta: { color: '#6f7c80', fontSize: 8, fontWeight: '700' },
  moduleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  moduleGridCompact: { gap: 7 },
  moduleCard: {
    flexBasis: '47%', flexGrow: 1, height: 102, minWidth: 0, maxWidth: '49%',
    borderRadius: 8, borderWidth: 1, backgroundColor: '#081115', overflow: 'hidden',
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 11,
  },
  moduleCardCompact: { height: 94, paddingHorizontal: 7 },
  moduleCardTextOnly: { backgroundColor: '#0a141a', justifyContent: 'center' },
  moduleWide: { flexBasis: '100%', maxWidth: '100%' },
  moduleImage: {
    position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, opacity: 1,
  },
  moduleTintOverlay: { opacity: 0.2 },
  moduleIcon: {
    width: 42, height: 42, borderRadius: 21, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center', zIndex: 1, overflow: 'hidden',
  },
  moduleIconCompact: { width: 36, height: 36, borderRadius: 18 },
  badgeMotion: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  badgeImage: { width: '92%', height: '92%' },
  moduleCopy: { flex: 1, minWidth: 0, marginLeft: 9, marginRight: 5, zIndex: 1 },
  moduleCopyTextOnly: { marginLeft: 0, marginRight: 0, alignItems: 'center' },
  moduleCopyCompact: { marginLeft: 7, marginRight: 2 },
  moduleTitle: {
    color: '#edf0f1', fontSize: 14, lineHeight: 18, fontWeight: '700', letterSpacing: 0,
  },
  moduleTitleTextOnly: { color: '#ffffff', textAlign: 'center' },
  moduleTitleCompact: { fontSize: 12, lineHeight: 15 },
  moduleSubtitle: {
    marginTop: 3, color: '#9ba5a8', fontSize: 9, lineHeight: 13, letterSpacing: 0,
  },
  cordateScreen: { flex: 1, backgroundColor: '#000000' },
  cordateScroll: { flexGrow: 1, alignItems: 'center', backgroundColor: '#000000' },
  cordatePage: { width: '100%', maxWidth: 720, minHeight: '100%', backgroundColor: '#000000' },
  cordateBanner: { height: 252, overflow: 'hidden' },
  cordateDetailBanner: { height: 246, overflow: 'hidden' },
  cordateBannerSafe: { flex: 1 },
  cordateHeader: {
    paddingHorizontal: 16, paddingTop: Platform.OS === 'web' ? 10 : 3,
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  cordateHeaderWithSettings: { justifyContent: 'space-between' },
  cordateHeaderLeft: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 10 },
  cordateBackButton: {
    width: 40, height: 40, borderRadius: 20, borderWidth: 1,
    borderColor: 'rgba(190,204,208,.35)', backgroundColor: 'rgba(2,8,11,.65)',
    alignItems: 'center', justifyContent: 'center',
  },
  cordateHeaderTitle: { color: '#ffffff', fontSize: 17, lineHeight: 21, fontWeight: '700' },
  cordateActionMenu: {
    position: 'absolute', right: 16, top: Platform.OS === 'web' ? 54 : 47, zIndex: 4,
    minWidth: 140, borderRadius: 8, borderWidth: 1, borderColor: '#31434a',
    backgroundColor: '#071216', padding: 4,
  },
  cordateActionMenuItem: { minHeight: 28, borderRadius: 6, paddingHorizontal: 9, flexDirection: 'row', alignItems: 'center', gap: 7 },
  cordateActionMenuText: { color: '#eef2f3', fontSize: 9, lineHeight: 12, fontWeight: '800' },
  cordateDetailSafe: { flex: 1, minHeight: '100%' },
  cordateDetailHero: { paddingHorizontal: 20, paddingTop: 28, paddingBottom: 18 },
  cordateDetailBody: { paddingHorizontal: 10, paddingBottom: 30 },
  cordateHeroCopy: { marginTop: 'auto', paddingHorizontal: 20, paddingBottom: 22 },
  cordateFarmName: {
    color: '#ffffff', fontSize: 34, lineHeight: 40, fontWeight: '800',
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', web: 'Georgia' }),
  },
  cordateSubtitle: { marginTop: 3, color: '#c2cbce', fontSize: 13, lineHeight: 18 },
  cordateMeta: { marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 6 },
  cordateMetaText: { color: '#d3dade', fontSize: 10 },
  cordateMetaDivider: { width: 1, height: 12, marginHorizontal: 5, backgroundColor: 'rgba(210,220,224,.35)' },
  cordateListWrap: { paddingHorizontal: 10, paddingBottom: 30 },
  cordateListHeading: {
    marginTop: 20, marginBottom: 9, flexDirection: 'row',
    alignItems: 'flex-end', justifyContent: 'space-between',
  },
  cordateOverline: { color: '#899397', fontSize: 10, fontWeight: '600' },
  cordateListTitle: { marginTop: 4, color: '#edf1f2', fontSize: 17, lineHeight: 22, fontWeight: '800' },
  cordateCount: { color: '#8e9a9e', fontSize: 10, fontWeight: '700' },
  cordateBatchList: { gap: 9 },
  cordateBatchCard: {
    minHeight: 92, borderRadius: 7, borderWidth: 1, borderColor: '#223138',
    backgroundColor: '#091317', padding: 13,
  },
  cordateBatchTop: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  cordateBatchIcon: {
    width: 44, height: 44, borderRadius: 7, backgroundColor: 'rgba(255,122,0,.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  cordateBatchCopy: { flex: 1, minWidth: 0 },
  cordateBatchName: { color: '#eef2f3', fontSize: 13, lineHeight: 17, fontWeight: '800' },
  cordateBatchMeta: { marginTop: 3, color: '#758287', fontSize: 9, lineHeight: 13 },
  cordateBatchBloodline: { marginTop: 8, color: THEME_ORANGE, fontSize: 10, lineHeight: 13, fontWeight: '800' },
  cordateBatchCount: { alignItems: 'flex-end' },
  cordateBatchNumber: { color: '#ffffff', fontSize: 20, lineHeight: 22, fontWeight: '800' },
  cordateBatchUnit: { marginTop: 2, color: '#78868b', fontSize: 8 },
  cordateSearch: {
    height: 52, borderRadius: 7, borderWidth: 1, borderColor: '#26373e',
    backgroundColor: '#081216', paddingHorizontal: 13, flexDirection: 'row',
    alignItems: 'center', gap: 8,
  },
  cordateSearchInput: { flex: 1, height: 50, padding: 0, color: '#e7ebec', fontSize: 12, outlineStyle: 'none' },
  cordateDropdownRow: { marginVertical: 10, flexDirection: 'row', gap: 8, zIndex: 3 },
  cordateDropdownWrap: { flex: 1, minWidth: 0, position: 'relative' },
  cordateDropdownField: {
    minHeight: 48, borderRadius: 7, borderWidth: 1, borderColor: '#26373e',
    backgroundColor: '#071014', paddingHorizontal: 11, flexDirection: 'row',
    alignItems: 'center', gap: 8,
  },
  cordateDropdownLabel: { color: '#79868b', fontSize: 8, lineHeight: 11, fontWeight: '800' },
  cordateDropdownValue: { flex: 1, color: '#edf2f3', fontSize: 11, lineHeight: 14, fontWeight: '900' },
  cordateDropdownMenu: {
    position: 'absolute', left: 0, right: 0, top: 54, zIndex: 6,
    borderRadius: 7, borderWidth: 1, borderColor: '#30434a',
    backgroundColor: '#071216', overflow: 'hidden',
  },
  cordateDropdownOption: {
    minHeight: 36, paddingHorizontal: 11, borderBottomWidth: 1,
    borderBottomColor: '#17262b', justifyContent: 'center',
  },
  cordateDropdownOptionActive: { backgroundColor: 'rgba(255,122,0,.1)' },
  cordateDropdownOptionText: { color: '#cbd3d6', fontSize: 10, lineHeight: 13, fontWeight: '800' },
  cordateDropdownOptionTextActive: { color: THEME_ORANGE },
  cordateFilterList: { paddingVertical: 10, gap: 7 },
  cordateFilter: {
    height: 34, borderRadius: 17, borderWidth: 1, borderColor: '#26373e',
    backgroundColor: '#071014', paddingHorizontal: 13, alignItems: 'center', justifyContent: 'center',
  },
  cordateFilterActive: { borderColor: THEME_ORANGE, backgroundColor: 'rgba(255,122,0,.12)' },
  cordateFilterText: { color: '#a6b0b4', fontSize: 10, fontWeight: '800' },
  cordateFilterTextActive: { color: '#ffffff' },
  cordateBulkPanel: {
    marginBottom: 10, borderRadius: 8, borderWidth: 1, borderColor: '#26373e',
    backgroundColor: '#071014', padding: 10,
  },
  cordateBulkHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cordateBulkLabel: { color: '#7d898e', fontSize: 7, lineHeight: 10, fontWeight: '900' },
  cordateBulkTitle: { color: '#eef2f3', fontSize: 12, lineHeight: 16, fontWeight: '900' },
  cordateBulkCount: { marginLeft: 'auto', color: '#879397', fontSize: 9, lineHeight: 12, fontWeight: '800' },
  cordateBulkHeaderActions: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cordateBulkSmallButton: {
    minHeight: 28, borderRadius: 6, borderWidth: 1, borderColor: '#30434a',
    paddingHorizontal: 9, alignItems: 'center', justifyContent: 'center',
  },
  cordateBulkSmallText: { color: '#cbd3d6', fontSize: 8, lineHeight: 11, fontWeight: '800' },
  cordateBulkApplyButton: {
    minHeight: 36, marginTop: 10, borderRadius: 7, backgroundColor: THEME_ORANGE,
    alignItems: 'center', justifyContent: 'center',
  },
  cordateBulkApplyText: { color: '#ffffff', fontSize: 10, lineHeight: 13, fontWeight: '900' },
  cordateBirdList: { marginTop: 13, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#203139', gap: 8 },
  cordateBirdListScreen: {
    gap: 8,
  },
  cordateBirdRow: {
    minHeight: 72, borderRadius: 8, borderWidth: 1, borderColor: '#213239',
    backgroundColor: '#071014', padding: 11, flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  cordateBirdRowSelected: { borderColor: THEME_ORANGE, backgroundColor: 'rgba(255,122,0,.07)' },
  cordateBirdMarker: {
    width: 48, height: 48, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,122,0,.45)',
    backgroundColor: 'rgba(255,122,0,.1)', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  cordateBirdMarkerSelected: { borderColor: THEME_ORANGE, backgroundColor: THEME_ORANGE },
  cordateBirdMarkerText: { color: THEME_ORANGE, fontSize: 10, lineHeight: 13, fontWeight: '900' },
  cordateBirdCopy: { flex: 1, minWidth: 0 },
  cordateBirdTitleRow: { minHeight: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  cordateBirdName: { flex: 1, color: '#eef2f3', fontSize: 13, lineHeight: 17, fontWeight: '900' },
  cordateBirdStatus: {
    minWidth: 72, minHeight: 22, borderRadius: 11, borderWidth: 1, borderColor: '#6f420f',
    backgroundColor: 'rgba(255,122,0,.08)', paddingHorizontal: 8, color: THEME_ORANGE,
    fontSize: 9, lineHeight: 20, fontWeight: '900', textAlign: 'center',
  },
  cordateBirdMeta: { marginTop: 2, color: '#718086', fontSize: 9, lineHeight: 12, fontWeight: '700' },
  cordateBirdBloodline: { marginTop: 6, color: THEME_ORANGE, fontSize: 10, lineHeight: 13, fontWeight: '800' },
  cordateEmptyBirds: {
    minHeight: 120, borderRadius: 8, borderWidth: 1, borderColor: '#213239', backgroundColor: '#071014',
    color: '#77868b', fontSize: 10, lineHeight: 14, padding: 24, textAlign: 'center', textAlignVertical: 'center',
  },
  overdue: { color: '#ff3d4d' },
  setupPanel: {
    borderRadius: 8, borderWidth: 1, borderColor: '#26343a',
    backgroundColor: '#091216', padding: 12,
  },
  setupSectionHeader: { marginBottom: 12, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 10 },
  setupSectionKicker: { color: THEME_ORANGE, fontSize: 8, lineHeight: 11, fontWeight: '900', letterSpacing: 0 },
  setupSectionTitle: { marginTop: 2, color: '#e7ebec', fontSize: 16, lineHeight: 21, fontWeight: '700', letterSpacing: 0 },
  setupOptional: { color: '#7f8a8e', fontSize: 9, lineHeight: 12, fontWeight: '700' },
  setupBannerPreview: {
    height: 164, borderRadius: 8, borderWidth: 1, borderStyle: 'dashed',
    borderColor: 'rgba(255, 122, 0, 0.62)', backgroundColor: '#071014',
    overflow: 'hidden', alignItems: 'center', justifyContent: 'center',
  },
  setupBannerUpload: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  setupBannerUploadIcon: {
    width: 54, height: 54, borderRadius: 27, borderWidth: 1, borderColor: THEME_ORANGE,
    backgroundColor: 'rgba(2, 7, 9, 0.56)', alignItems: 'center', justifyContent: 'center',
  },
  setupBannerUploadTitle: { marginTop: 10, color: '#f3f5f5', fontSize: 13, lineHeight: 17, fontWeight: '800' },
  setupBannerUploadMeta: { marginTop: 3, color: '#a4adb0', fontSize: 10, lineHeight: 14 },
  setupRemoveBanner: {
    position: 'absolute', top: 9, right: 9, width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(7, 16, 20, 0.86)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)',
  },
  setupBannerError: { color: '#ff6773', fontSize: 12, lineHeight: 18, marginTop: 8 },
  setupFieldGrid: { gap: 12 },
  setupField: { width: '100%', minWidth: 0, maxWidth: '100%', gap: 7 },
  setupFieldWide: { width: '100%' },
  setupFieldCopy: {
    minWidth: 0, minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 13, borderWidth: 1, borderColor: '#26343a',
    borderRadius: 8, backgroundColor: '#0b1418',
  },
  setupFieldFocused: { borderColor: THEME_ORANGE, backgroundColor: '#10191d' },
  setupFieldLabel: { color: '#dfe4e5', fontSize: 12, lineHeight: 16, fontWeight: '800' },
  setupInput: { flex: 1, minWidth: 0, height: 46, paddingVertical: 0, color: '#e8ecee', fontSize: 13, letterSpacing: 0, outlineStyle: 'none' },
  assignTeamBox: {
    minHeight: 82, borderRadius: 8, borderWidth: 1, borderColor: '#26343a',
    backgroundColor: '#0b1418', paddingHorizontal: 13, paddingVertical: 12, gap: 10,
  },
  assignTeamTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  assignTeamIcon: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255, 122, 0, 0.11)',
    alignItems: 'center', justifyContent: 'center',
  },
  assignTeamCopy: { flex: 1, minWidth: 0 },
  assignTeamTitle: { color: '#eef1f2', fontSize: 14, lineHeight: 18, fontWeight: '700' },
  assignTeamSubtitle: { marginTop: 2, color: '#9aa5a8', fontSize: 10, lineHeight: 14 },
  assignedPills: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, paddingLeft: 48 },
  memberPill: {
    height: 28, maxWidth: 120, borderRadius: 14, borderWidth: 1, borderColor: '#293941',
    backgroundColor: '#071014', flexDirection: 'row', alignItems: 'center', gap: 6, paddingLeft: 3, paddingRight: 8,
  },
  memberPillImage: { width: 22, height: 22, borderRadius: 11 },
  memberPillText: { color: '#dfe4e5', fontSize: 11, lineHeight: 14, fontWeight: '700' },
  visibilityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  visibilityOption: {
    flexBasis: '48%', flexGrow: 1, minWidth: 220, minHeight: 76, borderRadius: 8,
    borderWidth: 1, borderColor: '#26343a', backgroundColor: '#0b1418',
    flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 12,
  },
  visibilityOptionActive: { borderColor: THEME_ORANGE, backgroundColor: '#091216' },
  visibilityRadio: { width: 14, height: 14, borderRadius: 7, borderWidth: 1, borderColor: '#8a9699' },
  visibilityRadioActive: { borderWidth: 4, borderColor: THEME_ORANGE },
  visibilityIcon: {
    width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,122,0,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  visibilityCopy: { flex: 1, minWidth: 0 },
  visibilityTitle: { color: '#f1f4f4', fontSize: 13, lineHeight: 17, fontWeight: '800' },
  visibilityDescription: { marginTop: 3, color: '#9aa5a8', fontSize: 10, lineHeight: 14 },
  setupActions: { marginTop: 2, flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  setupSecondaryButton: {
    flex: 1, minHeight: 48, borderRadius: 8, borderWidth: 1, borderColor: THEME_ORANGE,
    backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10,
  },
  setupPrimaryButton: {
    flex: 1, minHeight: 48, borderRadius: 8, backgroundColor: THEME_ORANGE,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10,
  },
  setupSecondaryText: { color: THEME_ORANGE, fontSize: 13, lineHeight: 18, fontWeight: '800' },
  setupPrimaryText: { color: '#ffffff', fontSize: 13, lineHeight: 18, fontWeight: '800' },
  activityHeading: { marginTop: 23, marginBottom: 9, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }, activitySectionTitle: { color: '#e7ebec', fontSize: 16, fontWeight: '700' }, activitySectionSubtitle: { marginTop: 3, color: '#707d81', fontSize: 8 }, activityToday: { color: THEME_ORANGE, fontSize: 8, fontWeight: '700' }, activityList: { borderWidth: 1, borderColor: '#26343a', borderRadius: 8, backgroundColor: '#091216', overflow: 'hidden' }, activityRow: { minHeight: 65, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 9 }, activityDivider: { borderBottomWidth: 1, borderBottomColor: '#223037' }, activityPressed: { backgroundColor: '#111d22' }, activityIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,122,0,0.08)', alignItems: 'center', justifyContent: 'center' }, activityCopy: { flex: 1, minWidth: 0 }, activityTitle: { color: '#dfe4e5', fontSize: 10, fontWeight: '700' }, activityDetail: { marginTop: 4, color: '#788589', fontSize: 8 }, activityTime: { color: '#8a9699', fontSize: 7 },
  processBackButton: { alignSelf: 'flex-start', marginTop: 4, flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 7, paddingRight: 10 },
  processBackText: { color: THEME_ORANGE, fontSize: 10, lineHeight: 13, fontWeight: '800' },
  processDetailHeader: { marginTop: 7, marginBottom: 12 },
  processDetailSubtitle: { marginTop: 5, color: '#8a9699', fontSize: 10, lineHeight: 15 },
  hatcherySummaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  hatcherySummaryCard: {
    flexBasis: '47%', flexGrow: 1, minHeight: 66, maxWidth: '49%', borderRadius: 8,
    borderWidth: 1, borderColor: '#26343a', backgroundColor: '#091216',
    justifyContent: 'center', paddingHorizontal: 11, paddingVertical: 10,
  },
  hatcherySummaryValue: { color: '#f4f5f5', fontSize: 20, lineHeight: 24, fontWeight: '800' },
  hatcherySummaryLabel: { marginTop: 3, color: '#929ca0', fontSize: 8, lineHeight: 11, fontWeight: '700' },
  hatcheryToolRow: { minHeight: 66, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 9 },
  cardPressed: { opacity: 0.72, transform: [{ scale: 0.99 }] },
});

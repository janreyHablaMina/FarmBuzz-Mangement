import { useEffect, useRef, useState } from 'react';
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
import IncubationHistoryScreen from './IncubationHistoryScreen';
import CandlingScreen from './CandlingScreen';
import RecordHatchScreen from './RecordHatchScreen';
import BroodingScreen from './BroodingScreen';
import BroodingBatchDetailScreen from './BroodingBatchDetailScreen';
import VaccinationScheduleScreen, { DEFAULT_BROODING_SETTINGS } from './VaccinationScheduleScreen';
import GrowingScreen from './GrowingScreen';
import GrowingBatchDetailScreen from './GrowingBatchDetailScreen';
import GrowingScheduleSettingsScreen, { DEFAULT_GROWING_SETTINGS, DEFAULT_RANGING_SETTINGS, DEFAULT_STAG_SETTINGS } from './GrowingScheduleSettingsScreen';
import GrowingSettingsScreen, { GrowingSeparationSettingsScreen } from './GrowingSettingsScreen';
import MaturingScreen from './MaturingScreen';
import PulletScreen, { PULLET_BATCHES, PulletBatchDetailScreen } from './PulletScreen';
import RangingScreen, { buildRangingLocations, RANGING_BATCHES } from './RangingScreen';
import RangingAreaDetailScreen from './RangingAreaDetailScreen';
import RangingSettingsScreen, { RangingSelectionSettingsScreen } from './RangingSettingsScreen';
import StagMaintenanceScreen, { DEFAULT_STAG_AREAS, StagMaintenanceAreaDetail } from './StagMaintenanceScreen';
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
const BROODING_HERO_IMAGE = require('./assets/brooding-card.png');
const HARDENING_CARD_IMAGE = require('./assets/hardening-card.png');
const GROWING_HERO_IMAGE = require('./assets/growing-card.png');
const RANGING_HERO_IMAGE = require('./assets/ranging-card.png');
const HEALTH_CARE_HERO_IMAGE = require('./assets/health-care-hero.png');
const SALES_DASHBOARD_HERO_IMAGE = require('./assets/sales-dashboard-hero.png');
const COLLECTIONS_DASHBOARD_HERO_IMAGE = require('./assets/sales-hero.png');
const SHOWCASE_IMAGE = require('./assets/Showcase.png');

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
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${item.title}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.moduleCard,
        compact && styles.moduleCardCompact,
        item.wide && styles.moduleWide,
        { borderColor: `${item.color}55` },
        pressed && styles.cardPressed,
      ]}
    >
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
      <View style={[styles.moduleCopy, compact && styles.moduleCopyCompact]}>
        <Text numberOfLines={2} style={[styles.moduleTitle, compact && styles.moduleTitleCompact]}>
          {item.title}
        </Text>
        <Text numberOfLines={2} style={styles.moduleSubtitle}>
          {item.subtitle}
          {item.detail && <Text style={styles.overdue}> {item.detail}</Text>}
        </Text>
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

function FarmDetailScreen({ farm, onBack, onOpenBreeding, onOpenIncubation, onOpenBrooding, onOpenGrowing, onOpenMaturing, onOpenHardening, onOpenSettings }) {
  const { width } = useWindowDimensions();
  const compact = width < 480;
  const narrow = width < 390;
  const farmName = farm?.name || 'FB Farm';
  const location = farm?.location || 'Pampanga, Philippines';
  const establishedYear = farm?.established || '2020';
  const heroImage = farm?.image || DASHBOARD_HERO_IMAGE;
  const breedingModule = {
    ...MODULES.find((item) => item.title === 'Breeding'),
    subtitle: 'Pairings, eggs, hatch readiness',
    image: BREEDING_HERO_IMAGE,
  };
  const incubationModule = {
    ...MODULES.find((item) => item.title === 'Eggs & Incubation'),
    subtitle: 'Holding eggs, batches, hatch progress',
  };
  const broodingModule = {
    title: 'Brooding',
    subtitle: '1 active batch, 38 chicks',
    icon: 'bird',
    color: THEME_ORANGE,
    tint: THEME_ORANGE_TINT,
    image: BROODING_HERO_IMAGE,
  };
  const growingModule = {
    title: 'Growing',
    subtitle: '1 active batch, 26 juveniles',
    icon: 'bird',
    color: THEME_ORANGE,
    tint: THEME_ORANGE_TINT,
    image: GROWING_HERO_IMAGE,
  };
  const maturingModule = {
    title: 'Maturing',
    subtitle: 'Ranging and female pullet groups',
    icon: 'progress-clock',
    color: THEME_ORANGE,
    tint: THEME_ORANGE_TINT,
    image: RANGING_HERO_IMAGE,
  };
  const hardeningModule = {
    title: 'Stag Maintenance',
    subtitle: 'Conditioning and ongoing stag care',
    icon: 'shield-check-outline',
    color: THEME_ORANGE,
    tint: THEME_ORANGE_TINT,
    image: HARDENING_CARD_IMAGE,
  };
  const breedingStats = [
    { label: 'Active Pairings', value: '3', icon: 'link-variant', color: THEME_ORANGE },
    { label: 'Holding Eggs', value: '15', icon: 'egg-outline', color: THEME_ORANGE },
    { label: 'Due Soon', value: '1', icon: 'clock-outline', color: THEME_ORANGE },
    { label: 'Farm Members', value: String(farm?.members || 3), icon: 'account-group-outline', color: THEME_ORANGE },
  ];

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
              {breedingStats.map((item, index) => (
                <Stat
                  key={item.label}
                  item={item}
                  compact={compact}
                  isLast={index === breedingStats.length - 1}
                />
              ))}
            </View>

            <View style={styles.sectionHeading}>
              <Text style={[styles.sectionTitle, narrow && styles.sectionTitleNarrow]}>Management Tool</Text>
              <Text style={styles.sectionMeta}>6 modules</Text>
            </View>
            <View style={[styles.moduleGrid, compact && styles.moduleGridCompact]}>
              <ModuleCard item={breedingModule} compact={compact} onPress={onOpenBreeding} />
              <ModuleCard item={incubationModule} compact={compact} onPress={onOpenIncubation} />
              <ModuleCard item={broodingModule} compact={compact} onPress={onOpenBrooding} />
              <ModuleCard item={growingModule} compact={compact} onPress={onOpenGrowing} />
              <ModuleCard item={maturingModule} compact={compact} onPress={onOpenMaturing} />
              <ModuleCard item={hardeningModule} compact={compact} onPress={onOpenHardening} />
            </View>
          </View>
        </View>
      </ScrollView>
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
  const [selectedStagArea, setSelectedStagArea] = useState('Stag Area 1');
  const [stagSettings, setStagSettings] = useState(DEFAULT_STAG_SETTINGS);
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
          onBack={() => setScreen('farms')}
          onOpenBreeding={() => setScreen('breeding')}
          onOpenIncubation={() => setScreen('eggs-incubation')}
          onOpenBrooding={() => setScreen('brooding')}
          onOpenGrowing={() => setScreen('growing')}
          onOpenMaturing={() => setScreen('maturing')}
          onOpenHardening={() => setScreen('stag-maintenance')}
          onOpenSettings={() => {
            setSettingsReturn('farm-detail');
            setScreen('management-settings');
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
          onBack={() => setScreen('stag-maintenance')}
          onCheck={(record) => setStagAreas((current) => current.map((area) => area.location === selectedStagArea ? { ...area, lastCheck: record, history: [{ date: record.date, text: 'Maintenance check completed' }, ...area.history] } : area))}
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
          onProceed={(record) => {
            setStagAreas((current) => current.map((area) => area.location === selectedStagArea ? { ...area, birds: area.birds - record.count, movedForward: (area.movedForward || 0) + record.count, history: [{ date: record.date, text: `${record.count} proceeded to ${record.destination}` }, ...area.history] } : area));
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
          batches={rangingBatches.map((batch) => completedRangingBatchIds.includes(batch.id) ? { ...batch, status: 'Completed' } : batch)}
          lossesByBatch={rangingLossesByBatch}
          locationsByBatch={rangingLocationsByBatch}
          selectionsByLocation={rangingSelectionsByLocation}
          readyDay={rangingSettings.readyDay}
          onBack={() => setScreen('maturing')}
          onOpenSettings={() => setScreen('ranging-settings')}
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
          onBack={() => setScreen('ranging-settings')}
          onSave={(settings) => {
            setRangingSettings(settings);
            setScreen('ranging-settings');
          }}
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
          lossRecordsByBatch={broodingLossesByBatch}
          readyDay={broodingSettings.readyDay}
          onBack={() => setScreen('farm-detail')}
          onOpenSettings={() => setScreen('vaccination-schedule')}
          onOpenBatch={(batchId) => {
            setSelectedBroodingBatchId(batchId);
            setScreen('brooding-batch-detail');
          }}
        />
      ) : screen === 'brooding-batch-detail' ? (
        <BroodingBatchDetailScreen
          batchId={selectedBroodingBatchId}
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
          onAddTask={() => setScreen('add-task')}
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
          onBack={() => setScreen('tasks')}
          onComplete={(task) => {
            setAddedTasks((current) => [task, ...current]);
            setScreen('tasks');
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
  moduleCopyCompact: { marginLeft: 7, marginRight: 2 },
  moduleTitle: {
    color: '#edf0f1', fontSize: 14, lineHeight: 18, fontWeight: '700', letterSpacing: 0,
  },
  moduleTitleCompact: { fontSize: 12, lineHeight: 15 },
  moduleSubtitle: {
    marginTop: 3, color: '#9ba5a8', fontSize: 9, lineHeight: 13, letterSpacing: 0,
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

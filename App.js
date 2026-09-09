import { useEffect, useRef, useState } from 'react';
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

function WorkspaceTabs({ activeTab, compact, onOpenShowcase, onOpenManagement }) {
  const tabs = [
    { id: 'showcase', label: 'Showcase', icon: 'images-outline', onPress: onOpenShowcase },
    { id: 'management', label: 'Management Tool', icon: 'grid-outline', onPress: onOpenManagement },
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

function ShowcaseScreen({ farmName, location, establishedYear, onOpenShowcase, onOpenManagement, onOpenSettings }) {
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

function Dashboard({ farmName, location, establishedYear, totalWins, onOpenShowcase, onOpenSettings, onOpenNeedsAttention, onOpenFlock, onOpenBreeding, onOpenHealthCare, onOpenEggsIncubation, onOpenTasks, onOpenTeam, onOpenSales }) {
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
  const [screen, setScreen] = useState('dashboard');
  const [createBatchReturn, setCreateBatchReturn] = useState('eggs-incubation');
  const [selectedBatchId, setSelectedBatchId] = useState('B-001');
  const [candlingResultsByBatch, setCandlingResultsByBatch] = useState({});
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
    farmName: 'FarmBuzz Farm',
    location: 'Pampanga, Philippines',
    establishedYear: '2020',
    incubationDays: 21,
    candlingDay: 14,
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

  return (
    <SafeAreaProvider>
      {screen === 'showcase' ? (
        <ShowcaseScreen
          farmName={managementSettings.farmName}
          location={managementSettings.location}
          establishedYear={managementSettings.establishedYear}
          onOpenShowcase={() => {}}
          onOpenManagement={() => setScreen('dashboard')}
          onOpenSettings={() => setScreen('management-settings')}
        />
      ) : screen === 'management-settings' ? (
        <ManagementSettingsScreen
          initialSettings={managementSettings}
          onBack={() => setScreen('dashboard')}
          onSave={(settings) => {
            setManagementSettings(settings);
            setScreen('dashboard');
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
          onBack={() => setScreen('dashboard')}
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
          onBack={() => setScreen('dashboard')}
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
          onBack={() => setScreen('eggs-incubation')}
          onOpenCandling={() => setScreen('candling')}
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
          onOpenSettings={() => setScreen('management-settings')}
          onOpenNeedsAttention={() => {
            setAttentionReturn('dashboard');
            setScreen('needs-attention');
          }}
          onOpenFlock={() => setScreen('flock')}
          onOpenBreeding={() => setScreen('breeding')}
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
  activityHeading: { marginTop: 23, marginBottom: 9, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }, activitySectionTitle: { color: '#e7ebec', fontSize: 16, fontWeight: '700' }, activitySectionSubtitle: { marginTop: 3, color: '#707d81', fontSize: 8 }, activityToday: { color: THEME_ORANGE, fontSize: 8, fontWeight: '700' }, activityList: { borderWidth: 1, borderColor: '#26343a', borderRadius: 8, backgroundColor: '#091216', overflow: 'hidden' }, activityRow: { minHeight: 65, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 9 }, activityDivider: { borderBottomWidth: 1, borderBottomColor: '#223037' }, activityPressed: { backgroundColor: '#111d22' }, activityIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,122,0,0.08)', alignItems: 'center', justifyContent: 'center' }, activityCopy: { flex: 1, minWidth: 0 }, activityTitle: { color: '#dfe4e5', fontSize: 10, fontWeight: '700' }, activityDetail: { marginTop: 4, color: '#788589', fontSize: 8 }, activityTime: { color: '#8a9699', fontSize: 7 },
  cardPressed: { opacity: 0.72, transform: [{ scale: 0.99 }] },
});

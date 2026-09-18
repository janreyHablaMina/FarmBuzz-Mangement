import { useMemo, useState } from "react";
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
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { birdAgeDays, monthAge, SELECTION_AGE_DAYS } from "./RangingScreen";

const HERO_IMAGE = require("./assets/ranging-card.png");
const ORANGE = "#ff7900";
const RANGE_START_DAY = 120;

function today() {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date());
}
function dateAfterDays(startDate, days) {
  const due = new Date(startDate);
  due.setDate(due.getDate() + days);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(due);
}

function FieldModal({
  visible,
  type,
  batch,
  currentBirds,
  location,
  onClose,
  onSave,
}) {
  const loss = type === "loss";
  const [value, setValue] = useState(loss ? "1" : location);
  const [date, setDate] = useState(today);
  const [note, setNote] = useState("");
  const save = () => {
    if (loss) {
      const count = Number.parseInt(value, 10);
      if (!Number.isFinite(count) || count < 1 || count > currentBirds)
        return Alert.alert(
          "Check birds lost",
          `Enter a number from 1 to ${currentBirds}.`,
        );
      onSave({ id: `LOSS-${Date.now()}`, count, date, note: note.trim() });
    } else {
      if (!value.trim())
        return Alert.alert(
          "Range area required",
          "Enter the new range area or location.",
        );
      onSave(value.trim());
    }
  };
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.modal}>
          <View style={styles.modalHead}>
            <View>
              <Text style={styles.eyebrow}>{batch.id}</Text>
              <Text style={styles.modalTitle}>
                {loss ? "Record Loss" : "Change Range Area"}
              </Text>
            </View>
            <Pressable
              accessibilityLabel="Close"
              onPress={onClose}
              style={styles.close}
            >
              <Ionicons name="close" size={20} color="#dfe5e7" />
            </Pressable>
          </View>
          <View style={styles.band}>
            <Text style={styles.bandText}>{currentBirds} current birds</Text>
            <Text style={styles.bandText}>{monthAge(birdAgeDays(batch))}</Text>
          </View>
          <Text style={styles.fieldLabel}>
            {loss ? "Birds Lost" : "Range Area / Location"}
          </Text>
          <View style={styles.field}>
            <MaterialCommunityIcons
              name={loss ? "bird" : "map-marker-outline"}
              size={18}
              color={ORANGE}
            />
            <TextInput
              value={value}
              onChangeText={setValue}
              keyboardType={loss ? "number-pad" : "default"}
              style={styles.input}
            />
          </View>
          {loss && (
            <>
              <Text style={styles.fieldLabel}>Date</Text>
              <View style={styles.field}>
                <MaterialCommunityIcons
                  name="calendar-outline"
                  size={18}
                  color={ORANGE}
                />
                <TextInput
                  value={date}
                  onChangeText={setDate}
                  style={styles.input}
                />
              </View>
              <Text style={styles.fieldLabel}>Note (optional)</Text>
              <TextInput
                value={note}
                onChangeText={setNote}
                multiline
                placeholder="Reason or observation"
                placeholderTextColor="#68777c"
                style={styles.note}
              />
            </>
          )}
          <View style={styles.modalActions}>
            <Pressable onPress={onClose} style={styles.cancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable onPress={save} style={styles.save}>
              <Text style={styles.saveText}>Save</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function SelectionModal({
  visible,
  batch,
  currentBirds,
  options,
  onClose,
  onConfirm,
}) {
  const [selected, setSelected] = useState(null);
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.modal}>
          <View style={styles.modalHead}>
            <View>
              <Text style={styles.eyebrow}>RANGING COMPLETE</Text>
              <Text style={styles.modalTitle}>Begin Selection</Text>
            </View>
            <Pressable
              accessibilityLabel="Close"
              onPress={onClose}
              style={styles.close}
            >
              <Ionicons name="close" size={20} color="#dfe5e7" />
            </Pressable>
          </View>
          <Text style={styles.confirmTitle}>
            {currentBirds} birds ready for review
          </Text>
          <Text style={styles.confirmCopy}>
            Choose the selection path for {batch.id}.
          </Text>
          <View style={styles.selectionOptions}>
            {options.map((option, index) => {
              const active = selected === option;
              return (
                <Pressable
                  key={option}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: active }}
                  onPress={() => setSelected(option)}
                  style={[
                    styles.selectionOption,
                    active && styles.selectionOptionActive,
                    index < options.length - 1 && styles.selectionOptionDivider,
                  ]}
                >
                  <View style={[styles.radio, active && styles.radioActive]}>
                    {active && <View style={styles.radioDot} />}
                  </View>
                  <Text
                    style={[
                      styles.selectionOptionText,
                      active && styles.selectionOptionTextActive,
                    ]}
                  >
                    {option}
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={active ? ORANGE : "#68767b"}
                  />
                </Pressable>
              );
            })}
          </View>
          <View style={styles.modalActions}>
            <Pressable onPress={onClose} style={styles.cancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              disabled={!selected}
              onPress={() => onConfirm(selected)}
              style={[styles.save, !selected && styles.saveDisabled]}
            >
              <Text style={styles.saveText}>Continue</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function RangingBatchDetailScreen({
  batchId,
  batches,
  losses = [],
  locationOverride,
  readyDay = SELECTION_AGE_DAYS,
  scheduledTasks = [],
  completedTasks = {},
  selectionOptions = [
    "Keep / Continue",
    "Future Breeder",
    "Sell / Transfer",
    "Remove from Program",
  ],
  onBack,
  onSaveLoss,
  onChangeLocation,
  onCompleteTask,
  onBeginSelection,
}) {
  const { width } = useWindowDimensions();
  const compact = width < 480;
  const batch = useMemo(
    () => batches.find((item) => item.id === batchId) || batches[0],
    [batchId, batches],
  );
  const [modal, setModal] = useState(null);
  const currentBirds = Math.max(
    0,
    batch.birds - losses.reduce((sum, item) => sum + item.count, 0),
  );
  const totalLosses = batch.startingBirds - currentBirds;
  const ageDays = birdAgeDays(batch);
  const ready = ageDays >= readyDay;
  const location = locationOverride || batch.location;
  const progress = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        ((ageDays - RANGE_START_DAY) /
          Math.max(1, readyDay - RANGE_START_DAY)) *
          100,
      ),
    ),
  );
  const midpoint = Math.round((RANGE_START_DAY + readyDay) / 2);
  const stages = [
    { day: RANGE_START_DAY, label: "Month 4" },
    { day: midpoint, label: monthAge(midpoint) },
    { day: readyDay, label: monthAge(readyDay) },
    { day: readyDay + 1, label: "Ready" },
  ];
  const nextTask = scheduledTasks
    .filter((task) => task.enabled && !completedTasks[task.id])
    .sort((a, b) => a.day - b.day)[0];
  const selectionDate = dateAfterDays(batch.hatchDate, readyDay);
  const action = ready
    ? {
        icon: "account-search-outline",
        title: "Ready for Selection",
        detail: `Due ${selectionDate} - farmer confirmation required`,
        status: "Ready",
        tone: "#ffba56",
        button: "Begin Selection",
        press: () => setModal("selection"),
      }
    : nextTask && nextTask.day <= ageDays
      ? {
          icon: "medical-bag",
          title: nextTask.name,
          detail: `Due ${dateAfterDays(batch.hatchDate, nextTask.day)}`,
          status: ageDays > nextTask.day ? "Overdue" : "Due Today",
          tone: ageDays > nextTask.day ? "#ef7568" : ORANGE,
          button: "Mark Completed",
          press: () => onCompleteTask(nextTask.id),
        }
      : nextTask
        ? {
            icon: "calendar-clock",
            title: nextTask.name,
            detail: `Due ${dateAfterDays(batch.hatchDate, nextTask.day)} - ${nextTask.day - ageDays} days remaining`,
            status: "Upcoming",
            tone: ORANGE,
            button: "Mark Completed",
            press: () => onCompleteTask(nextTask.id),
          }
        : {
            icon: "account-search-outline",
            title: "Selection Approaching",
            detail: `All tasks completed - selection due ${selectionDate}`,
            status: "Tasks Complete",
            tone: "#6ee58c",
            button: "Begin Selection",
            press: () => setModal("selection"),
          };
  return (
    <View style={styles.screen}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.pageWrap}
      >
        <View style={styles.page}>
          <View style={styles.hero}>
            <Image
              source={HERO_IMAGE}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              contentPosition="center"
            />
            <LinearGradient
              colors={["rgba(2,7,9,.12)", "rgba(2,7,9,.25)", "#03090c"]}
              style={StyleSheet.absoluteFill}
            />
            <SafeAreaView edges={["top"]} style={styles.heroSafe}>
              <View style={styles.header}>
                <Pressable
                  accessibilityLabel="Back to ranging"
                  onPress={onBack}
                  style={styles.back}
                >
                  <Ionicons name="arrow-back" size={21} color="#fff" />
                </Pressable>
                <Text style={styles.headerTitle}>Ranging Batch</Text>
              </View>
              <View style={styles.heroCopy}>
                <Text style={styles.heroTitle}>{batch.id}</Text>
                <Text style={styles.heroDetail}>
                  {currentBirds} birds in {location}
                </Text>
              </View>
            </SafeAreaView>
          </View>
          <View style={[styles.content, compact && styles.contentCompact]}>
            <View style={styles.identity}>
              <View>
                <Text style={styles.eyebrow}>CURRENT BATCH</Text>
                <Text style={styles.identityTitle}>{currentBirds} birds</Text>
                <Text style={styles.identityMeta}>
                  {monthAge(ageDays)} - {location}
                </Text>
              </View>
              <View style={styles.readyPill}>
                <View style={styles.readyDot} />
                <Text style={styles.readyText}>
                  {ready ? "Ready for Selection" : "Ranging"}
                </Text>
              </View>
            </View>
            <Text style={styles.sectionTitle}>Ranging Progress</Text>
            <View style={styles.progressCard}>
              <View style={styles.progressTop}>
                <View>
                  <Text style={styles.progressAge}>{monthAge(ageDays)}</Text>
                  <Text style={styles.progressMessage}>
                    {ready
                      ? "Ready for the next farm stage"
                      : `${progress}% of the Ranging period complete`}
                  </Text>
                </View>
                <View>
                  <Text style={styles.nextLabel}>READY FOR SELECTION</Text>
                  <Text style={styles.nextValue}>Day {readyDay}</Text>
                </View>
              </View>
              <View style={styles.track}>
                <View style={[styles.fill, { width: `${progress}%` }]} />
              </View>
              <View style={styles.timeline}>
                {stages.map((stage) => {
                  const active = ageDays >= stage.day;
                  return (
                    <View
                      key={`${stage.day}-${stage.label}`}
                      style={styles.stage}
                    >
                      <View
                        style={[styles.stageDot, active && styles.stageActive]}
                      >
                        <MaterialCommunityIcons
                          name={
                            stage.label === "Ready"
                              ? "account-search-outline"
                              : "weather-sunny"
                          }
                          size={15}
                          color={active ? ORANGE : "#68767b"}
                        />
                      </View>
                      <Text
                        style={[
                          styles.stageLabel,
                          active && styles.stageLabelActive,
                        ]}
                      >
                        {stage.label}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
            <View style={styles.origin}>
              <View>
                <Text style={styles.infoLabel}>Ranging Started</Text>
                <Text style={styles.infoValue}>
                  {new Intl.DateTimeFormat("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  }).format(new Date(batch.rangingStartDate))}
                </Text>
              </View>
              <View style={styles.divider} />
              <View>
                <Text style={styles.infoLabel}>Growing Batch</Text>
                <Text style={styles.infoValue}>{batch.growingBatch}</Text>
              </View>
              <View style={styles.divider} />
              <View>
                <Text style={styles.infoLabel}>Range Area</Text>
                <Text style={styles.infoValue}>{location}</Text>
              </View>
            </View>
            <Text style={styles.sectionTitle}>Next Action</Text>
            <View style={styles.actionCard}>
              <View style={styles.actionIcon}>
                <MaterialCommunityIcons
                  name={action.icon}
                  size={24}
                  color={ORANGE}
                />
              </View>
              <View style={styles.actionCopy}>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionDetail}>{action.detail}</Text>
              </View>
              <View style={styles.actionControls}>
                <View
                  style={[
                    styles.actionStatus,
                    {
                      borderColor: `${action.tone}66`,
                      backgroundColor: `${action.tone}18`,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.actionStatusDot,
                      { backgroundColor: action.tone },
                    ]}
                  />
                  <Text
                    style={[styles.actionStatusText, { color: action.tone }]}
                  >
                    {action.status}
                  </Text>
                </View>
                {action.button && (
                  <Pressable onPress={action.press} style={styles.actionButton}>
                    <Text style={styles.actionButtonText}>{action.button}</Text>
                  </Pressable>
                )}
              </View>
            </View>
            <Text style={styles.sectionTitle}>Source Breakdown</Text>
            <View style={styles.sourceCard}>
              {batch.sources.map((source, index) => (
                <View
                  key={source.name}
                  style={[
                    styles.sourceRow,
                    index < batch.sources.length - 1 && styles.sourceDivider,
                  ]}
                >
                  <View style={styles.sourceIcon}>
                    <MaterialCommunityIcons
                      name="source-branch"
                      size={18}
                      color={ORANGE}
                    />
                  </View>
                  <View style={styles.sourceCopy}>
                    <Text style={styles.sourceName}>{source.name}</Text>
                    <Text style={styles.sourceMeta}>
                      {source.cross}
                      {source.marking ? ` - ${source.marking} marking` : ""}
                    </Text>
                  </View>
                  <Text style={styles.sourceBirds}>{source.birds} birds</Text>
                </View>
              ))}
            </View>
            <Text style={styles.sectionTitle}>Batch Summary</Text>
            <View style={styles.summary}>
              {[
                [batch.startingBirds, "Starting Birds"],
                [currentBirds, "Current Birds"],
                [totalLosses, "Total Losses"],
              ].map(([value, label], index) => (
                <View
                  key={label}
                  style={[
                    styles.summaryItem,
                    index < 2 && styles.summaryDivider,
                  ]}
                >
                  <Text
                    style={[
                      styles.summaryValue,
                      index === 2 && styles.lossValue,
                    ]}
                  >
                    {value}
                  </Text>
                  <Text style={styles.summaryLabel}>{label}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.sectionTitle}>Batch Management</Text>
            {ready && (
              <Pressable
                onPress={() => setModal("selection")}
                style={styles.primary}
              >
                <MaterialCommunityIcons
                  name="account-search-outline"
                  size={20}
                  color="#fff"
                />
                <Text style={styles.primaryText}>Begin Selection</Text>
              </Pressable>
            )}
            <Pressable
              onPress={() => setModal("loss")}
              style={styles.lossButton}
            >
              <MaterialCommunityIcons
                name="minus-circle-outline"
                size={20}
                color={ORANGE}
              />
              <Text style={styles.lossText}>Record Loss</Text>
            </Pressable>
            <View style={styles.secondary}>
              <Pressable
                onPress={() => setModal("location")}
                style={styles.secondaryButton}
              >
                <MaterialCommunityIcons
                  name="map-marker-outline"
                  size={18}
                  color={ORANGE}
                />
                <Text style={styles.secondaryText}>Change Range Area</Text>
              </Pressable>
              <Pressable
                onPress={() => Alert.alert("Close Batch", `Close ${batch.id}?`)}
                style={styles.secondaryButton}
              >
                <MaterialCommunityIcons
                  name="close-circle-outline"
                  size={18}
                  color="#ef7568"
                />
                <Text style={[styles.secondaryText, { color: "#ef7568" }]}>
                  Close Batch
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
      <FieldModal
        key={`${modal}-${location}`}
        visible={modal === "loss" || modal === "location"}
        type={modal}
        batch={batch}
        currentBirds={currentBirds}
        location={location}
        onClose={() => setModal(null)}
        onSave={(value) => {
          modal === "loss" ? onSaveLoss(value) : onChangeLocation(value);
          setModal(null);
        }}
      />
      <SelectionModal
        visible={modal === "selection"}
        batch={batch}
        currentBirds={currentBirds}
        options={selectionOptions}
        onClose={() => setModal(null)}
        onConfirm={(selection) => {
          setModal(null);
          onBeginSelection(batch, selection);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#020709" },
  pageWrap: { flexGrow: 1, alignItems: "center" },
  page: { width: "100%", maxWidth: 720 },
  hero: { height: 248, overflow: "hidden" },
  heroSafe: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "web" ? 10 : 3,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(190,204,208,.35)",
    backgroundColor: "rgba(2,8,11,.65)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { color: "#fff", fontSize: 15, fontWeight: "800" },
  heroCopy: { marginTop: "auto", padding: 20 },
  heroTitle: { color: "#fff", fontSize: 34, fontWeight: "800" },
  heroDetail: { marginTop: 4, color: "#c4cccf", fontSize: 11 },
  content: { padding: 16, paddingBottom: 30 },
  contentCompact: { paddingHorizontal: 10 },
  identity: {
    minHeight: 82,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "#23343b",
    backgroundColor: "#091317",
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  eyebrow: { color: ORANGE, fontSize: 7, fontWeight: "800" },
  identityTitle: {
    marginTop: 5,
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
  },
  identityMeta: { marginTop: 3, color: "#7c898e", fontSize: 9 },
  readyPill: {
    maxWidth: 135,
    minHeight: 24,
    borderRadius: 12,
    backgroundColor: "rgba(30,112,58,.24)",
    paddingHorizontal: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  readyDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#6ee58c",
  },
  readyText: {
    flexShrink: 1,
    color: "#6ee58c",
    fontSize: 8,
    fontWeight: "800",
  },
  sectionTitle: {
    marginTop: 20,
    marginBottom: 8,
    color: "#e8edef",
    fontSize: 15,
    fontWeight: "800",
  },
  progressCard: {
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "#26373e",
    backgroundColor: "#091317",
    overflow: "hidden",
  },
  progressTop: {
    minHeight: 108,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  progressAge: { color: "#fff", fontSize: 24, fontWeight: "800" },
  progressMessage: { marginTop: 5, color: "#849196", fontSize: 9 },
  nextLabel: { color: "#6f7d82", fontSize: 7, textAlign: "right" },
  nextValue: {
    marginTop: 4,
    color: ORANGE,
    fontSize: 13,
    fontWeight: "800",
    textAlign: "right",
  },
  track: { height: 5, marginHorizontal: 16, backgroundColor: "#1d2c31" },
  fill: { height: 5, backgroundColor: ORANGE },
  timeline: {
    minHeight: 88,
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#1d2d33",
    paddingTop: 12,
    flexDirection: "row",
  },
  stage: { flex: 1, alignItems: "center" },
  stageDot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#34444a",
    alignItems: "center",
    justifyContent: "center",
  },
  stageActive: { borderColor: ORANGE, backgroundColor: "#21170e" },
  stageLabel: { marginTop: 6, color: "#748187", fontSize: 7 },
  stageLabelActive: { color: ORANGE, fontWeight: "800" },
  origin: {
    minHeight: 60,
    marginTop: 8,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "#1d2d33",
    backgroundColor: "#081216",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  divider: { width: 1, height: 30, backgroundColor: "#213139" },
  infoLabel: { color: "#68767b", fontSize: 7, textAlign: "center" },
  infoValue: {
    maxWidth: 130,
    marginTop: 4,
    color: "#e0e6e8",
    fontSize: 9,
    fontWeight: "700",
    textAlign: "center",
  },
  actionCard: {
    minHeight: 98,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "#74410e",
    backgroundColor: "rgba(255,121,0,.06)",
    padding: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,121,0,.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  actionCopy: { flex: 1, minWidth: 0 },
  actionTitle: { color: "#f0f3f4", fontSize: 11, fontWeight: "800" },
  actionStatus: {
    minHeight: 21,
    maxWidth: 92,
    paddingHorizontal: 7,
    borderRadius: 11,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  actionStatusDot: { width: 5, height: 5, borderRadius: 3 },
  actionStatusText: { flexShrink: 1, fontSize: 7, fontWeight: "800" },
  actionDetail: { marginTop: 5, color: "#8d9a9e", fontSize: 8, lineHeight: 12 },
  actionControls: { width: 96, alignItems: "stretch", gap: 6 },
  actionButton: {
    width: "100%",
    height: 38,
    borderRadius: 6,
    backgroundColor: ORANGE,
    paddingHorizontal: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonText: { color: "#fff", fontSize: 8, fontWeight: "800" },
  sourceCard: {
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "#1d2d33",
    backgroundColor: "#091317",
    paddingHorizontal: 11,
  },
  sourceRow: {
    minHeight: 67,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  sourceDivider: { borderBottomWidth: 1, borderBottomColor: "#1b2a30" },
  sourceIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,121,0,.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  sourceCopy: { flex: 1 },
  sourceName: { color: "#edf1f2", fontSize: 11, fontWeight: "800" },
  sourceMeta: { marginTop: 3, color: "#7b898e", fontSize: 8 },
  sourceBirds: { color: ORANGE, fontSize: 9, fontWeight: "800" },
  summary: {
    minHeight: 88,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "#1d2d33",
    backgroundColor: "#091317",
    flexDirection: "row",
    alignItems: "center",
  },
  summaryItem: { flex: 1, alignItems: "center" },
  summaryDivider: { borderRightWidth: 1, borderRightColor: "#213139" },
  summaryValue: { color: "#fff", fontSize: 20, fontWeight: "800" },
  lossValue: { color: "#ef7568" },
  summaryLabel: { marginTop: 5, color: "#77858a", fontSize: 8 },
  primary: {
    height: 48,
    borderRadius: 7,
    backgroundColor: ORANGE,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  primaryText: { color: "#fff", fontSize: 10, fontWeight: "800" },
  lossButton: {
    height: 48,
    marginTop: 8,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: ORANGE,
    backgroundColor: "rgba(255,121,0,.08)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  lossText: { color: ORANGE, fontSize: 10, fontWeight: "800" },
  secondary: { marginTop: 8, flexDirection: "row", gap: 8 },
  secondaryButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "#27383f",
    backgroundColor: "#091317",
    padding: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  secondaryText: {
    flexShrink: 1,
    color: "#d9e0e2",
    fontSize: 9,
    fontWeight: "700",
    textAlign: "center",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,.76)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  modal: {
    width: "100%",
    maxWidth: 440,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2a3b42",
    backgroundColor: "#081216",
    padding: 16,
  },
  modalHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalTitle: { marginTop: 3, color: "#fff", fontSize: 20, fontWeight: "800" },
  close: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#111d21",
    alignItems: "center",
    justifyContent: "center",
  },
  band: {
    marginTop: 14,
    minHeight: 48,
    borderRadius: 6,
    backgroundColor: "rgba(255,121,0,.07)",
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bandText: { color: "#b2bdc0", fontSize: 9, fontWeight: "700" },
  fieldLabel: {
    marginTop: 13,
    marginBottom: 5,
    color: "#cfd6d8",
    fontSize: 9,
    fontWeight: "700",
  },
  field: {
    height: 42,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#293a41",
    backgroundColor: "#061014",
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  input: {
    flex: 1,
    height: 40,
    color: "#e7ebec",
    fontSize: 10,
    outlineStyle: "none",
  },
  note: {
    height: 68,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#293a41",
    backgroundColor: "#061014",
    padding: 10,
    color: "#e7ebec",
    fontSize: 10,
    textAlignVertical: "top",
    outlineStyle: "none",
  },
  modalActions: { marginTop: 16, flexDirection: "row", gap: 8 },
  cancel: {
    flex: 1,
    height: 44,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#2a3b42",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: { color: "#c8d0d2", fontSize: 10, fontWeight: "700" },
  save: {
    flex: 1,
    height: 44,
    borderRadius: 6,
    backgroundColor: ORANGE,
    alignItems: "center",
    justifyContent: "center",
  },
  saveDisabled: { opacity: 0.35 },
  saveText: { color: "#fff", fontSize: 10, fontWeight: "800" },
  selectionOptions: {
    marginTop: 15,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "#26373e",
    backgroundColor: "#061014",
    overflow: "hidden",
  },
  selectionOption: { minHeight: 48, paddingHorizontal: 11, flexDirection: "row", alignItems: "center", gap: 10 },
  selectionOptionActive: { backgroundColor: "rgba(255,121,0,.07)" },
  selectionOptionDivider: { borderBottomWidth: 1, borderBottomColor: "#1d2d33" },
  selectionOptionText: { flex: 1, color: "#aab4b7", fontSize: 10, fontWeight: "700" },
  selectionOptionTextActive: { color: "#fff" },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 1, borderColor: "#59676c", alignItems: "center", justifyContent: "center" },
  radioActive: { borderColor: ORANGE },
  radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: ORANGE },
  progressOverview: {
    minHeight: 86,
    marginTop: 16,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "#26373e",
    backgroundColor: "#061014",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  progressOverviewDivider: { width: 1, height: 42, backgroundColor: "#26373e" },
  progressOverviewValue: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
  },
  progressOverviewLabel: {
    marginTop: 4,
    color: "#7b898e",
    fontSize: 8,
    textAlign: "center",
  },
  modalProgressTrack: {
    height: 6,
    marginTop: 14,
    borderRadius: 3,
    backgroundColor: "#1d2c31",
    overflow: "hidden",
  },
  modalProgressFill: { height: 6, borderRadius: 3, backgroundColor: ORANGE },
  progressDates: {
    minHeight: 64,
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  progressDateValue: {
    marginTop: 5,
    color: "#e7ebec",
    fontSize: 10,
    fontWeight: "800",
  },
  progressNote: {
    minHeight: 62,
    marginBottom: 14,
    borderRadius: 7,
    backgroundColor: "rgba(255,121,0,.07)",
    padding: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  progressNoteText: { flex: 1, color: "#8e9b9f", fontSize: 8, lineHeight: 13 },
  selectionIcon: {
    width: 68,
    height: 68,
    marginTop: 18,
    alignSelf: "center",
    borderRadius: 34,
    backgroundColor: "rgba(255,121,0,.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  confirmTitle: {
    marginTop: 12,
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
    textAlign: "center",
  },
  confirmCopy: {
    marginTop: 7,
    color: "#839095",
    fontSize: 9,
    lineHeight: 14,
    textAlign: "center",
  },
});

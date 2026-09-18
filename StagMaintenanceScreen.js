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
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const HERO_IMAGE = require("./assets/hardening-card.png");
const ORANGE = "#ff7900";
const today = () =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

export const DEFAULT_STAG_AREAS = [
  {
    location: "Stag Area 1",
    birds: 42,
    startingBirds: 50,
    movedForward: 5,
    removed: 3,
    ageRange: "6-8 months",
    status: "Maintenance",
    nextTask: { name: "Health Check", due: "Sep 22, 2026", status: "Upcoming" },
    sources: [
      { marking: "TM-01", name: "Pure Kelso", birds: 18 },
      { marking: "TM-02", name: "Sweater x Kelso", birds: 14 },
      { marking: "TM-05", name: "Roundhead", birds: 10 },
    ],
    history: [
      { date: "Sep 18", text: "20 stags entered from Main Range" },
      { date: "Sep 25", text: "5 moved to another Stag Area" },
      { date: "Oct 2", text: "3 loss / adjustment" },
    ],
  },
  {
    location: "Stag Area 2",
    birds: 31,
    startingBirds: 31,
    movedForward: 0,
    removed: 0,
    ageRange: "7-9 months",
    status: "Maintenance",
    ready: true,
    nextTask: null,
    sources: [
      { marking: "TM-03", name: "Kelso", birds: 16 },
      { marking: "TM-06", name: "Sweater", birds: 15 },
    ],
    history: [{ date: "Sep 10", text: "31 stags entered from Back Range" }],
  },
];

function Hero({ title, subtitle, onBack, onSettings }) {
  return (
    <View style={styles.hero}>
      <Image
        source={HERO_IMAGE}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
      />
      <LinearGradient
        colors={["rgba(2,7,9,.14)", "rgba(2,7,9,.38)", "#03090c"]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView edges={["top"]} style={styles.heroSafe}>
        <View style={styles.header}>
          <Pressable onPress={onBack} style={styles.back}>
            <Ionicons name="arrow-back" size={21} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Stag Maintenance</Text>
          {onSettings && (
            <Pressable
              accessibilityLabel="Stag Maintenance settings"
              onPress={onSettings}
              style={styles.back}
            >
              <Ionicons name="settings-outline" size={21} color="#fff" />
            </Pressable>
          )}
        </View>
        <View style={styles.heroCopy}>
          <Text style={styles.heroTitle}>{title}</Text>
          <Text style={styles.heroSubtitle}>{subtitle}</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}
function Summary({ icon, value, label, detail }) {
  return (
    <View style={styles.summary}>
      <View style={styles.summaryTop}>
        <MaterialCommunityIcons name={icon} size={22} color={ORANGE} />
        <Text style={styles.summaryValue}>{value}</Text>
      </View>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryDetail}>{detail}</Text>
    </View>
  );
}

export default function StagMaintenanceScreen({
  areas,
  onBack,
  onOpenArea,
  onOpenSettings,
}) {
  const active = areas.filter((area) => area.birds > 0);
  const total = active.reduce((sum, area) => sum + area.birds, 0);
  const alerts = active.filter(
    (area) =>
      area.nextTask?.status === "Overdue" || area.nextTask?.status === "Due",
  ).length;
  const ready = active.filter((area) => area.ready).length;
  return (
    <View style={styles.screen}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.page}>
          <Hero
            title="Stag Maintenance"
            subtitle="Maintain selected stags by physical area and current count."
            onBack={onBack}
            onSettings={onOpenSettings}
          />
          <View style={styles.content}>
            <Text style={styles.overline}>MAINTENANCE DASHBOARD</Text>
            <View style={styles.summaryGrid}>
              <Summary
                icon="map-marker-multiple-outline"
                value={active.length}
                label="Maintenance Areas"
                detail="active locations"
              />
              <Summary
                icon="bird"
                value={total}
                label="Total Stags"
                detail="across all areas"
              />
              <Summary
                icon="alert-circle-outline"
                value={alerts}
                label="Tasks Due / Alerts"
                detail="requires action"
              />
              <Summary
                icon="arrow-right-circle-outline"
                value={ready}
                label="Ready for Next Stage"
                detail="marked ready"
              />
            </View>
            <View style={styles.sectionHead}>
              <View>
                <Text style={styles.overline}>STAG AREAS</Text>
                <Text style={styles.sectionTitle}>Maintenance areas</Text>
              </View>
              <Text style={styles.count}>{active.length} active</Text>
            </View>
            <View style={styles.areaList}>
              {active.map((area) => (
                <Pressable
                  key={area.location}
                  onPress={() => onOpenArea(area.location)}
                  style={({ pressed }) => [
                    styles.areaCard,
                    pressed && styles.pressed,
                  ]}
                >
                  <View style={styles.areaTop}>
                    <View style={styles.areaIdentity}>
                      <View style={styles.areaIcon}>
                        <MaterialCommunityIcons
                          name="shield-check-outline"
                          size={22}
                          color={ORANGE}
                        />
                      </View>
                      <View>
                        <Text style={styles.areaName}>{area.location}</Text>
                        <Text style={styles.areaBirds}>{area.birds} stags</Text>
                      </View>
                    </View>
                    <View style={styles.status}>
                      <View style={styles.statusDot} />
                      <Text style={styles.statusText}>Maintenance</Text>
                    </View>
                  </View>
                  <View style={styles.areaMeta}>
                    <Text style={styles.metaText}>{area.ageRange}</Text>
                    {area.nextTask && (
                      <Text style={styles.taskText}>
                        {area.nextTask.name} · {area.nextTask.due}
                      </Text>
                    )}
                  </View>
                  <View style={styles.cardFoot}>
                    <Text style={styles.cardAction}>
                      {area.nextTask ? "Next task scheduled" : "On track"}
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color="#6f7d82"
                    />
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function Choice({ label, value, onChange }) {
  return (
    <View>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.choiceRow}>
        {["Okay", "Issue"].map((option) => (
          <Pressable
            key={option}
            onPress={() => onChange(option)}
            style={[styles.choice, value === option && styles.choiceActive]}
          >
            <Text
              style={[
                styles.choiceText,
                value === option && styles.choiceTextActive,
              ]}
            >
              {option}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
function ActionModal({ visible, type, area, onClose, onSave }) {
  const [quantity, setQuantity] = useState("");
  const [destination, setDestination] = useState("");
  const [note, setNote] = useState("");
  const [condition, setCondition] = useState("Okay");
  const [feed, setFeed] = useState("Okay");
  const [housing, setHousing] = useState("Okay");
  const [health, setHealth] = useState("Okay");
  const count = Number.parseInt(quantity, 10) || 0;
  const remain = area.birds - count;
  const title =
    type === "check"
      ? "Maintenance Check"
      : type === "move"
        ? "Move Stags"
        : type === "loss"
          ? "Record Loss / Adjustment"
          : "Proceed to Next Stage";
  const save = () => {
    if (type === "check")
      return onSave({
        condition,
        feed,
        housing,
        health,
        note: note.trim(),
        date: today(),
      });
    if (count < 1 || count > area.birds)
      return Alert.alert(
        "Check quantity",
        `Enter a number from 1 to ${area.birds}.`,
      );
    if ((type === "move" || type === "proceed") && !destination.trim())
      return Alert.alert("Destination required", "Select a destination area.");
    if (type === "move" && destination.trim() === area.location)
      return Alert.alert(
        "Choose another area",
        "The destination must be different from the current Stag Maintenance area.",
      );
    onSave({
      count,
      destination: destination.trim(),
      note: note.trim(),
      date: today(),
      remain,
    });
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
        <ScrollView
          style={styles.modalScroll}
          contentContainerStyle={styles.modalWrap}
        >
          <View style={styles.modal}>
            <View style={styles.modalHead}>
              <View>
                <Text style={styles.overline}>
                  {area.location.toUpperCase()}
                </Text>
                <Text style={styles.modalTitle}>{title}</Text>
              </View>
              <Pressable onPress={onClose} style={styles.close}>
                <Ionicons name="close" size={20} color="#fff" />
              </Pressable>
            </View>
            {type === "check" ? (
              <>
                <Choice
                  label="General Condition"
                  value={condition}
                  onChange={setCondition}
                />
                <Choice label="Feed & Water" value={feed} onChange={setFeed} />
                <Choice
                  label="Housing / Area"
                  value={housing}
                  onChange={setHousing}
                />
                <Choice
                  label="Injuries / Health Concern"
                  value={health}
                  onChange={setHealth}
                />
                <Text style={styles.fieldLabel}>Optional Note</Text>
                <TextInput
                  value={note}
                  onChangeText={setNote}
                  multiline
                  placeholder="Observation"
                  placeholderTextColor="#68777c"
                  style={[styles.input, styles.note]}
                />
              </>
            ) : (
              <>
                <View style={styles.currentBand}>
                  <Text style={styles.currentLabel}>CURRENT STAGS</Text>
                  <Text style={styles.currentValue}>{area.birds}</Text>
                </View>
                <Text style={styles.fieldLabel}>
                  {type === "proceed" ? "Ready / Proceed" : "Quantity"}
                </Text>
                <TextInput
                  value={quantity}
                  onChangeText={(value) =>
                    setQuantity(value.replace(/[^0-9]/g, ""))
                  }
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor="#68777c"
                  style={styles.input}
                />
                {type === "proceed" && (
                  <View style={styles.remain}>
                    <Text style={styles.remainLabel}>
                      Remain in Maintenance
                    </Text>
                    <Text style={styles.remainValue}>
                      {Math.max(0, remain)}
                    </Text>
                  </View>
                )}
                {(type === "move" || type === "proceed") && (
                  <>
                    <Text style={styles.fieldLabel}>
                      {type === "move"
                        ? "Destination Stag Area"
                        : "Next-stage Destination"}
                    </Text>
                    <TextInput
                      value={destination}
                      onChangeText={setDestination}
                      placeholder="Select destination area"
                      placeholderTextColor="#68777c"
                      style={styles.input}
                    />
                  </>
                )}
                {type === "loss" && (
                  <>
                    <Text style={styles.fieldLabel}>Note (optional)</Text>
                    <TextInput
                      value={note}
                      onChangeText={setNote}
                      placeholder="Reason or adjustment"
                      placeholderTextColor="#68777c"
                      style={styles.input}
                    />
                  </>
                )}
                <View style={styles.date}>
                  <MaterialCommunityIcons
                    name="calendar-outline"
                    size={16}
                    color={ORANGE}
                  />
                  <Text style={styles.dateText}>{today()}</Text>
                </View>
              </>
            )}
            <View style={styles.modalActions}>
              <Pressable onPress={onClose} style={styles.cancel}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable onPress={save} style={styles.save}>
                <Text style={styles.saveText}>
                  {type === "check"
                    ? "Complete Check"
                    : type === "move"
                      ? "Confirm Move"
                      : type === "proceed"
                        ? "Confirm"
                        : "Save"}
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

export function StagMaintenanceAreaDetail({
  area,
  onBack,
  onCheck,
  onMove,
  onLoss,
  onHealth,
  onProceed,
}) {
  const [modal, setModal] = useState(null);
  const task = area.nextTask;
  const action =
    task && !task.completed
      ? {
          title: task.name,
          detail: `Due ${task.due}`,
          status: task.status || "Upcoming",
          button: "Mark Completed",
          press: onHealth,
          icon: "medical-bag",
        }
      : area.ready
        ? {
            title: "Ready for Next Stage",
            detail: "Move ready stags forward when the breeder confirms",
            status: "Ready",
            button: "Proceed",
            press: () => setModal("proceed"),
            icon: "arrow-right-circle-outline",
          }
        : {
            title: "Maintenance Check",
            detail: "Review condition, feed, water, housing, and health",
            status: "Upcoming",
            button: "Complete Check",
            press: () => setModal("check"),
            icon: "clipboard-check-outline",
          };
  const sourceComposition = useMemo(() => {
    const total =
      area.sources.reduce((sum, source) => sum + source.birds, 0) || 1;
    let assigned = 0;
    return area.sources.map((source, index) => {
      const birds =
        index === area.sources.length - 1
          ? area.birds - assigned
          : Math.round((source.birds / total) * area.birds);
      assigned += birds;
      return { ...source, birds };
    });
  }, [area]);
  const complete = (handler) => (record) => {
    handler(record);
    setModal(null);
  };
  return (
    <View style={styles.screen}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.page}>
          <Hero
            title={area.location}
            subtitle={`${area.birds} stags · ${area.ageRange}`}
            onBack={onBack}
          />
          <View style={styles.content}>
            <View style={styles.identity}>
              <View>
                <Text style={styles.overline}>CURRENT AREA</Text>
                <Text style={styles.identityValue}>{area.birds} stags</Text>
                <Text style={styles.muted}>
                  {area.ageRange} · {area.location}
                </Text>
              </View>
              <View style={styles.status}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Maintenance</Text>
              </View>
            </View>
            <Text style={styles.sectionTitle}>Maintenance Summary</Text>
            <View style={styles.metrics}>
              {[
                [area.startingBirds, "Birds Entered"],
                [area.birds, "Current Stags"],
                [area.movedForward || 0, "Moved Forward"],
                [area.removed || 0, "Loss / Removed"],
              ].map(([value, label]) => (
                <View key={label} style={styles.metric}>
                  <Text style={styles.metricValue}>{value}</Text>
                  <Text style={styles.metricLabel}>{label}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.sectionTitle}>Next Action</Text>
            <View style={styles.nextAction}>
              <View style={styles.nextIcon}>
                <MaterialCommunityIcons
                  name={action.icon}
                  size={22}
                  color={ORANGE}
                />
              </View>
              <View style={styles.flex}>
                <Text style={styles.rowTitle}>{action.title}</Text>
                <Text style={styles.rowMeta}>{action.detail}</Text>
              </View>
              <View style={styles.nextControls}>
                <View style={styles.nextStatus}>
                  <Text style={styles.nextStatusText}>{action.status}</Text>
                </View>
                <Pressable onPress={action.press} style={styles.nextButton}>
                  <Text style={styles.nextButtonText}>{action.button}</Text>
                </Pressable>
              </View>
            </View>
            <Text style={styles.sectionTitle}>Source / Traceability</Text>
            <View style={styles.panel}>
              {sourceComposition.map((source, index) => (
                <View
                  key={`${source.marking}-${index}`}
                  style={[
                    styles.sourceRow,
                    index < sourceComposition.length - 1 && styles.divider,
                  ]}
                >
                  <View>
                    <Text style={styles.rowTitle}>
                      {source.marking} · {source.name}
                    </Text>
                    <Text style={styles.rowMeta}>
                      Hatch, growing, and ranging history preserved
                    </Text>
                  </View>
                  <Text style={styles.sourceCount}>{source.birds}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.sectionTitle}>Health / Vaccination</Text>
            <View style={styles.health}>
              <MaterialCommunityIcons name="needle" size={22} color={ORANGE} />
              <View style={styles.flex}>
                <Text style={styles.rowTitle}>
                  {task?.name || "Farm health schedule"}
                </Text>
                <Text style={styles.rowMeta}>
                  {task ? `Due ${task.due}` : "No health task currently due"}
                </Text>
              </View>
              <View style={styles.healthStatus}>
                <Text style={styles.healthStatusText}>
                  {task?.completed ? "Completed" : task?.status || "On Track"}
                </Text>
              </View>
            </View>
            {task && !task.completed && (
              <Pressable onPress={onHealth} style={styles.outline}>
                <MaterialCommunityIcons
                  name="check-circle-outline"
                  size={18}
                  color={ORANGE}
                />
                <Text style={styles.outlineText}>Mark Completed</Text>
              </Pressable>
            )}
            <Text style={styles.sectionTitle}>Movement History</Text>
            <View style={styles.panel}>
              {area.history.slice(0, 6).map((item, index) => (
                <View
                  key={`${item.date}-${index}`}
                  style={[
                    styles.history,
                    index < area.history.length - 1 && styles.divider,
                  ]}
                >
                  <Text style={styles.historyDate}>{item.date}</Text>
                  <Text style={styles.historyText}>{item.text}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.sectionTitle}>Main Actions</Text>
            <View style={styles.actions}>
              <Pressable
                onPress={() => setModal("check")}
                style={styles.mainAction}
              >
                <MaterialCommunityIcons
                  name="clipboard-check-outline"
                  size={19}
                  color={ORANGE}
                />
                <Text style={styles.actionText}>Maintenance Check</Text>
              </Pressable>
              <Pressable
                onPress={() => setModal("move")}
                style={styles.mainAction}
              >
                <MaterialCommunityIcons
                  name="swap-horizontal"
                  size={19}
                  color={ORANGE}
                />
                <Text style={styles.actionText}>Move Stags</Text>
              </Pressable>
              <Pressable
                onPress={() => setModal("loss")}
                style={styles.mainAction}
              >
                <MaterialCommunityIcons
                  name="minus-circle-outline"
                  size={19}
                  color={ORANGE}
                />
                <Text style={styles.actionText}>Loss / Adjustment</Text>
              </Pressable>
              <Pressable onPress={onHealth} style={styles.mainAction}>
                <MaterialCommunityIcons
                  name="medical-bag"
                  size={19}
                  color={ORANGE}
                />
                <Text style={styles.actionText}>Health / Vaccination</Text>
              </Pressable>
              <Pressable
                onPress={() => setModal("proceed")}
                style={styles.proceed}
              >
                <MaterialCommunityIcons
                  name="arrow-right-circle-outline"
                  size={20}
                  color="#fff"
                />
                <Text style={styles.proceedText}>Proceed to Next Stage</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
      <ActionModal
        key={modal}
        visible={Boolean(modal)}
        type={modal}
        area={area}
        onClose={() => setModal(null)}
        onSave={complete(
          modal === "check"
            ? onCheck
            : modal === "move"
              ? onMove
              : modal === "loss"
                ? onLoss
                : onProceed,
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#020709" },
  page: { width: "100%", maxWidth: 720, alignSelf: "center" },
  hero: { height: 260, overflow: "hidden" },
  heroSafe: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "web" ? 10 : 3,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    justifyContent: "space-between",
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
  headerTitle: { flex: 1, color: "#fff", fontSize: 15, fontWeight: "800" },
  heroCopy: { marginTop: "auto", padding: 20 },
  heroTitle: {
    color: "#fff",
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "800",
    fontFamily: Platform.select({
      ios: "Georgia",
      android: "serif",
      web: "Georgia",
    }),
  },
  heroSubtitle: { marginTop: 4, color: "#c9d1d3", fontSize: 11 },
  content: { padding: 16, paddingBottom: 38 },
  overline: { color: "#849196", fontSize: 8, fontWeight: "800" },
  summaryGrid: { marginTop: 9, flexDirection: "row", gap: 8 },
  summary: {
    flex: 1,
    minWidth: 0,
    height: 108,
    padding: 7,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "#26373e",
    backgroundColor: "#091317",
    alignItems: "center",
    justifyContent: "center",
  },
  summaryTop: { flexDirection: "row", alignItems: "center", gap: 8 },
  summaryValue: { color: "#fff", fontSize: 18, fontWeight: "800" },
  summaryLabel: {
    marginTop: 8,
    color: "#e2e7e8",
    fontSize: 9,
    textAlign: "center",
  },
  summaryDetail: {
    marginTop: 4,
    color: "#6f7d82",
    fontSize: 7,
    textAlign: "center",
  },
  sectionHead: {
    marginTop: 22,
    marginBottom: 9,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  sectionTitle: {
    marginTop: 22,
    marginBottom: 9,
    color: "#edf1f2",
    fontSize: 15,
    fontWeight: "800",
  },
  count: {
    color: "#839095",
    fontSize: 8,
    borderWidth: 1,
    borderColor: "#26373e",
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  areaList: { gap: 8 },
  areaCard: {
    padding: 12,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "#26373e",
    backgroundColor: "#091317",
  },
  areaTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  areaIdentity: { flexDirection: "row", alignItems: "center", gap: 10 },
  areaIcon: {
    width: 42,
    height: 42,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "#624019",
    backgroundColor: "rgba(255,121,0,.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  areaName: { color: "#fff", fontSize: 13, fontWeight: "800" },
  areaBirds: { marginTop: 3, color: "#7d8a8f", fontSize: 8 },
  status: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "rgba(110,229,140,.1)",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#6ee58c",
  },
  statusText: { color: "#6ee58c", fontSize: 8, fontWeight: "800" },
  areaMeta: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  metaText: { color: "#cbd3d5", fontSize: 9, fontWeight: "700" },
  taskText: { color: ORANGE, fontSize: 8 },
  cardFoot: {
    marginTop: 10,
    paddingTop: 9,
    borderTopWidth: 1,
    borderTopColor: "#203038",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardAction: { color: "#728086", fontSize: 8 },
  pressed: { opacity: 0.75 },
  identity: {
    minHeight: 96,
    padding: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "#26373e",
    backgroundColor: "#091317",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  identityValue: {
    marginTop: 5,
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
  },
  muted: { marginTop: 4, color: "#7d8a8f", fontSize: 8 },
  metrics: {
    flexDirection: "row",
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "#26373e",
    backgroundColor: "#091317",
    overflow: "hidden",
  },
  metric: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 16,
    paddingHorizontal: 4,
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: "#203038",
  },
  metricValue: { color: "#fff", fontSize: 17, fontWeight: "800" },
  metricLabel: {
    marginTop: 5,
    color: "#748187",
    fontSize: 7,
    textAlign: "center",
  },
  nextAction: {
    minHeight: 96,
    padding: 11,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "#8a4a09",
    backgroundColor: "#140f08",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  nextIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,121,0,.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  flex: { flex: 1 },
  rowTitle: { color: "#e8edef", fontSize: 10, fontWeight: "800" },
  rowMeta: { marginTop: 4, color: "#758389", fontSize: 7 },
  nextControls: { alignItems: "flex-end", gap: 7 },
  nextStatus: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,186,86,.35)",
  },
  nextStatusText: { color: "#ffba56", fontSize: 7, fontWeight: "800" },
  nextButton: {
    minWidth: 108,
    height: 38,
    paddingHorizontal: 9,
    borderRadius: 6,
    backgroundColor: ORANGE,
    alignItems: "center",
    justifyContent: "center",
  },
  nextButtonText: { color: "#fff", fontSize: 9, fontWeight: "800" },
  panel: {
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "#26373e",
    backgroundColor: "#091317",
    overflow: "hidden",
  },
  sourceRow: {
    minHeight: 60,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  sourceCount: { color: ORANGE, fontSize: 12, fontWeight: "800" },
  divider: { borderBottomWidth: 1, borderBottomColor: "#203038" },
  health: {
    minHeight: 76,
    padding: 12,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "#26373e",
    backgroundColor: "#091317",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  healthStatus: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "rgba(255,186,86,.1)",
  },
  healthStatusText: { color: "#ffba56", fontSize: 7, fontWeight: "800" },
  outline: {
    height: 44,
    marginTop: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: ORANGE,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  outlineText: { color: ORANGE, fontSize: 9, fontWeight: "800" },
  history: {
    minHeight: 50,
    padding: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  historyDate: { width: 62, color: ORANGE, fontSize: 8, fontWeight: "800" },
  historyText: { flex: 1, color: "#cbd3d5", fontSize: 9 },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  mainAction: {
    width: "48%",
    flexGrow: 1,
    minHeight: 48,
    paddingHorizontal: 9,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#2a3b42",
    backgroundColor: "#091317",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  actionText: { color: "#d7dddf", fontSize: 9, fontWeight: "700" },
  proceed: {
    width: "100%",
    height: 48,
    borderRadius: 6,
    backgroundColor: ORANGE,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  proceedText: { color: "#fff", fontSize: 10, fontWeight: "800" },
  backdrop: { flex: 1, padding: 16, backgroundColor: "rgba(0,0,0,.76)" },
  modalScroll: { width: "100%" },
  modalWrap: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  modal: {
    width: "100%",
    maxWidth: 440,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#314249",
    backgroundColor: "#071115",
  },
  modalHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalTitle: { color: "#fff", fontSize: 18, fontWeight: "800" },
  close: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#101c21",
    alignItems: "center",
    justifyContent: "center",
  },
  fieldLabel: {
    marginTop: 12,
    marginBottom: 6,
    color: "#cbd3d5",
    fontSize: 9,
    fontWeight: "700",
  },
  choiceRow: { flexDirection: "row", gap: 8 },
  choice: {
    flex: 1,
    height: 39,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#2a3b42",
    alignItems: "center",
    justifyContent: "center",
  },
  choiceActive: { borderColor: ORANGE, backgroundColor: "rgba(255,121,0,.08)" },
  choiceText: { color: "#849196", fontSize: 9, fontWeight: "700" },
  choiceTextActive: { color: ORANGE },
  input: {
    height: 42,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#2a3b42",
    backgroundColor: "#061014",
    paddingHorizontal: 11,
    color: "#fff",
    fontSize: 10,
    outlineStyle: "none",
  },
  note: { height: 74, paddingTop: 10, textAlignVertical: "top" },
  currentBand: {
    height: 56,
    marginTop: 14,
    paddingHorizontal: 12,
    borderRadius: 7,
    backgroundColor: "rgba(255,121,0,.08)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  currentLabel: { color: "#839095", fontSize: 8, fontWeight: "800" },
  currentValue: { color: "#fff", fontSize: 19, fontWeight: "800" },
  remain: {
    height: 46,
    marginTop: 10,
    paddingHorizontal: 11,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#2a3b42",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  remainLabel: { color: "#cbd3d5", fontSize: 9 },
  remainValue: { color: "#6ee58c", fontSize: 15, fontWeight: "800" },
  date: { marginTop: 12, flexDirection: "row", alignItems: "center", gap: 7 },
  dateText: { color: "#9da8ac", fontSize: 9 },
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
  cancelText: { color: "#cbd3d5", fontSize: 10, fontWeight: "700" },
  save: {
    flex: 1,
    height: 44,
    borderRadius: 6,
    backgroundColor: ORANGE,
    alignItems: "center",
    justifyContent: "center",
  },
  saveText: { color: "#fff", fontSize: 10, fontWeight: "800" },
});

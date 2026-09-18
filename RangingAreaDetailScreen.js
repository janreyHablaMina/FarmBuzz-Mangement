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

const HERO_IMAGE = require("./assets/ranging-card.png");
const ORANGE = "#ff7900";
const today = () =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date());
const formatDate = (date) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
const scheduledDate = (start, day) => {
  const date = new Date(start);
  date.setDate(date.getDate() + day);
  return date;
};

function Metric({ value, label, accent }) {
  return (
    <View style={styles.metric}>
      <Text style={[styles.metricValue, accent && { color: accent }]}>
        {value}
      </Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function SelectionModal({ visible, area, onClose, onConfirm }) {
  const [ready, setReady] = useState("");
  const [removed, setRemoved] = useState("");
  const [destination, setDestination] = useState("");
  const readyCount = Number.parseInt(ready, 10) || 0;
  const removedCount = Number.parseInt(removed, 10) || 0;
  const remain = area.birds - readyCount - removedCount;
  const update = (setter) => (value) => setter(value.replace(/[^0-9]/g, ""));
  const confirm = () => {
    if (remain < 0)
      return Alert.alert(
        "Check quantities",
        `Selection cannot exceed ${area.birds} current birds.`,
      );
    if (readyCount < 1 && removedCount < 1)
      return Alert.alert(
        "Selection required",
        "Enter birds to proceed or remove.",
      );
    if (readyCount > 0 && !destination.trim())
      return Alert.alert(
        "Destination required",
        "Select the Stag Maintenance area for ready birds.",
      );
    onConfirm({
      ready: readyCount,
      removed: removedCount,
      remain,
      destination: destination.trim(),
      date: today(),
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
        <View style={styles.modal}>
          <View style={styles.modalHead}>
            <View>
              <Text style={styles.overline}>RECORD MOVEMENT</Text>
              <Text style={styles.modalTitle}>Record Selection</Text>
            </View>
            <Pressable onPress={onClose} style={styles.close}>
              <Ionicons name="close" size={20} color="#fff" />
            </Pressable>
          </View>
          <View style={styles.currentBand}>
            <Text style={styles.currentBandLabel}>CURRENT BIRDS</Text>
            <Text style={styles.currentBandValue}>{area.birds}</Text>
          </View>
          <Text style={styles.fieldLabel}>Ready / Proceed</Text>
          <TextInput
            value={ready}
            onChangeText={update(setReady)}
            keyboardType="number-pad"
            placeholder="0"
            placeholderTextColor="#68777c"
            style={styles.input}
          />
          <Text style={styles.fieldLabel}>Remove / Cull</Text>
          <TextInput
            value={removed}
            onChangeText={update(setRemoved)}
            keyboardType="number-pad"
            placeholder="0"
            placeholderTextColor="#68777c"
            style={styles.input}
          />
          <View style={styles.remainRow}>
            <Text style={styles.remainLabel}>Recheck / Remain</Text>
            <Text style={[styles.remainValue, remain < 0 && styles.danger]}>
              {remain}
            </Text>
          </View>
          {readyCount > 0 && (
            <>
              <Text style={styles.fieldLabel}>Ready Destination</Text>
              <TextInput
                value={destination}
                onChangeText={setDestination}
                placeholder="Select Stag Maintenance Area"
                placeholderTextColor="#68777c"
                style={styles.input}
              />
            </>
          )}
          <View style={styles.dateRow}>
            <MaterialCommunityIcons
              name="calendar-outline"
              size={16}
              color={ORANGE}
            />
            <Text style={styles.dateText}>{today()}</Text>
          </View>
          <View style={styles.modalActions}>
            <Pressable onPress={onClose} style={styles.cancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable onPress={confirm} style={styles.confirm}>
              <Text style={styles.confirmText}>Confirm</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function SimpleModal({ visible, title, area, type, onClose, onConfirm }) {
  const [count, setCount] = useState("");
  const [destination, setDestination] = useState("");
  const [note, setNote] = useState("");
  const save = () => {
    const quantity = Number.parseInt(count, 10) || 0;
    if (type !== "area" && (quantity < 1 || quantity > area.birds))
      return Alert.alert(
        "Check quantity",
        `Enter a number from 1 to ${area.birds}.`,
      );
    if ((type === "move" || type === "area") && !destination.trim())
      return Alert.alert("Location required", "Enter an area or location.");
    onConfirm({
      count: quantity,
      destination: destination.trim(),
      note: note.trim(),
      date: today(),
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
        <View style={styles.modal}>
          <View style={styles.modalHead}>
            <Text style={styles.modalTitle}>{title}</Text>
            <Pressable onPress={onClose} style={styles.close}>
              <Ionicons name="close" size={20} color="#fff" />
            </Pressable>
          </View>
          {type !== "area" && (
            <>
              <Text style={styles.fieldLabel}>
                {type === "move" ? "Birds to Move" : "Birds Lost / Adjusted"}
              </Text>
              <TextInput
                value={count}
                onChangeText={(value) => setCount(value.replace(/[^0-9]/g, ""))}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor="#68777c"
                style={styles.input}
              />
            </>
          )}{" "}
          {type === "move" && (
            <>
              <Text style={styles.fieldLabel}>Destination Range Area</Text>
              <TextInput
                value={destination}
                onChangeText={setDestination}
                placeholder="e.g. Back Range"
                placeholderTextColor="#68777c"
                style={styles.input}
              />
            </>
          )}
          {type === "area" && (
            <>
              <Text style={styles.fieldLabel}>New Area Name</Text>
              <TextInput
                value={destination}
                onChangeText={setDestination}
                placeholder={area.location}
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
          <View style={styles.modalActions}>
            <Pressable onPress={onClose} style={styles.cancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable onPress={save} style={styles.confirm}>
              <Text style={styles.confirmText}>Save</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function RangingAreaDetailScreen({
  area,
  vaccine,
  readyDay,
  vaccinationDone,
  onBack,
  onRecordSelection,
  onMoveBirds,
  onRecordLoss,
  onRecordVaccination,
  onChangeArea,
}) {
  const [modal, setModal] = useState(null);
  const composition = useMemo(() => {
    const map = new Map();
    (area.sources || []).forEach((source) => {
      const key = `${source.marking || "No marking"}|${source.cross || source.name}`;
      const item = map.get(key) || {
        marking: source.marking || "No marking",
        name: source.cross || source.name,
        birds: 0,
      };
      item.birds += source.birds || 0;
      map.set(key, item);
    });
    const original = [...map.values()];
    const total = original.reduce((sum, item) => sum + item.birds, 0) || 1;
    let assigned = 0;
    return original.map((item, index) => {
      const birds =
        index === original.length - 1
          ? area.birds - assigned
          : Math.round((item.birds / total) * area.birds);
      assigned += birds;
      return { ...item, birds };
    });
  }, [area]);
  const history = area.selection?.history || [];
  const proceeded = area.selection?.moved || 0;
  const removed = area.selection?.removed || 0;
  const entered = area.startingBirds;
  const selectionDate = scheduledDate(area.hatchDate, readyDay);
  const vaccineDate = vaccine?.day
    ? scheduledDate(area.hatchDate, vaccine.day)
    : null;
  const nextAction = useMemo(() => {
    const actions = [];
    if (vaccineDate && !vaccinationDone) {
      actions.push({
        type: "vaccine",
        title: vaccine?.name || "Scheduled Vaccination",
        detail: `Due ${formatDate(vaccineDate)}`,
        date: vaccineDate,
        icon: "needle",
        button: "Mark Completed",
      });
    }
    actions.push({
      type: "selection",
      title: "Record Selection",
      detail: `Ready date ${formatDate(selectionDate)}`,
      date: selectionDate,
      icon: "account-search-outline",
      button: "Record Selection",
    });
    const action = actions.sort((a, b) => a.date - b.date)[0];
    const current = new Date();
    current.setHours(0, 0, 0, 0);
    const due = new Date(action.date);
    due.setHours(0, 0, 0, 0);
    const difference = Math.round((due - current) / 86400000);
    return {
      ...action,
      status:
        difference < 0
          ? "Overdue"
          : difference === 0
            ? "Due Today"
            : action.type === "selection" &&
                area.status === "Ready for Selection"
              ? "Ready"
              : "Upcoming",
      timing:
        difference < 0
          ? `${Math.abs(difference)} days overdue`
          : difference === 0
            ? "Due today"
            : `${difference} days remaining`,
    };
  }, [area.status, selectionDate, vaccinationDone, vaccine, vaccineDate]);
  const nextTone =
    nextAction.status === "Overdue"
      ? "#ef7568"
      : nextAction.status === "Ready"
        ? "#6ee58c"
        : "#ffba56";
  const complete = (handler) => (record) => {
    handler(record);
    setModal(null);
  };
  return (
    <View style={styles.screen}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.page}>
          <View style={styles.hero}>
            <Image
              source={HERO_IMAGE}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
            />
            <LinearGradient
              colors={["rgba(2,7,9,.18)", "rgba(2,7,9,.4)", "#03090c"]}
              style={StyleSheet.absoluteFill}
            />
            <SafeAreaView edges={["top"]} style={styles.heroSafe}>
              <View style={styles.header}>
                <Pressable onPress={onBack} style={styles.back}>
                  <Ionicons name="arrow-back" size={21} color="#fff" />
                </Pressable>
                <Text style={styles.headerTitle}>Ranging Area</Text>
              </View>
              <View style={styles.heroCopy}>
                <Text style={styles.heroTitle}>{area.location}</Text>
                <Text style={styles.heroMeta}>
                  {area.birds} males · {area.ageRange}
                </Text>
              </View>
            </SafeAreaView>
          </View>
          <View style={styles.content}>
            <View style={styles.identity}>
              <View>
                <Text style={styles.overline}>CURRENT AREA</Text>
                <Text style={styles.identityValue}>{area.birds} males</Text>
                <Text style={styles.muted}>
                  {area.ageRange} ·{" "}
                  {area.lastSelectionDate
                    ? `Last selection ${area.lastSelectionDate}`
                    : "No selection recorded"}
                </Text>
              </View>
              <View style={styles.status}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Ranging</Text>
              </View>
            </View>
            <View style={styles.infoStrip}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Ranging Started</Text>
                <Text style={styles.infoValue}>Sep 1, 2026</Text>
              </View>
              <View style={styles.infoDivider} />
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Last Selection</Text>
                <Text style={styles.infoValue}>
                  {area.lastSelectionDate || "Not yet"}
                </Text>
              </View>
              <View style={styles.infoDivider} />
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Source Batches</Text>
                <Text style={styles.infoValue}>
                  {area.batches?.length || 1}
                </Text>
              </View>
            </View>
            <Text style={styles.sectionTitle}>Area Snapshot</Text>
            <View style={styles.snapshotGrid}>
              <View style={styles.snapshot}>
                <MaterialCommunityIcons name="bird" size={22} color={ORANGE} />
                <Text style={styles.snapshotValue}>{area.birds}</Text>
                <Text style={styles.snapshotLabel}>Current Birds</Text>
              </View>
              <View style={styles.snapshot}>
                <MaterialCommunityIcons
                  name="source-branch"
                  size={22}
                  color={ORANGE}
                />
                <Text style={styles.snapshotValue}>{composition.length}</Text>
                <Text style={styles.snapshotLabel}>Source Groups</Text>
              </View>
              <View style={styles.snapshot}>
                <MaterialCommunityIcons
                  name="map-marker-outline"
                  size={22}
                  color={ORANGE}
                />
                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  style={styles.snapshotValue}
                >
                  {area.location}
                </Text>
                <Text style={styles.snapshotLabel}>Range Area</Text>
              </View>
              <View style={styles.snapshot}>
                <MaterialCommunityIcons
                  name="check-decagram-outline"
                  size={22}
                  color={ORANGE}
                />
                <Text style={styles.snapshotValue}>Ranging</Text>
                <Text style={styles.snapshotLabel}>Status</Text>
              </View>
            </View>
            <Text style={styles.sectionTitle}>Next Action</Text>
            <View style={styles.nextAction}>
              <View style={styles.nextIcon}>
                <MaterialCommunityIcons
                  name={nextAction.icon}
                  size={22}
                  color={ORANGE}
                />
              </View>
              <View style={styles.flex}>
                <Text style={styles.rowTitle}>{nextAction.title}</Text>
                <Text style={styles.rowMeta}>
                  {nextAction.detail} - {nextAction.timing}
                </Text>
              </View>
              <View style={styles.nextControls}>
                <View
                  style={[styles.upcoming, { borderColor: `${nextTone}66` }]}
                >
                  <View
                    style={[styles.upcomingDot, { backgroundColor: nextTone }]}
                  />
                  <Text style={[styles.upcomingText, { color: nextTone }]}>
                    {nextAction.status}
                  </Text>
                </View>
                <Pressable
                  onPress={
                    nextAction.type === "vaccine"
                      ? onRecordVaccination
                      : () => setModal("selection")
                  }
                  style={styles.nextButton}
                >
                  <Text style={styles.nextButtonText}>{nextAction.button}</Text>
                </Pressable>
              </View>
            </View>
            <Text style={styles.sectionTitle}>Source Composition</Text>
            <View style={styles.panel}>
              {composition.map((item, index) => (
                <View
                  key={`${item.marking}-${item.name}`}
                  style={[
                    styles.row,
                    index < composition.length - 1 && styles.divider,
                  ]}
                >
                  <View>
                    <Text style={styles.rowTitle}>
                      {item.marking} · {item.name}
                    </Text>
                    <Text style={styles.rowMeta}>Source history preserved</Text>
                  </View>
                  <Text style={styles.rowValue}>{item.birds}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.sectionTitle}>Area Summary</Text>
            <View style={styles.metrics}>
              <Metric value={entered} label="Birds Entered" />
              <Metric value={area.birds} label="Current Birds" />
              <Metric value={proceeded} label="Proceeded" accent="#6ee58c" />
              <Metric value={removed} label="Removed" accent="#ef7568" />
            </View>
            <Text style={styles.sectionTitle}>Health / Vaccination</Text>
            <View style={styles.health}>
              <View style={styles.healthIcon}>
                <MaterialCommunityIcons
                  name="needle"
                  size={22}
                  color={ORANGE}
                />
              </View>
              <View style={styles.flex}>
                <Text style={styles.rowMeta}>NEXT VACCINE</Text>
                <Text style={styles.rowTitle}>
                  {vaccine?.name || "Newcastle Booster"}
                </Text>
                <Text style={styles.muted}>
                  Due {vaccineDate ? formatDate(vaccineDate) : "Not scheduled"}
                </Text>
              </View>
              <View
                style={[
                  styles.healthStatus,
                  vaccinationDone && styles.healthDone,
                ]}
              >
                <Text
                  style={[
                    styles.healthStatusText,
                    vaccinationDone && styles.healthDoneText,
                  ]}
                >
                  {vaccinationDone ? "Recorded" : "Upcoming"}
                </Text>
              </View>
            </View>
            <View style={styles.actionPair}>
              <Pressable onPress={onRecordVaccination} style={styles.secondary}>
                <MaterialCommunityIcons
                  name="needle"
                  size={18}
                  color={ORANGE}
                />
                <Text style={styles.secondaryText}>Record Vaccination</Text>
              </Pressable>
              <Pressable
                onPress={() => setModal("loss")}
                style={styles.secondary}
              >
                <MaterialCommunityIcons
                  name="minus-circle-outline"
                  size={18}
                  color={ORANGE}
                />
                <Text style={styles.secondaryText}>Loss / Adjustment</Text>
              </Pressable>
            </View>
            <Text style={styles.sectionTitle}>Movement History</Text>
            <View style={styles.panel}>
              {history.length ? (
                history.slice(0, 5).map((item, index) => (
                  <View
                    key={`${item.date}-${index}`}
                    style={[
                      styles.history,
                      index < history.length - 1 && styles.divider,
                    ]}
                  >
                    <Text style={styles.historyDate}>{item.date}</Text>
                    <Text style={styles.historyText}>{item.text}</Text>
                  </View>
                ))
              ) : (
                <View style={styles.history}>
                  <Text style={styles.historyDate}>Entry</Text>
                  <Text style={styles.historyText}>
                    {entered} males entered {area.location}
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.sectionTitle}>Area Management</Text>
            <View style={styles.actions}>
              <Pressable
                onPress={() => setModal("selection")}
                style={styles.managementPrimary}
              >
                <MaterialCommunityIcons
                  name="account-search-outline"
                  size={19}
                  color={ORANGE}
                />
                <Text style={styles.secondaryText}>Record Selection</Text>
              </Pressable>
              <Pressable onPress={() => setModal("move")} style={styles.action}>
                <MaterialCommunityIcons
                  name="swap-horizontal"
                  size={19}
                  color={ORANGE}
                />
                <Text style={styles.secondaryText}>Move Birds</Text>
              </Pressable>
              <Pressable onPress={() => setModal("loss")} style={styles.action}>
                <MaterialCommunityIcons
                  name="minus-circle-outline"
                  size={19}
                  color={ORANGE}
                />
                <Text style={styles.secondaryText}>Loss / Adjustment</Text>
              </Pressable>
              <Pressable onPress={() => setModal("area")} style={styles.action}>
                <MaterialCommunityIcons
                  name="map-marker-edit-outline"
                  size={19}
                  color={ORANGE}
                />
                <Text style={styles.secondaryText}>Change / Close Area</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
      <SelectionModal
        key={`selection-${modal}`}
        visible={modal === "selection"}
        area={area}
        onClose={() => setModal(null)}
        onConfirm={complete(onRecordSelection)}
      />
      <SimpleModal
        key={modal}
        visible={["move", "loss", "area"].includes(modal)}
        title={
          modal === "move"
            ? "Move Birds"
            : modal === "loss"
              ? "Record Loss / Adjustment"
              : "Change Area"
        }
        type={modal}
        area={area}
        onClose={() => setModal(null)}
        onConfirm={complete(
          modal === "move"
            ? onMoveBirds
            : modal === "loss"
              ? onRecordLoss
              : onChangeArea,
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#020709" },
  page: { width: "100%", maxWidth: 720, alignSelf: "center" },
  hero: { height: 255, overflow: "hidden" },
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
  heroMeta: { marginTop: 4, color: "#d0d7d9", fontSize: 11 },
  content: { padding: 16, paddingBottom: 36 },
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
    gap: 10,
  },
  overline: { color: "#839095", fontSize: 8, fontWeight: "800" },
  identityValue: {
    marginTop: 5,
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
  },
  muted: { marginTop: 4, color: "#7e8b90", fontSize: 8 },
  status: {
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 14,
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
  infoStrip: {
    minHeight: 70,
    marginTop: 10,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "#26373e",
    backgroundColor: "#091317",
    flexDirection: "row",
    alignItems: "center",
  },
  infoItem: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    paddingHorizontal: 5,
  },
  infoDivider: { width: 1, height: 32, backgroundColor: "#26373e" },
  infoLabel: { color: "#718086", fontSize: 7, textAlign: "center" },
  infoValue: {
    marginTop: 5,
    color: "#e7ebec",
    fontSize: 9,
    fontWeight: "800",
    textAlign: "center",
  },
  sectionTitle: {
    marginTop: 22,
    marginBottom: 9,
    color: "#edf1f2",
    fontSize: 15,
    fontWeight: "800",
  },
  snapshotGrid: { flexDirection: "row", gap: 8 },
  snapshot: {
    flex: 1,
    minWidth: 0,
    height: 94,
    paddingHorizontal: 6,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "#26373e",
    backgroundColor: "#091317",
    alignItems: "center",
    justifyContent: "center",
  },
  snapshotValue: {
    width: "100%",
    marginTop: 8,
    color: "#fff",
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
  },
  snapshotLabel: {
    marginTop: 6,
    color: "#718086",
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
  nextControls: { alignItems: "flex-end", gap: 7 },
  upcoming: {
    minWidth: 90,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(110,229,140,.35)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  upcomingDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#6ee58c",
  },
  upcomingText: { color: "#6ee58c", fontSize: 7, fontWeight: "800" },
  nextButton: {
    minWidth: 112,
    height: 38,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: ORANGE,
    alignItems: "center",
    justifyContent: "center",
  },
  nextButtonText: { color: "#fff", fontSize: 9, fontWeight: "800" },
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
    paddingVertical: 15,
    paddingHorizontal: 4,
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: "#203038",
  },
  metricValue: { color: "#fff", fontSize: 17, fontWeight: "800" },
  metricLabel: {
    marginTop: 5,
    color: "#77858a",
    fontSize: 7,
    textAlign: "center",
  },
  primary: {
    height: 48,
    marginTop: 10,
    borderRadius: 6,
    backgroundColor: ORANGE,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  panel: {
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "#26373e",
    backgroundColor: "#091317",
    overflow: "hidden",
  },
  row: {
    minHeight: 60,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  divider: { borderBottomWidth: 1, borderBottomColor: "#203038" },
  rowTitle: { color: "#e8edef", fontSize: 10, fontWeight: "800" },
  rowMeta: { marginTop: 3, color: "#758389", fontSize: 7, fontWeight: "700" },
  rowValue: { color: ORANGE, fontSize: 14, fontWeight: "800" },
  health: {
    minHeight: 82,
    padding: 12,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "#26373e",
    backgroundColor: "#091317",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  healthIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,121,0,.09)",
    alignItems: "center",
    justifyContent: "center",
  },
  flex: { flex: 1 },
  healthStatus: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "rgba(255,186,86,.1)",
  },
  healthStatusText: { color: "#ffba56", fontSize: 7, fontWeight: "800" },
  healthDone: { backgroundColor: "rgba(110,229,140,.1)" },
  healthDoneText: { color: "#6ee58c" },
  actionPair: { marginTop: 8, flexDirection: "row", gap: 8 },
  secondary: {
    flex: 1,
    minHeight: 44,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#2a3b42",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  secondaryText: { color: "#d6dcde", fontSize: 9, fontWeight: "700" },
  history: {
    minHeight: 50,
    padding: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  historyDate: { width: 70, color: ORANGE, fontSize: 8, fontWeight: "800" },
  historyText: { flex: 1, color: "#cbd3d5", fontSize: 9 },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  managementPrimary: {
    width: "100%",
    minHeight: 48,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: ORANGE,
    backgroundColor: "#160f08",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  action: {
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
  backdrop: {
    flex: 1,
    padding: 16,
    backgroundColor: "rgba(0,0,0,.76)",
    alignItems: "center",
    justifyContent: "center",
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
  currentBand: {
    height: 58,
    marginTop: 14,
    paddingHorizontal: 13,
    borderRadius: 7,
    backgroundColor: "rgba(255,121,0,.08)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  currentBandLabel: { color: "#89969a", fontSize: 8, fontWeight: "800" },
  currentBandValue: { color: "#fff", fontSize: 20, fontWeight: "800" },
  fieldLabel: {
    marginTop: 12,
    marginBottom: 6,
    color: "#cbd3d5",
    fontSize: 9,
    fontWeight: "700",
  },
  input: {
    height: 42,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#2a3b42",
    backgroundColor: "#061014",
    paddingHorizontal: 11,
    color: "#fff",
    fontSize: 11,
    outlineStyle: "none",
  },
  remainRow: {
    height: 48,
    marginTop: 12,
    paddingHorizontal: 11,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#2a3b42",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  remainLabel: { color: "#cbd3d5", fontSize: 9, fontWeight: "700" },
  remainValue: { color: "#6ee58c", fontSize: 16, fontWeight: "800" },
  danger: { color: "#ef7568" },
  dateRow: {
    marginTop: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  dateText: { color: "#aab5b8", fontSize: 9 },
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
  confirm: {
    flex: 1,
    height: 44,
    borderRadius: 6,
    backgroundColor: ORANGE,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmText: { color: "#fff", fontSize: 10, fontWeight: "800" },
});

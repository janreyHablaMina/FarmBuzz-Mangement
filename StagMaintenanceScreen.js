import { useState } from "react";
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
    location: "Hardening Area 1",
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
      { date: "Sep 25", text: "5 moved to another Hardening Area" },
      { date: "Oct 2", text: "3 loss / adjustment" },
    ],
  },
  {
    location: "Hardening Area 2",
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
          <Text style={styles.headerTitle}>Hardening</Text>
          {onSettings && (
            <Pressable
              accessibilityLabel="Hardening settings"
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
            title="Hardening"
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

function ActionModal({ visible, type, area, onClose, onSave }) {
  const [quantity, setQuantity] = useState("");
  const [destination, setDestination] = useState("");
  const [note, setNote] = useState("");
  const count = Number.parseInt(quantity, 10) || 0;
  const remain = area.birds - count;
  const title =
    type === "move"
      ? "Move Stags"
      : type === "loss"
        ? "Record Loss / Adjustment"
        : "Proceed to Next Stage";
  const save = () => {
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
        "The destination must be different from the current Hardening area.",
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
                  <Text style={styles.remainLabel}>Remain in Maintenance</Text>
                  <Text style={styles.remainValue}>{Math.max(0, remain)}</Text>
                </View>
              )}
              {(type === "move" || type === "proceed") && (
                <>
                  <Text style={styles.fieldLabel}>
                    {type === "move"
                      ? "Destination Hardening Area"
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
            <View style={styles.modalActions}>
              <Pressable onPress={onClose} style={styles.cancel}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable onPress={save} style={styles.save}>
                <Text style={styles.saveText}>
                  {type === "move"
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

function CordingTransitionModal({
  visible,
  area,
  destinations,
  nextBirdNumber,
  existingPhysicalIds,
  onClose,
  onConfirm,
}) {
  const [step, setStep] = useState("setup");
  const [quantity, setQuantity] = useState("");
  const [destination, setDestination] = useState(destinations[0] || "");
  const [moveDate, setMoveDate] = useState(today());
  const [birds, setBirds] = useState([]);
  const [index, setIndex] = useState(0);
  const [applyTypeToAll, setApplyTypeToAll] = useState(true);
  const count = Number.parseInt(quantity, 10) || 0;
  const current = birds[index];
  const startIdentification = () => {
    if (count < 1 || count > area.birds)
      return Alert.alert(
        "Check quantity",
        `Enter a number from 1 to ${area.birds}.`,
      );
    if (!destination)
      return Alert.alert(
        "Cording area required",
        "Select an existing Cording area.",
      );
    setBirds(
      Array.from({ length: count }, (_, birdIndex) => ({
        farmBuzzId: `FB-${String(nextBirdNumber + birdIndex).padStart(6, "0")}`,
        identificationType: "Leg Band",
        physicalId: "",
        note: "",
      })),
    );
    setIndex(0);
    setStep("identify");
  };
  const updateCurrent = (changes) =>
    setBirds((items) =>
      items.map((bird, birdIndex) =>
        birdIndex === index ? { ...bird, ...changes } : bird,
      ),
    );
  const setType = (identificationType) => {
    if (applyTypeToAll)
      setBirds((items) =>
        items.map((bird) => ({ ...bird, identificationType })),
      );
    else updateCurrent({ identificationType });
  };
  const saveNext = () => {
    if (!current.identificationType || !current.physicalId.trim())
      return Alert.alert(
        "Identification required",
        "Select one identification type and enter the physical ID / band number.",
      );
    const duplicate = birds.some(
      (bird, birdIndex) =>
        birdIndex !== index &&
        bird.physicalId.trim().toLowerCase() ===
          current.physicalId.trim().toLowerCase(),
    );
    if (duplicate)
      return Alert.alert(
        "Duplicate physical ID",
        "Each stag needs a unique physical ID / band number.",
      );
    if (
      existingPhysicalIds.some(
        (physicalId) =>
          physicalId.toLowerCase() === current.physicalId.trim().toLowerCase(),
      )
    )
      return Alert.alert(
        "Physical ID already used",
        "Enter a physical ID / band number that is not assigned to another bird.",
      );
    if (index < birds.length - 1) setIndex((value) => value + 1);
    else setStep("review");
  };
  const identificationTypes = ["Leg Band", "Existing Wing Band", "Other ID"];
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <ScrollView
          style={styles.modalScroll}
          contentContainerStyle={styles.modalWrap}
        >
          <View style={styles.cordingModal}>
            <View style={styles.modalHead}>
              <View>
                <Text style={styles.overline}>HARDENING TO CORDING</Text>
                <Text style={styles.modalTitle}>
                  {step === "setup"
                    ? "Move to Cording"
                    : step === "identify"
                      ? "Individual Identification"
                      : "Ready to Move to Cording"}
                </Text>
              </View>
              <Pressable onPress={onClose} style={styles.close}>
                <Ionicons name="close" size={20} color="#fff" />
              </Pressable>
            </View>
            {step === "setup" && (
              <>
                <View style={styles.readOnlyGrid}>
                  <View style={styles.readOnlyItem}>
                    <Text style={styles.readOnlyLabel}>HARDENING AREA</Text>
                    <Text style={styles.readOnlyValue}>{area.location}</Text>
                  </View>
                  <View style={styles.readOnlyItem}>
                    <Text style={styles.readOnlyLabel}>CURRENT STAGS</Text>
                    <Text style={styles.readOnlyValue}>{area.birds}</Text>
                  </View>
                </View>
                <Text style={styles.fieldLabel}>
                  Quantity Ready for Cording
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
                <Text style={styles.fieldLabel}>
                  Cording Area / Destination
                </Text>
                <View style={styles.destinationList}>
                  {destinations.map((item) => (
                    <Pressable
                      key={item}
                      onPress={() => setDestination(item)}
                      style={[
                        styles.destinationOption,
                        destination === item && styles.destinationActive,
                      ]}
                    >
                      <MaterialCommunityIcons
                        name="home-account"
                        size={18}
                        color={destination === item ? ORANGE : "#78868b"}
                      />
                      <Text
                        style={[
                          styles.destinationText,
                          destination === item && styles.destinationTextActive,
                        ]}
                      >
                        {item}
                      </Text>
                      {destination === item && (
                        <Ionicons name="checkmark" size={18} color={ORANGE} />
                      )}
                    </Pressable>
                  ))}
                </View>
                <Text style={styles.fieldLabel}>Move Date</Text>
                <TextInput
                  value={moveDate}
                  onChangeText={setMoveDate}
                  style={styles.input}
                />
                <View style={styles.modalActions}>
                  <Pressable onPress={onClose} style={styles.cancel}>
                    <Text style={styles.cancelText}>Cancel</Text>
                  </Pressable>
                  <Pressable onPress={startIdentification} style={styles.save}>
                    <Text style={styles.saveText}>Continue</Text>
                  </Pressable>
                </View>
              </>
            )}
            {step === "identify" && current && (
              <>
                <View style={styles.identifyProgress}>
                  <View>
                    <Text style={styles.currentLabel}>
                      BIRD {index + 1} OF {birds.length}
                    </Text>
                    <Text style={styles.identifyId}>{current.farmBuzzId}</Text>
                  </View>
                  <Text style={styles.identifiedCount}>{index} saved</Text>
                </View>
                <View style={styles.readOnlyId}>
                  <MaterialCommunityIcons
                    name="identifier"
                    size={20}
                    color={ORANGE}
                  />
                  <View>
                    <Text style={styles.readOnlyLabel}>FARMBUZZ BIRD ID</Text>
                    <Text style={styles.readOnlyValue}>
                      {current.farmBuzzId}
                    </Text>
                  </View>
                  <MaterialCommunityIcons
                    name="lock-outline"
                    size={16}
                    color="#738187"
                  />
                </View>
                <View style={styles.applyRow}>
                  <View>
                    <Text style={styles.rowTitle}>
                      Apply Identification Type to All
                    </Text>
                    <Text style={styles.rowMeta}>
                      Use one type for this entire move
                    </Text>
                  </View>
                  <Pressable
                    accessibilityRole="switch"
                    accessibilityState={{ checked: applyTypeToAll }}
                    onPress={() => setApplyTypeToAll((value) => !value)}
                    style={[styles.switch, applyTypeToAll && styles.switchOn]}
                  >
                    <View
                      style={[
                        styles.switchThumb,
                        applyTypeToAll && styles.switchThumbOn,
                      ]}
                    />
                  </Pressable>
                </View>
                <Text style={styles.fieldLabel}>Identification Type</Text>
                <View style={styles.typeList}>
                  {identificationTypes.map((type) => (
                    <Pressable
                      key={type}
                      onPress={() => setType(type)}
                      style={[
                        styles.typeOption,
                        current.identificationType === type &&
                          styles.typeActive,
                      ]}
                    >
                      <View
                        style={[
                          styles.radio,
                          current.identificationType === type &&
                            styles.radioActive,
                        ]}
                      />
                      <Text
                        style={[
                          styles.typeText,
                          current.identificationType === type &&
                            styles.typeTextActive,
                        ]}
                      >
                        {type}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <Text style={styles.fieldLabel}>Physical ID / Band Number</Text>
                <TextInput
                  autoFocus
                  value={current.physicalId}
                  onChangeText={(physicalId) => updateCurrent({ physicalId })}
                  placeholder="Enter band or physical ID"
                  placeholderTextColor="#68777c"
                  returnKeyType="next"
                  onSubmitEditing={saveNext}
                  style={styles.input}
                />
                <Text style={styles.fieldLabel}>Optional Note</Text>
                <TextInput
                  value={current.note}
                  onChangeText={(note) => updateCurrent({ note })}
                  placeholder="Add a short note"
                  placeholderTextColor="#68777c"
                  style={styles.input}
                />
                <View style={styles.modalActions}>
                  <Pressable
                    onPress={() =>
                      index > 0
                        ? setIndex((value) => value - 1)
                        : setStep("setup")
                    }
                    style={styles.cancel}
                  >
                    <Text style={styles.cancelText}>
                      {index > 0 ? "Previous" : "Back"}
                    </Text>
                  </Pressable>
                  <Pressable onPress={saveNext} style={styles.save}>
                    <Text style={styles.saveText}>
                      {index === birds.length - 1 ? "Review" : "Save & Next"}
                    </Text>
                  </Pressable>
                </View>
              </>
            )}
            {step === "review" && (
              <>
                <View style={styles.reviewCard}>
                  <View style={styles.reviewRow}>
                    <Text style={styles.readOnlyLabel}>
                      FROM HARDENING AREA
                    </Text>
                    <Text style={styles.reviewValue}>{area.location}</Text>
                  </View>
                  <View style={styles.reviewRow}>
                    <Text style={styles.readOnlyLabel}>DESTINATION</Text>
                    <Text style={styles.reviewValue}>{destination}</Text>
                  </View>
                  <View style={styles.reviewRow}>
                    <Text style={styles.readOnlyLabel}>TOTAL STAGS</Text>
                    <Text style={styles.reviewValue}>{birds.length}</Text>
                  </View>
                  <View style={styles.reviewRow}>
                    <Text style={styles.readOnlyLabel}>IDENTIFIED</Text>
                    <Text style={styles.reviewReady}>
                      {birds.length} / {birds.length}
                    </Text>
                  </View>
                  <View style={styles.reviewRow}>
                    <Text style={styles.readOnlyLabel}>MOVE DATE</Text>
                    <Text style={styles.reviewValue}>{moveDate}</Text>
                  </View>
                </View>
                <View style={styles.reviewIds}>
                  {birds.map((bird) => (
                    <View key={bird.farmBuzzId} style={styles.reviewBird}>
                      <Text style={styles.reviewBirdId}>{bird.farmBuzzId}</Text>
                      <Text style={styles.reviewBirdPhysical}>
                        {bird.identificationType} · {bird.physicalId}
                      </Text>
                    </View>
                  ))}
                </View>
                <View style={styles.modalActions}>
                  <Pressable
                    onPress={() => {
                      setStep("identify");
                      setIndex(birds.length - 1);
                    }}
                    style={styles.cancel}
                  >
                    <Text style={styles.cancelText}>Back</Text>
                  </Pressable>
                  <Pressable
                    onPress={() =>
                      onConfirm({
                        quantity: birds.length,
                        destination,
                        moveDate,
                        birds,
                      })
                    }
                    style={styles.save}
                  >
                    <Text style={styles.saveText}>Confirm Move</Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

export function StagMaintenanceAreaDetail({
  area,
  onBack,
  onMove,
  onLoss,
  onHealth,
  cordingAreas,
  nextBirdNumber,
  existingPhysicalIds,
  onMoveToCording,
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
            title: "Ready for Cording",
            detail: "Identify ready stags before individual housing",
            status: "Ready",
            button: "Move to Cording",
            press: () => setModal("cording"),
            icon: "arrow-right-circle-outline",
          }
        : {
            title: "Hardening in Progress",
            detail:
              "Stags remain in this area until the next scheduled task or Cording move",
            status: "Active",
            button: null,
            press: null,
            icon: "shield-check-outline",
          };
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
                {action.button && (
                  <Pressable onPress={action.press} style={styles.nextButton}>
                    <Text style={styles.nextButtonText}>{action.button}</Text>
                  </Pressable>
                )}
              </View>
            </View>
            <Text style={styles.sectionTitle}>Main Actions</Text>
            <View style={styles.actions}>
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
                onPress={() => setModal("cording")}
                style={styles.proceed}
              >
                <MaterialCommunityIcons
                  name="arrow-right-circle-outline"
                  size={20}
                  color="#fff"
                />
                <Text style={styles.proceedText}>Move to Cording</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
      <ActionModal
        key={modal}
        visible={["move", "loss"].includes(modal)}
        type={modal}
        area={area}
        onClose={() => setModal(null)}
        onSave={complete(modal === "move" ? onMove : onLoss)}
      />
      <CordingTransitionModal
        key={`cording-${modal}`}
        visible={modal === "cording"}
        area={area}
        destinations={cordingAreas}
        nextBirdNumber={nextBirdNumber}
        existingPhysicalIds={existingPhysicalIds}
        onClose={() => setModal(null)}
        onConfirm={complete(onMoveToCording)}
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
  cordingModal: {
    width: "100%",
    maxWidth: 480,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#314249",
    backgroundColor: "#071115",
  },
  readOnlyGrid: { marginTop: 14, flexDirection: "row", gap: 8 },
  readOnlyItem: {
    flex: 1,
    minWidth: 0,
    minHeight: 62,
    padding: 10,
    borderRadius: 6,
    backgroundColor: "rgba(255,121,0,.07)",
    justifyContent: "center",
  },
  readOnlyLabel: { color: "#7f8c91", fontSize: 7, fontWeight: "800" },
  readOnlyValue: {
    marginTop: 5,
    color: "#eef2f3",
    fontSize: 11,
    fontWeight: "800",
  },
  destinationList: {
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#2a3b42",
    overflow: "hidden",
  },
  destinationOption: {
    minHeight: 44,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#203038",
  },
  destinationActive: { backgroundColor: "rgba(255,121,0,.07)" },
  destinationText: {
    flex: 1,
    color: "#9ca8ab",
    fontSize: 10,
    fontWeight: "700",
  },
  destinationTextActive: { color: "#eef2f3" },
  identifyProgress: {
    minHeight: 64,
    marginTop: 14,
    padding: 11,
    borderRadius: 7,
    backgroundColor: "rgba(255,121,0,.07)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  identifyId: { marginTop: 4, color: "#fff", fontSize: 17, fontWeight: "800" },
  identifiedCount: { color: ORANGE, fontSize: 9, fontWeight: "800" },
  readOnlyId: {
    minHeight: 58,
    marginTop: 10,
    paddingHorizontal: 11,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#2a3b42",
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  applyRow: {
    minHeight: 58,
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  switch: {
    width: 42,
    height: 24,
    borderRadius: 12,
    padding: 3,
    backgroundColor: "#2b3a40",
  },
  switchOn: { backgroundColor: "#9a4d08" },
  switchThumb: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#9aa5a8",
  },
  switchThumbOn: { marginLeft: 18, backgroundColor: ORANGE },
  typeList: { flexDirection: "row", gap: 6 },
  typeOption: {
    flex: 1,
    minHeight: 46,
    paddingHorizontal: 7,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#2a3b42",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  typeActive: { borderColor: ORANGE, backgroundColor: "rgba(255,121,0,.07)" },
  radio: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#718086",
  },
  radioActive: { borderWidth: 3, borderColor: ORANGE },
  typeText: {
    flexShrink: 1,
    color: "#879499",
    fontSize: 8,
    fontWeight: "700",
    textAlign: "center",
  },
  typeTextActive: { color: "#eef2f3" },
  reviewCard: {
    marginTop: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "#2a3b42",
    backgroundColor: "#091317",
    overflow: "hidden",
  },
  reviewRow: {
    minHeight: 50,
    paddingHorizontal: 11,
    borderBottomWidth: 1,
    borderBottomColor: "#203038",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  reviewValue: {
    flex: 1,
    color: "#e7ebec",
    fontSize: 10,
    fontWeight: "800",
    textAlign: "right",
  },
  reviewReady: { color: "#6ee58c", fontSize: 11, fontWeight: "800" },
  reviewIds: {
    maxHeight: 190,
    marginTop: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#2a3b42",
    overflow: "hidden",
  },
  reviewBird: {
    minHeight: 42,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#203038",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  reviewBirdId: { color: ORANGE, fontSize: 9, fontWeight: "800" },
  reviewBirdPhysical: {
    flex: 1,
    color: "#aab5b8",
    fontSize: 8,
    textAlign: "right",
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

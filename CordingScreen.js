import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const ORANGE = "#ff7a00";
const HERO = require("./assets/cording-card.png");

export default function CordingScreen({ areas, birds, onBack }) {
  const totalBirds = areas.reduce((sum, area) => sum + area.count, 0);
  const activeAreas = areas.filter((area) => area.count > 0).length;

  return (
    <View style={styles.screen}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.page}>
          <View style={styles.hero}>
            <Image
              source={HERO}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
            />
            <LinearGradient
              colors={["rgba(2,7,9,0.12)", "rgba(2,7,9,0.42)", "#040a0d"]}
              locations={[0, 0.52, 1]}
              style={StyleSheet.absoluteFill}
            />
            <SafeAreaView edges={["top"]} style={styles.safeArea}>
              <Pressable
                accessibilityLabel="Back"
                onPress={onBack}
                style={styles.backButton}
              >
                <Ionicons name="arrow-back" size={22} color="#fff" />
              </Pressable>
              <View style={styles.heroCopy}>
                <Text style={styles.eyebrow}>INDIVIDUAL BIRD MANAGEMENT</Text>
                <Text style={styles.title}>Cording</Text>
                <Text style={styles.subtitle}>
                  Individually identified stags by housing area.
                </Text>
              </View>
            </SafeAreaView>
          </View>

          <View style={styles.content}>
            <View style={styles.stats}>
              <Stat
                icon="home-outline"
                value={activeAreas}
                label="Active Areas"
              />
              <Stat icon="bird" value={totalBirds} label="Total Stags" />
              <Stat
                icon="tag-outline"
                value={birds.length}
                label="Identified"
                last
              />
            </View>

            <View style={styles.heading}>
              <View>
                <Text style={styles.sectionTitle}>Cording Areas</Text>
                <Text style={styles.sectionHint}>
                  Permanent IDs and physical bands
                </Text>
              </View>
              <Text style={styles.count}>{areas.length} areas</Text>
            </View>

            <View style={styles.areaList}>
              {areas.map((area) => {
                const areaBirds = birds.filter(
                  (bird) => bird.location === area.name,
                );
                return (
                  <View key={area.name} style={styles.areaCard}>
                    <View style={styles.areaTop}>
                      <View style={styles.areaIcon}>
                        <MaterialCommunityIcons
                          name="home-account"
                          size={22}
                          color={ORANGE}
                        />
                      </View>
                      <View style={styles.areaCopy}>
                        <Text style={styles.areaName}>{area.name}</Text>
                        <Text style={styles.areaMeta}>
                          {area.count} individually tracked stags
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.status,
                          area.count === 0 && styles.statusEmpty,
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,
                            area.count === 0 && styles.statusTextEmpty,
                          ]}
                        >
                          {area.count > 0 ? "Active" : "Empty"}
                        </Text>
                      </View>
                    </View>
                    {areaBirds.length > 0 && (
                      <View style={styles.identifiers}>
                        {areaBirds.slice(0, 3).map((bird) => (
                          <View
                            key={bird.farmBuzzId}
                            style={styles.identifierRow}
                          >
                            <Text style={styles.birdId}>{bird.farmBuzzId}</Text>
                            <Text numberOfLines={1} style={styles.physicalId}>
                              {bird.identificationType} · {bird.physicalId}
                            </Text>
                          </View>
                        ))}
                        {areaBirds.length > 3 && (
                          <Text style={styles.more}>
                            +{areaBirds.length - 3} more stags
                          </Text>
                        )}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function Stat({ icon, value, label, last }) {
  return (
    <View style={[styles.stat, last && styles.statLast]}>
      <MaterialCommunityIcons name={icon} size={20} color={ORANGE} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#020709" },
  scroll: { flexGrow: 1, alignItems: "center" },
  page: {
    width: "100%",
    maxWidth: 760,
    minHeight: "100%",
    backgroundColor: "#020709",
  },
  hero: { height: 300, overflow: "hidden" },
  safeArea: { flex: 1, paddingHorizontal: 20 },
  backButton: {
    width: 44,
    height: 44,
    marginTop: 10,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(3,10,13,0.78)",
    borderWidth: 1,
    borderColor: "#536166",
  },
  heroCopy: { marginTop: "auto", paddingBottom: 28 },
  eyebrow: { color: ORANGE, fontSize: 11, fontWeight: "900" },
  title: {
    color: "#fff",
    fontFamily: "Georgia",
    fontSize: 38,
    fontWeight: "900",
    marginTop: 6,
  },
  subtitle: { color: "#e4eaeb", fontSize: 14, marginTop: 4 },
  content: { padding: 18, paddingBottom: 50 },
  stats: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#24343a",
    backgroundColor: "#081317",
    borderRadius: 8,
    marginBottom: 28,
  },
  stat: {
    flex: 1,
    minHeight: 94,
    alignItems: "center",
    justifyContent: "center",
    borderRightWidth: 1,
    borderRightColor: "#24343a",
  },
  statLast: { borderRightWidth: 0 },
  statValue: { color: "#fff", fontSize: 21, fontWeight: "900", marginTop: 4 },
  statLabel: { color: "#829399", fontSize: 10, marginTop: 2 },
  heading: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    color: "#fff",
    fontFamily: "Georgia",
    fontSize: 22,
    fontWeight: "900",
  },
  sectionHint: { color: "#7f9096", fontSize: 11, marginTop: 3 },
  count: { color: ORANGE, fontSize: 11, fontWeight: "800" },
  areaList: { gap: 10 },
  areaCard: {
    borderWidth: 1,
    borderColor: "#26383e",
    backgroundColor: "#071216",
    borderRadius: 8,
    padding: 14,
  },
  areaTop: { flexDirection: "row", alignItems: "center" },
  areaIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,122,0,0.09)",
    borderWidth: 1,
    borderColor: "#9a4b00",
  },
  areaCopy: { flex: 1, marginLeft: 12, minWidth: 0 },
  areaName: { color: "#fff", fontSize: 15, fontWeight: "900" },
  areaMeta: { color: "#84959a", fontSize: 11, marginTop: 3 },
  status: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: "rgba(35,170,96,0.1)",
    borderWidth: 1,
    borderColor: "#195f3c",
  },
  statusEmpty: { backgroundColor: "#0b171b", borderColor: "#34464c" },
  statusText: { color: "#58d38a", fontSize: 9, fontWeight: "900" },
  statusTextEmpty: { color: "#84959a" },
  identifiers: {
    marginTop: 13,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#203137",
    gap: 8,
  },
  identifierRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  birdId: { color: ORANGE, fontSize: 11, fontWeight: "900" },
  physicalId: { flex: 1, color: "#b2bec1", fontSize: 11, textAlign: "right" },
  more: { color: "#7f9096", fontSize: 10, textAlign: "right", marginTop: 2 },
});

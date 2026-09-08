import { useMemo, useState } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const SALES_HERO_IMAGE = require('./assets/sales-hero.png');

const ROOSTER_IMAGE =
  'https://images.unsplash.com/photo-1730360037813-9777f13b88bb?auto=format&fit=crop&w=300&q=82';
const BLACK_ROOSTER_IMAGE =
  'https://images.unsplash.com/photo-1551127501-d4385c7484b4?auto=format&fit=crop&w=300&q=82';
const HEN_IMAGE =
  'https://images.unsplash.com/photo-1770221499235-11dd1041e181?auto=format&fit=crop&w=300&q=82';
const SALES_SUMMARY = [
  { icon: 'cash-check', value: '3', mobileValue: '3', label: 'Birds Sold', detail: 'With sale price', color: '#ff8500' },
  { icon: 'account-switch-outline', value: '2', mobileValue: '2', label: 'Transferred', detail: 'No sale recorded', color: '#75d94e' },
  { icon: 'clock-outline', value: '2', mobileValue: '2', label: 'Pending Owner', detail: 'Awaiting confirmation', color: '#ffb000' },
];

const FILTERS = [
  { id: 'all', label: 'All Records' },
  { id: 'sold', label: 'Sold' },
  { id: 'transferred', label: 'Transferred' },
];

const TRANSACTIONS = [
  {
    id: 'SL-1042', item: 'Razor 014', category: 'Kelso Cock', owner: 'Miguel Dela Cruz',
    date: 'Aug 28, 2024', type: 'Sold', price: '₱28,000', status: 'Confirmed', image: ROOSTER_IMAGE,
  },
  {
    id: 'SL-1041', item: 'Storm 057', category: 'Hatch Cock', owner: 'Ramon Garcia',
    date: 'Aug 26, 2024', type: 'Transferred', price: 'No sale', status: 'Confirmed', image: BLACK_ROOSTER_IMAGE,
  },
  {
    id: 'SL-1040', item: 'Queen 033', category: 'Kelso Hen', owner: 'Paolo Mendoza',
    date: 'Aug 24, 2024', type: 'Sold', price: '₱18,500', status: 'Pending', image: HEN_IMAGE,
  },
  {
    id: 'SL-1039', item: 'Blade 008', category: 'Roundhead Cock', owner: 'Noel Bautista',
    date: 'Aug 20, 2024', type: 'Transferred', price: 'No sale', status: 'Confirmed', image: BLACK_ROOSTER_IMAGE,
  },
  {
    id: 'SL-1038', item: 'Ruby 052', category: 'Roundhead Hen', owner: 'Erwin Ramos',
    date: 'Aug 18, 2024', type: 'Sold', price: '₱12,000', status: 'Pending', image: HEN_IMAGE,
  },
];

const REVENUE_BREAKDOWN = [
  { label: 'Sold Records', amount: '3 birds', percent: 60, color: '#ff8500' },
  { label: 'Ownership Transfers', amount: '2 birds', percent: 40, color: '#75d94e' },
  { label: 'Owner Confirmed', amount: '3 of 5', percent: 60, color: '#ffbd3d' },
];

const QUICK_ACTIONS = [
  { label: 'Sold History', detail: 'Transferred birds', icon: 'history' },
  { label: 'New Owners', detail: 'Ownership records', icon: 'account-group-outline' },
  { label: 'Reservations', detail: 'Pending pickups', icon: 'calendar-clock-outline' },
];

function getBirdKey(bird) {
  return bird?._recordKey || bird?.farmBuzzId || bird?.name;
}

function getBirdCategory(bird) {
  const bloodline = bird?.bloodline?.replace(' Bloodline', '') || 'Gamefowl';
  return `${bloodline} ${bird?.type || 'Bird'}`;
}

function parsePrice(price) {
  return Number(String(price || '').replace(/[^\d]/g, '')) || 0;
}

function formatCurrency(value) {
  return value ? `PHP ${value.toLocaleString()}` : 'No sale';
}

function makeTransactionId(entry, index) {
  if (entry.id?.startsWith('ownership-')) return `SL-${entry.id.replace(/\D/g, '').slice(-6)}`;
  return entry.id || `SL-${String(index + 1).padStart(4, '0')}`;
}

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

function SummaryCard({ item, narrow }) {
  return (
    <View style={[styles.summaryCard, narrow && styles.summaryCardNarrow]}>
      <View style={styles.summaryIcon}>
        <MaterialCommunityIcons name={item.icon} size={25} color={item.color} />
      </View>
      <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.summaryValue, narrow && styles.summaryValueNarrow]}>
        {narrow ? item.mobileValue : item.value}
      </Text>
      <Text style={styles.summaryLabel}>{item.label}</Text>
      <Text style={[styles.summaryDetail, item.detail.startsWith('+') && styles.positive]}>{item.detail}</Text>
    </View>
  );
}

function FilterButton({ item, active, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [styles.filterButton, active && styles.filterButtonActive, pressed && styles.pressed]}
    >
      <Text style={[styles.filterText, active && styles.filterTextActive]}>{item.label}</Text>
    </Pressable>
  );
}

function TransactionRow({ transaction, isLast, narrow }) {
  const confirmed = transaction.status === 'Confirmed';
  const statusColor = confirmed ? '#69dd64' : '#ff9a00';
  return (
    <Pressable
      accessibilityLabel={`Open sale ${transaction.id}`}
      onPress={() => Alert.alert(transaction.item, `${transaction.type} to ${transaction.owner}\n${transaction.price}\n${transaction.status}`)}
      style={({ pressed }) => [styles.transactionRow, narrow && styles.transactionRowNarrow, !isLast && styles.rowDivider, pressed && styles.rowPressed]}
    >
      <Image source={transaction.image} style={[styles.itemImage, narrow && styles.itemImageNarrow]} contentFit="cover" cachePolicy="memory-disk" />
      <View style={styles.transactionMain}>
        <View style={styles.itemTitleRow}>
          <Text numberOfLines={1} style={styles.itemName}>{transaction.item}</Text>
          <Text style={styles.saleId}>{transaction.id}</Text>
        </View>
        <Text numberOfLines={1} style={styles.buyerName}>
          <Text style={styles.transferType}>{transaction.type} to </Text>{transaction.owner}
        </Text>
        <View style={styles.saleMeta}>
          <MaterialCommunityIcons name="tag-outline" size={12} color="#7e8a8e" />
          <Text numberOfLines={1} style={styles.categoryText}>{transaction.category}</Text>
          <Text style={styles.metaDot}>•</Text>
          <Text numberOfLines={1} style={styles.dateText}>{transaction.date}</Text>
        </View>
      </View>
      <View style={[styles.transactionAside, narrow && styles.transactionAsideNarrow]}>
        <Text numberOfLines={1} adjustsFontSizeToFit style={styles.priceText}>{transaction.price}</Text>
        <View style={[styles.statusChip, { borderColor: `${statusColor}2b`, backgroundColor: `${statusColor}0d` }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>{transaction.status}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={19} color="#9da6a9" />
    </Pressable>
  );
}

function RevenueRow({ item }) {
  return (
    <View style={styles.revenueRow}>
      <View style={styles.revenueHeading}>
        <Text style={styles.revenueLabel}>{item.label}</Text>
        <Text style={styles.revenueAmount}>{item.amount}</Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${item.percent}%`, backgroundColor: item.color }]} />
      </View>
      <Text style={styles.revenuePercent}>{item.percent}%</Text>
    </View>
  );
}

function QuickAction({ item, compact }) {
  return (
    <Pressable
      onPress={() => Alert.alert(item.label, `${item.label} will open here.`)}
      style={({ pressed }) => [styles.quickAction, compact && styles.quickActionCompact, pressed && styles.cardPressed]}
    >
      <View style={styles.quickIcon}>
        <MaterialCommunityIcons name={item.icon} size={23} color="#ff8500" />
      </View>
      <View style={styles.quickCopy}>
        <Text style={styles.quickLabel}>{item.label}</Text>
        <Text style={styles.quickDetail}>{item.detail}</Text>
      </View>
      <Ionicons name="chevron-forward" size={19} color="#9da6a9" />
    </Pressable>
  );
}

function ReservationRow({ order, isLast, narrow }) {
  return (
    <Pressable
      accessibilityLabel={`Open reservation ${order.id}`}
      onPress={() => Alert.alert(order.bird.name, `Reserved for ${order.buyerName}\nPickup before ${order.readyWindow}\nPHP ${order.price}`)}
      style={({ pressed }) => [styles.reservationRow, !isLast && styles.rowDivider, pressed && styles.rowPressed]}
    >
      <Image source={order.bird.image} style={[styles.reservationImage, narrow && styles.reservationImageNarrow]} contentFit="cover" cachePolicy="memory-disk" />
      <View style={styles.transactionMain}>
        <View style={styles.itemTitleRow}>
          <Text numberOfLines={1} style={styles.itemName}>{order.bird.name}</Text>
          <Text style={styles.saleId}>RESERVED</Text>
        </View>
        <Text numberOfLines={1} style={styles.buyerName}>
          <Text style={styles.transferType}>Buyer </Text>{order.buyerName}
        </Text>
        <View style={styles.saleMeta}>
          <MaterialCommunityIcons name="calendar-clock-outline" size={12} color="#7e8a8e" />
          <Text numberOfLines={1} style={styles.dateText}>Pickup before {order.readyWindow}</Text>
        </View>
      </View>
      <View style={[styles.transactionAside, narrow && styles.transactionAsideNarrow]}>
        <Text numberOfLines={1} adjustsFontSizeToFit style={styles.priceText}>PHP {order.price}</Text>
        <View style={[styles.statusChip, { borderColor: '#ffb0002b', backgroundColor: '#ffb0000d' }]}>
          <Text style={[styles.statusText, { color: '#ffb000' }]}>Reserved</Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function SalesScreen({ onBack, onOpenPurchase, birds = [], ownershipByBird = {}, purchaseOrders = [] }) {
  const { width } = useWindowDimensions();
  const compact = width < 480;
  const narrow = width < 390;
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');

  const recordedTransactions = useMemo(() => {
    return birds
      .flatMap((bird) => {
        const record = ownershipByBird[getBirdKey(bird)];
        return (record?.history || [])
          .filter((entry) => ['Sold', 'Transferred', 'Gifted'].includes(entry.type))
          .map((entry, index) => {
            const priceValue = parsePrice(entry.price);
            return {
              id: makeTransactionId(entry, index),
              item: bird.name,
              category: getBirdCategory(bird),
              owner: entry.to || record.owner || 'Not recorded',
              date: entry.date || record.since || 'Date not recorded',
              type: entry.type,
              price: entry.type === 'Sold' ? formatCurrency(priceValue) : 'No sale',
              priceValue,
              status: 'Confirmed',
              image: bird.image || (bird.type === 'Hen' || bird.type === 'Pullet' ? HEN_IMAGE : ROOSTER_IMAGE),
            };
          });
      })
      .sort((a, b) => b.id.localeCompare(a.id));
  }, [birds, ownershipByBird]);

  const salesSummary = useMemo(() => {
    const sold = recordedTransactions.filter((transaction) => transaction.type === 'Sold');
    const transferred = recordedTransactions.filter((transaction) => transaction.type !== 'Sold');
    const reserved = purchaseOrders.filter((order) => order.releaseType === 'reservation');
    const salesValue = sold.reduce((total, transaction) => total + transaction.priceValue, 0);
    return [
      { icon: 'cash-check', value: String(sold.length), mobileValue: String(sold.length), label: 'Birds Sold', detail: formatCurrency(salesValue), color: '#ff8500' },
      { icon: 'account-switch-outline', value: String(transferred.length), mobileValue: String(transferred.length), label: 'Transferred', detail: transferred.length ? 'No sale recorded' : 'No transfers yet', color: '#75d94e' },
      { icon: 'calendar-clock-outline', value: String(reserved.length), mobileValue: String(reserved.length), label: 'Reserved', detail: reserved.length ? 'Pending pickups' : 'No reservations', color: '#ffb000' },
    ];
  }, [purchaseOrders, recordedTransactions]);

  const revenueBreakdown = useMemo(() => {
    const soldCount = recordedTransactions.filter((transaction) => transaction.type === 'Sold').length;
    const transferCount = recordedTransactions.length - soldCount;
    const reservationCount = purchaseOrders.filter((order) => order.releaseType === 'reservation').length;
    const total = Math.max(recordedTransactions.length + reservationCount, 1);
    const soldPercent = Math.round((soldCount / total) * 100);
    const transferPercent = Math.round((transferCount / total) * 100);
    const reservationPercent = Math.round((reservationCount / total) * 100);
    return [
      { label: 'Sold Records', amount: `${soldCount} birds`, percent: soldPercent, color: '#ff8500' },
      { label: 'Ownership Transfers', amount: `${transferCount} birds`, percent: transferPercent, color: '#75d94e' },
      { label: 'Reserved Pickups', amount: `${reservationCount} birds`, percent: reservationPercent, color: '#ffbd3d' },
    ];
  }, [purchaseOrders, recordedTransactions]);

  const reservations = useMemo(() => purchaseOrders.filter((order) => order.releaseType === 'reservation'), [purchaseOrders]);

  const visibleTransactions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return recordedTransactions.filter((transaction) => {
      const matchesFilter = filter === 'all'
        || (filter === 'sold' ? transaction.type === 'Sold' : transaction.type !== 'Sold');
      const matchesQuery = `${transaction.id} ${transaction.item} ${transaction.category} ${transaction.owner} ${transaction.type}`
        .toLowerCase()
        .includes(normalized);
      return matchesFilter && matchesQuery;
    });
  }, [filter, query, recordedTransactions]);

  return (
    <View style={styles.screen}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.pageWrap}>
        <View style={styles.page}>
          <View style={[styles.hero, compact && styles.heroCompact]}>
            <Image source={SALES_HERO_IMAGE} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="center" cachePolicy="memory-disk" />
            <LinearGradient
              colors={['rgba(2, 7, 9, 0.24)', 'rgba(2, 7, 9, 0.12)', '#040a0d']}
              locations={[0, 0.43, 1]}
              style={StyleSheet.absoluteFill}
            />
            <SafeAreaView edges={['top']} style={styles.heroSafeArea}>
              <View style={styles.heroHeader}>
                <View style={styles.heroHeaderLeft}>
                  <HeaderButton icon="arrow-back" label="Back to management" onPress={onBack} />
                  <Text style={styles.screenTitle}>Sales & Transfers</Text>
                </View>
                <HeaderButton icon="settings-outline" label="Ownership settings" onPress={() => Alert.alert('Ownership settings')} />
              </View>
              <View style={[styles.heroCopy, narrow && styles.heroCopyNarrow]}>
                <Text style={[styles.farmName, narrow && styles.farmNameNarrow]}>FarmBuzz Farm</Text>
                <Text style={styles.farmTagline}>Record sold birds, ownership transfers and their new owners.</Text>
                <View style={styles.farmMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="location-outline" size={16} color="#c0c7c9" />
                    <Text style={styles.metaText}>Pampanga, Philippines</Text>
                  </View>
                  <View style={styles.metaDivider} />
                  <View style={styles.metaItem}>
                    <Ionicons name="calendar-outline" size={16} color="#c0c7c9" />
                    <Text style={styles.metaText}>Est. 2020</Text>
                  </View>
                </View>
              </View>
            </SafeAreaView>
          </View>

          <View style={[styles.content, narrow && styles.contentNarrow]}>
            <View style={[styles.actionRow, compact && styles.actionRowCompact]}>
              <View style={styles.searchBox}>
                <Ionicons name="search" size={22} color="#9aa4a8" />
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Search birds or new owners..."
                  placeholderTextColor="#879195"
                  selectionColor="#ff8500"
                  style={styles.searchInput}
                />
                {!!query && (
                  <Pressable accessibilityLabel="Clear search" onPress={() => setQuery('')} hitSlop={8}>
                    <Ionicons name="close-circle" size={18} color="#6c777b" />
                  </Pressable>
                )}
              </View>
              <Pressable accessibilityLabel="Buy chicken" onPress={onOpenPurchase} style={({ pressed }) => [styles.addButton, compact && styles.addButtonCompact, pressed && styles.pressed]}>
                <Ionicons name="add" size={27} color="#fff" />
                {!compact && <Text style={styles.addButtonText}>Buy Chicken</Text>}
              </Pressable>
            </View>

            <View style={styles.summaryGrid}>
              {salesSummary.map((item) => <SummaryCard key={item.label} item={item} narrow={narrow} />)}
            </View>

            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Ownership Overview</Text>
                <Text style={styles.sectionDetail}>Recorded from bird ownership</Text>
              </View>
              <Pressable onPress={() => Alert.alert('Transfer report')}><Text style={styles.viewLink}>View report</Text></Pressable>
            </View>
            <View style={styles.revenuePanel}>
              {revenueBreakdown.map((item) => <RevenueRow key={item.label} item={item} />)}
            </View>

            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Reserved Pickups</Text>
                <Text style={styles.sectionDetail}>Chickens held before ready date</Text>
              </View>
              <Pressable onPress={onOpenPurchase}><Text style={styles.viewLink}>New reservation</Text></Pressable>
            </View>
            <View style={styles.transactionList}>
              {reservations.map((order, index) => (
                <ReservationRow key={order.id} order={order} narrow={narrow} isLast={index === reservations.length - 1} />
              ))}
              {!reservations.length && <Text style={styles.emptyText}>No reserved chickens yet</Text>}
            </View>

            <View style={styles.salesHeader}>
              <Text style={styles.sectionTitle}>Transfer History</Text>
              <View style={styles.filters}>
                {FILTERS.map((item) => <FilterButton key={item.id} item={item} active={filter === item.id} onPress={() => setFilter(item.id)} />)}
              </View>
            </View>
            <View style={styles.transactionList}>
              {visibleTransactions.map((transaction, index) => (
                <TransactionRow
                  key={transaction.id}
                  transaction={transaction}
                  narrow={narrow}
                  isLast={index === visibleTransactions.length - 1}
                />
              ))}
              {!visibleTransactions.length && <Text style={styles.emptyText}>No sold or transfer records found</Text>}
            </View>

            <View style={[styles.quickGrid, compact && styles.quickGridCompact]}>
              {QUICK_ACTIONS.map((item) => <QuickAction key={item.label} item={item} compact={compact} />)}
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
  hero: { height: 270, overflow: 'hidden', backgroundColor: '#101719' },
  heroCompact: { height: 260 },
  heroSafeArea: { flex: 1 },
  heroHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: Platform.OS === 'web' ? 10 : 3 },
  heroHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  headerButton: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(190, 204, 208, 0.35)', backgroundColor: 'rgba(2, 8, 11, 0.65)', alignItems: 'center', justifyContent: 'center' },
  screenTitle: { color: '#f0f2f3', fontSize: 17, fontWeight: '700', letterSpacing: 0 },
  heroCopy: { marginTop: 'auto', maxWidth: 450, paddingHorizontal: 18, paddingBottom: 23 },
  heroCopyNarrow: { maxWidth: 330, paddingHorizontal: 12, paddingBottom: 17 },
  farmName: { color: '#f5f6f6', fontSize: 34, lineHeight: 40, fontWeight: '800', letterSpacing: 0, fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', web: 'Georgia' }), textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 5 },
  farmNameNarrow: { fontSize: 29, lineHeight: 34 },
  farmTagline: { marginTop: 6, color: '#bac1c3', fontSize: 14, lineHeight: 20, letterSpacing: 0 },
  farmMeta: { marginTop: 13, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 10 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { color: '#b8c0c2', fontSize: 12, letterSpacing: 0 },
  metaDivider: { width: 1, height: 14, backgroundColor: '#6d777a' },
  content: { paddingHorizontal: 10, paddingBottom: 22 },
  contentNarrow: { paddingHorizontal: 8 },
  actionRow: { flexDirection: 'row', gap: 10 },
  actionRowCompact: { flexDirection: 'row', gap: 8 },
  searchBox: { flex: 1, height: 52, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, borderColor: '#28343a', backgroundColor: '#0b1418' },
  searchInput: { flex: 1, height: 50, paddingVertical: 0, color: '#e7ebec', fontSize: 14, letterSpacing: 0, outlineStyle: 'none' },
  addButton: { height: 52, minWidth: 140, paddingHorizontal: 20, borderRadius: 8, backgroundColor: '#f66f00', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  addButtonCompact: { width: 52, minWidth: 52, paddingHorizontal: 0 },
  addButtonText: { color: '#fff', fontSize: 14, fontWeight: '700', letterSpacing: 0 },
  summaryGrid: { marginTop: 14, flexDirection: 'row', gap: 10 },
  summaryCard: {
    flex: 1, minWidth: 0, height: 124, paddingHorizontal: 14, paddingVertical: 12,
    borderRadius: 8, borderWidth: 1, borderColor: '#1c2a30', backgroundColor: '#0b1418',
    alignItems: 'center', justifyContent: 'center',
  },
  summaryCardNarrow: { height: 116, paddingHorizontal: 8, paddingVertical: 10 },
  summaryIcon: { width: 37, height: 37, borderRadius: 19, backgroundColor: 'rgba(255, 133, 0, 0.1)', alignItems: 'center', justifyContent: 'center' },
  summaryValue: { marginTop: 5, width: '94%', color: '#edf1f2', fontSize: 22, fontWeight: '700', textAlign: 'center', letterSpacing: 0 },
  summaryValueNarrow: { fontSize: 19 },
  summaryLabel: { marginTop: 3, color: '#c3cacc', fontSize: 10, letterSpacing: 0 },
  summaryDetail: { marginTop: 3, color: '#7f8b8f', fontSize: 9, letterSpacing: 0 },
  positive: { color: '#68d85c' },
  sectionHeader: { marginTop: 21, marginBottom: 7, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  sectionTitle: { color: '#e5e9ea', fontSize: 16, fontWeight: '600', letterSpacing: 0 },
  sectionDetail: { marginTop: 3, color: '#7f8b8f', fontSize: 9, letterSpacing: 0 },
  viewLink: { color: '#ff8a00', fontSize: 11, letterSpacing: 0 },
  revenuePanel: { padding: 14, borderRadius: 8, borderWidth: 1, borderColor: '#1c2a30', backgroundColor: '#0b1418', gap: 13 },
  revenueRow: { position: 'relative', paddingRight: 37 },
  revenueHeading: { marginBottom: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  revenueLabel: { color: '#adb6b9', fontSize: 10, letterSpacing: 0 },
  revenueAmount: { color: '#e1e5e6', fontSize: 10, fontWeight: '600', letterSpacing: 0 },
  progressTrack: { height: 6, borderRadius: 3, backgroundColor: '#182329', overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 3 },
  revenuePercent: { position: 'absolute', right: 0, bottom: -3, color: '#8c979a', fontSize: 9, letterSpacing: 0 },
  salesHeader: { marginTop: 21, marginBottom: 7, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  filters: { flexDirection: 'row', gap: 5 },
  filterButton: { minHeight: 31, paddingHorizontal: 10, borderRadius: 7, borderWidth: 1, borderColor: '#202b30', backgroundColor: '#0b1418', alignItems: 'center', justifyContent: 'center' },
  filterButtonActive: { borderColor: '#ff8500', backgroundColor: 'rgba(255, 133, 0, 0.1)' },
  filterText: { color: '#899397', fontSize: 9, letterSpacing: 0 },
  filterTextActive: { color: '#ff9a00' },
  transactionList: { borderRadius: 8, borderWidth: 1, borderColor: '#1c2a30', backgroundColor: '#0b1418', overflow: 'hidden' },
  transactionRow: { minHeight: 82, paddingHorizontal: 12, paddingVertical: 9, flexDirection: 'row', alignItems: 'center', gap: 11 },
  reservationRow: { minHeight: 82, paddingHorizontal: 12, paddingVertical: 9, flexDirection: 'row', alignItems: 'center', gap: 11 },
  transactionRowNarrow: { minHeight: 88, paddingHorizontal: 8, gap: 7 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: '#1b292f' },
  itemImage: { width: 52, height: 52, borderRadius: 7, borderWidth: 1, borderColor: '#2d3a3f' },
  reservationImage: { width: 52, height: 52, borderRadius: 7, borderWidth: 1, borderColor: '#70450d' },
  reservationImageNarrow: { width: 46, height: 46 },
  itemImageNarrow: { width: 46, height: 46 },
  transactionMain: { flex: 1, minWidth: 0 },
  itemTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  itemName: { flexShrink: 1, color: '#e8eced', fontSize: 13, fontWeight: '700', letterSpacing: 0 },
  saleId: { color: '#687579', fontSize: 8, letterSpacing: 0 },
  buyerName: { marginTop: 3, color: '#d3d8da', fontSize: 10, letterSpacing: 0 },
  transferType: { color: '#ff9200', fontWeight: '600' },
  saleMeta: { marginTop: 6, flexDirection: 'row', alignItems: 'center', gap: 5 },
  categoryText: { maxWidth: '44%', color: '#7e8a8e', fontSize: 8, letterSpacing: 0 },
  dateText: { flex: 1, color: '#7e8a8e', fontSize: 8, letterSpacing: 0 },
  metaDot: { color: '#5f6b6f', fontSize: 8 },
  transactionAside: { width: 92, alignItems: 'flex-end', gap: 7 },
  transactionAsideNarrow: { width: 73 },
  priceText: { width: '100%', color: '#f0f2f3', fontSize: 11, fontWeight: '700', textAlign: 'right', letterSpacing: 0 },
  statusChip: { minHeight: 25, paddingHorizontal: 9, borderRadius: 13, borderWidth: 1, justifyContent: 'center' },
  statusText: { fontSize: 9, fontWeight: '600', letterSpacing: 0 },
  quickGrid: { marginTop: 13, flexDirection: 'row', gap: 9 },
  quickGridCompact: { flexDirection: 'column' },
  quickAction: { flex: 1, minWidth: 0, minHeight: 78, paddingHorizontal: 11, borderRadius: 8, borderWidth: 1, borderColor: '#1c2a30', backgroundColor: '#0b1418', flexDirection: 'row', alignItems: 'center', gap: 9 },
  quickActionCompact: { minHeight: 64 },
  quickIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255, 133, 0, 0.1)', alignItems: 'center', justifyContent: 'center' },
  quickCopy: { flex: 1, minWidth: 0 },
  quickLabel: { color: '#e2e6e7', fontSize: 11, fontWeight: '600', letterSpacing: 0 },
  quickDetail: { marginTop: 3, color: '#7f8b8f', fontSize: 9, letterSpacing: 0 },
  emptyText: { paddingVertical: 30, color: '#7f8a8e', fontSize: 12, textAlign: 'center', letterSpacing: 0 },
  pressed: { opacity: 0.72 },
  rowPressed: { backgroundColor: '#101c21' },
  cardPressed: { opacity: 0.76, transform: [{ scale: 0.995 }] },
});
